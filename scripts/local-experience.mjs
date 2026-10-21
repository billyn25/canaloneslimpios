import {localGuides} from '../content/local-guides.mjs';
import {propertyDetails,materialDetails,serviceDetails} from '../content/local-details.mjs';

const E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const slug=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const hash=value=>{let n=2166136261;for(const c of value){n^=c.charCodeAt(0);n=Math.imul(n,16777619)}n^=n>>>16;n=Math.imul(n,0x85ebca6b);n^=n>>>13;n=Math.imul(n,0xc2b2ae35);return (n^(n>>>16))>>>0};
const choose=(items,key)=>items[hash(key)%items.length];

export const localPhotos={
  'leaves-gutter':{alt:'Ejemplo ilustrativo de un canalón obstruido por hojas húmedas y barro',caption:'Las hojas pueden cerrar la salida del agua aunque otros tramos parezcan despejados.',title:'Hojas acumuladas y agua retenida'},
  'ceiling-leak':{alt:'Ejemplo ilustrativo de una mancha de gotera y pintura desprendida en un techo',caption:'La mancha interior orienta la revisión, pero no identifica por sí sola el punto de entrada.',title:'Goteras y manchas en el techo'},
  'leaking-joint':{alt:'Ejemplo ilustrativo de gotas de agua en una unión del canalón',caption:'Un goteo en una junta necesita distinguirse del agua que rebosa por el borde.',title:'Fugas en las juntas del canalón'}
};

export function localPhoto(id,eager=false){
  const p=localPhotos[id];
  return `<figure class="problem-photo"><img src="/assets/photos/${id}.webp" srcset="/assets/photos/${id}-640.webp 640w, /assets/photos/${id}.webp 1200w" sizes="(max-width: 820px) calc(100vw - 32px), 560px" width="1200" height="800" alt="${E(p.alt)}" loading="${eager?'eager':'lazy'}" ${eager?'fetchpriority="high"':'decoding="async"'}><figcaption><strong>${E(p.title)}</strong><span>${E(p.caption)}</span><small>Imagen ilustrativa creada con IA.</small></figcaption></figure>`;
}

// Stable editorial selection. No random rebuilds, geographic claims or claimed local jobs.
export function localProfile(t,p){
  const key=`${p.slug}/${t.slug||slug(t.name)}`;
  const gutter=choose(localGuides.filter(g=>g.category==='gutter'),key+':gutter');
  const roof=choose(localGuides.filter(g=>g.category==='roof'),key+':roof');
  const extra=choose(localGuides.filter(g=>g.id!==gutter.id&&g.id!==roof.id),key+':extra');
  const property=choose(propertyDetails,key+':property');
  const material=choose(materialDetails,key+':material');
  const guides=[gutter,roof,extra];
  const primaryPhoto=gutter.photo==='leaking-joint'?'leaking-joint':'leaves-gutter';
  const intro=[
    `¿El agua rebosa por el alero o aparece una mancha en el techo? Consulta limpieza de canalones, bajantes y revisión de goteras en ${t.name}. Explica dónde ocurre para orientar la visita.`,
    `Para limpiar o reparar canalones en ${t.name}, primero diferenciamos la suciedad que frena el agua de una fuga o una filtración de cubierta. Aquí tienes síntomas que ayudan a preparar la consulta.`,
    `Hojas acumuladas, uniones que gotean y humedad interior requieren comprobaciones distintas. Solicita servicio de canalones y tejados en ${t.name} indicando el problema que observas.`,
    `La revisión del canalón y del tejado en ${t.name} empieza por el recorrido del agua: dónde se retiene, por dónde sale y cuándo aparece la humedad. Puedes enviar fotos desde un lugar seguro.`,
    `Si buscas mantenimiento de canalones en ${t.name}, indica el acceso y los antecedentes de atasco. Si ya existe una gotera, conviene valorar también cubierta, encuentros y remates.`,
    `Un canalón aparentemente limpio puede seguir evacuando mal. Consulta desatasco, limpieza y reparación en ${t.name}, con una valoración del síntoma antes de decidir qué piezas intervenir.`,
    `Para una vivienda, una comunidad o un local en ${t.name}, el alcance depende del acceso y de la avería. Revisa estos ejemplos de obstrucciones y goteras para explicar mejor tu aviso.`,
    `¿El problema vuelve después de limpiar o sellar? En la consulta de canalones y tejados en ${t.name} interesa conocer qué se hizo antes y si el agua aparece siempre en el mismo punto.`
  ][hash(key+':intro')%8];
  return {key,gutter,roof,extra,guides,property,material,primaryPhoto,intro};
}

export function localDescription(t,p){
  const {gutter,roof}=localProfile(t,p);
  return `Limpieza de canalones y tejados en ${t.name}, ${p.name}. ${gutter.title}. ${roof.title}. Consulta limpieza, revisión o reparación.`;
}

function guideArticle(g,index){
  return `<article class="diagnosis-card" id="caso-${E(g.id)}"><span class="case-number">0${index+1} · ${g.category==='roof'?'Cubierta y goteras':'Canalones y bajantes'}</span><h3>${E(g.title)}</h3><p class="case-summary">${E(g.summary)}</p><p>${E(g.diagnosis)}</p><h4>Qué conviene comprobar</h4><ul>${g.checks.map(c=>`<li>${E(c)}</li>`).join('')}</ul><p class="case-action">${E(g.action)}</p></article>`;
}

function serviceCards(profile,t){
  const priorities=profile.primaryPhoto==='leaking-joint'?['Reparación de canalones','Revisión del sistema de evacuación','Reparación de goteras']:['Limpieza de canalones','Desatasco de bajantes','Reparación de goteras'];
  const rank=s=>priorities.includes(s.name)?priorities.indexOf(s.name):-1;
  const order=[...serviceDetails].sort((a,b)=>{const ar=rank(a),br=rank(b);if(ar>=0||br>=0)return (ar<0?99:ar)-(br<0?99:br);return hash(profile.key+':order:'+a.name)-hash(profile.key+':order:'+b.name)});
  const hub={'Limpieza de canalones':'/limpieza-canalones/','Limpieza de tejados':'/limpieza-tejados/','Desatasco de bajantes':'/desatasco-bajantes/','Reparación de goteras':'/reparacion-goteras/','Impermeabilización':'/impermeabilizacion-tejados/'};
  return `<div class="services local-services">${order.map(s=>`<article class="card" id="servicio-${slug(s.name)}"><h3>${E(s.name)} en ${E(t.name)}</h3><p>${E(choose(s.variants,profile.key+':service:'+s.name))}</p><a class="service-link" href="${hub[s.name]||'#contacto'}">${hub[s.name]?'Ver en qué consiste →':'Consultar este servicio →'}</a></article>`).join('')}</div>`;
}

export function localMain(t,p,{contact,related,district=false}){
  const q=localProfile(t,p),where=E(t.name);
  const districtNote=district?`<p class="local-coverage-note">Esta página describe cobertura en ${where} y no representa una oficina física.${t.alias?' También puedes encontrar este distrito como '+E(t.alias)+'.':''} La disponibilidad y el desplazamiento se confirman al contactar.</p>`:'';
  const secondPhoto=q.primaryPhoto==='leaves-gutter'?'ceiling-leak':'leaves-gutter';
  const otherPhotos=[secondPhoto,...(secondPhoto==='leaves-gutter'?['ceiling-leak']:q.extra.photo==='leaking-joint'?['leaking-joint']:[])];
  const photoGrid=otherPhotos.length===1?' single-photo':'';
  const roofIntro=[
    'Una mancha interior puede estar alejada de la entrada de agua. Por eso se relaciona el síntoma con el recorrido por la cubierta antes de decidir si corresponde limpiar, reparar una pieza o revisar un encuentro.',
    'Si el agua sale fuera del canalón, se revisa la evacuación; si aparece dentro del inmueble, también hay que estudiar la cubierta. Los dos problemas pueden coexistir y no siempre tienen la misma solución.',
    'Retirar hojas ayuda cuando obstruyen el paso del agua. Si la humedad continúa con la evacuación despejada, conviene comprobar tejas y remates en lugar de repetir una limpieza sin revisar la causa.',
    'La conservación de la cubierta y el funcionamiento de las bajantes se valoran por separado. El lugar de la mancha, la intensidad de la lluvia y los antecedentes aportan pistas para delimitar el trabajo.'
  ][hash(q.key+':roofIntro')%4];
  const faq=[...q.guides.map(g=>({question:g.question,answer:g.answer})),q.property];
  return `<div class="wrap crumbs"><a href="/">Inicio</a> → <a href="/${p.slug}/">${E(p.name)}</a> → ${where}</div>
<section class="local-hero local-photo-hero" data-local-profile="${E(q.guides.map(g=>g.id).join(','))}"><div class="wrap local-hero-grid"><div><span class="eyebrow">${district?'Madrid capital · Distrito de':'Servicio en'} ${where}</span><h1>Limpieza de canalones en ${where}</h1><p class="lead2">${E(q.intro)}</p>${contact}${districtNote}<div class="trustline local"><span class="stars" aria-hidden="true">★★★★★</span><span>Trato directo con el técnico profesional.</span></div><nav class="local-jumps" aria-label="Consultar el problema"><a href="#diagnostico">Qué puede estar pasando</a><a href="#servicios-locales">Servicios</a><a href="#contacto">Pedir presupuesto</a></nav></div>${localPhoto(q.primaryPhoto,true)}</div></section>
<section class="section wrap" id="diagnostico"><span class="eyebrow">Síntomas y comprobaciones</span><h2>Antes de limpiar o reparar en ${where}</h2><p class="lead2">Estos supuestos ayudan a describir el aviso. La causa y el alcance se confirman al revisar el inmueble.</p><div class="diagnosis-grid">${q.guides.map(guideArticle).join('')}</div></section>
<section class="section soft"><div class="wrap"><div class="local-roof-intro"><span class="eyebrow">Del canalón al techo interior</span><h2>Limpieza de tejados y canalones en ${where}</h2><p class="lead2">${E(roofIntro)}</p></div><div class="problem-photo-grid${photoGrid}">${otherPhotos.map(id=>localPhoto(id)).join('')}<div class="material-note"><span class="eyebrow">Material y conservación</span><h3>${E(q.material.title)}</h3><p>${E(q.material.text)}</p><a class="text-link" href="/reparacion-goteras/">Cómo se revisa una gotera →</a></div></div></div></section>
<section class="section wrap" id="servicios-locales"><span class="eyebrow">Limpieza, revisión y reparación</span><h2>Servicios de canalones y tejados en ${where}</h2>${serviceCards(q,t)}</section>
<section class="section soft" id="mantenimiento-local"><div class="wrap maintenance-grid"><div><span class="eyebrow">Preparar la visita</span><h2>${E(q.property.title)}</h2><p>${E(q.property.text)}</p></div><div class="maintenance-note"><h3>Después de la intervención</h3><p>${E(q.gutter.prevention)}</p><p>${E(q.roof.prevention)}</p></div></div></section>
<section class="section wrap"><h2>Preguntas frecuentes sobre canalones en ${where}</h2><div class="faq">${faq.map(f=>`<details><summary>${E(f.question)}</summary><p>${E(f.answer)}</p></details>`).join('')}</div></section>
<section class="section soft"><div class="wrap"><h2>${district?'Otros distritos de Madrid capital':'Otros municipios de '+E(p.name)}</h2><div class="towns">${related}</div><p><a href="/${p.slug}/"><strong>Ver ${district?'Madrid y sus municipios':'todos los municipios de '+E(p.name)} →</strong></a></p></div></section>
<section class="section wrap" id="contacto"><h2>Consulta limpieza o reparación en ${where}</h2>${contact}</section>`;
}

export function localFollowup(ctx){
  const q=localProfile(ctx.town,ctx.province),town=E(ctx.town.name);
  const notes=[q.gutter,q.roof,q.extra];
  return `<section class="section urgent-local"><div class="wrap urgent-local-grid"><div><span class="eyebrow">Urgencias 24 horas</span><h2>Urgencias de canalones, goteras y tejados en ${town}</h2><p>${E(q.extra.quoteHint)} Indica si el problema está activo y dónde aparece el agua.</p><p>Consulta la disponibilidad y el acceso para organizar la visita en ${town}.</p></div><div class="urgent-local-box"><strong>Fotos y aviso desde un lugar seguro</strong><p>No necesitas subir al tejado. Una imagen general del inmueble y otra del síntoma ayudan a preparar la consulta.</p><a class="btn" href="#contacto">Preparar aviso por WhatsApp</a></div></div></section>
<section class="section wrap" id="presupuesto"><span class="eyebrow">Alcance del trabajo</span><h2>Datos para valorar el presupuesto en ${town}</h2><div class="local-budget-grid">${notes.map(g=>`<article><h3>${E(g.title)}</h3><p>${E(g.quoteHint)}</p></article>`).join('')}</div><p class="scope-note">Se confirma el acceso, el material y el alcance antes de presupuestar. Si se detecta otra reparación, se explica por separado.</p></section>`;
}

export function homeProblemGallery(){
  return `<section class="section visual-section home-problem-gallery" id="goteras-y-atascos"><div class="wrap"><span class="eyebrow">Reconoce el síntoma</span><h2>Hojas en el canalón, juntas que gotean y manchas de gotera</h2><p class="lead2">Una obstrucción frena la evacuación; una unión puede perder agua; una mancha interior requiere localizar el origen. Estas imágenes ilustran tres situaciones que conviene distinguir.</p><div class="home-problem-grid">${Object.keys(localPhotos).map(id=>localPhoto(id)).join('')}</div><a class="text-link" href="#pueblos">Consultar limpieza o reparación en mi pueblo →</a></div></section>`;
}
