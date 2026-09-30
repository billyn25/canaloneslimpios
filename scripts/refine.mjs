import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const slug = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const decode = value => String(value).replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
export const serviceNames = ['Limpieza de canalones','Limpieza de tejados','Desatasco de bajantes','Reparación de canalones','Sustitución de tejas rotas','Reparación de goteras','Impermeabilización','Revisión de chimeneas','Mantenimiento preventivo','Mallas antihojas','Revisión del sistema de evacuación'];
export const media = [
  {id:'trabajo-canalon',photo:'34006744',author:'Chris Shafer',source:'https://www.pexels.com/photo/construction-worker-installing-building-gutter-outdoors-34006744/',alt:'Operario trabajando en un canalón bajo el alero de una vivienda'},
  {id:'limpieza-canalon',photo:'35153375',author:'Revive Wash',source:'https://www.pexels.com/photo/efficient-residential-gutter-cleaning-service-35153375/',alt:'Limpieza real de un canalón residencial con agua a presión'}
];
export const remoteImage = (item, width) => `https://images.pexels.com/photos/${item.photo}/pexels-photo-${item.photo}.jpeg?auto=compress&cs=tinysrgb&fm=webp&w=${width}`;
const image = (item, eager=false) => `<img src="${escape(remoteImage(item,eager?1200:720))}" srcset="${escape(remoteImage(item,480))} 480w, ${escape(remoteImage(item,720))} 720w, ${escape(remoteImage(item,1200))} 1200w" sizes="(max-width: 820px) calc(100vw - 32px), 540px" alt="${escape(item.alt)}" width="${eager?1200:720}" height="${eager?1200:1080}" loading="${eager?'eager':'lazy'}" ${eager?'fetchpriority="high"':'decoding="async"'}>`;

function directContact(ctx){
  const place=ctx.town?.name||'';
  const where=place?` en ${escape(place)}`:'';
  const quickServices=['Limpieza de canalones','Canalón o bajante atascada','Gotera o filtración','Tejas rotas','Limpieza de tejado','Impermeabilización','Chimenea o remate','Otro problema'];
  return `<div class="contact-panel wa-panel"><div class="contact-copy"><span class="eyebrow">Pide presupuesto</span><h2>Cuéntanos lo mínimo y abre WhatsApp${where}</h2><p>Tres datos rápidos. El mensaje se prepara automáticamente para que solo tengas que revisarlo y enviarlo.</p></div><form class="wa-mini" data-wa-mini data-whatsapp="${escape(ctx.wa||'')}" data-province="${escape(ctx.province?.name||'')}"><label><span>Pueblo</span><input name="localidad" value="${escape(place)}" required maxlength="140" autocomplete="address-level2" placeholder="Tu localidad"></label><label><span>Qué necesitas</span><select name="servicio" required><option value="">Selecciona</option>${quickServices.map(s=>`<option>${escape(s)}</option>`).join('')}</select></label><label><span>Tipo de inmueble</span><select name="inmueble" required><option value="">Selecciona</option><option>Vivienda unifamiliar</option><option>Casa de pueblo o caserío</option><option>Comunidad de propietarios</option><option>Local o pequeño edificio</option><option>Nave o edificio industrial</option></select></label><button class="btn wa-submit" type="submit">Abrir WhatsApp</button></form><p class="wa-hint">Al abrir WhatsApp puedes adjuntar fotos del canalón o tejado tomadas desde un lugar seguro.</p>${ctx.phone&&ctx.tel?`<p class="contact-alt">¿Prefieres llamar? <a href="tel:${escape(ctx.tel)}"><strong>${escape(ctx.phone)}</strong></a></p>`:''}</div>`;
}

function includedWork(){
  return `<section class="section wrap" id="incluye"><span class="eyebrow">Qué se revisa</span><h2>Qué puede incluir una intervención de canalones y tejado</h2><p class="lead2">El alcance depende del problema y del acceso, pero estas son las comprobaciones habituales que ayudan a decidir si basta una limpieza o hace falta reparar.</p><div class="included-grid"><article><b>01</b><h3>Canalón y puntos de salida</h3><p>Retirada de hojas, barro y residuos accesibles, prestando atención a las zonas donde el agua entra en la bajante.</p></article><article><b>02</b><h3>Bajantes y codos</h3><p>Comprobación del paso del agua cuando hay síntomas de atasco o evacuación lenta.</p></article><article><b>03</b><h3>Juntas y fijaciones visibles</h3><p>Revisión de fugas, piezas sueltas, uniones y pequeños defectos que puedan explicar el goteo o el rebose.</p></article><article><b>04</b><h3>Cubierta cercana</h3><p>Si el problema apunta al tejado, se valoran tejas rotas, remates y encuentros accesibles antes de proponer una reparación.</p></article></div><p class="scope-note">Para una primera valoración por WhatsApp puede ayudar adjuntar dos o tres fotos tomadas desde un lugar seguro. No hace falta subir al tejado.</p></section>`;
}

function urgentLocal(ctx){
  if(!ctx.town)return '';
  const town=escape(ctx.town.name),province=escape(ctx.province?.name||'');
  return `<section class="section urgent-local"><div class="wrap urgent-local-grid"><div><span class="eyebrow">Urgencias 24 h</span><h2>Urgencias de canalones, goteras y tejados en ${town}</h2><p>Si aparece una entrada de agua, un rebose importante o una pieza de cubierta desplazada, puedes enviar el aviso indicando ${town}${province?', '+province:''}, el tipo de inmueble y lo que observas.</p><p>No hace falta conocer la causa ni subir a la cubierta. Si puedes, añade fotografías tomadas desde una zona segura.</p></div><div class="urgent-local-box"><strong>¿Qué conviene indicar?</strong><ul><li>Pueblo y tipo de inmueble</li><li>Dónde aparece el agua o el rebose</li><li>Si el problema está activo en ese momento</li><li>Fotos desde un lugar seguro, si las tienes</li></ul><a class="btn" href="#contacto">Avisar por WhatsApp</a></div></div></section>`;
}

function budget(ctx){
  const locality=ctx.town?' en '+escape(ctx.town.name):'';
  return `<section class="section soft" id="presupuesto"><div class="wrap"><span class="eyebrow">Presupuesto explicado</span><h2>¿Qué se valora antes de dar un precio${locality}?</h2><p class="lead2">Limpiar un tramo accesible no es lo mismo que desatascar una bajante alta o reparar una entrada de agua. Estos datos ayudan a delimitar el trabajo, sin dar por hecho lo que todavía no se ha revisado.</p><div class="factor-grid"><article><span>01</span><h3>Recorrido y alcance</h3><p>Tramos de canalón, bajantes afectadas y si se pide limpieza, reparación o ambas.</p></article><article><span>02</span><h3>Altura y acceso</h3><p>Plantas del edificio, patio o fachada y medios que puedan necesitarse para llegar.</p></article><article><span>03</span><h3>Material y estado</h3><p>Tipo de canalón o teja, uniones, fijaciones y deterioro que se pueda observar.</p></article><article><span>04</span><h3>Síntoma y frecuencia</h3><p>Rebose, fuga, atasco o gotera; cuándo aparece y si el problema ya se había repetido.</p></article></div><p class="scope-note">La consulta inicial no sustituye una inspección. Cualquier reparación adicional debe concretarse antes de ejecutarla.</p></div></section>`;
}
function properties(){
  return `<section class="section wrap" id="viviendas-comunidades"><span class="eyebrow">Cada edificio necesita un enfoque</span><h2>Viviendas, casas de pueblo y comunidades</h2><div class="property-grid property-grid-wide"><article><h3>Viviendas y caseríos</h3><p>Para preparar la visita conviene indicar el acceso a la parcela, los aleros afectados y si hay árboles cerca. No es necesario conocer la causa de la avería.</p></article><article><h3>Comunidades de propietarios</h3><p>Un contacto de la comunidad o de la administración de fincas puede reunir los avisos, identificar patios y bajantes afectados y coordinar el acceso a zonas comunes.</p></article><article><h3>Naves y pequeños edificios</h3><p>En cubiertas de mayor recorrido interesa indicar aproximadamente qué fachada o bajante da problemas y si el acceso se realiza desde patio, cubierta o exterior.</p></article><article><h3>Mantenimiento o aviso puntual</h3><p>Una incidencia concreta y una revisión periódica no tienen el mismo alcance. La frecuencia se plantea según el entorno y la acumulación observada, no con una pauta idéntica para todos.</p></article></div></section>`;
}
function gallery(){
  const photo=media[1];
  return `<section class="section visual-section" id="cubiertas"><div class="wrap roof-feature"><figure>${image(photo)}<figcaption>Fotografía de referencia · ${escape(photo.author)} / Pexels.</figcaption></figure><div><span class="eyebrow">Del canalón al encuentro de cubierta</span><h2>No toda gotera se soluciona limpiando</h2><p>Por eso diferenciamos la evacuación del agua de las pequeñas reparaciones del tejado.</p><div class="roof-detail"><h3>Tejas rotas o desplazadas</h3><p>Se valora una sustitución puntual y el estado de las piezas contiguas. No se presupone una reforma completa.</p></div><div class="roof-detail"><h3>Chimeneas y remates</h3><p>La revisión se centra en el encuentro exterior con la cubierta y su impermeabilización. No incluye deshollinado ni mantenimiento de conductos de combustión.</p></div><div class="roof-detail"><h3>Limpieza adaptada al material</h3><p>El método se decide después de valorar la superficie y su conservación. No se promete usar agua a presión en todos los tejados.</p></div><a class="text-link" href="#contacto">Consultar goteras →</a></div></div></section>`;
}
function townFinder(){return `<div class="town-finder"><label for="town-search">Busca tu pueblo</label><input id="town-search" type="search" placeholder="Escribe al menos dos letras" autocomplete="off" data-town-search aria-describedby="town-search-help" aria-controls="town-search-results"><p id="town-search-help">Puedes buscar sin tildes. Los listados por provincia siguen disponibles debajo.</p><p data-town-status role="status"></p><div id="town-search-results" class="town-results"></div></div>`;}
function finalSummary(ctx){
  const towns=ctx.towns.length,provinces=ctx.provinces.length,services=serviceNames.length;
  const provinceLinks=ctx.provinces.map(p=>`<a href="/${p.slug}/">${escape(p.name)}</a>`).join('');
  return `<section class="final-summary" id="resumen"><div class="wrap"><div class="summary-head"><span class="eyebrow">Cobertura y servicios</span><h2>Un servicio pensado para pueblos, viviendas y comunidades</h2><p>Busca tu localidad, elige el problema y abre WhatsApp con el aviso preparado.</p></div><div class="summary-stats"><article><strong>${towns.toLocaleString('es-ES')}</strong><span>municipios</span><small>Páginas locales enlazadas por provincia</small></article><article><strong>${provinces}</strong><span>provincias</span><small>Cobertura organizada y navegable</small></article><article><strong>${services}</strong><span>servicios</span><small>Canalones, tejados, goteras y más</small></article><article class="urgent-card"><span class="urgent-dot" aria-hidden="true"></span><strong>24 h</strong><span>urgencias</span><small>Goteras, reboses y avisos urgentes de cubierta</small><a href="#contacto">Consultar urgencia →</a></article></div><div class="summary-provinces">${provinceLinks}</div></div></section>`;
}


export function refine(html,ctx){
  if(html.includes('data-refined="1"'))throw Error('La fase de presentación ya se ha aplicado');
  const serviceHubMap={'/limpieza-canalones/':'Limpieza de canalones','/limpieza-tejados/':'Limpieza de tejados','/desatasco-bajantes/':'Desatasco de bajantes','/reparacion-goteras/':'Reparación de goteras','/impermeabilizacion-tejados/':'Impermeabilización de tejados'};const isHome=ctx.route==='/',is404=ctx.route==='/404.html',isLegal=['/aviso-legal/','/privacidad/','/cookies/'].includes(ctx.route),isServiceHub=Boolean(serviceHubMap[ctx.route]);
  let output=html.replace('<html lang="es">','<html lang="es" data-refined="1">').replaceAll('\\n<section','\n<section');
  output=output.replace('</head>','<link rel="stylesheet" href="/assets/refinement.css"></head>');
  output=output.replace('<body>','<body><a class="skip-link" href="#contenido">Saltar al contenido</a>').replace('<main','<main id="contenido"');
  output=output.replace('<nav class="nav">','<nav class="nav" aria-label="Navegación principal"><a href="/#pueblos">Pueblos</a>');
  const canonical=new URL(ctx.route,ctx.domain).href;
  let title=decode(output.match(/<title>([\s\S]*?)<\/title>/)?.[1]||'');
  let description=decode(output.match(/<meta name="description" content="([^"]+)"/)?.[1]||'');
  if(ctx.town){title=`Limpieza de canalones y tejados en ${ctx.town.name}, ${ctx.province.name}`;description=`Limpieza de canalones y tejados en ${ctx.town.name}, ${ctx.province.name}: bajantes, goteras, tejas rotas, impermeabilización y urgencias 24 h. Consulta presupuesto.`;}
  if(isHome)description='Limpieza de canalones y tejados, bajantes, tejas rotas, goteras y remates de chimeneas. Consulta tu pueblo y prepara el aviso para vivienda o comunidad.';
  output=output.replace(/<title>[\s\S]*?<\/title>/,`<title>${escape(title)}</title>`).replace(/<meta name="description" content="[^"]*">/,`<meta name="description" content="${escape(description)}">`).replace(/<link rel="canonical" href="[^"]+">/,`<link rel="canonical" href="${escape(canonical)}">`).replace(/<meta name="robots" content="[^"]+">/,`<meta name="robots" content="${ctx.prod&&!is404?'index,follow':'noindex,nofollow'}">`);
  for(const [key,value] of [['title',title],['description',description],['url',canonical]])output=output.replace(new RegExp(`<meta property="og:${key}" content="[^"]*">`),`<meta property="og:${key}" content="${escape(value)}">`);
  output=output.replace('</head>',`<meta property="og:type" content="website"><meta property="og:locale" content="es_ES"><meta property="og:image" content="${escape(remoteImage(media[0],1200))}"><meta name="twitter:card" content="summary_large_image"></head>`);
  const organization={'@type':'Organization','@id':new URL('/#organizacion',ctx.domain).href,name:'Limpieza Canalones y Tejados',url:new URL('/',ctx.domain).href};
  const graph=[organization,{'@type':'WebSite','@id':new URL('/#web',ctx.domain).href,url:new URL('/',ctx.domain).href,name:'Limpieza Canalones y Tejados',inLanguage:'es'},{'@type':ctx.province&&!ctx.town?'CollectionPage':'WebPage','@id':canonical+'#pagina',url:canonical,name:title,description,inLanguage:'es',isPartOf:{'@id':new URL('/#web',ctx.domain).href}}];
  if(!isHome&&!is404&&!isLegal){const parts=[{name:'Inicio',item:new URL('/',ctx.domain).href}];if(isServiceHub)parts.push({name:serviceHubMap[ctx.route],item:canonical});else{parts.push({name:ctx.province.name,item:new URL('/'+ctx.province.slug+'/',ctx.domain).href});if(ctx.town)parts.push({name:ctx.town.name,item:canonical});}graph.push({'@type':'BreadcrumbList',itemListElement:parts.map((x,i)=>({'@type':'ListItem',position:i+1,...x}))});}
  if(!is404&&!isLegal)graph.push({'@type':'Service',name:'Limpieza de canalones y mantenimiento de tejados',serviceType:serviceNames,provider:{'@id':organization['@id']},areaServed:ctx.province?{'@type':ctx.town?'Place':'AdministrativeArea',name:ctx.town?`${ctx.town.name}, ${ctx.province.name}`:ctx.province.name}:ctx.provinces.map(p=>({'@type':'AdministrativeArea',name:p.name}))});
  output=output.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/,`<script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@graph':graph}).replaceAll('<','\\u003c')}</script>`);
  if(is404||isLegal)return output;
  output=output.replace(/<article class="card"><b>([^<]+)<\/b><p>([\s\S]*?)<\/p><\/article>/g,(_,name,text)=>{const plain=decode(name),label=ctx.town?`${name} en ${escape(ctx.town.name)}`:name,hubHref={'Limpieza de canalones':'/limpieza-canalones/','Desatasco de bajantes':'/desatasco-bajantes/','Reparación de goteras':'/reparacion-goteras/','Impermeabilización':'/impermeabilizacion-tejados/'}[plain],href=isHome&&hubHref?hubHref:'#contacto',linkText=isHome&&hubHref?'Más información →':'Consultar este servicio →';return `<article class="card" id="servicio-${slug(plain)}"><h3>${label}</h3><p>${text}</p><a class="service-link" href="${href}">${linkText}</a></article>`});
  if(!output.includes('id="servicio-limpieza-de-tejados"')&&output.includes('<div class="services">')){const roofLabel=ctx.town?`Limpieza de tejados en ${escape(ctx.town.name)}`:'Limpieza de tejados',roofHref=isHome?'/limpieza-tejados/':'#contacto',roofText=isHome?'Más información →':'Consultar este servicio →';output=output.replace('<div class="services">',`<div class="services"><article class="card" id="servicio-limpieza-de-tejados"><h3>${roofLabel}</h3><p>Valoración de la suciedad y del método de limpieza adecuado a la cubierta, sin dar por válida la misma técnica para cualquier material.</p><a class="service-link" href="${roofHref}">${roofText}</a></article>`);}
  const contactSection=/<section class="section wrap" id="contacto">[\s\S]*?<\/section>/;
  if(isHome||ctx.town){if(!contactSection.test(output))throw Error('No se encuentra la sección de contacto: '+ctx.route);output=output.replace(contactSection,`<section class="section wrap" id="contacto">${directContact(ctx)}</section>`);}
  else output=output.replace('</main>',`<section class="section wrap" id="contacto">${directContact(ctx)}</section></main>`);
  if(isHome){
    output=output.replace(/<div class="hero-art"><img[^>]+><\/div>/,`<figure class="hero-art">${image(media[0],true)}<figcaption>Fotografía de referencia · ${escape(media[0].author)} / Pexels</figcaption></figure>`);
    const galleryPattern=/<section class="section visual-section">[\s\S]*?<\/section>/;
    if(!galleryPattern.test(output))throw Error('No se encuentra la galería inicial');
    output=output.replace(galleryPattern,gallery());
    output=output.replace('<div class="home-town-groups">',townFinder()+'<div class="home-town-groups">');
    output=output.replace('<section class="section wrap" id="contacto">',properties()+includedWork()+budget(ctx)+finalSummary(ctx)+'<section class="section wrap" id="contacto">');
    output=output.replace(/(<div class="home-town-links">)([\s\S]*?)(<\/div>)/g,(_,a,links,b)=>a+links.replace(/>Limpieza de canalones en /g,'>')+b);
    output=output.replace('<h2>Canalones, bajantes y pequeñas reparaciones de tejado</h2>','<h2>Canalones, bajantes y pequeñas reparaciones de tejado</h2><nav class="service-jumps" aria-label="Ir a un servicio"><a href="#servicio-limpieza-de-canalones">Canalones</a><a href="#servicio-limpieza-de-tejados">Tejados</a><a href="#servicio-desatasco-de-bajantes">Bajantes</a><a href="#servicio-reparacion-de-goteras">Goteras</a><a href="#servicio-revision-de-chimeneas">Chimeneas</a></nav>');
  }else if(ctx.town)output=output.replace('<section class="section wrap" id="contacto">',urgentLocal(ctx)+includedWork()+budget(ctx)+'<section class="section wrap" id="contacto">');
  output=output.replace('aria-label="cinco estrellas decorativas"','aria-hidden="true"');
  return output;
}

export function getTowns(site,data){return site.provinces.flatMap(p=>(data.groups[p.slug]||[]).map(t=>({...t,slug:slug(t.name),province:p.name,provinceSlug:p.slug,path:`/${p.slug}/${slug(t.name)}/`})))}
async function main(){
  const root='dist',site=JSON.parse(fs.readFileSync('config/site.json','utf8')),data=JSON.parse(fs.readFileSync('.cache/municipios.json','utf8')),manifest=JSON.parse(fs.readFileSync(root+'/manifest.json','utf8'));
  const towns=getTowns(site,data),prod=manifest.mode==='production',domain=prod?(process.env.SITE_DOMAIN||site.productionDomain):site.previewDomain,phone=prod?(process.env.SITE_PHONE||site.phone||''):'',tel=prod?(process.env.SITE_TEL||site.tel||''):'',wa=prod?(process.env.SITE_WHATSAPP||site.whatsapp||''):'';
  if(!/^https?:\/\//.test(domain||''))throw Error('Dominio de generación inválido');
  for(const file of ['refinement.css','site.js'])fs.copyFileSync('src/'+file,root+'/assets/'+file);
  const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
  const lookup=new Map(towns.map(t=>[t.path,t]));let count=0;
  for(const file of walk(root).filter(f=>f.endsWith('.html'))){const rel=path.relative(root,file).split(path.sep).join('/'),route=rel==='index.html'?'/':rel==='404.html'?'/404.html':'/'+rel.replace(/index\.html$/,'');const town=lookup.get(route),province=site.provinces.find(p=>route.startsWith('/'+p.slug+'/'));fs.writeFileSync(file,refine(fs.readFileSync(file,'utf8'),{route,town,province,towns,provinces:site.provinces,domain,prod,phone,tel,wa}));count++;}
  fs.writeFileSync(root+'/assets/towns.json',JSON.stringify(towns.map(({name,province,path})=>({name,province,path}))));
  fs.writeFileSync(root+'/media-sources.json',JSON.stringify(media,null,2));
  // Crawling must be allowed for crawlers to read the preview noindex directives.
  fs.writeFileSync(root+'/robots.txt',prod?`User-agent: *\nAllow: /\n\nSitemap: ${new URL('/sitemap.xml',domain).href}\n`:'User-agent: *\nAllow: /\n');
  fs.writeFileSync(root+'/_headers',(prod?'/404.html\n  X-Robots-Tag: noindex, nofollow\n':'/*\n  X-Robots-Tag: noindex, nofollow\n'));
  fs.writeFileSync(root+'/presentation-manifest.json',JSON.stringify({pages:count,searchableTowns:towns.length,media:media.map(x=>({id:x.id,source:x.source,delivery:'external CDN'})),production:prod},null,2));
  console.log(`PRESENTACIÓN OK: ${count} HTML; buscador con ${towns.length} municipios; mini WhatsApp, resumen final, legales, fotografías y breadcrumbs.`);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href)main().catch(error=>{console.error(error);process.exitCode=1});
