/**
 * Ødegården Cyber-Botanic HUD & Audio Synthesizer (2026)
 * Real-time agro-telemetry, procedural audio feedback & voice synthesizer.
 */
(function () {
  const STORAGE_KEY = "odegarden_hud_theme";
  const AUDIO_KEY = "odegarden_hud_audio";

  // Web Audio Context for zero-asset sci-fi sound effects
  let audioCtx = null;
  function getAudioCtx() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function isAudioEnabled() {
    return localStorage.getItem(AUDIO_KEY) !== "muted";
  }

  function toggleAudio() {
    const current = isAudioEnabled();
    localStorage.setItem(AUDIO_KEY, current ? "muted" : "enabled");
    updateAudioBtn();
    if (!current) playTone(880, "sine", 0.08);
  }

  function playTone(freq, type = "sine", duration = 0.08, vol = 0.05) {
    if (!isAudioEnabled()) return;
    try {
      const ctx = getAudioCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Audio autoplay policy fallback
    }
  }

  // Voice Synthesizer in Norwegian
  function speakNorwegian(text) {
    if (!isAudioEnabled()) return;
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#_`]/g, "").replace(/https?:\/\/\S+/g, "");
    const utter = new SpeechSynthesisUtterance(cleanText);
    utter.lang = "nb-NO";
    utter.rate = 1.05;
    utter.pitch = 1.0;

    // Pick a Norwegian voice if available
    const voices = window.speechSynthesis.getVoices();
    const nbVoice = voices.find(v => v.lang.startsWith("nb") || v.lang.startsWith("no"));
    if (nbVoice) utter.voice = nbVoice;

    window.speechSynthesis.speak(utter);
  }

  // Telemetry sensor simulation (Bergemoen & Tovdal)
  function initTelemetryBar() {
    if (document.querySelector(".telemetry-bar")) return;
    const bar = document.createElement("div");
    bar.className = "telemetry-bar";
    bar.innerHTML = `
      <div class="wrap telemetry-inner">
        <div class="telemetry-item">
          <span class="pulse-dot"></span>
          <span><strong>ØDEGÅRDEN AGRO-NET:</strong> LIVE TELEMETRI</span>
        </div>
        <div class="telemetry-item" id="tel-tovdal">
          <span>🌿 Tovdal Teig S1: <strong>68% fukt · pH 6.4 · 12°C</strong></span>
        </div>
        <div class="telemetry-item" id="tel-bergemoen">
          <span>📍 Bergemoen: <strong>14.2°C · 0.2 m/s NV · Reddal Sand klar</strong></span>
        </div>
        <div class="telemetry-item" id="tel-rtx">
          <span>⚡ <strong>RTX 5060 Ti Neural Hub:</strong> AKTIV</span>
        </div>
        <div class="telemetry-item" style="gap:10px">
          <button class="hud-toggle-btn" id="audio-toggle-btn" type="button" title="Slå av/på lydeffekter">
            <span id="audio-icon">🔊 Lyd</span>
          </button>
          <button class="hud-toggle-btn" id="theme-toggle-btn" type="button" title="Bytt mellom naturlig og Cyber-Botanic visning">
            <span id="theme-btn-label">⚡ Cyber HUD</span>
          </button>
        </div>
      </div>
    `;

    document.body.insertBefore(bar, document.body.firstChild);

    // Dynamic telemetry fluctuations
    setInterval(() => {
      const tovdal = document.getElementById("tel-tovdal");
      const bergemoen = document.getElementById("tel-bergemoen");
      if (tovdal) {
        const moist = (67 + Math.random() * 3).toFixed(1);
        const ph = (6.3 + Math.random() * 0.2).toFixed(1);
        tovdal.innerHTML = `<span>🌿 Tovdal Teig S1: <strong>${moist}% fukt · pH ${ph} · 12.1°C</strong></span>`;
      }
      if (bergemoen) {
        const temp = (13.8 + Math.random() * 0.8).toFixed(1);
        bergemoen.innerHTML = `<span>📍 Bergemoen: <strong>${temp}°C · 0.4 m/s NV · 13 maskiner i beredskap</strong></span>`;
      }
    }, 4500);

    const themeBtn = document.getElementById("theme-toggle-btn");
    if (themeBtn) {
      themeBtn.onclick = () => {
        toggleTheme();
        playTone(660, "sine", 0.05);
      };
    }

    const audioBtn = document.getElementById("audio-toggle-btn");
    if (audioBtn) {
      audioBtn.onclick = () => toggleAudio();
    }

    updateThemeBtn();
    updateAudioBtn();
  }

  function updateAudioBtn() {
    const icon = document.getElementById("audio-icon");
    if (icon) {
      icon.textContent = isAudioEnabled() ? "🔊 Lyd: PÅ" : "🔇 Lyd: AV";
    }
  }

  function updateThemeBtn() {
    const isCyber = document.body.classList.contains("cyber-hud");
    const label = document.getElementById("theme-btn-label");
    if (label) {
      label.textContent = isCyber ? "🌿 Klassisk Grønn" : "⚡ Cyber HUD 2026";
    }
  }

  function toggleTheme() {
    const isCyber = document.body.classList.toggle("cyber-hud");
    localStorage.setItem(STORAGE_KEY, isCyber ? "cyber" : "classic");
    updateThemeBtn();
  }

  // Auto-apply saved theme
  const savedTheme = localStorage.getItem(STORAGE_KEY);
  if (savedTheme === "cyber" || window.location.pathname.includes("scifi-lab")) {
    document.body.classList.add("cyber-hud");
  }

  // Tactile audio click feedback on buttons
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("button, .btn, .sd-tab-btn, a.card");
    if (btn && isAudioEnabled()) {
      playTone(520, "triangle", 0.04, 0.02);
    }
  });

  // Inject navigation link to Sci-Fi Lab if not present
  function injectScifiNav() {
    const meny = document.getElementById("meny");
    if (meny && !meny.querySelector('a[href="scifi-lab.html"]')) {
      const li = document.createElement("li");
      li.innerHTML = '<a href="scifi-lab.html" style="color:#00ff88;font-weight:800;letter-spacing:0.02em">🔬 Sci-Fi Lab</a>';
      const kontaktLi = meny.querySelector('a[href="./#kontakt"]')?.parentElement;
      if (kontaktLi) meny.insertBefore(li, kontaktLi);
      else meny.appendChild(li);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    initTelemetryBar();
    injectScifiNav();
  });

  // Expose global HUD API
  window.ScifiHUD = {
    playTone,
    speakNorwegian,
    toggleTheme,
    toggleAudio,
    isAudioEnabled
  };
})();
