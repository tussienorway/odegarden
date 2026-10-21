/* Dataadapter. Prototypen bruker LocalAdapter (localStorage i nettleseren).
   Senere: bytt til SupabaseAdapter (EU-region) via et serverless proxy – ingen nøkler i nettleseren. */
(function(){
const KEY="odegarden_anbud",LOG="odegarden_varsler";
const read=k=>{try{return JSON.parse(localStorage.getItem(k))||[]}catch(e){return []}},write=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const LocalAdapter={
  async list(){return read(KEY).sort((a,b)=>b.opprettet.localeCompare(a.opprettet))},
  async get(id){return read(KEY).find(x=>x.id===id)||null},
  async create(a){const all=read(KEY);all.push(a);write(KEY,all);return a},
  async update(id,patch){const all=read(KEY),i=all.findIndex(x=>x.id===id);if(i<0)return null;all[i]={...all[i],...patch,endret:new Date().toISOString()};write(KEY,all);return all[i]},
  async clear(){localStorage.removeItem(KEY);localStorage.removeItem(LOG)},
  async log(v){const l=read(LOG);l.unshift(v);write(LOG,l.slice(0,50))},
  async logs(){return read(LOG)}
};
const SupabaseAdapter={/* TODO fase 1: kall eget proxy-endepunkt (f.eks. AI_CONFIG.ANBUD_ENDPOINT), som bruker Supabase. */
  async list(){throw new Error("Supabase er ikke koblet til i prototypen")}};
const ref=()=>"ODE-"+new Date().toISOString().slice(2,10).replace(/-/g,"")+"-"+Math.random().toString(36).slice(2,6).toUpperCase();
window.DB={adapter:LocalAdapter,
  list:(...a)=>DB.adapter.list(...a),get:(...a)=>DB.adapter.get(...a),update:(...a)=>DB.adapter.update(...a),clear:()=>DB.adapter.clear(),logs:()=>DB.adapter.logs(),
  /** Lagrer anbud, ruter det og logger et simulert varsel. */
  async create(a){const r=window.Ruting?Ruting.route(a):{};const rec={id:a.id||ref(),opprettet:a.opprettet||new Date().toISOString(),status:"ny",notater:"",...a,...r,...(a.tildelt_til?{tildelt_til:a.tildelt_til}:{})};
    await DB.adapter.create(rec);await DB.adapter.log({tid:new Date().toISOString(),id:rec.id,til:rec.tildelt_til,haster:rec.haster,tekst:`${rec.varsel||"Varsel"} → ${window.Ruting?Ruting.rolle(rec.tildelt_til):rec.tildelt_til}`});return rec},
  _SupabaseAdapter:SupabaseAdapter};
})();
