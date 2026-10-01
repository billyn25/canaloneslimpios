"""Check the homepage directory in Chromium and WebKit, including native details without JavaScript."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
import json
from playwright.sync_api import sync_playwright

class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass

out = Path('.quality/home-town-links')
out.mkdir(parents=True, exist_ok=True)
report = json.loads(Path('dist/home-town-links-report.json').read_text(encoding='utf8'))
server = ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietHandler, directory=str(Path('dist').resolve())))
Thread(target=server.serve_forever, daemon=True).start()
origin = f'http://127.0.0.1:{server.server_port}'
results = []
try:
    with sync_playwright() as pw:
        for engine in ['chromium', 'webkit']:
            browser = getattr(pw, engine).launch()
            for width in [320, 390, 768, 1440]:
                context = browser.new_context(viewport={'width':width, 'height':900}, java_script_enabled=False)
                context.route('**/*', lambda r: r.continue_() if r.request.url.startswith(origin) else r.abort())
                page = context.new_page()
                assert page.goto(origin, wait_until='load').status == 200
                groups = page.locator('#pueblos .town-province')
                assert groups.count() == report['provinces']
                assert page.locator('#pueblos a.town-service-link').count() == report['municipalities']
                for index, group in enumerate(groups.all()):
                    expected = report['rows'][index]
                    shown = group.locator('.featured-town-links a')
                    assert shown.count() == expected['visible']
                    labels = shown.locator('.town-service-label').all_text_contents()
                    assert labels.count('Limpieza de canalones en') == expected['canalones']
                    assert labels.count('Limpieza de tejados en') == expected['tejados']
                    assert group.locator('.more-town-links a').count() == expected['more']
                    assert not group.locator('.more-towns').get_attribute('open')
                    for anchor in shown.all():
                        assert anchor.is_visible()
                        assert anchor.locator('.town-service-label').is_visible()
                        assert anchor.locator('.town-service-name').is_visible()
                        assert ' en ' in anchor.text_content()
                        box = anchor.bounding_box()
                        assert box['x'] >= -1 and box['x'] + box['width'] <= width + 1
                        assert anchor.evaluate('(e)=>e.scrollWidth<=e.clientWidth+1'), 'Texto desbordado'
                assert page.evaluate('document.documentElement.scrollWidth<=window.innerWidth+1'), 'Scroll horizontal'
                first = groups.first
                first.locator('.more-towns summary').click()
                assert first.locator('.more-towns').get_attribute('open') is not None
                extra = first.locator('.more-town-links')
                assert extra.locator('a').first.is_visible()
                assert extra.locator('a').last.is_visible()
                assert extra.evaluate('(e)=>e.scrollHeight<=e.clientHeight+1'), 'Se ha introducido un scroll interno'
                first.locator('.more-towns summary').click()
                if width == 390:
                    groups.nth(2).screenshot(path=str(out / f'{engine}-movil-alava.png'))
                    groups.nth(4).screenshot(path=str(out / f'{engine}-movil-burgos.png'))
                if width == 1440:
                    first.scroll_into_view_if_needed()
                    page.screenshot(path=str(out / f'{engine}-escritorio.png'))
                results.append({'engine':engine, 'width':width, 'groups':groups.count(), 'passed':True, 'javascript':False})
                context.close()
            browser.close()
    (out / 'browser.json').write_text(json.dumps({'passed':True,'results':results},ensure_ascii=False,indent=2),encoding='utf8')
    (out / 'directory.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
    print(f'PUEBLOS UI OK: {len(results)} escenarios; 12 visibles, reparto 8/4, todos los municipios en HTML, sin scroll interno.')
finally:
    server.shutdown()
    server.server_close()
