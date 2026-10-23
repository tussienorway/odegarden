/* Regelbasert anbudsflyt. Fyller et strukturert anbudsskjema (felter fra PLAN-KI-APP.md),
   viser sammendrag som kunden må godkjenne, og gir ALDRI pris. */
(function(){
const KT=[["Privatperson","privat"],["Borettslag / sameie","borettslag"],["Bedrift","bedrift"],["Offentlig / kommune","offentlig"]];
const TJ=()=>TJENESTER.map(t=>[t.navn,t.id]);
const ja=t=>/^(ja|j|yes|gjerne|ok)/i.test(t.trim());
const num=t=>{const m=String(t).replace(/\s/g,"").replace(",",".").match(/\d+(\.\d+)?/);return m?+m[0]:null};
const STEG=[
 {k:"kundetype",q:"Hvem er forespørselen for?",qr:()=>KT.map(x=>x[0]),set:(a,t)=>{const x=KT.find(k=>t.toLowerCase().startsWith(k[0].toLowerCase().slice(0,5)));if(!x)return "Velg et av alternativene.";a.kundetype=x[1]}},
 {k:"firma",hvis:a=>a.kundetype!=="privat",q:"Navn på firma, borettslag eller virksomhet?",set:(a,t)=>{a.firma=t.trim()}},
 {k:"orgnr",hvis:a=>a.kundetype!=="privat",q:"Organisasjonsnummer? (valgfritt)",qr:()=>["Hopp over"],set:(a,t)=>{if(/hopp/i.test(t))return;const d=t.replace(/\D/g,"");if(d.length!==9)return "Org.nr. har 9 sifre – eller trykk «Hopp over».";a.orgnr=d}},
 {k:"tjeneste",q:"Hva gjelder det?",qr:()=>TJ().map(x=>x[0]),set:(a,t)=>{const x=TJ().find(k=>k[0].toLowerCase()===t.toLowerCase().trim())||TJ().find(k=>t.toLowerCase().includes(k[1].slice(0,5)));if(!x)return "Velg en av tjenestene.";a.tjeneste=x[1];a.tjeneste_navn=x[0]}},
 {k:"beskrivelse",q:"Beskriv kort hva du ønsker gjort.",set:(a,t)=>{if(t.trim().length<5)return "Skriv gjerne litt mer, så forstår vi jobben bedre.";a.beskrivelse=t.trim()}},
 {k:"storrelse",q:a=>a.tjeneste==="losvekt"?"Omtrent hvor mye? (f.eks. «3 m³ bark»)":"Omtrent hvor stort område? (f.eks. «60 m²»)",qr:()=>["Vet ikke"],set:(a,t)=>{if(/vet ikke/i.test(t))return;const n=num(t);if(n==null)return "Skriv et tall, eller trykk «Vet ikke».";if(a.tjeneste==="losvekt"||/m3|m³|kubikk/i.test(t))a.mengde_m3=n;else a.maal_m2=n}},
 {k:"adresse",q:"Hvor er jobben? (adresse eller sted)",set:(a,t)=>{a.adresse=t.trim()}},
 {k:"kommune",q:"Hvilken kommune?",qr:()=>["Grimstad","Arendal","Lillesand","Annen"],set:(a,t)=>{a.kommune=t.trim()}},
 {k:"onsket_oppstart",q:"Når ønsker du at jobben starter?",qr:()=>["Så fort som mulig","Innen en måned","Til våren","Fleksibel"],set:(a,t)=>{a.onsket_oppstart=t.trim()}},
 {k:"frist",q:"Er det en frist for tilbudet? (dato, eller «Ingen frist»)",qr:()=>["Ingen frist"],set:(a,t)=>{a.frist=/ingen/i.test(t)?"":t.trim()}},
 {k:"haster",q:"Hvor viktig er det at vi svarer raskt?",qr:()=>["Haster","Normal","Ikke travelt"],set:(a,t)=>{a.haster=/hast/i.test(t)?"hoy":/ikke/i.test(t)?"lav":"normal"}},
 {k:"befaring_onsket",q:"Ønsker du befaring?",qr:()=>["Ja","Nei"],set:(a,t)=>{a.befaring_onsket=ja(t)}},
 {k:"bilder",q:"Har du bilder av stedet? (I prototypen legger du dem ved i e-posten.)",qr:()=>["Ja","Nei"],set:(a,t)=>{a.bilder=ja(t)?["(kunden har bilder – legges ved)"]:[]}},
 {k:"budsjett",q:"Har du et budsjett i tankene? (valgfritt – vi gir ikke pris i chatten)",qr:()=>["Hopp over"],set:(a,t)=>{if(/hopp/i.test(t))return;const n=num(t);if(n==null)return "Skriv et beløp, eller trykk «Hopp over».";a.budsjett=n*(/k\b|tusen/i.test(t)?1000:1)}},
 {k:"navn",q:"Hva heter du?",set:(a,t)=>{if(t.trim().length<2)return "Skriv navnet ditt.";a.navn=t.trim()}},
 {k:"telefon",q:"Hvilket telefonnummer kan vi nå deg på?",set:(a,t)=>{const d=t.replace(/\D/g,"").replace(/^47(?=\d{8}$)/,"");if(d.length!==8)return "Telefonnummeret må ha 8 sifre.";a.telefon=d}},
 {k:"epost",q:"E-postadresse? (valgfritt)",qr:()=>["Hopp over"],set:(a,t)=>{if(/hopp/i.test(t))return;if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(t.trim()))return "Det ser ikke ut som en e-postadresse – eller trykk «Hopp over».";a.epost=t.trim()}},
 {k:"samtykke_personvern",q:"Godtar du at vi lagrer forespørselen for å svare deg? Se personvern.html.",qr:()=>["Ja, jeg godtar","Nei"],set:(a,t)=>{if(!ja(t))return "STOPP";a.samtykke_personvern=true}}
];
const KTN=Object.fromEntries(KT.map(x=>[x[1],x[0]])),HN={hoy:"Haster",normal:"Normal",lav:"Ikke travelt"};
const sammendrag=a=>[["Kunde",KTN[a.kundetype]+(a.firma?` – ${a.firma}`:"")+(a.orgnr?` (org.nr. ${a.orgnr})`:"")],["Tjeneste",a.tjeneste_navn],["Beskrivelse",a.beskrivelse],["Størrelse",a.maal_m2?a.maal_m2+" m²":a.mengde_m3?a.mengde_m3+" m³":"Ikke oppgitt"],["Sted",`${a.adresse}, ${a.kommune}`],["Oppstart",a.onsket_oppstart],["Frist",a.frist||"Ingen"],["Hast",HN[a.haster]],["Befaring",a.befaring_onsket?"Ja":"Nei"],["Bilder",a.bilder.length?"Ja":"Nei"],["Budsjett",a.budsjett?a.budsjett.toLocaleString("nb-NO")+" kr":"Ikke oppgitt"],["Kontakt",`${a.navn}, ${a.telefon}${a.epost?", "+a.epost:""}`]].map(([k,v])=>`${k}: ${v}`).join("\n");
let s=null;
const ask=()=>{while(s.i<STEG.length&&STEG[s.i].hvis&&!STEG[s.i].hvis(s.a))s.i++;
  if(s.i>=STEG.length){s.review=true;return {reply:"Takk! Her er sammendraget. Stemmer det?\n\n"+sammendrag(s.a)+"\n\nVi gir ikke pris i chatten – du får et tilbud fra oss.",qr:["Godkjenn og send","Start på nytt","Avbryt"]}}
  const st=STEG[s.i];return {reply:typeof st.q==="function"?st.q(s.a):st.q,qr:st.qr&&st.qr()}};
window.Anbud={
  get active(){return !!s},
  wants:t=>/tilbud|anbud|befaring|forespørsel|bestille/i.test(t),
  start(kanal){s={i:0,a:{kanal:kanal||"web",bilder:[]},logg:[]};const r=ask();r.reply="Jeg stiller noen korte spørsmål, viser et sammendrag du godkjenner, og sender forespørselen til riktig person hos oss. Skriv «avbryt» når som helst.\n\n"+r.reply;return r},
  async handle(t){if(!s)return Anbud.start();s.logg.push(t);
    if(/^avbryt/i.test(t.trim())){s=null;return {reply:"Avbrutt – ingenting er lagret.",qr:["Be om tilbud","Åpningstider"]}}
    if(/\b(pris|koste|kost|hva tar)/i.test(t)&&!s.review)return {reply:"Jeg kan ikke gi pris i chatten – prisen avhenger av jobben. Du får et tilbud fra oss når forespørselen er sendt.\n\n"+ask().reply,qr:ask().qr};
    if(s.review){
      if(/start på nytt/i.test(t))return Anbud.start(s.a.kanal);
      if(!/godkjenn/i.test(t))return {reply:"Trykk «Godkjenn og send», «Start på nytt» eller «Avbryt».",qr:["Godkjenn og send","Start på nytt","Avbryt"]};
      const a={...s.a,kilde_samtale:"Chat ("+s.a.kanal+"): "+s.logg.length+" svar. Full logg lagres ikke."};s=null;
      const rec=await DB.create(a);
      return {reply:`Takk! Forespørselen er registrert med referanse ${rec.id}.\n\nDen er sendt til: ${Ruting.rolle(rec.tildelt_til)}${rec.haster==="hoy"?" (haster)":""}. Vi tar kontakt så snart vi kan.\n\n(Prototype: lagres bare i denne nettleseren, ingen e-post eller SMS sendes.)`,anbud:rec,qr:["Åpningstider"]}}
    const st=STEG[s.i],err=st.set(s.a,t);
    if(err==="STOPP"){s=null;return {reply:"Den er grei – uten samtykke lagrer vi ingenting. Ring oss gjerne på 37 04 31 02.",qr:["Åpningstider"]}}
    if(err){const r=ask();return {reply:err,qr:r.qr}}
    s.i++;return ask()}
};
})();
