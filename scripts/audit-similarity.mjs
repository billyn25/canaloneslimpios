import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {pathToFileURL} from 'node:url';

// Deliberately independent of the content generator. Run before and after on
// the same routes. This is an editorial diagnostic, not a Google SEO score.
const VERSION = 'main-text-dice5-v1';
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
const EXCLUDED_TAGS = new Set(['script', 'style', 'nav', 'header', 'footer', 'form', 'figure', 'button', 'svg']);
const EXCLUDED_CLASSES = new Set(['crumbs', 'actions', 'towns', 'town-finder', 'town-results', 'contact-panel', 'mobilebar', 'service-jumps', 'service-link', 'postal-coverage', 'postal-source', 'postal-code-list', 'postal-more']);

function decode(text) {
  return text.replace(/&#(x[\da-f]+|\d+);/gi, (_, n) => String.fromCodePoint(n[0].toLowerCase() === 'x' ? parseInt(n.slice(1), 16) : Number(n)))
    .replace(/&(amp|lt|gt|quot|apos|nbsp|hellip|ndash|mdash);/g, (_, key) => ({amp:'&', lt:'<', gt:'>', quot:'"', apos:"'", nbsp:' ', hellip:'…', ndash:'–', mdash:'—'}[key]));
}
const normalize = text => decode(text).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const slug = text => normalize(text).replace(/ /g, '-');
const sha = text => crypto.createHash('sha256').update(text).digest('hex');

// A small tree parser is sufficient for our generated HTML and avoids pulling
// a browser or an npm dependency into a read-only audit.
function tree(html) {
  const root = {tag:'root', attrs:{}, children:[]}, stack = [root];
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1];
  if (main === undefined) throw new Error('Missing main element');
  const clean = main.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '');
  for (const token of clean.match(/<!--[\s\S]*?-->|<[^>]*>|[^<]+/g) || []) {
    if (token.startsWith('<!--') || token.startsWith('<!')) continue;
    const close = token.match(/^<\/([\w:-]+)/);
    if (close) {
      const tag = close[1].toLowerCase();
      for (let i=stack.length-1; i>0; i--) if (stack[i].tag === tag) { stack.length = i; break; }
      continue;
    }
    const open = token.match(/^<([\w:-]+)/);
    if (open) {
      const tag = open[1].toLowerCase(), attrs = {};
      for (const a of token.slice(open[0].length).matchAll(/([\w:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) attrs[a[1].toLowerCase()] = decode(a[2] ?? a[3] ?? a[4] ?? '');
      const node = {tag, attrs, children:[]};
      stack.at(-1).children.push(node);
      if (!VOID.has(tag) && !token.endsWith('/>')) stack.push(node);
    } else stack.at(-1).children.push({text:token});
  }
  return root;
}

const classes = node => (node.attrs?.class || '').split(/\s+/);
function containsDirectory(node) {
  return classes(node).includes('towns') || (node.children || []).some(containsDirectory);
}
function excluded(node) {
  if (!node.tag) return false;
  const a=node.attrs;
  return EXCLUDED_TAGS.has(node.tag) || classes(node).some(c => EXCLUDED_CLASSES.has(c)) || a.id === 'contacto' || a.id === 'codigos-postales' || a['aria-hidden'] === 'true' || Object.hasOwn(a, 'hidden') ||
    (node.tag === 'a' && /^(?:tel:|https?:\/\/(?:wa\.me|api\.whatsapp\.com)|#contacto)/.test(a.href || '')) ||
    (node.tag === 'section' && containsDirectory(node));
}

export function extractText(html, place, province) {
  const document = tree(html), blocks=[];
  function visit(node, collectBlocks=true) {
    if (excluded(node)) return '';
    if (node.text !== undefined) return node.text;
    const value = (node.children || []).map(n => visit(n, collectBlocks && !['article', 'details'].includes(node.tag))).join(' ');
    if (collectBlocks && ['article', 'details'].includes(node.tag)) blocks.push(value);
    return value;
  }
  const raw = visit(document);
  // Mask proper names before lowercasing: Segura is a municipality, whereas
  // "zona segura" is ordinary service copy and must stay the same everywhere.
  const names = [...new Set([place, province, ...place.split('/')])].filter(Boolean).sort((a,b) => b.length-a.length);
  const clean = value => {
    let text = decode(value);
    for (const n of names) text=text.replace(new RegExp('(?<![\\p{L}\\p{N}])'+n.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?![\\p{L}\\p{N}])','gu'),'lugar');
    return normalize(text);
  };
  return {main:clean(raw), blocks:blocks.map(clean).filter(Boolean)};
}

function shingles(text, vocabulary) {
  const words=text.split(' '), result=new Set();
  for(let i=0;i<=words.length-5;i++) {
    const value=words.slice(i,i+5).join(' ');
    if(!vocabulary.has(value)) vocabulary.set(value,vocabulary.size);
    result.add(vocabulary.get(value));
  }
  return result;
}
function dice(a,b) {
  if(a.size>b.size) [a,b]=[b,a];
  let intersection=0;
  for(const word of a) if(b.has(word)) intersection++;
  return a.size+b.size ? 200*intersection/(a.size+b.size) : 100;
}
const percentile = (a,q) => a[Math.floor((a.length-1)*q)] ?? null;
const round = n => n === null ? null : Math.round(n*100)/100;
function stats(values) {
  const sorted=[...values].sort((a,b)=>a-b);
  return {count:values.length, mean:round(values.reduce((a,b)=>a+b,0)/values.length), p50:round(percentile(sorted,.5)), p90:round(percentile(sorted,.9)), min:round(sorted[0]), max:round(sorted.at(-1))};
}

export function audit({root='dist', sample=48, baseline, out, samplesOut}={}) {
  const site=JSON.parse(fs.readFileSync('config/site.json','utf8'));
  const inventory=JSON.parse(fs.readFileSync('.cache/municipios.json','utf8'));
  const previous=baseline ? JSON.parse(fs.readFileSync(baseline,'utf8')) : null;
  if(previous && previous.method.version !== VERSION) throw new Error('Baseline uses a different method');
  const rows=[], signatures=new Map(), blockFrequency=new Map(), vocabulary=new Map();
  for(const p of site.provinces) for(const t of inventory.groups[p.slug]) {
    const route=`/${p.slug}/${slug(t.name)}/`, file=path.join(root,route,'index.html');
    if(!fs.existsSync(file)) throw new Error('Missing municipal page: '+file);
    const content=extractText(fs.readFileSync(file,'utf8'),t.name,p.name);
    const signature=sha(content.main), row={route,name:t.name,province:p.slug,words:content.main.split(' ').length,signature,...content};
    rows.push(row);
    if(!signatures.has(signature)) signatures.set(signature,[]);
    signatures.get(signature).push(route);
    for(const block of new Set(content.blocks)) { const record=blockFrequency.get(block)||{text:block,pages:0}; record.pages++; blockFrequency.set(block,record); }
  }
  const selection=previous?.sampleRoutes || site.provinces.flatMap(p => {
    const locals=rows.filter(t=>t.province===p.slug).sort((a,b)=>a.route.localeCompare(b.route));
    if(locals.length<=sample) return locals.map(t=>t.route);
    return Array.from({length:sample},(_,i)=>locals[Math.floor(i*(locals.length-1)/(sample-1))].route);
  });
  const selected=selection.map(route=>{const row=rows.find(t=>t.route===route);if(!row)throw new Error('Missing baseline route: '+route);return {...row,shingles:shingles(row.main,vocabulary)};});
  const pairValues=[], nearest=[], provinces=[];
  for(const p of site.provinces) {
    const locals=selected.filter(t=>t.province===p.slug), pairs=[], matches=new Map(locals.map(t=>[t.route,{route:t.route,nearestRoute:null,similarity:-1}]));
    for(let i=0;i<locals.length;i++) for(let j=i+1;j<locals.length;j++) {
      const a=locals[i], b=locals[j], score=dice(a.shingles,b.shingles); pairs.push(score); pairValues.push(score);
      for(const [current,other] of [[a,b],[b,a]]) if(score>matches.get(current.route).similarity) matches.set(current.route,{route:current.route,nearestRoute:other.route,similarity:score});
    }
    const best=[...matches.values()].filter(x=>x.nearestRoute); nearest.push(...best);
    provinces.push({province:p.slug,inventory:rows.filter(t=>t.province===p.slug).length,sample:locals.length,pairs:stats(pairs),nearestWithinSample:stats(best.map(x=>x.similarity))});
  }
  const duplicateGroups=[...signatures.values()].filter(r=>r.length>1).sort((a,b)=>b.length-a.length);
  const report={
    generatedAt:new Date().toISOString(),
    method:{version:VERSION,metric:'Dice similarity of distinct consecutive five-word sequences (0–100%)',scope:'Municipal pages only; Madrid districts excluded',sample:'Up to '+sample+' evenly spaced routes per province; all pairs within each province, never cross-province; baseline sample routes reused for after',normalization:'Lowercase, accents/punctuation normalized; own municipality/province names replaced with the same token',exclusions:'Header/footer, navigation/breadcrumbs, locality directories, forms/contact CTAs, figures/image attributes, postal code section, hidden and aria-hidden elements. Service, problem, FAQ, work-scope, emergency and budget text retained.',interpretation:'Internal editorial similarity diagnostic, not a Google ranking/indexation metric. Nearest matches are within the fixed sample, not a guaranteed global nearest neighbor.'},
    inventory:rows.length,sampledPages:selected.length,sampleRoutes:selection,
    mainWordCounts:stats(rows.map(t=>t.words)),
    pairs:stats(pairValues),nearestWithinSample:stats(nearest.map(x=>x.similarity)),
    exactNormalizedDuplicates:{uniqueBodies:signatures.size,duplicateGroups:duplicateGroups.length,pagesInDuplicateGroups:duplicateGroups.reduce((n,g)=>n+g.length,0),largestGroups:duplicateGroups.slice(0,10).map(g=>({pages:g.length,examples:g.slice(0,4)}))},
    repeatedArticleOrFaqBlocks:[...blockFrequency.values()].filter(x=>x.pages>1).sort((a,b)=>b.pages-a.pages).slice(0,30).map(x=>({pages:x.pages,text:x.text.slice(0,260)})),
    provinces,nearestMatches:nearest.map(x=>({...x,similarity:round(x.similarity)}))
  };
  if(previous) report.beforeAfter={baseline:baseline,baselinePairMean:previous.pairs.mean,afterPairMean:report.pairs.mean,pairMeanChangePoints:round(report.pairs.mean-previous.pairs.mean),baselineNearestMean:previous.nearestWithinSample.mean,afterNearestMean:report.nearestWithinSample.mean,nearestMeanChangePoints:round(report.nearestWithinSample.mean-previous.nearestWithinSample.mean),baselineUniqueBodies:previous.exactNormalizedDuplicates.uniqueBodies,afterUniqueBodies:report.exactNormalizedDuplicates.uniqueBodies};
  if(out) {fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');}
  if(samplesOut) {fs.mkdirSync(samplesOut,{recursive:true});fs.writeFileSync(path.join(samplesOut,'pages.json'),JSON.stringify(selected.map(({route,name,province,main,words,signature})=>({route,name,province,main,words,signature})),null,2)+'\n');}
  console.log(JSON.stringify({inventory:report.inventory,sampledPages:report.sampledPages,pairs:report.pairs,nearestWithinSample:report.nearestWithinSample,exactNormalizedDuplicates:report.exactNormalizedDuplicates,...(report.beforeAfter?{beforeAfter:report.beforeAfter}:{})},null,2));
  return report;
}

if(process.argv[1] && import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href) {
  const args=process.argv.slice(2), get=key=>args.includes(key)?args[args.indexOf(key)+1]:undefined;
  audit({root:get('--root')||'dist',sample:Number(get('--sample')||48),baseline:get('--baseline'),out:get('--out'),samplesOut:get('--save-samples')});
}
