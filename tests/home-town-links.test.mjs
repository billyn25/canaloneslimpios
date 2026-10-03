import test from 'node:test';
import assert from 'node:assert/strict';
import {applyTownServiceLabels, anchorDestinations, townServiceAt, townServices, labelsFromHome, applyProvinceServiceLabels} from '../scripts/home-town-links.mjs';
const names = ['Lerma','Briviesca','Medina de Pomar','Aranda de Duero','Burgos','Roa','Belorado','Frías','Sasamón','Oña','Salas de los Infantes','Miranda de Ebro','A &amp; B','Urduña/Orduña'];
const link = (name, i) => `<a href="/burgos/pueblo-${i}/">${name}</a>`;
const fixture = () => `<html lang="es"><head><title>Portada</title><meta name="robots" content="index,follow"><link rel="canonical" href="https://limpiezacanalonesytejados.com/"><script type="application/ld+json">{"name":"Test"}</script></head><body><h1>Título aprobado</h1><section id="pueblos"><article class="town-province"><div class="town-province-head"><h3>Burgos</h3><a href="/burgos/">Ver todos</a></div><div class="home-town-links featured-town-links">${names.slice(0,12).map(link).join('')}</div><details class="more-towns"><summary>Ver más pueblos de Burgos <span>(2)</span></summary><div class="home-town-links more-town-links">${names.slice(12).map((n,i)=>link(n,i+12)).join('')}</div></details></article></section><a href="tel:+34641589394">641 58 93 94</a></body></html>`;

test('los 12 visibles reparten tres enlaces de cada una de las cuatro variantes', () => {
  const out = applyTownServiceLabels(fixture());
  const shown = out.match(/featured-town-links">([\s\S]*?)<\/div>/)[1];
  const labels = [...shown.matchAll(/class="town-service-label">([^<]+)</g)].map(m => m[1]);
  for (const service of townServices) assert.equal(labels.filter(x => x === service + ' en').length, 3);
  assert.equal([...shown.matchAll(/town-service-name/g)].length, 12);
});
test('conserva todos los destinos, su orden y las localidades del desplegable', () => {
  const before = fixture(), after = applyTownServiceLabels(before);
  assert.deepEqual(anchorDestinations(after), anchorDestinations(before));
  assert.equal([...after.matchAll(/town-service-name/g)].length, names.length);
  assert.ok(after.includes('>A &amp; B</strong>'));
  assert.ok(after.includes('>Urduña/Orduña</strong>'));
  assert.ok(after.includes('<details class="more-towns">'));
  assert.ok(after.includes('Ver más pueblos de Burgos <span>(2)</span>'));
});
test('servicio y municipio son texto visible del mismo enlace', () => {
  const out = applyTownServiceLabels(fixture());
  assert.ok(out.includes('<a class="town-service-link" href="/burgos/pueblo-0/"><span class="town-service-label">Limpieza de canalones en</span> <strong class="town-service-name">Lerma</strong></a>'));
  assert.ok(!out.includes('aria-hidden'));
});
test('no modifica metadatos, H1, datos estructurados ni teléfono', () => {
  const before = fixture(), after = applyTownServiceLabels(before);
  for (const pattern of [/<title>[^<]+<\/title>/, /<meta name="robots"[^>]+>/, /<link rel="canonical"[^>]+>/, /<h1>[^<]+<\/h1>/, /<script type="application\/ld\+json">[^<]+<\/script>/]) assert.equal(before.match(pattern)[0], after.match(pattern)[0]);
  assert.ok(after.includes('href="tel:+34641589394"'));
});
test('reaplicar no duplica texto ni estilos y el reparto es estable', () => {
  const once = applyTownServiceLabels(fixture());
  assert.equal(applyTownServiceLabels(once), once);
  assert.equal(applyTownServiceLabels(fixture()), once);
  assert.equal(townServiceAt(2), 'Limpieza de canalones y tejados');
  assert.equal(townServiceAt(3), 'Limpieza de tejados y canalones');
  assert.equal(townServiceAt(4), 'Limpieza de canalones');
});
test('una plantilla inesperada falla en lugar de omitir enlaces', () => {
  assert.throws(()=>applyTownServiceLabels('<html><head></head></html>'));
  assert.throws(()=>applyTownServiceLabels(fixture().replace('href="/burgos/pueblo-0/"','href="https://example.invalid/"')),/Estructura inesperada/);
});

test('todos los directorios reutilizan las etiquetas de portada sin alterar los destinos', () => {
  const labels = labelsFromHome(applyTownServiceLabels(fixture()));
  const head = '<html lang="es"><head><title>Se conserva</title></head><body><h1>Provincia</h1>';
  const before = head + '<div class="alpha">' + names.map((name, i) => `<a href="/burgos/pueblo-${i}/">Limpieza de canalones en ${name}</a>`).join('') + '</div></body></html>';
  const after = applyProvinceServiceLabels(before, labels);
  assert.deepEqual(anchorDestinations(after), anchorDestinations(before));
  for (const {service, name} of labels.values()) assert.ok(after.includes(`<span class="town-service-label">${service} en</span> <strong class="town-service-name">${name}</strong>`));
  assert.ok(after.includes('<title>Se conserva</title>'));
  assert.ok(after.includes('<h1>Provincia</h1>'));
  assert.equal(applyProvinceServiceLabels(after, labels), after);
});
test('Madrid conserva códigos postales, atributos del buscador y sus textos', () => {
  const labels = new Map([['/madrid/alcala-de-henares/', {service:townServiceAt(2),name:'Alcalá de Henares'}]]);
  const body = '<div class="alpha"><a class="postal-town-link" href="/madrid/alcala-de-henares/" data-municipio-id="28005" data-postal-codes="28801 28802">Limpieza de canalones en Alcalá de Henares<span class="postal-directory-codes">CP: 28801 · 28802</span></a></div>';
  const after = applyProvinceServiceLabels('<html lang="es"><head></head><body>' + body + '</body></html>', labels);
  assert.ok(after.includes('class="postal-town-link town-service-link"'));
  assert.ok(after.includes('data-municipio-id="28005" data-postal-codes="28801 28802"'));
  assert.ok(after.includes('<span class="postal-directory-codes">CP: 28801 · 28802</span>'));
  assert.ok(after.includes('Limpieza de canalones y tejados en'));
});
test('un directorio desconocido o contenido inesperado no se modifica silenciosamente', () => {
  const labels = labelsFromHome(applyTownServiceLabels(fixture()));
  assert.throws(() => applyProvinceServiceLabels('<html><head></head></html>',labels), /Falta el listado/);
  assert.throws(() => applyProvinceServiceLabels('<html><head></head><div class="alpha"><a href="/burgos/desconocido/">Pueblo</a></div></html>',labels), /sin municipio/);
});
