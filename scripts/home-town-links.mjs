import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';

export const townServices = Object.freeze([
  'Limpieza de canalones',
  'Limpieza de tejados',
  'Limpieza de canalones y tejados',
  'Limpieza de tejados y canalones'
]);
export const townServiceAt = index => townServices[index % townServices.length];
const groupsPattern = /<article class="town-province">[\s\S]*?<\/article>/g;
const listsPattern = /<div class="home-town-links (featured-town-links|more-town-links)">([\s\S]*?)<\/div>/g;
const linkPattern = /<a href="(\/[a-z0-9-]+\/[a-z0-9-]+\/)">([^<]+)<\/a>/g;
export const anchorDestinations = html => [...html.matchAll(/<a\b[^>]*href="([^"]+)"/g)].map(m => m[1]);

// All provinces share the same four labels. Destinations, selection and order are preserved.
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

// Reuse the homepage assignment in the provincial directories: no random labels per build.
export function labelsFromHome(html) {
  const labels = new Map();
  const pattern = /<a class="town-service-link" href="([^"]+)"><span class="town-service-label">([^<]+) en<\/span> <strong class="town-service-name">([^<]+)<\/strong><\/a>/g;
  for (const group of html.matchAll(groupsPattern)) {
    for (const [, href, service, name] of group[0].matchAll(pattern)) {
      assert.ok(townServices.includes(service), 'Servicio no previsto en el listado');
      assert.ok(!labels.has(href), 'Municipio duplicado en los enlaces de portada');
      labels.set(href, {service, name});
    }
  }
  assert.ok(labels.size, 'Faltan las etiquetas municipales de portada');
  return labels;
}

export function applyProvinceServiceLabels(html, labels) {
  if (html.includes('data-province-link-labels="1"')) return html;
  let count = 0;
  let output = html.replace(/(<div class="alpha">)([\s\S]*?)(<\/div>)/g, (_, start, links, end) => {
    const updated = links.replace(/<a\b([^>]*\bhref="([^"]+)"[^>]*)>([\s\S]*?)<\/a>/g, (_, attrs, href, body) => {
      const row = labels.get(href);
      assert.ok(row, 'Enlace provincial sin municipio: ' + href);
      const prefix = 'Limpieza de canalones en ' + row.name;
      assert.ok(body.startsWith(prefix), 'Texto provincial inesperado: ' + href);
      // Madrid also has a postal-code span. Keep it and every data attribute intact.
      const suffix = body.slice(prefix.length);
      assert.ok(!suffix || /^<span class="postal-directory-codes">[^<]+<\/span>$/.test(suffix), 'Contenido postal inesperado: ' + href);
      const attributes = /\bclass="/.test(attrs)
        ? attrs.replace(/\bclass="([^"]*)"/, (_, classes) => `class="${classes} town-service-link"`)
        : ' class="town-service-link"' + attrs;
      count++;
      return `<a${attributes}><span class="town-service-label">${row.service} en</span> <strong class="town-service-name">${row.name}</strong>${suffix}</a>`;
    });
    return start + updated + end;
  });
  assert.ok(count, 'Falta el listado de municipios de la provincia');
  assert.deepEqual(anchorDestinations(output), anchorDestinations(html), 'Se han alterado enlaces provinciales');
  output = output.replace('<html ', '<html data-province-link-labels="1" ');
  if (!output.includes('href="/assets/home-town-links.css"')) output = output.replace('</head>', '<link rel="stylesheet" href="/assets/home-town-links.css"></head>');
  return output;
}

async function main() {
  const site = JSON.parse(fs.readFileSync('config/site.json', 'utf8'));
  const data = JSON.parse(fs.readFileSync('.cache/municipios.json', 'utf8'));
  const {getTowns} = await import('./refine.mjs');
  const towns = getTowns(site, data);
  const original = fs.readFileSync('dist/index.html', 'utf8');
  const output = applyTownServiceLabels(original);
  const assignments = labelsFromHome(output);
  assert.equal(assignments.size, towns.length, 'Faltan municipios en la asignación global');
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
    const directoryFile = path.join('dist', province.slug, 'index.html');
    const directory = applyProvinceServiceLabels(fs.readFileSync(directoryFile, 'utf8'), assignments);
    assert.equal([...directory.matchAll(/class="town-service-name"/g)].length, expected.length, 'Directorio provincial incompleto');
    for (const href of expected) {
      const row = assignments.get(href);
      assert.ok(directory.includes(`<span class="town-service-label">${row.service} en</span> <strong class="town-service-name">${row.name}</strong>`), 'Etiqueta incoherente: ' + href);
    }
    fs.writeFileSync(directoryFile, directory);
    visible += labels.length;
    return {province: province.name, visible: labels.length, canalones: labels.filter(s => s === 'Limpieza de canalones en').length, tejados: labels.filter(s => s === 'Limpieza de tejados en').length, canalonesYTejados: labels.filter(s => s === 'Limpieza de canalones y tejados en').length, tejadosYCanalones: labels.filter(s => s === 'Limpieza de tejados y canalones en').length, more: expected.length - labels.length};
  });
  fs.copyFileSync('src/home-town-links.css', 'dist/assets/home-town-links.css');
  fs.writeFileSync('dist/index.html', output);
  const report = {municipalities: towns.length, provinces: rows.length, visible, collapsed: towns.length - visible, unchangedDestinations: true, directoryPages: rows.length, directoryLinks: towns.length, variants: townServices, rows};
  fs.writeFileSync('dist/home-town-links-report.json', JSON.stringify(report, null, 2));
  console.log(`ENLACES DE PUEBLOS OK: ${visible} visibles; ${towns.length - visible} en Ver más; 4 textos alternados en portada y ${rows.length} directorios; destinos conservados.`);
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) main().catch(error => {console.error(error); process.exitCode = 1;});
