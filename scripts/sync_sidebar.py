#!/usr/bin/env python3

"""
sync_sidebar.py

This script keeps the custom Jinja template sidebar in sync with Sphinx’s
auto-generated navigation. It performs the following steps:

1. Locate and parse the built Sphinx HTML ( _build/html/docs/index.html ).
2. Extract the <nav class="bd-docs-nav"> element that contains the
   freshly generated table of contents.
3. Normalize its attributes (classes, id, aria-label) to match the template.
4. Prefix all non-external links with “docs/” so they continue pointing at
   the correct relative paths.
5. Load the existing template file ( _templates/sidebar-main.html ) and
   locate its old <nav id="bd-docs-nav"> block.
6. From that old block, pull out any manually maintained sections
   (e.g. “Core Docs”, “User Docs”) so they aren't lost.
7. Inject those manual extras at the bottom of the new nav's <div class="bd-toc-item">.
8. Replace the old <nav> entirely with the newly merged one.
9. Write the updated HTML back to your template file, using BeautifulSoup's
   prettify() to keep indentation tidy.

Run this script whenever rebuilding docs to automatically keep the
sidebar template up-to-date without losing any custom links.
"""

import sys
from pathlib import Path
from bs4 import BeautifulSoup, Tag

# ─── CONFIG ────────────────────────────────────────────────────────────────
SCRIPT_DIR   = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent     # adjust if you nest this deeper
BUILD_INDEX  = PROJECT_ROOT / '_build' / 'html' / 'docs' / 'index.html'
TEMPLATE_IN  = PROJECT_ROOT / '_templates' / 'sidebar-main.html'
TEMPLATE_OUT = TEMPLATE_IN           # or TEMPLATE_IN.with_suffix('.updated.html')
# ─────────────────────────────────────────────────────────────────────────────

def prefix_docs(href: str) -> str:
    if href.startswith(('http://', 'https://', '#', 'docs/')):
        return href
    return 'docs/' + href.lstrip('/')

def main():
    # 1) Load generated nav
    if not BUILD_INDEX.exists():
        print(f"❌ Build file not found: {BUILD_INDEX}", file=sys.stderr)
        sys.exit(1)
    build_soup = BeautifulSoup(BUILD_INDEX.read_text(encoding='utf-8'), 'html.parser')
    autogen_nav = build_soup.find('nav', class_='bd-docs-nav')
    if not autogen_nav:
        print("❌ Missing <nav class='bd-docs-nav'> in build index", file=sys.stderr)
        sys.exit(1)

    # normalize its attrs
    autogen_nav['class'] = ['bd-links']
    autogen_nav['id']    = 'bd-docs-nav'
    autogen_nav['aria-label'] = 'Section navigation'

    # prefix internal links
    for a in autogen_nav.find_all('a', href=True):
        a['href'] = prefix_docs(a['href'])

    # 2) Extract manual extras from your template
    if not TEMPLATE_IN.exists():
        print(f"❌ Template not found: {TEMPLATE_IN}", file=sys.stderr)
        sys.exit(1)
    tpl_soup = BeautifulSoup(TEMPLATE_IN.read_text(encoding='utf-8'), 'html.parser')
    old_nav = tpl_soup.find('nav', id='bd-docs-nav')
    if not old_nav:
        print("❌ Missing <nav id='bd-docs-nav'> in template", file=sys.stderr)
        sys.exit(1)

    old_div = old_nav.find('div', class_='bd-toc-item')
    if not old_div:
        print("❌ Couldn't find the .bd-toc-item wrapper in old nav", file=sys.stderr)
        sys.exit(1)

    # find where "Core Docs" caption begins
    children = list(old_div.children)
    split_idx = None
    for i, node in enumerate(children):
        if isinstance(node, Tag) and node.name == 'p':
            span = node.find('span', class_='caption-text')
            if span and span.get_text(strip=True) == 'Core Docs':
                split_idx = i
                break
    manual_extras = []
    if split_idx is not None:
        # extract everything from Core Docs onward
        for node in children[split_idx:]:
            manual_extras.append(node.extract())
    else:
        print("⚠️  No 'Core Docs' section found; skipping manual extras", file=sys.stderr)

    # 3) Insert manual_extras into the new nav
    new_div = autogen_nav.find('div', class_='bd-toc-item')
    for node in manual_extras:
        new_div.append(node)

    # 4) Replace old nav with new one
    old_nav.replace_with(autogen_nav)

    # 5) Write back prettified
    TEMPLATE_OUT.write_text(tpl_soup.prettify(), encoding='utf-8')
    print(f"Updated sidebar written to {TEMPLATE_OUT}")

if __name__ == '__main__':
    main()
