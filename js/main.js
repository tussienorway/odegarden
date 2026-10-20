(function(){
const $=s=>document.querySelector(s),esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
$("#yr").textContent=new Date().getFullYear();
// meny
const bg=$(".burger"),mn=$("#meny");bg.onclick=()=>{const o=mn.classList.toggle("on");bg.setAttribute("aria-expanded",o)};mn.onclick=e=>{if(e.target.tagName==="A"){mn.classList.remove("on");bg.setAttribute("aria-expanded",false)}};
// åpningstider (fra odegardens.no)
const T={1:[9,16],2:[9,16],3:[9,16],4:[9,16],5:[9,16],6:[9,15]},DN=["Søndag","Mandag","Tirsdag","Onsdag","Torsdag","Fredag","Lørdag"];
const now=new Date(),d=now.getDay(),h=now.getHours()+now.getMinutes()/60,t=T[d];
$("#open").innerHTML=[["Mandag–fredag","09:00–16:00",d>=1&&d<=5],["Lørdag","09:00–15:00",d===6],["Søndag","Etter avtale",d===0]].map(([a,b,x])=>`<span class="${x?"today":""}">${a}${x?" (i dag)":""}</span><b class="${x?"today":""}">${b}</b>`).join("");
const st=$("#aapen-status");if(t&&h>=t[0]&&h<t[1]){st.textContent=`🟢 Hagesenteret er åpent nå – til ${t[1]}:00`}else{st.textContent=`Hagesenteret er stengt nå · ${d===0||d===6&&h>=15?"åpner mandag 09:00":"åpner "+(h<(t?t[0]:9)?"i dag":"i morgen")+" 09:00"}`;st.classList.add("closed")}
// sesong
const S=[{n:"Vår",m:[3,4,5],ico:"🌷",t:"Tid for å plante trær, busker, hekk og frukttrær. Gjødsle plenen, legg ny bark og forbered bedene. Sommerblomster plantes ut når faren for nattefrost er over."},
{n:"Sommer",m:[6,7,8],ico:"🌸",t:"Sommerblomster, roser og krukker i full prakt. Vann godt, klipp hekken og nyt uterommet. Godt tidspunkt for belegningsstein og murer."},
{n:"Høst",m:[9,10,11],ico:"🍂",t:"Perfekt plantetid for trær, hekk og stauder – jorda er varm og fuktig. Legg bark som vinterbeskyttelse, og planlegg neste års prosjekter."},
{n:"Vinter",m:[12,1,2],ico:"❄️",t:"Vi rydder snø med brøyting, strøing og feiing for private og bedrifter. Godt tidspunkt å planlegge hagedesign til våren."}];
const mo=now.getMonth()+1;$("#season").innerHTML=S.map(s=>{const c=s.m.includes(mo);return `<article class="card ${c?"now":""}">${c?'<span class="badge">Nå</span>':""}<h3><span aria-hidden="true">${s.ico}</span> ${s.n}</h3><p>${s.t}</p></article>`}).join("");
// tjenester
$("#tj").innerHTML=TJENESTER.map(t=>`<article class="card"><img src="${t.img.replace("img/ekte/","img/thumb/")}" alt="${esc(t.navn)}" width="480" height="480" loading="lazy" decoding="async"><div class="in"><div class="ico" aria-hidden="true">${t.ico}</div><h3>${t.navn}</h3><p>${t.tekst}</p><a href="#kontakt" data-tj="${esc(t.navn)}">Ta kontakt om ${esc(t.navn.split(" – ")[0].toLowerCase())} ➜</a></div></article>`).join("");
document.querySelectorAll("[data-tj]").forEach(a=>a.onclick=()=>$("#kf-tj").value=a.dataset.tj);
$("#kf-tj").innerHTML='<option value="">Velg …</option>'+TJENESTER.map(t=>`<option>${t.navn}</option>`).join("")+"<option>Annet</option>";
$("#lv").innerHTML=LOSVEKT.map(x=>`<li style="list-style:none"><span style="display:inline-block;background:#fff;color:var(--ink);border-radius:99px;padding:6px 14px;font-weight:700">${x}</span></li>`).join("");$("#lv").style.cssText="display:flex;flex-wrap:wrap;gap:8px;padding:0";
// før/etter
const PAR=[{n:1,t:"Belegningsstein"},{n:2,t:"Hageanlegg i skråning"},{n:3,t:"Plantebed"}].map(p=>({for:`assets/demo/demo-${p.n}-for.webp`,etter:`assets/demo/demo-${p.n}-etter.webp`,t:p.t}))
 .concat([{for:"img/ki/ki-for-belegning.webp",etter:"img/ekte/brukt-hjem-vure-tjenester-anleggsgartner.webp",t:"Gårdsplass med belegningsstein"},{for:"img/ki/ki-for-mur.webp",etter:"img/ekte/anleggsgartner-lossteins-mur.webp",t:"Mur av løsstein"}]);
$("#ba").innerHTML=PAR.map(p=>`<figure style="margin:0"><div class="ba"><img src="${p.etter}" alt="Etter: ${p.t} – ekte arbeid fra Ødegården" loading="lazy" decoding="async"><img class="before" src="${p.for}" alt="Før: ${p.t} – KI-generert illustrasjon" loading="lazy" decoding="async"><span class="lbl l">Før</span><span class="lbl r">Etter</span><div class="line"></div><input type="range" min="0" max="100" value="50" aria-label="Sammenlign før og etter: ${p.t}" aria-valuetext="50 prosent før"><span class="ai">KI-generert førbilde</span><span class="real">Ekte etterbilde</span></div><figcaption class="center"><b>${p.t}</b></figcaption></figure>`).join("");
window.bindSliders=root=>root.querySelectorAll(".ba input").forEach(r=>{const f=()=>{const v=r.value;r.parentNode.querySelector(".before").style.clipPath=`inset(0 ${100-v}% 0 0)`;r.parentNode.querySelector(".line").style.left=v+"%";r.setAttribute("aria-valuetext",v+" prosent før")};r.oninput=f;f()});bindSliders(document);
// galleri
const alt=g=>g.src.split("/").pop().replace(/\.webp$/,"").replace(/-konflikt-for-unicode-koding|brukt-hjem-|brukt-/g,"").replace(/[-_]/g," ").replace(/\b(\w)/,c=>c.toUpperCase());
const kats=[["alle","Alle"],...[...new Map(GALLERI.map(g=>[g.kat,g.navn]))]];
$("#filt").innerHTML=kats.map(([k,n],i)=>`<button type="button" data-k="${k}" aria-pressed="${!i}" class="${i?"":"on"}">${n}</button>`).join("");
const render=k=>{$("#gal").innerHTML=GALLERI.filter(g=>k==="alle"||g.kat===k).map(g=>`<figure><button type="button" data-full="${g.src}" style="all:unset;cursor:zoom-in;display:block;width:100%;height:100%" aria-label="Forstørr: ${esc(alt(g))}"><img src="${g.src.replace("img/ekte/","img/thumb/")}" alt="${esc(alt(g))} – ${g.navn}" width="480" height="480" loading="lazy" decoding="async"></button></figure>`).join("")};render("alle");
$("#filt").onclick=e=>{const b=e.target.closest("[data-k]");if(!b)return;document.querySelectorAll("#filt button").forEach(x=>{x.classList.toggle("on",x===b);x.setAttribute("aria-pressed",x===b)});render(b.dataset.k)};
const lb=$("#lb");let lastF;$("#gal").onclick=e=>{const b=e.target.closest("[data-full]");if(!b)return;lastF=b;lb.querySelector("img").src=b.dataset.full;lb.querySelector("img").alt=b.getAttribute("aria-label").replace("Forstørr: ","");lb.classList.add("on");lb.focus()};
const closeLb=()=>{lb.classList.remove("on");lastF&&lastF.focus()};lb.onclick=closeLb;document.addEventListener("keydown",e=>{if(e.key==="Escape"&&lb.classList.contains("on"))closeLb()});
// video (preload=none + poster)
fetch("assets/video/videos.json").then(r=>r.ok?r.json():[]).catch(()=>[]).then(v=>{const el=$("#vid");v=(Array.isArray(v)?v:[]).filter(x=>x.fil);
 if(!v.length){el.innerHTML='<p class="slot">🎬 Videoer kommer snart.</p>';return}
 const P=x=>(x.includes("/")?x:"assets/video/"+x).replace(/img\/ekte\/(.+)\.jpe?g$/,"img/thumb/$1.webp");
 el.innerHTML=v.map(x=>`<figure class="card" style="margin:0">${/KI/.test(x.beskrivelse||"")?'<span class="vid-ki">KI-animert</span>':""}<video controls playsinline preload="none" ${x.poster?`poster="${P(x.poster)}"`:""} src="${P(x.fil)}" style="width:100%;aspect-ratio:1/1;object-fit:cover;background:#000" aria-label="${esc(x.tittel)}"></video><figcaption class="in"><b>${esc(x.tittel)}</b><div class="note">${esc(x.beskrivelse)}</div></figcaption></figure>`).join("");
 el.querySelectorAll("video").forEach(vd=>vd.onerror=()=>vd.closest("figure").remove())});
// priser
$("#eks").innerHTML=EKSEMPELPRISER.map(e=>`<tr><td>${e.tj}</td><td>${e.enhet}</td><td><b>${e.tekst||("Fra "+kr(e.fra))}</b>${e.tekst?"":' <span class="tag" style="background:#ffe9c4;color:#6b3d00">EKSEMPEL</span>'}</td></tr>`).join("");
// kart (lastes kun på forespørsel)
$("#vis-kart").onclick=()=>{$("#kart").innerHTML='<iframe title="Kart: Bergeveien 8, Grimstad" loading="lazy" src="https://www.openstreetmap.org/export/embed.html?bbox=8.545%2C58.333%2C8.574%2C58.345&amp;layer=mapnik&amp;marker=58.33914%2C8.55940"></iframe>'};
// chat-knapper
document.querySelectorAll("[data-open-chat]").forEach(b=>b.onclick=()=>window.openChat&&openChat());
// kontaktskjema -> mailto (PLASSHOLDER-adresse FIRMA.epost)
$("#kform").onsubmit=e=>{e.preventDefault();const f=e.target,d=Object.fromEntries(new FormData(f)),err=$("#f-err");
 if(!d.navn.trim()||!/\d{8}/.test(d.tlf.replace(/\D/g,""))){err.textContent="Fyll inn navn og et telefonnummer med 8 sifre.";(d.navn.trim()?f.tlf:f.navn).focus();return}err.textContent="";
 const body=`Hei Ødegården!\n\n${d.melding||""}\n\nGjelder: ${d.tjeneste||"-"}\n\nMvh\n${d.navn}\nTlf: ${d.tlf}${d.epost?"\nE-post: "+d.epost:""}`;
 const href=`mailto:${FIRMA.epost}?subject=${encodeURIComponent("Henvendelse fra nettsiden: "+(d.tjeneste||"generelt"))}&body=${encodeURIComponent(body)}`;
 f.dataset.mailto=href;$("#f-copy").value=body;$("#f-ok").hidden=false;location.href=href};
})();
