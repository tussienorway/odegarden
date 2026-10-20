/* Fakta fra odegardens.no (lest 20.10.2026). EKSEMPEL = plassholder bedriften fyller inn. */
window.FIRMA={navn:"Ødegårdens Planteskole og Utemiljø",kort:"Ødegården",adresse:"Bergeveien 8, 4886 Grimstad",sted:"Bergemoen, Grimstad",tlf:"37 04 31 02",tlf2:"908 60 707",
  epost:"post@odegardens.no", /* PLASSHOLDER: fra dagens nettside – bekreftes av bedriften */
  orgnr:"", /* MANGLER – fylles inn */ kontakt:"Ødegårdens Planteskole og Utemiljø",siden:1965};
window.TJENESTER=[
{id:"hagesenter",ico:"🌸",navn:"Hagesenter",img:"img/ekte/hagesenter-fint-oversiktsbilde.webp",tekst:"Besøk oss på Bergemoen for inspirasjon og nyttig kunnskap om uterommet. Sommerblomster, stauder, slyngplanter, prydbusker og roser."},
{id:"planteskole",ico:"🌲",navn:"Planteskole",img:"img/ekte/planteskolen-plantefelt-tovdal.webp",tekst:"Egenkultiverte trær som er hardføre for vellykket omplantning i norsk klima. Løvtrær, nåletrær, hekkplanter, frukttrær og bærbusker."},
{id:"anleggsgartner",ico:"🧱",navn:"Anleggsgartner",img:"img/ekte/brukt-hjem-vure-tjenester-anleggsgartner.webp",tekst:"Hagedesign og komplette prosjekt med belegningsstein, heller, skifer, støttemurer, trapper og kantstein – og riktig beplantning."},
{id:"broyting",ico:"❄️",navn:"Brøyting og strøing",img:"img/ekte/broyting.webp",tekst:"Brøyting, strøing og feiing for private, borettslag og bedrifter – fra oppkjørselen hjemme til store parkeringsplasser."},
{id:"drift",ico:"🏟️",navn:"Drift og vedlikehold av parker og idrettsanlegg",img:"img/ekte/anleggsgartner-legging-av-ferdigplen.webp",tekst:"Helårsvedlikehold av hager, parker, torg, idrettsanlegg, lekeplasser og andre utendørs arealer."},
{id:"losvekt",ico:"🚛",navn:"Bark og matjord i løsvekt",img:"img/ekte/anleggsgartner-bark-lossteins-mur-og-planter.webp",tekst:"Grus, singel, pukk, kulestein, sand, bark, flis og kompostjord fra eget anlegg ved innkjøringen. Vi hjelper deg å lesse, eller vi leverer."}];
window.LOSVEKT=["Grus 0–4 mm","Grus 0–18 mm","Natursingel 2–10 mm","Natursingel 10–20 mm","Singel 4–8 mm","Pukk 8–16 mm","Pukk 16–22 mm","Kulestein","Pussesand 0–4 mm (passer til sandkasser)","Støpesand 0–6 mm","Bark","Flis","Kompostjord"];
window.kr=n=>n==null?"Ta kontakt for pris":"kr "+Number(n).toLocaleString("nb-NO")+",-";

/* Helligdager (hagesenteret stengt). Kilde: norsk helligdagskalender 2026–2027. */
window.HELLIGDAGER={"2026-01-01":"1. nyttårsdag","2026-03-29":"Palmesøndag","2026-04-02":"Skjærtorsdag","2026-04-03":"Langfredag","2026-04-05":"1. påskedag","2026-04-06":"2. påskedag","2026-05-01":"1. mai","2026-05-14":"Kristi himmelfartsdag","2026-05-17":"17. mai","2026-05-24":"1. pinsedag","2026-05-25":"2. pinsedag","2026-12-25":"1. juledag","2026-12-26":"2. juledag",
"2027-01-01":"1. nyttårsdag","2027-03-21":"Palmesøndag","2027-03-25":"Skjærtorsdag","2027-03-26":"Langfredag","2027-03-28":"1. påskedag","2027-03-29":"2. påskedag","2027-05-01":"1. mai","2027-05-06":"Kristi himmelfartsdag","2027-05-16":"1. pinsedag","2027-05-17":"2. pinsedag / 17. mai","2027-12-25":"1. juledag","2027-12-26":"2. juledag"};
/* Sesongperioder med egne åpningstider kan legges her: [{fra:"2026-11-01",til:"2027-02-28",tider:{1:[10,15],...}}] – ingen kjent per nå. */
window.SESONGTIDER=[];
/* Nyheter – lett å oppdatere. eksempel:true vises med EKSEMPEL-merke. */
window.NYHETER=[{dato:"2026-10-20",tittel:"Høstplanting er i gang",tekst:"Høsten er en fin tid å plante trær, hekk og busker. Kom innom for råd om hva som passer i din hage.",eksempel:true}];
/* «Nå i butikken» per måned – generelle sesongtips, ring og hør om lager. */
window.MAANED={1:["Planlegg vårens hageprosjekt","Brøyting og strøing"],2:["Beskjæring av frukttrær","Brøyting og strøing"],3:["Frøsåing innendørs","Vårens første planter"],4:["Trær, busker og hekk","Bark og jord til bedene"],5:["Sommerblomster","Krukker og ampler"],6:["Roser i blomst","Stauder"],7:["Sommerblomster","Vanningstips"],8:["Høstens første stauder","Hekk"],9:["Høstlyng og krukker","Høstplanting av trær"],10:["Blomsterløk for våren","Høstplanting av trær og hekk","Bark som vinterbeskyttelse","Brøyteavtale for vinteren"],11:["Vinterbeskyttelse","Brøyteavtale"],12:["Brøyting og strøing","Planlegg neste sesong"]};
