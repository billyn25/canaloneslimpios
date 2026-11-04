import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {distanceKm,policy} from './municipal-coverage.mjs';
const root='dist',read=f=>JSON.parse(fs.readFileSync(f,'utf8'));
const c=read(root+'/coverage-manifest.json'),m=read(root+'/manifest.json'),inventory=read('.cache/municipios.json'),search=read(root+'/assets/towns.json');
const geo=new Map(read('content/municipal-geography.json').municipalities.map(t=>[t.code,t]));
const expected=Object.values(inventory.groups).flat();
assert.equal(c.total,expected.length);assert.equal(c.assignments.length,c.total);assert.equal(search.length,c.total);
assert.deepEqual(new Set(c.assignments.map(a=>a.code)),new Set(expected.map(t=>t.id)));
assert.equal(c.retained,c.assignments.filter(a=>a.original===a.destination).length);assert.equal(c.redirected,c.total-c.retained);assert.equal(m.townPages,c.retained);
const retained=new Map(c.assignments.filter(a=>a.original===a.destination).map(a=>[a.original,a]));
const redirects=new Map(c.redirects.map(r=>[r.from,r.to]));
const fileFor=r=>r==='/'?root+'/index.html':root+r+'index.html';
const htmls=new Map(c.routes.map(r=>[r,fs.readFileSync(fileFor(r),'utf8')]));
const decode=s=>s.replaceAll('&amp;','&').replaceAll('&quot;','"').replaceAll('&#39;',"'");
const esc=s=>s.replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
for(const a of c.assignments){
 const hub=retained.get(a.destination);assert(hub,'Destino no conservado: '+a.name);assert.equal(a.province,hub.province);
 assert(distanceKm(geo.get(a.code),geo.get(hub.code))<=policy.maxDistanceKm);
 if(a.population>=policy.minimumPopulation)assert.equal(a.original,a.destination);
 const row=search.find(t=>t.originalPath===a.original);assert(row,'Buscador incompleto: '+a.name);assert.equal(row.path,a.url);assert.equal(row.name,a.name);
 if(a.original!==a.destination){
  assert(!fs.existsSync(fileFor(a.original)),'Documento retirado sigue publicado: '+a.name);
  assert.equal(redirects.get(a.original),a.destination);assert.equal(redirects.get(a.original.slice(0,-1)),a.destination);assert.equal(redirects.get(a.original+'index.html'),a.destination);
  const html=htmls.get(a.destination),li=html.match(new RegExp('<li id="cobertura-'+a.code+'"[^>]*>[\\s\\S]*?<\\/li>'))?.[0]||'';
  assert(li.includes(esc(a.name)),'Pueblo no visible: '+a.name);
  for(const code of row.postalCodes||[])assert(li.includes(code),'Código postal perdido: '+a.name);
 }
}
const adjacency=new Map(c.routes.map(r=>[r,new Set()]));
for(const [route,html] of htmls){
 for(const [,raw] of html.matchAll(/\bhref="([^"]*)"/g)){
  const value=decode(raw);if(/^(?:tel:|mailto:|data:)/.test(value))continue;
  let u;try{u=new URL(value,c.domain+route);}catch{continue;}
  if(u.origin!==new URL(c.domain).origin)continue;
  if(htmls.has(u.pathname)){adjacency.get(route).add(u.pathname);if(u.hash)assert(htmls.get(u.pathname).includes(`id="${decodeURIComponent(u.hash.slice(1))}"`),'Ancla rota: '+value);}
  else assert(fs.existsSync(path.join(root,u.pathname.slice(1))),'Recurso interno inexistente: '+value);
 }
}
const visited=new Set(['/']),pending=['/'];while(pending.length)for(const next of adjacency.get(pending.pop()))if(!visited.has(next)){visited.add(next);pending.push(next);}
assert.equal(visited.size,c.routes.length,'Páginas huérfanas');
for(const r of c.redirects){assert(!redirects.has(r.to),'Cadena de redirección');assert(htmls.has(r.to));assert(!htmls.has(r.from));}
if(m.mode==='production'){
 const rows=fs.readdirSync(root+'/sitemaps').flatMap(f=>[...fs.readFileSync(root+'/sitemaps/'+f,'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>decode(m[1])));
 assert.deepEqual(new Set(rows),new Set(c.routes.map(r=>new URL(r,c.domain).href)));assert.equal(rows.length,c.routes.length);
}
console.log(`COBERTURA CONSOLIDADA OK: ${c.total} municipios, ${c.retained} páginas propias, ${c.redirected} agrupados, ${c.routes.length} URLs; buscador, códigos postales y 0 huérfanas verificados.`);
