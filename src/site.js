const normalize=value=>String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('es').trim();
const motion=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth';
document.addEventListener('click',event=>{
  const anchor=event.target.closest('a');if(!anchor)return;
  const href=anchor.getAttribute('href')||'';
  if(!href.startsWith('#')||href.length<2)return;
  let target;try{target=document.getElementById(decodeURIComponent(href.slice(1)))}catch{return}
  if(target){event.preventDefault();target.scrollIntoView({behavior:motion(),block:'start'});}
});

for(const form of document.querySelectorAll('[data-wa-mini]')){
  form.addEventListener('submit',event=>{
    event.preventDefault();if(!form.reportValidity())return;
    const data=new FormData(form);
    const town=String(data.get('localidad')||'').trim();
    const province=form.dataset.province||'';
    const service=String(data.get('servicio')||'').trim();
    const property=String(data.get('inmueble')||'').trim();
    const message=['Hola, quiero pedir presupuesto en Limpieza Canalones y Tejados.',`Localidad: ${town}${province?', '+province:''}`,`Servicio: ${service}`,`Inmueble: ${property}`].join('\n');
    const number=String(form.dataset.whatsapp||'').replace(/\D/g,'');
    const url=number?`https://wa.me/${number}?text=${encodeURIComponent(message)}`:`https://wa.me/?text=${encodeURIComponent(message)}`;
    window.location.assign(url);
  });
}

const finder=document.querySelector('[data-town-search]');
if(finder){
  const results=document.getElementById('town-search-results'),status=document.querySelector('[data-town-status]');let timer,sequence=0,cached;
  const load=()=>cached||(cached=fetch('/assets/towns.json',{signal:AbortSignal.timeout(10000)}).then(r=>{if(!r.ok)throw Error('No se ha podido cargar el listado');return r.json()}).then(rows=>{if(!Array.isArray(rows))throw Error('Listado no válido');return rows}).catch(error=>{cached=null;throw error}));
  finder.addEventListener('input',()=>{clearTimeout(timer);const own=++sequence;const value=normalize(finder.value);results.replaceChildren();status.textContent='';if(value.length<2)return;
    timer=setTimeout(async()=>{status.textContent='Buscando municipios…';try{const rows=await load();if(own!==sequence)return;const matches=rows.filter(t=>(!finder.dataset.province||normalize(t.province)===finder.dataset.province)&&normalize(`${t.name} ${t.province} ${(t.postalCodes||[]).join(' ')}`).includes(value));status.textContent=matches.length?`${matches.length} municipios encontrados${matches.length>24?'; se muestran los primeros 24. Escribe más para concretar.':'.'}`:'No se ha encontrado ese municipio o código postal. Los códigos postales están disponibles para Madrid; consulta también los listados.';
      for(const town of matches.slice(0,24)){if(!/^\/[a-z0-9-]+\/[a-z0-9-]+\/$/.test(town.path))continue;const a=document.createElement('a'),small=document.createElement('small');a.href=town.path;a.append(document.createTextNode(town.name));const codes=(town.postalCodes||[]).filter(code=>!/^\d+$/.test(value)||code.includes(value));small.textContent=town.province+(codes.length?' · CP '+codes.slice(0,4).join(', ')+(codes.length>4?'…':''):'');a.append(small);results.append(a)}
    }catch{if(own===sequence)status.textContent='El buscador no está disponible ahora. Puedes abrir los listados por provincia que aparecen debajo.'}},180);
  });
}

const consentKey='lcyt-cookie-consent-v1';
const cookieBanner=document.querySelector('[data-cookie-banner]');
const cookieDialog=document.querySelector('[data-cookie-dialog]');
const readConsent=()=>{try{return JSON.parse(localStorage.getItem(consentKey)||'null')}catch{return null}};
const saveConsent=analytics=>{try{localStorage.setItem(consentKey,JSON.stringify({necessary:true,analytics:Boolean(analytics),updatedAt:new Date().toISOString()}))}catch{};if(cookieBanner)cookieBanner.hidden=true;if(cookieDialog?.open)cookieDialog.close();};
const currentConsent=readConsent();
if(cookieBanner&&!currentConsent)cookieBanner.hidden=false;
document.querySelectorAll('[data-cookie-accept],[data-cookie-all]').forEach(btn=>btn.addEventListener('click',()=>saveConsent(true)));
document.querySelectorAll('[data-cookie-reject]').forEach(btn=>btn.addEventListener('click',()=>saveConsent(false)));
document.querySelectorAll('[data-cookie-save]').forEach(btn=>btn.addEventListener('click',()=>saveConsent(Boolean(document.querySelector('[data-cookie-analytics]')?.checked))));
document.querySelectorAll('[data-cookie-open]').forEach(btn=>btn.addEventListener('click',()=>{
  const consent=readConsent();
  const analytics=document.querySelector('[data-cookie-analytics]');
  if(analytics)analytics.checked=Boolean(consent?.analytics);
  if(cookieDialog?.showModal)cookieDialog.showModal();
}));
