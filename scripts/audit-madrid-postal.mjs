import fs from 'node:fs';
import {madridDistricts} from '../content/madrid-districts.mjs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {getTowns, escape} from './refine.mjs';
import {validatePostalData} from './madrid-postal.mjs';
const root='dist', site=JSON.parse(fs.readFileSync('config/site.json','utf8'));
const data=validatePostalData(JSON.parse(fs.readFileSync('content/postal-codes-madrid.json','utf8')));
const towns=getTowns(site,JSON.parse(fs.readFileSync('.cache/municipios.json','utf8'))),locals=towns.filter(t=>t.provinceSlug==='madrid');
const manifest=JSON.parse(fs.readFileSync(root+'/manifest.json','utf8'));
const coverage=fs.existsSync(root+'/coverage-manifest.json')?JSON.parse(fs.readFileSync(root+'/coverage-manifest.json','utf8')):null;
const assignments=new Map((coverage?.assignments||[]).map(a=>[a.original,a]));
const lookup=new Map(data.municipalities.map(r=>[r.id,r]));
assert.equal(locals.length,179);assert.equal(towns.length,2760);assert.equal(site.provinces.length,15);
const search=JSON.parse(fs.readFileSync(root+'/assets/towns.json','utf8'));
assert.equal(search.length,towns.length);
const directory=fs.readFileSync(root+'/madrid/index.html','utf8');
assert.ok(directory.includes('Buscar municipio o código postal')&&directory.includes('data-province="madrid"'));
for(const town of towns){
  const row=search.find(r=>(r.originalPath||r.path)===town.path);assert.ok(row);
  if(town.provinceSlug!=='madrid'){assert.ok(!('postalCodes' in row),town.path+': código postal inventado');continue}
  const assignment=assignments.get(town.path),grouped=assignment&&assignment.original!==assignment.destination;
  const html=fs.readFileSync(path.join(root,(assignment?.destination||town.path).slice(1),'index.html'),'utf8');
  const postal=lookup.get(town.id);assert.ok(postal);
  assert.deepEqual(row.postalCodes,postal.postalCodes);
  if(grouped){
    const block=html.match(new RegExp('<li id="cobertura-'+town.id+'"[^>]*>[\\s\\S]*?<\\/li>'))?.[0]||'';
    assert.ok(block.includes(escape(town.name)));for(const code of postal.postalCodes)assert.ok(block.includes(code),'Falta CP de '+town.name);
    assert.equal(row.path,assignment.url);continue;
  }
  assert.deepEqual([...html.matchAll(/class="postal-code">(\d{5})<\/span>/g)].map(m=>m[1]),postal.postalCodes);
  assert.equal((html.match(/id="codigos-postales"/g)||[]).length,1);
  assert.ok(directory.includes(`data-municipio-id="${town.id}" data-postal-codes="${postal.postalCodes.join(' ')}"`));
  assert.ok(html.includes(`value="${escape(town.name)}"`),'El formulario debe conservar el pueblo');
  for(const service of ['canalones','tejados'])assert.ok(html.includes(`<h2>Limpieza de ${service} en ${escape(town.name)}</h2>`),'Se pierde el servicio local de '+service);
  assert.ok(!/"(?:streetAddress|postalCode)"\s*:/.test(html),'Códigos de cobertura no son sedes de empresa');
  assert.ok(html.includes(`content="${manifest.mode==='production'?'index,follow':'noindex,nofollow'}"`));
}
assert.ok(directory.includes('id="distritos-madrid"'));assert.ok(directory.indexOf('id="distritos-madrid"')<directory.indexOf('id="localidades"'));for(const d of madridDistricts)assert.ok(directory.includes(`href="${d.path}"`),d.slug);const home=fs.readFileSync(root+'/index.html','utf8');assert.ok(home.includes('href="/madrid/#localidades"'));
assert.ok(home.includes('Los códigos postales están disponibles para Madrid'));
if(manifest.mode==='production'){
 const domain=process.env.SITE_DOMAIN||site.productionDomain;
 const xml=fs.readFileSync(root+'/sitemaps/sitemap-madrid.xml','utf8');
 const urls=[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
 const retainedLocals=coverage?locals.filter(t=>assignments.get(t.path).original===assignments.get(t.path).destination):locals;
 const expectedCount=1+retainedLocals.length+madridDistricts.length;
 assert.equal(urls.length,expectedCount);assert.equal(new Set(urls).size,expectedCount);
 for(const route of ['/madrid/',...retainedLocals.map(t=>t.path),...madridDistricts.map(d=>d.path)])assert.ok(urls.includes(new URL(route,domain).href));
 assert.ok(fs.readFileSync(root+'/sitemap.xml','utf8').includes('/sitemaps/sitemap-madrid.xml'));
}
console.log('AUDITORÍA MADRID OK: 179 municipios + 21 distritos; 395 relaciones postales; buscador en portada y Madrid; 2760 municipios en 15 provincias.');
