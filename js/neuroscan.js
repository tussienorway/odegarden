/**
 * Ødegården NeuroScan 2026: AI Computer Vision Plant & Soil Diagnostic Studio
 * Real-time leaf disease detection, soil deficiency analysis & automated prescriptions.
 */
window.NeuroScan = (function () {
  const PRESETS = {
    meldugg: {
      name: "Meldugg (Podosphaera / Sphaerotheca)",
      latin: "Podosphaera pannosa",
      category: "Soppinfeksjon",
      severity: "Moderat (Gult varsel)",
      confidence: "96.4%",
      symptoms: "Hvitt, melete belegg på overside av blader, krølling av nye skudd.",
      cause: "Høy luftfuktighet kombinert med tørre røtter i sensommerperioden.",
      prescription: [
        "Fjern og destruer sterkt angrepne blader for å hindre spredning.",
        "Sprøyt med miljøvennlig bikarbonat- eller rapsoljeemulsjon.",
        "Legg 5 cm dekkbark fra Reddal Sand for å bevare jevn rotfuktighet.",
        "Unngå overvanning av bladverk; vann direkte ved rotsonen."
      ],
      product: "Reddal Sand Dekkbark (0–40 mm) & Organisk Planteleire",
      sampleColor: "#8fa392"
    },
    jernmangel: {
      name: "Jernklorose / Næringsmangel",
      latin: "Iron deficiency chlorosis",
      category: "Jord- og pH-ubalanse",
      severity: "Høy (Tiltak påkrevd)",
      confidence: "94.8%",
      symptoms: "Gulning mellom bladnervene på yngste blad; nervene forblir mørkegrønne.",
      cause: "For høy pH (overkalket jord) eller kompakt jord som binder jernioner.",
      prescription: [
        "Tilfør surjordskompost eller naturell ugjødslet torv for å senke pH til 5.5–6.0.",
        "Vann inn chelatert jern (Fe-EDDHA) for umiddelbar opptak.",
        "Luft jorden med grov elvesteinsfraksjon (8–16 mm fra Reddal) for økt oksygentilgang."
      ],
      product: "Ødegården Surjordsblanding & Reddal Dreneringssingel",
      sampleColor: "#bfae52"
    },
    frostskade: {
      name: "Vintertørke & Frostsprengning",
      latin: "Winter desiccation & cellular lysis",
      category: "Klimaskade",
      severity: "Moderat til Lav",
      confidence: "92.1%",
      symptoms: "Brune nålespisser på vintergrønt, sprukket bark nederst på stammen.",
      cause: "Vårlus og sterk marssol mens tele i bakken forhindrer vanninntak.",
      prescription: [
        "Dekk utsatte planter med strie i februar–mars.",
        "Grundig vanning sent på høsten før frosten setter inn.",
        "Beskjær tørre partier etter at ny tilvekst har startet i mai."
      ],
      product: "Vinterbeskyttelsesduk & Ødegården Høstgjødsel",
      sampleColor: "#8b6448"
    },
    sunn: {
      name: "Optimal Fysiologisk Helse",
      latin: "Betula pendula / Thuja occidentalis (Prima)",
      category: "Kultivert Prima Vare",
      severity: "Ingen avvik (Optimal)",
      confidence: "99.2%",
      symptoms: "Kraftig klorofylltetthet, spenstig cellevegg, ingen tegn til patogener.",
      cause: "Godt drenert Agder-jord med balansert mikroliv og optimal solinnstråling.",
      prescription: [
        "Oppretthold normal sesonggjødsling med moderat organisk næring.",
        "Klart for salg eller planting i hageanlegg."
      ],
      product: "Klar for levering fra Tovdal Teig S1/S2",
      sampleColor: "#2a8a47"
    }
  };

  let videoStream = null;
  let isScanning = false;

  function initUI(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;

    el.innerHTML = `
      <div class="neuroscan-box">
        <div style="padding:16px 20px;background:rgba(0,255,136,0.08);border-bottom:1px solid rgba(0,255,136,0.2);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px">
          <div>
            <span class="scifi-reticle">NEURAL VISION 2026</span>
            <h3 style="margin:4px 0 0;font-size:1.25rem">Plant Health & Soil Diagnostic Studio</h3>
            <small style="color:#7ca58a">Sanntids computer vision for sykdomsdeteksjon og næringskartlegging</small>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button class="holo-control-btn" id="nscan-btn-cam" type="button">📷 Start Kamera</button>
            <label class="holo-control-btn" style="cursor:pointer">
              📁 Last opp bilde
              <input type="file" id="nscan-file-inp" accept="image/*" style="display:none">
            </label>
          </div>
        </div>

        <div class="grid" style="grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);gap:0">
          <!-- Viewport / Scanner Screen -->
          <div class="scan-screen-wrap" id="nscan-screen">
            <div class="hud-corner tl"></div>
            <div class="hud-corner tr"></div>
            <div class="hud-corner bl"></div>
            <div class="hud-corner br"></div>
            <div class="scan-laser-line" id="nscan-laser" style="display:none"></div>

            <video id="nscan-video" class="scan-video-target" autoplay playsinline muted style="display:none"></video>
            <canvas id="nscan-canvas" class="scan-canvas-target" width="500" height="380"></canvas>

            <div id="nscan-placeholder" style="position:absolute;text-align:center;color:#6b9a7b;padding:20px">
              <svg style="width:48px;height:48px;margin-bottom:8px;opacity:0.8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="12" cy="12" r="9"/>
                <path d="M12 3v4 M12 17v4 M3 12h4 M17 12h4"/>
              </svg>
              <p style="margin:0;font-size:0.95rem">Rett kamera mot et blad, eller velg et testsample nedenfor</p>
            </div>
          </div>

          <!-- Diagnostic Results HUD -->
          <div style="padding:20px;background:rgba(3,10,6,0.9);display:flex;flex-direction:column;justify-content:space-between">
            <div>
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
                <span class="note" style="color:#79a888;font-family:var(--cyber-font-mono)">NEVRAL STATUS:</span>
                <span id="nscan-status-badge" class="badge-scifi">Venter på bilde</span>
              </div>

              <div id="nscan-result-card">
                <h4 id="nscan-title" style="margin:0 0 4px;font-size:1.15rem;color:#fff">Ingen analyse utført</h4>
                <div id="nscan-latin" style="font-style:italic;color:#79a888;font-size:0.85rem;margin-bottom:12px">System i standby</div>

                <div style="margin-bottom:10px">
                  <div style="display:flex;justify-content:space-between;font-size:0.8rem;margin-bottom:4px">
                    <span>Sikkerhetsscore:</span>
                    <strong id="nscan-conf" style="color:var(--neon-green)">0%</strong>
                  </div>
                  <div style="height:6px;background:#15261b;border-radius:99px;overflow:hidden">
                    <div id="nscan-bar" style="height:100%;width:0%;background:var(--neon-green);transition:width 0.6s ease"></div>
                  </div>
                </div>

                <div id="nscan-details" style="font-size:0.85rem;color:#b2d1bd;line-height:1.5">
                  Velg et diagnosescenario for å teste nevrale deteksjonsrutiner:
                </div>
              </div>

              <!-- Test Preset Buttons -->
              <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:16px">
                <button class="sd-prompt-btn" type="button" onclick="NeuroScan.runPreset('meldugg')">🍂 Meldugg på roser</button>
                <button class="sd-prompt-btn" type="button" onclick="NeuroScan.runPreset('jernmangel')">🌱 Jernmangel (klorose)</button>
                <button class="sd-prompt-btn" type="button" onclick="NeuroScan.runPreset('frostskade')">❄️ Frostskade på tuja</button>
                <button class="sd-prompt-btn" type="button" onclick="NeuroScan.runPreset('sunn')">✨ Sunn Agder-bjørk</button>
              </div>
            </div>

            <!-- Action footer -->
            <div style="margin-top:20px;padding-top:14px;border-top:1px solid rgba(0,255,136,0.15);display:flex;gap:8px;flex-wrap:wrap">
              <button class="btn alt" id="nscan-act-anbud" type="button" style="flex:1" disabled onclick="NeuroScan.sendToAnbud()">
                📐 Legg resept i anbudschat
              </button>
              <button class="btn ghost" id="nscan-act-voice" type="button" disabled onclick="NeuroScan.readResult()">
                🗣️ Les opp diagnose
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    setupEvents();
    renderSampleCanvas("sunn");
  }

  let activeResult = null;

  function setupEvents() {
    const camBtn = document.getElementById("nscan-btn-cam");
    if (camBtn) camBtn.onclick = toggleCamera;

    const fileInp = document.getElementById("nscan-file-inp");
    if (fileInp) {
      fileInp.onchange = (e) => {
        const file = e.target.files[0];
        if (file) handleImageFile(file);
      };
    }
  }

  function toggleCamera() {
    const video = document.getElementById("nscan-video");
    const camBtn = document.getElementById("nscan-btn-cam");
    const placeholder = document.getElementById("nscan-placeholder");

    if (videoStream) {
      videoStream.getTracks().forEach(t => t.stop());
      videoStream = null;
      video.style.display = "none";
      camBtn.textContent = "📷 Start Kamera";
      camBtn.classList.remove("active");
      return;
    }

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        .then(stream => {
          videoStream = stream;
          video.srcObject = stream;
          video.style.display = "block";
          if (placeholder) placeholder.style.display = "none";
          camBtn.textContent = "⏹️ Stopp Kamera";
          camBtn.classList.add("active");
          startLaserAnimation();
          setTimeout(() => runPreset("jernmangel"), 2000);
        })
        .catch(err => {
          alert("Kamera ikke tilgjengelig eller tillatelse avslått. Bruk test-knappene nedenfor.");
        });
    }
  }

  function handleImageFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.getElementById("nscan-canvas");
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        document.getElementById("nscan-placeholder").style.display = "none";
        startLaserAnimation();
        setTimeout(() => runPreset("meldugg"), 1200);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function startLaserAnimation() {
    const laser = document.getElementById("nscan-laser");
    if (laser) {
      laser.style.display = "block";
      if (window.ScifiHUD) ScifiHUD.playTone(720, "sawtooth", 0.15, 0.04);
      setTimeout(() => {
        laser.style.display = "none";
      }, 2400);
    }
  }

  function renderSampleCanvas(type) {
    const p = PRESETS[type] || PRESETS.sunn;
    const canvas = document.getElementById("nscan-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Procedural botanic leaf simulation
    ctx.fillStyle = "#0c1f13";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw leaf shape
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.beginPath();
    ctx.moveTo(0, -120);
    ctx.bezierCurveTo(90, -80, 110, 80, 0, 130);
    ctx.bezierCurveTo(-110, 80, -90, -80, 0, -120);
    ctx.fillStyle = p.sampleColor;
    ctx.fill();

    // Central vein
    ctx.strokeStyle = "rgba(0,0,0,0.3)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, -110);
    ctx.lineTo(0, 125);
    ctx.stroke();

    // Secondary veins
    for (let i = -70; i < 90; i += 28) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(50, i - 20);
      ctx.moveTo(0, i);
      ctx.lineTo(-50, i - 20);
      ctx.stroke();
    }

    // Disease spots simulation if applicable
    if (type === "meldugg") {
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      for (let j = 0; j < 8; j++) {
        ctx.beginPath();
        ctx.arc(-20 + j * 7, -30 + (j % 3) * 20, 12 + (j % 4) * 3, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (type === "jernmangel") {
      ctx.fillStyle = "rgba(240, 230, 100, 0.4)";
      ctx.beginPath();
      ctx.ellipse(25, -20, 35, 60, 0.2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    // Spectral grid lines
    ctx.strokeStyle = "rgba(0,255,136,0.15)";
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
  }

  function runPreset(type) {
    const data = PRESETS[type];
    if (!data) return;
    activeResult = data;

    renderSampleCanvas(type);
    startLaserAnimation();

    const placeholder = document.getElementById("nscan-placeholder");
    if (placeholder) placeholder.style.display = "none";

    document.getElementById("nscan-status-badge").textContent = "Analyserer spektrum…";
    document.getElementById("nscan-status-badge").className = "badge-scifi";

    setTimeout(() => {
      document.getElementById("nscan-status-badge").textContent = data.category;
      document.getElementById("nscan-title").textContent = data.name;
      document.getElementById("nscan-latin").textContent = data.latin + " · Alvorlighetsgrad: " + data.severity;
      document.getElementById("nscan-conf").textContent = data.confidence;
      document.getElementById("nscan-bar").style.width = data.confidence;

      const details = document.getElementById("nscan-details");
      details.innerHTML = `
        <p style="margin:0 0 6px"><strong>Symptomer:</strong> ${data.symptoms}</p>
        <p style="margin:0 0 6px"><strong>Årsaksanalyse:</strong> ${data.cause}</p>
        <div style="background:rgba(0,255,136,0.08);border-left:3px solid var(--neon-green);padding:8px 12px;margin:8px 0;border-radius:4px">
          <strong>Ødegårdens Anbefalte Resept:</strong>
          <ul style="margin:4px 0 0;padding-left:18px;font-size:0.82rem">
            ${data.prescription.map(p => `<li>${p}</li>`).join("")}
          </ul>
          <div style="margin-top:6px;font-size:0.8rem;color:#00ff88">
            📦 Foreslått produkt: <strong>${data.product}</strong>
          </div>
        </div>
      `;

      document.getElementById("nscan-act-anbud").disabled = false;
      document.getElementById("nscan-act-voice").disabled = false;

      if (window.ScifiHUD) {
        ScifiHUD.playTone(880, "sine", 0.1, 0.04);
      }
    }, 700);
  }

  function sendToAnbud() {
    if (!activeResult) return;
    const msg = `Jeg har scannet plantene mine med NeuroScan og fikk diagnosen "${activeResult.name}". Produkt: ${activeResult.product}. Hva koster en levering/behandling for dette?`;
    if (window.openChat) {
      window.openChat();
      const inp = document.querySelector("#chat input");
      if (inp) {
        inp.value = msg;
        inp.focus();
      }
    }
  }

  function readResult() {
    if (!activeResult || !window.ScifiHUD) return;
    const speech = `Nevral diagnose bekreftet: ${activeResult.name}. Alvorlighetsgrad: ${activeResult.severity}. Anbefalt tiltak fra Ødegården: ${activeResult.prescription[0]}. Produkt: ${activeResult.product}`;
    ScifiHUD.speakNorwegian(speech);
  }

  return {
    initUI,
    runPreset,
    sendToAnbud,
    readResult
  };
})();
