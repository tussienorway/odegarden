(function(){
const $=s=>document.querySelector(s);$("#yr").textContent=new Date().getFullYear();
const bgs=document.querySelectorAll(".hero .bg");let hi=0;setInterval(()=>{bgs[hi].classList.remove("on");hi=(hi+1)%bgs.length;bgs[hi].classList.add("on")},5500);
$("#tj").innerHTML=TJENESTER.map(t=>`<article class="card"><img src="${t.img}" alt="${t.navn}" loading="lazy"><div class="in"><div class="ico">${t.ico}</div><h3>${t.navn}</h3><p>${t.tekst}</p><a href="#kontakt" data-tj="${t.navn}">Ta kontakt ➜</a></div></article>`).join("");
document.querySelectorAll("[data-tj]").forEach(a=>a.onclick=()=>$("#kf-tj").value=a.dataset.tj);
$("#kf-tj").innerHTML='<option value="">Hva gjelder det?</option>'+TJENESTER.map(t=>`<option>${t.navn}</option>`).join("")+"<option>Annet</option>";
$("#lv").innerHTML=LOSVEKT.map(x=>`<span style="color:var(--ink)">${x}</span>`).join("");
const PAR=[{for:"img/ki/ki-for-belegning.jpg",etter:"img/ekte/brukt-hjem-vure-tjenester-anleggsgartner.jpg",t:"Belegningsstein på gårdsplassen",ai:"KI-generert førbilde"},
{for:"img/ki/ki-for-mur.jpg",etter:"img/ekte/anleggsgartner-lossteins-mur.jpg",t:"Mur av løsstein",ai:"KI-generert førbilde"}];
$("#ba").innerHTML=PAR.map(p=>`<div><div class="ba"><img src="${p.etter}" alt="Etter: ${p.t}"><img class="before" src="${p.for}" alt="Før: ${p.t}" onerror="this.closest('.ba').parentNode.remove();document.querySelector('#ba').children.length||(document.querySelector('#for-etter').remove(),document.querySelector('a[href=\'#for-etter\']').parentNode.remove())"><span class="lbl l">Før</span><span class="lbl r">Etter</span><div class="line"></div><input type="range" min="0" max="100" value="50" aria-label="Før/etter ${p.t}"><span class="ai">${p.ai}</span></div><p class="center"><b>${p.t}</b></p></div>`).join("");
window.bindSliders=root=>root.querySelectorAll(".ba input").forEach(r=>{const f=()=>{const v=r.value;r.parentNode.querySelector(".before").style.clipPath=`inset(0 ${100-v}% 0 0)`;r.parentNode.querySelector(".line").style.left=v+"%"};r.oninput=f;f()});bindSliders(document);
const kats=[["alle","Alle"],...[...new Map(GALLERI.map(g=>[g.kat,g.navn]))]];
$("#filt").innerHTML=kats.map(([k,n],i)=>`<button data-k="${k}" class="${i?"":"on"}">${n}</button>`).join("");
const render=k=>{$("#gal").innerHTML=GALLERI.filter(g=>k==="alle"||g.kat===k).map(g=>`<figure><img src="${g.src}" alt="${g.navn} – Ødegården" loading="lazy"></figure>`).join("")};render("alle");
$("#filt").onclick=e=>{if(!e.target.dataset.k)return;document.querySelectorAll("#filt button").forEach(b=>b.classList.toggle("on",b===e.target));render(e.target.dataset.k)};
$("#gal").onclick=e=>{if(e.target.tagName==="IMG"){$("#lb img").src=e.target.src;$("#lb").classList.add("on")}};
fetch("assets/video/videos.json").then(r=>r.ok?r.json():[]).catch(()=>[]).then(v=>{const el=$("#vid");v=(Array.isArray(v)?v:[]).filter(x=>x.fil);
 if(!v.length){el.innerHTML='<div class="slot">🎬 Videoer kommer snart.</div>';return}
 const P=x=>x.includes("/")?x:"assets/video/"+x;
 el.innerHTML=v.map(x=>`<figure class="card" style="margin:0"><video controls playsinline preload="metadata" ${x.poster?`poster="${P(x.poster)}"`:""} src="${P(x.fil)}" style="width:100%;aspect-ratio:1/1;object-fit:cover;background:#000"></video><div class="in"><b>${x.tittel||""}</b><div class="note">${/KI/.test(x.beskrivelse||"")?`<span class="tag" style="background:#fde6f1;color:#a3215f">KI</span> `:""}${x.beskrivelse||""}</div></div></figure>`).join("");
 el.querySelectorAll("video").forEach(vd=>vd.onerror=()=>vd.closest("figure").remove())});
$("#eks").innerHTML=EKSEMPELPRISER.map(e=>`<tr><td>${e.tj}</td><td>${e.enhet}</td><td><b>${e.tekst||("Fra "+kr(e.fra))}</b>${e.tekst?"":' <span class="tag" style="background:#ffe9c4;color:#8a5200">EKSEMPEL</span>'}</td></tr>`).join("");
/* mailto til PLASSHOLDER-adressen FIRMA.epost (post@odegardens.no, fra dagens side – bekreftes) */
$("#kform").onsubmit=e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.target));
 const body=`Hei Ødegården!\n\n${d.melding||""}\n\nGjelder: ${d.tjeneste||"-"}\n\nMvh\n${d.navn}\nTlf: ${d.tlf}${d.epost?"\nE-post: "+d.epost:""}`;
 const href=`mailto:${FIRMA.epost}?subject=${encodeURIComponent("Henvendelse fra nettsiden: "+(d.tjeneste||"generelt"))}&body=${encodeURIComponent(body)}`;
 e.target.dataset.mailto=href;location.href=href};
})();
