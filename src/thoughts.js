/* Ovio – Gedanken sammeln und daraus Antworten erkennen */
/* Schlüsselwörter je Antwort. Jedes Wort passt auch auf Verlängerungen („spring“ → springt, springen). */
const KW = {
  age: { "3–6 Jahre": "kleinkind|kita|kindergarten|vorschul|3 jahr|4 jahr|5 jahr", "6–10 Jahre": "grundschul|kinder|kids|6 jahr|7 jahr|8 jahr|9 jahr", "10–13 Jahre": "10 jahr|11 jahr|12 jahr", "13–17 Jahre": "jugendlich|teenager|teens|schüler|13 jahr|14 jahr|15 jahr|16 jahr", "Erwachsene 18+": "erwachsen", "Alle Altersgruppen": "familie|jung und alt|alle alter|jeden alters" },
  skill: { "Kaum bis keine": "noch nie gespielt|keine erfahrung|anfänger", "Gelegenheitsspieler": "zwischendurch|casual|gelegentlich", "Hardcore-Profis": "hardcore|profis|sehr schwer" },
  whereplay: { "Unterwegs": "unterwegs|im bus|in der bahn", "Beim Warten": "warten|wartezeit|restaurant|wartezimmer", "Auf der Couch": "couch|sofa", "Mit anderen im Raum": "party|zusammen im raum|gemeinsam vor" },
  platforms: { "Browser (Web)": "browser|website|webseite|im netz|online spielbar|qr", "iPhone/iPad (iOS)": "iphone|ipad|ios|app store|apple", "Android": "android|play store|google play", "PC/Mac": "computer|laptop|windows|steam|mac |macbook", "Konsole": "konsole|switch|playstation|xbox", "VR/AR": "vr|virtual reality|ar brille" },
  orientation: { "Hochformat": "hochformat|eine hand|einhändig", "Querformat": "querformat" },
  scope: { "Mini-Prototyp": "prototyp|ausprobieren|erstmal klein|test", "Kleines Spiel": "kleines spiel|paar level|wenige level", "Großes Spiel": "riesig|großes spiel|viele welten|open world|offene welt" },
  session: { "1–3 Minuten": "kurz|kurze runden|zwischendurch|paar minuten|1 minute|2 minuten|3 minuten", "Stundenlang": "stundenlang|lange spielen|stunden" },
  feeling: { "Entspannung": "entspann|chill|gemütlich|ruhig|stressfrei", "Nervenkitzel": "spannend|spannung|adrenalin|nervenkitzel|action", "Lachen & Spaß": "lustig|witzig|lachen|komisch|chaos|chaotisch", "Gänsehaut": "gruselig|grusel|angst|horror", "Stolz & Meisterschaft": "herausfordernd|schwer|meistern", "Neugier & Entdecken": "entdeck|erkund|geheimnis", "Kreativität": "kreativ|gestalten|selber bauen", "Wettkampf": "wettkampf|gegeneinander|rangliste|besser als" },
  pace: { "Gemütlich": "gemütlich|langsam|ohne stress", "Schnell": "schnell|flott|rasant", "Hektisch": "hektisch|stressig|chaos|chaotisch" },
  purpose: { "Hobby & Spaß": "hobby|aus spaß|für mich", "Für Familie oder Freunde": "für meine kinder|für meinen sohn|für meine tochter|geschenk|für freunde|für die familie", "Geld verdienen": "geld verdienen|verkaufen|einnahmen", "Bildung": "lernen|schule|unterricht|lernspiel", "Marketing für Firma/Verein": "restaurant|laden|firma|verein|kunden|werbung für|marke|gäste" },
  ideaVerb: { "Springen": "spring|hüpf|jump", "Laufen & Ausweichen": "ausweich|rennen|renn|flücht|dodge", "Schießen & Werfen": "schieß|schießen|wirf|werfen|ballern|zielen", "Kämpfen": "kämpf|kampf|schwert|schlagen|prügel", "Bauen": "bauen|baut|aufbau|errichten", "Sammeln": "sammel|einsammeln", "Fangen": "fangen|fängt|auffangen|schnappen", "Kochen & Zubereiten": "koch|backen|zubereit|pizza|burger|rezept", "Kombinieren & Verbinden": "kombinier|verbind|match|zusammenfügen", "Fahren & Steuern": "fahren|fährt|auto |autos|lenken", "Schleichen & Verstecken": "schleich|versteck|heimlich", "Sortieren & Ordnen": "sortier|ordnen|aufräumen", "Zeichnen": "zeichn|malen", "Andere anführen": "armee|truppen|befehl|anführen", "Handeln & Verkaufen": "verkauf|handel|kasse|bedienen|kunden", "Erkunden": "erkund|entdeck|reisen", "Karten ausspielen": "karten|kartenspiel", "Im Takt tippen": "rhythmus|takt|musik spiel|beat" },
  ideaGoal: { "Jemanden retten": "retten|rettet|befreien", "Entkommen": "entkomm|flucht|fliehen|ausbrechen", "Ans Ziel kommen": "ans ziel|ziel erreichen|ins ziel", "Größer & erfolgreicher werden": "wachsen|größer werden|erfolgreich|expandieren|reich werden", "Andere besiegen": "besiegen|gewinnen gegen|schlagen", "Alles einsammeln": "alles sammeln|alle sammeln|komplett", "Etwas verteidigen": "verteidig|beschützen|schützen", "Aufträge erfüllen": "bestellung|auftrag|aufträge|liefern|ausliefern|kunden bedienen", "Rätsel lösen": "rätsel|knobel|lösen", "Überleben": "überleb", "Den Highscore knacken": "highscore|punkte|rekord|so weit wie", "Etwas Eigenes erschaffen": "erschaffen|eigene welt|gestalten" },
  hero: { "Mensch": "mädchen|junge|mann|frau|koch |köchin|kellner|held|heldin|ritter|prinzessin", "Tier": "tier|hund|katze|fuchs|hase|vogel|bär|pinguin|maus|frosch|dino", "Roboter": "roboter|robo|android", "Fantasiewesen": "drache|monster|fee|elfe|einhorn|alien|geist", "Objekt / Form": "ball|würfel|kugel|blob", "Fahrzeug": "auto |autos|raumschiff|flugzeug|boot|panzer", "Selbst erstellter Avatar": "avatar|eigene figur|selbst erstellen" },
  setting: { "Fantasy": "fantasy|magie|zauber|drache|elfe", "Sci-Fi / Weltraum": "weltraum|weltall|planet|raumschiff|alien|galaxie|zukunft", "Moderne Stadt": "stadt|großstadt|straße", "Natur & Wald": "wald|natur|dschungel", "Unterwasser": "unterwasser|meer|ozean|tauchen|fische", "Mittelalter": "mittelalter|ritter|burg", "Endzeit": "apokalypse|zombie|endzeit", "Süßigkeiten & Cartoon": "süßigkeit|candy|schokolade|bonbon", "Steampunk": "steampunk", "Wilder Westen": "western|cowboy|wilder westen", "Antike": "ägypt|pyramide|römer|griechen|antike", "Küche & Restaurant": "restaurant|küche|pizzeria|imbiss|café|bäckerei|essen" },
  ideaChallenge: { "Zeitdruck": "zeitdruck|rechtzeitig|gegen die zeit|zeit läuft|countdown|schnell genug|zeitlimit", "Gegner": "gegner|monster|feinde|feind|böse", "Gefährliche Wege & Fallen": "fallen|hindernis|abgrund|stacheln", "Knappe Ressourcen": "knapp|begrenzt|ressourcen", "Knifflige Logik": "logik|nachdenken|knifflig", "Andere Spieler": "gegen andere|gegen freunde", "Immer mehr gleichzeitig": "immer mehr|gleichzeitig|chaos|stress" },
  ideaTwist: { "Schwerkraft umdrehen": "schwerkraft", "Zeit beeinflussen": "zeit zurück|zurückspulen|zeit anhalten|zeitlupe", "Zwei Figuren gleichzeitig": "zwei figuren|beide gleichzeitig|zwei spieler gleichzeitig", "Alles mit einer Taste": "eine taste|ein knopf|ein finger", "Größe ändern": "schrumpf|wachsen und|größe", "Rollentausch": "rollentausch|seiten wechseln" },
  core: { "Jump'n'Run / Plattformer": "jump|plattform|hüpfspiel|mario", "Endless Runner / Arcade": "endless|runner|subway|so weit wie möglich|endlos rennen", "Action / Nahkampf": "beat em up|hack|nahkampf", "Shooter / Ballern": "shooter|ballern|schießspiel", "Rundenstrategie": "rundenbasiert|schach", "Tower Defense / Echtzeitstrategie": "tower defense|türme|verteidigungs", "Puzzle / Knobelspiel": "puzzle|rätselspiel|knobelspiel|match 3|tetris", "Aufbau / Simulation / Management": "simulation|aufbauspiel|management|tycoon|manager|eigenes restaurant|eigenen laden", "Rollenspiel (RPG)": "rollenspiel|rpg|pokémon|pokemon", "Roguelike / Roguelite": "roguelike|roguelite", "Rennspiel": "rennspiel|rennen fahren|mario kart|rennstrecke", "Sandbox / Crafting": "sandbox|minecraft|crafting", "Abenteuer / Story-Spiel": "abenteuer|adventure", "Rhythmus / Musik": "rhythmus|guitar hero", "Idle / Clicker": "idle|clicker|klicker", "Party / Minispiel-Sammlung": "minispiel|party", "Sportspiel": "fußball|basketball|tennis|golf|sportspiel", "Karten / Deckbuilder": "kartenspiel|deck|sammelkarten", "Survival": "survival|überlebensspiel", "Horror / Grusel": "horror|gruselspiel" },
  structure: { "Einzelne Level mit Levelkarte": "level|levels", "Offene Welt": "offene welt|open world", "Endloser Lauf": "endlos|unendlich" },
  mp: { "Nur Einzelspieler": "alleine|allein|einzelspieler|singleplayer", "Lokal am selben Bildschirm": "zu zweit an einem|gleichen bildschirm|couch koop", "Online": "online|multiplayer|mit freunden spielen|gegen freunde" },
  mpKind: { "Miteinander (Koop)": "zusammen|gemeinsam|koop|team", "Gegeneinander (PvP)": "gegeneinander|gegen freunde|duell|pvp" },
  storyAmount: { "Keine Story": "keine story|ohne geschichte", "Leichte Geschichte": "kleine geschichte|bisschen story", "Story im Mittelpunkt": "spannende geschichte|story|geschichte erzählen" },
  dimension: { "2D": "2d|zweidimensional", "3D": "3d|dreidimensional" },
  artStyle: { "Pixel-Art": "pixel|retro|8 bit|8-bit", "Cartoon / Comic": "cartoon|comic|zeichentrick|bunt", "Low-Poly": "low poly|lowpoly", "Realistisch": "realistisch|echt aussehen", "Handgezeichnet": "handgezeichnet|gemalt|aquarell", "Flat & minimalistisch": "minimalistisch|schlicht|einfach gehalten", "Voxel": "voxel|klötzchen|blöcke", "Anime": "anime|manga", "Neon / Synthwave": "neon|synthwave" },
  perspective: { "Seitenansicht": "von der seite|seitlich|side", "Von oben": "von oben|draufsicht|top down", "Isometrisch": "isometrisch|schräg von oben", "Third-Person": "hinter der figur|third person", "Ego-Perspektive": "ego|first person|aus den augen" },
  palette: { "Bunt & knallig": "bunt|knallig|farbenfroh", "Pastell": "pastell|sanfte farben", "Dunkel & düster": "dunkel|düster" },
  music: { "Chiptune (8-Bit)": "chiptune|8 bit musik|retro musik", "Orchester": "orchester|episch", "Elektronisch": "elektro|techno|edm", "Lo-Fi / Chill": "lofi|lo-fi|chill musik", "Rock / Metal": "rock|metal", "Fröhlich-verspielt": "fröhliche musik|kindermusik|verspielt", "Keine Musik": "keine musik|ohne musik" },
  monet: { "Komplett kostenlos": "kostenlos|gratis|umsonst|free", "Einmalkauf (Premium)": "einmal kaufen|kostet einmal|preis von", "Kostenlos mit Werbung": "mit werbung|werbung einblenden", "Kostenlos mit In-App-Käufen": "in-app|in app|ingame käufe|skins kaufen", "Abo": "abo|abonnement", "Marketing-Spiel (gratis)": "werbung für|für mein restaurant|für unseren laden|für den verein|für die firma|gutschein|rabatt" },
  launchWhere: { "Nur privat": "nur für mich|privat|nur für uns", "Eigene Website": "eigene website|unsere website|homepage", "itch.io": "itch", "Apple App Store": "app store|appstore|iphone", "Google Play": "play store|playstore|google play", "Steam": "steam", "Web-Spieleportale": "poki|crazygames|spieleportal" },
  languages: { "Deutsch": "deutsch", "Englisch": "englisch|english", "Französisch": "französisch", "Spanisch": "spanisch", "Italienisch": "italienisch", "Türkisch": "türkisch" },
  collect: { "Münzen": "münze|coins|geld sammeln", "Sterne": "sterne", "Edelsteine": "edelstein|diamant|kristall", "Sammelkarten / Sticker": "sticker|sammelkarte", "Schlüssel": "schlüssel" },
  enemies: { "Keine Gegner": "keine gegner|ohne gegner", "Viele Typen plus Bosse": "boss|endgegner|bossgegner" },
  diff: { "Sehr leicht": "sehr leicht|ganz einfach", "Leicht": "leicht", "Schwer": "schwer|schwierig", "Bockschwer": "bockschwer|extrem schwer" },
  devSkill: { "Gar nicht": "kann nicht programmieren|keine ahnung vom programmieren|nicht programmieren", "Anfänger": "bisschen programmieren|anfänger im programmieren", "Profi": "entwickler|programmiere beruflich" },
  save: { "Automatisch": "automatisch speichern|speichert automatisch" }
};
/* Verneinungen: „keine Werbung“ usw. führen zu Tabus bzw. Gegenteil-Antworten */
const NEG = [
  ["werbung", { taboo: "Werbung" }], ["käufe|kaufen|in-app", { taboo: "Echtgeld-Käufe" }], ["gewalt", { taboo: "Gewalt gegen Menschen" }], ["blut", { taboo: "Blut" }],
  ["grusel|horror|angst", { taboo: "Grusel" }], ["chat|fremde", { taboo: "Kontakt mit Fremden" }], ["anmeld|login|konto|account", { account: "Kein Konto" }],
  ["internet|online", { internet: "Komplett offline" }], ["gegner", { enemies: "Keine Gegner" }], ["story|geschichte", { storyAmount: "Keine Story" }], ["musik", { music: "Keine Musik" }]
];
const NEGWORDS = /\b(kein|keine|keinen|keiner|ohne|nicht|niemals|nie)\b/;

function normText(t) { return " " + t.toLowerCase().replace(/[’'`]/g, "").replace(/[^a-zäöüß0-9+\- ]+/g, " ").replace(/\s+/g, " ") + " "; }
function findAll(text, stem) {
  const out = []; let i = -1;
  while ((i = text.indexOf(" " + stem, i + 1)) !== -1) out.push(i + 1);
  return out;
}
function negated(text, pos) { return NEGWORDS.test(text.slice(Math.max(0, pos - 22), pos)); }

function analyzeThoughts(raw) {
  const t = normText(raw || ""), sugg = {};
  const add = (id, v) => { const q = qOf(id); if (!q || !q.opts.some(o => o.v === v)) return; (sugg[id] = sugg[id] || []); if (!sugg[id].includes(v)) sugg[id].push(v); };
  Object.entries(KW).forEach(([id, map]) => {
    const hits = [];
    Object.entries(map).forEach(([label, stems]) => {
      let score = 0;
      stems.split("|").forEach(s => findAll(t, s).forEach(p => { if (!negated(t, p)) score += s.trim().includes(" ") ? 2 : 1; }));
      if (score) hits.push([label, score]);
    });
    if (!hits.length) return;
    hits.sort((a, b) => b[1] - a[1]);
    const q = qOf(id);
    if (q.t === "m") hits.slice(0, q.one ? 1 : 4).forEach(h => add(id, h[0]));
    else add(id, hits[0][0]);
  });
  NEG.forEach(([stems, res]) => stems.split("|").forEach(s => findAll(t, s).forEach(p => { if (negated(t, p)) Object.entries(res).forEach(([id, v]) => add(id, v)); })));
  if (sugg.enemies && sugg.enemies.includes("Keine Gegner") && sugg.ideaChallenge) sugg.ideaChallenge = sugg.ideaChallenge.filter(x => x !== "Gegner");
  return sugg;
}

function suggList() {
  const vis = new Set(visible().map(q => q.id));
  return Object.entries(st.sugg || {}).map(([id, vs]) => ({ q: qOf(id), vs })).filter(x => x.q && vis.has(x.q.id) && x.vs.length)
    .sort((a, b) => Q.indexOf(a.q) - Q.indexOf(b.q));
}
function applySugg(skip) {
  suggList().forEach(({ q, vs }) => {
    if (answered(q) && st.a[q.id] !== AI) return;
    st.a[q.id] = q.one && vs.length === 1 ? vs[0] : vs;
    st.fromThoughts[q.id] = true;
  });
  st.skipKnown = !!skip;
}
function navList() { return visible().filter(q => !(st.skipKnown && st.fromThoughts && st.fromThoughts[q.id])); }

function viewAnalysis() {
  const list = suggList(), th = val("thoughts") || "";
  const rows = list.map(({ q, vs }) => `<li><span class="an-q">${esc(secOf(q.sec).icon)} ${esc(q.label)}</span><span class="an-a">${vs.map(esc).join(", ")}</span></li>`).join("");
  return `<section class="analysis">
    <p class="eyebrow">Deine Gedanken</p>
    <h1>${list.length ? `${list.length} Antworten erkannt` : "Gedanken gespeichert"}</h1>
    <blockquote class="thoughts">${esc(th)}</blockquote>
    ${list.length ? `<p class="lead">Das habe ich aus deinen Gedanken herausgelesen. Übernimm es, und du musst diese Punkte nicht noch einmal beantworten.</p>
      <ul class="an-list">${rows}</ul>` : `<p class="lead">Ich habe keine eindeutigen Antworten gefunden. Kein Problem: Deine Gedanken stehen trotzdem ganz oben im KI-Bauauftrag, und die Fragen helfen beim Rest.</p>`}
    ${st.thinkErr ? `<p class="alert warn">${esc(st.thinkErr)}</p>` : ""}
    ${analyzeThoughts.busy ? `<p class="aistatus" id="thinkStatus">Claude liest deine Gedanken …</p>` : ""}
    <div class="cta">
      ${list.length ? `<button class="btn primary big" data-act="adopt" data-skip="1">Übernehmen & diese Fragen überspringen →</button>
      <button class="btn" data-act="adopt">Übernehmen, aber alle Fragen zeigen</button>` : `<button class="btn primary big" data-act="adopt">Weiter zu den Fragen →</button>`}
      ${aiReady() ? `<button class="btn" data-act="thinkAI" ${analyzeThoughts.busy ? "disabled" : ""}>✨ Von Claude genauer auswerten lassen</button>` : ""}
      <button class="btn ghost" data-act="rethink">Gedanken ändern</button>
    </div>
    <p class="fine">Alles bleibt änderbar. Übernommene Antworten sind bei den Fragen markiert.</p>
  </section>`;
}

async function thinkWithClaude() {
  if (!aiReady() || analyzeThoughts.busy) return;
  analyzeThoughts.busy = true; st.thinkErr = ""; render();
  const cat = visible().filter(q => !q.aiq && !q.quiz && !q.dyn && q.opts.length && q.id !== "kind")
    .map(q => `${q.id}${q.t === "m" ? " (mehrere)" : ""}: ${q.title} = ${q.opts.map(o => o.v).filter(v => v !== QUIZ_OPT).join(" | ")}`).join("\n");
  const input = `Hier sind die freien Gedanken eines Laien zu einem Spiel, das er bauen möchte. Ordne seine Gedanken den Fragen unten zu.
Regeln: Nimm NUR Antworten, die klar aus dem Text hervorgehen oder sehr naheliegend sind. Verwende die Antworttexte exakt wie angegeben. Lass Fragen weg, zu denen der Text nichts sagt.
Antworte NUR mit JSON: {"antworten": {"frage_id": "Antwort" oder ["Antwort", ...]}}

GEDANKEN:
${val("thoughts")}

FRAGEN (id: Frage = Antwort | Antwort | ...):
${cat}`;
  try {
    const out = await aiCall("thoughts", input);
    const res = (out && out.antworten) || {}, sugg = Object.assign({}, st.sugg);
    Object.entries(res).forEach(([id, v]) => {
      const q = qOf(id); if (!q || !q.opts.length) return;
      const vs = (Array.isArray(v) ? v : [v]).filter(x => q.opts.some(o => o.v === x));
      if (vs.length) sugg[id] = vs;
    });
    st.sugg = sugg;
  } catch (e) { st.thinkErr = "Die Auswertung durch Claude hat nicht geklappt. Die automatisch erkannten Antworten bleiben erhalten."; }
  analyzeThoughts.busy = false; render();
}

document.addEventListener("click", e => {
  const b = e.target.closest("[data-act]"); if (!b) return;
  const act = b.dataset.act;
  if (act === "adopt") {
    applySugg(!!b.dataset.skip); st.view = "quiz";
    const v = navList(), i = v.findIndex(q => q.id === "thoughts");
    st.cur = (v.slice(i + 1).find(q => !answered(q)) || v[i + 1] || v[0]).id; render(); window.scrollTo(0, 0);
  }
  if (act === "thinkAI") thinkWithClaude();
  if (act === "rethink") { st.view = "quiz"; st.cur = "thoughts"; render(); }
  if (act === "starter") {
    const t = document.getElementById("txt"); if (!t) return;
    t.value = (t.value.trim() ? t.value.trim() + "\n" : "") + b.dataset.s + " ";
    t.dispatchEvent(new Event("input", { bubbles: true })); t.focus(); t.setSelectionRange(t.value.length, t.value.length);
  }
});
const STARTERS = ["Das Spiel handelt von …", "Der Spieler muss …", "Die Spielfigur ist …", "Es spielt in …", "Das Ziel ist …", "Schwierig wird es, weil …", "Besonders cool wäre …", "Spielen sollen es …", "Es soll laufen auf …", "Auf keinen Fall soll …"];
const STARTERS_GEN = ["Es soll …", "Benutzen sollen es …", "Man soll damit …", "Das Wichtigste ist …", "Es nervt mich gerade, dass …", "Ähnlich wie …", "Es soll laufen auf …", "Besonders cool wäre …", "Auf keinen Fall soll …"];
function starterChips() { return `<div class="starters" aria-label="Satzanfänge">${(isGame(st.a) ? STARTERS : STARTERS_GEN).map(s => `<button class="chip" data-act="starter" data-s="${esc(s.replace(" …", ""))}">${esc(s)}</button>`).join("")}</div>`; }
