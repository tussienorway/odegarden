/* Eier-modus: materialkalkulator (kun admin). Priser = EKSEMPEL – ikke bekreftet. */
(function(){
const $=s=>document.querySelector(s),V=id=>+$(id).value||0,fmt=(n,d=1)=>Number(n||0).toLocaleString("nb-NO",{maximumFractionDigits:d});
const MERK="EKSEMPEL – ikke bekreftet";
const MAT={stein:null,grus:null,sand:null,kantstein:null,duk:null}; /* fyll inn innkjøpspris eks. mva */
const FORMAT={"10x20 cm":[10,20],"14x21 cm":[14,21],"20x20 cm":[20,20],"16x24 cm":[16,24],"30x30 cm (heller)":[30,30],"40x40 cm (heller)":[40,40],"60x40 cm (skifer)":[60,40],"Bruddheller (skifer)":null};
const LV={"Bark":0.35,"Flis":0.3,"Kompostjord":0.7,"Matjord":1.3,"Natursingel 2–10 mm":1.6,"Singel 4–8 mm":1.6,"Pukk 8–16 mm":1.5,"Grus 0–18 mm":1.9,"Pussesand 0–4 mm":1.6}; /* typisk tonn/m³ – anslag */
$("#km-format").innerHTML=Object.keys(FORMAT).map(k=>`<option>${k}</option>`).join("");$("#lv-prod").innerHTML=Object.keys(LV).map(k=>`<option>${k}</option>`).join("");
const kost=(n,p)=>p==null?"kr ___":"kr "+fmt(n*p,0);
function belegg(){const A=V("#km-areal"),sv=V("#km-svinn")/100,fu=V("#km-fuge")/10,f=FORMAT[$("#km-format").value],P=V("#km-omkrets"),m2=A*(1+sv),d=1.8;
  const stk=f?Math.ceil(10000/((f[0]+fu)*(f[1]+fu))*m2):null,fo=A*V("#km-forst")/100,ba=A*V("#km-baere")/100,sa=A*V("#km-sand")/100,ka=Math.ceil(P*(1+sv));
  const R=[["Stein (inkl. svinn)",`${fmt(m2)} m²`+(stk?` ≈ ${fmt(stk,0)} stk`:" (bestill i m²/tonn)"),kost(m2,MAT.stein)],["Forsterkningslag",`${fmt(fo,2)} m³ ≈ ${fmt(fo*d*1.15)} tonn`,kost(fo*d*1.15,MAT.grus)],["Bærelag",`${fmt(ba,2)} m³ ≈ ${fmt(ba*d*1.15)} tonn`,kost(ba*d*1.15,MAT.grus)],["Settesand",`${fmt(sa,2)} m³ ≈ ${fmt(sa*1.6)} tonn`,kost(sa*1.6,MAT.sand)],["Kantstein",`${ka} lm`,kost(ka,MAT.kantstein)],["Fiberduk",`${fmt(A*1.1)} m²`,kost(A*1.1,MAT.duk)]];
  $("#km-res").innerHTML=tab(R)+`<p class="note">Utgraving ≈ ${fmt(A*(V("#km-forst")+V("#km-baere")+V("#km-sand")+8)/100,2)} m³. 15 % komprimeringstillegg på pukk/grus.</p><button class="btn ghost" id="km-til">→ Til anbudsgeneratoren</button>`;
  $("#km-til").onclick=()=>{window.addPoster([["Utgraving og bortkjøring",+(A*(V("#km-forst")+V("#km-baere")+V("#km-sand")+8)/100).toFixed(2),"m³"],["Forsterkningslag",+(fo*d*1.15).toFixed(1),"tonn"],["Bærelag",+(ba*d*1.15).toFixed(1),"tonn"],["Settesand og legging",+A.toFixed(1),"m²"],["Kantstein",ka,"lm"]]);toast("Lagt i anbudsgeneratoren")}}
function losvekt(){const p=$("#lv-prod").value,m3=V("#lv-areal")*V("#lv-tykk")/100*(1+V("#lv-svinn")/100),l=V("#lv-lass")||1;
  $("#lv-res").innerHTML=tab([[p,`${fmt(m3,2)} m³ ≈ ${fmt(m3*LV[p],1)} tonn`,"kr ___"],["Antall lass",`${Math.ceil(m3/l)} tur(er) à ${fmt(l)} m³`,"kr ___"]])+`<button class="btn ghost" id="lv-til">→ Til anbudsgeneratoren</button>`;
  $("#lv-til").onclick=()=>{window.addPoster([[p+" levert",+m3.toFixed(2),"m³"],["Transport",Math.ceil(m3/l),"tur"]]);toast("Lagt i anbudsgeneratoren")}}
const tab=R=>`<table class="t"><tr><th>Materiale</th><th>Mengde</th><th>Kostnad <span class="tag" style="background:#ffe9c4;color:#8a5200">${MERK}</span></th></tr>${R.map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join("")}</table>`;
document.querySelectorAll("#kristian input,#kristian select").forEach(i=>i.oninput=()=>{belegg();losvekt()});belegg();losvekt();
})();
