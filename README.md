# Ødegårdens Planteskole og Utemiljø – demoside

Statisk nettside (HTML/CSS/JS, ingen byggesteg, kun relative stier).

- `index.html` – forside: tjenester, løsvekt, før/etter, «Se din hage», galleri, video, eksempelpriser, åpningstider og kontakt (mailto).
- `admin.html` – adminpanel (noindex, ikke lenket): anbud, anbudsgenerator, eier-modus (kalkulator), anbudsagent, data.
- `js/ai-config.js` – kroker for bilde-/video-KI og utlysningsovervåking (ikke aktive). Ingen nøkler i nettleseren.
- `js/data.js` – fakta, tjenester og EKSEMPEL-priser. `js/gallery-data.js` – galleri. `assets/video/videos.json` – videoer.
- `assets/BILDELISTE.md`, `FORSKJELLER.md`.

## Teste lokalt
```
python3 -m http.server 8080   # åpne http://localhost:8080
```

## Publisere på GitHub Pages
1. Lag et repo (f.eks. `odegarden`) og push innholdet i denne mappa til `main` (fila `.nojekyll` skal være med).
2. GitHub → Settings → Pages → Source: «Deploy from a branch», Branch `main`, mappe `/ (root)`.
3. Siden blir tilgjengelig på `https://<bruker>.github.io/odegarden/`.

## Eget domene senere
1. Lag fila `CNAME` i rota med én linje, f.eks. `odegardens.no`.
2. Hos domeneleverandøren: `A`-poster for apex til 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153 (og ev. `AAAA`), samt `CNAME www -> <bruker>.github.io`.
3. Settings → Pages → Custom domain, og huk av «Enforce HTTPS».
4. NB: E-post (post@odegardens.no) ligger på et annet domene og påvirkes ikke. Ikke endre MX-poster.

## Før lansering
- Adminpanelet er kun klient-side (localStorage) og har ingen innlogging. Ikke lenk til det offentlig; for ekte bruk trengs innlogging og backend (f.eks. Supabase/Firebase) – lagringen ligger samlet i `js/store.js`.
- Kontaktskjemaet åpner kundens e-postprogram (mailto). Vurder en skjematjeneste.
- Fyll inn EKSEMPEL-priser i `js/data.js` og org.nr.
