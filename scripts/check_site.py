"""Проверка выложенной версии: все страницы × 1440 / 768 / 390 / 320.

Запуск из корня репозитория после `npm run build` (список страниц берётся из dist/):
    python3 scripts/check_site.py https://smesi-cvetnye-code.vercel.app

На каждой странице и ширине: код ответа, ровно один h1, нет прокрутки вбок, нет ошибок в консоли,
нет битых картинок. В конце — итог и код выхода 1, если есть проблемы. Браузер — Playwright Chromium
(`python -m playwright install chromium`), обычный Chrome скриптом не запускаем.
Клики (окно «Узнать цену», фильтры каталога, калькулятор) скрипт не проверяет — их проверять руками.
"""
import asyncio
import random
import sys
from pathlib import Path

from playwright.async_api import async_playwright

WIDTHS = [1440, 768, 390, 320]
ROOT = Path(__file__).resolve().parent.parent


def pages_from_dist():
    dist = ROOT / 'dist'
    if not dist.exists():
        sys.exit('нет dist/ — сначала npm run build')
    paths = []
    for f in sorted(dist.rglob('index.html')):
        rel = f.parent.relative_to(dist).as_posix()
        paths.append('/' if rel == '.' else '/' + rel + '/')
    if (dist / '404.html').exists():
        paths.append('/404/')  # своя страница 404 — проверяется по несуществующему адресу
    return paths


async def check(page, url, is404):
    errors = []
    page.on('console', lambda m: m.type == 'error' and errors.append(m.text))
    page.on('pageerror', lambda e: errors.append(str(e)))
    resp = None
    for attempt in range(3):  # *.vercel.app из России открывается через раз — повторяем
        try:
            resp = await page.goto(url, wait_until='networkidle', timeout=45000)
            break
        except Exception as e:  # noqa: BLE001
            last = e
            await asyncio.sleep(3)
    if resp is None:
        return [f'не открылась за 3 попытки: {last}']
    await page.evaluate('window.scrollTo(0, document.body.scrollHeight)')
    await page.wait_for_timeout(600)
    m = await page.evaluate('''() => ({
        h1: document.querySelectorAll('h1').length,
        over: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        broken: [...document.images].filter(i => i.currentSrc && i.complete && i.naturalWidth === 0).map(i => i.currentSrc).slice(0, 3),
    })''')
    problems = []
    want = 404 if is404 else 200
    if resp.status != want:
        problems.append(f'код {resp.status}, ждали {want}')
    if m['h1'] != 1:
        problems.append(f'h1: {m["h1"]}')
    if m['over'] > 1:
        problems.append(f'прокрутка вбок на {m["over"]} px')
    if m['broken']:
        problems.append('битые картинки: ' + ', '.join(m['broken']))
    if is404:  # сама страница 404 пишет в консоль «Failed to load resource … 404» — это норма
        errors = [e for e in errors if '404' not in e]
    if errors:
        problems.append('консоль: ' + ' | '.join(errors[:3]))
    return problems


async def main():
    if len(sys.argv) < 2:
        sys.exit('адрес: python3 scripts/check_site.py https://smesi-cvetnye-code.vercel.app')
    base = sys.argv[1].rstrip('/')
    paths = pages_from_dist()
    total, bad = 0, 0
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        for w in WIDTHS:
            ctx = await browser.new_context(viewport={'width': w, 'height': 900})
            for path in paths:
                page = await ctx.new_page()
                is404 = path == '/404/'
                url = base + ('/proverka-404-net-takoy-stranicy/' if is404 else path) + f'?v={random.randint(0, 10**9)}'
                problems = await check(page, url, is404)
                total += 1
                if problems:
                    bad += 1
                    print(f'ПРОБЛЕМА {w:>4} {path}: ' + '; '.join(problems))
                else:
                    print(f'OK       {w:>4} {path}')
                await page.close()
            await ctx.close()
        await browser.close()
    print(f'\nИтог: проверок {total}, с проблемами {bad}')
    sys.exit(1 if bad else 0)


asyncio.run(main())
