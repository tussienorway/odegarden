(function () {
  const fab = document.createElement("button");
  fab.id = "chat-fab";
  fab.setAttribute("aria-label", "Åpne AI anbudsassistent");
  fab.innerHTML = '<svg class="i" aria-hidden="true"><use href="#i-chat"/></svg><span>AI Anbudschat</span>';

  const box = document.createElement("div");
  box.id = "chat";
  box.innerHTML = `
    <div class="hd" style="flex-direction:column;align-items:flex-start;gap:4px">
      <div style="display:flex;justify-content:space-between;width:100%;align-items:center">
        <span>
          <b>AI Anbuds- & Prosjektassistent</b>
        </span>
        <button aria-label="Lukk" style="font-size:1.6rem;padding:0 6px">×</button>
      </div>
      <div style="margin-top:2px;display:flex;align-items:center;gap:6px">
        <label for="chat-brain-select" style="font-size:0.75rem;opacity:0.9">Hjerne:</label>
        <select id="chat-brain-select" style="font-size:0.75rem;padding:2px 4px;border-radius:6px;background:#fff;color:#18241e;border:1px solid #ccc;cursor:pointer">
          <option value="claude_supergrok" selected>Claude via SuperGrok</option>
          <option value="local_llama">Lokal Qwen (RTX 5060 Ti)</option>
          <option value="rulebased">Regelbasert (Instant)</option>
        </select>
      </div>
    </div>
    <div class="chat-banner" style="background:#f0f7f2;border-bottom:1px solid #dbe8df;padding:6px 14px;font-size:0.78rem;color:#1f4d24;display:flex;justify-content:space-between;align-items:center">
      <span>📐 Mengdeberegning for stein, bark, hekk og brøyting</span>
      <span class="tag" style="background:#dff3e8;color:#145c3a">Siden 1965</span>
    </div>
    <div class="msgs"></div>
    <div class="qr"></div>
    <form style="display:flex;gap:8px;padding:10px;background:#fff;border-top:1px solid #eee">
      <input placeholder="Beskriv prosjekt eller still spørsmål…" aria-label="Melding" style="flex:1">
      <button class="btn" style="padding:10px 16px" aria-label="Send">➤</button>
    </form>
  `;

  document.body.append(fab, box);

  const msgs = box.querySelector(".msgs");
  const qr = box.querySelector(".qr");
  const inp = box.querySelector("input");
  const brainSelect = box.querySelector("#chat-brain-select");
  const hist = [];

  if (window.AI && window.AI.getBrain && brainSelect) {
    brainSelect.value = AI.getBrain();
  }

  if (brainSelect) {
    brainSelect.onchange = () => {
      AI.setBrain(brainSelect.value);
      const valgte = brainSelect.options[brainSelect.selectedIndex].text;
      if (window.toast) toast("Aktiv hjerne: " + valgte);
    };
  }

  const add = (t, who) => {
    const m = document.createElement("div");
    m.className = "m " + who;
    m.textContent = t;
    msgs.appendChild(m);
    msgs.scrollTop = msgs.scrollHeight;
    return m;
  };

  const quick = (a) => {
    qr.innerHTML = "";
    (a || []).forEach(x => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = x;
      b.onclick = () => send(x);
      qr.appendChild(b);
    });
  };

  async function send(t) {
    if (!t.trim()) return;
    add(t, "u");
    hist.push({ role: "user", content: t });
    inp.value = "";
    quick();

    const w = add("Beregner og henter svar…", "b");

    try {
      const r = (window.Anbud && (Anbud.active || Anbud.wants(t)))
        ? await Anbud.handle(t)
        : await AI.reply(hist, "anbud");
      w.textContent = r.reply;

      if (r.actions) {
        const a = document.createElement("div");
        a.style.cssText = "display:flex;gap:6px;flex-wrap:wrap;align-self:flex-start;margin-top:4px";
        r.actions.forEach(x => {
          const b = document.createElement(x.href ? "a" : "button");
          b.className = "btn";
          b.style.cssText = "padding:7px 14px;font-size:.85rem";
          b.textContent = x.label;
          if (x.href) {
            b.href = x.href;
            b.className += " mailto";
          } else {
            b.onclick = () => {
              if (navigator.clipboard) navigator.clipboard.writeText(x.copy);
              if (window.toast) toast("Kopiert til utklippstavle");
            };
          }
          a.appendChild(b);
        });
        msgs.appendChild(a);
        msgs.scrollTop = msgs.scrollHeight;
      }

      hist.push({ role: "assistant", content: r.reply });
      quick(r.qr);

      if (r.request && window.Store) {
        Store.addRequest({
          ...r.request,
          samtale: hist.map(h => (h.role === "user" ? "Kunde: " : "Assistent: ") + h.content).join("\n")
        });
      }
    } catch (err) {
      w.textContent = "Beklager, en uventet feil oppstod. Ring oss direkte på 37 04 31 02 for rask hjelp.";
    }
  }

  box.querySelector("form").onsubmit = e => {
    e.preventDefault();
    send(inp.value);
  };

  let started = false;
  const open = () => {
    box.classList.toggle("on");
    if (!started) {
      started = true;
      add(
        "Hei! 👋 Jeg er Ødegårdens AI anbuds- og prosjektassistent.\n\n" +
        "Jeg hjelper deg med:\n" +
        "• Beregning av belegningsstein, bærelag og sand (m²)\n" +
        "• Bark og kompostjord i løsvekt fra Reddal Sand (m³)\n" +
        "• Egenkultiverte trær og hekk fra Tovdal og Bergemoen\n" +
        "• Brøyteavtale og vinterdrift (13 maskiner)\n\n" +
        "Hva kan vi hjelpe deg med i dag?",
        "b"
      );
      quick(["Be om tilbud", "50 m² belegningsstein", "Bark i løsvekt", "13 brøytemaskiner"]);
    }
    if (box.classList.contains("on")) inp.focus();
  };

  fab.onclick = open;
  box.querySelector(".hd button").onclick = () => box.classList.remove("on");
  window.openChat = open;
  window.startAnbud = () => {
    if (!box.classList.contains("on")) open();
    send("Be om tilbud");
  };

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-anbud]");
    if (btn) {
      e.preventDefault();
      window.startAnbud();
    }
  });
})();
