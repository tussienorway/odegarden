/* =========================================================================
 * AI-ADAPTER MED STØTTE FOR CLAUDE VIA SUPERGROK OG LOKAL LLAMA-SERVER
 * Integrerer: Anbudschat, Mengdekalkulator, SmartDrift rådgiver, Sikker Proxy
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
      sporsmal: "Hvor stort er arealet eller omfanget? (F.eks. «50 m² belegningsstein», «15 m hekk», «6 m³ bark», «250 m² parkeringsplass brøyting»)"
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

  // Parse tallstørrelser uten regex-kollisjon mellom meter og m²
  function parseMaal(raw) {
    const s = norm(raw);
    const m2Match = s.match(/(?:^|[^\w.,])(-?\d+(?:[.,]\d+)?)\s*(?:m2|kvadrat|m²|m\^2)(?:\b|(?=[^\w²³])|$)/i);
    const m3Match = s.match(/(?:^|[^\w.,])(-?\d+(?:[.,]\d+)?)\s*(?:m3|kubikk|m³|m\^3)(?:\b|(?=[^\w²³])|$)/i);
    const lmMatch = s.match(/(?:^|[^\w.,])(-?\d+(?:[.,]\d+)?)\s*(?:løpemeter|lpm|meter\b|m\b(?![²³23]))/i);

    const m2 = m2Match ? parseFloat(m2Match[1].replace(",", ".")) : null;
    const m3 = m3Match ? parseFloat(m3Match[1].replace(",", ".")) : null;
    const lm = lmMatch ? parseFloat(lmMatch[1].replace(",", ".")) : null;

    return { m2, m3, lm, raw: s };
  }

  // Hjelpefunksjon for automatisk anbudskalkulasjon med robuste grenseverdier
  function kalkulerMengder(tjeneste, maalRaw) {
    const { m2, m3, lm, raw } = parseMaal(maalRaw);
    let beregning = "";
    const tj = norm(tjeneste || "");

    // Sanity-check for ugyldige eller negative tall
    if ((m2 !== null && m2 <= 0) || (m3 !== null && m3 <= 0) || (lm !== null && lm <= 0)) {
      return "⚠️ Oppgitt mål er null eller negativt. Vennligst oppgi et positivt areal, volum eller løpemeter.";
    }

    if (tj.includes("stein") || tj.includes("anleggsgartner")) {
      if (m2) {
        if (m2 > 2500) {
          const pukk = (m2 * 0.18).toFixed(1);
          const sand = (m2 * 0.035).toFixed(1);
          beregning = `📐 Beregnet materialbehov for stort prosjekt (${m2} m² belegningsstein):\n• Bærelag (pukk 8–16 mm, 18 cm): ca. ${pukk} m³ (ca. ${(pukk * 1.5).toFixed(0)} tonn)\n• Settesand (0–4 mm, 3,5 cm): ca. ${sand} m³\n• Belegningsstein: ca. ${m2} m² + 5 % kapp\n• Logistikk: Leveres med tippbil direkte fra Reddal Sand-samarbeidet.\n⚠️ Merk: For flater over 2 500 m² kreves geoteknisk bærelagsberegning og forhåndsbefaring av Ødegårdens anleggsgartnermester.`;
        } else {
          const pukk = (m2 * 0.18).toFixed(1);
          const sand = (m2 * 0.035).toFixed(1);
          beregning = `📐 Beregnet materialbehov for ${m2} m² belegningsstein:\n• Bærelag (pukk 8–16 mm, 18 cm dybde): ca. ${pukk} m³\n• Settesand (0–4 mm, 3,5 cm): ca. ${sand} m³\n• Belegningsstein: ca. ${m2} m² + 5 % kapp\n• Leverandøranbefaling: Reddal Sand (fra eget anlegg ved innkjøringen) + Asak Herregård`;
        }
      }
    } else if (tj.includes("løsvekt") || tj.includes("masser")) {
      if (m2 && (raw.includes("bark") || raw.includes("dekk"))) {
        const vol = (m2 * 0.06).toFixed(1);
        beregning = `📐 For ${m2} m² plantebed anbefales 5–7 cm dekkbark:\n• Beregnet volum: ca. ${vol} m³ finkuttet furubark (ca. ${(vol * 0.35).toFixed(1)} tonn)\n• Levering: Henting med tilhenger (vi lesser med hjullaster) eller tippbil fra Bergemoen.`;
      } else if (m2 && (raw.includes("jord") || raw.includes("plen") || raw.includes("kompost"))) {
        const vol = (m2 * 0.15).toFixed(1);
        beregning = `📐 For ${m2} m² ferdigplen/såplen anbefales 15 cm kompostjord:\n• Beregnet volum: ca. ${vol} m³ harpet kompostjord (ca. ${(vol * 1.25).toFixed(1)} tonn)\n• Levering: Tippbil fra anlegget på Bergemoen.`;
      } else if (m3) {
        beregning = `📐 Spesifisert volum: ${m3} m³ løsvekt.\n• Vi hjelper med maskinlessing ved innkjøringen (Bergeveien 8) eller levering med kran/tippbil.\n• Betaling: Vipps og kortterminal ved anlegget.`;
      }
    } else if (tj.includes("planteskole") || tj.includes("hekk") || tj.includes("trær") || raw.includes("hekk")) {
      if (lm) {
        const planter = Math.round(lm * 2.8);
        const jord = (lm * 0.05).toFixed(1);
        beregning = `📐 Beregnet hekkbehov for ${lm} løpemeter:\n• Antall hekkplanter (2,5–3 per meter): ca. ${planter} stk\n• Jordforbedring til hekkgrøft: ca. ${jord} m³ kompostjord\n• Anbefaling: Hardfør Agnbøk eller Tuja Smaragd kultivert på Tovdal/Bergemoen (akklimatisert til norsk klima).`;
      } else if (raw.includes("tre") || raw.includes("trær")) {
        beregning = `📐 Planteskoleleveranse trær:\n• Sortiment: Egenkultiverte allétrær (Spisslønn, Parklind, Hengebjørk) herdet i Tovdal (H4–H6).\n• Leveres med klump (3x omplantet) og oppbindingsmateriell.`;
      }
    } else if (tj.includes("brøyting") || tj.includes("vinter")) {
      if (m2) {
        const strøPrRundeKg = Math.round(m2 * 0.25);
        let maskinKlasse = "";
        if (m2 < 500) {
          maskinKlasse = "Kompaktmaskin / traktor med vikeplog (skånsom for oppkjørsler og trange passasjer)";
        } else if (m2 <= 3000) {
          maskinKlasse = "Mellomstor hjullaster (Wille/Terex) med klappvinge og spredervogn";
        } else {
          maskinKlasse = "Tung hjullaster (Hanomag/John Deere/Valmet) med storfres og høyeffektiv salt-/singelspreder";
        }

        beregning = `📐 Vinterdriftsberegning for ${m2} m²:\n• Anbefalt maskinklasse: ${maskinKlasse}\n• Estimert strøsingel (2–4 mm fra Reddal Sand): ca. ${strøPrRundeKg} kg per strørunde\n• Beredskap: Inngår i ruteplan for våre 13 brøytemaskiner\n• Beredskapsvakt: Døgnkontinuerlig mekanikervakt ved snøfall.`;
      } else {
        beregning = `📐 Brøyte- og strøavtale:\n• Inkluderer registrering i ruteplan for våre 13 brøytemaskiner\n• Døgnkontinuerlig mekaniker beredskapsvakt ved kraftig snøfall\n• Strøing med singel fra Reddal Sand.`;
      }
    } else if (tj.includes("grøntanlegg") || tj.includes("drift")) {
      beregning = `📐 Helårsdriftsavtale for uteanlegg:\n• Omfatter plenvedlikehold, ugressbekjempelse, hekkeklipp i august, feiing og klargjøring for vinter\n• Fast oppfølging av utdannet anleggsgartner.`;
    }

    return beregning;
  }

  function formaterAnbudsutkast(d) {
    const activeInfo = C[activeBrain.toUpperCase()] ? C[activeBrain.toUpperCase()].navn : activeBrain;
    return `===========================================
ANBUDSFORESPØRSEL – ØDEGÅRDENS UTEMILJØ
===========================================
Tjeneste:       ${d.tjeneste || "-"}
Omfang / Mål:   ${d.maal || "-"}
Oppdragssted:   ${d.adresse || "-"}
Ønsket oppstart:${d.tidsrom || "-"}

${d.beregning ? "FAGLIG MENGDEBEREGNING (AI-kalkulert):\n" + d.beregning + "\n\n" : ""}Kunde / Firma:  ${d.navn || "-"}
Kontakt:        ${d.tlf || "-"}
Behandlende AI: ${activeInfo}
===========================================`;
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
      qr: steg.valg || ["50 m² belegningsstein", "15 m hekk", "6 m³ bark", "250 m² brøyting"]
    };
  }

  function fortsettAnbudsflyt(raw) {
    const t = norm(raw);
    const d = state.data;
    const steg = ANBUDS_STEG[state.stepIndex];

    // Mulighet for å avbryte når som helst
    if (t === "avbryt" || t === "stopp" || t === "avslutt" || t === "nullstill") {
      state.flow = false;
      state.data = {};
      state.stepIndex = 0;
      return {
        reply: "Anbudsveiviseren er avbrutt. Hva annet kan jeg hjelpe deg med? (Du kan starte en ny anbudsberegning når som helst.)",
        qr: ["Start anbudschat", "Se åpningstider", "Løsvekt fra Reddal Sand", "Ring 37 04 31 02"]
      };
    }

    // Sjekk om brukeren stilte et fag- eller åpningstidsspørsmål underveis
    for (const f of FAG) {
      if (f.k.some(k => t.includes(k))) {
        return {
          reply: `${f.a}\n\n---\n*Vi var midt i registreringen for **${d.tjeneste || "anbud"}**.* ${steg.sporsmal}\n*(Skriv «avbryt» hvis du vil avslutte anbudsveiviseren).*`,
          qr: steg.valg || ["Avbryt anbud"]
        };
      }
    }

    // Validering av kontaktinformasjon på siste steg
    if (steg.key === "tlf") {
      const rens = raw.replace(/\D/g, "");
      const erEpost = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(raw.trim());
      if (rens.length < 8 && !erEpost) {
        return { reply: "Vennligst oppgi et gyldig telefonnummer (minst 8 sifre) eller en e-postadresse, slik at prosjektlederen kan nå deg 🙂" };
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

  // Egen motor for interne drifts- og ledelsesspørsmål (SmartDrift Pane 5)
  function driftAssistentMotor(sporsmal) {
    const q = norm(sporsmal);
    const SD = window.SMARTDRIFT_DATA || {};

    if (q.includes("skole") || (q.includes("tovdal") && (q.includes("tre") || q.includes("trær")))) {
      return {
        reply: `📊 **AI Driftsanbefaling for skoleprosjekt (Felt Tovdal):**\n\nI Teig T2 har vi **85 stk Parklind (Tilia cordata)** med stammeomkrets 14–16 cm (klump 3x), salgsklare NÅ. Parklind tåler vind og salting, og er ideell som allétre i skolegårder og offentlige anlegg i Agder.\n\nI tillegg står **120 stk Spisslønn 'Royal Red'** i Teig T1 (omkrets 12–14 cm). Begge partier er rotbeskåret og herdet under innlandsklima i Tovdal for 0 % reklamasjonsrisiko.`,
        qr: ["Se plantekart Tovdal", "Beregn besparelse på trær", "Bestillingsfrister barrot"]
      };
    }

    if (q.includes("pukk") || q.includes("billigst") || q.includes("fevik") || q.includes("sand")) {
      return {
        reply: `🚛 **AI Innkjøpsanalyse for pukk/tilslag (Grimstad/Fevik):**\n\n• **Reddal Sand (Grimstad):** Enhetspris kr 340,- + transport kr 45,- = **kr 388,- per m³** (Landed Cost).\n• **Grimstad Pukkverk:** Enhetspris kr 355,- + transport kr 75,- = **kr 437,- per m³**.\n• **Franzefoss Agder:** Enhetspris kr 330,- + transport kr 140,- = **kr 477,- per m³**.\n\n**Konklusjon:** Bestill fra **Reddal Sand**. På 80 m³ sparer bedriften **kr 3 920,-** i ren transportgevinst, og bilene kan lesse direkte ved innkjøringen på Bergemoen.`,
        qr: ["Vis leverandørmatrise", "Sjekk løsvektlager", "Kalkuler gevinst"]
      };
    }

    if (q.includes("frost") || q.includes("haster") || q.includes("vinter") || q.includes("brøyt")) {
      return {
        reply: `❄️ **Kritiske sesongvarsler & Vinterberedskap:**\n\n1. **Strøsingel & veisalt:** Kritiske bestillinger må bekreftes før 1. november for å sikre leveranser til våre 13 brøytemaskiner og Mesta-kontrakten.\n2. **Barrot forhåndsbestilling (Uke 46):** Send ordre på Agnbøk og hekkplanter for å sikre 2027-kvoter før gartneriene i Europa går tomme.\n3. **Mekaniker beredskapsvakt:** Døgnkontinuerlig mekanikerteam er satt i beredskap for utrykning ved frost/snøfall.`,
        qr: ["Sjekk bestillingstidspunkt", "Status 13 maskiner", "Plantekart Tovdal"]
      };
    }

    if (q.includes("rose") || q.includes("staude") || q.includes("blomst") || q.includes("bergemoen")) {
      return {
        reply: `🌸 **Status for hagesenter & felt Bergemoen (12 dekar):**\n\n• **Teig B3 (Roser):** 220 stk Buskrose 'Peace' i C4-potter, pluss stilkroser, klaseroser og klatreroser. Beskjæres og klargjøres for vårsalg.\n• **Teig B1 (Vintergrønt):** 140 stk Buksbom (kuleform Ø40) og bambus med dryppvanning.\n• **Teig B2 (Tuja Smaragd):** 310 stk (160–180 cm klump) er forhåndsreservert til anleggsgartnerprosjekter.`,
        qr: ["Vis lager Bergemoen", "Se teigoversikt", "Bestill pluggplanter"]
      };
    }

    if (q.includes("lager") || q.includes("verdi") || q.includes("beholdning") || q.includes("inventar")) {
      const poster = SD.lager ? SD.lager.length : 10;
      return {
        reply: `📦 **Lager- og verdioversikt (SmartDrift):**\n\n• Samlet beholdning: **${poster} poster** fordelt på Tovdal og Bergemoen.\n• Salgsklare partier: **6 partier** (trær, frukt, buskroser og 355 m³ løsvekt).\n• Reservert til anbud: **1 parti** (310 stk Tuja Smaragd).\n• Estimert feltverdi: **kr 842 000,-**.\n• Løsvektanlegg: Reddal Sand 12 fraksjoner i full drift ved innkjøringen.`,
        qr: ["Gå til lagerfanen", "Vis plantekart", "Kalkuler Landed Cost"]
      };
    }

    return {
      reply: `🌲 **SmartDrift Ledelsesrådgiver:**\nJeg overvåker biologisk vekst i Tovdal (24 daa) og på Bergemoen (12 daa), samt sesongledetider og leverandøravtaler med Reddal Sand og Asak.\n\nHva ønsker du å analysere? Still spørsmål om trær, pukk, hekk, sesongbestillinger eller maskinpark.`,
      qr: ["Skoleprosjekt trær i Tovdal", "Billigste pukk til Fevik", "Kritiske bestillinger før frost"]
    };
  }

  // Lokal regelbasert assistent for kundehenvendelser
  function regelbasertMotor(history, mode) {
    const raw = history[history.length - 1].content;
    const t = norm(raw);

    if (state.flow) return fortsettAnbudsflyt(raw);

    if (mode === "drift") {
      return driftAssistentMotor(raw);
    }

    const has = (...words) => words.some(w => t.includes(w));

    if (has("anbud", "tilbud", "prosjekt", "befaring", "prisforespørsel", "bestill oppdrag", "stein", "belegning", "brøyteavtale")) {
      let valgtTj = null;
      if (has("stein", "belegning", "mur", "trapp")) valgtTj = "Anleggsgartner & Stein";
      else if (has("brøyt", "snø", "strø", "vinter")) valgtTj = "Brøyting & Vinterdrift";
      else if (has("bark", "jord", "sand", "pukk", "grus", "singel")) valgtTj = "Løsvekt & Masser";
      else if (has("hekk", "tre", "trær", "plante")) valgtTj = "Planteskole & Trær";
      return startAnbudsflyt(valgtTj);
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
          qr: ["Start anbudschat", "Åpningstider", "Løsvekt fra Reddal"]
        };
      }
    }

    return {
      reply: `Vi bistår deg gjerne med alt innen planter, uterom, løsvekt og vinterdrift på Bergemoen i Grimstad (tlf ${F.tlf} / ${F.tlf2}).\n\nVil du starte en anbudsberegning, eller høre om våre 13 brøytemaskiner og plantefelt i Tovdal?`,
      qr: ["Start anbudschat", "Se åpningstider", "Ring oss"]
    };
  }

  // Remote kall til Claude via SuperGrok eller lokal llama-server (RTX 5060 Ti)
  async function remoteKall(history, mode) {
    const isLocalLlama = (activeBrain === "local_llama");
    const cfg = isLocalLlama ? C.LOCAL_LLAMA : C.CLAUDE_SUPERGROK;

    // Sjekk om endpoint er definert
    if (!cfg.endpoint) {
      console.info(`[AI] ${cfg.navn} endpoint ikke konfigurert i åpent repo. Kjører optimalisert lokal motor.`);
      return regelbasertMotor(history, mode);
    }

    const ctl = new AbortController();
    const to = setTimeout(() => ctl.abort(), C.TIMEOUT_MS || 20000);

    try {
      const systemPrompt = (window.AI_PROMPTS || {})[mode] || window.AI_PROMPTS.anbud;

      let bodyPayload;
      let headers = { "Content-Type": "application/json" };

      if (isLocalLlama) {
        // OpenAI-kompatibelt format med reasoning_effort "none" for lynrask direkte respons
        bodyPayload = {
          model: cfg.model || "qwen3.5-9b",
          messages: [
            { role: "system", content: systemPrompt },
            ...history
          ],
          max_tokens: 600,
          temperature: 0.5,
          reasoning_effort: "none"
        };
      } else {
        // Claude via SuperGrok proxy-format
        if (cfg.apiKey) {
          headers["x-api-key"] = cfg.apiKey;
          headers["anthropic-version"] = "2023-06-01";
        }
        bodyPayload = {
          provider: "supergrok",
          model: cfg.model || "claude-3-5-sonnet",
          system: systemPrompt,
          messages: history,
          max_tokens: 1000
        };
      }

      const res = await fetch(cfg.endpoint, {
        method: "POST",
        signal: ctl.signal,
        headers: headers,
        body: JSON.stringify(bodyPayload)
      });
      clearTimeout(to);

      if (!res.ok) throw new Error("HTTP " + res.status);
      const json = await res.json();

      let replyText = "";
      if (json.choices && json.choices[0] && json.choices[0].message) {
        const msg = json.choices[0].message;
        // Prioriter ferdig generert content foran resonneringstrace
        replyText = (msg.content && msg.content.trim()) 
          ? msg.content.trim() 
          : (msg.reasoning_content ? msg.reasoning_content.trim() : "");
      } else if (json.content && Array.isArray(json.content) && json.content[0] && json.content[0].text) {
        // Anthropic Messages API format
        replyText = json.content[0].text;
      } else if (json.reply) {
        replyText = json.reply;
      } else if (typeof json === "string") {
        replyText = json;
      } else {
        replyText = JSON.stringify(json);
      }

      if (!replyText) {
        throw new Error("Tomt svar fra inferensendepunkt");
      }

      return {
        reply: replyText,
        qr: mode === "drift" 
          ? ["Skoleprosjekt trær i Tovdal", "Billigste pukk til Fevik", "Kritiske bestillinger før frost"]
          : ["Start anbudsforespørsel", "Løsvekt fra Reddal Sand", "Ring 37 04 31 02"]
      };
    } catch (err) {
      clearTimeout(to);
      console.warn("[AI] Ekstern inferens feilet eller tidsavbrutt, bruker lokal anbudsmotor:", err.message);
      return regelbasertMotor(history, mode);
    }
  }

  window.AI = {
    getBrain: () => activeBrain,
    setBrain: (brainId) => {
      activeBrain = brainId;
      if (window.Store && window.Store.set) {
        const cfg = window.Store.get("proxy_config", {});
        cfg.activeBrain = brainId;
        window.Store.set("proxy_config", cfg);
      }
      console.info("[AI] Aktiv resonneringshjerne endret til:", brainId);
    },
    setProxy: (endpoint, apiKey, model) => {
      const cfg = {
        endpoint: endpoint || "",
        apiKey: apiKey || "",
        model: model || "claude-3-5-sonnet",
        activeBrain: activeBrain
      };
      if (window.Store && window.Store.set) {
        window.Store.set("proxy_config", cfg);
      }
      if (window.AI_CONFIG && window.AI_CONFIG.CLAUDE_SUPERGROK) {
        window.AI_CONFIG.CLAUDE_SUPERGROK.endpoint = cfg.endpoint;
        window.AI_CONFIG.CLAUDE_SUPERGROK.apiKey = cfg.apiKey;
        window.AI_CONFIG.CLAUDE_SUPERGROK.model = cfg.model;
        window.AI_CONFIG.CLAUDE_SUPERGROK.status = cfg.endpoint ? "Aktiv konfigurert proxy" : "Klargjort for serverless proxy (0 kr i demo)";
      }
      return cfg;
    },
    getProxyConfig: () => {
      if (window.Store && window.Store.get) {
        return window.Store.get("proxy_config", {});
      }
      return {};
    },
    abortAnbud: () => {
      state.flow = false;
      state.data = {};
      state.stepIndex = 0;
    },
    mailto,
    formaterAnbudsutkast,
    kalkulerMengder,

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
        return { reply: "Resonneringshjerne er nå satt til **Lokal Qwen 3.5 9B** på denne PC-ens RTX 5060 Ti GPU (lynrask respons, 0 kr skykostnad). Hva ønsker du å beregne?", qr: ["Start anbudschat", "Løsvekt fra Reddal", "Brøyting 13 maskiner"] };
      }

      if (activeBrain === "rulebased") {
        return regelbasertMotor(history, mode);
      }

      return await remoteKall(history, mode);
    }
  };
})();
