/* Enkel lagring i localStorage. Bytt ut med API-kall når backend finnes. */
window.Store={
  get(k,d){try{return JSON.parse(localStorage.getItem("odegarden_"+k))??d}catch(e){return d}},
  set(k,v){localStorage.setItem("odegarden_"+k,JSON.stringify(v))},
  id(){return Date.now().toString(36)+Math.random().toString(36).slice(2,6)},
  addRequest(r){const a=this.get("foresporsler",[]);const o={id:this.id(),dato:new Date().toISOString(),status:"ny",...r};a.unshift(o);this.set("foresporsler",a);return o}
};
window.toast=t=>{const d=document.createElement("div");d.className="toast";d.textContent=t;document.body.appendChild(d);setTimeout(()=>d.remove(),3200)};
