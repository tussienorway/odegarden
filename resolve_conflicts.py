import re

files = ['index.html', 'anleggsgartner.html', 'broyting.html', 'hagesenter.html', 'losvekt.html', 'personvern.html']

for fn in files:
    path = 'C:/Users/auste/odegarden/' + fn
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Footer resolution: ensure both smartdrift.html and tilgjengelighet.html and samtykke are in footer
    footer_fixed = '''<div><b>Sider</b><br><a href="hagesenter.html">Hagesenter og planteskole</a><br><a href="anleggsgartner.html">Anleggsgartner</a><br><a href="broyting.html">Brøyting og drift</a><br><a href="losvekt.html">Løsvekt</a><br><a href="smartdrift.html">SmartDrift KI</a><br><a href="personvern.html">Personvern</a><br><a href="tilgjengelighet.html">Tilgjengelighetserklæring</a><br><button type="button" class="linklike" data-samtykke>Endre samtykke (informasjonskapsler)</button></div></div>'''

    content = re.sub(r'<<<<<<< HEAD\s*<div><b>Sider</b>.*?>>>>>>> origin/main', footer_fixed, content, flags=re.DOTALL)

    if fn == 'index.html':
        hero_fixed = '''<section class="hero" aria-label="Velkommen"><picture><source media="(max-width:600px)" srcset="img/ekte/forside-odegaard-mobil.webp" width="420" height="600"><img class="hero-img" src="img/ekte/forside-odegaard-croppet.webp" srcset="img/ekte/forside-odegaard-800.webp 800w, img/ekte/forside-odegaard-croppet.webp 1400w" sizes="100vw" alt="Hagesenteret på Bergemoen med planter og blomster" width="1400" height="600" fetchpriority="high"></picture>
<div class="wrap"><span class="kicker"><svg class="i" aria-hidden="true"><use href="#i-leaf"/></svg> Siden 1965 · Gasellebedrift 3 år på rad · Bergemoen & Tovdal</span><h1>Planter, uterom og vinterdrift – fra samme gård siden 1965</h1>
<p>Hagesenter med egen planteskole, anleggsgartner for hele uterommet, 12 fraksjoner løsvekt fra Reddal Sand, og brøyting med 13 maskiner.</p>'''
        content = re.sub(r'<<<<<<< HEAD\s*<section class="hero".*?>>>>>>> origin/main', hero_fixed, content, flags=re.DOTALL)

        velg_fixed = '''<a class="card tgc" href="hagesenter.html"><svg class="i" aria-hidden="true"><use href="#i-leaf"/></svg><h3>Jeg vil handle planter</h3><p>Sommerblomster, stauder, roser, frukttrær og hekk – med råd fra folk som dyrker selv.</p><span class="more">Hagesenter og planteskole ➜</span></a>
<a class="card tgc" href="anleggsgartner.html"><svg class="i" aria-hidden="true"><use href="#i-wall"/></svg><h3>Jeg vil ha hjelp med hagen</h3><p>Belegningsstein, murer, trapper, plen og beplantning tilpasset sol, jord og kalk.</p><span class="more">Anleggsgartner ➜</span></a>
<a class="card tgc" href="broyting.html"><svg class="i" aria-hidden="true"><use href="#i-snow"/></svg><h3>Bedrift eller borettslag</h3><p>Vinterdrift med 13 brøytemaskiner og mekanikervakt – fast avtale før snøen faller.</p><span class="more">Brøyting og drift ➜</span></a></div><p class="center"><button class="btn alt" type="button" data-anbud><svg class="i" aria-hidden="true"><use href="#i-chat"/></svg> Be om tilbud i chatten</button></p></div></section>'''
        content = re.sub(r'<<<<<<< HEAD\s*<a class="card tgc" href="hagesenter.html">.*?>>>>>>> origin/main', velg_fixed, content, flags=re.DOTALL)

    if fn == 'anleggsgartner.html':
        anl_fixed = '''<section class="sub"><div class="wrap grid g2 ac"><div><nav class="crumb" aria-label="Brødsmuler"><a href="./">Forside</a> › Anleggsgartner</nav><span class="kicker">Anleggsgartner & Hagedesign</span><h1>Anleggsgartner for hele uterommet</h1><p class="lead">Gárdsplassen er en viktig fellesnevner som samler familien. Vi skaper helhetlige uterom med belegningsstein, murer, trapper, ferdigplen og planter tilpasset sol, jord og kalk i Grimstad og omegn.</p><a class="btn" href="./?tj=Anleggsgartner#kontakt">Få tilbud på anleggsarbeid</a> <a class="btn ghost" href="tel:+4737043102"><svg class="i" aria-hidden="true"><use href="#i-phone"/></svg> Ring 37 04 31 02</a></div>
<img class="img-r" src="img/ekte/brukt-hjem-vure-tjenester-anleggsgartner.webp" srcset="img/ekte/brukt-hjem-vure-tjenester-anleggsgartner-560.webp 560w, img/ekte/brukt-hjem-vure-tjenester-anleggsgartner.webp 800w" sizes="(max-width:820px) 92vw, 560px" alt="Gårdsplass med belegningsstein lagt av Ødegården" width="800" height="800" fetchpriority="high"></div></section>
<section class="stone"><div class="wrap narrow prose"><h2>Fra idé til ferdig uterom</h2>
<p>Et godt uterom henger sammen: flater du kan gå og sitte på, murer og trapper som tar opp høydeforskjeller, og planter som trives der de står. Kombinasjonen av dekorative planter, trær og belegningsstein er uslåelig. Med vår erfaring og lokalkunnskap siden 1965 blir resultatet på høyt faglig nivå.</p>
<h2>Dette utfører vi</h2>
<ul class="tick">
  <li><b>Former og strukturer:</b> Buer, rette linjer, trapper og mønster i terrenget.</li>
  <li><b>Belegningsstein og heller:</b> Gårdsplass, innkjørsel, terrasse og gangveier. Vi legger bærelag med pukk fra Reddal Sand og settesand for lang levetid.</li>
  <li><b>Naturstein og skifer:</b> Støttemurer, murer av løsstein, trapper og skiferheller.</li>
  <li><b>Kantstein:</b> Ryddige avslutninger mellom plen, bed og belegg.</li>
  <li><b>Plen og ferdigplen:</b> Opparbeiding og legging.</li>
  <li><b>Beplantning tilpasset lokale forhold:</b> Solforhold, kalkmengde, jordtype og gjødselinnhold avgjør hvilke planter som trives best. Vi velger hardføre sorter fra egen produksjon i Tovdal og på Bergemoen.</li>
  <li><b>Hageanlegg, parker, idrettsanlegg og lekeplasser:</b> Helårsdrift og vedlikehold for både private og offentlige oppdragsgivere.</li>
</ul>
<h2>Slik foregår det</h2>
<ol><li>Du sender en kort beskrivelse, gjerne via vår AI-anbudschat eller skjema.</li><li>Vi tar kontakt og avtaler gratis befaring om det trengs.</li><li>Du får et skreddersydd tilbud på jobben.</li><li>Vi utfører arbeidet fagmessig og rydder etter oss.</li></ol>'''
        content = re.sub(r'<<<<<<< HEAD\s*<section class="sub".*?>>>>>>> origin/main', anl_fixed, content, flags=re.DOTALL)

    if fn == 'broyting.html':
        broyting_sub_fixed = '''<section class="sub"><div class="wrap grid g2 ac"><div><nav class="crumb" aria-label="Brødsmuler"><a href="./">Forside</a> › Brøyting og drift</nav><span class="kicker">Vinterdrift & Brøyting</span><h1>13 brøytemaskiner og mekanikervakt</h1><p class="lead">Når snøen laver ned på Sørlandet, rykker vi ut med 13 moderne brøytemaskiner og egen mekanikervakt for borettslag, bedrifter og private i Grimstad og omegn.</p><a class="btn" href="./?tj=Broyting#kontakt">Bestill brøyteavtale</a> <a class="btn ghost" href="tel:+4737043102"><svg class="i" aria-hidden="true"><use href="#i-phone"/></svg> Ring 37 04 31 02</a></div>
<img class="img-r" src="img/thumb/broyting-traktor.webp" alt="Brøytetraktor i arbeid for Ødegården" width="800" height="800" fetchpriority="high"></div></section>'''
        content = re.sub(r'<<<<<<< HEAD\s*<section class="sub".*?>>>>>>> origin/main', broyting_sub_fixed, content, flags=re.DOTALL)

    if fn == 'hagesenter.html':
        hage_sub_fixed = '''<section class="sub"><div class="wrap grid g2 ac"><div><nav class="crumb" aria-label="Brødsmuler"><a href="./">Forside</a> › Hagesenter og planteskole</nav><span class="kicker">Hagesenter & Egen Planteskole</span><h1>Lokalt dyrkede planter siden 1965</h1><p class="lead">På Bergemoen i Grimstad og i Tovdal dyrker vi hekk, trær, busker, roser og stauder som trives i vårt kystklima. Vi har også sommerblomster, jord, krukker og alt du trenger til hagen.</p><a class="btn alt" href="./#besok"><svg class="i" aria-hidden="true"><use href="#i-pin"/></svg> Besøk oss på Bergemoen</a> <a class="btn ghost" href="tel:+4737043102"><svg class="i" aria-hidden="true"><use href="#i-phone"/></svg> Ring 37 04 31 02</a></div>
<img class="img-r" src="img/ekte/hagesenter-fint-oversiktsbilde.webp" srcset="img/ekte/hagesenter-fint-oversiktsbilde-560.webp 560w, img/ekte/hagesenter-fint-oversiktsbilde.webp 800w" sizes="(max-width:820px) 92vw, 560px" alt="Oversiktsbilde av hagesenteret på Bergemoen med planter og vekster" width="800" height="800" fetchpriority="high"></div></section>'''
        content = re.sub(r'<<<<<<< HEAD\s*<section class="sub".*?>>>>>>> origin/main', hage_sub_fixed, content, flags=re.DOTALL)

    if fn == 'losvekt.html':
        los_sub_fixed = '''<section class="sub"><div class="wrap grid g2 ac"><div><nav class="crumb" aria-label="Brødsmuler"><a href="./">Forside</a> › Løsvekt</nav><span class="kicker">Løsvekt fra Reddal Sand</span><h1>12 fraksjoner: bark, jord, sand og grus</h1><p class="lead">Kjøp i henger eller få levert rett hjem. Vi forhandler høykvalitets bark, kompostert hagejord, pukk, sand og elvestein fra Reddal Sand på Bergemoen.</p><a class="btn" href="./?tj=Losvekt#kontakt">Bestill levering</a> <a class="btn ghost" href="tel:+4737043102"><svg class="i" aria-hidden="true"><use href="#i-phone"/></svg> Ring 37 04 31 02</a></div>
<img class="img-r" src="img/thumb/losvekt-bark-jord-grus.webp" alt="Hauger med bark, jord og pukk hos Ødegården" width="800" height="800" fetchpriority="high"></div></section>'''
        content = re.sub(r'<<<<<<< HEAD\s*<section class="sub".*?>>>>>>> origin/main', los_sub_fixed, content, flags=re.DOTALL)

    if fn == 'personvern.html':
        content = re.sub(r'<<<<<<< HEAD\s*<p class="lead">.*?>>>>>>> origin/main', '<p class="lead">Vi tar personvern på alvor. Ødegårdens Planteskole og Utemiljø lagrer aldri data uten gyldig formål.</p>', content, flags=re.DOTALL)

    # Check if any conflict markers remain
    if '<<<<<<<' in content:
        print(f'WARNING: conflict markers still in {fn}')
    else:
        print(f'Successfully resolved {fn}')

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
