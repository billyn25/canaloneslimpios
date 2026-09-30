import test from 'node:test';
import assert from 'node:assert/strict';
import {refine} from '../scripts/refine.mjs';
test('selector de altura mantiene cuatro opciones válidas',()=>{
  const province={slug:'bizkaia',name:'Bizkaia'};
  const html='<html lang="es"><head><title>Bizkaia</title><meta name="description" content="Limpieza de canalones"><meta name="robots" content="noindex,nofollow"><link rel="canonical" href="https://example.invalid/bizkaia/"><script type="application/ld+json">{}</script></head><body><main><h1>Limpieza de canalones en Bizkaia</h1></main></body></html>';
  const result=refine(html,{route:'/bizkaia/',domain:'https://example.invalid',prod:false,province,provinces:[province],towns:[]});
  const options=result.match(/<select name="altura">([\s\S]*?)<\/select>/)[1];
  assert.equal([...options.matchAll(/<option>/g)].length,4);
  assert.equal([...options.matchAll(/<\/option>/g)].length,4);
  assert.ok(result.includes('data-province="Bizkaia"'));
});
