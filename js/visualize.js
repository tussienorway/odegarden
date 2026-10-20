/* «Se din hage» – opplasting, valg av tiltak, og hooks for bilde-/videogenerering.
 * Ekte generering: sett IMAGE_ENDPOINT / VIDEO_ENDPOINT i js/ai-config.js (via proxy).
 * Demomodus: viser ferdige eksempler fra assets/demo/. */
(function(){
const C=window.AI_CONFIG||{};
const TILTAK=[{id:"belegningsstein",n:"🛤️ Belegningsstein",demo:1},{id:"stottemur",n:"🪨 Støttemur",demo:2},{id:"skifer",n:"⬛ Skifer",demo:1},{id:"hekk",n:"🌲 Hekk",demo:3},{id:"beplantning",n:"🌸 Beplantning",demo:3},{id:"plen",n:"🌱 Ferdigplen",demo:2}];
const DEMO={1:"Belegningsstein",2:"Hageanlegg i skråning",3:"Plantebed"};
const $=s=>document.querySelector(s),drop=$("#vz-drop"),file=$("#vz-file"),prev=$("#vz-prev"),out=$("#vz-out");if(!drop)return;
$("#vz-tiltak").innerHTML=TILTAK.map(t=>`<label><input type="checkbox" value="${t.id}">${t.n}</label>`).join("");
$("#vz-mode").textContent=C.IMAGE_ENDPOINT?"KI-visualisering er aktiv.":"Demomodus: du får se et ferdig eksempel som ligner valget ditt. Bildet ditt forlater ikke nettleseren.";
let dataURL=null;
const load=f=>{if(!f||!f.type.startsWith("image/"))return toast("Velg en bildefil");const r=new FileReader();r.onload=()=>{dataURL=r.result;prev.src=dataURL;prev.style.display="block"};r.readAsDataURL(f)};
drop.onclick=()=>file.click();drop.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();file.click()}};file.onchange=()=>load(file.files[0]);
["dragover","dragenter"].forEach(e=>drop.addEventListener(e,ev=>{ev.preventDefault();drop.classList.add("hov")}));
["dragleave","drop"].forEach(e=>drop.addEventListener(e,ev=>{ev.preventDefault();drop.classList.remove("hov")}));
drop.addEventListener("drop",e=>load(e.dataTransfer.files[0]));
const post=async(url,body)=>{const r=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json",...(C.PUBLIC_TOKEN?{Authorization:"Bearer "+C.PUBLIC_TOKEN}:{})},body:JSON.stringify(body)});if(!r.ok)throw new Error("HTTP "+r.status);return r.json()};
/** Hook: generer etterbilde. Returnerer URL/dataURL. */
async function generateImage(img,tiltak){
  const prompt=`Fotorealistisk etterbilde av samme eiendom og samme kameravinkel, med: ${tiltak.join(", ")}. Utført av norsk anleggsgartner og planteskole, naturlig dagslys.`;
  return (await post(C.IMAGE_ENDPOINT,{image:img,tiltak,prompt})).image;
}
/** Hook: generer kort video rundt eiendommen. Returnerer video-URL, eller null. Støtter jobb-polling. */
async function generateVideo(img,tiltak){
  if(!C.VIDEO_ENDPOINT)return null;
  let r=await post(C.VIDEO_ENDPOINT,{image:img,prompt:`Rolig drone-/kamerarunde rundt eiendommen med ${tiltak.join(", ")}`});
  for(let i=0;!r.video&&r.jobId&&i<60;i++){await new Promise(s=>setTimeout(s,5000));r=await (await fetch(C.VIDEO_ENDPOINT+"?id="+encodeURIComponent(r.jobId))).json()}
  return r.video||null;
}
function slider(before,after,lab,ai,rl){return `<div class="ba"><img src="${after}" alt="Etter"><img class="before" src="${before}" alt="Før"><span class="lbl l">Før</span><span class="lbl r">${rl||"Etter"}</span><div class="line"></div><input type="range" min="0" max="100" value="50" aria-label="Sammenlign før og etter">${ai?`<span class="ai">${ai}</span>`:""}</div><p class="note center">${lab}</p>`}
function videoBlock(src){
  const w=document.createElement("div");w.innerHTML=`<video controls playsinline muted loop preload="metadata" src="${src}"></video><p class="note center">🎥 Rundtur rundt eiendommen</p>`;
  const v=w.querySelector("video");v.addEventListener("error",()=>{w.innerHTML=`<div class="slot" style="height:100%;display:grid;place-items:center">🎥<br><b>Video kommer snart</b><br><span class="note">Rundturvideoen er ikke klar ennå.</span></div>`});
  return w;
}
async function showDemo(n){
  out.innerHTML=`<div>${slider(`assets/demo/demo-${n}-for.webp`,`assets/demo/demo-${n}-etter.webp`,"Eksempel: "+DEMO[n]+" – etterbildet er ekte arbeid fra Ødegården, førbildet er KI-generert","KI-generert førbilde","Etter · ekte arbeid")}</div>`;
  window.bindSliders(out);if(C.DEMO_VIDEO)out.appendChild(videoBlock(C.DEMO_VIDEO));out.scrollIntoView({behavior:"smooth",block:"nearest"});
}
document.querySelectorAll("[data-demo]").forEach(b=>b.onclick=()=>showDemo(b.dataset.demo));
$("#vz-go").onclick=async()=>{
  const valgt=[...document.querySelectorAll("#vz-tiltak input:checked")].map(i=>i.value);
  if(!valgt.length)return toast("Velg minst ett tiltak");
  if(!C.IMAGE_ENDPOINT||!dataURL){if(!dataURL&&C.IMAGE_ENDPOINT)toast("Last opp et bilde først");return showDemo(TILTAK.find(t=>t.id===valgt[0]).demo)}
  const b=$("#vz-go");b.disabled=true;b.innerHTML='<span class="spin"></span> Lager visualisering…';
  try{const after=await generateImage(dataURL,valgt);out.innerHTML=`<div>${slider(dataURL,after,"Din eiendom – "+valgt.join(", "),"KI-generert etterbilde")}</div>`;window.bindSliders(out);
    const vb=document.createElement("div");vb.innerHTML='<div class="slot"><span class="spin" style="border-color:var(--g);border-top-color:transparent"></span> Lager video…</div>';out.appendChild(vb);
    generateVideo(after,valgt).then(v=>vb.replaceWith(v?videoBlock(v):Object.assign(document.createElement("div"),{innerHTML:'<div class="slot">🎥 Video er ikke tilgjengelig akkurat nå.</div>'}))).catch(()=>vb.innerHTML='<div class="slot">🎥 Video er ikke tilgjengelig akkurat nå.</div>');
  }catch(e){console.warn(e);toast("Visualiseringen feilet – viser et eksempel");showDemo(TILTAK.find(t=>t.id===valgt[0]).demo)}
  finally{b.disabled=false;b.textContent="Lag visualisering"}
};
window.Visualize={generateImage,generateVideo,showDemo};
})();
