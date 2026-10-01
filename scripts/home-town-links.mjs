import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';

export const townServiceAt = index => index % 3 === 2 ? 'Limpieza de tejados' : 'Limpieza de canalones';
const groupsPattern = /<article class="town-province">[\s\S]*?<\/article>/g;
const listsPattern = /<div class="home-town-links (featured-town-links|more-town-links)">([\s\S]*?)<\/div>/g;
const linkPattern = /<a href="(\/[a-z0-9-]+\/[a-z0-9-]+\/)">([^<]+)<\/a>/g;
export const anchorDestinations = html => [...html.matchAll(/<a\b[^>]*href="([^"]+)"/g)].map(m => m[1]);

// Only the homepage directory is changed. Existing destinations, selection and order are preserved.
export function applyTownServiceLabels(html) {
  if (html.includes('data-town-link-labels="1"')) return html;
  if (!html.includes('id="pueblos"') || !html.includes('</head>')) throw Error('Falta la sección de pueblos o la cabecera');
  let groups = 0;
  let output = html.replace(groupsPattern, group => {
    groups++;
    let index = 0, featured = 0, listCount = 0;
    const result = group.replace(listsPattern, (_, kind, inner) => {
      listCount++;
      const links = [...inner.matchAll(linkPattern)];
      if (!links.length || inner.replace(linkPattern, '').trim()) throw Error('Estructura inesperada de enlaces de pueblos');
      if (kind === 'featured-town-links') featured++;
      const rendered = links.map(([, href, name]) => {
        const service = townServiceAt(index++);
        return `<a class="town-service-link" href="${href}"><span class="town-service-label">${service} en</span> <strong class="town-service-name">${name}</strong></a>`;
      }).join('');
      return `<div class="home-town-links ${kind}">${rendered}</div>`;
    });
    if (featured !== 1 || listCount > 2) throw Error('Cada provincia necesita un único listado destacado');
    return result;
  });
  if (!groups) throw Error('No se han encontrado grupos de municipios');
  output = output.replace('<html ', '<html data-town-link-labels="1" ').replace('</head>', '<link rel="stylesheet" href="/assets/home-town-links.css"></head>');
  assert.deepEqual(anchorDestinations(output), anchorDestinations(html), 'Se han alterado destinos u orden de enlaces');
  return output;
}

async function main() {
  const site = JSON.parse(fs.readFileSync('config/site.json', 'utf8'));
  const data = JSON.parse(fs.readFileSync('.cache/municipios.json', 'utf8'));
  const {getTowns} = await import('./refine.mjs');
  const towns = getTowns(site, data);
  const original = fs.readFileSync('dist/index.html', 'utf8');
  const output = applyTownServiceLabels(original);
  const groups = [...output.matchAll(groupsPattern)].map(m => m[0]);
  assert.equal(groups.length, site.provinces.length, 'Inventario de provincias incompleto');
  let visible = 0;
  const rows = groups.map((group, index) => {
    const province = site.provinces[index];
    const allLinks = anchorDestinations(group).filter(href => /^\/[a-z0-9-]+\/[a-z0-9-]+\/$/.test(href));
    const expected = towns.filter(t => t.provinceSlug === province.slug).map(t => t.path);
    assert.deepEqual([...allLinks].sort(), [...expected].sort(), `Enlaces incompletos en ${province.name}`);
    assert.equal(new Set(allLinks).size, allLinks.length, 'Municipio duplicado');
    const shown = group.match(/<div class="home-town-links featured-town-links">([\s\S]*?)<\/div>/)?.[1] || '';
    const labels = [...shown.matchAll(/class="town-service-label">([^<]+)</g)].map(m => m[1]);
    assert.equal(labels.length, Math.min(12, expected.length), 'Número de municipios visibles incorrecto');
    assert.deepEqual(labels, labels.map((_, i) => townServiceAt(i) + ' en'), 'Reparto de servicios incorrecto');
    assert.equal([...group.matchAll(/class="town-service-name"/g)].length, expected.length, 'Faltan textos en el desplegable');
    visible += labels.length;
    return {province: province.name, visible: labels.length, canalones: labels.filter(s => s === 'Limpieza de canalones en').length, tejados: labels.filter(s => s === 'Limpieza de tejados en').length, more: expected.length - labels.length};
  });
  fs.copyFileSync('src/home-town-links.css', 'dist/assets/home-town-links.css');
  fs.writeFileSync('dist/index.html', output);
  const report = {municipalities: towns.length, provinces: rows.length, visible, collapsed: towns.length - visible, unchangedDestinations: true, rows};
  fs.writeFileSync('dist/home-town-links-report.json', JSON.stringify(report, null, 2));
  console.log(`ENLACES DE PUEBLOS OK: ${visible} visibles; ${towns.length - visible} en Ver más; 8 canalones y 4 tejados por provincia; destinos conservados.`);
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) main().catch(error => {console.error(error); process.exitCode = 1;});
