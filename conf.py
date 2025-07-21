# Configuration file for the Sphinx documentation builder.
#
# For the full list of built-in configuration values, see the documentation:
# https://www.sphinx-doc.org/en/master/usage/configuration.html

# -- Project information -----------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#project-information

project = 'Dash Platform'
copyright = '2025, Dash Core Group, Inc'
author = 'thephez'

# The version info for the project you're documenting, acts as replacement for
# |version| and |release|, also used in various other places throughout the
# built documents.
#
# The short X.Y version.
version = u'latest'
# The full version, including alpha/beta/rc tags.
release = u'latest'

# -- General configuration ---------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#general-configuration

extensions = [
  'hoverxref.extension',
  'myst_parser',
  'sphinx.ext.autodoc',
  'sphinx_copybutton',
  'sphinx_design',
  'sphinxcontrib.googleanalytics',  
  'sphinx.ext.intersphinx',
]

extensions += ["sphinx_docsearch"]

templates_path = ['_templates']
exclude_patterns = [
    '_build',
    'Thumbs.db',
    '.DS_Store',
    'README.md',
    '.devcontainer',
    'scripts',
    'img/dev/gifs/README.md',
    'docs/other',
    'docs/ai-prompt.md'
]

# The master toctree document.
master_doc = 'index'

hoverxref_role_types = {
    'hoverxref': 'tooltip',
}

# -- Myst parser configuration -----------------------------------------------
# Auto-generate header anchors for md headings
myst_heading_anchors = 6

# Enable colon_fence for better markdown compatibility
# https://myst.tools/docs/mystjs/syntax-overview#directives
myst_enable_extensions = ["colon_fence"]

# -- intersphinx configuration -----------------------------------------------
intersphinx_mapping = {
    "user": ("https://docs.dash.org/en/stable/", None),
    "core": ("https://docs.dash.org/projects/core/en/stable/", None),
}

# We recommend adding the following config value.
# Sphinx defaults to automatically resolve *unresolved* labels using all your Intersphinx mappings.
# This behavior has unintended side-effects, namely that documentations local references can
# suddenly resolve to an external location.
# See also:
# https://www.sphinx-doc.org/en/master/usage/extensions/intersphinx.html#confval-intersphinx_disabled_reftypes
intersphinx_disabled_reftypes = ["*"]

# -- Options for HTML output -------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#options-for-html-output

html_theme = "pydata_sphinx_theme"
html_static_path = ['_static']
html_logo = 'img/dash_logo.png'
html_favicon = "_static/img/favicon-144x144.png"
html_css_files = [
    'css/footer.css',
    'css/pydata-overrides.css',
]

# Custom sidebar templates, must be a dictionary that maps document names
# to template names.
#
html_sidebars = {
    "index": ["sidebar-main.html"],
    "**": ["sidebar-nav-bs"]
}

html_theme_options = {
#    "announcement": "This development version of documentation covers unreleased features.<br>See the <a href='https://docs.dash.org/platform'>stable version of the documentation</a> for information about the currently deployed Platform.",
    "external_links": [
        {"name": "Core docs", "url": "https://docs.dash.org/en/stable/docs/core/index.html"},
        {"name": "User docs", "url": "https://docs.dash.org/"},
        {"name": "Dash.org", "url": "https://www.dash.org"},
        {"name": "Forum", "url": "https://www.dash.org/forum"},
    ],
    "use_edit_page_button": True,
    "github_url": "https://github.com/dashpay/docs-platform",
    "show_toc_level": 2,
    "show_nav_level": 1,
    "footer_start": ["copyright"],
    "footer_center": ["sphinx-version"],
    "footer_end": ["theme-version"],   
#    "navbar_start": ["navbar-logo", "languages"],
#    "navbar_center": ["languages", "navbar-nav", "languages"],
#    "navbar_end": ["navbar-icon-links", "version"],
#    "secondary_sidebar_items": ["languages", "page-toc", "edit-this-page", "sourcelink"],
#    "footer_items": ["languages", "copyright", "sphinx-version", "theme-version"],
#   "primary_sidebar_end": ["languages"],
}

html_context = {
    # "github_url": "https://github.com", # or your GitHub Enterprise site
    "github_user": "dashpay",
    "github_repo": "docs-platform",
    "github_version": "2.0.0",
    "doc_path": "",
}

# -- Google analytics config ----------------------------------------------

googleanalytics_id = 'G-B3JNYGTPR0'
googleanalytics_enabled = True

def setup(app):
    app.add_js_file('js/pydata-search-close.js')
