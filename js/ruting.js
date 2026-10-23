/* Rutingsmotor: leser RUTING_CONFIG og setter mottaker, hast og varsel. Ingen sending skjer. */
(function(){
const C=()=>window.RUTING_CONFIG;
const match=(h,a)=>Object.entries(h).every(([k,v])=>{
  if(k==="min_m2")return (+a.maal_m2||0)>=v;
  if(k==="min_budsjett")return (+a.budsjett||0)>=v;
  if(k==="oppstart")return v.includes(a.onsket_oppstart);
  return v.includes(a[k]);
});
window.Ruting={
  route(a){const c=C(),r=c.regler.find(x=>match(x.hvis,a)),h=c.hast.find(x=>match(x.hvis,a));
    const haster=h?h.niva:(a.haster||"normal");
    return {tildelt_til:r.til,regel:r.navn,haster,hast_regel:h?h.navn:"Standard",varsel:c.varsling[haster]}},
  rolle:k=>(C().roller[k]||{navn:k}).navn
};
})();
