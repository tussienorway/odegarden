/* EKSEMPEL – rutingsregler for prototypen. Ødegården må bekrefte roller, grenser og varsling.
   Reglene leses ovenfra; første treff vinner. Endre her uten å røre koden. */
window.RUTING_CONFIG={
  eksempel:true,
  roller:{
    sekretaer:{navn:"Sekretær",kontakt:"sekretaer@eksempel.no (EKSEMPEL)"},
    sjef:{navn:"Daglig leder",kontakt:"sjef@eksempel.no (EKSEMPEL)"},
    prosjektleder:{navn:"Prosjektleder anlegg",kontakt:"prosjekt@eksempel.no (EKSEMPEL)"},
    drift:{navn:"Driftsleder brøyting/drift",kontakt:"drift@eksempel.no / SMS 900 00 000 (EKSEMPEL)"}
  },
  regler:[
    {navn:"Offentlig kunde / anbud til daglig leder",hvis:{kundetype:["offentlig"]},til:"sjef"},
    {navn:"Stor jobb (≥ 300 m²) til daglig leder",hvis:{min_m2:300},til:"sjef"},
    {navn:"Oppgitt budsjett over 250 000 kr til daglig leder",hvis:{min_budsjett:250000},til:"sjef"},
    {navn:"Brøyting og drift til driftsleder",hvis:{tjeneste:["broyting","drift"]},til:"drift"},
    {navn:"Anleggsgartner til prosjektleder",hvis:{tjeneste:["anleggsgartner"]},til:"prosjektleder"},
    {navn:"Alt annet til sekretær",hvis:{},til:"sekretaer"}
  ],
  hast:[
    {navn:"Kunden har valgt «Haster»",hvis:{haster:["hoy"]},niva:"hoy"},
    {navn:"Brøyting med oppstart nå",hvis:{tjeneste:["broyting"],oppstart:["Så fort som mulig"]},niva:"hoy"},
    {navn:"Ingen dato satt",hvis:{oppstart:["Fleksibel"]},niva:"lav"}
  ],
  varsling:{hoy:"SMS + e-post med en gang (simulert i prototypen)",normal:"E-post (simulert)",lav:"Med i daglig oversikt (simulert)"}
};
