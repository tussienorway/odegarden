# Hva er nytt og bedre enn dagens odegardens.no

1. **Mobilvennlig og moderne design** med fast meny, hamburgermeny på mobil, store bilder og tydelige knapper.
2. **Én samlet side**: hagesenter, planteskole, anleggsgartner, brøyting, drift/vedlikehold og løsvekt på ett sted. Kontakt nås med ett trykk.
3. **Åpningstider og telefon synlig med en gang**, og telefonnumrene kan trykkes direkte på mobil.
4. **Ny tjeneste synliggjort:** «Drift og vedlikehold av parker og idrettsanlegg» har eget kort (i dag er den bare nevnt i en setning).
5. **Løsvekt-utvalget** (grus, singel, pukk, sand, bark, flis, kompostjord) vises som en oversikt på forsiden, ikke bare som et nyhetsinnlegg fra 2019.
6. **Før/etter-skyvebryter** som viser forvandlingen. KI-genererte førbilder er tydelig merket.
7. **«Se din hage»**: kunden laster opp et bilde og velger tiltak (belegningsstein, mur, skifer, hekk, beplantning, plen). Den viser foreløpig eksempler fra egne jobber (ekte etterbilder, KI-merkede førbilder), og en krok for KI-bilde/-video er klargjort (ikke aktiv).
8. **Galleri med filter** (hagesenter, planteskole, anleggsgartner, brøyting) og forstørrelse. Dagens galleri er én lang liste uten sortering.
9. **Videogalleri** som fylles via `assets/video/videos.json`.
10. **Prisseksjon** med tydelig merkede EKSEMPEL-priser per m²/m³ som bedriften fyller inn. I dag står det ingen priser.
11. **Digital sekretær (salgspunkt)** – chat på hele siden som svarer om åpningstider, hagesenter, planteskole, anleggsgartner, brøyting/strøing/feiing, parkdrift og løsvekt (bark/matjord), stiller oppfølgingsspørsmål (mål, bilder, adresse, tidsrom) og lager ferdig e-post til post@odegardens.no. KI er klargjort via proxy-krok, men ikke aktivert i demoen; regelbasert reserve svarer nå. Plassholder for telefon/talesvar (ikke bygget).
12. **Kontaktskjema med e-post**: åpner kundens e-post med ferdig utfylt emne og tekst. Dagens kontaktside (/kontakt/) gir 404.
13. **Raskere og sikrere**: statisk side uten WordPress og plugins (ingen xmlrpc/innlogging å angripe). Kan driftes gratis på GitHub Pages.
14. **SEO**: beskrivende tittel og metabeskrivelse, alt-tekster på bilder og lazy-loading.
15. **Adminpanel (ikke lenket, noindex)** med:
    - anbudsoversikt med status og frister, og anbudsgenerator (poster, 25 % mva, utskrift/PDF)
    - eier-modus med materialkalkulator: belegningsstein (stein per format, bærelag, settesand, kantstein, svinn) og bark/matjord/grus i m³, tonn og antall lass
    - anbudsagent for offentlige oppdrag: ferdige Doffin-søk (drift parker, idrettsanlegg, grøntanlegg, brøyting, vintervedlikehold), liste over fulgte utlysninger, sjekkliste (HMS, kvalifikasjoner, beredskap for brøyting, driftsplan) og krok for automatisk overvåking
    - eier-rådgiver: leverandørtyper, innkjøps- og forhandlingstips, og prisrådgivning med egen minimumsmargin (alle tall «EKSEMPEL – ikke bekreftet»; kun i admin)
    - eksport og import av data

## Kvalitetsløft (20.10.2026)
16. **Ytelse**: alle bilder i WebP (galleri med egne 480 px miniatyrer), responsivt hero-bilde med preload, lazy-loading, videoer med `preload="none"` og plakatbilde, ingen eksterne fonter. Lighthouse lokalt: 99–100 i alle kategorier.
17. **Sesonginnhold**: vår, sommer, høst og vinter, med gjeldende sesong markert automatisk.
18. **«Åpent nå»-status** og åpningstider der dagens dag er uthevet.
19. **Sticky ring-knapp på mobil** (tel:) og «Skriv»-snarvei.
20. **Kart** (OpenStreetMap) som lastes først når kunden ber om det.
21. **Tilgjengelighet**: skip-lenke, tydelig fokusmarkering, aria-merking, alt-tekster, slider med tastaturstyring og respekt for «redusert bevegelse».
22. **SEO**: canonical, Open Graph, LocalBusiness/GardenStore JSON-LD (adresse, åpningstider, koordinater), sitemap.xml og robots.txt.
