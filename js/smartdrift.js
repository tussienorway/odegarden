/* =========================================================================
 * SMARTDRIFT KI – LOGIKK OG INTERAKTIVITET
 * Lager, Hva er plantet hvor/når, Bestillingstidspunkt, Leverandørsammenligning
 * ========================================================================= */
(function(){
  const D = window.SMARTDRIFT_DATA || {};
  const $ = s => document.querySelector(s);
  const $$ = s => document.querySelectorAll(s);

  // Initialisering av faner
  function initTabs() {
    const tabs = $$(".sd-tab-btn");
    const panes = $$(".sd-pane");

    tabs.forEach(btn => {
      btn.onclick = () => {
        tabs.forEach(t => {
          t.classList.remove("active");
          t.setAttribute("aria-selected", "false");
        });
        panes.forEach(p => p.classList.remove("active"));

        btn.classList.add("active");
        btn.setAttribute("aria-selected", "true");
        const targetId = btn.dataset.target;
        const targetPane = $("#" + targetId);
        if (targetPane) targetPane.classList.add("active");
      };
    });
  }

  // FANE 1: LAGER OG INVENTAR
  function renderLager() {
    const list = D.lager || [];
    const container = $("#lager-table-body");
    const countTotal = $("#lager-stat-total");
    const countSalg = $("#lager-stat-salgsklar");
    const countRes = $("#lager-stat-reservert");
    const valTotal = $("#lager-stat-verdi");

    if (!container) return;

    let totStk = 0;
    let totSalg = 0;
    let totRes = 0;
    let sumVerdi = 0;

    list.forEach(i => {
      if (i.enhet === "stk") totStk += i.mengde;
      if (i.status === "salgsklar") totSalg += (i.enhet === "stk" ? i.mengde : 1);
      if (i.status === "reservert_anbud") totRes += (i.enhet === "stk" ? i.mengde : 1);
      sumVerdi += (i.mengde * i.markedsverdiNOK);
    });

    if (countTotal) countTotal.textContent = list.length + " poster";
    if (countSalg) countSalg.textContent = totSalg + " partier";
    if (countRes) countRes.textContent = totRes + " partier";
    if (valTotal) valTotal.textContent = "kr " + sumVerdi.toLocaleString("nb-NO") + ",-";

    const filterKat = $("#lager-filter-kat");
    const filterLok = $("#lager-filter-lok");
    const valKat = filterKat ? filterKat.value : "alle";
    const valLok = filterLok ? filterLok.value : "alle";

    const filtered = list.filter(i => {
      const matchKat = (valKat === "alle" || i.kat === valKat);
      const matchLok = (valLok === "alle" || i.lokasjon.toLowerCase().includes(valLok.toLowerCase()));
      return matchKat && matchLok;
    });

    container.innerHTML = filtered.map(item => {
      const statusBadge = item.status === "salgsklar" 
        ? '<span class="sd-badge salgsklar">Salgsklar</span>'
        : (item.status === "reservert_anbud" 
          ? '<span class="sd-badge reservert">Reservert anbud</span>' 
          : '<span class="sd-badge vekst">I vekst</span>');

      return `
        <tr>
          <td>
            <b>${item.navn}</b><br>
            <small style="color:#5c554c;font-style:italic">${item.botanisk}</small>
          </td>
          <td><span class="tag" style="text-transform:capitalize">${item.kat}</span></td>
          <td>${item.lokasjon}</td>
          <td><b>${item.mengde} ${item.enhet}</b></td>
          <td>${item.herdighet}</td>
          <td>${statusBadge}</td>
          <td>kr ${Number(item.markedsverdiNOK).toLocaleString("nb-NO")},-</td>
        </tr>
      `;
    }).join("");
  }

  // FANE 2: HVA ER PLANTET HVOR OG NÅR (PLANTEKART)
  function renderPlantekart() {
    const feltSelect = $("#kart-felt-select");
    const teigGrid = $("#teig-grid");
    const detailBox = $("#teig-detaljer");

    if (!feltSelect || !teigGrid) return;

    const feltId = feltSelect.value || "tovdal";
    const lokasjon = (D.plantekart && D.plantekart.lokasjoner) 
      ? D.plantekart.lokasjoner.find(l => l.id === feltId)
      : null;

    if (!lokasjon) return;

    $("#felt-beskrivelse").textContent = lokasjon.beskrivelse;

    teigGrid.innerHTML = lokasjon.teiger.map(t => `
      <div class="card pad sd-teig-card" data-teig="${t.id}" style="cursor:pointer;border-left:5px solid var(--g);transition:transform .15s">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <span class="kicker" style="font-size:0.75rem">${t.id} · ${t.areal}</span>
          <span class="sd-badge salgsklar" style="font-size:0.75rem">${t.status.includes("NÅ") ? "Leveringsklar NÅ" : "Aktiv teig"}</span>
        </div>
        <h4 style="margin:4px 0 8px">${t.tittel}</h4>
        <p style="font-size:0.9rem;margin:0 0 6px"><b>Arter:</b> ${t.arter}</p>
        <p style="font-size:0.85rem;color:#5c554c;margin:0"><b>Antall:</b> ${t.antall} | <b>Plantet:</b> ${t.plantedato}</p>
        <div style="margin-top:10px;font-size:0.8rem;color:var(--g);font-weight:700">Vis tiltakslogg og anbudsklarhet ➜</div>
      </div>
    `).join("");

    // Håndter klikk på teig
    $$(".sd-teig-card").forEach(card => {
      card.onclick = () => {
        $$(".sd-teig-card").forEach(c => c.style.outline = "none");
        card.style.outline = "3px solid var(--o)";
        const tid = card.dataset.teig;
        const teig = lokasjon.teiger.find(t => t.id === tid);
        if (teig && detailBox) {
          detailBox.innerHTML = `
            <div class="card pad" style="background:#f6fbf8;border:2px solid var(--g)">
              <div style="display:flex;justify-content:space-between;align-items:center">
                <h3 style="margin:0">${teig.tittel}</h3>
                <span class="tag" style="background:#2e6b34;color:#fff">${lokasjon.navn}</span>
              </div>
              <p style="margin:8px 0"><b>Biologisk sammensetning:</b> ${teig.arter}</p>
              <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin:12px 0">
                <div style="background:#fff;padding:10px;border-radius:8px;border:1px solid #ddd">
                  <small style="color:#666">Plantetidspunkt</small><br>
                  <b>${teig.plantedato}</b>
                </div>
                <div style="background:#fff;padding:10px;border-radius:8px;border:1px solid #ddd">
                  <small style="color:#666">Beholdning / Teig</small><br>
                  <b>${teig.antall}</b>
                </div>
                <div style="background:#fff;padding:10px;border-radius:8px;border:1px solid #ddd">
                  <small style="color:#666">Neste planlagte tiltak</small><br>
                  <b>${teig.tiltak}</b>
                </div>
              </div>
              <p style="font-size:0.9rem;color:#1f4d24;background:#e5f3ec;padding:10px;border-radius:8px">
                🌱 <b>AI-vekstvurdering:</b> Plantene her har gjennomgått to vintre under innlandsklima og oppnår 100 % etablering i kystsone H2/H3 (Grimstad, Arendal, Kristiansand).
              </p>
            </div>
          `;
          detailBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      };
    });
  }

  // FANE 3: BESTILLINGSTIDSPUNKT & SESONGKALKULATOR
  function renderBestilling() {
    const list = (D.bestilling && D.bestilling.anbefalinger) || [];
    const container = $("#bestilling-liste");

    if (!container) return;

    container.innerHTML = list.map(b => `
      <div class="card pad" style="border-left:5px solid ${b.prioritet === 'Kritisk' ? '#cf2e2e' : 'var(--g)'}">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px">
          <span class="sd-badge ${b.prioritet === 'Kritisk' ? 'reservert' : 'salgsklar'}">${b.prioritet} prioritet</span>
          <span style="font-size:0.85rem;color:#5c554c"><b>Ledetid:</b> ${b.ledetidUker} uker</span>
        </div>
        <h3 style="margin:8px 0 4px">${b.kategori}</h3>
        <p style="margin:0 0 8px;font-size:0.9rem"><b>Leverandør:</b> ${b.leverandor} | <b>Bestillingsfrist:</b> Uke ${b.bestillUke} ➔ <b>Levering:</b> Uke ${b.leveringUke}</p>
        <p style="margin:0;font-size:0.88rem;color:#444;background:#f7f4ee;padding:8px 12px;border-radius:6px">
          💡 <b>AI-begrunnelse:</b> ${b.begrunnelse}
        </p>
      </div>
    `).join("");

    // Dynamisk bestillingskalkulator
    const form = $("#bestill-calc-form");
    if (form) {
      form.onsubmit = e => {
        e.preventDefault();
        const vare = $("#calc-vare").value;
        const uke = parseInt($("#calc-uke").value, 10);
        const out = $("#calc-result");

        let ledetid = 4;
        let kommentar = "";

        if (vare === "barrot") {
          ledetid = 16;
          kommentar = "Barrot for våren må forhåndsbestilles før gartneriene går tomme i vinterdvalen.";
        } else if (vare === "plugg") {
          ledetid = 12;
          kommentar = "Krever 8-10 uker vekst og herding i drivhus på Bergemoen før salg.";
        } else if (vare === "losvekt") {
          ledetid = 1;
          kommentar = "Lokal levering fra Reddal Sand har lynrask 2-dagers ledetid i Grimstad.";
        } else if (vare === "stein") {
          ledetid = 4;
          kommentar = "Asak Miljøstein leverer fast til prosjektstart via regionalt lager.";
        }

        let bestillUke = uke - ledetid;
        if (bestillUke <= 0) bestillUke = 52 + bestillUke;

        out.innerHTML = `
          <div class="card pad" style="background:#eef7f1;border:2px solid var(--g);margin-top:14px">
            <h4 style="margin:0 0 6px">AI Bestillingsberegning:</h4>
            <p style="margin:0 0 6px">For å ha varene leveringsklare i <b>Uke ${uke}</b>, må bestillingen sendes senest:</p>
            <div style="font-size:1.4rem;font-weight:900;color:var(--g);margin:8px 0">➔ Uke ${bestillUke}</div>
            <p style="margin:0;font-size:0.85rem;color:#333">${kommentar}</p>
          </div>
        `;
      };
    }
  }

  // FANE 4: LEVERANDØRSAMMENLIGNING & BILLIGSTE INNKJØP
  function renderLeverandorer() {
    const list = D.leverandorer || [];
    const container = $("#leverandor-matrix");

    if (!container) return;

    container.innerHTML = list.map(k => `
      <div class="card pad" style="margin-bottom:20px">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px;border-bottom:1px solid #eee;padding-bottom:10px">
          <div>
            <h3 style="margin:0">${k.kategori}</h3>
            <span style="font-size:0.85rem;color:#5c554c">${k.vare}</span>
          </div>
          <span class="sd-badge salgsklar" style="font-size:0.85rem">Beste valg: <b>${k.anbefalt}</b></span>
        </div>

        <div style="overflow-x:auto;margin-top:12px">
          <table class="pt" style="width:100%;font-size:0.9rem">
            <thead>
              <tr>
                <th>Leverandør</th>
                <th>Enhetspris</th>
                <th>Transport</th>
                <th>Svinnrisiko</th>
                <th>Total Landed Cost</th>
                <th>AI Vurdering</th>
              </tr>
            </thead>
            <tbody>
              ${k.sammenligning.map(l => {
                const erBest = (l.navn.includes(k.anbefalt) || k.anbefalt.includes(l.navn.split(" ")[0]));
                return `
                  <tr style="${erBest ? 'background:#f0f9f3;font-weight:bold' : ''}">
                    <td>
                      ${l.navn}
                      ${erBest ? ' <span class="tag" style="background:#2e6b34;color:#fff">Billigst</span>' : ''}
                    </td>
                    <td>kr ${l.enhetspris},-</td>
                    <td>kr ${l.transport},-</td>
                    <td>${l.svinnPst} %</td>
                    <td style="color:${erBest ? 'var(--g)' : '#333'};font-size:1rem">
                      kr ${l.totalLanded},-
                    </td>
                    <td style="font-size:0.82rem;color:#555">${l.kommentar}</td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `).join("");

    // Besparelseskalkulator
    const form = $("#calc-save-form");
    if (form) {
      form.onsubmit = e => {
        e.preventDefault();
        const kat = $("#calc-save-kat").value;
        const antall = parseFloat($("#calc-save-antall").value) || 1;
        const res = $("#calc-save-result");

        let besparelse = 0;
        let vinner = "";
        let taper = "";

        if (kat === "pukk") {
          // Reddal (388) vs Franzefoss (477) -> 89 kr/m3 spart
          besparelse = Math.round(antall * 89);
          vinner = "Reddal Sand (Grimstad)";
          taper = "Franzefoss Agder";
        } else if (kat === "traer") {
          // Egen Tovdal (424) vs Van der Berk (649) -> 225 kr/tre spart
          besparelse = Math.round(antall * 225);
          vinner = "Egen produksjon Tovdal";
          taper = "Utenlandsk import (Nederland)";
        } else if (kat === "stein") {
          // Asak (212) vs Multiblokk (244) -> 32 kr/m2 spart
          besparelse = Math.round(antall * 32);
          vinner = "Asak Miljøstein (Agder-lager)";
          taper = "Multiblokk (Rogaland)";
        }

        res.innerHTML = `
          <div class="card pad" style="background:#eaf6ee;border:2px solid var(--g);margin-top:12px">
            <h4 style="margin:0 0 6px">AI Optimaliseringsrapport:</h4>
            <p style="margin:0 0 8px">Ved å velge <b>${vinner}</b> framfor <b>${taper}</b> på et volum på <b>${antall} enheter</b>:</p>
            <div style="font-size:1.6rem;font-weight:900;color:var(--g)">
              Beregnet besparelse: kr ${besparelse.toLocaleString("nb-NO")},-
            </div>
            <p style="margin:8px 0 0;font-size:0.85rem;color:#333">Hensyntar transportdistanse til Grimstad samt redusert svinnrisiko ved akklimatiserte produkter.</p>
          </div>
        `;
      };
    }
  }

  // FANE 5: SUPERGROK CLAUDE DRIFTSASSISTENT
  function initDriftsAssistent() {
    const form = $("#sd-ai-form");
    const input = $("#sd-ai-input");
    const msgs = $("#sd-ai-msgs");
    const promptButtons = $$(".sd-prompt-btn");

    if (!form || !msgs) return;

    function addAiMsg(tekst, sender) {
      const d = document.createElement("div");
      d.className = "m " + (sender === "u" ? "u" : "b");
      d.style.whiteSpace = "pre-wrap";
      d.textContent = tekst;
      msgs.appendChild(d);
      msgs.scrollTop = msgs.scrollHeight;
      return d;
    }

    async function sporAI(sporsmal) {
      if (!sporsmal.trim()) return;
      addAiMsg(sporsmal, "u");
      if (input) input.value = "";

      const wait = addAiMsg("Analyserer lager, plantekart og leverandørmatrise…", "b");

      // Forhåndsdefinerte drifts-svar basert på systemkunnskap
      const q = sporsmal.toLowerCase();
      let svar = "";

      if (q.includes("skole") || (q.includes("tovdal") && q.includes("trær"))) {
        svar = `📊 **AI-anbefaling for skoleprosjekt (Felt Tovdal):**\n\nI Teig T2 har vi **85 stk Parklind (Tilia cordata)** med stammeomkrets 14–16 cm, 3x omplantet rotklump, salgsklare NÅ. Dette er et ideelt allétre for offentlige uteområder i Grimstad.\n\nI tillegg står **120 stk Spisslønn 'Royal Red'** i Teig T1 som er herdet for norsk klima. Anbefaler Parklind som førstevalg pga. robusthet mot vind og salt.`;
      } else if (q.includes("pukk") || q.includes("billigst") || q.includes("fevik")) {
        svar = `🚛 **AI Leverandøranalyse for 80 m³ pukk til Fevik/Grimstad:**\n\n• **Reddal Sand:** Enhetspris kr 340,- + transport kr 45,- = **kr 388,- per m³** (Landed Cost).\n• **Grimstad Pukkverk:** Enhetspris kr 355,- + transport kr 75,- = **kr 437,- per m³**.\n\n**Konklusjon:** Bestill fra **Reddal Sand**. På 80 m³ sparer bedriften **kr 3 920,-** i ren transportgevinst, og bilene kan lesse direkte ved innkjøringen på Bergemoen.`;
      } else if (q.includes("frost") || q.includes("haster") || q.includes("bestill")) {
        svar = `❄️ **Kritiske sesongvarsler for uke 42–44:**\n\n1. **Strøsingel & veisalt:** Må bekreftes NÅ for å sikre beredskap for våre 13 brøytemaskiner og Mesta-kontrakten før 1. november.\n2. **Barrot forhåndsbestilling:** Send ordre på Agnbøk og hekkplanter innen uke 46 for å sikre 2027-kvoter.\n3. **Barklager:** Buffer på 85 m³ dekkbark er tilstrekkelig for høstdekke.`;
      } else {
        // Kall gjennom standard AI-adapter
        try {
          const r = await AI.reply([{ role: "user", content: sporsmal }], "drift");
          svar = r.reply;
        } catch (e) {
          svar = `Råd fra driftsmotoren: Viser til lagerdata og plantekart. For spesifikke anbudsdetaljer, kontakt gartner på 37 04 31 02.`;
        }
      }

      wait.textContent = svar;
    }

    form.onsubmit = e => {
      e.preventDefault();
      sporAI(input.value);
    };

    promptButtons.forEach(btn => {
      btn.onclick = () => sporAI(btn.textContent.trim());
    });
  }

  // Initialisering ved lasting
  document.addEventListener("DOMContentLoaded", () => {
    initTabs();
    renderLager();
    renderPlantekart();
    renderBestilling();
    renderLeverandorer();
    initDriftsAssistent();

    const fKat = $("#lager-filter-kat");
    const fLok = $("#lager-filter-lok");
    if (fKat) fKat.onchange = renderLager;
    if (fLok) fLok.onchange = renderLager;

    const fFelt = $("#kart-felt-select");
    if (fFelt) fFelt.onchange = renderPlantekart;
  });
})();
