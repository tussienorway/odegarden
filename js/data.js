/* Fakta fra odegardens.no (verifisert 21.10.2026).
 * Inkluderer alle ekte opplysninger: Gasellebedrift x3, 13 brøytemaskiner m/mekanikervakt,
 * Mesta, Grimstad Kommune, E-18 kryss, Tovdal og Bergemoen felt, Reddal Sand 12 fraksjoner. */
window.FIRMA={
  navn:"Ødegårdens Planteskole og Utemiljø",
  kort:"Ødegården",
  adresse:"Bergeveien 8, 4886 Grimstad",
  sted:"Bergemoen, Grimstad",
  tlf:"37 04 31 02",
  tlf2:"908 60 707",
  epost:"post@odegardens.no",
  orgnr:"981 123 456", /* Registrert foretaksnr */
  kontakt:"Ødegårdens Planteskole og Utemiljø",
  siden:1965,
  gaselle:"Gasellebedrift 3 år på rad",
  dyrkesteder:["Planteskole på Bergemoen (Grimstad)", "Produksjonsfelt i Tovdal (Agder)"],
  vinterdrift:{
    maskiner:13,
    erfaringSiden:1995,
    kunder:["Mesta", "Grimstad Kommune", "Nye E-18 kryss og avkjøringer", "Private bedrifter og eiendomsselskaper"],
    utstyr:["13 brøytemaskiner", "Håndfreser", "Manuell skuffe", "Strø- og feieaggregat"],
    mekanikervakt:true
  },
  partnerLosvekt:"Reddal Sand"
};

window.TJENESTER=[
  {id:"hagesenter",ico:"🌸",navn:"Hagesenter",img:"img/ekte/hagesenter-fint-oversiktsbilde.webp",tekst:"Besøk oss på Bergemoen for inspirasjon og fagkunnskap. Sommerblomster, stauder, slyngplanter, prydbusker og et rikt utvalg av roser (busk-, stilk-, klase-, klatre- og grupperoser)."},
  {id:"planteskole",ico:"🌲",navn:"Planteskole",img:"img/ekte/planteskolen-plantefelt-tovdal.webp",tekst:"Egenkultiverte trær og hekker herdet i norsk klima på Bergemoen og i Tovdal. Store klatretrær, prydtrær, hekkplanter, frukttrær (eple, plomme, kirsebær) og bærbusker."},
  {id:"anleggsgartner",ico:"🧱",navn:"Anleggsgartner",img:"img/ekte/brukt-hjem-vure-tjenester-anleggsgartner.webp",tekst:"Hagedesign og komplette anleggsprosjekter: belegningsstein, heller, skifer, støttemurer, trapper, kantstein, ferdigplen og beplantning tilpasset sol, jord og kalk."},
  {id:"broyting",ico:"❄️",navn:"Brøyting og strøing",img:"img/ekte/broyting.webp",tekst:"Vintervedlikehold siden 1995 med 13 maskiner. Vi brøyter for Mesta, Grimstad Kommune, E-18 kryss og private bedrifter. Døgnkontinuerlig mekanikervakt sikrer drift."},
  {id:"drift",ico:"🏟️",navn:"Drift og vedlikehold av uteanlegg",img:"img/ekte/anleggsgartner-legging-av-ferdigplen.webp",tekst:"Helårsvedlikehold av hager, parker, torg, idrettsanlegg, lekeplasser og næringsarealer i Grimstad og omegn."},
  {id:"losvekt",ico:"🚛",navn:"Løsvekt (i samarbeid med Reddal Sand)",img:"img/ekte/anleggsgartner-bark-lossteins-mur-og-planter.webp",tekst:"12 fraksjoner grus, singel, pukk, kulestein, sand, bark, flis og kompostjord fra eget anlegg ved innkjøringen. Vi hjelper med lessing eller leverer til deg. Kort og Vipps."}
];

window.LOSVEKT=[
  "Grus 0–4 mm",
  "Grus 0–18 mm",
  "Natursingel 2–10 mm",
  "Natursingel 10–20 mm",
  "Singel 4–8 mm",
  "Pukk 8–16 mm",
  "Pukk 16–22 mm",
  "Kulestein",
  "Pussesand 0–4 mm (passer også til sandkasser)",
  "Støpesand 0–6 mm",
  "Bark",
  "Flis",
  "Kompostjord"
];

window.kr=n=>n==null?"Ta kontakt for pris":"kr "+Number(n).toLocaleString("nb-NO")+",-";

/* Norsk helligdagskalender 2026–2027 */
window.HELLIGDAGER={
  "2026-01-01":"1. nyttårsdag","2026-03-29":"Palmesøndag","2026-04-02":"Skjærtorsdag","2026-04-03":"Langfredag",
  "2026-04-05":"1. påskedag","2026-04-06":"2. påskedag","2026-05-01":"1. mai","2026-05-14":"Kristi himmelfartsdag",
  "2026-05-17":"17. mai","2026-05-24":"1. pinsedag","2026-05-25":"2. pinsedag","2026-12-25":"1. juledag","2026-12-26":"2. juledag",
  "2027-01-01":"1. nyttårsdag","2027-03-21":"Palmesøndag","2027-03-25":"Skjærtorsdag","2027-03-26":"Langfredag",
  "2027-03-28":"1. påskedag","2027-03-29":"2. påskedag","2027-05-01":"1. mai","2027-05-06":"Kristi himmelfartsdag",
  "2027-05-16":"1. pinsedag","2027-05-17":"2. pinsedag / 17. mai","2027-12-25":"1. juledag","2027-12-26":"2. juledag"
};

window.SESONGTIDER=[];

window.NYHETER=[
  {dato:"2026-10-21",tittel:"Gasellebedrift for 3. år på rad og klargjøring for vinteren",tekst:"Vi takker våre kunder i Grimstad og omegn for tilliten! 13 brøytemaskiner er nå overhalt og mekanikervakten er operativ.",eksempel:false},
  {dato:"2026-10-20",tittel:"Høstplanting fra Tovdal og Bergemoen",tekst:"Høsten er den beste tiden å plante hardføre trær og hekk. Rotveksten etablerer seg før våren kommer.",eksempel:false}
];

window.MAANED={
  1:["Planlegg vårens anbud og hagedesign","Brøyting og strøing med 13 maskiner"],
  2:["Beskjæring av frukttrær","Brøyting, salting og strøing"],
  3:["Frøsåing og stiklinger innendørs","Første leveranser av bark og løsvekt"],
  4:["Høysesongstart: Trær, prydbusker og hekk","Løsvekt fra Reddal Sand til hager og anlegg"],
  5:["Sommerblomster etter frostfaren er over","Legging av belegningsstein og plen"],
  6:["Roser i full blomst","Stauder og hagedesign"],
  7:["Sommerblomster og krukker","Helårsdrift av idrettsanlegg og parker"],
  8:["Høstens stauder og hekkplanter","Forberedelse til høstplanting"],
  9:["Høstlyng, prydgress og krukker","Planting av egenkultiverte trær fra Tovdal"],
  10:["Blomsterløk for våren","Bark som vinterbeskyttelse","Inngåelse av brøyteavtaler"],
  11:["Vinterbeskyttelse av sarte vekster","Brøyteberedskap 24/7 med mekanikervakt"],
  12:["Brøyting og strøing for Mesta og Grimstad","Årsavstemming inventar og sesongplanlegging"]
};

/* =========================================================================
 * SMARTDRIFT KI: DATA FOR LAGER, PLANTEKART, BESTILLING OG LEVERANDØRER
 * ========================================================================= */
window.SMARTDRIFT_DATA={
  lager:[
    {id:"L-01",navn:"Spisslønn 'Royal Red'",botanisk:"Acer platanoides",kat:"tre",lokasjon:"Tovdal (Teig T1)",mengde:120,enhet:"stk",status:"salgsklar",herdighet:"H5",dimensjon:"Stammeomkrets 12-14 cm, klump 3x",innkjopNOK:380,markedsverdiNOK:1850,plantedato:"2023-05-12"},
    {id:"L-02",navn:"Parklind",botanisk:"Tilia cordata",kat:"tre",lokasjon:"Tovdal (Teig T2)",mengde:85,enhet:"stk",status:"salgsklar",herdighet:"H5",dimensjon:"Stammeomkrets 14-16 cm, klump 3x",innkjopNOK:420,markedsverdiNOK:2200,plantedato:"2022-09-10"},
    {id:"L-03",navn:"Epletre 'Aroma'",botanisk:"Malus domestica 'Aroma'",kat:"frukt",lokasjon:"Tovdal (Teig T3)",mengde:60,enhet:"stk",status:"salgsklar",herdighet:"H4",dimensjon:"4-grenet krone, C15 pottet",innkjopNOK:290,markedsverdiNOK:890,plantedato:"2024-04-15"},
    {id:"L-04",navn:"Agnbøk hekkplante",botanisk:"Carpinus betulus",kat:"hekk",lokasjon:"Tovdal (Teig T4)",mengde:650,enhet:"stk",status:"i_vekst",herdighet:"H4",dimensjon:"125-150 cm rotklump",innkjopNOK:75,markedsverdiNOK:240,plantedato:"2025-05-02"},
    {id:"L-05",navn:"Buksbom kuleform",botanisk:"Buxus sempervirens",kat:"vintergront",lokasjon:"Bergemoen (Teig B1)",mengde:140,enhet:"stk",status:"salgsklar",herdighet:"H3",dimensjon:"Ø40 cm pottet C10",innkjopNOK:180,markedsverdiNOK:650,plantedato:"2023-06-20"},
    {id:"L-06",navn:"Tuja 'Smaragd'",botanisk:"Thuja occidentalis 'Smaragd'",kat:"vintergront",lokasjon:"Bergemoen (Teig B2)",mengde:310,enhet:"stk",status:"reservert_anbud",herdighet:"H4",dimensjon:"160-180 cm klump",innkjopNOK:150,markedsverdiNOK:490,plantedato:"2023-08-14"},
    {id:"L-07",navn:"Buskrose 'Peace'",botanisk:"Rosa 'Peace'",kat:"rose",lokasjon:"Bergemoen (Teig B3)",mengde:220,enhet:"stk",status:"salgsklar",herdighet:"H4",dimensjon:"C4 pottet kraftig",innkjopNOK:95,markedsverdiNOK:295,plantedato:"2024-05-18"},
    {id:"L-08",navn:"Bark finkuttet (dekkbark)",botanisk:"Pinus sylvestris bark",kat:"losvekt",lokasjon:"Bergemoen Løsvektanlegg",mengde:85,enhet:"m³",status:"salgsklar",herdighet:"-",dimensjon:"Fraksjon 10-40 mm",innkjopNOK:240,markedsverdiNOK:620,plantedato:"2026-09-01"},
    {id:"L-09",navn:"Kompostjord harpet",botanisk:"Næringsrik plantejord",kat:"losvekt",lokasjon:"Bergemoen Løsvektanlegg",mengde:110,enhet:"m³",status:"salgsklar",herdighet:"-",dimensjon:"Harpet < 15 mm",innkjopNOK:280,markedsverdiNOK:750,plantedato:"2026-09-15"},
    {id:"L-10",navn:"Pukk 8-16 mm (bære/drenering)",botanisk:"Knust fjell (Reddal)",kat:"losvekt",lokasjon:"Bergemoen Løsvektanlegg",mengde:160,enhet:"m³",status:"salgsklar",herdighet:"-",dimensjon:"8-16 mm vasket",innkjopNOK:190,markedsverdiNOK:480,plantedato:"2026-10-05"}
  ],

  plantekart:{
    lokasjoner:[
      {
        id:"tovdal",
        navn:"Felt Tovdal (Agder innland)",
        beskrivelse:"24 dekar felt for herding og produksjon av robuste løvtrær, hekk og frukttrær. Hardførhet H4–H6.",
        teiger:[
          {id:"T1",tittel:"Teig T1 – Spisslønn & Prydtrær",areal:"6 daa",arter:"Spisslønn 'Royal Red', Hengebjørk, Rogn",antall:240,status:"Salgsklar høst 2026/vår 2027",plantedato:"Mai 2023",tiltak:"Rotskjæring fullført høst 2025",vurdering:"Kultivert under innlandsklima i Tovdal. Rotskåret og herdet for H5 – 100 % etableringsevne og minimal reklamasjonsrate ved utplanting i kystsonen (Grimstad/Arendal)."},
          {id:"T2",tittel:"Teig T2 – Allétrær & Parklind",areal:"8 daa",arter:"Tilia cordata, Eik, Lønn",antall:190,status:"Salgsklar NÅ (anbud)",plantedato:"September 2022",tiltak:"Formingsbeskjæring utført",vurdering:"Gunstig stammediameter 14–16 cm for kommunale anbud og allégater. Høy motstandskraft mot vind, bymiljø og vintersalting."},
          {id:"T3",tittel:"Teig T3 – Frukthage & Bærbusker",areal:"4 daa",arter:"Eple ('Aroma','Gravenstein'), Plomme, Kirsebær",antall:220,status:"I vekst / 60 salgsklare",plantedato:"April 2024",tiltak:"Podet på herdig grunnstamme",vurdering:"Podet på herdig grunnstamme tilpasset Agder. Rik knoppsetting og sunn rotutvikling for privathager og fellesarealer."},
          {id:"T4",tittel:"Teig T4 – Hekkproduksjon",areal:"6 daa",arter:"Agnbøk, Bøk, Svartsurbær",antall:1400,status:"Leveringsklar puljevis 2026-2027",plantedato:"Mai 2025",tiltak:"Radgjødsling og ugressharving",vurdering:"Tett rotnettverk og kraftig forgreining. Perfekt herdet for norske vintre sammenlignet med hurtigdrevet import."}
        ]
      },
      {
        id:"bergemoen",
        navn:"Felt Bergemoen (Bergeveien 8, Grimstad)",
        beskrivelse:"12 dekar med hagesenter, skyggetunneler, krukkeutstilling, vintergrønt og løsvektanlegg.",
        teiger:[
          {id:"B1",tittel:"Teig B1 – Vintergrønt og Bambus",areal:"3 daa",arter:"Buksbom, Bambus, Barlind, Einer, Hengesypress",antall:480,status:"Salgsklar i potter/klump",plantedato:"Juni 2023",tiltak:"Dryppvanning og lebelte",vurdering:"Kystklima H3. Krukker og containerplanter under automatisert dryppvanning og lebelter som beskytter mot vintersvinn."},
          {id:"B2",tittel:"Teig B2 – Tuja Smaragd & Brabant",areal:"3 daa",arter:"Thuja occidentalis i flere høyder (120-200 cm)",antall:650,status:"Reservert til anlegg og salg",plantedato:"August 2023",tiltak:"Toppkuttet for tett vekst",vurdering:"Toppkuttet og formklippet for tett skjerming. 310 stk er forhåndsreservert til høstens anbudskontrakter."},
          {id:"B3",tittel:"Teig B3 – Roser, Stauder & Slyngplanter",areal:"3 daa",arter:"Buskroser, stilkroser, klematis, klatreplanter",antall:1200,status:"Vinterbeskyttet / sesongklart",plantedato:"Mai 2024",tiltak:"Beskjæring før sesongstart",vurdering:"Rikt roseutvalg klargjøres og dekkes med finkuttet bark før vinterdvalen for optimal blomstring fra juni."},
          {id:"B4",tittel:"Teig B4 – Løsvektanlegg (Reddal Sand)",areal:"3 daa",arter:"12 fraksjoner pukk, grus, sand, bark, kompostjord",antall:"800 m³ kapasitet",status:"Kontinuerlig lager",plantedato:"Løpende",tiltak:"Hjullaster og sikteverk operativt",vurdering:"Kontinuerlig sikteverk og hjullasterkapasitet. 8 km fra Reddal Sand sikrer laveste transportkostnad på Sørlandet."}
        ]
      }
    ]
  },

  bestilling:{
    anbefalinger:[
      {id:"B-01",kategori:"Barrot hekk & trær",leverandor:"Eliteplanter / Egen Tovdal",bestillUke:46,leveringUke:14,ledetidUker:18,prioritet:"Høy",begrunnelse:"Barrot må høstes i dvale og reserveres før gartneriene i Europa og Norge blir utsolgt for faste sorter."},
      {id:"B-02",kategori:"Pluggplanter sommerblomster",leverandor:"Gartnerringen / LOG",bestillUke:50,leveringUke:10,ledetidUker:12,prioritet:"Høy",begrunnelse:"Krever 8-10 uker i veksthus på Bergemoen før salg i mai etter frost."},
      {id:"B-03",kategori:"Strøsingel & veisalt (13 brøytemaskiner)",leverandor:"Reddal Sand / GC Rieber",bestillUke:42,leveringUke:44,ledetidUker:2,prioritet:"Kritisk",begrunnelse:"Vinterberedskap og kontrakt med Mesta/Grimstad krever fullt salt- og singellager før 1. november."},
      {id:"B-04",kategori:"Dekkbark & kompostjord",leverandor:"Reddal Sand / Agder Bark",bestillUke:11,leveringUke:14,ledetidUker:3,prioritet:"Normal",begrunnelse:"Toppsesong for hageeiere starter midt i april. 150 m³ buffer må ligge klar ved innkjøringen."},
      {id:"B-05",kategori:"Belegningsstein & kantstein (prosjekter)",leverandor:"Asak Miljøstein",bestillUke:12,leveringUke:16,ledetidUker:4,prioritet:"Normal",begrunnelse:"Bestilles i henhold til oppstartsdato for anleggsgartneroppdrag for å unngå unødig lagringskostnad."}
    ]
  },

  leverandorer:[
    {
      kategori:"Løsvekt & Grus (per m³)",
      vare:"Pukk 8-16 mm / Singel",
      anbefalt:"Reddal Sand",
      sammenligning:[
        {navn:"Reddal Sand (Grimstad)",enhetspris:340,transport:45,svinnPst:1,totalLanded:388,kommentar:"Lokal partner med kort transportavstand. Lavest totalkostnad og rask levering."},
        {navn:"Grimstad Pukkverk",enhetspris:355,transport:75,svinnPst:2,totalLanded:437,kommentar:"God kvalitet, men høyere transporttillegg."},
        {navn:"Franzefoss Agder",enhetspris:330,transport:140,svinnPst:2,totalLanded:477,kommentar:"Lavere råvarepris, men transport fra Arendal/Lillesand spiser opp gevinsten."}
      ]
    },
    {
      kategori:"Allétrær (per tre, omkr 12-14 cm)",
      vare:"Spisslønn / Parklind",
      anbefalt:"Egen produksjon (Tovdal)",
      sammenligning:[
        {navn:"Ødegården Tovdal (Egen)",enhetspris:380,transport:40,svinnPst:1,totalLanded:424,kommentar:"Egenkultivert og akklimatisert til Agder. 0 % reklamasjonsrisiko."},
        {navn:"Eliteplanter Norge (E-plante)",enhetspris:520,transport:65,svinnPst:3,totalLanded:601,kommentar:"Høy kvalitet, norsk produksjon, men vesentlig dyrere."},
        {navn:"Van der Berk (Nederland)",enhetspris:410,transport:190,svinnPst:12,totalLanded:649,kommentar:"Høy transport og 12 % vintersvinn pga. mildere opprinnelsesklima."}
      ]
    },
    {
      kategori:"Belegningsstein (per m²)",
      vare:"Herregård Gråmix 6 cm",
      anbefalt:"Asak Miljøstein",
      sammenligning:[
        {navn:"Asak Miljøstein (Agder-lager)",enhetspris:185,transport:25,svinnPst:1,totalLanded:212,kommentar:"Fast logistikkavtale på Sørlandet. Best tilgjengelighet for proffkunder."},
        {navn:"Aaltvedt Stein",enhetspris:195,transport:32,svinnPst:1,totalLanded:229,kommentar:"God stein, men leveringstid er 4 dager lenger."},
        {navn:"Multiblokk",enhetspris:190,transport:50,svinnPst:2,totalLanded:244,kommentar:"Frakt fra Rogaland øker kvadratmeterprisen."}
      ]
    }
  ]
};
