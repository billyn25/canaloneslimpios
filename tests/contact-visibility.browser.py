"""Visual regression checks against the generated production HTML; no external calls."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
import json
from playwright.sync_api import sync_playwright

class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass

root = Path('dist').resolve()
out = Path('.quality')
out.mkdir(exist_ok=True)
site = json.loads(Path('config/site.json').read_text(encoding='utf8'))
server = ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietHandler, directory=str(root)))
Thread(target=server.serve_forever, daemon=True).start()
origin = f'http://127.0.0.1:{server.server_port}'
results = []
routes = ['/', '/burgos/lerma/', '/burgos/', '/limpieza-canalones/', '/aviso-legal/', '/404.html']

def in_viewport(locator, width):
    assert locator.is_visible(), 'Elemento oculto'
    box = locator.bounding_box()
    assert box and box['width'] > 0 and box['height'] > 0, 'Sin dimensiones visibles'
    assert box['x'] >= -1 and box['x'] + box['width'] <= width + 1, 'Elemento cortado horizontalmente'
    return box

try:
    with sync_playwright() as pw:
        for engine in ['chromium', 'webkit']:
            browser = getattr(pw, engine).launch()
            for width in [320, 390, 768, 1280]:
                context = browser.new_context(viewport={'width': width, 'height': 900}, java_script_enabled=False)
                context.route('**/*', lambda route: route.continue_() if route.request.url.startswith(origin) else route.abort())
                page = context.new_page()
                for route in routes:
                    response = page.goto(origin + route, wait_until='load')
                    assert response and response.status == 200
                    bar = page.locator('[data-emergency-bar]')
                    label = bar.locator('.emergency-label')
                    phone = bar.locator('.emergency-phone')
                    assert label.inner_text().strip() == 'Urgencias 24 horas'
                    assert phone.inner_text().strip() == site['phone']
                    assert phone.get_attribute('href') == 'tel:' + site['tel']
                    in_viewport(label, width)
                    in_viewport(phone, width)
                    assert bar.bounding_box()['y'] <= 1, 'Urgencias no está en la franja superior'
                    commercial = route not in ['/aviso-legal/', '/404.html']
                    if commercial:
                        note = page.locator('#contacto .direct-tech')
                        assert note.inner_text().strip() == 'Trato directo con el técnico profesional.'
                        in_viewport(note, width)
                        assert page.locator('[data-wa-mini]').get_attribute('data-whatsapp') == site['whatsapp']
                    if route == '/':
                        for group in page.locator('.featured-town-links').all():
                            assert group.locator('a').count() == 12, 'Se han perdido municipios visibles'
                        if width == 390:
                            page.screenshot(path=str(out / f'{engine}-movil-cabecera.png'))
                            page.locator('#contacto').screenshot(path=str(out / f'{engine}-movil-contacto.png'))
                    results.append({'engine': engine, 'width': width, 'route': route, 'urgentVisible': True, 'directTechnicianVisible': commercial, 'javascript': False})
                context.close()
            context = browser.new_context(viewport={'width':390,'height':900})
            context.route('**/*', lambda route: route.continue_() if route.request.url.startswith(origin) else route.abort())
            page = context.new_page()
            page.goto(origin, wait_until='load')
            in_viewport(page.locator('.emergency-label'),390)
            in_viewport(page.locator('.emergency-phone'),390)
            in_viewport(page.locator('#contacto .direct-tech'),390)
            browser.close()
    report = {'passed': True, 'cases':len(results), 'engines':['chromium','webkit'], 'widths':[320,390,768,1280], 'results':results}
    (out / 'contact-visibility-browser.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
    print(f'UI OK: {len(results)} comprobaciones sin JavaScript y 2 con JavaScript; urgencias, teléfono, técnico y 12 pueblos visibles.')
finally:
    server.shutdown()
    server.server_close()
