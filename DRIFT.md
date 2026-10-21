# DRIFT: Ødegården forslagsside (tussienorway/odegarden)

## Hosting og HTTPS
- GitHub Pages fra `main` på https://tussienorway.github.io/odegarden/. «Enforce HTTPS» er på (verifisert med `gh api repos/tussienorway/odegarden/pages`: `https_enforced: true`).
- Statiske filer uten byggesteg. Sidene genereres lokalt med `/workspace/odegarden-admin/build.py`, som ligger utenfor repoet.

## Backup
- **Git er backupen.** Hver commit er en full kopi av siden. Repoet ligger på GitHub og lokalt i `/workspace/odegarden`.
- Ekstra kopi: `git bundle create odegarden-$(date +%F).bundle --all`. Legg filen et annet sted, for eksempel Google Drive, etter tussies ja.
- Innhold redigert i CMS blir commits i `content/*.json`, og har dermed historikk automatisk.
- Data fra anbudsprototypen ligger bare i nettleseren (localStorage). Den har **ingen backup** før en ekte database kobles på (se PLAN-KI-APP.md).

## Rollback
1. Finn siste gode commit: `git log --oneline`.
2. Angre uten å skrive om historikken: `git revert <commit>` og deretter `git push`. Dette krever tussies ja, som all publisering.
3. Pages bygger på nytt i løpet av 1–2 minutter. Sjekk med `gh api repos/tussienorway/odegarden/pages/builds/latest`.
4. Bruk aldri force-push uten eksplisitt ja.

## Oppetid og overvåking
- Enkel sjekk: `curl -s -o /dev/null -w '%{http_code}' https://tussienorway.github.io/odegarden/` skal gi 200.
- Status for GitHub Pages: https://www.githubstatus.com/
- Anbefalt: en gratis ekstern oppetidstjeneste, for eksempel UptimeRobot eller Better Stack, med 5-minutters sjekk og e-postvarsel. **Krever konto og tussies ja.**
- Etter hver publisering: kjør Playwright-testene (`/tmp/o3.py`, `/tmp/proto.py`) og Lighthouse mot live-adressen.

## CMS (Decap) – ikke aktivt
- `/cms/` (noindex) og `cms/config.yml` redigerer `content/nyheter.json` og `content/sesong.json`.
- Innlogging krever **GitHub OAuth**:
  1. Opprett en GitHub OAuth App (eier: tussienorway), med callback til en OAuth-proxy.
  2. Driv en liten OAuth-proxy, for eksempel en Cloudflare Worker (`decap-proxy`) eller Netlify, og sett `base_url` i `cms/config.yml`.
  3. Redaktørene trenger GitHub-bruker med skrivetilgang til repoet.
- **Alle tre stegene krever tussies ja** (nye kontoer, OAuth-app, tilgang). Ingenting er opprettet.

## Analyse – ikke aktiv
- Kroken ligger i `js/analytics-config.js`. Står den tom, lastes ingenting. Den lastes bare etter «Godta statistikk» i samtykkebanneret.
- Mulige tjenester: Plausible (betalt, EU) eller Umami (selvhostet eller sky). Begge kan brukes uten informasjonskapsler. **Konto krever tussies ja.** Oppdater personvern.html når en tjeneste kobles på.

## Kontaktskjema
- Lager e-post (mailto) til post@odegardens.no. Adressen er PLASSHOLDER og må bekreftes. Ingen server og ingen lagring.
