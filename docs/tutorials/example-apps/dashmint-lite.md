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

# DashMint Lite

The app embedded below is a live, read-only version of DashMint Lite running against testnet — try it out directly in this page. It's a stripped-down companion to the full [DashMint Lab](dashmint-lab.md) NFT example app: browse the cards minted on the network, with an optional "Marketplace only" filter for cards that have a sale price set. No wallet, identity, or signing required. Writes (mint, transfer, price, purchase, burn) aren't wired up here; for the walkthrough of those SDK calls, see the [DashMint Lab tutorial](dashmint-lab.md).

```{raw} html
<iframe src="../../../_static/dashmint-lite.html" width="100%" height="600"></iframe>
