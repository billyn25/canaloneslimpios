import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const slug = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const decode = value => String(value).replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
export const serviceNames = ['Limpieza de canalones','Limpieza de tejados','Desatasco de bajantes','Reparación de canalones','Sustitución de tejas rotas','Reparación de goteras','Impermeabilización','Revisión de chimeneas','Mantenimiento preventivo','Mallas antihojas','Revisión del sistema de evacuación'];
export const media = [
  {id:'trabajo-canalon',photo:'34006744',author:'Chris Shafer',source:'https://www.pexels.com/photo/construction-worker-installing-building-gutter-outdoors-34006744/',alt:'Operario trabajando en un canalón bajo el alero de una vivienda'}
];
export const remoteImage = (item, width) => `https://images.pexels.com/photos/${item.photo}/pexels-photo-${item.photo}.jpeg?auto=compress&cs=tinysrgb&fm=webp&w=${width}`;
const image = (item, eager=false) => `<img src="${escape(remoteImage(item,eager?1200:720))}" srcset="${escape(remoteImage(item,480))} 480w, ${escape(remoteImage(item,720))} 720w, ${escape(remoteImage(item,1200))} 1200w" sizes="(max-width: 820px) calc(100vw - 32px), 540px" alt="${escape(item.alt)}" width="${eager?1200:720}" height="${eager?1200:1080}" loading="${eager?'eager':'lazy'}" ${eager?'fetchpriority="high"':'decoding="async"'}>`;

function quoteForm(ctx){
  const place=ctx.town?.name||'';
  return `<div class="quote-layout"><div><span class="eyebrow">Preparar una consulta</span><h2>Cuéntanos el problema${place?' en '+escape(place):''}</h2><p>Localidad, tipo de inmueble y lo que observas. No hace falta subir al tejado ni tomar medidas en altura para empezar.</p><p class="quote-note">Las fotos, cuando sean necesarias, deben tomarse desde un lugar seguro. La valoración final depende del estado y del acceso.</p></div><form class="quote-form" data-enquiry data-whatsapp="${escape(ctx.wa||'')}" data-province="${escape(ctx.province?.name||'')}" id="consulta-guiada"><div class="quote-fields"><label>Localidad<input name="localidad" value="${escape(place)}" required maxlength="140" autocomplete="address-level2" placeholder="Tu pueblo o municipio"></label><label>Tipo de inmueble<select name="inmueble" required><option value="">Selecciona una opción</option><option>Vivienda unifamiliar</option><option>Caserío o casa de pueblo</option><option>Comunidad de propietarios</option><option>Local o pequeño edificio</option></select></label><label>Servicio<select name="servicio" required><option value="">¿Qué necesitas revisar?</option>${serviceNames.map(s=>`<option>${escape(s)}</option>`).join('')}</select></label><label>Altura aproximada<select name="altura"><option>No lo sé / por valorar</option><option>Una planta</option><option>Dos plantas</option><option>Tres o más plantas</option></select></label></div><label>¿Qué ocurre?<textarea name="problema" rows="3" maxlength="1200" placeholder="Por ejemplo: rebosa cuando llueve o gotea junto a la chimenea"></textarea></label><button class="btn" type="submit">${ctx.wa?'Preparar mensaje para WhatsApp':'Preparar consulta'}</button><p class="form-disclosure">${ctx.wa?'Se abrirá WhatsApp para que revises y envíes el mensaje. Este formulario no lo envía ni lo almacena.':'Puedes preparar el texto de la consulta. No se envía ni se almacena desde este formulario.'}</p><div class="quote-result" hidden><label>Resumen de tu consulta<textarea readonly rows="7" aria-label="Resumen de tu consulta"></textarea></label><p role="status"></p></div><noscript><p>Para preparar el mensaje guiado hace falta JavaScript. ${ctx.wa?'También puedes usar los enlaces de teléfono y WhatsApp de la página.':'El contacto comercial todavía está pendiente de activar.'}</p></noscript></form></div>`;
}

function budget(ctx){
  const locality=ctx.town?' en '+escape(ctx.town.name):'';
  return `<section class="section soft" id="presupuesto"><div class="wrap"><span class="eyebrow">Presupuesto explicado</span><h2>¿Qué se valora antes de dar un precio${locality}?</h2><p class="lead2">Limpiar un tramo accesible no es lo mismo que desatascar una bajante alta o reparar una entrada de agua. Estos datos ayudan a delimitar el trabajo, sin dar por hecho lo que todavía no se ha revisado.</p><div class="factor-grid"><article><span>01</span><h3>Recorrido y alcance</h3><p>Tramos de canalón, bajantes afectadas y si se pide limpieza, reparación o ambas.</p></article><article><span>02</span><h3>Altura y acceso</h3><p>Plantas del edificio, patio o fachada y medios que puedan necesitarse para llegar.</p></article><article><span>03</span><h3>Material y estado</h3><p>Tipo de canalón o teja, uniones, fijaciones y deterioro que se pueda observar.</p></article><article><span>04</span><h3>Síntoma y frecuencia</h3><p>Rebose, fuga, atasco o gotera; cuándo aparece y si el problema ya se había repetido.</p></article></div><p class="scope-note">La consulta inicial no sustituye una inspección. Cualquier reparación adicional debe concretarse antes de ejecutarla.</p></div></section>`;
}
function properties(){
  return `<section class="section wrap" id="viviendas-comunidades"><span class="eyebrow">Cada edificio necesita un enfoque</span><h2>Viviendas, casas de pueblo y comunidades</h2><div class="property-grid"><article><h3>Viviendas y caseríos</h3><p>Para preparar la visita conviene indicar el acceso a la parcela, los aleros afectados y si hay árboles cerca. No es necesario conocer la causa de la avería.</p></article><article><h3>Comunidades de propietarios</h3><p>Un contacto de la comunidad o de la administración de fincas puede reunir los avisos, identificar patios y bajantes afectados y coordinar el acceso a zonas comunes.</p></article><article><h3>Mantenimiento o aviso puntual</h3><p>Una incidencia concreta y una revisión periódica no tienen el mismo alcance. La frecuencia se plantea según el entorno y la acumulación observada, no con una pauta idéntica para todos.</p></article></div></section>`;
}
function gallery(){
  const photo=media[0];
  return `<section class="section visual-section" id="cubiertas"><div class="wrap roof-feature"><figure>${image(photo)}<figcaption>Fotografía de referencia · ${escape(photo.author)} / Pexels.</figcaption></figure><div><span class="eyebrow">Del canalón al encuentro de cubierta</span><h2>No toda gotera se soluciona limpiando</h2><p>Por eso diferenciamos la evacuación del agua de las pequeñas reparaciones del tejado.</p><div class="roof-detail"><h3>Tejas rotas o desplazadas</h3><p>Se valora una sustitución puntual y el estado de las piezas contiguas. No se presupone una reforma completa.</p></div><div class="roof-detail"><h3>Chimeneas y remates</h3><p>La revisión se centra en el encuentro exterior con la cubierta y su impermeabilización. No incluye deshollinado ni mantenimiento de conductos de combustión.</p></div><div class="roof-detail"><h3>Limpieza adaptada al material</h3><p>El método se decide después de valorar la superficie y su conservación. No se promete usar agua a presión en todos los tejados.</p></div><a class="text-link" href="#contacto" data-service="Reparación de goteras">Preparar una consulta sobre goteras →</a></div></div></section>`;
}
function townFinder(){return `<div class="town-finder"><label for="town-search">Busca tu pueblo</label><input id="town-search" type="search" placeholder="Escribe al menos dos letras" autocomplete="off" data-town-search aria-describedby="town-search-help" aria-controls="town-search-results"><p id="town-search-help">Puedes buscar sin tildes. Los listados por provincia siguen disponibles debajo.</p><p data-town-status role="status"></p><div id="town-search-results" class="town-results"></div></div>`;}


export function refine(html,ctx){
  if(html.includes('data-refined="1"'))throw Error('La fase de presentación ya se ha aplicado');
  const isHome=ctx.route==='/',is404=ctx.route==='/404.html';
  let output=html.replace('<html lang="es">','<html lang="es" data-refined="1">').replaceAll('\\n<section','\n<section');
  output=output.replace('</head>','<link rel="stylesheet" href="/assets/refinement.css"></head>');
  output=output.replace('<body>','<body><a class="skip-link" href="#contenido">Saltar al contenido</a>').replace('<main','<main id="contenido"');
  output=output.replace('<nav class="nav">','<nav class="nav" aria-label="Navegación principal"><a href="/#pueblos">Pueblos</a>');
  const canonical=new URL(ctx.route,ctx.domain).href;
  let title=decode(output.match(/<title>([\s\S]*?)<\/title>/)?.[1]||'');
  let description=decode(output.match(/<meta name="description" content="([^"]+)"/)?.[1]||'');
  if(ctx.town){title=`Limpieza de canalones en ${ctx.town.name}, ${ctx.province.name}`;description=`Canalones y tejados en ${ctx.town.name}, ${ctx.province.name}: limpieza, bajantes, tejas rotas, goteras y remates de chimeneas. Consulta acceso y presupuesto.`;}
  if(isHome)description='Limpieza de canalones y tejados, bajantes, tejas rotas, goteras y remates de chimeneas. Consulta tu pueblo y prepara el aviso para vivienda o comunidad.';
  output=output.replace(/<title>[\s\S]*?<\/title>/,`<title>${escape(title)}</title>`).replace(/<meta name="description" content="[^"]*">/,`<meta name="description" content="${escape(description)}">`).replace(/<link rel="canonical" href="[^"]+">/,`<link rel="canonical" href="${escape(canonical)}">`).replace(/<meta name="robots" content="[^"]+">/,`<meta name="robots" content="${ctx.prod&&!is404?'index,follow':'noindex,nofollow'}">`);
  for(const [key,value] of [['title',title],['description',description],['url',canonical]])output=output.replace(new RegExp(`<meta property="og:${key}" content="[^"]*">`),`<meta property="og:${key}" content="${escape(value)}">`);
  output=output.replace('</head>',`<meta property="og:type" content="website"><meta property="og:locale" content="es_ES"><meta property="og:image" content="${escape(remoteImage(media[0],1200))}"><meta name="twitter:card" content="summary_large_image"></head>`);
  const organization={'@type':'Organization','@id':new URL('/#organizacion',ctx.domain).href,name:'Canalones Limpios',url:new URL('/',ctx.domain).href};
  const graph=[organization,{'@type':'WebSite','@id':new URL('/#web',ctx.domain).href,url:new URL('/',ctx.domain).href,name:'Canalones Limpios',inLanguage:'es'},{'@type':ctx.province&&!ctx.town?'CollectionPage':'WebPage','@id':canonical+'#pagina',url:canonical,name:title,description,inLanguage:'es',isPartOf:{'@id':new URL('/#web',ctx.domain).href}}];
  if(!isHome&&!is404){const parts=[{name:'Inicio',item:new URL('/',ctx.domain).href},{name:ctx.province.name,item:new URL('/'+ctx.province.slug+'/',ctx.domain).href}];if(ctx.town)parts.push({name:ctx.town.name,item:canonical});graph.push({'@type':'BreadcrumbList',itemListElement:parts.map((x,i)=>({'@type':'ListItem',position:i+1,...x}))});}
  if(!is404)graph.push({'@type':'Service',name:'Limpieza de canalones y mantenimiento de tejados',serviceType:serviceNames,provider:{'@id':organization['@id']},areaServed:ctx.province?{'@type':ctx.town?'Place':'AdministrativeArea',name:ctx.town?`${ctx.town.name}, ${ctx.province.name}`:ctx.province.name}:ctx.provinces.map(p=>({'@type':'AdministrativeArea',name:p.name}))});
  output=output.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/,`<script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@graph':graph}).replaceAll('<','\\u003c')}</script>`);
  if(is404)return output;
  output=output.replace(/<article class="card"><b>([^<]+)<\/b><p>([\s\S]*?)<\/p><\/article>/g,(_,name,text)=>`<article class="card" id="servicio-${slug(decode(name))}"><h3>${name}</h3><p>${text}</p><a class="service-link" href="#contacto" data-service="${escape(decode(name))}">Consultar este servicio →</a></article>`);
  if(!output.includes('id="servicio-limpieza-de-tejados"')&&output.includes('<div class="services">'))output=output.replace('<div class="services">','<div class="services"><article class="card" id="servicio-limpieza-de-tejados"><h3>Limpieza de tejados</h3><p>Valoración de la suciedad y del método de limpieza adecuado a la cubierta, sin dar por válida la misma técnica para cualquier material.</p><a class="service-link" href="#contacto" data-service="Limpieza de tejados">Consultar este servicio →</a></article>');
  const contactSection=/<section class="section wrap" id="contacto">[\s\S]*?<\/section>/;
  if(isHome||ctx.town){if(!contactSection.test(output))throw Error('No se encuentra la sección de contacto: '+ctx.route);output=output.replace(contactSection,`<section class="section wrap" id="contacto">${quoteForm(ctx)}</section>`);}
  else output=output.replace('</main>',`<section class="section wrap" id="contacto">${quoteForm(ctx)}</section></main>`);
  output=output.replace(/href="(https:\/\/wa\.me\/\d+)"/g,(_,base)=>`href="${escape(base+'?text='+encodeURIComponent('Hola, quiero consultar un servicio de canalones o tejados'+(ctx.town?' en '+ctx.town.name+', '+ctx.province.name:ctx.province?' en '+ctx.province.name:''))) }"`);
  if(isHome){
    output=output.replace(/<div class="hero-art"><img[^>]+><\/div>/,`<figure class="hero-art">${image(media[0],true)}<figcaption>Fotografía de referencia · ${escape(media[0].author)} / Pexels</figcaption></figure>`);
    const galleryPattern=/<section class="section visual-section">[\s\S]*?<\/section>/;
    if(!galleryPattern.test(output))throw Error('No se encuentra la galería inicial');
    output=output.replace(galleryPattern,gallery());
    output=output.replace('<div class="home-town-groups">',townFinder()+'<div class="home-town-groups">');
    output=output.replace('<section class="section wrap" id="contacto">',properties()+budget(ctx)+'<section class="section wrap" id="contacto">');
    output=output.replace(/(<div class="home-town-links">)([\s\S]*?)(<\/div>)/g,(_,a,links,b)=>a+links.replace(/>Limpieza de canalones en /g,'>')+b);
    output=output.replace('<h2>Canalones, bajantes y pequeñas reparaciones de tejado</h2>','<h2>Canalones, bajantes y pequeñas reparaciones de tejado</h2><nav class="service-jumps" aria-label="Ir a un servicio"><a href="#servicio-limpieza-de-canalones">Canalones</a><a href="#servicio-limpieza-de-tejados">Tejados</a><a href="#servicio-desatasco-de-bajantes">Bajantes</a><a href="#servicio-reparacion-de-goteras">Goteras</a><a href="#servicio-revision-de-chimeneas">Chimeneas</a></nav>');
  }else if(ctx.town)output=output.replace('<section class="section wrap" id="contacto">',budget(ctx)+'<section class="section wrap" id="contacto">');
  output=output.replace('aria-label="cinco estrellas decorativas"','aria-hidden="true"');
  return output;
}

export function getTowns(site,data){return site.provinces.flatMap(p=>(data.groups[p.slug]||[]).map(t=>({...t,slug:slug(t.name),province:p.name,provinceSlug:p.slug,path:`/${p.slug}/${slug(t.name)}/`})))}
async function main(){
  const root='dist',site=JSON.parse(fs.readFileSync('config/site.json','utf8')),data=JSON.parse(fs.readFileSync('.cache/municipios.json','utf8')),manifest=JSON.parse(fs.readFileSync(root+'/manifest.json','utf8'));
  const towns=getTowns(site,data),prod=manifest.mode==='production',domain=prod?process.env.SITE_DOMAIN:site.previewDomain,wa=prod?process.env.SITE_WHATSAPP:'';
  if(!/^https?:\/\//.test(domain||''))throw Error('Dominio de generación inválido');
  for(const file of ['refinement.css','site.js'])fs.copyFileSync('src/'+file,root+'/assets/'+file);
  const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
  const lookup=new Map(towns.map(t=>[t.path,t]));let count=0;
  for(const file of walk(root).filter(f=>f.endsWith('.html'))){const rel=path.relative(root,file).split(path.sep).join('/'),route=rel==='index.html'?'/':rel==='404.html'?'/404.html':'/'+rel.replace(/index\.html$/,'');const town=lookup.get(route),province=site.provinces.find(p=>route.startsWith('/'+p.slug+'/'));fs.writeFileSync(file,refine(fs.readFileSync(file,'utf8'),{route,town,province,towns,provinces:site.provinces,domain,prod,wa}));count++;}
  fs.writeFileSync(root+'/assets/towns.json',JSON.stringify(towns.map(({name,province,path})=>({name,province,path}))));
  fs.writeFileSync(root+'/media-sources.json',JSON.stringify(media,null,2));
  // Crawling must be allowed for crawlers to read the preview noindex directives.
  fs.writeFileSync(root+'/robots.txt',prod?`User-agent: *\nAllow: /\n\nSitemap: ${new URL('/sitemap.xml',domain).href}\n`:'User-agent: *\nAllow: /\n');
  fs.writeFileSync(root+'/_headers',(prod?'/404.html\n  X-Robots-Tag: noindex, nofollow\n':'/*\n  X-Robots-Tag: noindex, nofollow\n'));
  fs.writeFileSync(root+'/presentation-manifest.json',JSON.stringify({pages:count,searchableTowns:towns.length,media:media.map(x=>({id:x.id,source:x.source,delivery:'external CDN'})),production:prod},null,2));
  console.log(`PRESENTACIÓN OK: ${count} HTML; buscador con ${towns.length} municipios; contacto guiado, presupuesto, fotografías y breadcrumbs. Fotos: CDN externo de Pexels.`);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href)main().catch(error=>{console.error(error);process.exitCode=1});
