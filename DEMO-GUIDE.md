# DEMO-GUIDE: anbudsprototype (ca. 5 minutter)

> PROTOTYPE. Alle forespørsler i demoen er **EKSEMPEL** (oppdiktede). Rutingsreglene er **EKSEMPEL** og må bekreftes av Ødegården. Ingenting sendes: ingen e-post, ingen SMS, ingen server. Data lagres bare i nettleseren (localStorage).

## Forberedelse (før møtet)
1. `cd /workspace/odegarden && python3 -m http.server 8090`
2. Åpne `http://localhost:8090/demo.html` og trykk **Tilbakestill demo** for å starte med tom innboks.
3. Ha `http://localhost:8090/` åpen i en annen fane. På mobil kan du også bruke `app.html`.

## Manus
**0:00 – Problemet (30 s)**
«I dag kommer forespørsler på telefon, e-post og Facebook. Noe mangler mål eller adresse, og ingen ser hvem som har ansvaret.»

**0:30 – Kunden ber om tilbud (1,5 min)** (fanen med forsiden)
- Trykk **Be om tilbud i chatten**. Svar for eksempel: Borettslag → «Eksempel borettslag» → Hopp over → Brøyting og strøing → «Brøyting av parkeringsplass» → «1200 m²» …
- Spør **«hva koster det?»** underveis. Vis at chatten aldri gir pris, men sier at tilbudet kommer fra Ødegården.
- Vis **sammendraget** som kunden godkjenner, og at samtykke til personvern er påkrevd.
- Trykk **Godkjenn og send**. Kunden får en referanse (ODE-…) og ser hvem forespørselen gikk til.

**2:00 – Innboksen (2 min)** (demo.html, oppdater siden)
- Den nye forespørselen ligger øverst, rutet til **Daglig leder** fordi den er ≥ 300 m², og merket **Haster** fordi det er brøyting med oppstart nå.
- Trykk **Fyll inn EKSEMPEL-forespørsler**. Da kommer 7 eksempler: privat, borettslag, bedrift og kommune.
- Vis **fanene per rolle** (sekretær, daglig leder, prosjektleder, drift) og filtrene for status og hast.
- Åpne en forespørsel, sett status til «tilbud sendt», skriv et notat og trykk **Lagre**.
- Vis **Simulerte varsler** og **Rutingsregler (EKSEMPEL)**: «Dette bestemmer dere selv.»
- Trykk **Eksporter CSV**. Filen åpnes i Excel.
- Alternativ: trykk **Start guidet demo**, så går du gjennom de samme stegene med forklaring.

**4:00 – Appen (40 s)**
- Åpne `app.html` på mobil. Der kan den installeres som app (PWA): ring, be om tilbud, løsvekt, brøyteavtale, åpningstider og veibeskrivelse. Den virker også uten nett.

**4:40 – Neste steg (20 s)**
«Neste steg er ekte database i EU, varsel på e-post og SMS, innlogging og KI-chat. Det krever deres svar på rutingsreglene og noen kontoer (se PLAN-KI-APP).»

## Etter møtet
Trykk **Tilbakestill demo**.
