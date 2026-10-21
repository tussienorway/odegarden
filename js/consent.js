/* Samtykke (opt-in). Nødvendig lagring (chat, demo) krever ikke samtykke. Analyse lastes KUN ved «Godta» OG når ANALYTICS_CONFIG har id. */
(function(){
const K="odegarden_samtykke",get=()=>{try{return JSON.parse(localStorage.getItem(K))}catch(e){return null}};
const A=()=>window.ANALYTICS_CONFIG||{};
function loadAnalytics(){const c=A();if(!c.id||!c.src||document.getElementById("ana"))return;const s=document.createElement("script");s.id="ana";s.defer=true;s.src=c.src;
  if(c.provider==="plausible")s.dataset.domain=c.id;else if(c.provider==="umami")s.dataset.websiteId=c.id;document.head.appendChild(s)}
function save(v){localStorage.setItem(K,JSON.stringify({analyse:v,tid:new Date().toISOString(),versjon:1}));hide();if(v)loadAnalytics();else{const s=document.getElementById("ana");if(s)location.reload()}}
let el;function show(){if(!el){el=document.createElement("div");el.className="consent";el.setAttribute("role","dialog");el.setAttribute("aria-labelledby","c-t");
  el.innerHTML='<p id="c-t"><b>Informasjonskapsler og statistikk</b></p><p>Vi bruker bare det som trengs for at siden skal virke. Med ditt samtykke kan vi i tillegg måle besøk anonymt for å gjøre siden bedre'+(A().id?"":" (ikke aktivert ennå)")+'. <a href="personvern.html#samtykke">Les mer</a></p><div class="c-btns"><button type="button" class="btn ghost" data-c="0">Bare nødvendige</button><button type="button" class="btn ghost" data-c="1">Godta statistikk</button></div>';
  el.onclick=e=>{const b=e.target.closest("[data-c]");if(b)save(b.dataset.c==="1")};document.body.appendChild(el)}el.hidden=false;el.querySelector("[data-c]").focus({preventScroll:true})}
function hide(){if(el)el.hidden=true}
window.Samtykke={get,show,save};
document.addEventListener("click",e=>{if(e.target.closest("[data-samtykke]")){e.preventDefault();show()}});
const v=get();if(!v)window.addEventListener("load",()=>setTimeout(show,600));else if(v.analyse)loadAnalytics();
})();
