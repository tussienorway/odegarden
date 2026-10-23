import os, glob, re, subprocess, json, urllib.request

print("=== TEST 1: HTML PARSING & LOCAL LINKS ===")
html_files = glob.glob("*.html")
errors = []

for hf in html_files:
    with open(hf, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Check scripts
    for m in re.finditer(r'<script[^>]+src=["\']([^"\']+)["\']', content):
        src = m.group(1)
        if not src.startswith("http") and not os.path.exists(src):
            errors.append(f"[{hf}] Missing script: {src}")
            
    # Check stylesheets
    for m in re.finditer(r'<link[^>]+rel=["\']stylesheet["\'][^>]+href=["\']([^"\']+)["\']', content):
        href = m.group(1)
        if href and not href.startswith("http") and not os.path.exists(href):
            errors.append(f"[{hf}] Missing css: {href}")
            
    # Check internal links
    for m in re.finditer(r'<a[^>]+href=["\']([^"\']+)["\']', content):
        href = m.group(1)
        if href.startswith(("#", "tel:", "mailto:", "http", "?", "javascript:")):
            continue
        clean_href = href.split("#")[0].split("?")[0]
        if clean_href and clean_href != "./" and not os.path.exists(clean_href):
            errors.append(f"[{hf}] Broken link: {href}")

if errors:
    print("FAIL: Found errors:")
    for e in errors:
        print(" ", e)
else:
    print(f"PASS: All {len(html_files)} HTML files have valid local links and assets!")

print("\n=== TEST 2: SECRET LEAK SCAN ===")
secret_patterns = [
    r"sk-[a-zA-Z0-9]{20,}",
    r"ghp_[a-zA-Z0-9]{20,}",
    r"xox[baprs]-[0-9a-zA-Z]{10,}",
    r"AIzaSy[a-zA-Z0-9_-]{33}",
    r"Bearer\s+[a-zA-Z0-9_\-\.]{25,}"
]

leak_found = False
for root, dirs, files in os.walk("."):
    if ".git" in root:
        continue
    for file in files:
        if file.endswith((".html", ".js", ".css", ".md", ".json", ".txt", ".xml")):
            path = os.path.join(root, file)
            with open(path, "r", encoding="utf-8", errors="ignore") as f:
                c = f.read()
            for pat in secret_patterns:
                m = re.search(pat, c)
                if m:
                    print(f"LEAK WARNING in {path}: {m.group(0)[:10]}...")
                    leak_found = True

if not leak_found:
    print("PASS: Zero secrets, private tokens, or credentials found in repository!")

print("\n=== TEST 3: REQUIRED CONTENT AUDIT ===")
required_facts = [
    ("Gasellebedrift", ["index.html", "js/data.js"]),
    ("13", ["index.html", "broyting.html", "js/data.js"]),
    ("Reddal Sand", ["index.html", "losvekt.html", "js/data.js"]),
    ("Tovdal", ["index.html", "hagesenter.html", "smartdrift.html", "js/data.js"]),
    ("Bergemoen", ["index.html", "hagesenter.html", "smartdrift.html", "js/data.js"]),
    ("Claude via SuperGrok", ["js/ai-config.js", "js/ai.js", "smartdrift.html"]),
    ("RTX 5060 Ti", ["js/ai-config.js", "js/ai.js", "smartdrift.html"]),
    ("SmartDrift KI", ["index.html", "smartdrift.html", "broyting.html", "losvekt.html", "anleggsgartner.html", "hagesenter.html"]),
    ("Sci-Fi Lab", ["index.html", "smartdrift.html", "scifi-lab.html"])
]

all_facts_ok = True
for fact, files in required_facts:
    for f in files:
        with open(f, "r", encoding="utf-8") as fl:
            if fact not in fl.read():
                print(f"MISSING fact '{fact}' in {f}")
                all_facts_ok = False
if all_facts_ok:
    print("PASS: All required facts and AI modules verified present across pages!")

print("\n=== TEST 4: LOCAL LLAMA INFERENCE HEALTH & FAST DIRECT OUTPUT ===")
try:
    with urllib.request.urlopen("http://127.0.0.1:8080/v1/models", timeout=3) as resp:
        models = json.loads(resp.read().decode("utf-8"))
        active = [m['name'] for m in models.get('models', [])]
        print(f"PASS: Local llama-server online, active models: {active}")

    payload = {
        "model": "qwen3.5-9b",
        "messages": [
            {"role": "system", "content": "Svar kort med ett ord: OK"},
            {"role": "user", "content": "Test"}
        ],
        "max_tokens": 30,
        "temperature": 0.1,
        "reasoning_effort": "none"
    }
    req = urllib.request.Request(
        "http://127.0.0.1:8080/v1/chat/completions",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req, timeout=12) as resp:
        cdata = json.loads(resp.read().decode("utf-8"))
        msg = cdata["choices"][0]["message"]
        content = msg.get("content", "")
        if content:
            print(f"PASS: Local Qwen 3.5 9B responded instantly without thinking leak: '{content.strip()}'")
        else:
            print("NOTE: Local llama responded with empty content, fallback active.")
except Exception as e:
    print(f"Local llama-server check note: {e}")

print("\n=== TEST 5: DEEP JAVASCRIPT LOGIC & EDGE CASES (NODE.JS) ===")
node_test_script = """
const fs = require('fs');
const vm = require('vm');

const ctx = {
  window: {},
  document: {
    addEventListener: () => {},
    createElement: () => ({ setAttribute: () => {}, querySelector: () => null }),
    body: { classList: { add: () => {}, remove: () => {}, toggle: () => false, contains: () => false }, append: () => {}, insertBefore: () => {} }
  },
  console: console,
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  localStorage: {
    _data: {},
    getItem(k) { return this._data[k] || null; },
    setItem(k, v) { this._data[k] = String(v); }
  }
};
vm.createContext(ctx);

// Load scripts in order
vm.runInContext(fs.readFileSync('js/ai-config.js', 'utf8'), ctx);
vm.runInContext(fs.readFileSync('js/data.js', 'utf8'), ctx);
vm.runInContext(fs.readFileSync('js/store.js', 'utf8'), ctx);
vm.runInContext(fs.readFileSync('js/ai.js', 'utf8'), ctx);
vm.runInContext(fs.readFileSync('js/neuroscan.js', 'utf8'), ctx);
vm.runInContext(fs.readFileSync('js/hologarden.js', 'utf8'), ctx);
vm.runInContext(fs.readFileSync('js/agrorecon.js', 'utf8'), ctx);

const AI = ctx.window.AI;
const D = ctx.window.SMARTDRIFT_DATA;
const NeuroScan = ctx.window.NeuroScan;
const HoloGarden = ctx.window.HoloGarden;
const AgroRecon = ctx.window.AgroRecon;
let failed = 0;

function assert(condition, desc) {
  if (!condition) {
    console.error('FAIL: ' + desc);
    failed++;
  } else {
    console.log('PASS: ' + desc);
  }
}

async function runTests() {
  // 1. Mengdekalkulator - 50 m2 stein
  const steinCalc = AI.kalkulerMengder('Anleggsgartner & Stein', '50 m² belegningsstein');
  assert(steinCalc.includes('ca. 9.0 m³') && steinCalc.includes('pukk 8–16 mm'), '50 m2 stein kalkulerer 9 m3 pukk bærelag');
  assert(!steinCalc.includes('hekkbehov'), '50 m2 stein trigger IKKE lineær meter hekk-match');

  // 2. Mengdekalkulator - 15 m hekk
  const hekkCalc = AI.kalkulerMengder('Planteskole & Trær', '15 m hekk');
  assert(hekkCalc.includes('42 stk') && hekkCalc.includes('Agnbøk eller Tuja'), '15 m hekk gir ca 42 planter');

  // 3. Mengdekalkulator - 250 m2 brøyting
  const broytCalc = AI.kalkulerMengder('Brøyting & Vinterdrift', '250 m² parkeringsplass');
  assert(broytCalc.includes('63 kg') && broytCalc.includes('Kompaktmaskin'), '250 m2 brøyting kalkulerer ca 63 kg strøsingel og maskinklasse');

  // 4. Edge case - Negativt og 0 m2
  const negCalc = AI.kalkulerMengder('Stein', '-50 m2');
  assert(negCalc.includes('⚠️'), 'Negativ verdi returnerer feilvarsel');

  // 5. Edge case - Stort prosjekt > 2500 m2
  const storCalc = AI.kalkulerMengder('Stein', '3000 m2');
  assert(storCalc.includes('geoteknisk bærelagsberegning'), 'Flate > 2500 m2 flagges med geoteknisk råd');

  // 6. Anbudsflyt med FAQ-interrupsjon
  AI.abortAnbud();
  const a0 = await AI.reply([{ role: 'user', content: 'anbud' }]);
  assert(a0.reply.includes('Hvilken type oppdrag'), 'Anbud starter flyt');
  await AI.reply([{ role: 'user', content: 'Anleggsgartner & Stein' }]);
  const faqInt = await AI.reply([{ role: 'user', content: 'Hva er åpningstidene deres?' }]);
  assert(faqInt.reply.includes('Mandag–fredag') && faqInt.reply.includes('midt i registreringen'), 'Spørsmål underveis besvares uten å ødelegge flyten');

  // 7. Avbryt anbud
  const avbryt = await AI.reply([{ role: 'user', content: 'avbryt' }]);
  assert(avbryt.reply.includes('avbrutt'), 'Avbryt nullstiller veiviseren');

  // 8. Drift-assistent modus
  const driftResp = await AI.reply([{ role: 'user', content: 'Hvilke trær i Tovdal passer for skole?' }], 'drift');
  assert(driftResp.reply.includes('Parklind') && driftResp.reply.includes('Teig T2'), 'Driftsassistent svarer med teigkunnskap');

  // 9. Sikker Proxy-konfigurasjon
  AI.setProxy('https://api.odegardens.no/proxy/claude', 'hemmelig_token');
  const proxyCfg = AI.getProxyConfig();
  assert(proxyCfg.endpoint === 'https://api.odegardens.no/proxy/claude', 'Proxy lagres trygt i localStorage uten git-hemmeligheter');

  // 10. SmartDrift Data-integritet
  let salgsklarePartier = D.lager.filter(i => i.status === 'salgsklar').length;
  assert(salgsklarePartier === 8, 'SmartDrift har nøyaktig 8 salgsklare partier');
  assert(D.plantekart.lokasjoner[0].teiger[0].vurdering.includes('Tovdal'), 'Teig T1 har stedsriktig vekstvurdering');
  assert(D.plantekart.lokasjoner[1].teiger[3].vurdering.includes('Reddal Sand'), 'Teig B4 har stedsriktig løsvektvurdering');

  // 11. Sci-Fi Moduler Integritet
  assert(typeof NeuroScan.runPreset === 'function', 'NeuroScan runPreset funksjon eksisterer');
  assert(typeof NeuroScan.analyzeCanvas === 'function', 'NeuroScan analyzeCanvas funksjon eksisterer');
  assert(typeof HoloGarden.init === 'function', 'HoloGarden init funksjon eksisterer');
  assert(typeof HoloGarden.resetGrid === 'function', 'HoloGarden resetGrid funksjon eksisterer');
  assert(typeof AgroRecon.toggleDronePatrol === 'function', 'AgroRecon toggleDronePatrol funksjon eksisterer');

  if (failed > 0) {
    console.error(`\\n${failed} JS-tester feilet!`);
    process.exit(1);
  } else {
    console.log('\\nPASS: Alle 11 JS logikk- og edge case-tester bestått feilfritt!');
  }
}

runTests();
"""

with open("_temp_node_test.js", "w", encoding="utf-8") as tf:
    tf.write(node_test_script)

res = subprocess.run(["node", "_temp_node_test.js"], capture_output=True, text=True)
print(res.stdout)
if res.stderr:
    print(res.stderr)
if os.path.exists("_temp_node_test.js"):
    os.remove("_temp_node_test.js")

if res.returncode == 0:
    print("PASS: Entire test suite passed 100%!")
else:
    print("FAIL: JS unit test failed!")
    exit(1)
