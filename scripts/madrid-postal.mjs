import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {escape as esc, getTowns} from './refine.mjs';

// The source is stored locally; builds and visitors never query CartoCiudad.
export function validatePostalData(data) {
  assert.equal(data.provinceId, '28');
  assert.equal(data.municipalities.length, 179, 'Inventario postal de Madrid incompleto');
  assert.equal(new Set(data.municipalities.map(x => x.id)).size, 179, 'Municipios postales repetidos');
  for (const row of data.municipalities) {
    assert.match(row.id, /^28\d{3}$/);
    assert.ok(row.name && row.postalCodes.length, 'Municipio sin nombre o códigos');
    assert.deepEqual(row.postalCodes, [...new Set(row.postalCodes)].sort());
    for (const code of row.postalCodes) assert.match(code, /^28\d{3}$/);
  }
  return data;
}
const codesHtml = codes => codes.map(code => `<span class="postal-code">${esc(code)}</span>`).join(' ');
const sourceNote = data => `<p class="postal-source">Códigos asociados a direcciones municipales de <a href="https://www.cartociudad.es/web/portal/directorio-de-servicios/descarga">CartoCiudad (IGN/CNIG)</a>. Datos consultados el ${esc(data.checkedOn)}. Obra derivada de CartoCiudad, <a href="https://www.scne.es/">CC BY 4.0 · SCNE</a>.</p>`;
const addStyle = html => html.includes('href="/assets/madrid-postal.css"') ? html : html.replace('</head>', '<link rel="stylesheet" href="/assets/madrid-postal.css"></head>');
export function postalBlock(town, row, data) {
  const first = row.postalCodes.slice(0, 12), rest = row.postalCodes.slice(12);
  return `<section class="section soft postal-coverage" id="codigos-postales"><div class="wrap"><span class="eyebrow">Localiza tu aviso</span><h2>Códigos postales de ${esc(town.name)}</h2><p>Para consultar una limpieza de tejados o canalones, un atasco de bajante o una gotera en ${esc(town.name)}, indica municipio, dirección y código postal al contactar.</p><div class="postal-code-list" aria-label="Códigos postales de ${esc(town.name)}">${codesHtml(first)}</div>${rest.length ? `<details class="postal-more"><summary>Ver los ${rest.length} códigos restantes</summary><div class="postal-code-list">${codesHtml(rest)}</div></details>` : ''}<p class="postal-help">Un municipio puede tener varios códigos y un mismo código puede compartirse entre municipios. Confirma el correspondiente a tu dirección al preparar el aviso.</p>${sourceNote(data)}<a class="text-link" href="/madrid/#localidades">Buscar otro municipio o código postal de Madrid →</a></div></section>`;
}
export function enrichMadridTown(html, town, row, data) {
  if (town.provinceSlug !== 'madrid') return html;
  assert.equal(town.id, row.id, 'La asignación postal no corresponde al municipio');
  assert.ok(!html.includes('id="codigos-postales"'), 'Bloque postal ya insertado');
  const marker = `<section class="section wrap"><h2>Preguntas frecuentes sobre canalones en ${esc(town.name)}</h2>`;
  assert.equal(html.split(marker).length, 2, `${town.path}: falta punto de inserción postal`);
  return addStyle(html.replace(marker, postalBlock(town, row, data) + marker));
}
export function enrichSearchRows(rows, locals, lookup) {
  const byPath = new Map(locals.map(t => [t.path, t]));
  return rows.map(row => {
    const town = byPath.get(row.path);
    return town ? {...row, postalCodes: lookup.get(town.id).postalCodes} : row;
  });
}
const directoryFinder = count => `<div class="town-finder"><label for="town-search">Buscar municipio o código postal</label><input id="town-search" type="search" placeholder="Ej.: Alcalá de Henares o 28801" autocomplete="off" data-town-search data-province="madrid" aria-describedby="town-search-help" aria-controls="town-search-results"><p id="town-search-help">Busca sin tildes o introduce un código postal. Un código compartido muestra todos sus municipios. También puedes consultar los ${count} municipios en el listado de abajo.</p><p data-town-status role="status"></p><div id="town-search-results" class="town-results"></div></div>`;
export function enrichMadridDirectory(html, locals, lookup, data) {
  assert.ok(!html.includes('id="localidades"'), 'El directorio postal ya existe');
  const marker = '<section class="section wrap"><section class="alpha-group">';
  assert.equal(html.split(marker).length, 2, 'No se encuentra el directorio provincial');
  let output = html.replace(marker, `<section class="section wrap postal-directory" id="localidades"><h2>Municipios y códigos postales de Madrid</h2>${directoryFinder(locals.length)}${sourceNote(data)}<section class="alpha-group">`);
  for (const town of locals) {
    const row = lookup.get(town.id);
    const before = `<a href="${town.path}">Limpieza de canalones en ${esc(town.name)}</a>`;
    assert.equal(output.split(before).length, 2, `${town.path}: enlace provincial ausente o duplicado`);
    const sample = row.postalCodes.slice(0, 4).join(' · ');
    const more = row.postalCodes.length > 4 ? ` · y ${row.postalCodes.length - 4} más` : '';
    output = output.replace(before, `<a class="postal-town-link" href="${town.path}" data-municipio-id="${row.id}" data-postal-codes="${row.postalCodes.join(' ')}">Limpieza de canalones en ${esc(town.name)}<span class="postal-directory-codes">CP: ${sample}${more}</span></a>`);
  }
  return addStyle(output);
}
function main() {
  const root = 'dist', data = validatePostalData(JSON.parse(fs.readFileSync('content/postal-codes-madrid.json','utf8')));
  const site = JSON.parse(fs.readFileSync('config/site.json','utf8'));
  const inventory = JSON.parse(fs.readFileSync('.cache/municipios.json','utf8'));
  const towns = getTowns(site, inventory), locals = towns.filter(t => t.provinceSlug === 'madrid');
  const lookup = new Map(data.municipalities.map(row => [row.id, row]));
  assert.equal(locals.length, 179, 'Faltan municipios de Madrid');
  assert.deepEqual(locals.map(t => t.id).sort(), [...lookup.keys()].sort());
  for (const town of locals) {
    assert.equal(town.name, lookup.get(town.id).name, 'Nombre municipal incoherente con datos postales');
    const file = path.join(root, town.path.slice(1), 'index.html');
    fs.writeFileSync(file, enrichMadridTown(fs.readFileSync(file,'utf8'), town, lookup.get(town.id), data));
  }
  const dir = path.join(root,'madrid/index.html');
  fs.writeFileSync(dir, enrichMadridDirectory(fs.readFileSync(dir,'utf8'), locals, lookup, data));
  const homeFile = path.join(root,'index.html');
  let home = fs.readFileSync(homeFile,'utf8');
  home = home.replace('for="town-search">Busca tu pueblo</label>', 'for="town-search">Busca tu pueblo o código postal</label>')
    .replace('placeholder="Escribe al menos dos letras"','placeholder="Ej.: Lerma, Madrid o 28801"')
    .replace('Puedes buscar sin tildes. Los listados por provincia siguen disponibles debajo.', 'Puedes buscar sin tildes. Los códigos postales están disponibles para Madrid. Los listados por provincia siguen disponibles debajo.');
  const homeMarker = '<h3>Madrid</h3><a href="/madrid/">Ver todos</a></div>';
  assert.equal(home.split(homeMarker).length, 2, 'Madrid debe aparecer una vez en portada');
  home = home.replace(homeMarker, homeMarker + '<p class="postal-home-link"><a href="/madrid/#localidades">Buscar municipio o código postal →</a></p>');
  fs.writeFileSync(homeFile, addStyle(home));
  const searchFile = path.join(root,'assets/towns.json');
  fs.writeFileSync(searchFile, JSON.stringify(enrichSearchRows(JSON.parse(fs.readFileSync(searchFile,'utf8')), locals, lookup)));
  fs.copyFileSync('src/madrid-postal.css',path.join(root,'assets/madrid-postal.css'));
  const report = {municipalities:locals.length, totalMunicipalities:towns.length, provinces:site.provinces.length, postalAssignments:data.municipalities.reduce((n,r)=>n+r.postalCodes.length,0), distinctPostalCodes:new Set(data.municipalities.flatMap(r=>r.postalCodes)).size, source:data.source, checkedOn:data.checkedOn};
  fs.writeFileSync(path.join(root,'madrid-postal-report.json'), JSON.stringify(report,null,2));
  console.log('MADRID POSTAL OK:', JSON.stringify(report));
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) main();
