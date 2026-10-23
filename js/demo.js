(function(){
const $=s=>document.querySelector(s),esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const C=RUTING_CONFIG,ROLLER=[["","Alle"],...Object.entries(C.roller).map(([k,v])=>[k,v.navn])],HN={hoy:"Haster",normal:"Normal",lav:"Lav"},STATUS=["ny","tildelt","tilbud sendt","vunnet","tapt"];
let rolle="",valgt=null,data=[];
$("#d-tabs").innerHTML=ROLLER.map(([k,n])=>`<button type="button" role="tab" data-r="${k}" aria-selected="${k===""}">${n} <span class="cnt" data-c="${k}"></span></button>`).join("");
$("#d-regler").innerHTML=C.regler.map(r=>`<li>${esc(r.navn)} → <b>${esc(C.roller[r.til].navn)}</b></li>`).join("")+C.hast.map(h=>`<li>Hast: ${esc(h.navn)} → <b>${HN[h.niva]}</b></li>`).join("");
const filt=()=>{const st=$("#d-status").value,h=$("#d-hast").value,q=$("#d-sok").value.toLowerCase();
  return data.filter(a=>(!rolle||a.tildelt_til===rolle)&&(!st||a.status===st)&&(!h||a.haster===h)&&(!q||JSON.stringify(a).toLowerCase().includes(q)))};
const dt=s=>new Date(s).toLocaleString("nb-NO",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"});
async function render(){data=await DB.list();const rows=filt();
  document.querySelectorAll("[data-c]").forEach(c=>c.textContent="("+data.filter(a=>!c.dataset.c||a.tildelt_til===c.dataset.c).length+")");
  $("#d-ant").textContent=rows.length+" av "+data.length+" vises";
  $("#d-rows").innerHTML=rows.map(a=>`<tr class="${a.id===valgt?"sel":""}"><td><button type="button" class="linkbtn" data-id="${a.id}">${a.id}</button>${a.eksempel?' <span class="ex">EKSEMPEL</span>':""}</td><td>${dt(a.opprettet)}</td><td>${esc(a.firma||a.navn)}</td><td>${esc(a.tjeneste_navn)}</td><td><span class="h h-${a.haster}">${HN[a.haster]}</span></td><td>${esc(C.roller[a.tildelt_til]?.navn||a.tildelt_til)}</td><td>${a.status}</td></tr>`).join("")||'<tr><td colspan="7" class="note">Ingen forespørsler. Trykk «Fyll inn EKSEMPEL-forespørsler» eller lag en i chatten.</td></tr>';
  const lg=await DB.logs();$("#d-log").innerHTML=lg.slice(0,8).map(l=>`<li>${dt(l.tid)} · ${l.id} · ${esc(l.tekst)}</li>`).join("")||"<li>Ingen varsler ennå.</li>";
  if(valgt)detalj(valgt)}
async function detalj(id){const a=await DB.get(id);if(!a)return;valgt=id;
  const f=[["Kundetype",a.kundetype],["Firma",a.firma],["Org.nr.",a.orgnr],["Kontakt",`${a.navn}, ${a.telefon}${a.epost?", "+a.epost:""}`],["Sted",`${a.adresse}, ${a.kommune}`],["Tjeneste",a.tjeneste_navn],["Beskrivelse",a.beskrivelse],["Størrelse",a.maal_m2?a.maal_m2+" m²":a.mengde_m3?a.mengde_m3+" m³":"–"],["Oppstart",a.onsket_oppstart],["Frist",a.frist||"–"],["Budsjett",a.budsjett?a.budsjett.toLocaleString("nb-NO")+" kr":"–"],["Befaring",a.befaring_onsket?"Ja":"Nei"],["Bilder",(a.bilder||[]).join(", ")||"Nei"],["Kanal",a.kanal],["Samtykke",a.samtykke_personvern?"Ja":"Nei"],["Ruting",`${a.regel} · hast: ${a.hast_regel}`]];
  $("#d-det").innerHTML=`<h2>${a.id} ${a.eksempel?'<span class="ex">EKSEMPEL</span>':""}</h2><dl class="dl">${f.filter(x=>x[1]).map(([k,v])=>`<dt>${k}</dt><dd>${esc(v)}</dd>`).join("")}</dl>
  <label for="d-st">Status</label><select id="d-st">${STATUS.map(s=>`<option ${s===a.status?"selected":""}>${s}</option>`).join("")}</select>
  <label for="d-til">Tildelt</label><select id="d-til">${Object.entries(C.roller).map(([k,v])=>`<option value="${k}" ${k===a.tildelt_til?"selected":""}>${v.navn}</option>`).join("")}</select>
  <label for="d-not">Notater</label><textarea id="d-not" rows="3">${esc(a.notater)}</textarea><button class="btn" type="button" id="d-lagre">Lagre</button> <span class="note" id="d-ok" aria-live="polite"></span>`;
  $("#d-lagre").onclick=async()=>{await DB.update(id,{status:$("#d-st").value,tildelt_til:$("#d-til").value,notater:$("#d-not").value});$("#d-ok").textContent="Lagret";render()};
  document.querySelectorAll("#d-rows tr").forEach(r=>r.classList.toggle("sel",!!r.querySelector(`[data-id="${id}"]`)))}
$("#d-rows").onclick=e=>{const b=e.target.closest("[data-id]");if(b)detalj(b.dataset.id)};
$("#d-tabs").onclick=e=>{const b=e.target.closest("[data-r]");if(!b)return;rolle=b.dataset.r;document.querySelectorAll("#d-tabs button").forEach(x=>x.setAttribute("aria-selected",x===b));render()};
["#d-status","#d-hast","#d-sok"].forEach(s=>$(s).oninput=render);
$("#d-seed").onclick=async()=>{await seedDemo();render()};
$("#d-reset").onclick=async()=>{if(confirm("Slette alle forespørsler i denne nettleseren?")){await DB.clear();valgt=null;$("#d-det").innerHTML='<p class="note">Velg en forespørsel for å se detaljer.</p>';render()}};
$("#d-csv").onclick=()=>{const k=["id","opprettet","status","tildelt_til","haster","kundetype","firma","orgnr","navn","telefon","epost","adresse","kommune","tjeneste_navn","beskrivelse","maal_m2","mengde_m3","onsket_oppstart","frist","budsjett","befaring_onsket","kanal","eksempel","notater"];
  const q=v=>`"${String(v??"").replace(/"/g,'""')}"`,csv="\ufeff"+[k.join(";"),...filt().map(a=>k.map(x=>q(a[x])).join(";"))].join("\r\n");
  const u=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"})),l=document.createElement("a");l.href=u;l.download="forespørsler-demo.csv";document.body.append(l);l.click();l.remove()};
// guidet demo
const G=[["1. Kunden spør i chatten","På nettsiden eller i appen svarer kunden på korte spørsmål. Chatten fyller et strukturert skjema og gir aldri pris.","#d-seed"],
["2. Eksempeldata","Trykk «Fyll inn EKSEMPEL-forespørsler» for å se 7 oppdiktede forespørsler fra privat, borettslag, bedrift og kommune.","#d-seed"],
["3. Automatisk ruting","Hver forespørsel får mottaker og hast etter reglene: kommune og store jobber til daglig leder, brøyting til drift, anlegg til prosjektleder.","#d-regler"],
["4. Innboks per rolle","Hver rolle ser sin egen innboks. Prøv fanene og filtrene.","#d-tabs"],
["5. Følg opp","Åpne en forespørsel, endre status og tildeling, skriv notat og lagre.","#d-det"],
["6. Eksport og varsler","Eksporter til CSV (Excel). Varsler på SMS og e-post er simulert i prototypen.","#d-csv"]];
let gi=0;const gs=()=>{document.querySelectorAll(".hl").forEach(x=>x.classList.remove("hl"));const [t,p,s]=G[gi];$("#g-t").textContent=t;$("#g-p").textContent=p;const el=$(s);el.classList.add("hl");el.scrollIntoView({block:"center",behavior:"smooth"});$("#g-next").textContent=gi===G.length-1?"Ferdig":"Neste"};
$("#d-guide").onclick=()=>{gi=0;$("#guide").hidden=false;gs();$("#g-next").focus()};
$("#g-next").onclick=async()=>{if(gi===1&&!data.length){await seedDemo();await render()}if(++gi>=G.length)return $("#g-end").onclick();gs()};
$("#g-end").onclick=()=>{$("#guide").hidden=true;document.querySelectorAll(".hl").forEach(x=>x.classList.remove("hl"));$("#d-guide").focus()};
render();
})();
