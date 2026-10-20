/* Fakta fra odegardens.no (lest 20.10.2026). EKSEMPEL = plassholder bedriften fyller inn. */
window.FIRMA={navn:"Ødegårdens Planteskole og Utemiljø",kort:"Ødegården",adresse:"Bergeveien 8, 4886 Grimstad",sted:"Bergemoen, Grimstad",tlf:"37 04 31 02",tlf2:"908 60 707",
  epost:"post@odegardens.no", /* PLASSHOLDER: fra dagens nettside – bekreftes av bedriften */
  orgnr:"", /* MANGLER – fylles inn */ kontakt:"Ødegårdens Planteskole og Utemiljø",siden:1965};
window.TJENESTER=[
{id:"hagesenter",ico:"🌸",navn:"Hagesenter",img:"img/ekte/hagesenter-fint-oversiktsbilde.webp",tekst:"Besøk oss på Bergemoen for inspirasjon og nyttig kunnskap om uterommet. Sommerblomster, stauder, slyngplanter, prydbusker og roser."},
{id:"planteskole",ico:"🌲",navn:"Planteskole",img:"img/ekte/planteskolen-plantefelt-tovdal.webp",tekst:"Egenkultiverte trær som er hardføre for vellykket omplantning i norsk klima. Løvtrær, nåletrær, hekkplanter, frukttrær og bærbusker."},
{id:"anleggsgartner",ico:"🧱",navn:"Anleggsgartner",img:"img/ekte/brukt-hjem-vure-tjenester-anleggsgartner.webp",tekst:"Hagedesign og komplette prosjekt med belegningsstein, heller, skifer, støttemurer, trapper og kantstein – og riktig beplantning."},
{id:"broyting",ico:"❄️",navn:"Snørydding – brøyting, strøing og feiing",img:"img/ekte/broyting.webp",tekst:"Vintervedlikehold for private og firmakunder siden 1995, med en maskinpark på 13 maskiner – fra private oppkjørsler til større veianlegg."},
{id:"drift",ico:"🏟️",navn:"Drift og vedlikehold av parker og idrettsanlegg",img:"img/ekte/anleggsgartner-legging-av-ferdigplen.webp",tekst:"Helårsvedlikehold av hager, parker, torg, idrettsanlegg, lekeplasser og andre utendørs arealer."},
{id:"losvekt",ico:"🚛",navn:"Bark og matjord i løsvekt",img:"img/ekte/anleggsgartner-bark-lossteins-mur-og-planter.webp",tekst:"I samarbeid med Reddal Sand: grus, singel, pukk, kulestein, sand, bark, flis og kompostjord fra eget anlegg ved innkjøringen. Vi hjelper deg å lesse, eller vi leverer."}];
window.LOSVEKT=["Grus 0–4 mm","Grus 0–18 mm","Natursingel 2–10 mm","Natursingel 10–20 mm","Singel 4–8 mm","Pukk 8–16 mm","Pukk 16–22 mm","Kulestein","Pussesand 0–4 mm (passer til sandkasser)","Støpesand 0–6 mm","Bark","Flis","Kompostjord"];
/* Ingen priser står på odegardens.no per 20.10.2026 – alt under er EKSEMPEL (null vises som «kr ___»). */
window.EKSEMPELPRISER=[
{tj:"Bark i løsvekt",enhet:"per m³",fra:null},{tj:"Matjord / kompostjord i løsvekt",enhet:"per m³",fra:null},{tj:"Grus, singel og pukk",enhet:"per m³",fra:null},{tj:"Levering av løsvekt",enhet:"per tur",fra:null},
{tj:"Belegningsstein inkl. grunnarbeid",enhet:"per m²",fra:null},{tj:"Hagedesign / plantetegning",enhet:"per prosjekt",fra:null},{tj:"Brøyting privat oppkjørsel",enhet:"per sesong",fra:null},{tj:"Drift og vedlikehold",enhet:"per time",fra:null},{tj:"Befaring og tilbud",enhet:"",fra:0,tekst:"Ta kontakt"}];
window.kr=n=>n==null?"kr ___":"kr "+Number(n).toLocaleString("nb-NO")+",-";
