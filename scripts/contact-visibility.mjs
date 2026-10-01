import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const technicianMessage = 'Trato directo con el técnico profesional.';

// Rendered into the HTML during the build, never inserted after page load.
export function applyContactVisibility(html, contact = {}) {
  if (html.includes('data-contact-visibility="1"')) return html;
  const top = /<div class="top"><div class="wrap">[\s\S]*?<\/div><\/div>(?=<header>)/g;
  if ([...html.matchAll(top)].length !== 1) throw new Error('La cabecera de urgencias debe aparecer exactamente una vez');
  const callable = Boolean(contact.phone && /^\+?\d{8,15}$/.test(contact.tel || ''));
  const action = callable
    ? `<a class="emergency-phone" href="tel:${escape(contact.tel)}" aria-label="Llamar a urgencias 24 horas: ${escape(contact.phone)}">${escape(contact.phone)}</a>`
    : '<a class="emergency-phone" href="/#contacto">Consultar urgencia</a>';
  // No positional spans: the legacy mobile span:last-child rule cannot hide this bar.
  const bar = `<div class="top emergency-bar" data-emergency-bar><div class="wrap"><p class="emergency-label"><i class="top-urgent-dot" aria-hidden="true"></i>Urgencias 24 horas</p>${action}</div></div>`;
  let output = html.replace(top, bar).replace('<html ', '<html data-contact-visibility="1" ');
  output = output.replace('</head>', '<link rel="stylesheet" href="/assets/contact-visibility.css"></head>');
  if (output.includes('data-wa-mini')) {
    const contactCopy = /(<div class="contact-copy">[\s\S]*?<\/h2>)/g;
    if ([...output.matchAll(contactCopy)].length !== 1) throw new Error('Falta el texto del contacto de WhatsApp o está duplicado');
    output = output.replace(contactCopy, `$1<p class="direct-tech"><strong>${technicianMessage}</strong></p>`);
  }
  // Keep the requested stars, making the technician message easy to spot in the hero.
  output = output.replace(/(<div class="trustline(?: local)?">[\s\S]*?<\/span>)<span>[^<]*<\/span><\/div>/g,
    `$1<span class="direct-tech-label">${technicianMessage}</span></div>`);
  return output;
}

function main() {
  const root = 'dist';
  const site = JSON.parse(fs.readFileSync('config/site.json', 'utf8'));
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
  const production = manifest.mode === 'production';
  const contact = production ? {
    phone: process.env.SITE_PHONE || site.phone || '',
    tel: process.env.SITE_TEL || site.tel || ''
  } : {};
  fs.copyFileSync('src/contact-visibility.css', path.join(root, 'assets/contact-visibility.css'));
  const walk = dir => fs.readdirSync(dir, {withFileTypes:true}).flatMap(entry => entry.isDirectory() ? walk(path.join(dir,entry.name)) : [path.join(dir,entry.name)]);
  let pages = 0, contacts = 0;
  for (const file of walk(root).filter(file => file.endsWith('.html'))) {
    try {
      const html = fs.readFileSync(file, 'utf8');
      const result = applyContactVisibility(html, contact);
      if (result.includes('data-wa-mini')) contacts++;
      fs.writeFileSync(file, result);
      pages++;
    } catch (error) { throw new Error(`${file}: ${error.message}`); }
  }
  const report = {pages, contacts, mode: manifest.mode, message: technicianMessage, emergencyLabel: 'Urgencias 24 horas', phone: contact.phone || null};
  fs.writeFileSync(path.join(root, 'contact-visibility-report.json'), JSON.stringify(report, null, 2));
  console.log('CONTACTO VISIBLE OK:', JSON.stringify(report));
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) main();
