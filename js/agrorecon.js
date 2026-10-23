/**
 * Ødegården AgroRecon 2026: Autonomous Drone & Multispectral Satellite HUD
 * Real-time NDVI, Thermal IR Soil Moisture & Drone Waypoint Flight Simulator
 * Calibrated for Tovdal and Bergemoen production sites.
 */
window.AgroRecon = (function () {
  let canvas = null;
  let ctx = null;
  let activeBand = "ndvi"; // 'rgb', 'ndvi', 'tir'
  let isDroneFlying = false;
  let droneProgress = 0; // 0 to 1
  let animId = null;

  const WAYPOINTS = [
    { x: 60, y: 80, label: "Teig T1 (Hekk)", status: "Prima vekst" },
    { x: 180, y: 70, label: "Teig T2 (Bjørk)", status: "Optimal" },
    { x: 300, y: 110, label: "Teig T3 (Lønn)", status: "Trenger kalk" },
    { x: 420, y: 140, label: "Teig T4 (Vintergrønt)", status: "Frostsikret" },
    { x: 260, y: 260, label: "Bergemoen Hub", status: "13 brøytemaskiner klar" }
  ];

  function init(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;

    el.innerHTML = `
      <div class="drone-map-wrap">
        <div style="position:absolute;top:12px;left:14px;z-index:10;display:flex;gap:8px;flex-wrap:wrap">
          <button class="holo-control-btn active" data-band="ndvi">🟢 NDVI Klorofyll-indeks</button>
          <button class="holo-control-btn" data-band="tir">🌡️ Termisk Jordfukt (TIR)</button>
          <button class="holo-control-btn" data-band="rgb">📷 Ekte Farge (RGB)</button>
          <button class="holo-control-btn" id="drone-patrol-btn" style="border-color:var(--neon-cyan);color:var(--neon-cyan)">
            🛸 Start Autonom Drone-patrulje
          </button>
        </div>

        <div class="drone-telemetry-hud" id="drone-hud">
          <div style="display:flex;align-items:center;gap:6px;font-weight:700">
            <span class="pulse-dot" style="background:var(--neon-cyan);box-shadow:0 0 8px var(--neon-cyan)"></span>
            ODE-DRONE-01 (Matrice 350 Multispectral)
          </div>
          <div style="margin-top:4px" id="drone-coords">GPS: 58.5412°N, 8.2319°E (Tovdal)</div>
          <div id="drone-alt">Høyde: 45.0m · Hastighet: 0.0 m/s</div>
          <div id="drone-status" style="color:var(--neon-green)">Status: Venter på flyordre</div>
        </div>

        <canvas id="recon-canvas" style="width:100%;height:100%;display:block"></canvas>
      </div>
    `;

    canvas = document.getElementById("recon-canvas");
    ctx = canvas.getContext("2d");

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    setupEvents();
    render();
  }

  function resizeCanvas() {
    if (!canvas) return;
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
    render();
  }

  function setupEvents() {
    document.querySelectorAll(".drone-map-wrap [data-band]").forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll(".drone-map-wrap [data-band]").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        activeBand = btn.dataset.band;
        if (window.ScifiHUD) ScifiHUD.playTone(680, "sine", 0.05);
        render();
      };
    });

    const patrolBtn = document.getElementById("drone-patrol-btn");
    if (patrolBtn) {
      patrolBtn.onclick = toggleDronePatrol;
    }
  }

  function toggleDronePatrol() {
    isDroneFlying = !isDroneFlying;
    const btn = document.getElementById("drone-patrol-btn");
    if (isDroneFlying) {
      if (btn) {
        btn.textContent = "⏹️ Avbryt Patrulje";
        btn.classList.add("active");
      }
      droneProgress = 0;
      if (window.ScifiHUD) {
        ScifiHUD.playTone(880, "sawtooth", 0.15, 0.03);
        ScifiHUD.speakNorwegian("Autonom dronerekognosering initiert over Tovdal og Bergemoen.");
      }
      loopDrone();
    } else {
      if (btn) {
        btn.textContent = "🛸 Start Autonom Drone-patrulje";
        btn.classList.remove("active");
      }
      cancelAnimationFrame(animId);
      document.getElementById("drone-status").textContent = "Status: Patrulje fullført";
      render();
    }
  }

  function loopDrone() {
    if (!isDroneFlying) return;
    droneProgress += 0.003;
    if (droneProgress >= 1) droneProgress = 0;

    updateDroneTelemetry();
    render();
    animId = requestAnimationFrame(loopDrone);
  }

  function updateDroneTelemetry() {
    const coords = document.getElementById("drone-coords");
    const alt = document.getElementById("drone-alt");
    const status = document.getElementById("drone-status");

    const lat = (58.5412 + droneProgress * 0.02).toFixed(4);
    const lon = (8.2319 + droneProgress * 0.015).toFixed(4);
    if (coords) coords.textContent = `GPS: ${lat}°N, ${lon}°E (Tovdal felt)`;
    if (alt) alt.textContent = `Høyde: ${(42 + Math.sin(droneProgress * 20) * 3).toFixed(1)}m · Hastighet: 6.4 m/s · Batteri: 82%`;
    if (status) {
      const idx = Math.floor(droneProgress * WAYPOINTS.length) % WAYPOINTS.length;
      status.textContent = `Scanning: ${WAYPOINTS[idx].label} [${WAYPOINTS[idx].status}]`;
    }
  }

  function render() {
    if (!ctx || !canvas) return;
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Draw field terrain based on spectral band
    drawMultispectralTerrain(w, h);

    // Draw Teig boundaries
    drawTeigBoundaries(w, h);

    // Draw waypoints and labels
    drawWaypoints();

    // Draw drone flight path and position
    drawDroneFlight(w, h);
  }

  function drawMultispectralTerrain(w, h) {
    // Generate organic false-color heatmap
    const grad = ctx.createRadialGradient(w * 0.4, h * 0.4, 20, w * 0.5, h * 0.5, w * 0.6);
    if (activeBand === "ndvi") {
      // Chlorophyll index: deep green to luminous neon emerald
      grad.addColorStop(0, "#00ff88");
      grad.addColorStop(0.35, "#188a42");
      grad.addColorStop(0.7, "#0f4724");
      grad.addColorStop(1, "#081f12");
    } else if (activeBand === "tir") {
      // Thermal moisture: blue (cold/wet) to amber (dry)
      grad.addColorStop(0, "#00e5ff");
      grad.addColorStop(0.4, "#246eb9");
      grad.addColorStop(0.75, "#b36200");
      grad.addColorStop(1, "#380d00");
    } else {
      // Natural RGB satellite
      grad.addColorStop(0, "#3e6340");
      grad.addColorStop(0.4, "#2b4b2e");
      grad.addColorStop(0.7, "#1d3320");
      grad.addColorStop(1, "#121f14");
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Topographic contour lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
    ctx.lineWidth = 1;
    for (let r = 40; r < w; r += 55) {
      ctx.beginPath();
      ctx.arc(w * 0.4, h * 0.4, r, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  function drawTeigBoundaries(w, h) {
    ctx.strokeStyle = "rgba(0, 229, 255, 0.4)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);

    const boxes = [
      { x: 30, y: 40, bw: 120, bh: 100, label: "Teig T1: Hekk (1500m)" },
      { x: 160, y: 30, bw: 130, bh: 110, label: "Teig T2: Tovdal Bjørk" },
      { x: 300, y: 50, bw: 140, bh: 130, label: "Teig T3: Kultivert Lønn" },
      { x: 100, y: 180, bw: 260, bh: 140, label: "Tovdal Skogsareal" }
    ];

    boxes.forEach(b => {
      ctx.strokeRect(b.x, b.y, b.bw, b.bh);
      ctx.fillStyle = "rgba(0, 229, 255, 0.85)";
      ctx.font = "11px Consolas, monospace";
      ctx.fillText(b.label, b.x + 6, b.y + 16);
    });

    ctx.setLineDash([]);
  }

  function drawWaypoints() {
    WAYPOINTS.forEach((wp, idx) => {
      ctx.beginPath();
      ctx.arc(wp.x, wp.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = "#00ff88";
      ctx.fill();

      ctx.beginPath();
      ctx.arc(wp.x, wp.y, 14, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(0, 255, 136, 0.35)";
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = "11px Consolas, monospace";
      ctx.fillText(wp.label, wp.x + 12, wp.y + 4);
    });
  }

  function drawDroneFlight(w, h) {
    if (!isDroneFlying && droneProgress === 0) return;

    // Flight path connection line
    ctx.strokeStyle = "rgba(0, 229, 255, 0.6)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    WAYPOINTS.forEach((wp, i) => {
      if (i === 0) ctx.moveTo(wp.x, wp.y);
      else ctx.lineTo(wp.x, wp.y);
    });
    ctx.closePath();
    ctx.stroke();

    // Interpolate current position along waypoints
    const totalWp = WAYPOINTS.length;
    const progressSegment = droneProgress * totalWp;
    const currIdx = Math.floor(progressSegment);
    const nextIdx = (currIdx + 1) % totalWp;
    const t = progressSegment - currIdx;

    const p1 = WAYPOINTS[currIdx];
    const p2 = WAYPOINTS[nextIdx];
    const dx = p1.x + (p2.x - p1.x) * t;
    const dy = p1.y + (p2.y - p1.y) * t;

    // Draw Drone Icon
    ctx.save();
    ctx.translate(dx, dy);

    // Scanning radar pulse
    ctx.beginPath();
    ctx.arc(0, 0, 28, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0, 229, 255, 0.15)";
    ctx.fill();
    ctx.strokeStyle = "var(--neon-cyan)";
    ctx.stroke();

    // Drone body
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(-6, -6, 12, 12);

    // Propeller arms
    ctx.strokeStyle = "#00e5ff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-14, -14); ctx.lineTo(14, 14);
    ctx.moveTo(14, -14); ctx.lineTo(-14, 14);
    ctx.stroke();

    ctx.restore();
  }

  return {
    init,
    toggleDronePatrol
  };
})();
