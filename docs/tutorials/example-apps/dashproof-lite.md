---
html_theme.sidebar_secondary.remove: true
---

```{raw} html
<style>
  /* Widen content area on this embed page since both sidebars are hidden.
     The theme's .bd-main .bd-content .bd-article-container caps at 60em (~960px). */
  .bd-main .bd-content .bd-article-container { max-width: 1100px; }
</style>
```

# DashProof Lite

The app embedded below is a live, read-only proof-of-existence demo running against testnet — try it out directly in this page. Drop a file into "Verify a file" and the page hashes it locally with SHA-256 (the file never leaves your browser), then looks the digest up on-chain to show whether — and when — it was anchored. The "History" tab lists every anchor recorded under a given `chainId` bucket. Anchoring (writing) new files isn't wired up here; this companion app just reads what's already on testnet.

```{raw} html
<iframe src="../../../_static/dashproof-lite.html" width="100%" height="600"></iframe>
