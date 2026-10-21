/* ===================== KI-KONFIGURASJON =====================
 * Kjerne: Claude via SuperGrok som resonneringshjerne.
 * Lokal reserve: llama-server (RTX 5060 Ti på port 8080, Qwen 3.5 9B).
 * Nødreserve: Regelbasert anbuds- og fagassistent (garantert oppetid, 0 kr).
 * Sikkerhet: Ingen hemmeligheter/API-nøkler i kildekoden.
 * ============================================================ */

window.AI_CONFIG = {
  ACTIVE_BRAIN: "claude_supergrok", // "claude_supergrok" | "local_llama" | "rulebased"

  CLAUDE_SUPERGROK: {
    id: "claude_supergrok",
    navn: "Claude via SuperGrok (Produksjonshjerne)",
    beskrivelse: "Toppklasse resonnering for anbud, mengdeberegning og innkjøp.",
    endpoint: "", // Konfigureres via sikker proxy, f.eks. https://api.odegardens.no/proxy/claude
    model: "claude-3-5-sonnet",
    status: "Klargjort for serverless proxy"
  },

  LOCAL_LLAMA: {
    id: "local_llama",
    navn: "Lokal Qwen 3.5 9B (RTX 5060 Ti)",
    beskrivelse: "Kjører lokalt på denne maskinens GPU (port 8080). 0 kr skykostnad.",
    endpoint: "http://127.0.0.1:8080/v1/chat/completions",
    model: "qwen3.5-9b",
    status: "Aktiv på port 8080"
  },

  RULEBASED: {
    id: "rulebased",
    navn: "Regelbasert Anbudsmotor (Instant Demo)",
    beskrivelse: "Øyeblikkelig anbudskalkulering og ruting uten nettverksavhengighet.",
    status: "Alltid tilgjengelig"
  },

  TIMEOUT_MS: 20000
};

window.AI_PROMPTS = {
  anbud: `Du er Ødegårdens digitale anbuds- og driftssekretær på Bergemoen i Grimstad (etablert 1965, Gasellebedrift 3 år på rad).
Du hjelper kunder (private, bedrifter, borettslag, kommunen) med å spesifisere og kalkulere oppdrag.
Fakta:
- Hovedbase: Bergeveien 8, 4886 Grimstad. Tlf 37 04 31 02 / 908 60 707, post@odegardens.no.
- Egenkultiverte trær og hekker fra Tovdal og Bergemoen for optimal hardførhet i norsk klima.
- Vinterdrift med 13 brøytemaskiner, erfaring siden 1995, kunder som Mesta, Grimstad Kommune og E-18 kryss, døgnkontinuerlig mekanikervakt.
- Samarbeid med Reddal Sand: 12 fraksjoner løsvekt (pukk, singel, sand, bark, kompostjord). Egen kortterminal og Vipps.
- Anleggsgartner: Hagedesign, belegningsstein, trapper, støttemurer, skifer, ferdigplen, helårs drift av parker og idrettsanlegg.
Retningslinjer:
1. Vær profesjonell, jordnær, faglig sterk og hyggelig.
2. Still målrettede spørsmål for å kartlegge: tjenestetype, areal/volum/løpemeter, adresse, ønsket oppstart, navn og telefon.
3. Gi veiledende mengdeberegninger (f.eks. pukk og sand til belegningsstein, barkdybde 5-7 cm, 2.5-3 hekkplanter per meter).
4. Ikke oppgi bindende fastpriser, men generer et fullstendig spesifisert tilbudsutkast med ruting.`,

  drift: `Du er drifts- og innkjøpsrådgiver for Ødegårdens ledelse og gartnere.
Du analyserer lagerbeholdning (trær, vintergrønt, løsvekt), feltstatus i Tovdal og Bergemoen, sesongoptimaliserte bestillingstidspunkter og leverandørpriser.
Mål: Maksimere marginer, unngå plantesvinn og sikre at anbudsleveranser har rett materiell til rett tid.`
};
