#!/usr/bin/env python3
import sys
from pathlib import Path
from bs4 import BeautifulSoup

# ─── CONFIG ────────────────────────────────────────────────────────────────
# Adjust how many `.parent` levels you need to reach your project root.
# If you drop this script directly in your project root, change .parent to yourself.
SCRIPT_DIR    = Path(__file__).resolve().parent
PROJECT_ROOT  = SCRIPT_DIR.parent      # ← if you move this script into, e.g., scripts/, it's one up
BUILD_INDEX   = PROJECT_ROOT / '_build' / 'html' / 'docs' / 'index.html'
TEMPLATE_IN   = PROJECT_ROOT / '_templates' / 'sidebar-main.html'
TEMPLATE_OUT  = TEMPLATE_IN            # overwrite in place; or change to TEMPLATE_IN.with_suffix('.updated.html')
# ─────────────────────────────────────────────────────────────────────────────

def prefix_docs(href: str) -> str:
    if href.startswith(('http://', 'https://', '#', 'docs/')):
        return href
    return 'docs/' + href.lstrip('/')

def main():
    # 1) load the built index.html
    if not BUILD_INDEX.exists():
        print(f"❌ Build file not found: {BUILD_INDEX}", file=sys.stderr)
        sys.exit(1)
    build_soup = BeautifulSoup(BUILD_INDEX.read_text(encoding='utf-8'), 'html.parser')

    # 2) extract and normalize the nav
    autogen_nav = build_soup.find('nav', class_='bd-docs-nav')
    if not autogen_nav:
        print("❌ Couldn't find <nav class='bd-docs-nav'> in build index", file=sys.stderr)
        sys.exit(1)
    autogen_nav['class'] = ['bd-links']
    autogen_nav['id']    = 'bd-docs-nav'
    autogen_nav['aria-label'] = 'Section navigation'

    # 3) prefix internal links
    for a in autogen_nav.find_all('a', href=True):
        a['href'] = prefix_docs(a['href'])

    # 4) load your manual template
    if not TEMPLATE_IN.exists():
        print(f"❌ Template not found: {TEMPLATE_IN}", file=sys.stderr)
        sys.exit(1)
    tpl_soup = BeautifulSoup(TEMPLATE_IN.read_text(encoding='utf-8'), 'html.parser')

    # 5) replace the old nav
    old_nav = tpl_soup.find('nav', id='bd-docs-nav')
    if not old_nav:
        print("❌ Couldn't find <nav id='bd-docs-nav'> in your template", file=sys.stderr)
        sys.exit(1)
    old_nav.replace_with(autogen_nav)

    # 6) write back
    TEMPLATE_OUT.write_text(tpl_soup.prettify(formatter=None), encoding='utf-8')
    print(f"Updated sidebar written to {TEMPLATE_OUT}")

if __name__ == '__main__':
    main()
