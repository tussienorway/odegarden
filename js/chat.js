(function(){
const fab=document.createElement("button");fab.id="chat-fab";fab.setAttribute("aria-label","Få hjelp til forespørsel");fab.innerHTML='<svg class="i" aria-hidden="true"><use href="#i-chat"/></svg><span>Få hjelp</span>';
const box=document.createElement("div");box.id="chat";box.innerHTML=`<div class="hd"><span>Hjelp til forespørsel<br><small class="disc">Automatisk assistent – svar kan være feil. Ring 37 04 31 02 for sikre svar.</small></span><button aria-label="Lukk">×</button></div><div class="msgs"></div><div class="qr"></div><form><input placeholder="Skriv en melding…" aria-label="Melding"><button class="btn" style="padding:10px 16px">➤</button></form>`;
document.body.append(fab,box);
const msgs=box.querySelector(".msgs"),qr=box.querySelector(".qr"),inp=box.querySelector("input"),hist=[];
const add=(t,who)=>{const m=document.createElement("div");m.className="m "+who;m.textContent=t;msgs.appendChild(m);msgs.scrollTop=msgs.scrollHeight;return m};
const quick=a=>{qr.innerHTML="";(a||[]).forEach(x=>{const b=document.createElement("button");b.type="button";b.textContent=x;b.onclick=()=>send(x);qr.appendChild(b)})};
async function send(t){if(!t.trim())return;add(t,"u");hist.push({role:"user",content:t});inp.value="";quick();const w=add("…","b");
  const r=await AI.reply(hist,"kunde");w.textContent=r.reply;if(r.actions){const a=document.createElement("div");a.style.cssText="display:flex;gap:6px;flex-wrap:wrap;align-self:flex-start";r.actions.forEach(x=>{const b=document.createElement(x.href?"a":"button");b.className="btn";b.style.cssText="padding:7px 14px;font-size:.85rem";b.textContent=x.label;if(x.href){b.href=x.href;b.className+=" mailto"}else b.onclick=()=>{navigator.clipboard&&navigator.clipboard.writeText(x.copy);toast("Kopiert")};a.appendChild(b)});msgs.appendChild(a);msgs.scrollTop=msgs.scrollHeight}hist.push({role:"assistant",content:r.reply});quick(r.qr);
  if(r.request){Store.addRequest({...r.request,samtale:hist.map(h=>(h.role==="user"?"Kunde: ":"Assistent: ")+h.content).join("\n")})}}
box.querySelector("form").onsubmit=e=>{e.preventDefault();send(inp.value)};
let started=false;const open=()=>{box.classList.toggle("on");if(!started){started=true;add("Hei! 👋 Jeg er Ødegårdens digitale sekretær. Spør om åpningstider, planter, løsvekt, brøyting eller anleggsarbeid – eller få hjelp til å lage en forespørsel med mål, bilder, adresse og tidsrom.","b");quick(["Åpningstider","Bark og matjord","Brøyting","Bestille befaring"])}if(box.classList.contains("on"))inp.focus()};
fab.onclick=open;box.querySelector(".hd button").onclick=()=>box.classList.remove("on");
window.openChat=open;
})();
