/* =========================================================================
 * AI-ADAPTER MED STØTTE FOR CLAUDE VIA SUPERGROK OG LOKAL LLAMA-SERVER
 * ========================================================================= */
(function(){
  const C = window.AI_CONFIG || {};
  const F = window.FIRMA || {};
  const MOTTAKER = F.epost || "post@odegardens.no";

  let activeBrain = C.ACTIVE_BRAIN || "claude_supergrok";

  const norm = s => String(s || "").toLowerCase();

  // Fagbase for rask respons
  const FAG = [
    {
      k: ["åpent", "åpningstid", "åpner", "stenger", "lørdag", "søndag"],
      a: "Hagesenteret på Bergemoen har åpent:\n• Mandag–fredag 09:00–16:00\n• Lørdag 09:00–15:00\n• Søndag etter avtale\n(Helligdager og høst/vintertider meldes på Facebook)."
    },
    {
      k: ["gaselle", "historie", "år", "siden", "1965"],
      a: "Ødegårdens Planteskole og Utemiljø har inspirert til grønne fingre siden 1965! Vi er kåret til Gasellebedrift tre år på rad, og dyrker egne hardføre trær og hekker på Bergemoen og i Tovdal."
    },
    {
      k: ["tovdal", "dyrke", "trær", "hardfør", "klima"],
      a: "På vårt 24 dekar store produksjonsfelt i Tovdal viderekultiverer vi større løvtrær, hekk og frukttrær. Innlandsklimaet gjør plantene ekstremt hardføre (H4–H6), med topp etableringsevne når de plantes ut på Sørlandet."
    },
    {
      k: ["sommerblomst", "staude", "rose", "slyngplant", "prydbusk", "hagesenter", "krukke", "rhododendron"],
      a: "I hagesenteret på Bergemoen finner du sommerblomster, flerårige stauder, prydbusker og et rikt roseutvalg (buskroser, stilkroser, klaseroser, klatreroser og grupperoser). Sommerblomster plantes ut etter at nattefrosten har sluppet taket."
    },
    {
      k: ["brøyt", "snø", "strø", "feie", "feiing", "vinter", "glatt", "vakt"],
      a: "Vi har drevet profesjonell vinterdrift siden 1995 med en maskinpark på 13 brøytemaskiner! Vi brøyter for Mesta, Grimstad Kommune, kryss på nye E-18 og private bedrifter. Større oppdrag har tilgang til døgnkontinuerlig mekaniker beredskapsvakt."
    },
    {
      k: ["bark", "matjord", "jord", "kompost", "grus", "singel", "pukk", "sand", "kulestein", "flis", "løsvekt", "reddal"],
      a: "I samarbeid med Reddal Sand selger vi 12 fraksjoner i løsvekt ved innkjøringen: grus (0-4, 0-18mm), natursingel (2-10, 10-20mm), pukk (8-16, 16-22mm), kulestein, pussesand (0-4mm til sandkasser), støpesand (0-6mm), bark, flis og kompostjord. Vi hjelper deg å lesse med hjullaster, eller vi tipper det hjemme hos deg. Vipps og kort."
    },
    {
      k: ["belegning", "heller", "skifer", "mur", "trapp", "kantstein", "hagedesign", "anleggsgartner", "gårdsplass", "innkjørsel"],
      a: "Som anleggsgartner leverer vi komplette utemiljøer: hagedesign tilpasset sol, jord og kalk, legging av belegningsstein, heller, skifer, støttemurer, trapper og ferdigplen. Vi beregner bærelag og massebehov nøyaktig."
    },
    {
      k: ["vei", "finne", "adresse", "hvor ligger", "kjøre"],
      a: "Du finner oss i Bergeveien 8, 4886 Grimstad. Ta av fra E-18 mot Vesterled, ta av mot Bergemoen og sving inn til venstre i Bergeveien."
    }
  ];

  // Anbudsflyt med intelligent mengdeberegning
  const ANBUDS_STEG = [
    {
      key: "tjeneste",
      sporsmal: "Hvilken type oppdrag gjelder anbudet?",
      valg: ["Anleggsgartner & Stein", "Brøyting & Vinterdrift", "Løsvekt & Masser", "Planteskole & Trær", "Helårsdrift av Grøntanlegg"]
    },
    {
      key: "maal",
      sporsmal: "Hvor stort er arealet eller omfanget? (F.eks. «50 m² belegningsstein», «12 m hekk», «6 m³ bark», «250 m² parkeringsplass brøyting»)"
    },
    {
      key: "adresse",
      sporsmal: "Hva er adressen eller oppdragsstedet i Grimstad og omegn?"
    },
    {
      key: "tidsrom",
      sporsmal: "Når er ønsket oppstart / levering?",
      valg: ["Snarest mulig", "I løpet av våren", "Før vinteren (brøyteavtale)", "Fleksibelt / ved anbudsfrist"]
    },
    {
      key: "navn",
      sporsmal: "Hva er navnet ditt eller firmanavnet?"
    },
    {
      key: "tlf",
      sporsmal: "Hvilket telefonnummer eller e-post kan vi kontakte deg på?"
    }
  ];

  const state = { flow: false, data: {}, stepIndex: 0 };

  // Hjelpefunksjon for automatisk anbudskalkulasjon
  function kalkulerMengder(tjeneste, maalRaw) {
    const s = norm(maalRaw);
    let beregning = "";

    // Sjekk kvadratmeter
    const m2Match = s.match(/(\d+(?:[.,]\d+)?)\s*(?:m2|kvadrat|m²)/i);
    const m3Match = s.match(/(\d+(?:[.,]\d+)?)\s*(?:m3|kubikk|m³)/i);
    const lmMatch = s.match(/(\d+(?:[.,]\d+)?)\s*(?:m|meter|løpemeter)/i);

    if (tjeneste.includes("Stein") || tjeneste.includes("Anleggsgartner")) {
      const m2 = m2Match ? parseFloat(m2Match[1].replace(",", ".")) : null;
      if (m2) {
        const pukk = (m2 * 0.18).toFixed(1); // 18 cm bærelag pukk 8-16
        const sand = (m2 * 0.03).toFixed(1); // 3 cm settesand
        beregning = `Beregnet materialbehov for ${m2} m² belegningsstein:\n• Bærelag (pukk 8–16 mm): ca. ${pukk} m³\n• Settesand (0–4 mm): ca. ${sand} m³\n• Belegningsstein: ca. ${m2} m² + 5 % kapp\n• Leverandøranbefaling: Reddal Sand (fra eget anlegg) + Asak Herregård`;
      }
    } else if (tjeneste.includes("Løsvekt")) {
      const m2 = m2Match ? parseFloat(m2Match[1].replace(",", ".")) : null;
      if (m2 && (s.includes("bark") || s.includes("dekk"))) {
        const m3 = (m2 * 0.06).toFixed(1); // 6 cm dybde
        beregning = `For ${m2} m² plantebed anbefales 5–7 cm dekkbark:\n• Beregnet volum: ca. ${m3} m³ finkuttet furubark\n• Levering: Tippbil fra anlegget på Bergemoen eller hentehenger.`;
      } else if (m3Match) {
        beregning = `Spesifisert volum: ${m3Match[1]} m³. Vi hjelper med maskinlessing ved innkjøringen eller levering med kran/tippbil.`;
      }
    } else if (tjeneste.includes("Planteskole") || tjeneste.includes("Hekk") || s.includes("hekk")) {
      const meter = lmMatch ? parseFloat(lmMatch[1].replace(",", ".")) : null;
      if (meter) {
        const planter = Math.round(meter * 2.8);
        beregning = `Beregnet hekkbehov for ${meter} løpemeter:\n• Antall hekkplanter (2,5–3 per meter): ca. ${planter} stk\n• Anbefaling: Hardfør Agnbøk eller Tuja Smaragd fra felt Tovdal/Bergemoen.`;
      }
    } else if (tjeneste.includes("Brøyting")) {
      beregning = `Brøyte- og strøavtale:\n• Inkluderer registrering i ruteplan for våre 13 brøytemaskiner\n• Døgnkontinuerlig mekaniker beredskapsvakt ved kraftig snøfall\n• Strøing med singel fra Reddal Sand.`;
    }

    return beregning;
  }

  function formaterAnbudsutkast(d) {
    return `===========================================\nANBUDSFORESPØRSEL – ØDEGÅRDENS UTEMILJØ\n===========================================\nTjeneste:       ${d.tjeneste || "-"}\nOmfang / Mål:   ${d.maal || "-"}\nOppdragssted:   ${d.adresse || "-"}\nØnsket oppstart:${d.tidsrom || "-"}\n\n${d.beregning ? "FAGLIG MENGDEBEREGNING (AI-kalkulert):\n" + d.beregning + "\n\n" : ""}Kunde / Firma:  ${d.navn || "-"}\nKontakt:        ${d.tlf || "-"}\nBehandlende AI: ${C[activeBrain.toUpperCase()] ? C[activeBrain.toUpperCase()].navn : activeBrain}\n===========================================`;
  }

  function mailto(d) {
    const emne = `Anbudsforespørsel: ${d.tjeneste || "Utemiljø"} – ${d.adresse || "Grimstad"}`;
    return `mailto:${MOTTAKER}?subject=${encodeURIComponent(emne)}&body=${encodeURIComponent(formaterAnbudsutkast(d))}`;
  }

  function startAnbudsflyt(tjeneste) {
    state.flow = true;
    state.data = { tjeneste: tjeneste || "Anleggsgartner & Stein" };
    state.stepIndex = tjeneste ? 1 : 0;
    const steg = ANBUDS_STEG[state.stepIndex];

    const hilsen = tjeneste 
      ? `Supert – vi oppretter en strukturert anbudsforespørsel for **${tjeneste}**! 📋\n\n`
      : `Flott! Jeg hjelper deg med å spesifisere og beregne anbudet ditt for Ødegården. 📋\n\n`;

    return {
      reply: hilsen + steg.sporsmal,
      qr: steg.valg
    };
  }

  function fortsettAnbudsflyt(raw) {
    const d = state.data;
    const steg = ANBUDS_STEG[state.stepIndex];

    if (steg.key === "tlf") {
      const rens = raw.replace(/\D/g, "");
      const erEpost = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(raw.trim());
      if (rens.length < 8 && !erEpost) {
        return { reply: "Vennligst oppgi et gyldig telefonnummer (8 sifre) eller en e-postadresse, slik at prosjektlederen kan nå deg 🙂" };
      }
    }

    d[steg.key] = raw.trim();
    state.stepIndex++;

    if (state.stepIndex < ANBUDS_STEG.length) {
      const neste = ANBUDS_STEG[state.stepIndex];
      return {
        reply: neste.sporsmal,
        qr: neste.valg
      };
    }

    // Fullført anbudsflyt
    state.flow = false;
    d.beregning = kalkulerMengder(d.tjeneste, d.maal);
    d.hjerne = activeBrain;

    const utkast = formaterAnbudsutkast(d);
    const req = {
      ...d,
      type: "anbud",
      opprettet: new Date().toISOString(),
      status: "ny"
    };

    return {
      reply: `Takk! Her er det ferdig beregnede anbudsutkastet 📐✨\n\n\`\`\`\n${utkast}\n\`\`\`\n\nTrykk **«✉️ Send på e-post»** for å åpne e-postprogrammet ditt med alt ferdig utfylt til \`${MOTTAKER}\`.`,
      request: req,
      actions: [
        { label: "✉️ Send på e-post", href: mailto(d) },
        { label: "📋 Kopier anbudstekst", copy: utkast }
      ]
    };
  }

  // Lokal regelbasert assistent
  function regelbasertMotor(history) {
    const raw = history[history.length - 1].content;
    const t = norm(raw);

    if (state.flow) return fortsettAnbudsflyt(raw);

    const has = (...words) => words.some(w => t.includes(w));

    if (has("anbud", "tilbud", "prosjekt", "befaring", "prisforespørsel", "bestill oppdrag")) {
      return startAnbudsflyt(state.lastTj);
    }

    if (has("hjerne", "claude", "supergrok", "modell", "llama", "qwen")) {
      const bInfo = C[activeBrain.toUpperCase()] || { navn: activeBrain };
      return {
        reply: `Aktiv resonneringshjerne: **${bInfo.navn}**.\n\nDu kan veksle mellom:\n1. Claude via SuperGrok (hovedhjerne)\n2. Lokal Qwen 3.5 9B på RTX 5060 Ti\n3. Regelbasert nødmodus`,
        qr: ["Bruk Claude via SuperGrok", "Bruk Lokal RTX 5060 Ti", "Start anbudsforespørsel"]
      };
    }

    if (has("hei", "hallo", "god dag", "heisann") && t.length < 25) {
      return {
        reply: "Hei! 👋 Velkommen til Ødegårdens Planteskole og Utemiljø. Jeg er din digitale anbuds- og fagassistent.\n\nVil du ha hjelp til et anbud (anleggsgartner, brøyting, løsvekt), sjekke åpningstider, eller vite hva som er plantet på Bergemoen og i Tovdal?",
        qr: ["Start anbudschat", "Bark og matjord", "Vinterdrift & brøyting", "Egenkultiverte trær"]
      };
    }

    // Sjekk fagbase
    for (const f of FAG) {
      if (f.k.some(k => t.includes(k))) {
        return {
          reply: f.a + "\n\nØnsker du at jeg setter opp et anbudsutkast eller en forespørsel for deg?",
          qr: ["Ja, start anbud", "Åpningstider", "Løsvekt fra Reddal"]
        };
      }
    }

    return {
      reply: `Vi bistår deg gjerne med alt innen planter, uterom, løsvekt og vinterdrift på Bergemoen i Grimstad (tlf ${F.tlf} / ${F.tlf2}).\n\nVil du starte en anbudsberegning, eller høre om våre 13 brøytemaskiner og plantefelt i Tovdal?`,
      qr: ["Start anbudschat", "Se åpningstider", "Ring oss"]
    };
  }

  // Remote kall til Claude via SuperGrok eller lokal llama-server
  async function remoteKall(history, mode) {
    const isLocalLlama = (activeBrain === "local_llama");
    const cfg = isLocalLlama ? C.LOCAL_LLAMA : C.CLAUDE_SUPERGROK;

    if (!cfg.endpoint) {
      // Endpoint ikke konfigurert i klient (for å unngå hemmeligheter i repo) -> fall tilbake til trygg motor
      console.info(`[AI] ${cfg.navn} endpoint ikke konfigurert i åpent repo. Kjører optimalisert lokal motor.`);
      return regelbasertMotor(history);
    }

    const ctl = new AbortController();
    const to = setTimeout(() => ctl.abort(), C.TIMEOUT_MS || 20000);

    try {
      const systemPrompt = (window.AI_PROMPTS || {})[mode] || window.AI_PROMPTS.anbud;

      let bodyPayload;
      if (isLocalLlama) {
        // OpenAI-kompatibelt format for llama-server
        bodyPayload = {
          model: cfg.model || "qwen3.5-9b",
          messages: [
            { role: "system", content: systemPrompt },
            ...history
          ],
          max_tokens: 500,
          temperature: 0.6
        };
      } else {
        // Claude via SuperGrok proxy-format
        bodyPayload = {
          provider: "supergrok",
          model: cfg.model || "claude-3-5-sonnet",
          system: systemPrompt,
          messages: history
        };
      }

      const res = await fetch(cfg.endpoint, {
        method: "POST",
        signal: ctl.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload)
      });
      clearTimeout(to);

      if (!res.ok) throw new Error("HTTP " + res.status);
      const json = await res.json();

      let replyText = "";
      if (json.choices && json.choices[0] && json.choices[0].message) {
        const msg = json.choices[0].message;
        replyText = msg.content || msg.reasoning_content || "";
      } else if (json.reply) {
        replyText = json.reply;
      } else {
        replyText = JSON.stringify(json);
      }

      return {
        reply: replyText,
        qr: ["Start anbudsforespørsel", "Løsvekt fra Reddal Sand", "Ring 37 04 31 02"]
      };
    } catch (err) {
      clearTimeout(to);
      console.warn("[AI] Ekstern inferens feilet, bruker lokal anbudsmotor:", err.message);
      return regelbasertMotor(history);
    }
  }

  window.AI = {
    getBrain: () => activeBrain,
    setBrain: (brainId) => {
      activeBrain = brainId;
      console.info("[AI] Aktiv resonneringshjerne endret til:", brainId);
    },
    mailto,
    formaterAnbudsutkast,

    async reply(history, mode = "anbud") {
      // Håndterer anbudsflyt direkte for å sikre presis datainnsamling
      if (state.flow) {
        const raw = history[history.length - 1].content;
        return fortsettAnbudsflyt(raw);
      }

      const lastContent = norm(history[history.length - 1].content);
      if (lastContent.includes("bruk claude")) {
        activeBrain = "claude_supergrok";
        return { reply: "Resonneringshjerne er nå satt til **Claude via SuperGrok** (anbefalt for anbudsberegning og ledelse). Hva gjelder forespørselen?", qr: ["Start anbudschat", "Mengdeberegning stein", "Plantedata Tovdal"] };
      }
      if (lastContent.includes("bruk lokal") || lastContent.includes("bruk rtx") || lastContent.includes("bruk llama")) {
        activeBrain = "local_llama";
        return { reply: "Resonneringshjerne er nå satt til **Lokal Qwen 3.5 9B** på denne PC-ens RTX 5060 Ti GPU. Hva ønsker du å beregne?", qr: ["Start anbudschat", "Løsvekt fra Reddal", "Brøyting 13 maskiner"] };
      }

      if (activeBrain === "rulebased") {
        return regelbasertMotor(history);
      }

      return await remoteKall(history, mode);
    }
  };
})();
