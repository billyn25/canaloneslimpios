const normalize=value=>String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('es').trim();
const motion=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth';
document.addEventListener('click',event=>{
  const anchor=event.target.closest('a');if(!anchor)return;
  if(anchor.dataset.service){const select=document.querySelector('[data-enquiry] select[name="servicio"]');if(select)select.value=anchor.dataset.service;}
  const href=anchor.getAttribute('href')||'';
  if(!href.startsWith('#')||href.length<2)return;
  let target;try{target=document.getElementById(decodeURIComponent(href.slice(1)))}catch{return}
  if(target){event.preventDefault();target.scrollIntoView({behavior:motion(),block:'start'});}
});
for(const form of document.querySelectorAll('[data-enquiry]')){
  const initialTown=form.elements.localidad.value;
  form.addEventListener('submit',event=>{
    event.preventDefault();if(!form.reportValidity())return;
    const fields=new FormData(form);const town=String(fields.get('localidad')||'').trim();
    const province=town===initialTown?form.dataset.province:'';
    const message=['Hola, quiero consultar con Canalones Limpios.',`Localidad: ${town}${province?', '+province:''}`,`Inmueble: ${fields.get('inmueble')}`,`Servicio: ${fields.get('servicio')}`,`Altura aproximada: ${fields.get('altura')}`,`Problema: ${String(fields.get('problema')||'').trim()||'Por explicar'}`].join('\n');
    const result=form.querySelector('.quote-result');result.hidden=false;result.querySelector('textarea').value=message;
    const status=result.querySelector('[role="status"]');const number=form.dataset.whatsapp||'';
    if(/^\d{8,15}$/.test(number)){status.textContent='Se abrirá WhatsApp. Revisa el texto antes de enviarlo.';window.location.assign(`https://wa.me/${number}?text=${encodeURIComponent(message)}`)}
    else{status.textContent='Consulta preparada. Vista previa: no se ha enviado ningún mensaje. Puedes seleccionar y copiar el resumen.';result.scrollIntoView({behavior:motion(),block:'nearest'});}
  });
}
const finder=document.querySelector('[data-town-search]');
if(finder){
  const results=document.getElementById('town-search-results'),status=document.querySelector('[data-town-status]');let timer,sequence=0,cached;
  const load=()=>cached||(cached=fetch('/assets/towns.json',{signal:AbortSignal.timeout(10000)}).then(r=>{if(!r.ok)throw Error('No se ha podido cargar el listado');return r.json()}).then(rows=>{if(!Array.isArray(rows))throw Error('Listado no válido');return rows}).catch(error=>{cached=null;throw error}));
  finder.addEventListener('input',()=>{clearTimeout(timer);const own=++sequence;const value=normalize(finder.value);results.replaceChildren();status.textContent='';if(value.length<2)return;
    timer=setTimeout(async()=>{status.textContent='Buscando municipios…';try{const rows=await load();if(own!==sequence)return;const matches=rows.filter(t=>normalize(`${t.name} ${t.province}`).includes(value));status.textContent=matches.length?`${matches.length} municipios encontrados${matches.length>24?'; se muestran los primeros 24. Escribe más para concretar.':'.'}`:'No se ha encontrado esa localidad. Revisa los listados por provincia.';
      for(const town of matches.slice(0,24)){if(!/^\/[a-z0-9-]+\/[a-z0-9-]+\/$/.test(town.path))continue;const a=document.createElement('a'),small=document.createElement('small');a.href=town.path;a.append(document.createTextNode(town.name));small.textContent=town.province;a.append(small);results.append(a)}
    }catch{if(own===sequence)status.textContent='El buscador no está disponible ahora. Puedes abrir los listados por provincia que aparecen debajo.'}},180);
  });
}
