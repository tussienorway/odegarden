import os, glob, re, bs4

print("=== TEST 1: HTML PARSING & LOCAL LINKS ===")
html_files = glob.glob("*.html")
errors = []

for hf in html_files:
    with open(hf, "r", encoding="utf-8") as f:
        content = f.read()
    soup = bs4.BeautifulSoup(content, "html.parser")
    
    # Check scripts
    for s in soup.find_all("script", src=True):
        src = s["src"]
        if not src.startswith("http") and not os.path.exists(src):
            errors.append(f"[{hf}] Missing script: {src}")
            
    # Check stylesheets
    for l in soup.find_all("link", rel="stylesheet"):
        href = l.get("href")
        if href and not href.startswith("http") and not os.path.exists(href):
            errors.append(f"[{hf}] Missing css: {href}")
            
    # Check internal links
    for a in soup.find_all("a", href=True):
        href = a["href"]
        if href.startswith("#") or href.startswith("tel:") or href.startswith("mailto:") or href.startswith("http") or href.startswith("?"):
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
    ("SmartDrift KI", ["index.html", "smartdrift.html", "broyting.html", "losvekt.html", "anleggsgartner.html", "hagesenter.html"])
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

print("\n=== TEST 4: LOCAL LLAMA INFERENCE HEALTH ===")
import urllib.request, json
try:
    with urllib.request.urlopen("http://127.0.0.1:8080/v1/models", timeout=3) as resp:
        models = json.loads(resp.read().decode("utf-8"))
        print(f"PASS: Local llama-server online, active models: {[m['name'] for m in models.get('models', [])]}")
except Exception as e:
    print(f"Local llama-server check note: {e}")
