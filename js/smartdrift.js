/* =========================================================================
 * SMARTDRIFT KI – LOGIKK OG INTERAKTIVITET
 * Lager, Hva er plantet hvor/når, Bestillingstidspunkt, Leverandørsammenligning
 * ========================================================================= */
(function(){
  const D = window.SMARTDRIFT_DATA || {};
  const $ = s => document.querySelector(s);
  const $$ = s => document.querySelectorAll(s);

  // Initialisering av faner med ARIA og URL-hash støtte
  function initTabs() {
    const tabs = $$(".sd-tab-btn");
    const panes = $$(".sd-pane");

    function activateTab(btn, updateHash = true) {
      if (!btn) return;
      tabs.forEach(t => {
        t.classList.remove("active");
        t.setAttribute("aria-selected", "false");
        t.setAttribute("tabindex", "-1");
      });
      panes.forEach(p => p.classList.remove("active"));

      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");
      btn.setAttribute("tabindex", "0");
      const targetId = btn.dataset.target;
      const targetPane = $("#" + targetId);
      if (targetPane) targetPane.classList.add("active");

      if (updateHash && window.history && window.history.replaceState) {
        history.replaceState(null, "", "#" + targetId);
      }
    }

    tabs.forEach((btn, index) => {
      btn.onclick = () => activateTab(btn, true);

      // Tastaturnavigasjon (Arrow keys)
      btn.onkeydown = e => {
        let nextIndex = index;
        if (e.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
        else if (e.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
        else return;

        e.preventDefault();
        tabs[nextIndex].focus();
        activateTab(tabs[nextIndex], true);
      };
    });

    // Sjekk URL hash ved oppstart
    const hash = (location.hash || "").replace("#", "");
    if (hash) {
      const matchBtn = Array.from(tabs).find(b => b.dataset.target === hash);
      if (matchBtn) activateTab(matchBtn, false);
    }
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

    let countPoster = list.length;
    let salgsklarePoster = 0;
    let reservertePoster = 0;
    let sumVerdi = 0;
    let totStkPlanter = 0;
    let totM3Losvekt = 0;

    list.forEach(i => {
      if (i.status === "salgsklar") salgsklarePoster++;
      if (i.status === "reservert_anbud") reservertePoster++;
      if (i.enhet === "stk") totStkPlanter += i.mengde;
      if (i.enhet === "m³") totM3Losvekt += i.mengde;
      sumVerdi += (i.mengde * i.markedsverdiNOK);
    });

    if (countTotal) countTotal.textContent = countPoster + " poster";
    if (countSalg) countSalg.textContent = salgsklarePoster + " partier";
    if (countRes) countRes.textContent = reservertePoster + " parti";
    if (valTotal) valTotal.textContent = "kr " + sumVerdi.toLocaleString("nb-NO") + ",-";

    const filterKat = $("#lager-filter-kat");
    const filterLok = $("#lager-filter-lok");
    const filterSok = $("#lager-filter-sok");
    const valKat = filterKat ? filterKat.value : "alle";
    const valLok = filterLok ? filterLok.value : "alle";
    const valSok = filterSok ? filterSok.value.trim().toLowerCase() : "";

    const filtered = list.filter(i => {
      const matchKat = (valKat === "alle" || i.kat === valKat);
      const matchLok = (valLok === "alle" || i.lokasjon.toLowerCase().includes(valLok.toLowerCase()));
      const matchSok = (!valSok || i.navn.toLowerCase().includes(valSok) || i.botanisk.toLowerCase().includes(valSok));
      return matchKat && matchLok && matchSok;
    });

    if (filtered.length === 0) {
      container.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:24px;color:#666">Ingen varer matcher valgt filter.</td></tr>`;
      return;
    }

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
      <div class="card pad sd-teig-card" data-teig="${t.id}" style="cursor:pointer;border-left:5px solid var(--g);transition:transform .15s" role="button" tabindex="0" aria-label="Velg ${t.tittel}">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <span class="kicker" style="font-size:0.75rem">${t.id} · ${t.areal}</span>
          <span class="sd-badge salgsklar" style="font-size:0.75rem">${t.status.includes("NÅ") ? "Leveringsklar NÅ" : "Aktiv teig"}</span>
        </div>
        <h4 style="margin:4px 0 8px">${t.tittel}</h4>
        <p style="font-size:0.9rem;margin:0 0 6px"><b>Arter:</b> ${t.arter}</p>
        <p style="font-size:0.85rem;color:#5c554c;margin:0"><b>Antall:</b> ${t.antall} | <b>Plantet:</b> ${t.plantedato}</p>
        <div style="margin-top:10px;font-size:0.8rem;color:var(--g);font-weight:700">Vis tiltakslogg og biologisk analyse ➜</div>
      </div>
    `).join("");

    function showTeigDetail(teig) {
      if (!teig || !detailBox) return;
      const vurdering = teig.vurdering || (lokasjon.id === "tovdal"
        ? "Plantene her har gjennomgått to vintre under innlandsklima og oppnår 100 % etablering i kystsone H2/H3."
        : "Optimalisert under kystklima på Bergemoen med automatisert oppfølging.");

      detailBox.innerHTML = `
        <div class="card pad" style="background:#f6fbf8;border:2px solid var(--g)">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
            <h3 style="margin:0">${teig.tittel}</h3>
            <span class="tag" style="background:#2e6b34;color:#fff">${lokasjon.navn}</span>
          </div>
          <p style="margin:8px 0"><b>Biologisk sammensetning / Materiale:</b> ${teig.arter}</p>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin:12px 0">
            <div style="background:#fff;padding:10px;border-radius:8px;border:1px solid #ddd">
              <small style="color:#666">Plantetidspunkt / Etablert</small><br>
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
          <p style="font-size:0.9rem;color:#1f4d24;background:#e5f3ec;padding:10px;border-radius:8px;margin:0">
            🌱 <b>AI-vekstvurdering:</b> ${vurdering}
          </p>
        </div>
      `;
      detailBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    // Håndter klikk og tastatur på teig
    $$(".sd-teig-card").forEach(card => {
      const tid = card.dataset.teig;
      const teig = lokasjon.teiger.find(t => t.id === tid);

      const trigger = () => {
        $$(".sd-teig-card").forEach(c => c.style.outline = "none");
        card.style.outline = "3px solid var(--o)";
        showTeigDetail(teig);
      };

      card.onclick = trigger;
      card.onkeydown = e => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          trigger();
        }
      };
    });

    // Vis første teig automatisk hvis detailBox er tom
    if (lokasjon.teiger.length > 0 && (!detailBox.innerHTML || detailBox.innerHTML.trim() === "")) {
      showTeigDetail(lokasjon.teiger[0]);
    }
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

        if (isNaN(uke) || uke < 1 || uke > 52) {
          out.innerHTML = `<p style="color:#cf2e2e;font-weight:bold;margin-top:10px">Vennligst oppgi et gyldig ukenummer mellom 1 og 52.</p>`;
          return;
        }

        let ledetid = 4;
        let kommentar = "";

        if (vare === "barrot") {
          ledetid = 16;
          kommentar = "Barrot for våren må forhåndsbestilles før gartneriene i Norge og Europa går tomme i vinterdvalen.";
        } else if (vare === "plugg") {
          ledetid = 12;
          kommentar = "Krever 8–10 uker vekst og herding i veksthus på Bergemoen før utlevering etter frost.";
        } else if (vare === "losvekt") {
          ledetid = 1;
          kommentar = "Lokal levering fra Reddal Sand har lynrask 1–2 dagers ledetid i Grimstad-området.";
        } else if (vare === "stein") {
          ledetid = 4;
          kommentar = "Asak Miljøstein leverer fast til prosjektstart via regionalt Agder-lager.";
        }

        let bestillUke = uke - ledetid;
        let aarKommentar = "samme driftsår";
        if (bestillUke <= 0) {
          bestillUke = 52 + bestillUke;
          aarKommentar = "høsten/vinteren året før levering";
        }

        out.innerHTML = `
          <div class="card pad" style="background:#eef7f1;border:2px solid var(--g);margin-top:14px">
            <h4 style="margin:0 0 6px">AI Bestillingsberegning:</h4>
            <p style="margin:0 0 6px">For å ha varene leveringsklare i <b>Uke ${uke}</b>, må bestillingen sendes senest:</p>
            <div style="font-size:1.4rem;font-weight:900;color:var(--g);margin:8px 0">➔ Uke ${bestillUke} (${aarKommentar})</div>
            <p style="margin:0;font-size:0.85rem;color:#333">${kommentar}</p>
          </div>
        `;
      };
    }
  }

  // FANE 4: LEVERANDØRSAMMENLIGNING & BILLIGSTE INNKJØP (LANDED COST)
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

    // Dynamisk datadrevet besparelseskalkulator
    const form = $("#calc-save-form");
    if (form) {
      form.onsubmit = e => {
        e.preventDefault();
        const katKey = $("#calc-save-kat").value;
        const antall = parseFloat($("#calc-save-antall").value);
        const res = $("#calc-save-result");

        if (isNaN(antall) || antall <= 0) {
          res.innerHTML = `<p style="color:#cf2e2e;font-weight:bold;margin-top:10px">Vennligst oppgi et volum/antall større enn 0.</p>`;
          return;
        }

        let catMatch = null;
        let altIndex = 2; // Sammenlign med dyreste alternativ

        if (katKey === "pukk") {
          catMatch = list.find(l => l.kategori.includes("Løsvekt"));
        } else if (katKey === "traer") {
          catMatch = list.find(l => l.kategori.includes("Allétrær"));
        } else if (katKey === "stein") {
          catMatch = list.find(l => l.kategori.includes("Belegningsstein"));
        }

        if (catMatch && catMatch.sammenligning && catMatch.sammenligning.length > 1) {
          const sorted = [...catMatch.sammenligning].sort((a,b) => a.totalLanded - b.totalLanded);
          const best = sorted[0];
          const worst = sorted[sorted.length - 1];
          const diffPerUnit = worst.totalLanded - best.totalLanded;
          const besparelse = Math.round(antall * diffPerUnit);

          res.innerHTML = `
            <div class="card pad" style="background:#eaf6ee;border:2px solid var(--g);margin-top:12px">
              <h4 style="margin:0 0 6px">AI Optimaliseringsrapport:</h4>
              <p style="margin:0 0 8px">Ved å velge <b>${best.navn}</b> (kr ${best.totalLanded},- /enh.) fremfor <b>${worst.navn}</b> (kr ${worst.totalLanded},- /enh.) på et volum på <b>${antall}</b>:</p>
              <div style="font-size:1.6rem;font-weight:900;color:var(--g)">
                Beregnet besparelse: kr ${besparelse.toLocaleString("nb-NO")},-
              </div>
              <p style="margin:8px 0 0;font-size:0.85rem;color:#333">Beregningen inkluderer transportdistanse til Grimstad samt redusert svinnrisiko ved akklimatiserte produkter.</p>
            </div>
          `;
        }
      };
    }
  }

  // FANE 5: SUPERGROK CLAUDE DRIFTSASSISTENT MED PROXY-KONFIGURASJON
  function initDriftsAssistent() {
    const form = $("#sd-ai-form");
    const input = $("#sd-ai-input");
    const msgs = $("#sd-ai-msgs");
    const promptButtons = $$(".sd-prompt-btn");
    const proxyToggle = $("#proxy-config-toggle");
    const proxyBox = $("#proxy-config-box");
    const proxyForm = $("#proxy-config-form");

    if (proxyToggle && proxyBox) {
      proxyToggle.onclick = () => {
        const isHidden = proxyBox.style.display === "none";
        proxyBox.style.display = isHidden ? "block" : "none";
        proxyToggle.textContent = isHidden ? "✕ Skjul proxy-innstillinger" : "⚙️ Konfigurer SuperGrok Claude Proxy";
      };
    }

    if (proxyForm) {
      const endpointInput = $("#proxy-endpoint-input");
      const keyInput = $("#proxy-key-input");
      const currentCfg = (window.AI && window.AI.getProxyConfig) ? AI.getProxyConfig() : {};
      if (endpointInput && currentCfg.endpoint) endpointInput.value = currentCfg.endpoint;
      if (keyInput && currentCfg.apiKey) keyInput.value = currentCfg.apiKey;

      proxyForm.onsubmit = e => {
        e.preventDefault();
        const ep = (endpointInput ? endpointInput.value.trim() : "");
        const k = (keyInput ? keyInput.value.trim() : "");
        if (window.AI && window.AI.setProxy) {
          AI.setProxy(ep, k);
          if (window.toast) toast(ep ? "Proxy lagret i nettleseren! 🔒" : "Tilbakestilt til lokal/demo");
          const statusSpan = $("#proxy-status-display");
          if (statusSpan) {
            statusSpan.textContent = ep ? "Aktiv konfigurert proxy" : "Klargjort for serverless proxy (0 kr i demo)";
            statusSpan.style.color = ep ? "var(--g)" : "#666";
          }
        }
      };
    }

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

      const currentBrain = window.AI ? window.AI.getBrain() : "claude_supergrok";
      let statusHint = "Analyserer lager, plantekart og leverandørmatrise…";
      if (currentBrain === "local_llama") {
        statusHint = "Analyserer via Lokal Qwen 3.5 9B på RTX 5060 Ti GPU (port 8080)…";
      } else if (currentBrain === "claude_supergrok") {
        statusHint = "Analyserer via Claude via SuperGrok…";
      }

      const wait = addAiMsg(statusHint, "b");

      try {
        const r = await AI.reply([{ role: "user", content: sporsmal }], "drift");
        wait.textContent = r.reply;
      } catch (err) {
        wait.textContent = `Feil ved inferens: ${err.message}. Driftsmotoren faller tilbake til lokal regelbase.`;
      }
    }

    form.onsubmit = e => {
      e.preventDefault();
      sporAI(input.value);
    };

    promptButtons.forEach(btn => {
      btn.onclick = () => sporAI(btn.textContent.trim());
    });
  }

  // INNKOMNE ANBUD FRA ANBUDSCHAT
  function renderInnkomneAnbud() {
    const box = $("#sd-anbud-listen");
    if (!box || !window.Store) return;

    const items = Store.get("foresporsler", []);
    if (items.length === 0) {
      box.innerHTML = `<p class="note" style="margin:8px 0">Ingen anbudsforespørsler mottatt i nettleseren ennå. Test ved å sende en forespørsel i AI Anbudschatten!</p>`;
      return;
    }

    box.innerHTML = `
      <div style="overflow-x:auto">
        <table class="pt" style="width:100%;font-size:0.88rem">
          <thead>
            <tr>
              <th>Dato</th>
              <th>Tjeneste</th>
              <th>Omfang / Mål</th>
              <th>Kunde / Firma</th>
              <th>Kontakt</th>
              <th>Hjerne</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(r => `
              <tr>
                <td><small>${new Date(r.dato || r.opprettet).toLocaleDateString("nb-NO")}</small></td>
                <td><b>${r.tjeneste || "-"}</b></td>
                <td>${r.maal || "-"}</td>
                <td>${r.navn || "-"}</td>
                <td>${r.tlf || "-"}</td>
                <td><small>${r.hjerne || "AI"}</small></td>
                <td><span class="sd-badge salgsklar">${r.status || "ny"}</span></td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  // Initialisering ved DOM-lasting
  document.addEventListener("DOMContentLoaded", () => {
    initTabs();
    renderLager();
    renderPlantekart();
    renderBestilling();
    renderLeverandorer();
    initDriftsAssistent();
    renderInnkomneAnbud();

    const fKat = $("#lager-filter-kat");
    const fLok = $("#lager-filter-lok");
    const fSok = $("#lager-filter-sok");
    if (fKat) fKat.onchange = renderLager;
    if (fLok) fLok.onchange = renderLager;
    if (fSok) fSok.oninput = renderLager;

    const fFelt = $("#kart-felt-select");
    if (fFelt) fFelt.onchange = renderPlantekart;
  });
})();
