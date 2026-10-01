import test from 'node:test';
import assert from 'node:assert/strict';
import {applyContactVisibility, technicianMessage} from '../scripts/contact-visibility.mjs';

const contact = {phone:'641 58 93 94',tel:'+34641589394'};
const header = '<div class="top"><div class="wrap"><span>Limpieza y mantenimiento de canalones</span><span>Urgencias 24 horas</span></div></div><header>Marca</header>';
const fixture = (commercial = true) => `<!doctype html><html lang="es"><head><title>Canalones en Lerma</title><meta name="robots" content="index,follow"><link rel="canonical" href="https://example.invalid/burgos/lerma/"></head><body>${header}<main><h1>Limpieza de canalones en Lerma</h1><div class="trustline local"><span class="stars" aria-hidden="true">★★★★★</span><span>Limpieza y mantenimiento</span></div>${commercial?'<section id="contacto"><div class="contact-copy"><h2>Presupuesto</h2><p>Tres datos rápidos.</p></div><form data-wa-mini data-whatsapp="34641589394"><input value="Lerma"></form></section>':''}</main></body></html>`;
test('urgencias y teléfono son HTML real, sin spans ocultables de móvil', () => {
  const html = applyContactVisibility(fixture(), contact);
  assert.match(html, /class="top emergency-bar" data-emergency-bar/);
  assert.match(html, /Urgencias 24 horas<\/p>/);
  assert.match(html, /href="tel:\+34641589394"/);
  assert.ok(html.includes('>641 58 93 94</a>'));
  assert.ok(!html.match(/data-emergency-bar[\s\S]*?<header>/)[0].includes('<span'));
});
test('el contacto y el hero muestran trato directo y conservan estrellas', () => {
  const html = applyContactVisibility(fixture(), contact);
  assert.ok(html.includes(`<p class="direct-tech"><strong>${technicianMessage}</strong></p>`));
  assert.ok(html.includes(`<span class="direct-tech-label">${technicianMessage}</span>`));
  assert.ok(html.includes('★★★★★'));
});
test('no altera SEO, formulario, teléfono de WhatsApp ni la localidad', () => {
  const before = fixture(), after = applyContactVisibility(before, contact);
  for (const re of [/<title>.*?<\/title>/, /<h1>.*?<\/h1>/, /<meta name="robots"[^>]*>/, /<link rel="canonical"[^>]*>/, /<form[\s\S]*?<\/form>/]) assert.equal(after.match(re)[0], before.match(re)[0]);
});
test('se puede volver a aplicar sin duplicar bloques', () => {
  const once = applyContactVisibility(fixture(),contact);
  assert.equal(applyContactVisibility(once,contact),once);
});
test('legales y 404 conservan cabecera, sin añadir formulario o reclamo comercial', () => {
  const html = applyContactVisibility(fixture(false).replace(/<div class="trustline local">[\s\S]*?<\/div>/,''),contact);
  assert.ok(html.includes('data-emergency-bar'));
  assert.ok(!html.includes('data-wa-mini'));
  assert.ok(!html.includes('class="direct-tech"'));
});
test('preview sin contacto no genera enlaces tel vacíos ni datos inventados', () => {
  const html = applyContactVisibility(fixture(),{});
  assert.ok(!html.includes('href="tel:'));
  assert.ok(html.includes('href="/#contacto">Consultar urgencia</a>'));
});
test('una plantilla inesperada falla en vez de omitir silenciosamente el cambio', () => {
  assert.throws(()=>applyContactVisibility(fixture().replace(header,''),contact),/cabecera/);
  assert.throws(()=>applyContactVisibility(fixture().replace('class="contact-copy"','class="otro"'),contact),/contacto/);
});
