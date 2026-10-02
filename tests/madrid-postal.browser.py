"""Postal search, shared codes and no-JavaScript coverage on mobile and desktop."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
import json, os
from playwright.sync_api import sync_playwright

class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *_args): pass

root = Path('dist').resolve()
out = Path('.quality/madrid-postal'); out.mkdir(parents=True, exist_ok=True)
rows = json.loads(Path('content/postal-codes-madrid.json').read_text())['municipalities']
shared = next(c for row in rows for c in row['postalCodes'] if sum(c in r['postalCodes'] for r in rows) > 1)
server = ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietHandler, directory=str(root)))
Thread(target=server.serve_forever, daemon=True).start()
origin = f'http://127.0.0.1:{server.server_port}'
results = []
try:
    with sync_playwright() as pw:
        for engine in os.getenv('BROWSER_ENGINES', 'chromium,webkit').split(','):
            opts = {'executable_path': os.environ['BROWSER_EXECUTABLE']} if os.getenv('BROWSER_EXECUTABLE') else {}
            browser = getattr(pw, engine).launch(**opts)
            for width in [320, 390, 768, 1280]:
                context = browser.new_context(viewport={'width': width, 'height': 900}, reduced_motion='reduce')
                context.route('**/*', lambda r: r.continue_() if r.request.url.startswith(origin) else r.abort())
                context.add_init_script("localStorage.setItem('lcyt-cookie-consent-v1',JSON.stringify({necessary:true,analytics:false}))")
                page = context.new_page()
                for route in ['/madrid/#localidades', '/#pueblos']:
                    assert page.goto(origin + route, wait_until='load').status == 200
                    field = page.locator('[data-town-search]')
                    for code in ['28801', '28001', shared]:
                        field.fill(code)
                        expected = [r for r in rows if code in r['postalCodes']]
                        page.wait_for_function("n=>document.querySelector('[data-town-status]').textContent.startsWith(n+' municipios encontrados')", arg=len(expected))
                        actual = page.locator('#town-search-results a').all_text_contents()
                        assert len(actual) == len(expected)
                        assert all(any(r['name'] in t for t in actual) for r in expected), (route,code,actual)
                        assert all(code in t for t in actual), (route, code)
                    field.fill('Alcala de Henares')
                    page.wait_for_function("()=>document.querySelector('[data-town-status]').textContent.startsWith('1 municipios encontrados')")
                    assert page.locator('#town-search-results a').first.get_attribute('href') == '/madrid/alcala-de-henares/'
                    field.fill('00000')
                    page.wait_for_function("()=>document.querySelector('[data-town-status]').textContent.startsWith('No se ha encontrado')")
                    assert page.locator('#town-search-results a').count() == 0
                    field.fill('28801')
                    page.wait_for_function("()=>document.querySelector('#town-search-results a')?.textContent.includes('Alcalá de Henares')")
                    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'), (engine,width,route,'desborde')
                    if width == 390 and route.startswith('/madrid/'):
                        page.locator('#localidades').scroll_into_view_if_needed()
                        page.evaluate("window.scrollTo(0,document.querySelector('#localidades').getBoundingClientRect().top+scrollY-15)")
                        page.screenshot(path=str(out / f'{engine}-buscador-390.png'))
                    results.append({'engine':engine,'width':width,'route':route,'postalSearch':True,'sharedCodes':True})
                context.close()
                context = browser.new_context(viewport={'width': width,'height':900}, java_script_enabled=False, reduced_motion='reduce')
                context.route('**/*', lambda r:r.continue_() if r.request.url.startswith(origin) else r.abort())
                page = context.new_page()
                assert page.goto(origin + '/madrid/madrid/',wait_until='load').status == 200
                codes = next(r['postalCodes'] for r in rows if r['id']=='28079')
                assert page.locator('.postal-code').all_text_contents()==codes
                page.locator('.postal-more summary').click()
                extra=page.locator('.postal-more .postal-code-list')
                assert extra.locator('.postal-code').last.is_visible()
                assert extra.evaluate('e=>e.scrollHeight<=e.clientHeight+1'), 'Scroll interno'
                assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'), 'Desborde'
                if width==390: page.locator('#codigos-postales').screenshot(path=str(out/f'{engine}-capital-codigos-390.png'))
                assert page.goto(origin+'/madrid/',wait_until='load').status==200
                assert page.locator('.postal-town-link').count()==179
                assert page.goto(origin+'/burgos/lerma/',wait_until='load').status==200
                assert page.locator('#codigos-postales').count()==0
                results.append({'engine':engine,'width':width,'javascript':False,'allCodesInHTML':True,'noInternalScroll':True})
                context.close()
            browser.close()
    (out/'browser.json').write_text(json.dumps({'passed':True,'scenarios':len(results),'results':results},ensure_ascii=False,indent=2))
    print(f'MADRID UI OK: {len(results)} escenarios; búsqueda en portada/Madrid, códigos compartidos y HTML sin JavaScript.')
finally:
    server.shutdown(); server.server_close()
