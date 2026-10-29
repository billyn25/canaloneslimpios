import {renderServiceAreaMap} from './service-area-map.mjs';

const escape=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const services=[
  ['Limpieza de canalones','/limpieza-canalones/'],
  ['Limpieza de tejados','/limpieza-tejados/'],
  ['Desatasco de bajantes','/desatasco-bajantes/'],
  ['Reparación de goteras','/reparacion-goteras/'],
  ['Impermeabilización','/impermeabilizacion-tejados/']
];
const roofMark='<svg class="footer-brand-icon" viewBox="0 0 48 48" aria-hidden="true" focusable="false"><path d="M7 23 24 9l17 14M12 21v15h20M7 27h34v5a5 5 0 0 1-5 5h-1"/><path d="M38 37c0 0-3 3.6-3 5a3 3 0 0 0 6 0c0-1.4-3-5-3-5Z"/></svg>';

export function renderFooter({provinces,legalLinks,route='/'}){
  const pathname=new URL(route,'https://limpiezacanalonesytejados.com').pathname;
  const provinceSlug=pathname.split('/').filter(Boolean)[0];
  const activeProvince=provinces.some(p=>p.slug===provinceSlug)?provinceSlug:'';
  const quoteTarget=['/aviso-legal/','/privacidad/','/cookies/','/404.html','/404'].includes(pathname)?'/#contacto':'#contacto';
  const ordered=[...provinces].sort((a,b)=>a.name.localeCompare(b.name,'es',{sensitivity:'base'}));
  const provinceLinks=ordered.map(p=>`<a class="footer-province-link${p.slug===activeProvince?' is-active':''}" data-province="${escape(p.slug)}" href="/${escape(p.slug)}/"${pathname===`/${p.slug}/`?' aria-current="location"':''}><span class="footer-province-dot" aria-hidden="true"></span><span>${escape(p.name)}</span><span class="footer-province-arrow" aria-hidden="true">↗</span></a>`).join('');
  return `<footer class="footer site-footer" id="pie"><div class="wrap">
<div class="footer-topline"><a class="footer-brand" href="/" aria-label="Limpieza Canalones y Tejados, inicio">${roofMark}<span><small>Limpieza</small><strong>Canalones y Tejados</strong></span></a><a class="footer-quote-link" href="${quoteTarget}">Pedir presupuesto <span aria-hidden="true">↗</span></a></div>
<section class="footer-coverage" aria-labelledby="footer-coverage-title"><div class="footer-coverage-heading"><span class="footer-eyebrow">Cuidado de tu cubierta</span><h2 id="footer-coverage-title">Canalones limpios.<br>Tejados cuidados.</h2><p>Encuentra tu municipio y consulta la limpieza, reparación o mantenimiento que necesita tu inmueble.</p></div><figure class="footer-map-panel"><div class="footer-map-topline"><span><i aria-hidden="true"></i>Mapa de cobertura</span><span class="footer-map-count">${provinces.length} provincias</span></div>${renderServiceAreaMap(provinces,{activeProvince})}<figcaption>Los puntos indican provincias con servicio.</figcaption></figure><nav class="footer-provinces" aria-label="Provincias donde damos servicio"><h3>Norte y centro de España</h3><div class="footer-province-grid">${provinceLinks}</div></nav></section>
<div class="footer-help"><nav class="footer-services" aria-label="Servicios de limpieza y reparación"><h2>¿Qué necesitas?</h2><div class="footer-service-links">${services.map(([name,href])=>`<a href="${href}">${escape(name)} <span aria-hidden="true">↗</span></a>`).join('')}</div><a class="footer-town-search" href="/#pueblos">Buscar mi pueblo <span aria-hidden="true">→</span></a></nav><div class="footer-regional-slot"><!-- regional-contact-slot --></div></div>
<div class="footer-bottom"><p>Limpieza y mantenimiento de cubiertas</p><div class="footer-legal-links">${legalLinks}</div></div>
</div></footer>`;
}
