(function(){
const $=s=>document.querySelector(s),$$=s=>document.querySelectorAll(s),esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const ico=n=>`<svg class="i" aria-hidden="true"><use href="#i-${n}"/></svg>`;
$("#yr").textContent=new Date().getFullYear();
// meny
const bg=$(".burger"),mn=$("#meny");bg.onclick=()=>{const o=mn.classList.toggle("on");bg.setAttribute("aria-expanded",o)};mn.onclick=e=>{if(e.target.closest("a")){mn.classList.remove("on");bg.setAttribute("aria-expanded",false)}};
// åpningstider (fra odegardens.no) + helligdager
const T={1:[9,16],2:[9,16],3:[9,16],4:[9,16],5:[9,16],6:[9,15]},DN=["søndag","mandag","tirsdag","onsdag","torsdag","fredag","lørdag"];
const iso=x=>`${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,"0")}-${String(x.getDate()).padStart(2,"0")}`;
const HD=window.HELLIGDAGER||{},tid=x=>{const s=(window.SESONGTIDER||[]).find(p=>iso(x)>=p.fra&&iso(x)<=p.til);return HD[iso(x)]?null:(s?s.tider:T)[x.getDay()]};
const now=new Date(),d=now.getDay(),h=now.getHours()+now.getMinutes()/60,t=tid(now),hd=HD[iso(now)];
if($("#open"))$$("#open").forEach(o=>o.innerHTML=[["Mandag–fredag","09:00–16:00",d>=1&&d<=5],["Lørdag","09:00–15:00",d===6],["Søndag","Etter avtale",d===0]].map(([a,b,x])=>`<span class="${x?"today":""}">${a}${x?" (i dag)":""}</span><b class="${x?"today":""}">${x&&hd?"Helligdag – se Facebook":b}</b>`).join(""));
const st=$("#aapen-status");if(st){if(t&&h>=t[0]&&h<t[1]){st.textContent=`Hagesenteret er åpent nå – til ${t[1]}:00`;st.classList.add("on")}else{let n=new Date(now),k=0,txt="";
 if(t&&h<t[0])txt="åpner i dag "+String(t[0]).padStart(2,"0")+":00";else{for(k=1;k<10;k++){n.setDate(n.getDate()+1);const z=tid(n);if(z){txt="åpner "+(k===1?"i morgen":DN[n.getDay()])+" "+String(z[0]).padStart(2,"0")+":00";break}}}
 st.textContent=`Hagesenteret er stengt nå${hd?" ("+hd+")":""} · ${txt}`;st.classList.add("closed")}}
// nå i sesong + nyheter
const MN=["januar","februar","mars","april","mai","juni","juli","august","september","oktober","november","desember"],mo=now.getMonth()+1;
const visNaa=(MA,NY)=>{$("#mnd").textContent=MN[mo-1];$("#maaned").innerHTML=(MA[mo]||[]).map(x=>`<li>${esc(x)}</li>`).join("");
 $("#nyheter").innerHTML=(NY||[]).slice(0,3).map(n=>`<article class="card pad news">${n.eksempel?'<span class="ex">EKSEMPEL</span> ':""}<time datetime="${n.dato}">${new Date(n.dato).toLocaleDateString("nb-NO",{day:"numeric",month:"long",year:"numeric"})}</time><h4>${esc(n.tittel)}</h4><p>${esc(n.tekst)}</p></article>`).join("")||'<p class="note">Ingen nyheter akkurat nå.</p>'};
if($("#maaned")){visNaa(MAANED,NYHETER);/* Innhold redigert i CMS (content/*.json) overstyrer data.js */
 Promise.all(["content/sesong.json","content/nyheter.json"].map(u=>fetch(u).then(r=>r.ok?r.json():null).catch(()=>null))).then(([se,ny])=>{const MA=se?Object.fromEntries(se.maaneder.map(m=>[m.maaned,m.punkter])):MAANED;visNaa(MA,ny?ny.nyheter.sort((a,b)=>b.dato.localeCompare(a.dato)):NYHETER)})}
// tjenester
const IC={hagesenter:"leaf",planteskole:"tree",anleggsgartner:"wall",broyting:"snow",drift:"park",losvekt:"truck"},LNK={hagesenter:"hagesenter.html",planteskole:"hagesenter.html",anleggsgartner:"anleggsgartner.html",broyting:"broyting.html",drift:"broyting.html",losvekt:"losvekt.html"};
if($("#tj"))$("#tj").innerHTML=TJENESTER.map(t=>`<article class="card"><img src="${t.img.replace("img/ekte/","img/thumb/")}" alt="${esc(t.navn)}" width="480" height="480" loading="lazy" decoding="async"><div class="in"><div class="ico">${ico(IC[t.id])}</div><h3>${t.navn}</h3><p>${t.tekst}</p><a href="${LNK[t.id]}">Les mer om ${esc(t.navn.split(" – ")[0].toLowerCase())} ➜</a></div></article>`).join("");
if($("#lv"))$("#lv").innerHTML=LOSVEKT.map(x=>`<li>${x}</li>`).join("");
// inspirasjon (illustrasjon)
const PAR=[{n:1,t:"Belegningsstein"},{n:2,t:"Hageanlegg i skråning"},{n:3,t:"Plantebed"}].map(p=>({for:`assets/demo/demo-${p.n}-for.webp`,etter:`assets/demo/demo-${p.n}-etter.webp`,t:p.t}))
 .concat([{for:"img/ki/ki-for-belegning.webp",etter:"img/ekte/brukt-hjem-vure-tjenester-anleggsgartner.webp",t:"Gårdsplass med belegningsstein"},{for:"img/ki/ki-for-mur.webp",etter:"img/ekte/anleggsgartner-lossteins-mur.webp",t:"Mur av løsstein"}]);
if($("#ba")){$("#ba").innerHTML=PAR.map(p=>`<figure class="m0"><div class="ba"><img src="${p.etter}" alt="Etter: ${p.t} – ekte jobb fra Ødegården" loading="lazy" decoding="async"><img class="before" src="${p.for}" alt="Illustrasjon av før: ${p.t} – KI-generert, ikke ekte bilde" loading="lazy" decoding="async"><span class="lbl l">Før · illustrasjon</span><span class="lbl r">Etter · ekte</span><div class="line"></div><input type="range" min="0" max="100" value="50" aria-label="Sammenlign illustrasjon og ekte jobb: ${p.t}" aria-valuetext="50 prosent illustrasjon"><span class="ai">KI-illustrasjon</span></div><figcaption class="center"><b>${p.t}</b></figcaption></figure>`).join("");
 $$(".ba input").forEach(r=>{const f=()=>{const v=r.value;r.parentNode.querySelector(".before").style.clipPath=`inset(0 ${100-v}% 0 0)`;r.parentNode.querySelector(".line").style.left=v+"%";r.setAttribute("aria-valuetext",v+" prosent illustrasjon")};r.oninput=f;f()})}
// galleri + lysboks
if($("#gal")){const alt=g=>g.src.split("/").pop().replace(/\.webp$/,"").replace(/brukt-hjem-|brukt-/g,"").replace(/[-_]/g," ").replace(/\b(\w)/,c=>c.toUpperCase());
const kats=[["alle","Alle"],...[...new Map(GALLERI.map(g=>[g.kat,g.navn]))]];
$("#filt").innerHTML=kats.map(([k,n],i)=>`<button type="button" data-k="${k}" aria-pressed="${!i}" class="${i?"":"on"}">${n}</button>`).join("");
const render=k=>{$("#gal").innerHTML=GALLERI.filter(g=>k==="alle"||g.kat===k).map(g=>`<figure><button type="button" class="gbtn" data-full="${g.src}" aria-label="Forstørr: ${esc(alt(g))}"><img src="${g.src.replace("img/ekte/","img/thumb/")}" alt="${esc(alt(g))} – ${g.navn}" width="480" height="480" loading="lazy" decoding="async"></button></figure>`).join("")};render("alle");
$("#filt").onclick=e=>{const b=e.target.closest("[data-k]");if(!b)return;$$("#filt button").forEach(x=>{x.classList.toggle("on",x===b);x.setAttribute("aria-pressed",x===b)});render(b.dataset.k)};
const lb=$("#lb"),x=lb.querySelector(".lb-x");let lastF;
$("#gal").onclick=e=>{const b=e.target.closest("[data-full]");if(!b)return;lastF=b;const im=lb.querySelector("img");im.src=b.dataset.full;im.alt=b.getAttribute("aria-label").replace("Forstørr: ","");lb.hidden=false;lb.classList.add("on");x.focus()};
const closeLb=()=>{lb.classList.remove("on");lb.hidden=true;lastF&&lastF.focus()};lb.onclick=e=>{if(e.target!==lb.querySelector("img"))closeLb()};
document.addEventListener("keydown",e=>{if(!lb.classList.contains("on"))return;if(e.key==="Escape")closeLb();if(e.key==="Tab"){e.preventDefault();x.focus()}})}
// kart
const vk=$("#vis-kart");if(vk)vk.onclick=()=>{$("#kart").innerHTML='<iframe title="Kart: Bergeveien 8, Grimstad" loading="lazy" src="https://www.openstreetmap.org/export/embed.html?bbox=8.545%2C58.333%2C8.574%2C58.345&amp;layer=mapnik&amp;marker=58.33914%2C8.55940"></iframe>'};
$$("[data-open-chat]").forEach(b=>b.onclick=()=>window.openChat&&openChat());
// kontaktskjema -> mailto (PLASSHOLDER-adresse FIRMA.epost)
const kf=$("#kform");if(kf){const sel=$("#kf-tj");sel.innerHTML='<option value="">Velg …</option>'+TJENESTER.map(t=>`<option>${t.navn}</option>`).join("")+"<option>Annet</option>";
 const q=new URLSearchParams(location.search).get("tj");if(q){const o=[...sel.options].find(o=>o.text.toLowerCase().startsWith(q.toLowerCase()));if(o)sel.value=o.text}
 kf.onsubmit=e=>{e.preventDefault();const f=e.target,d=Object.fromEntries(new FormData(f)),err=$("#f-err"),k=d.kontakt.trim(),ok=/\d{8}/.test(k.replace(/\D/g,""))||/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(k);
  if(!d.navn.trim()||!ok){err.textContent="Fyll inn navn og et telefonnummer med 8 sifre eller en e-postadresse.";const bad=d.navn.trim()?f.kontakt:f.navn;bad.setAttribute("aria-invalid","true");bad.focus();return}
  err.textContent="";f.navn.removeAttribute("aria-invalid");f.kontakt.removeAttribute("aria-invalid");
  const body=`Hei Ødegården!\n\n${d.melding||""}\n\nGjelder: ${d.tjeneste||"-"}\n\nMvh\n${d.navn}\nKontakt: ${k}`;
  const href=`mailto:${FIRMA.epost}?subject=${encodeURIComponent("Henvendelse fra nettsiden: "+(d.tjeneste||"generelt"))}&body=${encodeURIComponent(body)}`;
  f.dataset.mailto=href;$("#f-copy").value=body;$("#f-ok").hidden=false;$("#f-ok").scrollIntoView({block:"nearest"});location.href=href};
 $("#f-kopier").onclick=async e=>{try{await navigator.clipboard.writeText($("#f-copy").value);e.target.textContent="Kopiert!"}catch(_){ $("#f-copy").select()}}}
})();
// prototype: anbudschat + PWA
document.querySelectorAll("[data-anbud]").forEach(b=>b.onclick=()=>window.startAnbud&&startAnbud());
if(new URLSearchParams(location.search).get("anbud")==="1")setTimeout(()=>window.startAnbud&&startAnbud(),300);
if("serviceWorker" in navigator&&location.protocol!=="file:")window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));
