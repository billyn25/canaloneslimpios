import fs from 'node:fs';
import path from 'node:path';
import {getTowns,escape as esc} from './refine.mjs';
import {selectCoverage,policy,distanceKm,COVERAGE_CSS,COVERAGE_RELEASE} from './municipal-coverage.mjs';
const root='dist',read=f=>JSON.parse(fs.readFileSync(f,'utf8'));
const site=read('config/site.json'),inventory=read('.cache/municipios.json'),manifest=read(root+'/manifest.json');
if(fs.existsSync(root+'/coverage-manifest.json'))throw new Error('La consolidación requiere un build completo sin consolidar.');
const geography=read('content/municipal-geography.json'),geo=new Map(geography.municipalities.map(t=>[t.code,t]));
const towns=getTowns(site,inventory).map(t=>{
 const g=geo.get(t.id);if(!g)throw new Error('Sin geografía: '+t.name);
 return {...t,...g,name:t.name};
});
const domain=manifest.mode==='production'?(process.env.SITE_DOMAIN||site.productionDomain):site.previewDomain;
const {retained,assignments}=selectCoverage(towns),byPath=new Map(assignments.map(a=>[a.town.path,a]));
const retired=assignments.filter(a=>a.town.code!==a.hub.code),selected=new Set(retained.map(t=>t.path));
const fileFor=route=>route==='/'?root+'/index.html':root+route+'index.html';
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
const decode=s=>String(s).replaceAll('&amp;','&').replaceAll('&quot;','"').replaceAll('&#39;',"'").replaceAll('&lt;','<').replaceAll('&gt;','>');
const normalizePath=p=>p.endsWith('/index.html')?p.slice(0,-10):p.endsWith('/')?p:p+'/';
function destination(raw,current='/',withAnchor=true){
 let u;try{u=new URL(decode(raw),domain+current);}catch{return raw;}
 if(u.origin!==new URL(domain).origin)return raw;
 const row=byPath.get(normalizePath(u.pathname));
 if(!row||row.town.code===row.hub.code)return raw;
 return row.hub.path+(withAnchor?`#cobertura-${row.town.code}`:'');
}
const search=read(root+'/assets/towns.json'),searchByPath=new Map(search.map(t=>[t.path,t]));
function block(town){
 const members=assignments.filter(a=>a.hub.code===town.code&&a.town.code!==town.code).map(a=>a.town).sort((a,b)=>a.name.localeCompare(b.name,'es'));
 if(!members.length)return '';
 return `<section class="section soft municipal-coverage" id="cobertura-cercana"><div class="wrap"><span class="eyebrow">También en los alrededores</span><h2>Limpieza de canalones y tejados en ${esc(town.name)} y localidades cercanas</h2><p class="lead2">Esta página reúne el servicio de limpieza de canalones y de tejados en ${esc(town.name)} y estos municipios próximos. También puedes consultar desatascos de bajantes, reboses, goteras y pequeñas reparaciones de cubierta.</p><ul class="municipal-coverage-list">${members.map(t=>{const codes=searchByPath.get(t.path)?.postalCodes||[];return `<li id="cobertura-${t.code}" data-coverage-name="${esc(t.name)}"><span>${esc(t.name)}</span>${codes.length?`<small class="coverage-postal">CP: ${codes.join(' · ')}</small>`:''}</li>`;}).join('')}</ul><p>Indica el municipio de la vivienda o comunidad, la altura aproximada y si observas hojas, barro, musgo, rebose o filtración. El acceso, los medios necesarios, el desplazamiento y el presupuesto se confirman al valorar cada caso.</p><a class="coverage-consult" href="#contacto">Consultar limpieza de canalones o tejados →</a></div></section>`;
}
for(const file of walk(root).filter(f=>f.endsWith('.html'))){
 const rel=path.relative(root,file).split(path.sep).join('/'),route=rel==='index.html'?'/':rel==='404.html'?'/404.html':'/'+rel.replace(/index\.html$/,'');
 if(byPath.has(route)&&!selected.has(route))continue;
 let html=fs.readFileSync(file,'utf8');
 html=html.replace(/\bhref="([^"]*)"/g,(_,raw)=>`href="${esc(destination(raw,route))}"`);
 const rewriteData=value=>typeof value==='string'?(/^(?:https?:\/\/|\/)/.test(value)?destination(value,route,false):value):Array.isArray(value)?value.map(rewriteData):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).map(([k,v])=>[k,rewriteData(v)])):value;
 html=html.replace(/(<script[^>]*type="application\/ld\+json"[^>]*>)([\s\S]*?)(<\/script>)/g,(_,open,raw,close)=>open+JSON.stringify(rewriteData(JSON.parse(raw))).replace(/</g,'\\u003c')+close);
 const town=retained.find(t=>t.path===route);
 if(town){
  const section=block(town);
  html=html.replace(/(<section\b[^>]*\bid="contacto"[^>]*>)/,section+'$1');
  if(section&&!html.includes('id="cobertura-cercana"'))throw new Error('Falta punto de inserción en '+town.name);
  const near=retained.filter(t=>t.province===town.province&&t.code!==town.code).sort((a,b)=>distanceKm(town,a)-distanceKm(town,b)||a.code.localeCompare(b.code)).slice(0,6);
  html=html.replace('</main>',`<section class="section wrap" id="paginas-cercanas"><h2>Otras páginas de servicio cercanas a ${esc(town.name)}</h2><nav class="coverage-nearby" aria-label="Municipios próximos con página propia">${near.map(t=>`<a href="${t.path}">Canalones y tejados en ${esc(t.name)}</a>`).join('')}</nav></section></main>`);
 }
 if(route==='/')html=html.replace('Páginas locales enlazadas por provincia','Municipios cubiertos desde páginas principales y cercanas');
 fs.writeFileSync(file,html);
}
const updatedSearch=search.map(t=>({...t,originalPath:t.path,path:destination(t.path)}));
fs.writeFileSync(root+'/assets/towns.json',JSON.stringify(updatedSearch));
for(const row of retired)fs.rmSync(path.join(root,row.town.path.slice(1)),{recursive:true});
const redirects=retired.flatMap(({town,hub})=>[town.path,town.path.slice(0,-1),town.path+'index.html'].map(from=>({from,to:hub.path})));
fs.writeFileSync(root+'/_redirects','# Consolidated municipalities: direct permanent redirects to their coverage page.\n'+redirects.map(r=>`${r.from} ${manifest.mode==='production'?domain:''}${r.to} 301!`).join('\n')+'\n');
const coverage={release:COVERAGE_RELEASE,policy,source:geography.source,edition:geography.edition,domain,total:towns.length,retained:retained.length,redirected:retired.length,provinces:site.provinces.map(p=>({province:p.name,slug:p.slug,total:towns.filter(t=>t.provinceSlug===p.slug).length,retained:retained.filter(t=>t.provinceSlug===p.slug).length})),routes:walk(root).filter(f=>f.endsWith('.html')&&!f.endsWith('/404.html')).map(f=>{const rel=path.relative(root,f).split(path.sep).join('/');return rel==='index.html'?'/':'/'+rel.replace(/index\.html$/,'');}),redirects,assignments:assignments.map(({town,hub,distanceKm})=>({code:town.code,name:town.name,province:town.province,provinceSlug:town.provinceSlug,population:town.population,original:town.path,destination:hub.path,hub:hub.name,url:hub.path+(town.code===hub.code?'':`#cobertura-${town.code}`),distanceKm:Number(distanceKm.toFixed(3))}))};
manifest.coverageRelease=COVERAGE_RELEASE;manifest.townPages=retained.length;manifest.retiredTownPages=retired.length;manifest.urls=coverage.routes.length;
fs.writeFileSync(root+'/manifest.json',JSON.stringify(manifest,null,2));
fs.writeFileSync(root+'/coverage-manifest.json',JSON.stringify(coverage,null,2));
const presentation=read(root+'/presentation-manifest.json');presentation.pages=coverage.routes.length+1;presentation.townPages=retained.length;fs.writeFileSync(root+'/presentation-manifest.json',JSON.stringify(presentation,null,2));
const contactReport=read(root+'/contact-visibility-report.json');contactReport.pages=coverage.routes.length+1;contactReport.contacts=coverage.routes.filter(r=>!['/aviso-legal/','/privacidad/','/cookies/'].includes(r)).length;fs.writeFileSync(root+'/contact-visibility-report.json',JSON.stringify(contactReport,null,2));
const postalReport=read(root+'/madrid-postal-report.json');postalReport.retainedMunicipalities=retained.filter(t=>t.provinceSlug==='madrid').length;fs.writeFileSync(root+'/madrid-postal-report.json',JSON.stringify(postalReport,null,2));
fs.writeFileSync(root+'/assets/municipal-coverage.css',COVERAGE_CSS+'\n.municipal-coverage-list li>span{display:block}.coverage-postal{display:block;margin-top:4px;color:var(--muted,#59636a);font-size:.85rem}.coverage-nearby{display:flex;flex-wrap:wrap;gap:12px 20px}.coverage-nearby a{padding:8px 0;min-height:44px;overflow-wrap:anywhere}\n');
for(const file of walk(root).filter(f=>f.endsWith('.html'))){const s=fs.readFileSync(file,'utf8');fs.writeFileSync(file,s.replace('</head>','<link rel="stylesheet" href="/assets/municipal-coverage.css"></head>'));}
if(manifest.mode==='production'){
 const groups=new Map([['core',[]]]);
 for(const route of coverage.routes){const first=route.split('/').filter(Boolean)[0];const key=site.provinces.some(p=>p.slug===first)?first:'core';if(!groups.has(key))groups.set(key,[]);groups.get(key).push(route);}
 fs.rmSync(root+'/sitemaps',{recursive:true,force:true});fs.mkdirSync(root+'/sitemaps');
 for(const [group,routes] of groups)fs.writeFileSync(`${root}/sitemaps/sitemap-${group}.xml`,`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map(r=>`<url><loc>${esc(new URL(r,domain).href)}</loc></url>`).join('')}</urlset>`);
 fs.writeFileSync(root+'/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${[...groups.keys()].map(k=>`<sitemap><loc>${esc(new URL('/sitemaps/sitemap-'+k+'.xml',domain).href)}</loc></sitemap>`).join('')}</sitemapindex>`);
}
console.log(`CONSOLIDACIÓN OK: ${retained.length} páginas municipales y ${retired.length} agrupados; ${towns.length} municipios cubiertos, ${coverage.routes.length} URLs finales.`);
