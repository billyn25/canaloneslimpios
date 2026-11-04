"""Verify grouped villages remain searchable and preserve the requested budget locality."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from threading import Thread
from pathlib import Path
import json
from playwright.sync_api import sync_playwright
class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self,*_args): pass
coverage=json.loads(Path('dist/coverage-manifest.json').read_text())
row=next(a for a in coverage['assignments'] if a['provinceSlug']=='madrid' and a['original']!=a['destination'])
server=ThreadingHTTPServer(('127.0.0.1',0),partial(QuietHandler,directory=str(Path('dist').resolve())))
Thread(target=server.serve_forever,daemon=True).start()
origin=f'http://127.0.0.1:{server.server_port}'
results=[]
try:
    with sync_playwright() as pw:
        for engine in ['chromium','webkit']:
            browser=getattr(pw,engine).launch()
            for width in [320,390,768,1440]:
                context=browser.new_context(viewport={'width':width,'height':900},reduced_motion='reduce')
                context.route('**/*',lambda r:r.continue_() if r.request.url.startswith(origin) else r.abort())
                context.add_init_script("localStorage.setItem('lcyt-cookie-consent-v1',JSON.stringify({necessary:true,analytics:false}))")
                page=context.new_page()
                assert page.goto(origin+'/madrid/#localidades',wait_until='load').status==200
                page.locator('[data-town-search]').fill(row['name'])
                result=page.locator('#town-search-results a').filter(has_text=row['name']).first
                result.wait_for()
                assert result.get_attribute('href')==row['url']
                result.click()
                page.wait_for_url(origin+row['url'])
                target=page.locator('#cobertura-'+row['code'])
                assert row['name'] in target.inner_text()
                assert page.locator('[data-wa-mini] input[name="localidad"]').input_value()==row['name']
                assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
                assert target.evaluate('e=>e.scrollWidth<=e.clientWidth+1')
                assert page.locator('#paginas-cercanas a').count()>0
                results.append({'engine':engine,'width':width,'groupedVillage':row['name'],'destination':row['url'],'formPreserved':True})
                context.close()
            browser.close()
    Path('.quality').mkdir(exist_ok=True)
    Path('.quality/coverage-browser.json').write_text(json.dumps(results,ensure_ascii=False,indent=2))
    print('COBERTURA UI OK:',len(results),'escenarios; búsqueda, ancla, localidad del presupuesto y anchura.')
finally:
    server.shutdown();server.server_close()
