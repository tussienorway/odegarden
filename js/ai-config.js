/* ===================== KI-KONFIGURASJON =====================
 * KI er KLARGJORT, men IKKE AKTIVERT i demoen: tomme endpoint = regelbasert reserve.
 * Legg ALDRI API-nøkler her (filen er offentlig) – bruk en proxy som holder nøkkelen.
 *  POST CHAT_ENDPOINT  {mode, system, messages:[{role,content}]} -> {reply, request?}
 *  POST IMAGE_ENDPOINT {image, tiltak, prompt} -> {image}
 *  POST VIDEO_ENDPOINT {image, prompt} -> {video} | {jobId} + GET ?id=
 * ============================================================ */
window.AI_CONFIG={CHAT_ENDPOINT:"",IMAGE_ENDPOINT:"",VIDEO_ENDPOINT:"",
  VOICE_ENDPOINT:"", // PLASSHOLDER: telefon/talesvar med KI er IKKE bygget
  DEMO_VIDEO:"", // f.eks. "assets/demo/demo-rundtur.mp4" når en ekte rundtur-video finnes; tom = ingen video
  PUBLIC_TOKEN:"",MODEL_HINT:"",TIMEOUT_MS:60000};
window.AI_PROMPTS={
  kunde:`Du er digital sekretær for Ødegårdens Planteskole og Utemiljø på Bergemoen i Grimstad (siden 1965). Svar kort, vennlig og faglig på norsk.
Fakta: hagesenteret har åpent man–fre 09–16, lør 09–15, søndag etter avtale (utenfor sesong: se Facebook). Tlf 37 04 31 02 / 908 60 707, post@odegardens.no, Bergeveien 8, 4886 Grimstad.
Tjenester: hagesenter (sommerblomster, stauder, slyngplanter, prydbusker, roser), planteskole (egenkultiverte, hardføre trær, frukt og bær, hekk), anleggsgartner (hagedesign, belegningsstein, heller, skifer, støttemurer, trapper, kantstein, beplantning), brøyting og strøing for private og bedrifter, drift og vedlikehold av parker og idrettsanlegg, løsvekt (grus, singel, pukk, kulestein, sand, bark, flis, kompostjord; lessing eller levering; kort og Vipps).
Ikke oppgi priser – de står ikke på nettsiden. Ikke lov tidspunkt.
Ved forespørsel: still ett spørsmål om gangen – type jobb, mål (m², m³, løpemeter), bilder, adresse, ønsket tidsrom, navn, telefon – og lag et kort e-postutkast. Returner gjerne request:{tjeneste,maal,bilder,adresse,tidsrom,navn,tlf}.`
};
