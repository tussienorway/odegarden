/**
 * Ødegården HoloGarden 3D (2026 Edition)
 * Procedural Isometric & Solar Ray-Tracing Landscape Architect
 * Calibrated for Grimstad Latitude 58.3°N.
 */
window.HoloGarden = (function () {
  let canvas = null;
  let ctx = null;
  const gridW = 10;
  const gridH = 8;
  const BASE_TILE_W = 54;
  const BASE_TILE_H = 27;

  // Garden state: grid cells
  // cell types: 'empty', 'stein', 'hekk', 'tre', 'bark', 'dam', 'lys'
  let grid = [];

  let currentTool = "stein";
  let sunHour = 14; // 14:00
  let isWinter = false;
  let isDragging = false;

  // Snow particle simulation state
  let snowflakes = [];
  let animFrameId = null;

  const reqAnim = (typeof window !== "undefined" && window.requestAnimationFrame)
    ? window.requestAnimationFrame.bind(window)
    : (cb => setTimeout(cb, 16));
  const cancelAnim = (typeof window !== "undefined" && window.cancelAnimationFrame)
    ? window.cancelAnimationFrame.bind(window)
    : (id => clearTimeout(id));

  function getEl(id) {
    return (typeof document !== "undefined" && typeof document.getElementById === "function")
      ? document.getElementById(id)
      : null;
  }

  function initSnowParticles() {
    const w = canvas ? canvas.width : 600;
    const h = canvas ? canvas.height : 480;
    const count = Math.min(150, Math.max(65, Math.floor(w / 6)));
    snowflakes = [];
    for (let i = 0; i < count; i++) {
      snowflakes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        radius: 0.9 + Math.random() * 2.5,
        speedY: 0.8 + Math.random() * 1.9,
        speedX: (Math.random() - 0.35) * 0.9,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.02 + Math.random() * 0.035,
        opacity: 0.35 + Math.random() * 0.6,
        twinkle: Math.random() * Math.PI * 2
      });
    }
  }

  function updateSnowParticles() {
    if (!canvas) return;
    const w = canvas.width;
    const h = canvas.height;
    for (let i = 0; i < snowflakes.length; i++) {
      const flake = snowflakes[i];
      flake.wobble += flake.wobbleSpeed;
      flake.twinkle += 0.04;
      flake.x += flake.speedX + Math.sin(flake.wobble) * 0.55;
      flake.y += flake.speedY;

      // When snowflake falls below bottom, re-spawn at top
      if (flake.y > h + 10) {
        flake.y = -10;
        flake.x = Math.random() * w;
      }
      if (flake.x < -10) {
        flake.x = w + 8;
      } else if (flake.x > w + 10) {
        flake.x = -8;
      }
    }
  }

  function drawSnowParticles() {
    if (!ctx || !canvas) return;
    ctx.save();
    for (let i = 0; i < snowflakes.length; i++) {
      const flake = snowflakes[i];
      const alpha = Math.min(1, Math.max(0.2, flake.opacity + Math.sin(flake.twinkle) * 0.15));
      ctx.beginPath();
      ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(240, 248, 255, ${alpha})`;
      if (flake.radius > 2.0) {
        ctx.shadowColor = "rgba(200, 235, 255, 0.75)";
        ctx.shadowBlur = 5;
      } else {
        ctx.shadowBlur = 0;
      }
      ctx.fill();
    }
    ctx.restore();
  }

  function snowAnimationLoop() {
    if (!isWinter) {
      animFrameId = null;
      return;
    }
    updateSnowParticles();
    render();
    animFrameId = reqAnim(snowAnimationLoop);
  }

  function startSnowAnimation() {
    if (snowflakes.length === 0) {
      initSnowParticles();
    }
    if (!animFrameId) {
      animFrameId = reqAnim(snowAnimationLoop);
    }
  }

  function stopSnowAnimation() {
    if (animFrameId) {
      cancelAnim(animFrameId);
      animFrameId = null;
    }
  }

  function setWinter(active) {
    isWinter = !!active;

    const snowBtn = getEl("holo-btn-snow");
    if (snowBtn) {
      snowBtn.classList.toggle("active", isWinter);
      snowBtn.setAttribute("aria-pressed", isWinter ? "true" : "false");
      const lbl = getEl("holo-snow-label");
      if (lbl) {
        lbl.textContent = isWinter ? "Snøfall (Aktivt)" : "Snøsimulering";
      }
    }

    const winterChk = getEl("holo-winter-chk");
    if (winterChk) {
      winterChk.checked = isWinter;
    }

    if (window.ScifiHUD && typeof window.ScifiHUD.playTone === "function") {
      window.ScifiHUD.playTone(isWinter ? 350 : 700, "sine", 0.1);
    }

    updateStats();

    if (isWinter) {
      initSnowParticles();
      startSnowAnimation();
    } else {
      stopSnowAnimation();
      render();
    }
  }

  function toggleSnow() {
    setWinter(!isWinter);
    return isWinter;
  }

  function getTileDimensions() {
    const w = canvas ? canvas.width : 500;
    const scale = Math.min(1, Math.max(0.55, (w - 20) / 520));
    return {
      tileW: Math.round(BASE_TILE_W * scale),
      tileH: Math.round(BASE_TILE_H * scale),
      scale
    };
  }

  function init(containerId) {
    const el = getEl(containerId);
    if (!el) return;

    el.innerHTML = `
      <div class="holo-viewport">
        <!-- Floating HUD controls -->
        <div class="holo-overlay-controls">
          <div class="holo-tools-row">
            <button class="holo-control-btn active" data-tool="stein">🧱 Belegningsstein</button>
            <button class="holo-control-btn" data-tool="hekk">🌲 Tujahekk</button>
            <button class="holo-control-btn" data-tool="tre">🌳 Tovdal Bjørk</button>
            <button class="holo-control-btn" data-tool="bark">🍂 Reddal Bark</button>
            <button class="holo-control-btn" data-tool="dam">💧 Vannspeil</button>
            <button class="holo-control-btn" data-tool="lys">💡 Utebelysning</button>
            <button class="holo-control-btn" data-tool="erase" style="color:#ff6666">🧹 Fjern</button>
            <button class="holo-control-btn" id="holo-btn-clear">🔄 Nullstill</button>
          </div>

          <div class="holo-sun-bar">
            <label for="holo-sun-slider">☀️ Solbane (58.3°N Grimstad):</label>
            <input type="range" id="holo-sun-slider" min="6" max="22" step="0.5" value="14">
            <span id="holo-sun-label">14:00</span>
            <button class="holo-control-btn holo-snow-toggle" id="holo-btn-snow" type="button" aria-pressed="false" title="Aktiver eller deaktiver snøfall og vinterforhold">
              <span id="holo-snow-icon">❄️</span> <span id="holo-snow-label">Snøsimulering</span>
            </button>
            <input type="checkbox" id="holo-winter-chk" style="display:none" aria-hidden="true">
          </div>
        </div>

        <canvas id="holo-canvas" style="width:100%;height:100%;display:block;cursor:crosshair;touch-action:none"></canvas>

        <!-- Dynamic BOM & Telemetry Stats HUD -->
        <div class="holo-hud-stats">
          <div style="font-weight:700;color:var(--neon-green);margin-bottom:4px">📐 HOLO-BOM SANNTIDSKALKYLE:</div>
          <div id="holo-stat-area">Areal belegningsstein: <strong>0 m²</strong></div>
          <div id="holo-stat-pukk">Bærelag Reddal Pukk: <strong>0 m³</strong></div>
          <div id="holo-stat-planter">Planter (hekk/trær): <strong>0 stk</strong></div>
          <div id="holo-stat-co2">Årlig CO2-fangst: <strong>0 kg</strong></div>
          <div id="holo-stat-pris" style="color:var(--neon-amber);margin-top:4px">Est. anleggsverdi: <strong>kr 0,-</strong></div>
          <button class="btn alt" id="holo-btn-to-anbud" type="button" style="margin-top:8px;padding:6px 12px;font-size:0.8rem;width:100%">
            Overfør mål til AI-anbud
          </button>
        </div>
      </div>
    `;

    canvas = getEl("holo-canvas");
    if (canvas && typeof canvas.getContext === "function") {
      ctx = canvas.getContext("2d");
    }

    resetGrid();
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    setupEventListeners();
    render();
  }

  function resizeCanvas() {
    if (!canvas) return;
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
    if (isWinter) {
      initSnowParticles();
    }
    render();
  }

  function resetGrid() {
    grid = [];
    for (let y = 0; y < gridH; y++) {
      const row = [];
      for (let x = 0; x < gridW; x++) {
        // Default stylish initial layout
        if (x >= 2 && x <= 6 && y >= 2 && y <= 5) row.push("stein");
        else if (y === 0 && x >= 1 && x <= 8) row.push("hekk");
        else if (x === 8 && y === 4) row.push("tre");
        else if (x === 1 && y === 4) row.push("bark");
        else row.push("empty");
      }
      grid.push(row);
    }
    updateStats();
  }

  function setupEventListeners() {
    // Tool buttons
    document.querySelectorAll(".holo-control-btn[data-tool]").forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll(".holo-control-btn[data-tool]").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentTool = btn.dataset.tool;
        if (window.ScifiHUD) ScifiHUD.playTone(600, "sine", 0.04);
      };
    });

    const clearBtn = getEl("holo-btn-clear");
    if (clearBtn) {
      clearBtn.onclick = () => {
        resetGrid();
        render();
      };
    }

    const sunSlider = getEl("holo-sun-slider");
    const sunLabel = getEl("holo-sun-label");
    if (sunSlider) {
      sunSlider.oninput = (e) => {
        sunHour = parseFloat(e.target.value);
        const h = Math.floor(sunHour);
        const m = (sunHour % 1) === 0.5 ? "30" : "00";
        if (sunLabel) sunLabel.textContent = `${h}:${m}`;
        render();
      };
    }

    const snowBtn = getEl("holo-btn-snow");
    if (snowBtn) {
      snowBtn.onclick = (e) => {
        e.preventDefault();
        setWinter(!isWinter);
      };
    }

    const winterChk = getEl("holo-winter-chk");
    if (winterChk) {
      winterChk.onchange = (e) => {
        setWinter(winterChk.checked);
      };
    }

    const toAnbudBtn = getEl("holo-btn-to-anbud");
    if (toAnbudBtn) {
      toAnbudBtn.onclick = sendHoloToAnbud;
    }

    // Canvas click & drag interaction (Mouse)
    canvas.addEventListener("mousedown", handleCanvasInteract);
    canvas.addEventListener("mousemove", (e) => {
      if (isDragging) handleCanvasInteract(e);
    });
    window.addEventListener("mouseup", () => { isDragging = false; });

    // Touch support for mobile devices and tablets
    function getTouchCoords(e) {
      const touch = e.touches[0] || (e.changedTouches && e.changedTouches[0]);
      if (!touch) return null;
      return { clientX: touch.clientX, clientY: touch.clientY };
    }

    canvas.addEventListener("touchstart", (e) => {
      const pos = getTouchCoords(e);
      if (pos) {
        e.preventDefault();
        handleCanvasInteract(pos);
      }
    }, { passive: false });

    canvas.addEventListener("touchmove", (e) => {
      const pos = getTouchCoords(e);
      if (pos && isDragging) {
        e.preventDefault();
        handleCanvasInteract(pos);
      }
    }, { passive: false });

    window.addEventListener("touchend", () => { isDragging = false; });
  }

  function handleCanvasInteract(e) {
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const { tileW, tileH } = getTileDimensions();
    const originX = canvas.width / 2;
    const originY = Math.max(70, canvas.height * 0.28);

    // Convert screen coordinates to isometric grid (x, y)
    const dx = mouseX - originX;
    const dy = mouseY - originY;

    const hw = tileW / 2;
    const hh = tileH / 2;

    const isoX = Math.floor((dx / hw + dy / hh) / 2);
    const isoY = Math.floor((dy / hh - dx / hw) / 2);

    if (isoX >= 0 && isoX < gridW && isoY >= 0 && isoY < gridH) {
      grid[isoY][isoX] = currentTool === "erase" ? "empty" : currentTool;
      isDragging = true;
      if (window.ScifiHUD) ScifiHUD.playTone(currentTool === "erase" ? 300 : 750, "triangle", 0.03);
      updateStats();
      render();
    }
  }

  function updateStats() {
    if (!grid || grid.length < gridH) return;
    let steinCount = 0;
    let hekkCount = 0;
    let treCount = 0;
    let barkCount = 0;
    let damCount = 0;

    for (let y = 0; y < gridH; y++) {
      for (let x = 0; x < gridW; x++) {
        const t = grid[y][x];
        if (t === "stein") steinCount++;
        else if (t === "hekk") hekkCount++;
        else if (t === "tre") treCount++;
        else if (t === "bark") barkCount++;
        else if (t === "dam") damCount++;
      }
    }

    // Each tile = 2 m² (1.4m x 1.4m)
    const areaM2 = steinCount * 2;
    const pukkM3 = (areaM2 * 0.18).toFixed(1);
    const planterTotalt = hekkCount * 3 + treCount;
    const co2Kg = planterTotalt * 22; // ~22kg CO2 per tree/hedge plant per year

    // Rough pricing estimate for instant commercial feedback
    const estPris = Math.round(areaM2 * 1150 + planterTotalt * 420 + barkCount * 650 + damCount * 4500);

    const aEl = getEl("holo-stat-area");
    if (aEl) aEl.innerHTML = `Areal belegningsstein: <strong>${areaM2} m²</strong> (${steinCount} moduler)`;

    const pEl = getEl("holo-stat-pukk");
    if (pEl) pEl.innerHTML = `Bærelag Reddal Pukk: <strong>${pukkM3} m³</strong> (0–32 mm)`;

    const plEl = getEl("holo-stat-planter");
    if (plEl) plEl.innerHTML = `Planter: <strong>${planterTotalt} stk</strong> (${hekkCount * 3} hekk, ${treCount} trær)`;

    const coEl = getEl("holo-stat-co2");
    if (coEl) coEl.innerHTML = `Årlig CO2-fangst: <strong>${co2Kg} kg</strong> (Bio-balanse)`;

    const prEl = getEl("holo-stat-pris");
    if (prEl) {
      if (isWinter) {
        const snoeM3 = Math.round(areaM2 * 0.35);
        prEl.innerHTML = `❄️ Snøfall kalkyle: <strong>ca. ${snoeM3} m³ snø</strong> (Tildelt traktor kl. 05:00)`;
      } else {
        prEl.innerHTML = `Est. anleggsverdi: <strong>kr ${estPris.toLocaleString("no-NO")},-</strong>`;
      }
    }
  }

  function render() {
    if (!ctx || !canvas || !grid || grid.length < gridH) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const { tileW, tileH, scale } = getTileDimensions();
    const originX = canvas.width / 2;
    const originY = Math.max(70, canvas.height * 0.28);

    // Draw ambient holographic grid background
    drawHoloGridBackground(originX, originY, tileW, tileH);

    // Calculate solar shadow vector for Grimstad (58.3°N)
    // sunHour from 6 to 22. Noon is 12.
    const sunAngle = ((sunHour - 12) / 8) * (Math.PI / 3);
    const shadowLen = Math.max(10, Math.abs(sunHour - 13) * 12) * scale;
    const shadowDx = Math.sin(sunAngle) * shadowLen;
    const shadowDy = Math.cos(sunAngle) * (shadowLen * 0.4);

    // Draw grid tiles back-to-front
    for (let y = 0; y < gridH; y++) {
      for (let x = 0; x < gridW; x++) {
        const type = grid[y][x];
        const screenX = originX + (x - y) * (tileW / 2);
        const screenY = originY + (x + y) * (tileH / 2);

        drawTileBase(screenX, screenY, type, tileW, tileH);

        // Draw Shadows
        if (type === "tre" || type === "hekk" || type === "lys") {
          drawObjectShadow(screenX, screenY, type, shadowDx, shadowDy, tileH, scale);
        }

        // Draw 3D structures on top
        if (type !== "empty") {
          drawTileObject(screenX, screenY, type, tileH, scale);
        }
      }
    }

    // Draw active falling snow particles
    if (isWinter) {
      drawSnowParticles();
    }
  }

  function drawHoloGridBackground(ox, oy, tileW, tileH) {
    ctx.strokeStyle = isWinter ? "rgba(140, 210, 255, 0.15)" : "rgba(0, 255, 136, 0.12)";
    ctx.lineWidth = 1;

    for (let y = 0; y <= gridH; y++) {
      const x1 = ox + (0 - y) * (tileW / 2);
      const y1 = oy + (0 + y) * (tileH / 2);
      const x2 = ox + (gridW - y) * (tileW / 2);
      const y2 = oy + (gridW + y) * (tileH / 2);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    for (let x = 0; x <= gridW; x++) {
      const x1 = ox + (x - 0) * (tileW / 2);
      const y1 = oy + (x + 0) * (tileH / 2);
      const x2 = ox + (x - gridH) * (tileW / 2);
      const y2 = oy + (x + gridH) * (tileH / 2);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  }

  function drawTileBase(x, y, type, tileW, tileH) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + tileW / 2, y + tileH / 2);
    ctx.lineTo(x, y + tileH);
    ctx.lineTo(x - tileW / 2, y + tileH / 2);
    ctx.closePath();

    if (isWinter) {
      switch (type) {
        case "stein": ctx.fillStyle = "#a8b5bd"; break; // Dusted stone pavers
        case "bark": ctx.fillStyle = "#5c493c"; break;  // Winter bark mulch
        case "dam": ctx.fillStyle = "#163a47"; break;   // Frozen ice surface
        default: ctx.fillStyle = "#dcebf0"; break;      // Fresh snow layer
      }
    } else {
      switch (type) {
        case "stein": ctx.fillStyle = "#5a665f"; break;
        case "bark": ctx.fillStyle = "#4a2e1b"; break;
        case "dam": ctx.fillStyle = "#1b536b"; break;
        default: ctx.fillStyle = "#163321"; break;
      }
    }
    ctx.fill();

    ctx.strokeStyle = isWinter ? "rgba(140, 210, 240, 0.35)" : "rgba(0, 255, 136, 0.22)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }

  function drawObjectShadow(x, y, type, dx, dy, tileH, scale) {
    ctx.save();
    ctx.beginPath();
    const cx = x;
    const cy = y + tileH / 2;
    const r = (type === "tre" ? 22 : 13) * scale;
    ctx.ellipse(cx + dx, cy + dy, r, r * 0.4, 0, 0, Math.PI * 2);
    ctx.fillStyle = isWinter ? "rgba(10, 25, 35, 0.35)" : "rgba(0, 0, 0, 0.4)";
    ctx.fill();
    ctx.restore();
  }

  function drawTileObject(x, y, type, tileH, scale) {
    const cx = x;
    const cy = y + tileH / 2;

    ctx.save();
    if (type === "tre") {
      // Trunk
      ctx.fillStyle = isWinter ? "#423028" : "#5c4033";
      ctx.fillRect(cx - 3 * scale, cy - 35 * scale, 6 * scale, 35 * scale);

      // Foliage crown
      ctx.beginPath();
      ctx.arc(cx, cy - 45 * scale, 20 * scale, 0, Math.PI * 2);
      ctx.fillStyle = isWinter ? "#cbd7d9" : "#2d8a4e";
      ctx.fill();
      ctx.strokeStyle = isWinter ? "rgba(220,245,255,0.6)" : "rgba(0,255,136,0.3)";
      ctx.stroke();

      // Winter snow cap on tree crown
      if (isWinter) {
        ctx.beginPath();
        ctx.arc(cx, cy - 49 * scale, 13 * scale, Math.PI * 0.9, Math.PI * 2.1);
        ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
        ctx.fill();
      }
    } else if (type === "hekk") {
      // Conifer hedge cone
      ctx.beginPath();
      ctx.moveTo(cx, cy - 30 * scale);
      ctx.lineTo(cx + 13 * scale, cy);
      ctx.lineTo(cx - 13 * scale, cy);
      ctx.closePath();
      ctx.fillStyle = isWinter ? "#6d8577" : "#1f6e37";
      ctx.fill();
      ctx.strokeStyle = isWinter ? "rgba(220,245,255,0.5)" : "rgba(0,255,136,0.3)";
      ctx.stroke();

      // Winter snow dusting on hedge top
      if (isWinter) {
        ctx.beginPath();
        ctx.moveTo(cx, cy - 30 * scale);
        ctx.lineTo(cx + 6 * scale, cy - 16 * scale);
        ctx.lineTo(cx - 6 * scale, cy - 16 * scale);
        ctx.closePath();
        ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
        ctx.fill();
      }
    } else if (type === "stein") {
      // Paving texture lines
      ctx.strokeStyle = isWinter ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.15)";
      ctx.strokeRect(cx - 7 * scale, cy - 3.5 * scale, 14 * scale, 7 * scale);
    } else if (type === "lys") {
      // Outdoor bollard light
      ctx.fillStyle = "#ffcc00";
      ctx.fillRect(cx - 2 * scale, cy - 13 * scale, 4 * scale, 13 * scale);
      ctx.beginPath();
      ctx.arc(cx, cy - 13 * scale, 4.5 * scale, 0, Math.PI * 2);
      ctx.fillStyle = "#fff5a0";
      ctx.fill();
      // Glow (warmer and wider in winter)
      ctx.beginPath();
      ctx.arc(cx, cy - 13 * scale, (isWinter ? 19 : 14) * scale, 0, Math.PI * 2);
      ctx.fillStyle = isWinter ? "rgba(255, 220, 110, 0.32)" : "rgba(255, 230, 100, 0.2)";
      ctx.fill();
    } else if (type === "dam") {
      // Water ripple or frozen ice ring
      ctx.beginPath();
      ctx.ellipse(cx, cy, 13 * scale, 6.5 * scale, 0, 0, Math.PI * 2);
      ctx.strokeStyle = isWinter ? "rgba(180, 240, 255, 0.7)" : "rgba(0, 229, 255, 0.5)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      if (isWinter) {
        // Frozen ice cross-reflections
        ctx.beginPath();
        ctx.moveTo(cx - 7 * scale, cy - 2 * scale);
        ctx.lineTo(cx + 7 * scale, cy + 2 * scale);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  function sendHoloToAnbud() {
    let steinCount = 0;
    let hekkCount = 0;
    let treCount = 0;

    for (let y = 0; y < gridH; y++) {
      for (let x = 0; x < gridW; x++) {
        if (grid[y][x] === "stein") steinCount++;
        else if (grid[y][x] === "hekk") hekkCount++;
        else if (grid[y][x] === "tre") treCount++;
      }
    }

    const areaM2 = steinCount * 2;
    const planter = hekkCount * 3 + treCount;

    const query = `Jeg har tegnet hagen i HoloGarden 3D: ${areaM2} m² belegningsstein og ${planter} planter (${hekkCount * 3} hekk, ${treCount} trær). Hva blir fastpris med grunnarbeid og Reddal pukk?`;

    if (window.openChat) {
      window.openChat();
      const inp = document.querySelector("#chat input");
      if (inp) {
        inp.value = query;
        inp.focus();
        const form = document.querySelector("#chat form");
        if (form) {
          form.dispatchEvent(new Event("submit", { cancelable: true }));
        }
      }
    }
  }

  return {
    init,
    resetGrid,
    sendHoloToAnbud,
    toggleSnow,
    setWinter,
    isWinter: () => isWinter
  };
})();
