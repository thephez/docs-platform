# Minimal makefile for Sphinx documentation
#

# You can set these variables from the command line, and also
# from the environment for the first two.
SPHINXOPTS    ?=
SPHINXBUILD   ?= sphinx-build
SOURCEDIR     = .
BUILDDIR      = _build
NPM           ?= npm
SDK_BUNDLER   = node_modules/.bin/esbuild

# Put it first so that "make" without argument is like "make help".
help:
	@$(SPHINXBUILD) -M help "$(SOURCEDIR)" "$(BUILDDIR)" $(SPHINXOPTS) $(O)

.PHONY: help sdk-install sdk html Makefile

# Install the pinned JavaScript build dependencies for local development.
# Read the Docs performs this step separately in .readthedocs.yml.
sdk-install:
	$(NPM) ci

# Generate the browser SDK asset copied by Sphinx with the other static files.
sdk: $(SDK_BUNDLER)
	$(NPM) run build:sdk

# Give a useful setup hint instead of letting npm fail with "esbuild: not found".
$(SDK_BUNDLER):
	@echo "Missing JavaScript build dependencies."
	@echo "Run 'make sdk-install' once, then retry 'make html'."
	@false

# Keep the generated SDK bundle current for local HTML builds.
html: sdk
	@$(SPHINXBUILD) -M html "$(SOURCEDIR)" "$(BUILDDIR)" $(SPHINXOPTS) $(O)

# Catch-all target: route all unknown targets to Sphinx using the new
# "make mode" option.  $(O) is meant as a shortcut for $(SPHINXOPTS).
%: Makefile
	@$(SPHINXBUILD) -M $@ "$(SOURCEDIR)" "$(BUILDDIR)" $(SPHINXOPTS) $(O)
