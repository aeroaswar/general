#!/usr/bin/env python3
"""
Render the PT TNS Swiss-style company profile (profile.html) to an A4 PDF
using headless Chromium via Playwright.

Usage:
    python3 render_pdf.py

Environment:
    CHROME_PATH   Optional path to a Chromium/Chrome executable. If unset,
                  Playwright's bundled browser is used (playwright install chromium).

Output:
    TNS_Company_Profile_2025.pdf  (12 pages, A4 portrait, print backgrounds on)
    qa/sheet_NN.png               (per-page screenshots for visual QA)
"""
import os
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
HTML = os.path.join(HERE, "profile.html")
URL = "file://" + HTML
OUT_PDF = os.path.join(HERE, "TNS_Company_Profile_2025.pdf")
CHROME = os.environ.get("CHROME_PATH")  # None -> Playwright's bundled Chromium

with sync_playwright() as p:
    launch_kwargs = {"args": ["--no-sandbox", "--force-color-profile=srgb"]}
    if CHROME:
        launch_kwargs["executable_path"] = CHROME
    browser = p.chromium.launch(**launch_kwargs)
    page = browser.new_page()
    page.goto(URL, wait_until="networkidle")
    page.evaluate("async () => { await document.fonts.ready; }")
    page.wait_for_timeout(400)
    page.pdf(
        path=OUT_PDF,
        prefer_css_page_size=True,   # honour @page { size: A4 }
        print_background=True,
        margin={"top": "0", "right": "0", "bottom": "0", "left": "0"},
    )
    print("PDF:", OUT_PDF, os.path.getsize(OUT_PDF), "bytes")

    os.makedirs(os.path.join(HERE, "qa"), exist_ok=True)
    sheets = page.query_selector_all(".sheet")
    for i, el in enumerate(sheets):
        el.screenshot(path=os.path.join(HERE, "qa", f"sheet_{i+1:02d}.png"))
    print("QA screenshots:", len(sheets))
    browser.close()
