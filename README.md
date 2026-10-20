# Ødegårdens Planteskole og Utemiljø – demo-nettside

Statisk nettside (HTML/CSS/JS) for GitHub Pages. Ingen byggesteg: åpne `index.html` eller kjør `python3 -m http.server`.

- Sider: `index.html`, `hagesenter.html`, `anleggsgartner.html`, `broyting.html`, `losvekt.html`, `personvern.html`
- Innhold: `js/data.js` (firma, tjenester, løsvekt, helligdager, nyheter, «nå i sesong»), `js/gallery-data.js` (bilder)
- Chat-assistenten (`js/chat.js`, `js/ai.js`) er regelbasert. KI-koblingen er klargjort i `js/ai-config.js`, men ikke aktivert. API-nøkler skal aldri ligge i nettleseren, bare i en proxy.
- Tekst merket **EKSEMPEL** er plassholdere som bedriften må bekrefte eller bytte ut.
- KI-genererte bilder og video er merket på siden.
