(function(){
const $=s=>document.querySelector(s),esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const STATUS={ny:"Ny",bor:"Bør sendes",sendt:"Sendt",vunnet:"Vunnet",tapt:"Tapt"};
const fmt=n=>Number(n||0).toLocaleString("nb-NO",{minimumFractionDigits:2,maximumFractionDigits:2});
const dato=d=>d?new Date(d).toLocaleDateString("nb-NO"):"–";const today=new Date().toISOString().slice(0,10);
const dager=d=>d?Math.ceil((new Date(d)-new Date(today))/864e5):null;
document.querySelectorAll(".tabs button").forEach(b=>b.onclick=()=>{document.querySelectorAll(".tabs button,.pane").forEach(x=>x.classList.remove("on"));b.classList.add("on");$("#"+b.dataset.p).classList.add("on");render()});
const A=()=>Store.get("anbud",[]),F=()=>Store.get("foresporsler",[]);
function render(){
  const a=A(),f=F();
  $("#kpi").innerHTML=[["Nye forespørsler",f.filter(x=>x.status==="ny").length],["Bør sendes",a.filter(x=>x.status==="bor"||x.status==="ny").length],["Sendt",a.filter(x=>x.status==="sendt").length],["Vunnet",a.filter(x=>x.status==="vunnet").length],["Verdi sendt (eks. mva)","kr "+fmt(a.filter(x=>x.status==="sendt").reduce((s,x)=>s+(+x.belop||0),0))]].map(([t,v])=>`<div><b>${v}</b>${t}</div>`).join("");
  const bor=a.filter(x=>x.status==="bor"||x.status==="ny").sort((x,y)=>(x.frist||"9")<(y.frist||"9")?-1:1);
  $("#bor").innerHTML=bor.length?tab(bor):'<p class="note">Ingenting som haster 🎉</p>';
  $("#ftab").innerHTML=f.length?`<table class="t"><tr><th>Dato</th><th>Kilde</th><th>Kunde</th><th>Tjeneste</th><th>Beskrivelse</th><th>Status</th><th></th></tr>${f.map(x=>`<tr><td>${dato(x.dato)}</td><td>${esc(x.kilde)}</td><td>${esc(x.navn)}<br>${esc(x.tlf)} ${esc(x.epost)}<br>${esc(x.adresse)}</td><td>${esc(x.tjeneste)}</td><td>${esc(x.beskrivelse)}${x.samtale?`<details><summary>Samtale</summary><pre style="white-space:pre-wrap">${esc(x.samtale)}</pre></details>`:""}</td><td>${x.status==="ny"?'<span class="st st-ny">Ny</span>':'<span class="st st-sendt">Behandlet</span>'}</td><td><button class="btn" style="padding:6px 12px" data-tilanbud="${x.id}">→ Anbud</button></td></tr>`).join("")}</table>`:'<p class="note">Ingen forespørsler ennå. De dukker opp her når kunder bruker skjemaet eller chatten.</p>';
  const fil=$("#afilter").value,aa=a.filter(x=>!fil||x.status===fil);$("#atab").innerHTML=aa.length?tab(aa,true):'<p class="note">Ingen anbud.</p>';
  renderKommune();
}
function tab(a,edit){return `<table class="t"><tr><th>Kunde / jobb</th><th>Status</th><th>Frist</th><th>Beløp eks. mva</th><th>Sendt</th>${edit?"<th></th>":""}</tr>${a.map(x=>{const d=dager(x.frist);return `<tr><td><b>${esc(x.kunde)}</b><br>${esc(x.tittel)}${x.offentlig?' <span class="tag">Offentlig</span>':""}</td><td>${edit?`<select data-st="${x.id}">${Object.entries(STATUS).map(([k,v])=>`<option value="${k}" ${k===x.status?"selected":""}>${v}</option>`).join("")}</select>`:`<span class="st st-${x.status}">${STATUS[x.status]}</span>`}</td><td>${edit?`<input type="date" data-frist="${x.id}" value="${x.frist||""}">`:dato(x.frist)} ${d!=null&&!["sendt","vunnet","tapt"].includes(x.status)?`<div class="${d<0?"late":d<=3?"late":""}">${d<0?"Frist passert":d===0?"I dag!":d+" dager igjen"}</div>`:""}</td><td>${x.belop?"kr "+fmt(x.belop):"–"}</td><td>${dato(x.sendt)}</td>${edit?`<td><button class="btn ghost" style="padding:4px 10px" data-apne="${x.id}">Åpne</button> <button class="btn ghost" style="padding:4px 10px" data-slett="${x.id}">✕</button></td>`:""}</tr>`}).join("")}</table>`}
$("#afilter").innerHTML+=Object.entries(STATUS).map(([k,v])=>`<option value="${k}">${v}</option>`).join("");$("#afilter").onchange=render;
document.addEventListener("change",e=>{const t=e.target,a=A();
  if(t.dataset.st){const x=a.find(y=>y.id===t.dataset.st);x.status=t.value;if(t.value==="sendt"&&!x.sendt)x.sendt=today;Store.set("anbud",a);render()}
  if(t.dataset.frist){a.find(y=>y.id===t.dataset.frist).frist=t.value;Store.set("anbud",a);render()}});
document.addEventListener("click",e=>{const t=e.target;
  if(t.dataset.slett&&confirm("Slette anbudet?")){Store.set("anbud",A().filter(x=>x.id!==t.dataset.slett));render()}
  if(t.dataset.tilanbud){const f=F(),r=f.find(x=>x.id===t.dataset.tilanbud);r.status="behandlet";Store.set("foresporsler",f);loadGen({kunde:r.navn,adr:r.adresse,tlf:[r.tlf,r.epost].filter(Boolean).join(" / "),tittel:r.tjeneste,poster:[{b:r.tjeneste||"",m:1,e:"stk",p:0}],fraForesp:r.id});go("gen")}
  if(t.dataset.apne){const x=A().find(y=>y.id===t.dataset.apne);loadGen({...x.gen,anbudId:x.id});go("gen")}
  if(t.dataset.del!=null){rows.splice(+t.dataset.del,1);drawRows()}});
const go=p=>document.querySelector(`.tabs [data-p=${p}]`).click();
$("#nytt-anbud").onclick=()=>{const kunde=prompt("Kunde / oppdragsgiver?");if(!kunde)return;const a=A();a.unshift({id:Store.id(),kunde,tittel:prompt("Kort jobbtittel?")||"",status:"bor",frist:"",belop:0});Store.set("anbud",a);render()};
// anbudsgenerator
let rows=[],cur={};
const MALER={Natursteinsmur:[["Rigg og drift",1,"RS"],["Graving og bortkjøring av masser",0,"m³"],["Bærelag / pukk",0,"tonn"],["Natursteinsmur inkl. stein",0,"m²"],["Drenering bak mur",0,"lm"]],Belegningsstein:[["Rigg og drift",1,"RS"],["Utgraving",0,"m³"],["Forsterkningslag / bærelag",0,"m²"],["Settesand og legging av belegningsstein",0,"m²"],["Kantstein",0,"lm"]],Skifer:[["Rigg og drift",1,"RS"],["Underlag / avretting",0,"m²"],["Skiferheller levert og lagt",0,"m²"],["Fuging",0,"m²"]],"Bark/jord levert":[["Bark levert",0,"m³"],["Matjord levert",0,"m³"],["Utlegging",0,"m²"],["Transport",1,"tur"]],"Brøyting sesong":[["Brøyting og strøing",1,"sesong"],["Feiing vår",1,"stk"]],"Drift park":[["Gressklipp",0,"gang"],["Bedstell",0,"time"],["Beskjæring",0,"time"]],Hekkplanting:[["Graving av hekkgrøft",0,"lm"],["Jordforbedring",0,"m³"],["Hekkplanter",0,"stk"],["Planting",0,"lm"]]};
function loadGen(g){cur=g;$("#g-kunde").value=g.kunde||"";$("#g-adr").value=g.adr||"";$("#g-tlf").value=g.tlf||"";$("#g-tittel").value=g.tittel||"";$("#g-gyldig").value=g.gyldig||new Date(Date.now()+30*864e5).toISOString().slice(0,10);if(g.merk)$("#g-merk").value=g.merk;rows=g.poster||[];drawRows();vis()}
function drawRows(){$("#g-poster tbody").innerHTML=rows.map((r,i)=>`<tr><td><input data-i="${i}" data-k="b" value="${esc(r.b)}"></td><td><input data-i="${i}" data-k="m" type="number" step="any" min="0" value="${r.m}" style="width:80px"></td><td><input data-i="${i}" data-k="e" value="${esc(r.e)}" style="width:60px"></td><td><input data-i="${i}" data-k="p" type="number" step="any" min="0" value="${r.p}" style="width:110px"></td><td>${fmt(r.m*r.p)}</td><td><button class="btn ghost" style="padding:2px 8px" data-del="${i}">✕</button></td></tr>`).join("")}
$("#g-poster").addEventListener("input",e=>{const t=e.target;if(t.dataset.k){rows[t.dataset.i][t.dataset.k]=["m","p"].includes(t.dataset.k)?+t.value:t.value;t.closest("tr").children[4].textContent=fmt(rows[t.dataset.i].m*rows[t.dataset.i].p)}});
$("#g-add").onclick=()=>{rows.push({b:"",m:1,e:"stk",p:0});drawRows()};
$("#g-mal").onchange=e=>{(MALER[e.target.value]||[]).forEach(([b,m,u])=>rows.push({b,m,e:u,p:0}));e.target.value="";drawRows()};
const sum=()=>{const eks=Math.round(rows.reduce((s,r)=>s+(+r.m||0)*(+r.p||0),0)*100)/100,mva=Math.round(eks*25)/100;return {eks,mva,tot:Math.round((eks+mva)*100)/100}};
function vis(){const s=sum(),F0=FIRMA;$("#tilbud-doc").innerHTML=`<div style="display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap"><img src="img/logo.svg" style="height:60px" alt=""><div style="text-align:right">${F0.navn}<br>${F0.adresse}<br>Tlf ${F0.tlf} / ${F0.tlf2} · ${F0.epost}<br>${F0.orgnr?"Org.nr. "+F0.orgnr+" MVA":"Org.nr. ___"}</div></div>
<h2>Tilbud: ${esc($("#g-tittel").value)}</h2><p><b>Til:</b> ${esc($("#g-kunde").value)}<br>${esc($("#g-adr").value)}<br>${esc($("#g-tlf").value)}</p><p>Dato: ${dato(today)} · Gyldig til: ${dato($("#g-gyldig").value)}</p>
<table class="t"><tr><th>Post</th><th>Beskrivelse</th><th>Mengde</th><th>Enhet</th><th>Enhetspris</th><th style="text-align:right">Sum eks. mva</th></tr>${rows.map((r,i)=>`<tr><td>${i+1}</td><td>${esc(r.b)}</td><td>${r.m}</td><td>${esc(r.e)}</td><td>${fmt(r.p)}</td><td style="text-align:right">${fmt(r.m*r.p)}</td></tr>`).join("")}</table>
<table class="sum" style="margin-left:auto;margin-top:10px"><tr><td>Sum eks. mva</td><td style="text-align:right">kr ${fmt(s.eks)}</td></tr><tr><td>MVA 25 %</td><td style="text-align:right">kr ${fmt(s.mva)}</td></tr><tr><td><b>Totalt inkl. mva</b></td><td style="text-align:right"><b>kr ${fmt(s.tot)}</b></td></tr></table>
<p class="note" style="white-space:pre-wrap">${esc($("#g-merk").value)}</p><p>Med vennlig hilsen<br>${F0.kontakt}, ${F0.navn}</p>`;return s}
$("#g-vis").onclick=vis;
$("#g-lagre").onclick=()=>{const s=vis(),g={kunde:$("#g-kunde").value,adr:$("#g-adr").value,tlf:$("#g-tlf").value,tittel:$("#g-tittel").value,gyldig:$("#g-gyldig").value,merk:$("#g-merk").value,poster:rows};const a=A();
  let x=cur.anbudId&&a.find(y=>y.id===cur.anbudId);if(!x){x={id:Store.id(),status:"bor",frist:""};a.unshift(x);cur.anbudId=x.id}Object.assign(x,{kunde:g.kunde,tittel:g.tittel,belop:s.eks,gen:g});Store.set("anbud",a);toast("Lagret i anbudsoversikten");render()};
loadGen({poster:[]});
window.addPoster=list=>{list.forEach(([b,m,e])=>rows.push({b,m,e,p:0}));drawRows();vis()};
// ===== Kommuneagent =====
const K0={ord:["drift parker","idrettsanlegg","vedlikehold grøntanlegg","brøyting","vintervedlikehold","grøntanlegg","anleggsgartner"],varsel:false,epost:FIRMA.epost,frek:"Daglig"};
const K=()=>({...K0,...Store.get("kommune",{})}),U=()=>Store.get("utlysninger",[]);
const SJEKK=["Les hele konkurransegrunnlaget og noter tilbudsfrist og spørsmålsfrist","Skatteattest og MVA-attest (ikke eldre enn kravet i grunnlaget)","Firmaattest / utskrift fra Enhetsregisteret","Kvalifikasjonskrav: økonomisk kapasitet, erfaring og kompetanse dokumentert","Fyll ut ESPD hvis det kreves","HMS-erklæring og HMS-system beskrevet (SHA, risikovurdering)","HMS-kort (byggekort) for alle som skal arbeide på oppdraget","Lønns- og arbeidsvilkår / ev. krav om lærlinger","Forsikringer (ansvar) dokumentert","Prisskjema fylt ut nøyaktig etter grunnlagets mengder og enheter","Referanseprosjekter med kontaktperson (gjerne med bilder)","Miljøkrav (maskinpark, transport, avfall) besvart","Brøyting: beredskap, responstid, maskinliste og vaktordning beskrevet","Drift av parker/idrettsanlegg: driftsplan, frekvenser og sesongplan","Eventuelle forbehold vurdert – helst ingen","Signert tilbudsbrev","Levert i portalen (Doffin/Mercell) før fristen – lagre kvittering"];
window.KommuneAgent={
  sokeLenker(ord){const sted="Grimstad";return [...ord.map(o=>({t:`Doffin: ${o} ${sted}`,u:`https://www.doffin.no/search?searchString=${encodeURIComponent(o+" "+sted)}`})),{t:"Doffin: alle stikkord",u:`https://www.doffin.no/search?searchString=${encodeURIComponent(ord.join(" OR "))}`},{t:"Mercell (logg inn for søk)",u:"https://www.mercell.com/"},{t:"Grimstad kommune",u:"https://www.grimstad.kommune.no/"}]},
  /** API-HOOK: kall denne fra en ekte overvåkingstjeneste med [{tittel,oppdragsgiver,lenke,frist}] */
  onNyeUtlysninger(liste){const u=U();liste.forEach(x=>{if(!u.some(y=>y.lenke&&y.lenke===x.lenke))u.unshift({id:Store.id(),sjekk:{},...x,kilde:"automatisk"})});Store.set("utlysninger",u);render()},
  /** API-HOOK: sett WATCH_ENDPOINT i ai-config.js for å hente nye treff */
  async poll(){const ep=(window.AI_CONFIG||{}).WATCH_ENDPOINT;if(!ep)return null;const r=await fetch(ep+"?q="+encodeURIComponent(K().ord.join(",")));if(r.ok)this.onNyeUtlysninger(await r.json())}
};
function renderKommune(){const k=K(),u=U();
  $("#k-lenker").innerHTML=KommuneAgent.sokeLenker(k.ord).map(l=>`<a class="btn ghost" style="padding:6px 12px" target="_blank" rel="noopener" href="${l.u}">${esc(l.t)} ↗</a>`).join("");
  $("#k-ord").innerHTML=k.ord.map((o,i)=>`<label>${esc(o)} <span data-rmord="${i}" style="cursor:pointer">✕</span></label>`).join("");
  $("#k-varsel").checked=k.varsel;$("#k-epost").value=k.epost;$("#k-frek").value=k.frek;
  $("#u-liste").innerHTML=u.length?u.map(x=>{const d=dager(x.frist),n=Object.values(x.sjekk||{}).filter(Boolean).length;return `<div style="border-bottom:1px solid #eee;padding:8px 0"><b>${esc(x.tittel)}</b> ${x.eksempel?'<span class="tag" style="background:#ffe9c4;color:#8a5200">EKSEMPEL – ikke ekte</span>':""}<br>${esc(x.oppdragsgiver)} · Frist ${dato(x.frist)} ${d!=null?`<span class="${d<=7?"late":""}">(${d<0?"passert":d+" d"})</span>`:""} · Sjekkliste ${n}/${SJEKK.length} ${x.lenke?`· <a href="${esc(x.lenke)}" target="_blank" rel="noopener">Åpne</a>`:""}<br><button class="btn ghost" style="padding:3px 10px" data-tilanb="${x.id}">→ Registrer som anbud</button> <button class="btn ghost" style="padding:3px 10px" data-rmu="${x.id}">Fjern</button></div>`}).join(""):'<p class="note">Ingen utlysninger registrert. Bruk søkelenkene og legg inn aktuelle utlysninger her.</p>';
  const sv=$("#s-valg"),cv=sv.value;sv.innerHTML='<option value="">– velg utlysning –</option>'+u.map(x=>`<option value="${x.id}">${esc(x.tittel)}</option>`).join("");sv.value=cv;
  const x=u.find(y=>y.id===sv.value);$("#s-liste").innerHTML=x?SJEKK.map((s,i)=>`<label style="display:block;padding:4px 0"><input type="checkbox" style="width:auto" data-sj="${i}" ${x.sjekk?.[i]?"checked":""}> ${s}</label>`).join(""):"";}
$("#s-valg").onchange=renderKommune;
$("#s-liste").addEventListener("change",e=>{const u=U(),x=u.find(y=>y.id===$("#s-valg").value);x.sjekk=x.sjekk||{};x.sjekk[e.target.dataset.sj]=e.target.checked;Store.set("utlysninger",u);renderKommune()});
$("#k-add").onclick=()=>{const v=$("#k-nytt").value.trim();if(!v)return;const k=K();k.ord.push(v);Store.set("kommune",k);$("#k-nytt").value="";renderKommune()};
$("#k-lagre").onclick=()=>{const k=K();Object.assign(k,{varsel:$("#k-varsel").checked,epost:$("#k-epost").value,frek:$("#k-frek").value});Store.set("kommune",k);toast("Oppsett lagret (varsler krever overvåkingstjeneste)")};
$("#u-add").onclick=()=>{if(!$("#u-tittel").value)return toast("Skriv en tittel");const u=U();u.unshift({id:Store.id(),tittel:$("#u-tittel").value,oppdragsgiver:$("#u-oppd").value,lenke:$("#u-lenke").value,frist:$("#u-frist").value,sjekk:{}});Store.set("utlysninger",u);["#u-tittel","#u-oppd","#u-lenke","#u-frist"].forEach(s=>$(s).value="");renderKommune()};
document.addEventListener("click",e=>{const t=e.target;
  if(t.dataset.rmord!=null){const k=K();k.ord.splice(+t.dataset.rmord,1);Store.set("kommune",k);renderKommune()}
  if(t.dataset.rmu){Store.set("utlysninger",U().filter(x=>x.id!==t.dataset.rmu));renderKommune()}
  if(t.dataset.tilanb){const x=U().find(y=>y.id===t.dataset.tilanb),a=A();a.unshift({id:Store.id(),kunde:x.oppdragsgiver||"Offentlig oppdragsgiver",tittel:x.tittel,status:"bor",frist:x.frist,belop:0,offentlig:true});Store.set("anbud",a);toast("Lagt til i anbud");render()}});
// data
$("#d-exp").onclick=()=>{const d={};["foresporsler","anbud","kommune","utlysninger"].forEach(k=>d[k]=Store.get(k,null));const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(d,null,1)],{type:"application/json"}));a.download="odegarden-data.json";a.click()};
$("#d-imp").onchange=e=>{const r=new FileReader();r.onload=()=>{const d=JSON.parse(r.result);Object.entries(d).forEach(([k,v])=>v!=null&&Store.set(k,v));render();toast("Importert")};r.readAsText(e.target.files[0])};
$("#d-slett").onclick=()=>{if(confirm("Slette alle data i denne nettleseren?")){["foresporsler","anbud","kommune","utlysninger"].forEach(k=>localStorage.removeItem("odegarden_"+k));render()}};
$("#d-eks").onclick=()=>{const p=n=>new Date(Date.now()+n*864e5).toISOString().slice(0,10);
  Store.addRequest({navn:"Eksempel: Ola Nordmann",tlf:"000 00 000",adresse:"Eksempelveien 1",tjeneste:"Natursteinsmur",beskrivelse:"EKSEMPELDATA – ca. 10 m mur langs innkjørsel",kilde:"eksempel"});
  const a=A();a.unshift({id:Store.id(),kunde:"Eksempel: Kari Hansen",tittel:"Belegningsstein innkjørsel (EKSEMPEL)",status:"bor",frist:p(3),belop:0},{id:Store.id(),kunde:"Eksempel: Per Olsen",tittel:"Skiferterrasse (EKSEMPEL)",status:"sendt",frist:p(-2),sendt:p(-5),belop:0});Store.set("anbud",a);
  const u=U();u.unshift({id:Store.id(),eksempel:true,tittel:"EKSEMPEL: Vedlikehold av grøntanlegg",oppdragsgiver:"Eksempel-oppdragsgiver",lenke:"",frist:p(20),sjekk:{}});Store.set("utlysninger",u);render();toast("Eksempeldata lagt inn (tydelig merket)")};
render();
})();
