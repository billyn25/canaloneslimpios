import fs from 'node:fs';
import path from 'node:path';
import site from '../config/site.json' with {type:'json'};

const SOURCE='https://raw.githubusercontent.com/codeforspain/ds-organizacion-administrativa/1e9c99280ef4d7a12def33cafc3df59d9fc1f688/data/municipios.json';
const response=await fetch(SOURCE,{headers:{'user-agent':'CanalonesLimpios-build'}});
if(!response.ok) throw new Error(`Municipios: HTTP ${response.status}`);
const all=await response.json();
const groups={};
for(const p of site.provinces){
  const items=all.filter(x=>x.provincia_id===p.id).map(x=>({id:x.municipio_id,name:x.nombre.replaceAll('\\/','/')})).sort((a,b)=>a.name.localeCompare(b.name,'es',{sensitivity:'base'}));
  if(!items.length) throw new Error(`Sin municipios para ${p.name}`);
  groups[p.slug]=items;
}
fs.mkdirSync('.cache',{recursive:true});
fs.writeFileSync('.cache/municipios.json',JSON.stringify({source:SOURCE,groups},null,2));
console.log('MUNICIPIOS OK:',Object.values(groups).reduce((n,x)=>n+x.length,0),'en',site.provinces.length,'provincias');
