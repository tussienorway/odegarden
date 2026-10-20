/* Adapter-lag for KI. Siden kaller kun AI.reply(history, mode).
 * Konfigurert CHAT_ENDPOINT -> proxy med systemprompt fra AI_PROMPTS[mode]. Ellers / ved feil -> regelbasert reserve. */
(function(){
const C=window.AI_CONFIG||{},F=window.FIRMA;
/* PLASSHOLDER: post@odegardens.no (fra dagens nettside) brukes til bedriften har bekreftet adressen. */
const MOTTAKER=F.epost;
const norm=s=>s.toLowerCase();
const FAG=[
 {k:["åpent","åpningstid","åpner","stenger","lørdag","søndag"],a:"Hagesenteret på Bergemoen har åpent:\n• Mandag–fredag 09:00–16:00\n• Lørdag 09:00–15:00\n• Søndag etter avtale\nUtenfor sesong og på helligdager: se Facebook-siden vår."},
 {k:["sommerblomst","staude","rose","slyngplant","prydbusk","hagesenter","krukke","rhododendron"],a:"I hagesenteret finner du sommerblomster, stauder, slyngplanter, prydbusker og mange typer roser (grupperoser, stilkroser, klaseroser, klatreroser og buskroser). Sommerblomster plantes ut etter at faren for nattefrost er over. Stauder er flerårige. Kom innom for gode råd!"},
 {k:["trær","treet","frukt","eple","plomme","kirsebær","bær","planteskole","hekk","tovdal"],a:"Planteskolen vår kultiverer egne trær som er hardføre i norsk klima, på Bergemoen og i Tovdal. Vi har løvtrær, nåletrær, hekkplanter, frukttrær og bærbusker. Planter som er vokst opp i norsk klima, er mer levedyktige enn importerte."},
 {k:["brøyt","snø","strø","feie","feiing","vinter","glatt"],a:"Vi brøyter, strør og feier for private og bedrifter, og har gjort det siden 1995. Vi har 13 maskiner, og jobbene spenner fra private oppkjørsler til større veianlegg. Større kunder kan få beredskapsvakt med mekaniker."},
 {k:["park","idrett","torg","lekeplass","drift","vedlikehold","gressklipp"],a:"Vi tar drift og vedlikehold av hager, parker, torg, idrettsanlegg, lekeplasser og andre utearealer, hele året."},
 {k:["bark","matjord","jord","kompost","grus","singel","pukk","sand","kulestein","flis","løsvekt","sandkasse"],a:"I samarbeid med Reddal Sand selger vi løsvekt fra eget anlegg ved innkjøringen til hagesenteret: grus 0–4 og 0–18 mm, natursingel 2–10 og 10–20 mm, singel 4–8 mm, pukk 8–16 og 16–22 mm, kulestein, pussesand 0–4 mm (fin til sandkasser), støpesand 0–6 mm, bark, flis og kompostjord. Vi hjelper deg å lesse, eller vi leverer. Vi tar kort og Vipps.\nTips: bark legges 5–7 cm tykt, og matjord til plen 10–15 cm. 20 m² bark à 5 cm blir ca. 1 m³."},
 {k:["belegning","heller","skifer","mur","trapp","kantstein","hagedesign","anleggsgartner","gårdsplass","innkjørsel"],a:"Som anleggsgartner tar vi komplette prosjekter med belegningsstein, heller, skifer, støttemurer, trapper og kantstein, og hagedesign med beplantning tilpasset sol, jord og kalk hos deg."},
 {k:["vei","finne","adresse","hvor ligger","kjøre"],a:"Vi holder til i Bergeveien 8, 4886 Grimstad. Ta av fra E-18, kjør mot Vesterled, ta av til Bergemoen og kjør inn til venstre i Bergeveien."}];
const STEG=[["tjeneste","Hva gjelder det?",()=>TJENESTER.map(t=>t.navn)],["maal","Omtrent hvor stort? (f.eks. «30 m²», «3 m³ bark», «oppkjørsel 40 m»)"],["bilder","Har du bilder av stedet? (ja/nei – du kan legge dem ved i e-posten)",()=>["Ja","Nei"]],["adresse","Hvor er jobben (adresse eller sted)?"],["tidsrom","Når ønsker du det gjort?",()=>["Så fort som mulig","I løpet av våren","Hele vinteren (brøyting)","Fleksibel"]],["navn","Hva heter du?"],["tlf","Hvilket telefonnummer kan vi nå deg på?"]];
const state={};
function utkast(d){return `Hei Ødegården!\n\nJeg ønsker hjelp/tilbud på: ${d.tjeneste}\nOmtrentlige mål: ${d.maal}\nAdresse: ${d.adresse}\nØnsket tidsrom: ${d.tidsrom}\nBilder: ${/^j/i.test(d.bilder)?"Ja – legger ved":"Nei"}\n${d.beskrivelse?"Kommentar: "+d.beskrivelse+"\n":""}\nMed vennlig hilsen\n${d.navn}\nTlf: ${d.tlf}`}
function mailto(d){return `mailto:${MOTTAKER}?subject=${encodeURIComponent(`Forespørsel: ${d.tjeneste} – ${d.adresse}`)}&body=${encodeURIComponent(utkast(d))}`}
function startFlow(tj){state.flow=true;state.data={tjeneste:tj||""};state.i=tj?1:0;const s=STEG[state.i];return {reply:(tj?`Supert – ${tj.toLowerCase()}! Jeg stiller noen korte spørsmål og lager et utkast til henvendelse.\n\n`:"Flott! Jeg stiller noen korte spørsmål og lager et utkast til henvendelse.\n\n")+s[1],qr:s[2]&&s[2]()}}
function flow(raw){const d=state.data,[key]=STEG[state.i];
  if(key==="tlf"&&!/\d{8}/.test(raw.replace(/\D/g,"")))return {reply:"Det ser ikke ut som et telefonnummer (8 sifre). Prøv igjen 🙂"};
  d[key]=raw.trim();state.i++;
  if(state.i<STEG.length){const s=STEG[state.i];return {reply:s[1],qr:s[2]&&s[2]()}}
  state.flow=false;const req={...d,beskrivelse:`${d.maal}. Tidsrom: ${d.tidsrom}. Bilder: ${d.bilder}`,kilde:"chat"};
  return {reply:"Her er utkastet til henvendelsen din ✍️\n\n"+utkast(d)+"\n\nTrykk «Send på e-post» for å åpne e-postprogrammet ditt med alt ferdig utfylt (legg gjerne ved bildene). (Demo: ingenting sendes før du trykker send i e-postprogrammet.)",request:req,actions:[{label:"✉️ Send på e-post",href:mailto(d)},{label:"📋 Kopier tekst",copy:utkast(d)}]}}
function rules(history){
  const raw=history[history.length-1].content,t=norm(raw);
  if(state.flow)return flow(raw);
  const has=(...w)=>w.some(x=>t.includes(x));
  if(has("bestill","befaring","tilbud","anbud","forespørsel","ja, bestill","ja"))return startFlow(state.lastTj);
  if(has("pris","koste","kost","hva tar"))return {reply:"Prisene står ikke på nettsiden – de avhenger av mengde, levering og jobbens omfang. Jeg kan lage en forespørsel, så får du et konkret svar.",qr:["Bestille befaring"]};
  if(has("telefon","ring","talesvar"))return {reply:`Du når oss på ${F.tlf}. (Telefonsvar med digital sekretær er planlagt, men ikke bygget.)`};
  if(has("hei","hallo","heisann","god dag")&&t.length<20)return {reply:"Hei! 👋 Jeg er Ødegårdens digitale sekretær. Spør om åpningstider, planter, løsvekt, brøyting eller anleggsarbeid – eller få hjelp til en forespørsel.",qr:["Åpningstider","Bark og matjord","Bestille befaring"]};
  for(const f of FAG)if(f.k.some(k=>t.includes(k))){const tj=TJENESTER.find(s=>f.k.some(k=>norm(s.navn).includes(k)));if(tj)state.lastTj=tj.navn;return {reply:f.a+"\n\nVil du at jeg lager en forespørsel?",qr:["Bestille befaring","Åpningstider"]}}
  for(const s of TJENESTER)if(t.includes(norm(s.navn).slice(0,6))){state.lastTj=s.navn;return {reply:`${s.ico} ${s.navn}: ${s.tekst}\n\nVil du at jeg lager en forespørsel?`,qr:["Bestille befaring"]}}
  if(has("tjenest","hva gjør","hva kan"))return {reply:"Vi tilbyr:\n"+TJENESTER.map(s=>`${s.ico} ${s.navn}`).join("\n"),qr:TJENESTER.slice(0,4).map(s=>s.navn)};
  if(has("kontakt","adresse","epost","e-post"))return {reply:`📞 ${F.tlf}\n✉️ ${F.epost}\n📍 ${F.adresse}\nTlf 2: ${F.tlf2}`};
  if(has("takk"))return {reply:"Bare hyggelig! Velkommen innom på Bergemoen 🌸"};
  return {reply:`Det er jeg ikke sikker på, men vi svarer gjerne på ${F.tlf} eller ${F.tlf2}. Jeg kan også lage en forespørsel for deg.`,qr:["Bestille befaring","Tjenester"]};
}
async function remote(history,mode){
  const ctl=new AbortController(),to=setTimeout(()=>ctl.abort(),C.TIMEOUT_MS||60000);
  const r=await fetch(C.CHAT_ENDPOINT,{method:"POST",signal:ctl.signal,headers:{"Content-Type":"application/json",...(C.PUBLIC_TOKEN?{Authorization:"Bearer "+C.PUBLIC_TOKEN}:{})},body:JSON.stringify({mode,system:(window.AI_PROMPTS||{})[mode]||"",messages:history,model:C.MODEL_HINT||undefined})});
  clearTimeout(to);if(!r.ok)throw new Error("HTTP "+r.status);const j=await r.json();
  if(j.request&&mode==="kunde"){j.actions=[{label:"✉️ Send på e-post",href:mailto({...{tjeneste:"",maal:"",adresse:"",tidsrom:"",bilder:"",navn:"",tlf:""},...j.request})}]}
  return j;
}
const fallbacks={kunde:rules};
window.AI={
  configured:()=>!!C.CHAT_ENDPOINT,
  registerFallback(mode,fn){fallbacks[mode]=fn},
  utkast,mailto,
  /** history=[{role,content}], mode="kunde"|"kristian" -> {reply, qr?, request?, actions?} */
  async reply(history,mode="kunde"){
    if(C.CHAT_ENDPOINT&&!(mode==="kunde"&&state.flow)){try{return await remote(history,mode)}catch(e){console.warn("KI utilgjengelig, bruker reserve:",e.message)}}
    return (fallbacks[mode]||rules)(history);
  }
};
})();
