/* Ovio – Fragenkatalog */
const AI = "__ai";
const S = [], Q = [];
let _sec;
function sec(id, name, icon, desc) { _sec = id; S.push({ id, name, icon, desc }); }
function q(id, label, title, opts, x) {
  Q.push(Object.assign({ id, label, title, sec: _sec, l: 1, t: "s",
    opts: (opts || []).map(o => ({ i: o[0], v: o[1], d: o[2] || "",
      sc: (o[3] && typeof o[3] === "object") ? o[3] : null, x: o[3] === "x" || o[4] === "x" })) }, x || {}));
}
function has(a, id, ...vals) {
  const v = a[id];
  if (v == null || v === AI) return false;
  return Array.isArray(v) ? v.some(x => vals.includes(x)) : vals.includes(v);
}
const iff = (id, ...vals) => a => has(a, id, ...vals);
const kids = iff("age", "3–6 Jahre", "6–10 Jahre");
const youngish = iff("age", "3–6 Jahre", "6–10 Jahre", "Alle Altersgruppen");
const mobileApp = iff("platforms", "iPhone/iPad (iOS)", "Android");
const touch = iff("platforms", "iPhone/iPad (iOS)", "Android", "Browser (Web)");
const desk = iff("platforms", "Browser (Web)", "PC/Mac", "Konsole");
const web = iff("platforms", "Browser (Web)");
const multiPlat = a => Array.isArray(a.platforms) && a.platforms.length > 1;
const mpAny = a => Array.isArray(a.mp) && a.mp.some(x => x !== "Nur Einzelspieler" && x !== AI);
const online = iff("mp", "Online", "Asynchron (zeitversetzt)");
const local = iff("mp", "Lokal am selben Bildschirm", "Lokal im selben WLAN");
const pvp = iff("mpKind", "Gegeneinander (PvP)", "Beides", "Teams gegeneinander");
const hasStory = iff("storyAmount", "Leichte Geschichte", "Story im Mittelpunkt");
const someStory = iff("storyAmount", "Kurzes Intro", "Leichte Geschichte", "Story im Mittelpunkt");
const ads = iff("monet", "Kostenlos mit Werbung", "Werbung + In-App-Käufe");
const iap = iff("monet", "Kostenlos mit In-App-Käufen", "Werbung + In-App-Käufe");
const stores = iff("launchWhere", "Apple App Store", "Google Play", "Steam", "Konsolen-Stores");
const appStores = iff("launchWhere", "Apple App Store", "Google Play");
const publicLaunch = a => Array.isArray(a.launchWhere) && a.launchWhere.some(x => x !== "Nur privat" && x !== AI);
const or = (...f) => a => f.some(g => g(a));
const and = (...f) => a => f.every(g => g(a));

/* ---------- Spielsysteme ---------- */
const SYS = [
  ["plat", "🦘", "Jump'n'Run / Plattformer", "Wie Super Mario: Figur läuft und springt durch Level mit Abgründen, Hindernissen und Gegnern. Kern: präzises Springen und Timing."],
  ["runner", "🏃", "Endless Runner / Arcade", "Wie Subway Surfers: Figur läuft automatisch; Spieler weicht aus, springt, sammelt. Ziel: so weit wie möglich kommen, Highscore."],
  ["act", "⚔️", "Action / Nahkampf", "Wie Zelda-Kämpfe oder Beat'em ups: Echtzeit-Kämpfe gegen Gegner mit Angriffen, Ausweichen und Kombos."],
  ["shoot", "🎯", "Shooter / Ballern", "Wie Fortnite oder Space Invaders: Zielen und Schießen auf Gegner oder Ziele (auch gewaltfrei: Wasser, Farbe, Raumschiffe). Kern: Treffen und Bewegen."],
  ["tbs", "♟️", "Rundenstrategie", "Wie Schach oder Into the Breach: Abwechselnde Züge, Einheiten auf einem Spielfeld, taktisches Planen ohne Zeitdruck."],
  ["td", "🏰", "Tower Defense / Echtzeitstrategie", "Wie Bloons TD oder Clash Royale: Türme oder Einheiten platzieren, um Gegnerwellen aufzuhalten, oder Armeen in Echtzeit steuern."],
  ["puz", "🧩", "Puzzle / Knobelspiel", "Wie Candy Crush oder Tetris: Rätsel lösen, kombinieren, Muster erkennen. Denken statt Reflexe."],
  ["sim", "🏗️", "Aufbau / Simulation / Management", "Wie Die Sims, Overcooked oder Stardew Valley: Etwas aufbauen und verwalten (Restaurant, Stadt, Farm …), Ressourcen und Kunden managen."],
  ["rpg", "🧙", "Rollenspiel (RPG)", "Wie Pokémon: Figur entwickelt sich durch Erfahrung, Ausrüstung und Quests; Werte, Story und Entscheidungen."],
  ["rogue", "🎲", "Roguelike / Roguelite", "Wie Vampire Survivors: Kurze, zufällig generierte Durchläufe. Bei Niederlage beginnt man neu, behält aber ggf. Meta-Fortschritt."],
  ["race", "🏎️", "Rennspiel", "Wie Mario Kart: Fahrzeuge steuern, auf Strecken gegen Zeit oder Gegner fahren."],
  ["sand", "⛏️", "Sandbox / Crafting", "Wie Minecraft: Offene Welt, Ressourcen abbauen, Gegenstände herstellen, frei bauen."],
  ["adv", "🗺️", "Abenteuer / Story-Spiel", "Wie ein interaktiver Film: Erkunden, Gegenstände benutzen, mit Figuren sprechen, eine Geschichte erleben."],
  ["rhy", "🎵", "Rhythmus / Musik", "Wie Guitar Hero: Im Takt der Musik tippen oder bewegen. Timing zur Musik ist der Kern."],
  ["idle", "⏳", "Idle / Clicker", "Wie Cookie Clicker: Tippen und Upgrades kaufen; Fortschritt läuft auch automatisch weiter."],
  ["party", "🎉", "Party / Minispiel-Sammlung", "Wie Mario Party: Viele kurze, unterschiedliche Minispiele, oft für mehrere Spieler."],
  ["sport", "⚽", "Sportspiel", "Wie FIFA: Echte oder erfundene Sportarten spielen."],
  ["card", "🃏", "Karten / Deckbuilder", "Wie UNO oder Hearthstone: Karten sammeln, Decks bauen, Karten taktisch ausspielen."],
  ["surv", "🔥", "Survival", "Wie Don't Starve: Überleben trotz Hunger, Kälte und Gefahren; sammeln, bauen, verteidigen."],
  ["horror", "👻", "Horror / Grusel", "Wie Five Nights at Freddy's: Spannung und Angst; Verstecken, Flüchten und Erkunden statt Kämpfen."]
];
const SYSN = Object.fromEntries(SYS.map(s => [s[0], s[2]]));
const QUIZ_OPT = "Unsicher – kurzes Quiz machen";
const coreName = a => a.core === QUIZ_OPT ? a.coreQuiz : a.core;
const coreIs = (...keys) => a => { const all = [].concat(coreName(a), a.coreMix); return keys.some(k => all.includes(SYSN[k])); };
const sysOpts = () => SYS.map(s => [s[1], s[2], s[3]]);

/* ---------- Bild-Vorschauen (SVG) ---------- */
const sv = (inner, bg) => `<svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="120" height="80" fill="${bg}"/>${inner}</svg>`;
function pix(rows, col, x, y, s) {
  let o = "";
  rows.forEach((r, j) => [...r].forEach((c, i) => { if (col[c]) o += `<rect x="${x + i * s}" y="${y + j * s}" width="${s}" height="${s}" fill="${col[c]}"/>`; }));
  return o;
}
function cube(x, y, s, t, l, r) {
  const h = s / 2;
  return `<polygon points="${x},${y} ${x + s},${y - h} ${x + 2 * s},${y} ${x + s},${y + h}" fill="${t}"/>` +
    `<polygon points="${x},${y} ${x + s},${y + h} ${x + s},${y + h + s} ${x},${y + s}" fill="${l}"/>` +
    `<polygon points="${x + s},${y + h} ${x + 2 * s},${y} ${x + 2 * s},${y + s} ${x + s},${y + h + s}" fill="${r}"/>`;
}
const ART = {
  pixel: sv(pix(["..1111..", ".122221.", "12322321", "12422421", "12222221", ".122221.", "..1..1..", ".11..11."], { 1: "#2B1D0E", 2: "#F2A541", 3: "#FFFFFF", 4: "#2B1D0E" }, 44, 18, 4) +
    pix(["111111111111", "222222222222"], { 1: "#6AB04C", 2: "#8B5A2B" }, 0, 56, 10) +
    pix(["..11..", ".1111.", "111111"], { 1: "#FFFFFF" }, 8, 8, 4) + pix(["111"], { 1: "#F9D423" }, 86, 36, 6), "#8ED1FC"),
  cartoon: sv(`<circle cx="60" cy="42" r="24" fill="#FF8A5B" stroke="#1E1E1E" stroke-width="3"/><circle cx="51" cy="37" r="7" fill="#fff" stroke="#1E1E1E" stroke-width="2"/><circle cx="69" cy="37" r="7" fill="#fff" stroke="#1E1E1E" stroke-width="2"/><circle cx="53" cy="38" r="3" fill="#1E1E1E"/><circle cx="71" cy="38" r="3" fill="#1E1E1E"/><path d="M48 50 Q60 62 72 50" fill="none" stroke="#1E1E1E" stroke-width="3" stroke-linecap="round"/><path d="M10 14 l6 0 M13 11 l0 6 M100 18 l8 0 M104 14 l0 8" stroke="#1E1E1E" stroke-width="2.5"/>`, "#FFE08A"),
  lowpoly: sv(`<polygon points="0,80 30,30 55,80" fill="#5C6BC0"/><polygon points="30,30 55,80 60,48" fill="#3F51B5"/><polygon points="45,80 80,18 120,80" fill="#7986CB"/><polygon points="80,18 120,80 95,50" fill="#5C6BC0"/><polygon points="80,18 88,30 72,32" fill="#E8EAF6"/><polygon points="0,80 120,80 120,70 60,66 0,72" fill="#283593"/><polygon points="96,10 104,6 108,14 100,18" fill="#FFD54F"/>`, "#1A237E"),
  real: sv(`<defs><radialGradient id="rg1" cx="35%" cy="30%" r="70%"><stop offset="0" stop-color="#F4E3C1"/><stop offset=".55" stop-color="#B07A3B"/><stop offset="1" stop-color="#3B2410"/></radialGradient><linearGradient id="rg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9DB8CF"/><stop offset="1" stop-color="#E9E3D6"/></linearGradient></defs><rect width="120" height="80" fill="url(#rg2)"/><rect y="56" width="120" height="24" fill="#6E6656"/><ellipse cx="62" cy="62" rx="22" ry="5" fill="#2C2820" opacity=".55"/><circle cx="60" cy="40" r="20" fill="url(#rg1)"/>`, "#9DB8CF"),
  hand: sv(`<circle cx="40" cy="44" r="20" fill="#F6A6A1" opacity=".55"/><circle cx="76" cy="36" r="18" fill="#9ED3C6" opacity=".6"/><circle cx="62" cy="54" r="16" fill="#F7D488" opacity=".55"/><path d="M22 46 C 24 30, 42 22, 56 30 S 80 22, 92 34 S 98 58, 78 60 S 40 66, 28 58 S 21 50, 22 46" fill="none" stroke="#4A4036" stroke-width="2" stroke-linecap="round"/><path d="M14 70 q 10 -4 20 0 t 20 0 t 20 0 t 20 0 t 20 0" fill="none" stroke="#4A4036" stroke-width="1.6"/>`, "#FBF6EC"),
  flat: sv(`<rect x="16" y="30" width="30" height="30" rx="2" fill="#FF6B6B"/><circle cx="66" cy="45" r="15" fill="#4ECDC4"/><polygon points="88,60 102,30 116,60" fill="#FFD93D"/><rect x="0" y="66" width="120" height="14" fill="#2D3047"/>`, "#F1F2F6"),
  voxel: sv(cube(30, 40, 14, "#7BD389", "#4C9A5B", "#3A7A47") + cube(58, 40, 14, "#7BD389", "#4C9A5B", "#3A7A47") + cube(44, 33, 14, "#C9A26B", "#9C7643", "#7D5C30") + cube(44, 19, 14, "#8FD3FF", "#5AA9D6", "#3B85B0"), "#20304A"),
  anime: sv(`<defs><linearGradient id="an1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFD1E8"/><stop offset="1" stop-color="#C9B6FF"/></linearGradient></defs><rect width="120" height="80" fill="url(#an1)"/><path d="M28 40 Q60 12 92 40 Q60 58 28 40Z" fill="#fff" stroke="#2A1B3D" stroke-width="3"/><ellipse cx="60" cy="40" rx="12" ry="15" fill="#7B4FD6"/><ellipse cx="60" cy="43" rx="6" ry="8" fill="#2A1B3D"/><circle cx="55" cy="33" r="4" fill="#fff"/><circle cx="65" cy="47" r="2" fill="#fff"/><path d="M26 30 L34 24 M94 30 L86 24" stroke="#2A1B3D" stroke-width="3" stroke-linecap="round"/><path d="M14 66 l3 -7 l3 7 l-7 -4 h8z M100 16 l2 -5 l2 5 l-5 -3 h6z" fill="#fff"/>`, "#FFD1E8"),
  neon: sv(`<defs><linearGradient id="ne1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFD319"/><stop offset="1" stop-color="#FF2975"/></linearGradient></defs><circle cx="60" cy="38" r="20" fill="url(#ne1)"/><rect x="38" y="36" width="44" height="2.5" fill="#1B0B33"/><rect x="38" y="42" width="44" height="3" fill="#1B0B33"/><rect x="38" y="49" width="44" height="4" fill="#1B0B33"/><rect y="56" width="120" height="24" fill="#1B0B33"/><path d="M0 56 H120 M0 62 H120 M0 70 H120 M60 56 L60 80 M60 56 L30 80 M60 56 L0 76 M60 56 L90 80 M60 56 L120 76" stroke="#F222FF" stroke-width="1.2"/>`, "#1B0B33"),
  paper: sv(`<path d="M0 66 Q30 50 60 62 T120 58 V80 H0Z" fill="#8C6A43" transform="translate(2 3)"/><path d="M0 66 Q30 50 60 62 T120 58 V80 H0Z" fill="#C49A6C"/><circle cx="88" cy="24" r="12" fill="#B9852A" transform="translate(2 3)"/><circle cx="88" cy="24" r="12" fill="#F2C14E"/><path d="M24 58 L38 26 L52 58Z" fill="#3E6B48" transform="translate(2 3)"/><path d="M24 58 L38 26 L52 58Z" fill="#6BA368"/>`, "#E9DCC6"),
  side: sv(`<rect y="62" width="120" height="18" fill="#6AB04C"/><rect x="62" y="40" width="28" height="6" fill="#8B5A2B"/><rect x="96" y="28" width="20" height="6" fill="#8B5A2B"/><rect x="22" y="46" width="10" height="16" rx="2" fill="#E74C3C"/><circle cx="27" cy="42" r="5" fill="#F5CBA7"/><path d="M40 52 l8 0 m-3 -3 l3 3 l-3 3" stroke="#1E1E1E" stroke-width="2" fill="none"/><circle cx="76" cy="34" r="3" fill="#F9D423"/><circle cx="104" cy="22" r="3" fill="#F9D423"/>`, "#8ED1FC"),
  top: sv(`<path d="M0 20 H120 M0 40 H120 M0 60 H120 M20 0 V80 M40 0 V80 M60 0 V80 M80 0 V80 M100 0 V80" stroke="#5E9C47" stroke-width="1"/><circle cx="20" cy="20" r="9" fill="#2E7D32"/><circle cx="100" cy="60" r="9" fill="#2E7D32"/><circle cx="90" cy="20" r="7" fill="#2E7D32"/><rect x="30" y="50" width="20" height="16" fill="#A1887F"/><circle cx="62" cy="40" r="7" fill="#E74C3C" stroke="#7B1E15" stroke-width="2"/><path d="M62 32 L58 37 H66Z" fill="#7B1E15"/>`, "#7CB860"),
  iso: sv(cube(18, 44, 14, "#9CCC65", "#7CB342", "#558B2F") + cube(46, 44, 14, "#9CCC65", "#7CB342", "#558B2F") + cube(32, 51, 14, "#9CCC65", "#7CB342", "#558B2F") + cube(60, 51, 14, "#9CCC65", "#7CB342", "#558B2F") + cube(74, 44, 14, "#9CCC65", "#7CB342", "#558B2F") + cube(46, 30, 14, "#FFB74D", "#F57C00", "#E65100"), "#2B3A55"),
  third: sv(`<rect y="40" width="120" height="40" fill="#7CB860"/><polygon points="52,40 68,40 100,80 20,80" fill="#B0A79A"/><rect x="50" y="52" width="20" height="26" rx="4" fill="#3949AB"/><circle cx="60" cy="47" r="8" fill="#5D4037"/>`, "#9AD0F5"),
  first: sv(`<rect y="40" width="120" height="40" fill="#6D7B8D"/><path d="M0 80 L52 40 M120 80 L68 40 M30 80 L56 40 M90 80 L64 40" stroke="#4A5566" stroke-width="1.5"/><rect x="56" y="30" width="8" height="10" fill="#8E5B3A"/><circle cx="60" cy="38" r="5" fill="none" stroke="#fff" stroke-width="1.5"/><path d="M60 30 V34 M60 42 V46 M52 38 H56 M64 38 H68" stroke="#fff" stroke-width="1.5"/><path d="M84 80 L92 56 L110 54 L118 80Z" fill="#F0C29B"/><rect x="88" y="50" width="22" height="8" rx="2" fill="#37474F"/>`, "#BFD6EA"),
  fixed: sv(`<rect x="22" y="8" width="76" height="64" rx="4" fill="#ECEFF1" stroke="#37474F" stroke-width="2"/>${[0, 1, 2, 3].map(i => [0, 1, 2].map(j => `<rect x="${28 + i * 17}" y="${14 + j * 18}" width="14" height="14" rx="3" fill="${["#EF5350", "#42A5F5", "#66BB6A", "#FFCA28"][(i + j) % 4]}"/>`).join("")).join("")}`, "#455A64"),
  d2: sv(`<rect x="34" y="20" width="40" height="40" fill="#FF7043"/><rect y="66" width="120" height="14" fill="#5D4037"/>`, "#FFF3E0"),
  d25: sv(cube(40, 46, 20, "#FFAB91", "#FF7043", "#D84315").replace(/<polygon points="[^"]*" fill="#FF7043"\/>/, "") + `<rect x="40" y="46" width="20" height="20" fill="#FF7043"/><rect y="70" width="120" height="10" fill="#5D4037"/>`, "#FFF3E0"),
  d3: sv(cube(36, 40, 22, "#FFAB91", "#FF7043", "#D84315") + `<ellipse cx="58" cy="74" rx="26" ry="4" fill="#000" opacity=".15"/>`, "#FFF3E0")
};

/* ======================================================= */
sec("vision", "Vision & Grundidee", "💡", "Worum geht es, wie fühlt es sich an, wie groß wird es?");
q("nameStyle", "Namensstil", "Was für einen Namen soll dein Spiel bekommen?", [
  ["⚡", "Kurz & knackig", "Ein oder zwei Wörter, leicht zu merken (z. B. für App-Icons)."],
  ["😜", "Lustiges Wortspiel", "Ein Wortwitz, der zum Thema passt."],
  ["🦊", "Name der Hauptfigur", "Das Spiel heißt wie die Spielfigur."],
  ["📝", "Beschreibend", "Der Name sagt sofort, worum es geht."],
  ["🗝️", "Episch & geheimnisvoll", "Klingt nach Abenteuer und macht neugierig."],
  ["📍", "Mit Ort oder Marke", "Enthält den Namen eines Ortes, Geschäfts oder Vereins."]], { h: "Die KI schlägt dir passend zu deinem Stil drei Namen vor." });
q("feeling", "Kerngefühl", "Welches Gefühl soll das Spiel auslösen?", [
  ["😌", "Entspannung", "Ruhig und stressfrei, kein Zeitdruck, beruhigende Farben und Klänge."],
  ["⚡", "Nervenkitzel", "Adrenalin, knappe Situationen, schnelle Entscheidungen."],
  ["😂", "Lachen & Spaß", "Lustige Animationen, überraschende Momente, Slapstick."],
  ["👻", "Gänsehaut", "Spannung, Unsicherheit, Grusel-Atmosphäre."],
  ["🏅", "Stolz & Meisterschaft", "Schwierige Herausforderungen, die man durch Übung meistert."],
  ["🧭", "Neugier & Entdecken", "Geheimnisse, neue Orte, Belohnung fürs Erkunden."],
  ["🎨", "Kreativität", "Der Spieler gestaltet, baut und drückt sich selbst aus."],
  ["🥊", "Wettkampf", "Sich mit anderen messen, Sieg und Niederlage zählen."]], { t: "m", max: 2, h: "Wähle bis zu zwei." });
q("session", "Rundendauer", "Wie lange dauert eine typische Spielsitzung?", [
  ["⏱️", "1–3 Minuten", "Ultrakurze Runden, sofort spielbar ohne Ladezeit, ideal für Wartezeiten."],
  ["☕", "5–10 Minuten", "Kurze Sitzung: ein paar Level oder eine Partie."],
  ["🛋️", "15–30 Minuten", "Mittlere Sitzung mit spürbarem Fortschritt."],
  ["🌙", "30–60 Minuten", "Längere Sitzungen mit Raum für Story und komplexe Aufgaben."],
  ["♾️", "Stundenlang", "Tiefes Spiel ohne festes Sitzungsende."]]);
q("scope", "Umfang", "Wie groß soll das Spiel werden?", [
  ["🌱", "Mini-Prototyp", "Eine Kernmechanik, ein Level oder Bildschirm. Ziel: die Idee testen."],
  ["🧸", "Kleines Spiel", "Ca. 5–10 Level oder 30–60 Minuten Inhalt, komplett und poliert."],
  ["🏘️", "Mittleres Spiel", "Ca. 20–50 Level oder mehrere Welten, 3–8 Stunden Inhalt."],
  ["🏰", "Großes Spiel", "100+ Level oder offene Welt, 10+ Stunden Inhalt."],
  ]);
q("pace", "Tempo", "Wie schnell soll sich das Spiel anfühlen?", [
  ["🐢", "Gemütlich", "Kein Zeitdruck, der Spieler bestimmt das Tempo."],
  ["🚶", "Mittel", "Gleichmäßiges Tempo mit gelegentlichen Spannungsspitzen."],
  ["🏃", "Schnell", "Ständige Action, schnelle Reaktionen nötig."],
  ["🌪️", "Hektisch", "Viele Dinge gleichzeitig, maximale Reizdichte."],
  ["🎢", "Wechselnd", "Bewusster Wechsel zwischen ruhigen und hektischen Phasen."]], { l: 2 });
q("purpose", "Projektziel", "Wofür entsteht das Spiel?", [
  ["🎈", "Hobby & Spaß", "Für mich selbst, zum Lernen und Ausprobieren."],
  ["🎁", "Für Familie oder Freunde", "Als Geschenk oder für eine bestimmte Gruppe."],
  ["💼", "Portfolio", "Zeigen, was ich kann (Bewerbung, Showreel)."],
  ["💶", "Geld verdienen", "Kommerzieller Erfolg ist ein Ziel."],
  ["🏫", "Bildung", "Für Schule, Unterricht oder Lernzwecke."],
  ["📣", "Marketing für Firma/Verein", "Das Spiel bewirbt ein Geschäft, einen Verein oder eine Marke."]], { l: 2 });
/* ======================================================= */
sec("idea", "Spielidee", "🧠", "Deine Idee wird Baustein für Baustein aufgebaut: Was tust du, warum, wo und was macht es besonders?");
q("ideaRef", "Lieblingsspiele", "Welche Spiele magst du selbst? (Nur als Gefühl, nicht zum Kopieren.)", [
  ["🍄", "Super Mario & Co.", "Hüpfen und Level schaffen.", { plat: 3 }], ["🍬", "Candy Crush & Co.", "Kurze Knobelrunden.", { puz: 3 }],
  ["⛏️", "Minecraft & Co.", "Frei bauen und entdecken.", { sand: 3, surv: 1 }], ["🪂", "Fortnite & Co.", "Gegen andere antreten.", { shoot: 3 }],
  ["🏎️", "Mario Kart & Co.", "Wilde Rennen mit Freunden.", { race: 3 }], ["⚡", "Pokémon & Co.", "Sammeln und Teams stärken.", { rpg: 3 }],
  ["🏠", "Die Sims & Co.", "Leben und Häuser gestalten.", { sim: 3 }], ["🚇", "Subway Surfers & Co.", "Endlos rennen und ausweichen.", { runner: 3 }],
  ["⚽", "FIFA & Co.", "Sport.", { sport: 3 }], ["🏰", "Clash Royale & Co.", "Taktik in kurzen Duellen.", { td: 2, card: 2 }],
  ["🗡️", "Zelda & Co.", "Abenteuer, Rätsel und Kämpfe.", { adv: 2, act: 2 }], ["🕵️", "Among Us & Co.", "Gemeinsam lachen und rätseln.", { party: 3 }],
  ["👨‍🍳", "Overcooked & Co.", "Hektisch zusammen kochen.", { sim: 2, party: 2 }], ["🧛", "Vampire Survivors & Co.", "Immer stärker gegen Massen.", { rogue: 3 }]], { t: "m", max: 3, h: "Bis zu drei. So versteht die KI dein Wunsch-Spielgefühl, ohne dass du Fachbegriffe kennen musst." });
q("ideaVerb", "Hauptaktion", "Was macht der Spieler die meiste Zeit?", [
  ["🦘", "Springen", "", { plat: 4, runner: 2 }], ["💨", "Laufen & Ausweichen", "", { runner: 4, plat: 1 }], ["🎯", "Schießen & Werfen", "", { shoot: 4, sport: 1 }],
  ["⚔️", "Kämpfen", "", { act: 4, rpg: 2, rogue: 1 }], ["🧱", "Bauen", "", { sand: 3, sim: 2, td: 2 }], ["🪙", "Sammeln", "", { idle: 2, plat: 1, runner: 1, sand: 1 }],
  ["🧤", "Fangen", "", { runner: 2, party: 2, sim: 1 }], ["🍳", "Kochen & Zubereiten", "", { sim: 4, party: 1 }], ["🔗", "Kombinieren & Verbinden", "", { puz: 4, card: 1 }],
  ["🏎️", "Fahren & Steuern", "", { race: 4 }], ["🥷", "Schleichen & Verstecken", "", { horror: 3, adv: 1 }], ["🧺", "Sortieren & Ordnen", "", { puz: 3, sim: 1 }],
  ["✏️", "Zeichnen", "", { puz: 2, party: 2 }], ["📣", "Andere anführen", "", { tbs: 3, td: 3 }], ["💱", "Handeln & Verkaufen", "", { sim: 3, idle: 2 }],
  ["🧭", "Erkunden", "", { adv: 3, rpg: 2, sand: 1, surv: 1 }], ["🃏", "Karten ausspielen", "", { card: 5 }], ["🎵", "Im Takt tippen", "", { rhy: 5 }]], { t: "m", max: 2, h: "Wähle bis zu zwei. Das ist der wichtigste Baustein deiner Idee.", wide: 0 });
q("ideaGoal", "Ziel des Spielers", "Warum macht der Spieler das? Was ist sein Ziel?", [
  ["🛟", "Jemanden retten", "", { adv: 1, plat: 1, rpg: 1 }], ["🏃", "Entkommen", "", { runner: 2, horror: 2 }], ["🏁", "Ans Ziel kommen", "", { plat: 2, race: 2 }],
  ["📈", "Größer & erfolgreicher werden", "", { sim: 2, idle: 3, rpg: 1 }], ["🥇", "Andere besiegen", "", { shoot: 1, sport: 2, card: 1, act: 1 }],
  ["🗂️", "Alles einsammeln", "", { plat: 1, adv: 1 }], ["🏰", "Etwas verteidigen", "", { td: 4, surv: 1 }], ["📦", "Aufträge erfüllen", "", { sim: 3 }],
  ["🧩", "Rätsel lösen", "", { puz: 3, adv: 2 }], ["🔥", "Überleben", "", { surv: 4, horror: 1, rogue: 1 }], ["🏅", "Den Highscore knacken", "", { runner: 3, rhy: 1 }],
  ["🎨", "Etwas Eigenes erschaffen", "", { sand: 4 }]]);
q("ideaChallenge", "Herausforderung", "Was macht es schwierig?", [
  ["⏳", "Zeitdruck", ""], ["👾", "Gegner", ""], ["🕳️", "Gefährliche Wege & Fallen", ""], ["📉", "Knappe Ressourcen", ""],
  ["🧠", "Knifflige Logik", ""], ["🆚", "Andere Spieler", ""], ["🌪️", "Immer mehr gleichzeitig", ""], ["🎳", "Unberechenbare Physik", ""], ["😌", "Gar nichts, es ist entspannt", "", "x"]], { t: "m", max: 2 });
q("ideaTwist", "Der Clou", "Was ist der besondere Kniff, den andere Spiele nicht haben?", [
  ["🙃", "Schwerkraft umdrehen", "Oben und unten lassen sich tauschen."], ["⏪", "Zeit beeinflussen", "Zurückspulen, anhalten oder verlangsamen."],
  ["👯", "Zwei Figuren gleichzeitig", "Der Spieler steuert zwei Dinge auf einmal."], ["🌗", "Welt verwandelt sich", "Die Welt ändert sich ständig, z. B. Tag/Nacht oder zwei Dimensionen."],
  ["1️⃣", "Alles mit einer Taste", "Extrem simpel zu bedienen, schwer zu meistern."], ["🔍", "Größe ändern", "Figur wird winzig oder riesig."],
  ["🔄", "Rollentausch", "Mal Jäger, mal Gejagter."], ["🎨", "Farben wechseln", "Nur Dinge in der aktiven Farbe existieren."],
  ["🧲", "Alles hängt zusammen", "Jede Aktion löst eine Kettenreaktion aus."], ["👍", "Kein Kniff, klassisch gut", "Bekanntes Prinzip, perfekt umgesetzt."]]);
q("ideaEscalation", "Steigerung", "Wie wird das Spiel mit der Zeit spannender?", [
  ["🚀", "Mehr Tempo", ""], ["👹", "Neue Gegner & Hindernisse", ""], ["✨", "Neue Fähigkeiten", ""], ["📜", "Neue Regeln pro Welt", "Jede Welt bringt eine neue Mechanik."],
  ["🤹", "Mehr gleichzeitig", ""], ["🫥", "Weniger Hilfen", ""]], { t: "m", max: 3 });
q("ideaStart", "Die ersten Sekunden", "Was passiert in den ersten 10 Sekunden?", [
  ["💥", "Sofort Action", "Kein Menü, direkt losspielen."], ["🎬", "Kurze Story-Szene", "Ein paar Bilder erklären, worum es geht."],
  ["🛝", "Spielplatz zum Ausprobieren", "Gefahrloser Bereich, um die Steuerung zu lernen."], ["🌱", "Bei null anfangen", "Leeres Feld, der Spieler beginnt zu bauen."]], { l: 2 });
q("ideaWow", "Wow-Moment", "Welcher Moment soll Spieler „Wow!“ sagen lassen?", [
  ["😮‍💨", "Rettung in letzter Sekunde", ""], ["💥", "Riesige Kettenreaktion", ""], ["🔐", "Geheimnis entdeckt", ""], ["🔥", "Perfekte Kombo", ""],
  ["🏙️", "Etwas Großes fertig gebaut", ""], ["😈", "Freunde ausgetrickst", ""], ["🐉", "Riesiger Gegner besiegt", ""]], { l: 2 });
q("ideaFinale", "Finale", "Wie endet ein Level oder Abschnitt?", [
  ["🐲", "Bosskampf", ""], ["🏃", "Finale Flucht oder Rennen", ""], ["🧩", "Das größte Rätsel", ""], ["📖", "Auflösung der Geschichte", ""],
  ["🏆", "Abrechnung mit Punkten", "Sterne, Punkte und Rangliste."], ["🎉", "Einfach geschafft", "Kurze Jubel-Animation, weiter geht's."]], { l: 2 });
q("ideaRule", "Sonderregel", "Gibt es eine besondere Regel?", [
  ["🚫", "Niemals stehen bleiben", ""], ["💸", "Jede Aktion kostet etwas", ""], ["1️⃣", "Nur ein Versuch", ""], ["💥", "Alles ist zerstörbar", ""],
  ["🕊️", "Man kann nicht angreifen", ""], ["👁️", "Man sieht nur einen kleinen Ausschnitt", ""], ["➖", "Keine Sonderregel", ""]], { l: 3 });
q("ideaPerfect", "Perfekter Zug", "Was passiert, wenn dem Spieler etwas perfekt gelingt?", [
  ["🎆", "Punkte-Explosion", ""], ["🐌", "Kurze Zeitlupe", ""], ["🎶", "Musik wird intensiver", ""], ["🙌", "Figur jubelt", ""], ["🎁", "Bonus-Belohnung", ""]], { l: 3, t: "m" });
/* ======================================================= */
sec("audience", "Zielgruppe", "👥", "Für wen ist das Spiel und was ist tabu?");
q("age", "Alter", "Für welches Alter ist das Spiel?", [
  ["🧸", "3–6 Jahre", "Kleinkinder: riesige Buttons, kein Text, kein echtes Scheitern, Elternschranke."],
  ["🪁", "6–10 Jahre", "Grundschulkinder: einfache Wörter, klare Symbole, schnelle Erfolgserlebnisse."],
  ["🛹", "10–13 Jahre", "Ältere Kinder: mehr Herausforderung, einfache Texte."],
  ["🎧", "13–17 Jahre", "Jugendliche: Wettkampf, Coolness, soziale Features."],
  ["💼", "Erwachsene 18+", "Komplexere Systeme, ernstere Themen möglich."],
  ["👨‍👩‍👧", "Alle Altersgruppen", "Familienfreundlich, aber mit Tiefe für Ältere."]]);
q("skill", "Spielerfahrung", "Wie viel Spielerfahrung haben deine Spieler?", [
  ["🌱", "Kaum bis keine", "Muss ohne Vorwissen sofort verständlich sein."],
  ["🙂", "Gelegenheitsspieler", "Kennt Handyspiele, will schnellen Spaß ohne Lernkurve."],
  ["🎮", "Erfahrene Spieler", "Kennt die Genre-Konventionen, mag Tiefe."],
  ["🔥", "Hardcore-Profis", "Sucht maximale Herausforderung und Optimierung."]]);
q("reading", "Lesefähigkeit", "Können deine Spieler lesen?", [
  ["🔣", "Nein, nur Symbole", "Kein Text im Spiel. Alles über Bilder, Animationen und Ton."],
  ["🔤", "Ein bisschen", "Nur einzelne kurze Wörter; Wichtiges zusätzlich mit Symbol."],
  ["📖", "Ja, problemlos", "Normale Texte sind in Ordnung."]], { l: 2, if: youngish });
q("whereplay", "Spielsituation", "Wo und wann wird hauptsächlich gespielt?", [
  ["🚌", "Unterwegs", "Bus und Bahn, oft ohne Ton und mit einer Hand."],
  ["🍽️", "Beim Warten", "Restaurant, Arztpraxis, Schlange: kurze Pausen, jederzeit unterbrechbar."],
  ["🛋️", "Auf der Couch", "Entspannt, längere Sitzungen, mit Ton."],
  ["🖥️", "Am Schreibtisch", "PC oder Laptop, volle Konzentration."],
  ["👫", "Mit anderen im Raum", "Mehrere Leute schauen zu oder spielen mit."],
  ["🛏️", "Vor dem Schlafen", "Ruhig, dunkle Umgebung, kurze Sitzungen."]], { l: 2, t: "m" });
q("languages", "Sprachen im Spiel", "In welchen Sprachen gibt es das Spiel?", [
  ["🇩🇪", "Deutsch", ""], ["🇬🇧", "Englisch", ""], ["🇫🇷", "Französisch", ""], ["🇪🇸", "Spanisch", ""], ["🇮🇹", "Italienisch", ""], ["🇹🇷", "Türkisch", ""],
  ["🇯🇵", "Japanisch", ""], ["🔣", "Sprachfrei", "Nur Symbole, keine Übersetzung nötig.", "x"]], { t: "m", h: "Alle Texte werden in einer Sprachdatei gesammelt, damit später weitere Sprachen leicht dazukommen." });
q("taboo", "Tabu-Inhalte", "Was darf auf keinen Fall im Spiel vorkommen?", [
  ["🩸", "Blut", "Keine Blutdarstellung."],
  ["💥", "Gewalt gegen Menschen", "Keine realistische Gewalt gegen Menschen."],
  ["😱", "Grusel", "Keine Jumpscares, Monster oder Angstszenen."],
  ["🤬", "Schimpfwörter", "Keine Kraftausdrücke."],
  ["🎰", "Glücksspiel", "Keine Lootboxen, Glücksräder gegen Geld oder Casino-Elemente."],
  ["💬", "Kontakt mit Fremden", "Keine Kommunikation mit unbekannten Spielern."],
  ["📺", "Werbung", "Keine Werbeeinblendungen."],
  ["💳", "Echtgeld-Käufe", "Keine In-App-Käufe."],
  ["✅", "Keine Einschränkungen", "Nichts davon ist ausgeschlossen.", "x"]], { l: 2, t: "m" });
q("parents", "Eltern-Funktionen", "Welche Funktionen brauchen Eltern?", [
  ["🔒", "Elternbereich mit Sperre", "Einstellungen, Links und Käufe erst nach Elternschranke (z. B. Rechenaufgabe)."],
  ["⏲️", "Spielzeit-Limit", "Eltern können die tägliche Spielzeit begrenzen."],
  ["📨", "Fortschrittsübersicht", "Eltern sehen, was das Kind gespielt oder gelernt hat."],
  ["🚫", "Keine", "Keine Elternfunktionen nötig.", "x"]], { l: 3, t: "m", if: kids });
q("rating", "Altersfreigabe", "Welche Alterseinstufung strebst du an?", [
  ["🟢", "USK 0 / PEGI 3", "Für alle freigegeben."],
  ["🟡", "USK 6 / PEGI 7", "Leichte Comic-Gewalt, minimal gruselig."],
  ["🟠", "USK 12 / PEGI 12", "Fantasy-Gewalt, etwas Spannung."],
  ["🔴", "USK 16 / PEGI 16", "Realistischere Gewalt, ernste Themen."],
  ["⛔", "USK 18 / PEGI 18", "Nur für Erwachsene."]], { l: 3 });
/* ======================================================= */
sec("platform", "Plattform & Geräte", "📱", "Wo läuft dein Spiel und unter welchen Bedingungen?");
q("platforms", "Plattformen", "Auf welchen Geräten soll das Spiel laufen?", [
  ["🌐", "Browser (Web)", "Läuft direkt im Browser auf Handy und PC, ohne Download."],
  ["🍎", "iPhone/iPad (iOS)", "Native App im Apple App Store."],
  ["🤖", "Android", "App im Google Play Store."],
  ["💻", "PC/Mac", "Desktop-Spiel für Windows und macOS."],
  ["🎮", "Konsole", "Nintendo Switch, PlayStation oder Xbox."],
  ["🥽", "VR/AR", "Virtual-Reality-Brille oder Augmented Reality."]], { t: "m" });
q("primaryPlat", "Hauptplattform", "Für welche Plattform wird zuerst optimiert?", [
  ["📱", "Handy zuerst", "Design und Steuerung primär für Touchscreens."],
  ["🖥️", "PC zuerst", "Primär für Maus/Tastatur und große Bildschirme."],
  ["🎮", "Konsole zuerst", "Primär für Controller und Fernseher."],
  ["⚖️", "Alle gleichwertig", "Jede Plattform bekommt eigene, gleichwertige Anpassungen."]], { l: 2, if: multiPlat });
q("orientation", "Bildschirmausrichtung", "In welcher Ausrichtung wird auf dem Handy gespielt?", [
  ["📱", "Hochformat", "Einhändig spielbar, ideal für unterwegs."],
  ["📲", "Querformat", "Breiteres Sichtfeld, mit zwei Händen."],
  ["🔄", "Beides", "Layout passt sich automatisch an die Drehung an."]], { if: touch });
q("tablet", "Tablets", "Wie sollen Tablets unterstützt werden?", [
  ["📱", "Nur Handy-Layout", "Läuft auf Tablets, wird aber nur hochskaliert."],
  ["📐", "Eigenes Tablet-Layout", "Die Oberfläche nutzt den großen Bildschirm sinnvoll."],
  ["🖼️", "Tablet zuerst", "Hauptsächlich für Tablets gestaltet."]], { l: 3, if: mobileApp });
q("deviceClass", "Geräteleistung", "Wie leistungsstark sind die Zielgeräte?", [
  ["🐌", "Auch alte Geräte", "Muss auf 5+ Jahre alten Einsteiger-Handys flüssig laufen."],
  ["⚖️", "Mittelklasse", "Aktuelle Durchschnittsgeräte."],
  ["🚀", "High-End", "Nur neue, starke Geräte; maximale Grafik."]], { l: 3 });
q("internet", "Internet", "Braucht das Spiel eine Internetverbindung?", [
  ["✈️", "Komplett offline", "Funktioniert ohne jede Verbindung."],
  ["🔌", "Offline, online optional", "Ranglisten oder Cloud nur, wenn Netz da ist."],
  ["📶", "Nur online", "Ständige Verbindung nötig."]], { l: 2 });
q("webLaunch", "Web-Start", "Wie wird die Web-Version gestartet?", [
  ["🔗", "Einfacher Link", "URL öffnen und sofort spielen."],
  ["📲", "Installierbar (PWA)", "Kann zum Homescreen hinzugefügt werden und läuft offline."],
  ["🔳", "QR-Code vor Ort", "z. B. auf Tischaufstellern, Flyern oder Plakaten."],
  ["🧩", "In Website eingebettet", "Läuft in einer bestehenden Website (iframe oder Widget)."]], { l: 2, t: "m", if: web });
q("pcWindow", "Fenstermodus", "Wie läuft das Spiel auf PC-Bildschirmen?", [
  ["🖥️", "Vollbild", "Startet im Vollbild."],
  ["🪟", "Fenster", "Startet im Fenster, frei skalierbar."],
  ["🔀", "Wählbar", "Vollbild, Fenster und Auflösung in den Einstellungen wählbar."]], { l: 4, if: iff("platforms", "PC/Mac") });
q("size", "Download-Größe", "Wie groß darf das Spiel maximal sein?", [
  ["🪶", "Unter 10 MB", "Extrem schlank, lädt sofort (ideal fürs Web)."],
  ["📦", "Unter 100 MB", "Kann ohne WLAN geladen werden."],
  ["🗃️", "Unter 1 GB", "Normale App-Größe."],
  ["🏔️", "Egal", "Größe spielt keine Rolle."]], { l: 4 });

/* ======================================================= */
sec("core", "Gameplay-System", "🎮", "Das Herz deines Spiels: wie es funktioniert. Mit Quiz, falls du unsicher bist.");
q("core", "Spielsystem", "Welches Spielsystem passt am besten zu deiner Idee?", sysOpts().concat([["❓", QUIZ_OPT, "Ein paar Fragen zu deinen Vorlieben, dann schlägt das Quiz ein System vor."]]), { wide: 1, h: "Die Liste ist nach deinen bisherigen Antworten sortiert. Ganz unten gibt es ein Quiz, falls du unsicher bist." });
const quiz = a => a.core === QUIZ_OPT;
q("qz1", "Quiz 1", "Was machst du in deiner Freizeit am liebsten?", [
  ["⚽", "Sport & Bewegung", "", { sport: 3, race: 2, runner: 2, plat: 1 }],
  ["🧩", "Knobeln & Rätseln", "", { puz: 3, tbs: 2, card: 1, adv: 1 }],
  ["🧱", "Bauen & Basteln", "", { sand: 3, sim: 3, td: 1 }],
  ["📚", "Bücher, Filme, Serien", "", { adv: 3, rpg: 2, horror: 1 }],
  ["👾", "Mit Freunden zocken", "", { party: 3, shoot: 2, act: 1, sport: 1 }],
  ["🎧", "Musik hören oder machen", "", { rhy: 4, runner: 1 }]], { if: quiz, noAi: true, quiz: 1 });
q("qz2", "Quiz 2", "Wie willst du dich im Spiel fühlen?", [
  ["⚡", "Schnell & geschickt", "", { plat: 3, runner: 3, race: 2, rhy: 1 }],
  ["🧠", "Schlau", "", { puz: 3, tbs: 3, card: 2, td: 1 }],
  ["💪", "Mächtig & stark", "", { act: 3, rpg: 2, shoot: 2, rogue: 1 }],
  ["🎨", "Kreativ", "", { sand: 3, sim: 2 }],
  ["😌", "Entspannt", "", { sim: 2, idle: 3, puz: 1, adv: 1 }],
  ["😨", "Angespannt", "", { horror: 4, surv: 2 }]], { if: quiz, noAi: true, quiz: 1 });
q("qz4", "Quiz 4", "Reflexe oder Nachdenken?", [
  ["⚡", "Nur Reflexe", "", { runner: 3, shoot: 2, rhy: 2, race: 2 }],
  ["🎯", "Eher Reflexe", "", { plat: 3, act: 2, sport: 2 }],
  ["⚖️", "Gute Mischung", "", { rogue: 3, rpg: 1, surv: 2, td: 1 }],
  ["🤔", "Eher Nachdenken", "", { td: 2, card: 2, sim: 2, adv: 1 }],
  ["🧘", "Nur Nachdenken, in Ruhe", "", { puz: 3, tbs: 3 }]], { if: quiz, noAi: true, quiz: 1 });
q("qz6", "Quiz 6", "Was ist dir in einem Spiel am wichtigsten?", [
  ["📈", "Stärker werden", "", { rpg: 3, idle: 2, rogue: 2 }],
  ["🥇", "Gewinnen & Highscore", "", { runner: 2, sport: 2, race: 2, shoot: 1, party: 1 }],
  ["📖", "Eine gute Geschichte", "", { adv: 4, rpg: 1, horror: 1 }],
  ["🕊️", "Freiheit, alles zu tun", "", { sand: 4, surv: 2 }],
  ["🧩", "Die perfekte Lösung finden", "", { puz: 3, tbs: 1, card: 1 }],
  ["🏙️", "Etwas Großes erschaffen", "", { sim: 4, td: 1 }]], { if: quiz, noAi: true, quiz: 1 });
q("qz7", "Quiz 7", "Welches Bild spricht dich am meisten an?", [
  ["🏰", "Eine Burg mit Türmen", "", { td: 3, tbs: 2 }],
  ["🏎️", "Ein Rennwagen", "", { race: 4 }],
  ["🗡️", "Ein Schwert", "", { act: 3, rpg: 2 }],
  ["🃏", "Ein Kartenstapel", "", { card: 4 }],
  ["🔦", "Eine Taschenlampe im Dunkeln", "", { horror: 3, surv: 2, adv: 1 }],
  ["🎤", "Ein Mikrofon", "", { rhy: 3, party: 2 }],
  ["🪓", "Eine Axt im Wald", "", { surv: 3, sand: 2 }],
  ["🍕", "Eine Pizza", "", { sim: 3, runner: 1, party: 1 }]], { if: quiz, noAi: true, quiz: 1 });
q("qz8", "Quiz 8", "Was machst du, wenn du in einem Spiel scheiterst?", [
  ["🔁", "Sofort nochmal!", "", { rogue: 3, plat: 2, runner: 2 }],
  ["😤", "Ich will es unbedingt knacken", "", { act: 2, plat: 2, shoot: 1 }],
  ["🙂", "Hauptsache kein Stress", "", { sim: 2, idle: 3, puz: 1, adv: 1 }],
  ["🧐", "Ich überlege, was schiefging", "", { tbs: 3, puz: 2, card: 2 }]], { if: quiz, noAi: true, quiz: 1 });
q("coreQuiz", "Spielsystem", "Dein Quiz-Ergebnis. Welches System nimmst du?", [], { if: quiz, dyn: 1, h: "Sortiert nach Übereinstimmung mit deinen Quiz-Antworten." });
q("coreMix", "Zweites System", "Soll ein zweites System beigemischt werden?", [["➖", "Nein, nur eins", "Das Spiel bleibt beim Kernsystem."]].concat(sysOpts()), { l: 3, h: "Beispiele: Roguelike + Kartenspiel, Plattformer + Puzzle, Simulation + Idle." });

/* Kern-spezifische Fragen */
q("platJump", "Sprunggefühl", "Wie soll sich das Springen anfühlen?", [
  ["🎯", "Präzise & schnell", "Sofortige Reaktion; Sprunghöhe hängt davon ab, wie lange gedrückt wird; Coyote-Time und Sprung-Puffer."],
  ["🪶", "Schwebend & weich", "Lange Flugphase und viel Kontrolle in der Luft."],
  ["🪨", "Realistisch & schwer", "Trägheit, Schwung, wenig Kontrolle in der Luft."],
  ["🤖", "Automatisch", "Die Figur springt von selbst; der Spieler steuert Richtung oder Timing."]], { l: 2, if: coreIs("plat") });
q("platMoves", "Bewegungsfähigkeiten", "Welche Bewegungen kann die Figur?", [
  ["⏫", "Doppelsprung", "Ein zweiter Sprung in der Luft."], ["🧱", "Wandsprung", "Von Wänden abspringen und an ihnen rutschen."],
  ["💨", "Dash", "Kurzer, schneller Vorstoß in eine Richtung."], ["🪂", "Gleiten", "Langsames Fallen und Segeln."],
  ["🛝", "Rutschen", "Unter Hindernissen hindurchrutschen."], ["🧗", "Klettern", "Leitern, Ranken, Kanten hochziehen."],
  ["🏊", "Schwimmen", "Bewegung unter Wasser."], ["⬇️", "Stampfangriff", "Von oben auf Gegner oder Blöcke stampfen."]], { l: 2, t: "m", if: coreIs("plat") });
q("platHazards", "Hindernisse", "Welche Hindernisse gibt es?", [
  ["🔺", "Stacheln", ""], ["🕳️", "Abgründe", ""], ["↔️", "Bewegliche Plattformen", ""], ["⬇️", "Zerbrechende Plattformen", ""],
  ["🪚", "Sägeblätter", ""], ["🌋", "Steigende Lava oder Wasser", ""], ["💣", "Kanonen & Geschosse", ""], ["🌬️", "Wind & Strömung", ""]], { l: 3, t: "m", if: coreIs("plat") });
q("runDir", "Laufrichtung", "Wie läuft die Figur?", [
  ["➡️", "Seitlich", "Von links nach rechts, springen und ducken."],
  ["⬆️", "Nach vorne in Spuren", "In die Tiefe, Wechsel zwischen 3 Spuren."],
  ["🔝", "Nach oben", "Vertikal von Plattform zu Plattform."],
  ["🐦", "Fliegen per Tippen", "Jeder Tipp lässt die Figur aufsteigen, sonst fällt sie."]], { l: 2, if: coreIs("runner") });
q("runInput", "Runner-Eingabe", "Wie reagiert der Spieler?", [
  ["👆", "Ein-Tipp", "Nur eine Aktion (z. B. springen)."], ["👉", "Wischen", "Wischen nach oben, unten, links, rechts."], ["📐", "Neigen", "Gerät kippen zum Lenken."]], { l: 3, if: coreIs("runner") });
q("actCombat", "Kampfgefühl", "Was macht dir beim Kämpfen in Spielen am meisten Spaß?", [
  ["💥", "Wild draufhauen", "Viele schnelle Treffer, laut und chaotisch."],
  ["⏱️", "Den richtigen Moment abpassen", "Gegner beobachten und genau dann zuschlagen oder blocken."],
  ["🤸", "Geschickt ausweichen", "Elegant um Angriffe herumtanzen."],
  ["✨", "Coole Spezialkräfte", "Seltene, besonders starke Angriffe einsetzen."]], { l: 2, t: "m", max: 2, if: coreIs("act") });
q("actWeapons", "Kampf-Look", "Wie soll der Kampf aussehen?", [
  ["🧙", "Fantasy", "Wie in Märchen und Sagen."], ["🪖", "Realistisch", "Wie es in echt aussehen könnte."], ["🥄", "Albern", "Mit Kissen, Kochlöffeln und Quatsch."],
  ["🥋", "Ohne Waffen", "Nur mit Körper und Geschick."], ["🚀", "Futuristisch", "Hightech und Laser."]], { l: 2, if: coreIs("act", "rpg") , h: "Die KI denkt sich passend dazu die Waffen und Angriffe aus." });
q("shootAim", "Zielen", "Wie leicht soll das Treffen sein?", [
  ["🧲", "Sehr leicht", "Das Spiel hilft stark beim Zielen."], ["🤏", "Etwas Hilfe", ""], ["🎯", "Nur mit Können", "Kein bisschen Hilfe."]], { l: 3, if: coreIs("shoot") });
q("tbsGrid", "Spielfeld", "Wie sieht das Spielfeld aus?", [
  ["⬛", "Quadrate", "Schachbrett-artiges Raster."], ["⬡", "Sechsecke", "Hexfelder, sechs Nachbarn."], ["🌫️", "Frei", "Bewegung nach Reichweite ohne Raster."], ["🗂️", "Keine Karte", "Nur Karten oder Menüs."]], { l: 2, if: coreIs("tbs") });
q("tbsFog", "Überraschungen", "Soll man immer sehen, was der Gegner macht?", [
  ["🌫️", "Nein, Überraschungen!", "Man sieht nur, was in der Nähe der eigenen Figuren ist."], ["👀", "Ja, alles sichtbar", "Wie beim Schach."]], { l: 3, if: coreIs("tbs") });
q("tdType", "Verteidigung", "Wie willst du dich verteidigen?", [
  ["🛤️", "Türme an den Weg stellen", "Gegner laufen einen festen Weg."], ["🌀", "Den Weg selbst bauen", "Mit Mauern ein Labyrinth legen."],
  ["↔️", "In mehreren Reihen", "Gegner kommen in Bahnen, du besetzt die Bahnen."], ["⚔️", "Eigene Armee schicken", "Truppen bauen und losschicken."]], { l: 2, if: coreIs("td") });
q("puzType", "Rätselart", "Welche Art Rätsel?", [
  ["💎", "Match-3", "Drei Gleiche tauschen und kombinieren."], ["🪀", "Physik", "Objekte fallen, rollen, schwingen."],
  ["🧊", "Logik & Schieben", "Blöcke schieben, Wege finden."], ["🔤", "Wörter", "Buchstaben und Begriffe."],
  ["🔢", "Zahlen & Mathe", "Rechnen und Zahlenrätsel."], ["🔀", "Zusammenführen (Merge)", "Zwei Gleiche ergeben ein besseres Objekt."],
  ["〰️", "Linien verbinden", "Punkte oder Rohre verbinden."], ["🔍", "Versteckte Objekte", "Dinge in Bildern finden."], ["🧺", "Sortieren & Stapeln", "Farben oder Dinge ordnen."]], { l: 2, t: "m", if: coreIs("puz") });
q("puzLimit", "Begrenzung", "Wie wird ein Rätsel begrenzt?", [
  ["♾️", "Ohne Limit", "Beliebig viel Zeit und Züge."], ["🔢", "Zuglimit", "Maximale Anzahl Züge."], ["⏳", "Zeitlimit", "Countdown pro Rätsel."]], { l: 3, if: coreIs("puz") });
q("simType", "Simulationsart", "Was wird aufgebaut oder verwaltet?", [
  ["🍕", "Restaurant / Laden", "Kunden bedienen, Speisen zubereiten, ausbauen."], ["🏙️", "Stadt", "Gebäude, Straßen, Bewohner."], ["🌾", "Farm", "Anbauen, Ernten, Tiere."],
  ["🦁", "Zoo / Freizeitpark", "Gehege oder Attraktionen, Besucher."], ["🏢", "Firma / Tycoon", "Produktion, Handel, Expansion."], ["🏡", "Lebenssimulation", "Alltag einer Figur."], ["🚜", "Beruf / Fahrzeug", "Einen Job realistisch ausführen."]], { l: 2, if: coreIs("sim") });
q("simDepth", "Planen & Rechnen", "Wie viel Planen und Rechnen macht dir Spaß?", [
  ["🪁", "Kaum", "Einfach loslegen, wenige Zahlen."], ["⚙️", "Etwas", "Ein bisschen planen lohnt sich."], ["🏭", "Viel", "Ich liebe Tabellen und Optimierung."]], { l: 3, if: coreIs("sim") });
q("simCustomers", "Kundenverhalten", "Wie verhalten sich Kunden oder Bewohner?", [
  ["⏳", "Geduldsbalken", "Warten nur begrenzt."], ["💭", "Wünsche als Sprechblase", "Zeigen ihre Bestellung als Bild."], ["⭐", "Bewertungen", "Geben Sterne, die den Ruf beeinflussen."],
  ["👑", "Besondere Gäste", "VIPs oder Kritiker mit Sonderwünschen."], ["🗣️", "Eigene Persönlichkeit", "Stammkunden mit Namen und Geschichten."]], { l: 3, t: "m", if: coreIs("sim") });
q("rpgCombat", "RPG-Kampf", "Wie sollen Kämpfe ablaufen?", [
  ["🔁", "Abwechselnd in Ruhe", "Wie ein Brettspiel: erst du, dann der Gegner."], ["⚔️", "Live und direkt", "Selbst steuern und kämpfen."],
  ["🤖", "Läuft von selbst", "Du stellst dein Team zusammen, der Kampf läuft automatisch."]], { l: 2, if: coreIs("rpg") });
q("rpgClasses", "Spezialisierung", "Soll man sich auf eine Rolle festlegen?", [
  ["🛡️", "Ja, feste Rollen", "z. B. Krieger, Magier, Heiler."], ["🌿", "Nein, alles frei mischbar", ""], ["➖", "Egal, nur Ausrüstung zählt", ""]], { l: 3, if: coreIs("rpg") });
q("rogueMeta", "Nach dem Scheitern", "Was soll bleiben, wenn ein Versuch scheitert?", [
  ["🧊", "Nichts", "Jeder Versuch startet bei null."], ["📈", "Etwas Stärke", "Man wird von Versuch zu Versuch dauerhaft etwas stärker."], ["🔓", "Neues freigeschaltet", "Neue Figuren oder Gegenstände für die nächsten Versuche."]], { l: 2, if: coreIs("rogue") });
q("raceType", "Rennstil", "Wie fühlt sich das Fahren an?", [
  ["🕹️", "Arcade", "Einfach, schnell, spektakuläre Drifts."], ["🍄", "Kart mit Items", "Power-ups und Waffen auf der Strecke."], ["🏁", "Simulation", "Realistische Physik und Tuning."], ["🚧", "Ausweichen endlos", "Verkehr ausweichen, so weit wie möglich."]], { l: 2, if: coreIs("race") });
q("raceVehicles", "Fahrzeuge", "Womit wird gefahren?", [
  ["🚗", "Autos", ""], ["🏍️", "Motorräder", ""], ["🚤", "Boote", ""], ["✈️", "Flugzeuge", ""], ["🐎", "Tiere", ""], ["🛸", "Fantasie-Fahrzeuge", ""]], { l: 3, t: "m", if: coreIs("race") });
q("sandBuild", "Bausystem", "Wie wird gebaut?", [
  ["🧊", "Blöcke im Raster", "Würfel platzieren und abbauen."], ["🪑", "Freies Platzieren", "Objekte frei drehen und setzen."], ["🌉", "Physikbasiert", "Konstruktionen müssen halten."]], { l: 2, if: coreIs("sand") });
q("advInteract", "Erzählform", "Wie interagiert man im Abenteuer?", [
  ["👆", "Point & Click", "Auf Dinge tippen, um sie zu untersuchen."], ["🚶", "Direkte Steuerung", "Figur frei bewegen."], ["💬", "Dialog-lastig (Visual Novel)", "Viel Text und Entscheidungen."], ["⌨️", "Text-Adventure", "Alles in Textform."]], { l: 2, if: coreIs("adv") });
q("advPuzzles", "Abenteuer-Rätsel", "Welche Rätsel enthält das Abenteuer?", [
  ["🎒", "Inventarrätsel", "Gegenstände kombinieren und benutzen."], ["🏛️", "Umgebungsrätsel", "Mechanismen in der Welt lösen."], ["➖", "Keine", "Fokus nur auf Story."]], { l: 3, t: "m", if: coreIs("adv") });
q("rhyInput", "Rhythmus-Eingabe", "Wie spielt man im Takt?", [
  ["👆", "Noten antippen", "Fallende Noten im richtigen Moment treffen."], ["👉", "Wischen", "Richtungen im Takt."], ["🦘", "Bewegen im Takt", "Figur bewegt sich nur im Beat."], ["🥁", "Instrumente", "Virtuelle Instrumente spielen."]], { l: 2, if: coreIs("rhy") });
q("partyCount", "Minispiel-Anzahl", "Wie viele Minispiele?", [
  ["5️⃣", "Ca. 5", ""], ["🔟", "10–20", ""], ["💯", "50+", ""]], { l: 2, if: coreIs("party") });
q("sportType", "Sportart", "Welche Sportart?", [
  ["⚽", "Fußball", ""], ["🏀", "Basketball", ""], ["🎾", "Tennis / Schläger", ""], ["⛳", "Golf / Minigolf", ""], ["🛹", "Extremsport", ""], ["🥏", "Erfundener Sport", ""]], { l: 2, if: coreIs("sport") });
q("cardMode", "Kartenspiel-Art", "Welche Art Kartenspiel?", [
  ["🧗", "Deckbuilder-Run", "Im Einzelspieler-Lauf das Deck verbessern."], ["🆚", "Sammelkarten-Duell", "Gegen andere mit eigenem Deck."], ["🂡", "Klassisches Kartenspiel", "Bekannte Regeln digital."], ["🧘", "Solitär-ähnlich", "Alleine Karten ordnen."]], { l: 2, if: coreIs("card") });
q("survNeeds", "Bedürfnisse", "Welche Bedürfnisse muss man im Blick behalten?", [
  ["🍖", "Hunger", ""], ["💧", "Durst", ""], ["🔥", "Wärme", ""], ["😴", "Schlaf", ""], ["❤️", "Gesundheit", ""], ["🧠", "Psyche", ""]], { l: 2, t: "m", if: coreIs("surv") });
q("horrorType", "Horror-Art", "Welche Art Grusel?", [
  ["🧠", "Psychologisch", "Unbehagen, Wahrnehmung täuscht."], ["👹", "Verfolgung", "Ein Monster jagt den Spieler."], ["💥", "Jumpscares", "Plötzliche Schreckmomente."], ["🌫️", "Atmosphärisch", "Leise Spannung, kaum Schocks."]], { l: 2, if: coreIs("horror") });
q("structure", "Levelstruktur", "Wie ist die Spielwelt aufgebaut?", [
  ["🗺️", "Einzelne Level mit Levelkarte", "Level nacheinander freischalten."],
  ["🚪", "Hub-Welt mit Toren", "Zentraler Ort, von dem aus Level betreten werden."],
  ["🌍", "Offene Welt", "Eine große, frei begehbare Welt."],
  ["➡️", "Endloser Lauf", "Ein einziger, unendlicher Abschnitt."],
  ["🎲", "Zufällig generierte Runs", "Jeder Durchlauf erzeugt neue Abschnitte."],
  ["🏟️", "Eine Arena / ein Spielfeld", "Immer derselbe Ort, Variation durch Regeln."]]);
q("health", "Treffer", "Was passiert, wenn die Spielfigur getroffen wird?", [
  ["❤️", "Sie hält einiges aus", "Mehrere Treffer, Leben auffüllbar."], ["☝️", "Ein Treffer reicht", "Sofort vorbei, dafür schneller Neustart."],
  ["3️⃣", "Ein paar Versuche", "z. B. 3 Leben, dann Neustart."], ["♾️", "Nichts Schlimmes", "Kurz zurückgesetzt, keine Leben."]], { l: 2 });
q("failPenalty", "Rückschlag", "Wenn man scheitert: Wie weit muss man zurück?", [
  ["⚡", "Fast gar nicht", "Direkt kurz vor der Stelle weiter."], ["🚩", "Ein Stück", "Bis zur Hälfte des Abschnitts."], ["🔄", "Ganz an den Anfang", "Das Level beginnt neu."],
  ["🎲", "Alles von vorn", "Der ganze Durchlauf beginnt neu."]], { l: 2 });
q("extraSystems", "Zusatzsysteme", "Welche zusätzlichen Systeme soll es geben?", [
  ["🔨", "Crafting", "Aus Materialien Gegenstände herstellen."], ["🏠", "Basisbau", "Eigene Basis errichten und ausbauen."], ["💱", "Handel", "Kaufen und verkaufen."], ["🗨️", "Dialogsystem", "Gespräche mit Antwortmöglichkeiten."],
  ["🎯", "Quests & Aufträge", ""], ["📷", "Fotomodus", ""], ["🎰", "Minispiele", "Kleine Nebenspiele im Spiel."], ["➖", "Keine", "", "x"]], { l: 2, t: "m" });

/* ======================================================= */
sec("mechanics", "Mechaniken & Features", "⚙️", "Sammelobjekte, Gegner, Physik und alle kleinen Spielelemente.");
q("collect", "Sammelobjekte", "Was kann man einsammeln?", [
  ["🪙", "Münzen", ""], ["⭐", "Sterne", ""], ["💎", "Edelsteine", ""], ["🃏", "Sammelkarten / Sticker", ""], ["🗝️", "Schlüssel", ""], ["🔮", "Geheime Objekte", "Versteckte Bonus-Gegenstände."], ["➖", "Nichts", "", "x"]],  { t: "m" });
q("powerups", "Power-ups", "Welche Power-ups gibt es?", [
  ["🛡️", "Schild", "Schützt vor einem Treffer."], ["🧲", "Magnet", "Zieht Sammelobjekte an."], ["⚡", "Turbo", "Kurz schneller."], ["🌟", "Unverwundbar", "Kurz unbesiegbar."],
  ["✖️2", "Doppelte Punkte", ""], ["🐌", "Zeitlupe", "Alles außer dem Spieler wird langsamer."], ["➖", "Keine", "", "x"]], { l: 2, t: "m" });
q("enemies", "Gegner", "Wie viele verschiedene Gegner soll es geben?", [
  ["🕊️", "Keine Gegner", "Nur Umgebung und Aufgaben als Herausforderung."], ["🐌", "Wenige einfache", "2–4 Gegnertypen mit klaren Mustern."],
  ["👾", "Viele Typen", "Jeder Gegnertyp hat ein eigenes Verhalten."], ["🐉", "Viele Typen plus Bosse", "Inklusive großer Bosskämpfe."]], { if: a => !has(a, "ideaChallenge", "Gar nichts, es ist entspannt") });
q("bosses", "Bosskämpfe", "Wie sehen Bosskämpfe aus?", [
  ["🏁", "Am Ende jeder Welt", ""], ["🔀", "Mehrere Phasen", "Boss verändert sein Verhalten im Kampf."], ["🧩", "Rätsel-Bosse", "Besiegen durch Umgebung statt durch Schaden."], ["🌟", "Selten, dafür episch", ""]], { l: 3, t: "m", if: iff("enemies", "Viele Typen plus Bosse") });
q("enemyAI", "Gegner-Verhalten", "Wie schlau sollen Gegner wirken?", [
  ["🔁", "Leicht durchschaubar", "Machen immer dasselbe; man lernt sie auswendig."], ["👀", "Aufmerksam", "Bemerken dich und verfolgen dich."],
  ["🧠", "Gerissen", "Arbeiten zusammen und stellen Fallen."]], { l: 3, if: a => a.enemies && a.enemies !== "Keine Gegner" });
q("npcs", "Nicht-Spieler-Figuren", "Welche Figuren leben außer dem Spieler in der Welt?", [
  ["🛒", "Händler", ""], ["❗", "Auftraggeber", ""], ["🏘️", "Bewohner mit Tagesablauf", ""], ["➖", "Keine", "", "x"]], { l: 3, t: "m" });
q("physics", "Bewegung der Dinge", "Wie sollen sich Dinge im Spiel bewegen?", [
  ["🕹️", "Wie im Zeichentrick", "Vorhersehbar und einfach."], ["🌍", "Wie in echt", "Dinge fallen, rollen und prallen realistisch ab."],
  ["🤸", "Wackelig & lustig", "Alles schwabbelt, kippt und fliegt herum."]], { l: 3 });
q("interact", "Interaktive Welt", "Womit kann man in der Welt interagieren?", [
  ["💥", "Zerstörbare Objekte", ""], ["🔘", "Schalter & Türen", ""], ["📦", "Schiebbare Kisten", ""], ["🐾", "Tiere", ""], ["🗣️", "Figuren ansprechen", ""], ["🪜", "Kletterbare Objekte", ""]], { l: 3, t: "m" });
q("secrets", "Geheimnisse", "Wie viele Geheimnisse sind versteckt?", [
  ["🔍", "Viele", "Geheime Räume, Abkürzungen, Bonuslevel."], ["🥚", "Ein paar Easter Eggs", "Kleine Überraschungen."], ["➖", "Keine", ""]], { l: 3 });
q("inventory", "Gepäck", "Wie viele Dinge trägt die Figur mit sich herum?", [
  ["➖", "Gar keine", ""], ["🎒", "Ein paar", "Eine Handvoll Gegenstände zur schnellen Auswahl."], ["🧳", "Eine ganze Tasche voll", "Viele Dinge zum Sortieren."]], { l: 3 });
/* ======================================================= */
sec("controls", "Steuerung", "🕹️", "Wie der Spieler das Spiel bedient.");
q("inputTouch", "Touch-Steuerung", "Wie wird auf dem Touchscreen gesteuert?", [
  ["👆", "Tippen", "Auf Dinge oder den Bildschirm tippen."], ["👉", "Wischen", "Wischgesten für Richtungen."], ["🕹️", "Virtueller Joystick + Buttons", "Steuerkreuz links, Aktionsknöpfe rechts."],
  ["📐", "Neigen", "Gerät kippen (Bewegungssensor)."], ["✋", "Ziehen & Ablegen", "Objekte mit dem Finger verschieben."], ["⏺️", "Halten & Loslassen", "Ein Finger, Dauer zählt."]], { l: 2, t: "m", if: touch });
q("inputDesk", "PC-Bedienung", "Womit spielt man am Computer?", [
  ["⌨️", "Tastatur", ""], ["🖱️", "Maus", ""], ["🖱️⌨️", "Maus und Tastatur", ""], ["🎮", "Gamepad", ""]], { l: 2, t: "m", if: desk });
q("controller", "Gamepad", "Soll man auch mit einem Gamepad spielen können?", [
  ["✅", "Ja", ""], ["❌", "Nein", ""]], { l: 3, if: desk });
q("actions", "Bedienung", "Wie kompliziert darf die Bedienung sein?", [
  ["1️⃣", "Ein Finger reicht", "Nur tippen oder eine Taste."], ["2️⃣", "Ein paar Knöpfe", "2–3 Aktionen."],
  ["🎮", "Wie ein Konsolenspiel", "Viele Knöpfe, aber gut lernbar."], ["🎹", "Profi-Steuerung", "Komplex, für Kenner."]]);
q("controlFeel", "Steuergefühl", "Wie soll sich die Steuerung anfühlen?", [
  ["⚡", "Direkt & knackig", "Sofortige Reaktion ohne Verzögerung."], ["🧈", "Mit Schwung", "Leichte Trägheit beim Starten und Stoppen."], ["🏋️", "Schwer & realistisch", "Gewicht spürbar."]], { l: 3 });
q("haptics", "Vibration", "Soll das Handy vibrieren?", [
  ["📳", "Bei wichtigen Momenten", "Treffer, Erfolge, Fehler."], ["🎚️", "Fein bei jeder Aktion", "Dezentes Feedback bei Tipp, Sprung, Sammeln."], ["➖", "Gar nicht", ""]], { l: 3, if: mobileApp });
/* ======================================================= */
sec("world", "Welt & Setting", "🌍", "Wo und wann spielt dein Spiel?");
q("setting", "Setting", "In welcher Welt spielt dein Spiel?", [
  ["🧚", "Fantasy", "Magie, Burgen, Fabelwesen."], ["🚀", "Sci-Fi / Weltraum", "Raumschiffe, Planeten, Technik."], ["🏙️", "Moderne Stadt", "Heutige Welt, Straßen, Gebäude."],
  ["🌲", "Natur & Wald", ""], ["🐠", "Unterwasser", ""], ["🏰", "Mittelalter", ""], ["☢️", "Endzeit", "Zerstörte Welt nach einer Katastrophe."],
  ["🍭", "Süßigkeiten & Cartoon", "Fantasiewelt aus Essen oder Spielzeug."], ["⚙️", "Steampunk", "Dampfmaschinen und Zahnräder."], ["🤠", "Wilder Westen", ""],
  ["🏛️", "Antike", "Ägypten, Griechenland, Rom."], ["🍽️", "Küche & Restaurant", "Alles rund ums Essen und Kochen."], ["🔷", "Abstrakt", "Formen und Farben statt echter Orte."]]);
q("biomes", "Gebiete", "Welche Gebiete gibt es?", [
  ["🌳", "Wald", ""], ["🏜️", "Wüste", ""], ["❄️", "Schnee & Eis", ""], ["🌋", "Vulkan", ""], ["🕳️", "Höhlen", ""], ["🏢", "Stadt", ""],
  ["🏖️", "Strand", ""], ["🪐", "Weltall", ""], ["🐸", "Sumpf", ""], ["☁️", "Wolken & Himmel", ""], ["🏠", "Innenräume", ""]], { t: "m" });
q("worldSize", "Weltgröße", "Wie groß ist die begehbare Welt?", [
  ["🏘️", "Klein", "In wenigen Minuten durchquert."], ["🗺️", "Mittel", "Mehrere Gebiete, Schnellreise hilfreich."], ["🌏", "Riesig", "Stundenlanges Erkunden."]], { l: 2, if: iff("structure", "Offene Welt", "Hub-Welt mit Toren") });
q("dayNight", "Tag & Nacht", "Gibt es einen Tag-Nacht-Wechsel?", [
  ["➖", "Nein", ""], ["🌗", "Nur optisch", "Licht ändert sich, Gameplay nicht."], ["🌙", "Mit Auswirkungen", "Nachts andere Gegner, Läden zu usw."]], { l: 3 });
q("weather", "Wetter", "Gibt es Wetter?", [
  ["➖", "Nein", ""], ["🌧️", "Nur optisch", ""], ["⛈️", "Mit Auswirkungen", "Regen macht rutschig, Wind verweht usw."]], { l: 3 });
q("realPlace", "Echter Ort", "Basiert die Welt auf einem echten Ort?", [
  ["🪄", "Komplett erfunden", ""], ["🗺️", "Inspiriert von echten Orten", ""], ["📍", "Nachbau eines echten Ortes", "z. B. das eigene Restaurant, die eigene Stadt."]], { l: 3 });
q("travel", "Fortbewegung", "Wie bewegt man sich durch die Welt?", [
  ["🚶", "Zu Fuß", ""], ["🚲", "Fahrzeuge", ""], ["🐴", "Reittiere", ""], ["⚡", "Schnellreise", ""], ["🕊️", "Fliegen", ""], ["🌀", "Teleporter", ""]], { l: 3, t: "m", if: iff("structure", "Offene Welt", "Hub-Welt mit Toren") });
q("population", "Belebtheit", "Wie belebt ist die Welt?", [
  ["🏜️", "Leer", "Fast niemand außer dem Spieler."], ["🧍", "Ein paar Figuren", ""], ["🐦", "Voller Leben", "Tiere, Passanten, Bewegung im Hintergrund."]], { l: 4 });

/* ======================================================= */
sec("story", "Story & Figuren", "📖", "Geschichte, Spielfigur und Charaktere.");
q("storyAmount", "Story-Umfang", "Wie viel Geschichte hat das Spiel?", [
  ["➖", "Keine Story", "Reines Gameplay."], ["🎞️", "Kurzes Intro", "Ein paar Sätze oder Bilder zum Start."],
  ["📗", "Leichte Geschichte", "Roter Faden zwischen den Leveln."], ["📚", "Story im Mittelpunkt", "Die Geschichte treibt das Spiel an."]]);
q("storyTell", "Erzählweise", "Wie wird die Geschichte erzählt?", [
  ["🎬", "Zwischensequenzen", ""], ["💬", "Textboxen", ""], ["🏚️", "Durch die Umgebung", "Details in der Welt erzählen."],
  ["🗯️", "Comic-Bilder", ""], ["📔", "Tagebücher & Notizen", ""]], { l: 3, t: "m", if: hasStory });
q("choices", "Entscheidungen", "Beeinflusst der Spieler die Geschichte?", [
  ["➡️", "Linear", "Feste Geschichte."], ["🔀", "Kleine Entscheidungen", "Ändern Dialoge, nicht das Ende."], ["🌳", "Verzweigt mit mehreren Enden", ""]], { l: 3, if: hasStory });
q("hero", "Spielfigur", "Wer oder was ist die Spielfigur?", [
  ["🧑", "Mensch", ""], ["🦊", "Tier", ""], ["🤖", "Roboter", ""], ["🐲", "Fantasiewesen", ""], ["⚪", "Objekt / Form", "z. B. Ball, Würfel, Pizza."],
  ["🚗", "Fahrzeug", ""], ["🧑‍🎨", "Selbst erstellter Avatar", ""], ["🫥", "Keine sichtbare Figur", "z. B. Puzzle oder Ego-Sicht."]]);
q("heroGender", "Geschlecht der Figur", "Welches Geschlecht hat die Hauptfigur?", [
  ["👧", "Weiblich", ""], ["👦", "Männlich", ""], ["🧑", "Neutral / keins", ""], ["🔀", "Wählbar", ""]], { l: 3, if: iff("hero", "Mensch", "Tier", "Fantasiewesen", "Roboter") });
q("heroPersonality", "Charakter der Figur", "Welche Persönlichkeit hat die Spielfigur?", [
  ["🤐", "Stumm", "Spieler projiziert sich hinein."], ["😜", "Witzig", ""], ["🦁", "Mutig", ""], ["🙃", "Tollpatschig", ""], ["😎", "Cool", ""], ["🥺", "Schüchtern", ""]], { l: 3 });
q("custom", "Anpassung", "Was kann der Spieler an seiner Figur anpassen?", [
  ["👕", "Outfits & Skins", ""], ["🎨", "Farben", ""], ["🙂", "Gesicht & Körper", ""], ["🪖", "Sichtbare Ausrüstung", ""], ["🏷️", "Name", ""], ["➖", "Nichts", "", "x"]], { l: 2, t: "m" });
q("roster", "Spielbare Figuren", "Wie viele spielbare Figuren gibt es?", [
  ["1️⃣", "Eine feste", ""], ["🔢", "Mehrere zur Auswahl", "Mit unterschiedlichen Fähigkeiten."], ["🔁", "Team, jederzeit wechselbar", ""]], { l: 3 });
q("companion", "Begleiter", "Hat die Spielfigur einen Begleiter?", [
  ["➖", "Nein", ""], ["🐕", "Tier", ""], ["🧚", "Helfer-Wesen", "Gibt Tipps."], ["👥", "KI-Gruppe", ""], ["🎙️", "Erzähler", "Kommentiert das Geschehen."]], { l: 3 });
q("villain", "Gegenspieler", "Wer ist der Gegenspieler?", [
  ["➖", "Keiner", ""], ["😈", "Klassischer Bösewicht", ""], ["🌗", "Grauzone", "Mit nachvollziehbaren Motiven."], ["🌪️", "Naturgewalt", ""], ["🪞", "Der Spieler selbst", "Innere Konflikte."]], { l: 3, if: hasStory });
q("humor", "Humor-Art", "Welche Art Humor?", [
  ["➖", "Kein Humor", ""], ["🔤", "Wortwitz", ""], ["🍌", "Slapstick", ""], ["🪞", "Selbstironisch & Meta", ""], ["🖤", "Schwarzer Humor", ""]], { l: 3, if: iff("feeling", "Lachen & Spaß") });

/* ======================================================= */
sec("graphics", "Grafik & Kunststil", "🎨", "Wie dein Spiel aussieht.");
q("dimension", "Dimension", "2D oder 3D?", [
  [ART.d2, "2D", "Flache Grafik, Sprites."], [ART.d25, "2.5D", "3D-Grafik, aber Spiel auf einer Ebene."], [ART.d3, "3D", "Volle räumliche Welt."]]);
q("artStyle", "Kunststil", "Welcher Grafikstil?", [
  [ART.pixel, "Pixel-Art", "Retro-Look aus sichtbaren Pixeln."], [ART.cartoon, "Cartoon / Comic", "Kräftige Konturen, übertriebene Formen."],
  [ART.lowpoly, "Low-Poly", "Kantige 3D-Formen mit flachen Farbflächen."], [ART.real, "Realistisch", "Fotonah, echte Materialien und Licht."],
  [ART.hand, "Handgezeichnet", "Wie Buntstift oder Aquarell."], [ART.flat, "Flat & minimalistisch", "Einfache Formen, klare Farben."],
  [ART.voxel, "Voxel", "Alles aus kleinen Würfeln."], [ART.anime, "Anime", "Japanischer Zeichentrick-Stil."],
  [ART.neon, "Neon / Synthwave", "Leuchtende Linien auf dunklem Grund."], [ART.paper, "Papier & Bastel", "Wie ausgeschnittenes Papier mit Schatten."]], { wide: 1 });
q("palette", "Farbpalette", "Welche Farben dominieren?", [
  ["pal:#FF595E,#FFCA3A,#8AC926,#1982C4,#6A4C93", "Bunt & knallig", ""], ["pal:#FFD6E0,#FFEFB5,#C1F0DB,#C7D9FF,#E3D1FF", "Pastell", ""],
  ["pal:#0B0C10,#1F2833,#45525E,#66737F,#8A1C1C", "Dunkel & düster", ""], ["pal:#6B4F2A,#A47148,#D6B88D,#7C8C4A,#3F5A36", "Natürlich & erdig", ""],
  ["pal:#0D0221,#FF2A6D,#05D9E8,#D1F7FF,#F9C80E", "Neon", ""], ["pal:#111111,#555555,#999999,#DDDDDD,#FFFFFF", "Schwarz-Weiß", ""],
  ["pal:#0F380F,#306230,#8BAC0F,#9BBC0F,#CADC9F", "Retro begrenzt", "Wenige Farben wie alte Konsolen."]], { l: 2 });
q("effects", "Effekte", "Welche visuellen Effekte gibt es?", [
  ["✨", "Partikel", "Funken, Staub, Glitzer."], ["📳", "Bildschirmwackeln", ""], ["💡", "Leuchten & Glow", ""], ["🎉", "Konfetti bei Erfolgen", ""],
  ["💥", "Explosionen", ""], ["🌫️", "Nebel & Tiefenunschärfe", ""], ["➖", "Minimal", "", "x"]], { l: 3, t: "m" });
q("assets", "Eigenes Material", "Hast du eigene Bilder, Fotos oder Zeichnungen, die ins Spiel sollen?", [
  ["✏️", "Ja, eigene Zeichnungen", ""], ["📷", "Ja, Fotos", "z. B. vom eigenen Laden, Logo, Produkten."], ["🎨", "Nein, die KI soll alles machen", ""], ["👩‍🎨", "Ein Künstler macht das", ""]], { l: 2, t: "m" });
/* ======================================================= */
sec("camera", "Kamera & Perspektive", "🎥", "Aus welcher Sicht man spielt.");
q("perspective", "Perspektive", "Aus welcher Sicht wird gespielt?", [
  [ART.side, "Seitenansicht", "Klassisch von der Seite."], [ART.top, "Von oben", "Draufsicht (Top-Down)."],
  [ART.iso, "Isometrisch", "Schräg von oben, wie ein Diorama."], [ART.third, "Third-Person", "Kamera hinter der Figur."],
  [ART.first, "Ego-Perspektive", "Aus den Augen der Figur."], [ART.fixed, "Fester Bildschirm", "Alles passt auf einen Screen."]]);
/* ======================================================= */
sec("audio", "Sound & Musik", "🎵", "Wie dein Spiel klingt.");
q("music", "Musikstil", "Welche Musik passt?", [
  ["👾", "Chiptune (8-Bit)", ""], ["🎻", "Orchester", ""], ["🎛️", "Elektronisch", ""], ["☕", "Lo-Fi / Chill", ""], ["🎸", "Rock / Metal", ""],
  ["🪕", "Akustisch / Folk", ""], ["🎷", "Jazz / Lounge", ""], ["🎶", "Fröhlich-verspielt", "Kinderliedartig, Xylophon, Ukulele."], ["🔇", "Keine Musik", ""]]);
q("musicDyn", "Musikwechsel", "Wie verhält sich die Musik?", [
  ["🔁", "Ein Stück in Schleife", ""], ["🗺️", "Eigenes Stück pro Bereich", ""], ["🎚️", "Dynamisch", "Wird intensiver bei Gefahr."], ["📻", "Spieler wählt", ""]], { l: 3 });
q("sfx", "Soundeffekte", "Wie klingen die Soundeffekte?", [
  ["📟", "Retro-Piepser", ""], ["🎈", "Cartoon", "Boing, Plopp, Quietsch."], ["🔊", "Realistisch", ""], ["🫧", "Sanft & minimal", ""]], { l: 2 });
q("voice", "Stimmen", "Gibt es Stimmen?", [
  ["➖", "Keine", ""], ["😮", "Laute & Ausrufe", "Kurze Geräusche wie 'Hey!' oder 'Juhu!'."], ["🗣️", "Fantasiesprache", ""], ["🎙️", "Volle Sprachausgabe", ""], ["📢", "Nur Erzähler", ""]], { l: 3 });
/* ======================================================= */
sec("progression", "Fortschritt & Belohnung", "🏆", "Was den Spieler dranbleiben lässt.");
q("progress", "Fortschritts-Arten", "Wie macht der Spieler Fortschritt?", [
  ["🔓", "Neue Level freischalten", ""], ["⬆️", "Erfahrung & Level-Ups", ""], ["🪄", "Neue Fähigkeiten", ""], ["👕", "Kosmetik", ""],
  ["📖", "Story-Kapitel", ""], ["🏅", "Highscore verbessern", ""], ["🏗️", "Basis oder Laden wächst", ""]], { t: "m" });
q("upgrades", "Upgrades", "Wie werden Dinge verbessert?", [
  ["➖", "Gar nicht", ""], ["📶", "Einfache Stufen", "Stufe 1 → 2 → 3."], ["🌳", "Fähigkeitenbaum", "Verzweigte Entscheidungen."], ["🛡️", "Ausrüstung mit Werten", ""]], { l: 2 });
q("achievements", "Erfolge", "Gibt es Erfolge (Achievements)?", [
  ["➖", "Nein", ""], ["🏅", "Im Spiel", "Eigene Erfolgsliste."], ["🍏", "Plattform-Erfolge", "Game Center, Google Play Games, Steam."]], { l: 2 });
q("leaderboard", "Ranglisten", "Gibt es Ranglisten?", [
  ["➖", "Keine", ""], ["📱", "Lokal", "Nur auf dem Gerät."], ["👫", "Freunde", ""], ["🌍", "Weltweit", ""], ["📅", "Wöchentlich zurückgesetzt", ""]], { l: 2 });
q("rewardPace", "Belohnungsrhythmus", "Wie oft gibt es Belohnungen?", [
  ["🍬", "Ständig kleine", ""], ["🎁", "Regelmäßig mittlere", ""], ["🏆", "Selten, dafür groß", ""]], { l: 3 });
q("daily", "Tägliche Anreize", "Gibt es Gründe, täglich zu spielen?", [
  ["➖", "Nein", "Kein Druck, täglich zu spielen."], ["🎁", "Tägliche Belohnung", ""], ["📋", "Tägliche Aufgaben", ""], ["🔥", "Serien-Bonus", "Mehr Belohnung für Tage am Stück."]], { l: 3, t: "m" });
q("levelRating", "Level-Bewertung", "Wie wird ein Level bewertet?", [
  ["⭐", "1–3 Sterne", ""], ["⏱️", "Bestzeit", ""], ["💯", "Prozent", ""], ["➖", "Gar nicht", ""]], { l: 3 });
/* ======================================================= */
sec("difficulty", "Schwierigkeit & Balancing", "⚖️", "Wie schwer das Spiel ist und wie es sich anpasst.");
q("diff", "Grundschwierigkeit", "Wie schwer ist das Spiel?", [
  ["🍼", "Sehr leicht", "Jeder schafft es."], ["🙂", "Leicht", ""], ["😐", "Mittel", ""], ["😤", "Schwer", ""], ["💀", "Bockschwer", "Nur für Profis."]]);
q("diffModes", "Schwierigkeitsgrade", "Kann man die Schwierigkeit einstellen?", [
  ["1️⃣", "Eine feste Stufe", ""], ["🎚️", "Wählbar", "Leicht, Mittel, Schwer."], ["🤖", "Passt sich automatisch an", "Wird leichter, wenn man oft scheitert."], ["🧩", "Einzelne Hilfen", "Z. B. Unverwundbarkeit oder Zeitlupe einzeln einschaltbar."]], { l: 2 });
q("failHelp", "Hilfe bei Frust", "Was passiert, wenn man oft scheitert?", [
  ["💡", "Tipp anzeigen", ""], ["⏭️", "Level überspringen", ""], ["🛡️", "Kleine Erleichterung", "Etwas mehr Leben oder Zeit."], ["➖", "Nichts", "", "x"]], { l: 3, t: "m" });
q("skillLuck", "Können vs. Glück", "Was entscheidet über Erfolg?", [
  ["🎯", "Nur Können", ""], ["🎯🎲", "Meist Können", ""], ["⚖️", "Halb-halb", ""], ["🎲", "Meist Glück", ""]], { l: 3 });
/* ======================================================= */
sec("multiplayer", "Multiplayer & Social", "🌐", "Allein oder gemeinsam?");
q("mp", "Spielmodi", "Wie viele Menschen spielen zusammen?", [
  ["🧍", "Nur Einzelspieler", "", "x"], ["🛋️", "Lokal am selben Bildschirm", "Gemeinsam an einem Gerät."], ["📶", "Lokal im selben WLAN", ""],
  ["🌐", "Online", "Über das Internet in Echtzeit."], ["📨", "Asynchron (zeitversetzt)", "Züge oder Geister-Läufe, nicht gleichzeitig."]], { t: "m" });
q("mpKind", "Zusammenspiel", "Spielt man mit- oder gegeneinander?", [
  ["🤝", "Miteinander (Koop)", ""], ["🆚", "Gegeneinander (PvP)", ""], ["👥", "Teams gegeneinander", ""], ["🔀", "Beides", ""]], { if: mpAny });
q("mpCount", "Spielerzahl", "Wie viele Spieler gleichzeitig?", [
  ["2️⃣", "2", ""], ["4️⃣", "2–4", ""], ["8️⃣", "4–8", ""], ["👥", "8–32", ""], ["🏟️", "100+", ""]], { l: 2, if: mpAny });
q("splitScreen", "Bildschirmaufteilung", "Wie teilen sich lokale Spieler den Bildschirm?", [
  ["🖼️", "Gemeinsames Bild", "Alle auf einem Bild."], ["◫", "Geteilter Bildschirm", ""], ["🔁", "Abwechselnd", "Gerät weitergeben."]], { l: 3, if: iff("mp", "Lokal am selben Bildschirm") });
q("matchmaking", "Mitspieler", "Mit wem spielt man online?", [
  ["🔑", "Nur mit Freunden", "Per Einladungscode oder Link."], ["🎲", "Mit Fremden", "Zufällige Mitspieler."], ["🔀", "Beides", ""]], { l: 2, if: online });
q("bots", "Bots", "Füllen Computergegner freie Plätze?", [
  ["🤖", "Ja", ""], ["➖", "Nein", ""]], { l: 3, if: mpAny });
q("pvpFair", "Fairness", "Wie fair ist das Gegeneinander?", [
  ["⚖️", "Alle gleich stark", ""], ["🛡️", "Ausrüstung zählt", ""], ["🎚️", "Handicap-System", "Stärkere bekommen Nachteile."]], { l: 3, if: pvp });
q("comms", "Kommunikation", "Wie kommunizieren Spieler?", [
  ["➖", "Gar nicht", "", "x"], ["😀", "Emotes & Schnellnachrichten", "Vordefinierte Nachrichten, sicher für Kinder."], ["⌨️", "Text-Chat mit Filter", ""], ["🎙️", "Sprach-Chat", ""]], { l: 2, t: "m", if: online });
q("social", "Soziale Funktionen", "Welche sozialen Funktionen gibt es?", [
  ["👫", "Freundesliste", ""], ["📤", "Ergebnisse teilen", "Screenshot oder Link mit Punktzahl."], ["🛡️", "Clans / Gilden", ""], ["🎁", "Geschenke senden", ""], ["➖", "Keine", "", "x"]], { l: 2, t: "m" });
/* ======================================================= */
sec("ui", "Menüs & Oberfläche", "🧭", "Bildschirmanzeigen, Menüs und Einstieg.");
q("uiStyle", "Oberflächen-Stil", "Wie sehen Menüs und Anzeigen aus?", [
  ["▫️", "Minimal", "Wenig, klar, unaufdringlich."], ["🎈", "Verspielt", "Runde Formen, Hüpf-Animationen."], ["🛰️", "Futuristisch", ""],
  ["🌍", "In der Welt", "Anzeigen sind Teil der Spielwelt (z. B. Schild statt Menü)."], ["📜", "Klassisch Fantasy", "Holz, Pergament, Gold."], ["👾", "Retro-Pixel", ""]], { });
q("hud", "Bildschirm-Anzeigen", "Wie voll darf der Bildschirm beim Spielen sein?", [
  ["▫️", "Fast leer", "Nur das Allernötigste."], ["🔢", "Ein paar Anzeigen", "z. B. Punkte und Leben."], ["📊", "Alles im Blick", "Karte, Ziele, Werte, alles da."]], { l: 2 });
q("font", "Schrift", "Welche Schriftart passt?", [
  ["🅰️", "Rund & freundlich", ""], ["👾", "Pixel-Schrift", ""], ["📜", "Elegant mit Serifen", ""], ["🔤", "Modern & klar", ""], ["✍️", "Handschrift", ""], ["💥", "Comic", ""]], { l: 3 });
q("buttons", "Button-Form", "Wie sehen Buttons aus?", [
  ["💊", "Rund & weich", ""], ["⬛", "Eckig & kantig", ""], ["✏️", "Handgezeichnet", ""], ["🔲", "Mit 3D-Kante", "Wirken drückbar."]], { l: 4 });

/* ======================================================= */
sec("monetization", "Monetarisierung", "💰", "Ob und wie das Spiel Geld verdient.");
q("monet", "Geschäftsmodell", "Wie soll das Spiel (ggf.) Geld verdienen?", [
  ["🎁", "Komplett kostenlos", "Keine Werbung, keine Käufe."], ["💶", "Einmalkauf (Premium)", "Einmal bezahlen, alles enthalten."],
  ["📺", "Kostenlos mit Werbung", ""], ["🛒", "Kostenlos mit In-App-Käufen", ""], ["📺🛒", "Werbung + In-App-Käufe", ""],
  ["🔁", "Abo", "Monatlicher Beitrag."], ["📣", "Marketing-Spiel (gratis)", "Kostenlos, wirbt für ein Geschäft oder eine Marke."]]);
q("price", "Preis", "Was soll das Spiel kosten?", [
  ["🪙", "0,99 €", ""], ["💶", "2,99 €", ""], ["💶", "4,99 €", ""], ["💶", "9,99 €", ""], ["💰", "19,99 € oder mehr", ""]], { l: 2, if: iff("monet", "Einmalkauf (Premium)") });
q("adTypes", "Werbeformen", "Welche Werbung gibt es?", [
  ["🎥", "Freiwillige Belohnungsvideos", "Video ansehen für Bonus."], ["⏸️", "Zwischen Leveln (Interstitial)", ""], ["🏷️", "Banner", ""], ["🚫", "Werbefrei per Kauf", ""]], { l: 2, t: "m", if: ads });
q("adFreq", "Werbe-Häufigkeit", "Wie oft kommt Werbung zwischen Leveln?", [
  ["2️⃣", "Alle 2 Level", ""], ["5️⃣", "Alle 5 Level", ""], ["⏰", "Höchstens alle 5 Minuten", ""], ["🐢", "Selten", ""]], { l: 3, if: iff("adTypes", "Zwischen Leveln (Interstitial)") });
q("iapTypes", "In-App-Käufe", "Was kann man kaufen?", [
  ["👕", "Kosmetik", ""], ["💎", "Währungspakete", ""], ["⏩", "Zeitersparnis", ""], ["🎁", "Starterpaket", ""], ["🗺️", "Inhalte (Level, Welten)", ""], ["🎟️", "Saison-Pass", ""], ["🚫", "Werbefrei", ""]], { l: 2, t: "m", if: iap });
q("p2w", "Kaufvorteile", "Darf man sich Vorteile kaufen?", [
  ["⚖️", "Nein, nur Optik", "Keine spielerischen Vorteile durch Geld."], ["🤏", "Etwas Zeitersparnis", ""], ["💪", "Ja", ""]], { l: 2, if: iap });
q("lootbox", "Zufallskäufe", "Gibt es Käufe mit zufälligem Inhalt?", [
  ["🚫", "Nein", ""], ["🎰", "Ja, mit Wahrscheinlichkeiten", "Gewinnchancen werden offen angezeigt."]], { l: 3, if: iap });
q("sub", "Abo-Inhalt", "Was bekommen Abonnenten?", [
  ["🔓", "Alles freigeschaltet", ""], ["📅", "Monatliche neue Inhalte", ""], ["⭐", "Bonus-Vorteile", ""]], { l: 3, if: iff("monet", "Abo") });
q("brand", "Marken-Einbindung", "Wie wird die Marke eingebunden?", [
  ["🏷️", "Logo & Farben", ""], ["🎟️", "Gutschein als Belohnung", "z. B. Rabattcode bei Highscore."], ["🍕", "Produkte als Spielobjekte", ""],
  ["🔗", "Link zur Website", ""], ["📋", "Speisekarte / Angebot", ""], ["📍", "Ort & Öffnungszeiten", ""]], { l: 2, t: "m", if: or(iff("monet", "Marketing-Spiel (gratis)"), iff("purpose", "Marketing für Firma/Verein")) });
q("revenue", "Umsatzziel", "Wie viel soll das Spiel einbringen?", [
  ["🪙", "Taschengeld", ""], ["💶", "Nebenverdienst", ""], ["💰", "Lebensunterhalt", ""]], { l: 4, if: or(ads, iap, iff("monet", "Einmalkauf (Premium)", "Abo")) });

/* ======================================================= */
sec("access", "Barrierefreiheit", "♿", "Damit möglichst viele mitspielen können.");
q("a11yVis", "Hilfen: Sehen", "Welche Hilfen fürs Sehen?", [
  ["🎨", "Farbenblind-Modus", "Infos nie nur über Farbe."], ["🔠", "Größere Schrift", ""], ["🌗", "Hoher Kontrast", ""], ["🔊", "Screenreader für Menüs", ""], ["➖", "Keine", "", "x"]],  { t: "m" });
q("a11yMotor", "Hilfen: Bedienung", "Welche Hilfen für die Bedienung?", [
  ["✋", "Einhändig spielbar", ""], ["🐌", "Spieltempo regelbar", ""], ["⏺️", "Halten statt Hämmern", "Kein schnelles Wiederholtes Drücken nötig."], ["🎯", "Größere Trefferflächen", ""], ["➖", "Keine", "", "x"]], { l: 3, t: "m" });
q("a11yCog", "Hilfen: Verständnis", "Welche Hilfen fürs Verständnis?", [
  ["🌈", "Weniger Effekte", "Keine Blitze, weniger Bewegung (Epilepsie)."], ["🧭", "Ziel jederzeit abrufbar", ""], ["🐢", "Kein Zeitdruck einstellbar", ""], ["📝", "Einfache Sprache", ""], ["➖", "Keine", "", "x"]], { l: 3, t: "m" });
q("a11yHear", "Hilfen: Hören", "Welche Hilfen fürs Hören?", [
  ["💬", "Untertitel", ""], ["👁️", "Sounds sichtbar machen", "Wichtige Geräusche als Symbol anzeigen."], ["➖", "Keine", "", "x"]], { l: 4, t: "m" });

/* ======================================================= */
sec("data", "Speichern & Datenschutz", "💾", "Spielstände, Konten und persönliche Daten.");
q("save", "Speichern", "Wie wird gespeichert?", [
  ["🤖", "Automatisch", ""], ["💾", "Speicherpunkte", ""], ["🗂️", "Mehrere Spielstände", ""], ["➖", "Gar nicht", "Jede Runde startet neu."]], { });
q("saveWhere", "Weiterspielen", "Soll man auf einem anderen Gerät weiterspielen können?", [
  ["📱", "Nein, reicht auf einem Gerät", ""], ["☁️", "Ja, unbedingt", "z. B. nach Handywechsel."]], { l: 2, if: a => a.save !== "Gar nicht" });
q("account", "Benutzerkonto", "Braucht man ein Konto?", [
  ["➖", "Kein Konto", ""], ["👤", "Gast plus optionales Konto", ""], ["📧", "Login Pflicht", "Per E-Mail."], ["🍏", "Mit Apple/Google anmelden", ""]], { l: 2 });
q("analytics", "Statistik", "Möchtest du sehen, wie viele Leute spielen und wo sie aufhören?", [
  ["📊", "Ja, anonym", "Nur Zahlen, keine Personen."], ["🚫", "Nein", "Keinerlei Daten sammeln."]], { l: 3 });
/* ======================================================= */
sec("tech", "Technik & Umsetzung", "🛠️", "Womit und wie die KI das Spiel baut.");
q("devSkill", "Programmierkenntnisse", "Wie gut kannst du programmieren?", [
  ["🐣", "Gar nicht", "Die KI muss jeden Schritt erklären."], ["🌱", "Anfänger", ""], ["🌿", "Fortgeschritten", ""], ["🌳", "Profi", ""]]);
q("workflow", "Zusammenarbeit", "Wie soll die KI mit dir zusammenarbeiten?", [
  ["⚡", "Alles auf einmal", "Komplett bauen, dann schaue ich drüber."], ["🪜", "Schritt für Schritt", "Nach jedem Teil fragen, ob es passt."], ["🧪", "Erst eine Probe", "Zuerst eine kleine spielbare Version, dann ausbauen."]], { l: 2 });
q("timeline", "Zeitrahmen", "Bis wann soll das Spiel fertig sein?", [
  ["⏰", "Ein Wochenende", ""], ["🗓️", "Ein Monat", ""], ["📆", "Drei Monate", ""], ["📅", "Ein Jahr oder länger", ""]], { l: 3 });
q("budget", "Budget", "Wie viel Geld kannst du ausgeben?", [
  ["0️⃣", "0 €", ""], ["💶", "Bis 100 €", ""], ["💶", "Bis 1.000 €", ""], ["💰", "Mehr", ""]], { l: 3 });
q("team", "Team", "Wer arbeitet mit?", [
  ["🧍", "Ich allein", ""], ["👥", "2–3 Leute", ""], ["🏢", "Kleines Team", ""]], { l: 3 });
/* ======================================================= */
sec("launch", "Veröffentlichung & Marketing", "🚀", "App Store, Play Store, Web und wie Leute davon erfahren.");
q("launchWhere", "Veröffentlichung", "Wo soll das Spiel erscheinen?", [
  ["🔒", "Nur privat", "", "x"], ["🌐", "Eigene Website", ""], ["🎮", "itch.io", "Kostenlose Indie-Plattform."], ["🍎", "Apple App Store", ""],
  ["▶️", "Google Play", ""], ["🚂", "Steam", ""], ["🕹️", "Konsolen-Stores", ""], ["🧩", "Web-Spieleportale", "z. B. CrazyGames, Poki."]], { t: "m" });
q("devAccounts", "Entwicklerkonten", "Hast du schon Entwicklerkonten?", [
  ["✅", "Beide", ""], ["🍎", "Nur Apple", ""], ["▶️", "Nur Google", ""], ["➖", "Noch keine", "Die KI soll die Einrichtung erklären."]], { l: 2, if: appStores, h: "Apple Developer Program: 99 $ pro Jahr. Google Play Console: 25 $ einmalig." });
q("storeCat", "Store-Kategorie", "In welcher Store-Kategorie erscheint das Spiel?", [
  ["⚔️", "Action", ""], ["🗺️", "Abenteuer", ""], ["🧩", "Puzzle", ""], ["🙂", "Casual", ""], ["🎓", "Lernspiele", ""], ["♟️", "Strategie", ""],
  ["🏗️", "Simulation", ""], ["🧸", "Kinder", "Strengere Regeln bei Werbung und Datenschutz."], ["👨‍👩‍👧", "Familie", ""], ["🏎️", "Rennen", ""], ["⚽", "Sport", ""], ["🧙", "Rollenspiel", ""]], { l: 2, if: stores });
q("storeAssets", "Store-Hilfe", "Soll die KI dir auch beim Store-Auftritt helfen?", [
  ["🖼️", "Icon & Bilder", ""], ["📝", "Texte & Beschreibung", ""], ["🔑", "Suchbegriffe", "Damit man das Spiel findet."], ["📄", "Datenschutz & Impressum", ""], ["🧭", "Anleitung zum Hochladen", "Schritt für Schritt erklärt."]], { l: 2, t: "m", if: publicLaunch });
q("iconStyle", "Icon-Stil", "Wie soll das App-Icon aussehen?", [
  ["😀", "Gesicht der Figur", ""], ["🔤", "Logo-Schriftzug", ""], ["🎬", "Spielszene", ""], ["🔣", "Einfaches Symbol", ""]], { l: 3, if: publicLaunch });
q("storeTone", "Store-Text-Ton", "Wie sollen die Store-Texte klingen?", [
  ["😄", "Lustig", ""], ["🛡️", "Episch", ""], ["👔", "Sachlich", ""], ["🧸", "Kindgerecht", ""]], { l: 3, if: publicLaunch });
q("beta", "Testphase", "Wie wird vor dem Start getestet?", [
  ["➖", "Gar nicht", ""], ["👨‍👩‍👧", "Familie & Freunde", ""], ["🧪", "Store-Testkanäle", "TestFlight bzw. geschlossener Test bei Google Play."], ["🌍", "Offene Beta", ""], ["🇳🇿", "Testmarkt", "Erst in einem kleinen Land veröffentlichen."]], { l: 2, if: publicLaunch });
q("rateAsk", "Bewertungsbitte", "Soll das Spiel um eine Store-Bewertung bitten?", [
  ["⭐", "Ja, nach einem Erfolg", "Systemdialog nach einem positiven Moment."], ["➖", "Nein", ""]], { l: 3, if: appStores });
q("marketing", "Marketing", "Wie sollen Leute vom Spiel erfahren?", [
  ["📱", "TikTok & Instagram", ""], ["▶️", "YouTube-Entwicklertagebuch", ""], ["💬", "Discord & Reddit", ""], ["📰", "Presse & Influencer", ""],
  ["🔳", "Vor Ort", "Flyer, QR-Codes, Plakate."], ["💸", "Bezahlte Werbung", ""], ["➖", "Gar nicht", "", "x"]], { l: 2, t: "m", if: publicLaunch });
q("launchTiming", "Startzeitpunkt", "Wann soll das Spiel erscheinen?", [
  ["🚀", "Sobald es fertig ist", ""], ["📅", "Fester Termin", ""], ["🎄", "Zu einem Anlass", "Ferien, Feiertag, Jubiläum."]], { l: 3, if: publicLaunch });
/* ======================================================= */
sec("liveops", "Updates & Community", "🔄", "Was nach dem Start passiert.");
q("updates", "Updates", "Wie geht es nach dem Start weiter?", [
  ["✅", "Fertig ist fertig", ""], ["🐞", "Nur Fehlerbehebungen", ""], ["➕", "Regelmäßig neue Inhalte", ""], ["📅", "Saisons & Events", ""]], { });
q("events", "Events", "Welche Events soll es geben?", [
  ["🎃", "Jahreszeiten-Events", "Halloween, Weihnachten, Ostern."], ["📆", "Wochen-Herausforderungen", ""], ["⏳", "Zeitlich begrenzte Items", ""], ["🏆", "Turniere", ""]], { l: 3, t: "m", if: iff("updates", "Regelmäßig neue Inhalte", "Saisons & Events") });
q("community", "Community", "Wo trifft sich die Community?", [
  ["💬", "Discord", ""], ["📝", "Feedback im Spiel", ""], ["📱", "Social Media", ""], ["➖", "Nirgends", "", "x"]], { l: 3, t: "m" });
q("ugc", "Spieler-Inhalte", "Können Spieler eigene Inhalte erstellen?", [
  ["➖", "Nein", ""], ["🛠️", "Ja, nur für sich", ""], ["🌐", "Ja, und online teilen", "Mit Moderation."]], { l: 3 });
q("push", "Push-Nachrichten", "Soll das Spiel Benachrichtigungen senden?", [
  ["➖", "Nie", ""], ["🔔", "Nur wichtige", "z. B. 'Deine Energie ist wieder voll'."], ["📣", "Regelmäßig", ""]], { l: 3, if: mobileApp });
/* ======================================================= */
sec("thoughts", "Deine Gedanken", "💭", "Erst einmal alles aufschreiben, was dir zu deiner Idee einfällt.");
q("thoughts", "Meine Gedanken", "Schreib erst einmal alles auf, was dir zu deiner Idee einfällt.", [], { t: "t", area: 1, noAi: true,
  ph: "Egal wie ungeordnet: Worum geht es? Wer benutzt es? Was soll man damit machen? Was wäre richtig cool? Was auf keinen Fall?",
  h: "Das ist die Grundlage für alles Weitere. Daraus werden Antworten erkannt und vorausgefüllt, und deine Gedanken stehen ganz oben im KI-Bauauftrag." });

/* ======================================================= */
sec("final", "Zum Schluss", "📝", "Alles, was dir sonst noch wichtig ist.");
q("finalNotes", "Notizen zum Schluss", "Gibt es noch etwas Wichtiges, das die KI wissen muss?", [], { t: "t", area: 1,
  ph: "z. B. Der Chef des Restaurants soll als Endgegner vorkommen. Die Musik soll italienisch klingen. Bitte keine Anmeldung.",
  h: "Optional. Alles, was du hier schreibst, steht ganz oben im KI-Bauauftrag und hat Vorrang." });

/* ---------- Projektart: Spiel oder alles andere ---------- */
/* Alle bisherigen Fragen sind Spiel-Fragen und erscheinen nur, wenn „Spiel“ gewählt ist. */
const isGame = a => has(a, "kind", "Spiel");
const notGame = a => a.kind !== undefined && !isGame(a);
Q.forEach(q => {
  if (q.id === "thoughts" || q.id === "finalNotes") return;
  const f = q.if; q.game = true; q.if = f ? a => isGame(a) && f(a) : isGame;
});
sec("kind", "Projektart", "🧭", "Was willst du bauen?");
q("kind", "Projektart", "Was willst du bauen?", [
  ["🎮", "Spiel", "Ein Spiel für Handy, Computer, Browser oder Konsole."],
  ["📱", "Handy-App", "Eine App fürs iPhone oder Android, z. B. Planer, Tracker, Vereins-App."],
  ["🌐", "Website", "Eine Homepage, Landingpage, Blog oder Portfolio."],
  ["💼", "Programm zum Arbeiten", "Werkzeug für Büro und Betrieb: Kunden, Aufträge, Termine, Lager, Rechnungen."],
  ["🛒", "Online-Shop", "Produkte oder Dienstleistungen im Internet verkaufen."],
  ["🤖", "KI-Assistent / Chatbot", "Ein Helfer, der Fragen beantwortet, Texte schreibt oder Aufgaben erledigt."],
  ["⚙️", "Automatisierung", "Etwas, das wiederkehrende Aufgaben von allein erledigt."],
  ["🎓", "Lern-App / Quiz", "Etwas zum Lernen, Üben oder Abfragen."],
  ["📊", "Dashboard / Auswertung", "Zahlen und Daten übersichtlich anzeigen und auswerten."],
  ["✨", "Etwas anderes", "Passt nirgends rein? Kein Problem, die KI fragt genau nach."]
], { t: "m", noAi: true, h: "Du kannst auch mehreres wählen, z. B. Spiel + Lern-App für ein Lernspiel." });

sec("gbasics", "Grundidee", "💡", "Wofür das Projekt da ist und für wen.");
q("gGoal", "Hauptaufgabe", "Was soll dein Projekt hauptsächlich tun?", [
  ["🗓️", "Organisieren & Planen", "Termine, Aufgaben, Listen, Abläufe."], ["🤝", "Kunden & Aufträge verwalten", "Wer will was, bis wann, zu welchem Preis."],
  ["💶", "Verkaufen", "Produkte, Gutscheine oder Dienstleistungen."], ["📣", "Informieren & Präsentieren", "Über dich, deine Firma oder ein Thema."],
  ["💬", "Kommunizieren & Vernetzen", "Nachrichten, Gruppen, Community."], ["📚", "Lernen & Üben", "Wissen vermitteln und abfragen."],
  ["📈", "Zahlen auswerten", "Umsätze, Statistiken, Berichte."], ["⚡", "Aufgaben automatisieren", "Lästiges von allein erledigen lassen."],
  ["🎨", "Kreativ gestalten", "Bilder, Texte, Musik, Designs erstellen."], ["📅", "Buchen & Reservieren", "Tische, Termine, Kurse, Räume."],
  ["❤️", "Gesundheit & Fitness", "Training, Ernährung, Gewohnheiten."], ["😄", "Unterhalten", "Spaß, Zeitvertreib, Neugier."]
], { if: notGame });
q("gAudience", "Zielgruppe", "Wer soll es benutzen?", [
  ["🙋", "Nur ich", "Ein Werkzeug für mich selbst."], ["👨‍👩‍👧", "Familie & Freunde", ""], ["👥", "Mein Team / meine Firma", "Mitarbeiter und Kollegen."],
  ["🛍️", "Meine Kunden", "Leute, die bei mir kaufen oder buchen."], ["🌍", "Alle im Internet", "Öffentlich für jeden."],
  ["🧒", "Kinder", ""], ["🧑", "Jugendliche", ""], ["👵", "Ältere Menschen", "Große Schrift, einfache Bedienung."], ["🧑‍🔬", "Fachleute", "z. B. Handwerker, Ärzte, Lehrer."]
], { if: notGame });
q("gUsers", "Anzahl Nutzer", "Wie viele Leute benutzen es ungefähr?", [
  ["1️⃣", "Nur eine Person", ""], ["👥", "Bis 10", "Kleines Team oder Familie."], ["🏢", "Bis 100", "Verein, Firma, Stammkunden."],
  ["🏟️", "Hunderte bis Tausende", ""], ["🌐", "So viele wie möglich", "Soll mitwachsen können."]
], { if: notGame });
q("gRef", "Vorbild", "Gibt es etwas Ähnliches, an dem man sich orientieren kann?", [
  ["📋", "Wie eine Excel-Liste, nur schöner", ""], ["✅", "Wie eine To-do-App", "z. B. Todoist, Trello."], ["🛒", "Wie ein bekannter Shop", "z. B. Shopify-Shops, Etsy."],
  ["💬", "Wie ein Messenger", "z. B. WhatsApp."], ["📸", "Wie Social Media", "z. B. Instagram."], ["📅", "Wie ein Buchungssystem", "z. B. Doctolib, OpenTable."],
  ["🤖", "Wie ChatGPT oder Claude", ""], ["🆕", "Nein, etwas ganz Neues", "", "x"]
], { if: notGame, h: "Hilft der KI, schnell zu verstehen, was du meinst. Mehrere Vorbilder sind okay." });

sec("gplatform", "Geräte & Aussehen", "📱", "Wo es läuft und wie es aussieht.");
q("gPlatforms", "Läuft auf", "Wo soll es laufen?", [
  ["🌐", "Im Browser", "Am PC und am Handy über eine Internetadresse, ohne Installation."], ["🍎", "iPhone/iPad (iOS)", "Als App aus dem App Store."],
  ["🤖", "Android", "Als App aus Google Play."], ["💻", "Als Programm auf PC/Mac", "Wird installiert."], ["⌚", "Smartwatch", ""],
  ["💬", "In einem Messenger", "z. B. als WhatsApp- oder Telegram-Bot."], ["🗄️", "Im Hintergrund auf einem Server", "Läuft ohne Bildschirm, z. B. jede Nacht."]
], { if: notGame });
q("gLook", "Aussehen", "Wie soll es aussehen?", [
  ["⬜", "Schlicht & seriös", "Klar, ruhig, professionell."], ["🌈", "Modern & farbenfroh", ""], ["🧸", "Verspielt & freundlich", ""],
  ["💎", "Edel & hochwertig", ""], ["🖥️", "Technisch, wie ein Cockpit", "Viele Zahlen, Tabellen, Diagramme."], ["🏷️", "Passend zu meiner Marke", "Logo und Farben gibt es schon."],
  ["🌙", "Mit dunklem Modus", "Hell und dunkel umschaltbar."]
], { if: notGame });
q("gLang", "Sprachen", "In welchen Sprachen?", [
  ["🇩🇪", "Deutsch", ""], ["🇬🇧", "Englisch", ""], ["🇪🇸", "Spanisch", ""], ["🇫🇷", "Französisch", ""], ["🇹🇷", "Türkisch", ""], ["🌍", "Viele Sprachen", "Umschaltbar."]
], { if: notGame });

sec("gdata", "Daten & Konten", "🗂️", "Was gespeichert wird und wer worauf zugreift.");
q("gAccounts", "Konten", "Müssen sich Nutzer anmelden?", [
  ["🚪", "Nein, ohne Anmeldung", "", "x"], ["📧", "Mit E-Mail und Passwort", ""], ["🔑", "Mit Google oder Apple", "Ein Klick, kein neues Passwort."],
  ["👑", "Verschiedene Rollen", "z. B. Chef sieht alles, Mitarbeiter nur ihres, Kunden nur ihre Bestellungen."], ["🔢", "Einfacher PIN oder Code", ""]
], { if: notGame });
q("gData", "Gespeicherte Daten", "Was soll gespeichert werden?", [
  ["➖", "Nichts", "", "x"], ["👤", "Kontakte & Kunden", ""], ["📅", "Termine & Aufgaben", ""], ["📝", "Texte & Notizen", ""],
  ["🖼️", "Bilder & Dateien", ""], ["📦", "Produkte & Lager", ""], ["🧾", "Bestellungen & Rechnungen", ""], ["💳", "Zahlungen", ""],
  ["📍", "Standorte", ""], ["❤️‍🩹", "Gesundheitsdaten", "Besonders geschützt."], ["📊", "Messwerte & Zahlen", ""]
], { if: notGame });
q("gConnect", "Verbindungen", "Womit soll es zusammenarbeiten?", [
  ["➖", "Mit nichts", "", "x"], ["📅", "Kalender", "z. B. Google- oder Outlook-Kalender."], ["📧", "E-Mail", "Automatisch Mails verschicken."],
  ["💳", "Bezahlen", "z. B. PayPal, Stripe, Kreditkarte."], ["📗", "Excel / Google Sheets", ""], ["💬", "WhatsApp / SMS", ""],
  ["📸", "Social Media", ""], ["🧾", "Buchhaltung", "z. B. lexoffice, sevDesk, DATEV."], ["🗺️", "Karten", "z. B. Google Maps."], ["🧠", "Künstliche Intelligenz", "z. B. Claude für Texte oder Antworten."]
], { if: notGame });
q("gOffline", "Ohne Internet", "Muss es auch ohne Internet funktionieren?", [
  ["📶", "Nein, Internet ist immer da", "", "x"], ["✈️", "Ja, komplett offline", ""], ["🔄", "Offline arbeiten, später abgleichen", ""]
], { if: notGame });
q("gPrivacy", "Datenschutz", "Wie sensibel sind die Daten?", [
  ["🙂", "Unkritisch", "Nichts Persönliches."], ["👤", "Normale persönliche Daten", "Namen, E-Mails, Adressen."],
  ["🔒", "Sehr sensibel", "Gesundheit, Finanzen, Kinder."], ["🇪🇺", "Server müssen in der EU stehen", ""]
], { if: notGame });

sec("gbiz", "Umsetzung & Start", "🚀", "Geld, Zeitplan und wie es an den Start geht.");
q("gMoney", "Geld verdienen", "Soll es Geld einbringen?", [
  ["🎁", "Nein, kostenlos", "", "x"], ["🏷️", "Einmal kaufen", ""], ["🔁", "Abo", "Monatlich oder jährlich."], ["📢", "Werbung", ""],
  ["🛍️", "Über verkaufte Produkte", ""], ["🏢", "Intern, spart Zeit und Geld", "Kein Verkauf, aber nützlich für den Betrieb."]
], { if: notGame });
q("gSkill", "Deine Erfahrung", "Wie viel Erfahrung hast du mit dem Bauen von Software?", [
  ["🌱", "Gar keine", "Die KI soll alles erklären."], ["🙂", "Ein bisschen", "Schon mal etwas mit KI gebaut."], ["💪", "Fortgeschritten", ""], ["🧑‍💻", "Profi", ""]
], { if: notGame });
q("gTimeline", "Zeitplan", "Bis wann soll eine erste Version stehen?", [
  ["⚡", "In ein paar Tagen", "Ein schneller Prototyp."], ["📆", "In ein paar Wochen", ""], ["🗓️", "In ein paar Monaten", ""], ["🧘", "Kein Zeitdruck", ""]
], { if: notGame });
q("gBudget", "Laufende Kosten", "Was darf es im Monat kosten (Server, Dienste)?", [
  ["0️⃣", "Nichts", "Nur kostenlose Dienste.", "x"], ["💶", "Bis 10 €", ""], ["💶💶", "Bis 50 €", ""], ["💰", "Mehr ist okay", "Wenn es sich lohnt."]
], { if: notGame });
q("gLaunch", "Veröffentlichung", "Wo soll es am Ende zu finden sein?", [
  ["🔒", "Nur privat / intern", "", "x"], ["🌐", "Unter einer eigenen Internetadresse", ""], ["🍎", "Apple App Store", ""],
  ["▶️", "Google Play", ""], ["💻", "Zum Herunterladen für PC/Mac", ""], ["🏢", "Im Firmennetz", ""]
], { if: notGame });

/* ---------- Feste Fragenkataloge je Projektart (ohne KI) ---------- */
/* Verzweigungen: jede Frage erscheint nur, wenn ihr Auslöser passt. */
const K = (...k) => iff("kind", ...k);
const NG = f => a => notGame(a) && (!f || f(a));
const shopPhys = iff("sWhat", "Physische Produkte", "Lebensmittel", "Abos & Boxen");
const hasAcc = iff("gAccounts", "Mit E-Mail und Passwort", "Mit Google oder Apple", "Verschiedene Rollen", "Einfacher PIN oder Code");
const wk = (...v) => and(K("Programm zum Arbeiten"), iff("wkArea", ...v));
const notifyOn = a => Array.isArray(a.nWhen) ? a.nWhen.some(x => x !== "Keine" && x !== AI) : !!a.nWhen && a.nWhen !== "Keine" && a.nWhen !== AI;

sec("wsite", "Website", "🌐", "Aufbau, Seiten und Inhalte deiner Website.");
q("wType", "Art der Website", "Was für eine Website soll es werden?", [
  ["🏢", "Firmen-Homepage", "Wer ihr seid, was ihr anbietet, wie man euch erreicht."], ["🎯", "Landingpage", "Eine Seite für ein Produkt oder eine Aktion."],
  ["📰", "Blog / Magazin", "Regelmäßig neue Beiträge."], ["🖼️", "Portfolio", "Arbeiten und Projekte zeigen."], ["⚽", "Verein / Gruppe", ""],
  ["🍝", "Restaurant / Laden", "Speisekarte, Öffnungszeiten, Anfahrt."], ["💍", "Event / Hochzeit", ""], ["🙋", "Persönliche Seite", ""]], { if: K("Website") });
q("wPages", "Seiten", "Welche Seiten oder Bereiche soll es geben?", [
  ["🏠", "Startseite", ""], ["👋", "Über uns", ""], ["🧰", "Angebot / Leistungen", ""], ["💶", "Preise", ""], ["🖼️", "Galerie", ""], ["📰", "Blog / News", ""],
  ["👥", "Team", ""], ["📅", "Termine / Events", ""], ["⭐", "Bewertungen", ""], ["❓", "FAQ", ""], ["💼", "Jobs", ""], ["✉️", "Kontakt", ""]], { if: K("Website") });
q("wGoal", "Ziel der Besucher", "Was sollen Besucher am Ende tun?", [
  ["📞", "Anrufen", ""], ["✉️", "Kontaktformular ausfüllen", ""], ["📅", "Termin buchen", ""], ["🛒", "Etwas kaufen", ""], ["📬", "Newsletter abonnieren", ""],
  ["🚶", "Vorbeikommen", ""], ["📖", "Einfach nur informieren", ""], ["📝", "Sich bewerben", ""]], { if: K("Website") });
q("wStyle", "Startseite", "Wie soll die Startseite wirken?", [
  ["🖼️", "Großes Bild oder Video oben", ""], ["🧾", "Klar und erklärend", "Viel Info auf einen Blick."], ["⬜", "Minimalistisch", "Wenig Text, viel Raum."],
  ["📜", "Scroll-Geschichte", "Inhalte erscheinen beim Scrollen mit Animationen."], ["📰", "Wie ein Magazin", "Viele Beiträge in Kacheln."]], { l: 2, if: K("Website") });
q("wContent", "Vorhandene Inhalte", "Was hast du schon?", [
  ["📝", "Fertige Texte", ""], ["📸", "Eigene Fotos", ""], ["🏷️", "Logo", ""], ["🎥", "Videos", ""], ["➖", "Noch nichts", "Die KI soll Platzhalter und Textvorschläge schreiben.", "x"]], { l: 2, if: K("Website") });
q("wEdit", "Inhalte pflegen", "Wer ändert später Texte und Bilder?", [
  ["🔒", "Ändert sich kaum", "Änderungen macht dann die KI im Code."], ["✍️", "Ich selbst, ohne Programmieren", "Mit einem einfachen Bearbeitungsbereich."],
  ["👥", "Mehrere Leute", "Mit eigenen Zugängen."]], { l: 2, if: K("Website") });
q("wForm", "Kontaktformular", "Was soll im Kontaktformular abgefragt werden?", [
  ["👤", "Name", ""], ["📧", "E-Mail", ""], ["📞", "Telefon", ""], ["💬", "Nachricht", ""], ["📎", "Datei-Upload", ""], ["📅", "Wunschtermin", ""], ["🔁", "Rückrufbitte", ""]],
  { l: 2, if: and(K("Website"), or(iff("wPages", "Kontakt"), iff("wGoal", "Kontaktformular ausfüllen"))) });
q("wBlog", "Blog", "Was soll der Blog können?", [
  ["🗂️", "Kategorien", ""], ["💬", "Kommentare", ""], ["🔍", "Suche", ""], ["✍️", "Autorenprofile", ""], ["📬", "Newsletter bei neuem Beitrag", ""], ["📡", "RSS-Feed", ""]],
  { l: 2, if: and(K("Website"), or(iff("wPages", "Blog / News"), iff("wType", "Blog / Magazin"))) });
q("wGallery", "Galerie", "Wie soll die Galerie aussehen?", [
  ["▦", "Bilderraster", ""], ["🎞️", "Diashow", ""], ["🗂️", "Nach Kategorien", ""], ["🔍", "Groß ansehen per Klick", ""], ["🎥", "Mit Videos", ""]],
  { l: 3, if: and(K("Website"), iff("wPages", "Galerie")) });
q("wEvents", "Termine", "Wie sollen Termine und Events erscheinen?", [
  ["📋", "Als Liste", ""], ["📅", "Als Kalender", ""], ["✅", "Mit Anmeldung", ""], ["🎟️", "Mit Ticketverkauf", ""]],
  { l: 3, if: and(K("Website"), iff("wPages", "Termine / Events")) });
q("wSeo", "Bei Google gefunden werden", "Wie wichtig ist es, bei Google gefunden zu werden?", [
  ["📍", "Sehr wichtig, in meiner Stadt", "Mit Google-Unternehmensprofil und Karte."], ["🌍", "Wichtig, überregional", ""], ["🤷", "Nicht so wichtig", "Leute kommen über Links.", "x"]], { l: 2, if: K("Website") });
q("wExtras", "Extras", "Welche Extras soll die Website haben?", [
  ["🗺️", "Karte mit Anfahrt", ""], ["🕒", "Öffnungszeiten", ""], ["💬", "WhatsApp-Button", ""], ["📱", "Social-Media-Links", ""], ["📸", "Instagram-Beiträge", ""],
  ["⭐", "Google-Bewertungen", ""], ["📬", "Newsletter-Anmeldung", ""], ["🤖", "Chat-Assistent", ""]], { l: 2, if: K("Website") });
q("wDomain", "Internetadresse", "Hast du schon eine eigene Internetadresse?", [
  ["✅", "Ja, schon vorhanden", ""], ["🆕", "Nein, brauche eine neue", "z. B. deinname.de für ca. 1 € im Monat."], ["🆓", "Kostenlose Adresse reicht", "z. B. name.github.io"]], { l: 2, if: K("Website") });
q("wAnalytics", "Besucherzahlen", "Willst du sehen, wie viele Besucher kommen?", [
  ["➖", "Nein", "", "x"], ["🛡️", "Ja, datenschutzfreundlich", "Ohne Cookie-Banner, z. B. Plausible."], ["📊", "Ja, ausführlich", "z. B. Google Analytics, braucht Cookie-Einwilligung."]], { l: 3, if: K("Website") });
q("wPrint", "Druckversion", "Sollen Seiten gut ausdruckbar sein (z. B. Speisekarte)?", [["🖨️", "Ja", ""], ["➖", "Nein", "", "x"]], { l: 4, if: K("Website") });

sec("app", "Handy-App", "📱", "Aufbau und Funktionen deiner App.");
q("aNav", "Aufbau", "Wie soll man sich durch die App bewegen?", [
  ["⬇️", "Leiste unten mit Symbolen", "Wie bei Instagram oder WhatsApp."], ["☰", "Seitenmenü", ""], ["1️⃣", "Ein einziger Bildschirm", "Alles auf einen Blick."],
  ["🃏", "Karten zum Wischen", ""], ["📜", "Endloser Feed", ""]], { if: K("Handy-App") });
q("aScreens", "Hauptbereiche", "Welche Hauptbereiche braucht die App?", [
  ["🏠", "Übersicht / Start", ""], ["📋", "Liste", ""], ["📅", "Kalender", ""], ["🗺️", "Karte", ""], ["💬", "Chat", ""], ["📈", "Statistik", ""],
  ["⭐", "Favoriten", ""], ["🔍", "Suche", ""], ["👤", "Profil", ""], ["⚙️", "Einstellungen", ""]], { if: K("Handy-App") });
q("aDevice", "Handy-Funktionen", "Welche Funktionen des Handys soll die App nutzen?", [
  ["📷", "Kamera", ""], ["🖼️", "Fotos auswählen", ""], ["📍", "Standort", ""], ["🎤", "Mikrofon", ""], ["👥", "Kontakte", ""], ["📅", "Kalender", ""],
  ["🔵", "Bluetooth", ""], ["📶", "NFC", "Kontaktlos scannen."], ["🏃", "Schritte & Gesundheit", ""], ["🔐", "Face ID / Fingerabdruck", ""], ["➖", "Keine", "", "x"]], { if: K("Handy-App") });
q("aOnboard", "Erster Start", "Was passiert beim allerersten Öffnen?", [
  ["🚀", "Direkt loslegen", ""], ["📖", "Kurze Einführung", "2–3 Seiten zum Durchwischen."], ["👤", "Erst Konto anlegen", ""], ["👆", "Geführte Tour", "Tipps direkt in der App."]], { l: 2, if: K("Handy-App") });
q("aIap", "Kaufen in der App", "Wie wird in der App bezahlt?", [
  ["📆", "Abo monatlich", ""], ["🗓️", "Abo jährlich", ""], ["🎁", "Gratis testen", "z. B. 7 Tage."], ["🔓", "Einmal freischalten", ""], ["🧩", "Einzelne Extras kaufen", ""]],
  { l: 2, if: and(K("Handy-App"), iff("gMoney", "Einmal kaufen", "Abo")) });
q("aExtras", "Extras", "Welche Extras soll die App haben?", [
  ["🔲", "Widget für den Homescreen", ""], ["⌚", "Smartwatch", ""], ["📤", "Teilen mit anderen", ""], ["📲", "Tablet-Ansicht", ""], ["🗣️", "Siri / Sprachbefehle", ""], ["➖", "Keine", "", "x"]],
  { l: 3, if: K("Handy-App") });
q("aGestures", "Bedienung", "Welche Gesten soll es geben?", [
  ["👆", "Nur Tippen", ""], ["👈", "Wischen zum Löschen", ""], ["✋", "Ziehen zum Sortieren", ""], ["⬇️", "Runterziehen zum Aktualisieren", ""], ["🤏", "Zoomen", ""]], { l: 3, if: K("Handy-App") });
q("aHaptic", "Vibration", "Soll das Handy bei Aktionen leicht vibrieren?", [["📳", "Ja, dezent", ""], ["➖", "Nein", "", "x"]], { l: 4, if: K("Handy-App") });

sec("work", "Programm für die Arbeit", "💼", "Welche Abläufe im Betrieb das Programm übernimmt.");
q("wkBranche", "Branche", "In welcher Branche wird es genutzt?", [
  ["🔨", "Handwerk", ""], ["🍽️", "Gastronomie", ""], ["🛍️", "Einzelhandel", ""], ["💇", "Friseur / Beauty", ""], ["🩺", "Praxis / Gesundheit", ""], ["🖥️", "Büro / Agentur", ""],
  ["🏗️", "Bau", ""], ["🚚", "Logistik", ""], ["⚽", "Verein", ""], ["🏫", "Schule / Bildung", ""], ["🧩", "Andere Branche", ""]], { if: K("Programm zum Arbeiten") });
q("wkArea", "Bereiche", "Welche Bereiche soll das Programm abdecken?", [
  ["🤝", "Kunden", "Kontakte und Verlauf (CRM)."], ["📄", "Aufträge & Angebote", ""], ["📅", "Termine & Kalender", ""], ["✅", "Projekte & Aufgaben", ""],
  ["📦", "Lager & Material", ""], ["🧾", "Rechnungen", ""], ["⏱️", "Zeiterfassung", ""], ["👷", "Mitarbeiter & Schichten", ""], ["📁", "Dokumente", ""],
  ["🚐", "Fahrzeuge & Geräte", ""], ["🚚", "Bestellungen bei Lieferanten", ""]], { if: K("Programm zum Arbeiten") });
q("wkWhere", "Arbeitsort", "Wo wird damit gearbeitet?", [
  ["🖥️", "Am Schreibtisch", ""], ["📱", "Unterwegs beim Kunden", "Am Handy."], ["🏭", "In Werkstatt oder Lager", "Am Tablet, oft mit Handschuhen."], ["🌍", "Überall", ""]], { if: K("Programm zum Arbeiten") });
q("wkNow", "Bisher", "Wie wird das heute erledigt?", [
  ["📄", "Auf Papier", ""], ["📗", "Mit Excel", ""], ["💬", "Über WhatsApp", ""], ["💽", "Mit einem alten Programm", ""], ["🧠", "Alles im Kopf", ""]], { l: 2, if: K("Programm zum Arbeiten") });
q("wkImport", "Alte Daten", "Sollen bestehende Daten übernommen werden?", [
  ["📥", "Ja, alles", ""], ["👤", "Nur Kunden und Kontakte", ""], ["🆕", "Nein, neu anfangen", "", "x"]], { l: 2, if: and(K("Programm zum Arbeiten"), iff("wkNow", "Mit Excel", "Mit einem alten Programm")) });
q("crmFields", "Kundendaten", "Was soll zu jedem Kunden gespeichert werden?", [
  ["👤", "Name", ""], ["🏢", "Firma", ""], ["🏠", "Adresse", ""], ["📞", "Telefon", ""], ["📧", "E-Mail", ""], ["🎂", "Geburtstag", ""], ["🔢", "Kundennummer", ""],
  ["🚦", "Status", "z. B. Interessent, Kunde, inaktiv."], ["📝", "Notizen", ""], ["📸", "Fotos", ""], ["💶", "Umsatz", ""]], { l: 2, if: wk("Kunden") });
q("crmHistory", "Kundenverlauf", "Was soll im Verlauf eines Kunden stehen?", [
  ["📝", "Notizen mit Datum", ""], ["📞", "Anrufe", ""], ["📧", "E-Mails", ""], ["📄", "Aufträge", ""], ["📎", "Dateien", ""], ["⏰", "Wiedervorlagen", "Erinnerung, sich zu melden."]], { l: 3, if: wk("Kunden") });
q("ordFlow", "Auftragsablauf", "Welche Schritte durchläuft ein Auftrag?", [
  ["📩", "Anfrage", ""], ["📄", "Angebot", ""], ["✅", "Auftrag", ""], ["🔧", "In Arbeit", ""], ["🏁", "Fertig", ""], ["🧾", "Rechnung", ""], ["💶", "Bezahlt", ""]], { l: 2, if: wk("Aufträge & Angebote") });
q("ordQuote", "Angebote", "Was sollen Angebote können?", [
  ["📋", "Aus Vorlagen erstellen", ""], ["🧮", "Positionen mit Preisen", ""], ["🏷️", "Rabatte", ""], ["📄", "Als PDF", ""], ["✍️", "Online annehmen lassen", ""], ["🔁", "In Rechnung umwandeln", ""]],
  { l: 3, if: wk("Aufträge & Angebote") });
q("calKind", "Kalender", "Was soll der Kalender können?", [
  ["🙋", "Eigene Termine", ""], ["👥", "Team-Kalender", ""], ["🌐", "Kunden buchen online", ""], ["🔁", "Wiederkehrende Termine", ""], ["⏰", "Erinnerung an Kunden", "Per SMS oder E-Mail."],
  ["🚪", "Räume oder Geräte buchen", ""], ["🔄", "Mit Google/Outlook abgleichen", ""]], { l: 2, if: wk("Termine & Kalender") });
q("prjTasks", "Aufgaben", "Wie sollen Projekte und Aufgaben organisiert werden?", [
  ["☑️", "Aufgabenlisten", ""], ["🗂️", "Board mit Spalten", "Wie Trello: Offen, In Arbeit, Fertig."], ["⏰", "Fristen", ""], ["🙋", "Zuständige Person", ""], ["✔️", "Checklisten", ""],
  ["⏱️", "Zeit pro Aufgabe", ""], ["📎", "Dateien anhängen", ""], ["💬", "Kommentare", ""]], { l: 2, if: wk("Projekte & Aufgaben") });
q("stockOps", "Lager", "Was soll die Lagerverwaltung können?", [
  ["👀", "Bestand sehen", ""], ["➕", "Ein- und Ausbuchen", ""], ["⚠️", "Warnung bei Mindestbestand", ""], ["📷", "Barcode scannen", ""], ["📋", "Inventur", ""],
  ["🏬", "Mehrere Lagerorte", ""], ["🚚", "Lieferanten zuordnen", ""]], { l: 2, if: wk("Lager & Material") });
q("invOps", "Rechnungen", "Was müssen Rechnungen können?", [
  ["📄", "Als PDF", ""], ["🔢", "Fortlaufende Nummern", ""], ["💶", "Mit Mehrwertsteuer", ""], ["🧑‍💼", "Kleinunternehmer ohne MwSt", ""], ["⏰", "Mahnungen", ""],
  ["🧾", "E-Rechnung", "XRechnung oder ZUGFeRD, ab 2025 im B2B schrittweise Pflicht."], ["✅", "Zahlungseingang abhaken", ""], ["📤", "An Buchhaltung übergeben", ""]], { l: 2, if: wk("Rechnungen") });
q("timeOps", "Zeiterfassung", "Was soll erfasst werden?", [
  ["🚪", "Kommen und Gehen", ""], ["☕", "Pausen", ""], ["📁", "Pro Projekt oder Kunde", ""], ["🏖️", "Urlaub & Krankheit", ""], ["➕", "Überstunden", ""], ["📤", "Export für die Lohnabrechnung", ""]],
  { l: 2, if: wk("Zeiterfassung") });
q("staffOps", "Mitarbeiter", "Was soll es für Mitarbeiter geben?", [
  ["🗓️", "Schichtplan", ""], ["🏖️", "Urlaubsanträge", ""], ["🗂️", "Stammdaten", ""], ["🎓", "Qualifikationen", ""], ["🔄", "Schichten tauschen", ""]], { l: 2, if: wk("Mitarbeiter & Schichten") });
q("docOps", "Dokumente", "Was soll mit Dokumenten möglich sein?", [
  ["⬆️", "Hochladen", ""], ["🗂️", "Ordner", ""], ["📋", "Vorlagen", ""], ["✍️", "Digital unterschreiben", ""], ["🕘", "Versionen", ""], ["🔍", "Text durchsuchen", ""]], { l: 2, if: wk("Dokumente") });
q("fleetOps", "Fahrzeuge & Geräte", "Was soll zu Fahrzeugen und Geräten erfasst werden?", [
  ["🔧", "Wartung & TÜV-Termine", ""], ["📘", "Fahrtenbuch", ""], ["🙋", "Wer hat was", ""], ["📸", "Schäden mit Foto", ""]], { l: 3, if: wk("Fahrzeuge & Geräte") });
q("supOps", "Einkauf", "Was soll beim Bestellen helfen?", [
  ["📝", "Bestellliste", ""], ["🏭", "Lieferanten", ""], ["📦", "Wareneingang prüfen", ""], ["💶", "Preise vergleichen", ""]], { l: 3, if: wk("Bestellungen bei Lieferanten") });
q("wkReports", "Auswertungen", "Welche Auswertungen willst du sehen?", [
  ["💶", "Umsatz", ""], ["⏳", "Offene Rechnungen", ""], ["📊", "Auslastung", ""], ["⏱️", "Arbeitszeiten", ""], ["🏆", "Beste Kunden", ""], ["📦", "Lagerwert", ""], ["➖", "Keine", "", "x"]],
  { l: 2, if: K("Programm zum Arbeiten") });
q("wkApproval", "Freigaben", "Muss etwas freigegeben werden, bevor es gilt?", [
  ["➖", "Nein", "", "x"], ["👑", "Chef gibt frei", "z. B. Angebote, Urlaub, Bestellungen."], ["🪜", "Mehrstufig", ""]], { l: 3, if: K("Programm zum Arbeiten") });
q("wkPrint", "Drucken", "Was muss gedruckt werden können?", [
  ["📋", "Listen", ""], ["📄", "Lieferscheine", ""], ["🏷️", "Etiketten", ""], ["🧾", "Rechnungen", ""], ["➖", "Nichts", "", "x"]], { l: 3, if: K("Programm zum Arbeiten") });

sec("shop", "Online-Shop", "🛒", "Was du verkaufst und wie Bestellung, Bezahlung und Versand laufen.");
q("sWhat", "Was wird verkauft", "Was verkaufst du?", [
  ["📦", "Physische Produkte", ""], ["💾", "Digitale Produkte", "Downloads, Kurse, Vorlagen."], ["🛎️", "Dienstleistungen & Termine", ""], ["🎁", "Gutscheine", ""],
  ["🔁", "Abos & Boxen", ""], ["🥖", "Lebensmittel", ""]], { if: K("Online-Shop") });
q("sCount", "Anzahl Produkte", "Wie viele Produkte ungefähr?", [
  ["🔟", "Bis 10", ""], ["💯", "Bis 100", ""], ["🔢", "Bis 1.000", ""], ["🏬", "Mehr als 1.000", ""]], { if: K("Online-Shop") });
q("sPlatform", "Shop-Grundlage", "Worauf soll der Shop aufbauen?", [
  ["🧩", "Fertiges Shopsystem", "z. B. Shopify, schnell startklar, monatliche Gebühr."], ["🛠️", "Komplett selbst gebaut", "Volle Freiheit, mehr Aufwand."],
  ["🔗", "In bestehende Website einbauen", ""]], { if: K("Online-Shop") });
q("sPay", "Bezahlarten", "Wie sollen Kunden bezahlen können?", [
  ["🅿️", "PayPal", ""], ["💳", "Kreditkarte", ""], ["📱", "Apple Pay / Google Pay", ""], ["🧾", "Kauf auf Rechnung", "z. B. über Klarna."], ["🏦", "Vorkasse", ""],
  ["🔁", "Lastschrift", ""], ["💶", "Bar bei Abholung", ""]], { if: K("Online-Shop") });
q("sShip", "Versand", "Wie kommen die Produkte zum Kunden?", [
  ["📮", "DHL", ""], ["📦", "Hermes / DPD / GLS", ""], ["🏪", "Abholung", ""], ["🚲", "Eigene Lieferung", ""], ["🚛", "Spedition", ""], ["🌍", "Auch ins Ausland", ""]],
  { if: and(K("Online-Shop"), shopPhys) });
q("sShipCost", "Versandkosten", "Wie werden Versandkosten berechnet?", [
  ["💶", "Pauschal", ""], ["⚖️", "Nach Gewicht", ""], ["🎁", "Kostenlos ab einem Betrag", ""], ["🆓", "Immer kostenlos", "", "x"]], { l: 2, if: and(K("Online-Shop"), shopPhys) });
q("sVariants", "Varianten", "Gibt es Produkte in Varianten?", [
  ["📏", "Größen", ""], ["🎨", "Farben", ""], ["✍️", "Personalisierung", "z. B. Gravur oder Name."], ["🧺", "Sets & Bundles", ""], ["➖", "Keine", "", "x"]], { l: 2, if: K("Online-Shop") });
q("sStock", "Bestand", "Wie soll mit dem Lagerbestand umgegangen werden?", [
  ["🔢", "Automatisch mitzählen", ""], ["🚫", "„Ausverkauft“ anzeigen", ""], ["⏳", "Vorbestellen erlauben", ""], ["➖", "Kein Bestand nötig", "", "x"]], { l: 2, if: and(K("Online-Shop"), shopPhys) });
q("sDigital", "Auslieferung digital", "Wie bekommt der Kunde digitale Produkte?", [
  ["⬇️", "Download-Link", ""], ["📧", "Per E-Mail", ""], ["🔑", "Lizenzschlüssel", ""], ["🎓", "Zugang zu einem Kurs", ""]], { l: 2, if: and(K("Online-Shop"), iff("sWhat", "Digitale Produkte")) });
q("sService", "Buchung", "Wie werden Dienstleistungen gebucht?", [
  ["📅", "Termin auswählen", ""], ["⏱️", "Dauer wählen", ""], ["🙋", "Mitarbeiter wählen", ""], ["💶", "Anzahlung", ""]], { l: 2, if: and(K("Online-Shop"), iff("sWhat", "Dienstleistungen & Termine")) });
q("sCustomer", "Kundenkonto", "Wie sollen Kunden bestellen?", [
  ["👤", "Kundenkonto Pflicht", ""], ["🙂", "Konto freiwillig", ""], ["🚪", "Als Gast", ""], ["❤️", "Wunschliste", ""], ["🧾", "Bestellverlauf", ""]], { l: 2, if: K("Online-Shop") });
q("sPromo", "Rabatte", "Welche Rabatte und Aktionen soll es geben?", [
  ["🏷️", "Rabattcodes", ""], ["🔥", "Sale-Preise", ""], ["📦", "Mengenrabatt", ""], ["🎁", "Gratis-Geschenk", ""], ["⭐", "Treuepunkte", ""], ["➖", "Keine", "", "x"]], { l: 2, if: K("Online-Shop") });
q("sTax", "Steuern", "Wie wird die Steuer berechnet?", [
  ["💶", "Mit Mehrwertsteuer (19 % / 7 %)", ""], ["🧑‍💼", "Kleinunternehmer", "Ohne Mehrwertsteuer."], ["🇪🇺", "Auch EU-Ausland", "OSS-Verfahren."]], { l: 2, if: K("Online-Shop") });
q("sReturns", "Rückgabe", "Wie laufen Rücksendungen?", [
  ["📅", "14 Tage (gesetzlich)", ""], ["🗓️", "30 Tage", ""], ["🏷️", "Retourenschein zum Ausdrucken", ""], ["➖", "Keine Rückgabe möglich", "z. B. bei Personalisiertem.", "x"]],
  { l: 2, if: and(K("Online-Shop"), shopPhys) });
q("sMail", "Shop-E-Mails", "Welche E-Mails soll der Shop automatisch verschicken?", [
  ["✅", "Bestellbestätigung", ""], ["🚚", "Versand mit Sendungsverfolgung", ""], ["🧾", "Rechnung", ""], ["⭐", "Bitte um Bewertung", ""], ["🛒", "Erinnerung an vollen Warenkorb", ""]],
  { l: 3, if: K("Online-Shop") });
q("sFilters", "Suchen & Filtern", "Wie finden Kunden Produkte?", [
  ["🗂️", "Kategorien", ""], ["🔍", "Suche", ""], ["💶", "Preisfilter", ""], ["📏", "Größen- und Farbfilter", ""], ["↕️", "Sortieren", ""]], { l: 3, if: K("Online-Shop") });
q("sReviews", "Bewertungen", "Sollen Kunden Produkte bewerten können?", [
  ["⭐", "Ja, mit Sternen und Text", ""], ["📸", "Ja, auch mit Fotos", ""], ["➖", "Nein", "", "x"]], { l: 3, if: K("Online-Shop") });
q("sMarket", "Marktplätze", "Soll auch über Marktplätze verkauft werden?", [
  ["🅰️", "Amazon", ""], ["🧶", "Etsy", ""], ["🔨", "eBay", ""], ["📸", "Instagram / Facebook Shop", ""], ["➖", "Nein", "", "x"]], { l: 4, if: K("Online-Shop") });

sec("bot", "KI-Assistent", "🤖", "Wo dein Assistent arbeitet, was er weiß und was er darf.");
q("bWhere", "Einsatzort", "Wo soll der Assistent erreichbar sein?", [
  ["🌐", "Auf meiner Website", ""], ["💬", "In WhatsApp", ""], ["✈️", "In Telegram", ""], ["📱", "In einer eigenen App", ""], ["🏢", "Intern für mein Team", ""], ["📞", "Am Telefon", "Mit Sprache."]],
  { if: K("KI-Assistent / Chatbot") });
q("bTasks", "Aufgaben", "Was soll der Assistent erledigen?", [
  ["❓", "Fragen beantworten", ""], ["📅", "Termine buchen", ""], ["🛒", "Bestellungen aufnehmen", ""], ["✍️", "Texte schreiben", ""], ["📧", "E-Mails beantworten", ""],
  ["📄", "Dokumente zusammenfassen", ""], ["🔎", "Daten nachschlagen", "z. B. Lieferstatus."], ["💡", "Beraten & empfehlen", ""]], { if: K("KI-Assistent / Chatbot") });
q("bKnow", "Wissen", "Woher bekommt der Assistent sein Wissen?", [
  ["🌐", "Von meiner Website", ""], ["📄", "Aus PDFs und Dokumenten", ""], ["❓", "Aus einer FAQ-Liste", ""], ["📦", "Aus dem Produktkatalog", ""], ["🗄️", "Aus meinem Programm / Datenbank", ""],
  ["🌍", "Allgemeinwissen reicht", "", "x"]], { if: K("KI-Assistent / Chatbot") });
q("bTone", "Tonfall", "Wie soll er sprechen?", [
  ["😊", "Locker, per Du", ""], ["🎩", "Höflich, per Sie", ""], ["😄", "Witzig", ""], ["📏", "Sachlich und kurz", ""], ["🎭", "Wie eine bestimmte Figur", "z. B. ein Maskottchen."]],
  { l: 2, if: K("KI-Assistent / Chatbot") });
q("bHuman", "Wenn er nicht weiterweiß", "Was passiert, wenn der Assistent nicht weiterweiß?", [
  ["🙏", "Sagt es ehrlich", ""], ["🧑", "Leitet an einen Menschen weiter", ""], ["✉️", "Bietet Kontaktformular an", ""], ["📞", "Bietet Rückruf an", ""]], { l: 2, if: K("KI-Assistent / Chatbot") });
q("bMemory", "Gedächtnis", "Woran soll er sich erinnern?", [
  ["➖", "An nichts", "Jedes Gespräch startet neu.", "x"], ["💬", "Innerhalb eines Gesprächs", ""], ["🧠", "Über mehrere Gespräche", "Braucht ein Nutzerkonto."]], { l: 2, if: K("KI-Assistent / Chatbot") });
q("bLimits", "Verboten", "Was darf der Assistent auf keinen Fall?", [
  ["💶", "Preise oder Rabatte versprechen", ""], ["⚖️", "Rechts- oder Medizinrat geben", ""], ["🥊", "Über Konkurrenz reden", ""], ["🔒", "Persönliche Daten abfragen", ""], ["🗳️", "Über Politik reden", ""]],
  { l: 2, if: K("KI-Assistent / Chatbot") });
q("bCost", "Qualität vs. Kosten", "Was ist dir wichtiger?", [
  ["💰", "Möglichst günstig", ""], ["⚖️", "Gute Mitte", ""], ["🏆", "Beste Antworten", ""]], { l: 3, if: K("KI-Assistent / Chatbot") });
q("bAdmin", "Verwaltung", "Was willst du im Hintergrund sehen und steuern?", [
  ["📜", "Gespräche nachlesen", ""], ["➕", "Wissen selbst ergänzen", ""], ["📊", "Häufigste Fragen", ""], ["⏸️", "Assistent pausieren", ""]], { l: 3, if: K("KI-Assistent / Chatbot") });
q("bHours", "Erreichbarkeit", "Wann soll der Assistent antworten?", [["🕐", "Rund um die Uhr", ""], ["🏢", "Nur zu Geschäftszeiten", ""]], { l: 4, if: K("KI-Assistent / Chatbot") });

sec("auto", "Automatisierung", "⚙️", "Was wann automatisch passieren soll.");
q("auTrigger", "Auslöser", "Wann soll die Automatisierung loslaufen?", [
  ["⏰", "Zu festen Zeiten", ""], ["📧", "Bei neuer E-Mail", ""], ["📝", "Bei neuem Formular-Eintrag", ""], ["📁", "Bei neuer Datei", ""], ["🛒", "Bei neuer Bestellung", ""],
  ["📗", "Bei Änderung in einer Tabelle", ""], ["👆", "Per Knopfdruck", ""]], { if: K("Automatisierung") });
q("auFreq", "Wie oft", "Wie oft soll sie laufen?", [
  ["⏱️", "Alle paar Minuten", ""], ["🕐", "Stündlich", ""], ["📅", "Täglich", ""], ["🗓️", "Wöchentlich", ""], ["📆", "Monatlich", ""]], { if: and(K("Automatisierung"), iff("auTrigger", "Zu festen Zeiten")) });
q("auSource", "Daten von", "Woher kommen die Daten?", [
  ["📧", "E-Mail-Postfach", ""], ["📗", "Excel / Google Sheets", ""], ["📝", "Website-Formular", ""], ["🛒", "Shop", ""], ["📅", "Kalender", ""],
  ["☁️", "Cloud-Ordner", "Google Drive, Dropbox, OneDrive."], ["🌐", "Andere Websites", ""], ["🗄️", "Datenbank / Programm", ""]], { if: K("Automatisierung") });
q("auAction", "Aktion", "Was soll dann passieren?", [
  ["📧", "E-Mail senden", ""], ["📗", "Tabelle füllen", ""], ["📄", "PDF erstellen", ""], ["💬", "Nachricht schicken", "WhatsApp, Slack, Teams."], ["📁", "Datei ablegen", ""],
  ["📅", "Kalendereintrag", ""], ["🧾", "Rechnung erstellen", ""], ["🧠", "Mit KI zusammenfassen", ""]], { if: K("Automatisierung") });
q("auVolume", "Menge", "Wie viel ist zu tun?", [["🙂", "Ein paar Dinge am Tag", ""], ["📈", "Dutzende am Tag", ""], ["🏭", "Hunderte oder mehr", ""]], { l: 2, if: K("Automatisierung") });
q("auError", "Bei Fehlern", "Was soll bei einem Fehler passieren?", [
  ["📧", "Mir Bescheid geben", ""], ["🔁", "Nochmal versuchen", ""], ["📜", "Protokollieren", ""], ["⏹️", "Anhalten", ""]], { l: 2, if: K("Automatisierung") });
q("auTool", "Werkzeug", "Womit soll das umgesetzt werden?", [
  ["🧩", "Mit fertigen Diensten", "z. B. Make, Zapier oder n8n, ohne viel Code."], ["💻", "Mit eigenem Code", ""], ["💰", "Was am günstigsten ist", ""]], { l: 2, if: K("Automatisierung") });
q("auApprove", "Bestätigen", "Soll vor dem Ausführen nachgefragt werden?", [["🚀", "Nie, einfach machen", "", "x"], ["⚠️", "Nur bei wichtigen Dingen", ""], ["✋", "Immer", ""]], { l: 3, if: K("Automatisierung") });
q("auLog", "Übersicht", "Willst du sehen, was gelaufen ist?", [["📜", "Protokoll aller Läufe", ""], ["📊", "Statistik", ""], ["➖", "Nicht nötig", "", "x"]], { l: 3, if: K("Automatisierung") });

sec("learn", "Lernen & Quiz", "🎓", "Was gelernt wird und wie.");
q("lTopic", "Thema", "Worum geht es beim Lernen?", [
  ["📐", "Schulfach", ""], ["🗣️", "Sprache", ""], ["🚗", "Prüfung / Führerschein", ""], ["🏢", "Schulung in der Firma", ""], ["🎸", "Hobby", ""], ["🌍", "Allgemeinwissen", ""]], { if: K("Lern-App / Quiz") });
q("lLevel", "Niveau", "Für welches Niveau?", [["🌱", "Anfänger", ""], ["📈", "Fortgeschrittene", ""], ["🔀", "Gemischt, passt sich an", ""]], { if: K("Lern-App / Quiz") });
q("lTypes", "Aufgabenarten", "Welche Aufgabenarten soll es geben?", [
  ["🔘", "Multiple Choice", ""], ["✅", "Richtig / Falsch", ""], ["✏️", "Lückentext", ""], ["🃏", "Karteikarten", ""], ["🔗", "Zuordnen", ""], ["⌨️", "Freie Antwort", ""],
  ["🖼️", "Bilder erkennen", ""], ["🔊", "Hören & Sprechen", ""]], { if: K("Lern-App / Quiz") });
q("lContent", "Inhalte", "Wer erstellt die Lerninhalte?", [
  ["🙋", "Ich gebe sie vor", ""], ["👩‍🏫", "Lehrer oder Trainer in der App", ""], ["🧠", "KI erzeugt sie", ""], ["📗", "Import aus Excel", ""]], { if: K("Lern-App / Quiz") });
q("lProgress", "Motivation", "Wie wird Fortschritt belohnt?", [
  ["🆙", "Level", ""], ["⭐", "Punkte", ""], ["🏅", "Abzeichen", ""], ["🔥", "Lernserie", "Jeden Tag dranbleiben."], ["🔁", "Schlaue Wiederholung", "Schwieriges kommt öfter."], ["📜", "Zertifikat", ""]],
  { l: 2, if: K("Lern-App / Quiz") });
q("lModes", "Modi", "Welche Lernmodi soll es geben?", [
  ["🏋️", "Üben", ""], ["⏱️", "Prüfung mit Zeit", ""], ["🆚", "Duell gegen andere", ""], ["📆", "Tagesquiz", ""]], { l: 2, if: K("Lern-App / Quiz") });
q("lTeacher", "Lehrer-Bereich", "Braucht es einen Bereich für Lehrer oder Trainer?", [
  ["🏫", "Klassen / Gruppen", ""], ["📤", "Aufgaben zuweisen", ""], ["📊", "Ergebnisse sehen", ""], ["➖", "Nein", "", "x"]], { l: 2, if: K("Lern-App / Quiz") });
q("lFeedback", "Rückmeldung", "Wann erfährt man, ob die Antwort richtig war?", [
  ["⚡", "Sofort", ""], ["💡", "Sofort mit Erklärung", ""], ["🏁", "Erst am Ende", ""]], { l: 3, if: K("Lern-App / Quiz") });

sec("dash", "Dashboard", "📊", "Welche Zahlen woher kommen und wie sie aussehen.");
q("dSrc", "Datenquellen", "Woher kommen die Zahlen?", [
  ["📗", "Excel / Google Sheets", ""], ["🛒", "Shop", ""], ["🧾", "Buchhaltung", ""], ["🌐", "Website-Statistik", ""], ["🗄️", "Datenbank / Programm", ""], ["📸", "Social Media", ""],
  ["✍️", "Von Hand eingeben", ""], ["📡", "Sensoren & Geräte", ""]], { if: K("Dashboard / Auswertung") });
q("dKpi", "Kennzahlen", "Welche Zahlen sind wichtig?", [
  ["💶", "Umsatz", ""], ["📉", "Kosten & Gewinn", ""], ["👥", "Kunden", ""], ["📦", "Bestellungen", ""], ["🏬", "Lagerbestand", ""], ["⏱️", "Arbeitszeit", ""], ["👀", "Besucher", ""], ["🎯", "Ziel vs. Ist", ""]],
  { if: K("Dashboard / Auswertung") });
q("dCharts", "Darstellung", "Wie sollen die Zahlen dargestellt werden?", [
  ["🔢", "Große Zahlen-Kacheln", ""], ["📈", "Linien über die Zeit", ""], ["📊", "Balken", ""], ["🥧", "Tortendiagramme", ""], ["📋", "Tabellen", ""], ["🗺️", "Karten", ""]], { l: 2, if: K("Dashboard / Auswertung") });
q("dRefresh", "Aktualität", "Wie aktuell müssen die Zahlen sein?", [["⚡", "Live", ""], ["🕐", "Stündlich", ""], ["📅", "Täglich", ""], ["👆", "Auf Knopfdruck", ""]], { l: 2, if: K("Dashboard / Auswertung") });
q("dFilter", "Filter", "Wonach soll man filtern können?", [
  ["📅", "Zeitraum", ""], ["📍", "Standort", ""], ["🙋", "Mitarbeiter", ""], ["📦", "Produkt", ""], ["🤝", "Kunde", ""]], { l: 2, if: K("Dashboard / Auswertung") });
q("dAlert", "Warnungen", "Soll das Dashboard selbst Bescheid geben?", [
  ["⚠️", "Bei Grenzwerten", "z. B. Umsatz unter Ziel."], ["📧", "Wochenbericht per E-Mail", ""], ["➖", "Nein", "", "x"]], { l: 3, if: K("Dashboard / Auswertung") });
q("dExport", "Weitergeben", "Wie sollen Auswertungen weitergegeben werden?", [["📄", "Als PDF", ""], ["📗", "Als Excel", ""], ["🔗", "Per Link", ""], ["➖", "Gar nicht", "", "x"]], { l: 3, if: K("Dashboard / Auswertung") });

sec("acc", "Konten & Rechte", "🔐", "Wer sich anmeldet und wer was darf.");
q("accReg", "Registrierung", "Wer darf sich ein Konto anlegen?", [
  ["🌍", "Jeder", ""], ["✉️", "Nur mit Einladung", ""], ["👑", "Nur ich lege Konten an", ""]], { l: 2, if: NG(hasAcc) });
q("accRoles", "Rollen", "Welche Rollen gibt es?", [
  ["👑", "Inhaber / Admin", ""], ["🧑‍💼", "Teamleiter", ""], ["👷", "Mitarbeiter", ""], ["🛍️", "Kunde", ""], ["👀", "Nur lesen", ""]], { if: NG(iff("gAccounts", "Verschiedene Rollen")) });
q("accRights", "Rechte", "Was dürfen normale Mitarbeiter?", [
  ["👀", "Alles sehen", ""], ["🙋", "Nur eigene Daten sehen", ""], ["✏️", "Bearbeiten", ""], ["🗑️", "Löschen", ""], ["💶", "Preise & Umsätze sehen", ""]],
  { l: 2, if: NG(iff("gAccounts", "Verschiedene Rollen")) });
q("accSec", "Sicherheit", "Welche Sicherheitsfunktionen?", [
  ["🔁", "Passwort zurücksetzen", ""], ["📲", "Zwei-Faktor-Anmeldung", ""], ["⏲️", "Automatisch abmelden", ""], ["🗑️", "Konto selbst löschen", ""]], { l: 3, if: NG(hasAcc) });
q("accProfile", "Profil", "Was gehört zum Nutzerprofil?", [
  ["👤", "Name", ""], ["🖼️", "Foto", ""], ["📞", "Telefon", ""], ["🏠", "Adresse", ""], ["🎂", "Geburtstag", ""]], { l: 3, if: NG(hasAcc) });

sec("dmod", "Daten im Detail", "🗃️", "Suchen, Import, Export und Sicherung.");
q("dmSearch", "Suchen & Filtern", "Wie findet man Einträge wieder?", [
  ["🔍", "Suche", ""], ["🎚️", "Filter", ""], ["↕️", "Sortieren", ""], ["💾", "Gespeicherte Ansichten", ""]], { l: 2, if: NG(a => a.gData !== undefined && !has(a, "gData", "Nichts")) });
q("dmIO", "Import & Export", "Was soll rein und raus können?", [
  ["📥", "Excel importieren", ""], ["📤", "Excel exportieren", ""], ["📄", "PDF erzeugen", ""], ["🖨️", "Drucken", ""], ["➖", "Nichts davon", "", "x"]], { l: 2, if: NG(a => a.gData !== undefined && !has(a, "gData", "Nichts")) });
q("dmFiles", "Dateien", "Welche Dateien werden hochgeladen?", [
  ["📸", "Fotos", ""], ["📄", "PDFs", ""], ["🎥", "Videos", ""], ["📊", "Office-Dateien", ""]], { l: 2, if: NG(iff("gData", "Bilder & Dateien")) });
q("dmHistory", "Änderungen", "Soll nachvollziehbar sein, wer was geändert hat?", [
  ["📜", "Ja, mit Verlauf", ""], ["🗑️", "Papierkorb zum Wiederherstellen", ""], ["➖", "Nicht nötig", "", "x"]], { l: 3, if: NG(a => a.gData !== undefined && !has(a, "gData", "Nichts")) });
q("dmBackup", "Sicherung", "Wie oft sollen die Daten gesichert werden?", [["📅", "Täglich", ""], ["🗓️", "Wöchentlich", ""], ["🤷", "Egal, Hauptsache sicher", ""]], { l: 3, if: NG(a => a.gData !== undefined && !has(a, "gData", "Nichts")) });

sec("notify", "Benachrichtigungen", "🔔", "Wann und wie es Bescheid gibt.");
q("nWhen", "Anlass", "Wann soll es Bescheid geben?", [
  ["➖", "Keine", "", "x"], ["⏰", "Erinnerungen an Termine & Fristen", ""], ["📩", "Neue Nachricht oder Anfrage", ""], ["🔄", "Wenn sich ein Status ändert", ""],
  ["📰", "Tägliche Zusammenfassung", ""], ["📣", "Neuigkeiten & Angebote", ""]], { if: NG() });
q("nHow", "Weg", "Auf welchem Weg?", [
  ["📲", "Push aufs Handy", ""], ["📧", "E-Mail", ""], ["💬", "SMS", ""], ["🟢", "WhatsApp", ""], ["🔔", "Nur in der App", ""]], { l: 2, if: NG(notifyOn) });
q("nWho", "Empfänger", "Wer bekommt die Benachrichtigungen?", [["🙋", "Ich", ""], ["👷", "Mitarbeiter", ""], ["🛍️", "Kunden", ""]], { l: 3, if: NG(notifyOn) });

sec("design", "Design im Detail", "🎨", "Farben, Schrift, Logo und Bilder.");
q("deColors", "Farben", "Welche Farben?", [
  ["🔵", "Blau", ""], ["🟢", "Grün", ""], ["🔴", "Rot", ""], ["🟠", "Orange", ""], ["🟣", "Lila", ""], ["⚫", "Schwarz-Weiß", ""], ["🌸", "Pastell", ""], ["🏷️", "Meine Markenfarben", ""]],
  { l: 2, if: NG() });
q("deLogo", "Logo", "Wie sieht es mit einem Logo aus?", [["✅", "Habe eins", ""], ["🆕", "Soll mitentworfen werden", ""], ["🔤", "Nur der Name als Schriftzug", ""]], { l: 2, if: NG() });
q("deFont", "Schrift", "Welche Art Schrift?", [["🔤", "Modern und schlicht", ""], ["📜", "Klassisch", ""], ["🎈", "Verspielt", ""], ["⌨️", "Technisch", ""]], { l: 3, if: NG() });
q("deImages", "Bilder", "Welche Art von Bildern?", [["📸", "Eigene Fotos", ""], ["🖼️", "Lizenzfreie Fotos", ""], ["🎨", "Illustrationen", ""], ["🔣", "Nur Symbole", ""]], { l: 3, if: NG() });
q("deAnim", "Bewegung", "Wie viel Bewegung und Animation?", [["➖", "Keine", "", "x"], ["✨", "Dezent", ""], ["🎢", "Viel und verspielt", ""]], { l: 3, if: NG() });

sec("a11y", "Barrierefreiheit", "♿", "Damit es möglichst alle benutzen können.");
q("axNeeds", "Barrierefreiheit", "Worauf soll besonders geachtet werden?", [
  ["🔠", "Große Schrift", ""], ["🌗", "Starker Kontrast", ""], ["🔊", "Vorlesbar (Screenreader)", ""], ["💬", "Einfache Sprache", ""], ["⌨️", "Bedienung ohne Maus", ""],
  ["➖", "Nichts Besonderes", "Normale gute Bedienbarkeit.", "x"]], { l: 3, if: NG() });

sec("legal", "Recht & Datenschutz", "⚖️", "Pflichtangaben und Umgang mit Daten.");
q("lgDocs", "Rechtstexte", "Welche Rechtstexte werden gebraucht?", [
  ["📇", "Impressum", ""], ["🔒", "Datenschutzerklärung", ""], ["📜", "AGB", ""], ["🍪", "Cookie-Einwilligung", ""], ["📬", "Einwilligung für Newsletter", ""], ["🤷", "Weiß nicht, bitte prüfen", "", "x"]],
  { l: 2, if: NG() });
q("lgData", "Datenrechte", "Was sollen Nutzer mit ihren Daten tun können?", [
  ["📤", "Daten herunterladen", ""], ["🗑️", "Alles löschen lassen", ""], ["⏳", "Automatisch löschen nach Zeit", ""]], { l: 3, if: NG(hasAcc) });
q("lgKids", "Kinder", "Wie werden Kinder geschützt?", [
  ["👪", "Eltern müssen zustimmen", ""], ["🚫", "Keine Werbung", ""], ["🔒", "Keine Chats mit Fremden", ""], ["📉", "So wenig Daten wie möglich", ""]], { l: 2, if: NG(iff("gAudience", "Kinder")) });

sec("ops", "Betrieb & Pflege", "🛠️", "Was nach dem Start passiert.");
q("opMaint", "Wartung", "Wer kümmert sich nach dem Start darum?", [
  ["🙋", "Ich selbst", ""], ["🧑‍💻", "Jemand Technisches", ""], ["🧘", "Möglichst wartungsfrei", "Soll einfach laufen."]], { l: 2, if: NG() });
q("opSupport", "Hilfe für Nutzer", "Wie bekommen Nutzer Hilfe?", [
  ["❓", "FAQ", ""], ["✉️", "Kontaktformular", ""], ["💬", "Chat", ""], ["🎥", "Anleitung oder Video", ""], ["➖", "Brauchen keine", "", "x"]], { l: 3, if: NG() });
q("opStats", "Nutzungsstatistik", "Willst du sehen, wie es genutzt wird?", [
  ["➖", "Nein", "", "x"], ["🛡️", "Anonym und datenschutzfreundlich", ""], ["📊", "Ausführlich", ""]], { l: 3, if: NG() });
q("opLater", "Später", "Was könnte später dazukommen?", [
  ["👥", "Viel mehr Nutzer", ""], ["🧩", "Weitere Funktionen", ""], ["📱", "App-Version", ""], ["🌍", "Weitere Sprachen", ""], ["➖", "Nichts geplant", "", "x"]], { l: 4, if: NG() });

/* ---------- Erweiterung: mehr Tiefe je Stufe (Ziel ca. 25 / 50 / 75 / 100 Fragen) ---------- */
const at = id => { _sec = id; }; /* weitere Fragen an einen bestehenden Bereich anhängen */
const yesNo = (yes, no) => [["✅", yes || "Ja", ""], ["➖", no || "Nein", "", "x"]];

/* Gemeinsam für alle Nicht-Spiele */
at("gbasics");
q("gPriority", "Wichtigstes", "Was ist dir am wichtigsten?", [
  ["👌", "Kinderleicht zu bedienen", ""], ["⚡", "Schnell", ""], ["✨", "Schön", ""], ["🔒", "Sicher", ""], ["💶", "Günstig im Betrieb", ""], ["🧰", "Viele Funktionen", ""]], { l: 2, if: NG() });
at("gplatform");
q("gScreens", "Bildschirmgrößen", "Auf welchen Bildschirmen muss es gut aussehen?", [
  ["📱", "Handy", ""], ["📲", "Tablet", ""], ["💻", "Laptop", ""], ["🖥️", "Großer Monitor", ""], ["📺", "Fernseher / Wandbildschirm", ""]], { l: 2, if: NG() });
q("gFormats", "Formate", "Wie sollen Datum, Uhrzeit und Geld angezeigt werden?", [
  ["🇩🇪", "Deutsch (28.10.2026, 12,50 €)", ""], ["🌍", "International", ""], ["🔀", "Je nach Sprache des Nutzers", ""]], { l: 4, if: NG() });
q("gTimezone", "Zeitzonen", "Gibt es Nutzer in anderen Zeitzonen?", [["🇩🇪", "Nein, nur Deutschland", "", "x"], ["🌐", "Ja, mehrere Zeitzonen", ""]], { l: 4, if: NG() });
at("gbiz");
q("gMvp", "Erste Version", "Wie umfangreich soll die erste Version sein?", [
  ["🌱", "Nur das Nötigste", "Schnell ausprobieren, später erweitern."], ["🧱", "Solide Grundversion", ""], ["🏰", "Gleich komplett", ""]], { l: 2, if: NG() });
q("gTest", "Testen", "Wie soll vor dem Start getestet werden?", [
  ["🙋", "Ich teste selbst", ""], ["👥", "Mit ein paar echten Nutzern", ""], ["🤖", "Automatische Tests", "Die KI schreibt Tests mit."]], { l: 3, if: NG() });
at("design");
q("deTone", "Ansprache", "Wie sollen Texte die Nutzer ansprechen?", [["🙂", "Per Du", ""], ["🎩", "Per Sie", ""], ["⚪", "Neutral, ohne Anrede", ""]], { l: 2, if: NG() });
q("deDensity", "Platz", "Wie viel soll auf einen Bildschirm passen?", [["🌬️", "Luftig, wenig auf einmal", ""], ["⚖️", "Ausgewogen", ""], ["📋", "Kompakt, viel Info", ""]], { l: 3, if: NG() });
q("deIcons", "Symbole", "Welcher Symbol-Stil?", [["◻️", "Umrisse", ""], ["◼️", "Gefüllt", ""], ["🌈", "Bunt", ""], ["😀", "Emojis", ""]], { l: 4, if: NG() });
q("deCorners", "Ecken", "Wie sollen Knöpfe und Kästen aussehen?", [["⬜", "Eckig", ""], ["🔲", "Leicht abgerundet", ""], ["⚪", "Sehr rund", ""]], { l: 4, if: NG() });
q("deLoading", "Laden", "Was sieht man, während etwas lädt?", [["🔄", "Drehender Kreis", ""], ["▭", "Graue Platzhalter", "Wie bei YouTube."], ["📶", "Fortschrittsbalken", ""]], { l: 4, if: NG() });
q("deSound", "Töne", "Soll es Töne geben?", [["🔇", "Keine", "", "x"], ["🔈", "Dezent bei wichtigen Aktionen", ""]], { l: 4, if: NG() });
q("deErrors", "Fehlermeldungen", "Wie sollen Fehlermeldungen klingen?", [["💬", "Freundlich mit Lösungsvorschlag", ""], ["📏", "Kurz und sachlich", ""]], { l: 4, if: NG() });
at("dmod");
q("dmEmpty", "Leerer Start", "Wie sieht es aus, solange noch nichts eingetragen ist?", [["🧪", "Mit Beispieldaten", ""], ["💡", "Leer mit Hilfetext", ""]], { l: 3, if: NG() });
q("dmUndo", "Rückgängig", "Wie werden Versehen verhindert?", [["↩️", "Rückgängig-Knopf", ""], ["❓", "Nachfragen vor dem Löschen", ""], ["🗑️", "Papierkorb", ""]], { l: 3, if: NG() });
q("dmLimit", "Speicherplatz", "Gibt es eine Grenze, wie viel jemand speichern darf?", [["♾️", "Nein", "", "x"], ["📏", "Ja, pro Nutzer begrenzt", ""]], { l: 4, if: NG(hasAcc) });
at("acc");
q("accDevices", "Mehrere Geräte", "Darf man auf mehreren Geräten gleichzeitig angemeldet sein?", yesNo(), { l: 4, if: NG(hasAcc) });
at("a11y");
q("axMotion", "Weniger Bewegung", "Sollen Animationen für Menschen abschaltbar sein, denen davon schwindelig wird?", yesNo(), { l: 4, if: NG() });
at("legal");
q("lgAge", "Mindestalter", "Gibt es ein Mindestalter?", [["➖", "Nein", "", "x"], ["1️⃣3️⃣", "Ab 13", ""], ["1️⃣6️⃣", "Ab 16", ""], ["🔞", "Ab 18", ""]], { l: 4, if: NG() });
at("ops");
q("opUpdates", "Updates", "Wie erfahren Nutzer von neuen Versionen?", [["🔔", "Hinweis „Neu in dieser Version“", ""], ["📜", "Liste aller Änderungen", ""], ["🤫", "Gar nicht, läuft still", "", "x"]], { l: 4, if: NG() });
q("opFeedback", "Rückmeldung", "Wie können Nutzer Feedback geben?", [["💬", "Feedback-Knopf", ""], ["⭐", "Um Bewertung bitten", ""], ["📊", "Kurze Umfrage", ""], ["➖", "Gar nicht", "", "x"]], { l: 4, if: NG() });
q("opMonitor", "Fehler bemerken", "Wie merkst du, wenn etwas kaputt ist?", [["📧", "Automatische Fehlerberichte", ""], ["🟢", "Statusseite", ""], ["👂", "Nutzer melden sich", "", "x"]], { l: 4, if: NG() });

/* Handy-App */
at("app");
const app = (l, f) => ({ l, if: f ? and(K("Handy-App"), f) : K("Handy-App") });
q("aUse", "Nutzungshäufigkeit", "Wie oft wird die App benutzt?", [["🔁", "Mehrmals täglich", ""], ["📅", "Täglich", ""], ["🗓️", "Ein paar Mal pro Woche", ""], ["🕐", "Nur bei Bedarf", ""]], app(1));
q("aHome", "Startbildschirm", "Was sieht man direkt beim Öffnen?", [["🕘", "Zuletzt Genutztes", ""], ["📊", "Übersicht mit Zahlen", ""], ["📋", "Liste", ""], ["🔍", "Suche", ""], ["➕", "Großer Plus-Knopf", ""]], app(2));
q("aCreate", "Neu anlegen", "Wie legt man etwas Neues an?", [["➕", "Plus-Knopf unten", ""], ["↗️", "Knopf oben rechts", ""], ["⚡", "Schnelleingabe in einer Zeile", ""], ["🎤", "Per Sprache", ""], ["📷", "Per Foto", ""]], app(2));
q("aList", "Listen", "Wie sollen Listen aussehen?", [["🃏", "Karten", ""], ["📏", "Kompakte Zeilen", ""], ["▦", "Raster mit Bildern", ""], ["📅", "Nach Datum gruppiert", ""]], app(2));
q("aDetail", "Details", "Wie öffnet man einen Eintrag?", [["📄", "Eigene Seite", ""], ["🔽", "Aufklappen", ""], ["⬆️", "Fenster von unten", ""]], app(2));
q("aSync", "Geräte", "Wo sind die Daten verfügbar?", [["📱", "Nur auf diesem Handy", ""], ["🔄", "Auf allen Geräten mit Konto", ""], ["👥", "Mit anderen geteilt", ""]], app(2));
q("aShare", "Teilen", "Was kann man mit anderen teilen?", [["🔗", "Link", ""], ["🖼️", "Bild", ""], ["📄", "PDF", ""], ["✍️", "Gemeinsam bearbeiten", ""], ["➖", "Nichts", "", "x"]], app(2));
q("aLocation", "Standort", "Wofür wird der Standort genutzt?", [["📍", "Dinge in der Nähe finden", ""], ["🛤️", "Strecken aufzeichnen", ""], ["📌", "Orte speichern", ""], ["🛰️", "Auch im Hintergrund", ""]], app(2, iff("aDevice", "Standort")));
q("aCamera", "Kamera", "Wofür wird die Kamera genutzt?", [["📸", "Fotos speichern", ""], ["🔳", "QR- oder Barcode scannen", ""], ["📄", "Dokumente scannen", ""], ["🔤", "Text erkennen", ""], ["🎥", "Video", ""]], app(2, iff("aDevice", "Kamera")));
q("aSettings", "Einstellungen", "Was kann man einstellen?", [["🔔", "Benachrichtigungen", ""], ["🌗", "Hell / Dunkel", ""], ["🌍", "Sprache", ""], ["👤", "Konto", ""], ["📤", "Daten exportieren", ""], ["❓", "Hilfe", ""]], app(3));
q("aSearch", "Suche", "Wo ist die Suche?", [["🔝", "Immer oben sichtbar", ""], ["🔍", "Eigener Bereich", ""], ["➖", "Nicht nötig", "", "x"]], app(3));
q("aLock", "App sperren", "Soll man die App extra sperren können?", [["🔢", "Mit PIN", ""], ["🔐", "Mit Face ID / Fingerabdruck", ""], ["➖", "Nein", "", "x"]], app(3));
q("aBadge", "Zahl am Symbol", "Soll am App-Symbol eine Zahl stehen (z. B. offene Aufgaben)?", yesNo(), app(3));
q("aStats", "Rückblick", "Sollen Nutzer ihren Verlauf sehen?", [["📅", "Wochenübersicht", ""], ["📈", "Diagramme", ""], ["🎉", "Monats- oder Jahresrückblick", ""], ["➖", "Nein", "", "x"]], app(3));
q("aRate", "Bewertung", "Soll die App um eine Store-Bewertung bitten?", [["⭐", "Ja, nach ein paar Nutzungen", ""], ["➖", "Nie", "", "x"]], app(3));
q("aLinks", "Links", "Sollen Links (z. B. aus E-Mails) direkt in der App öffnen?", yesNo(), app(3));
q("aIcon", "App-Symbol", "Wie soll das App-Symbol aussehen?", [["🏷️", "Mein Logo", ""], ["🔤", "Ein Buchstabe", ""], ["🖼️", "Ein Bild", ""], ["🎨", "Mehrere zur Auswahl", ""]], app(4));
q("aSplash", "Startbild", "Was erscheint beim Laden?", [["🏷️", "Logo auf Farbe", ""], ["🎬", "Kurze Animation", ""], ["➖", "Nichts", "", "x"]], app(4));
q("aOrient", "Querformat", "Soll die App auch im Querformat gehen?", [["📱", "Nur Hochformat", ""], ["🔄", "Auch quer", ""]], app(4));
q("aFontScale", "Schriftgröße", "Soll die Schriftgröße des Handys übernommen werden?", yesNo("Ja", "Nein, feste Größe"), app(4));
q("aBackup", "Sicherung", "Wie sichert man seine Daten?", [["☁️", "iCloud / Google automatisch", ""], ["📤", "Export als Datei", ""], ["➖", "Gar nicht", "", "x"]], app(4));
q("aStore", "Store-Eintrag", "Was soll für den App-Store vorbereitet werden?", [["🖼️", "Screenshots", ""], ["🎥", "Vorschau-Video", ""], ["🇩🇪", "Beschreibung Deutsch", ""], ["🇬🇧", "Beschreibung Englisch", ""]], app(4));
q("aBeta", "Vorab-Test", "Wie wird vor dem Start getestet?", [["✈️", "TestFlight / Testkanal", ""], ["👫", "Mit Freunden", ""], ["➖", "Gar nicht", "", "x"]], app(4));
q("aOldPhones", "Ältere Handys", "Muss es auf älteren Handys laufen?", [["🆕", "Nur neuere", ""], ["📱", "Auch 5 Jahre alte", ""]], app(4));

/* Website */
at("wsite");
const ws = (l, f) => ({ l, if: f ? and(K("Website"), f) : K("Website") });
q("wSize", "Umfang", "Wie groß wird die Website?", [["1️⃣", "Eine einzige Seite", ""], ["🔢", "3–5 Seiten", ""], ["📚", "6–15 Seiten", ""], ["🏛️", "Mehr", ""]], ws(1));
q("wNav", "Menü", "Wie soll das Menü aussehen?", [["⬆️", "Oben als Leiste", ""], ["☰", "Aufklappmenü", ""], ["◀️", "Seitlich", ""], ["⬇️", "Am Handy unten fixiert", ""]], ws(2));
q("wHero", "Kopfbereich", "Was steht ganz oben auf der Startseite?", [["💬", "Slogan mit Knopf", ""], ["🖼️", "Großes Bild", ""], ["🎥", "Video", ""], ["🎞️", "Wechselnde Bilder", ""], ["📝", "Direkt ein Formular", ""]], ws(2));
q("wFooter", "Fußzeile", "Was gehört in die Fußzeile?", [["📞", "Kontakt", ""], ["🕒", "Öffnungszeiten", ""], ["📱", "Social Media", ""], ["📬", "Newsletter", ""], ["🗺️", "Mini-Karte", ""], ["⚖️", "Impressum & Datenschutz", ""]], ws(3));
q("wTrust", "Vertrauen", "Was soll Vertrauen schaffen?", [["💬", "Kundenstimmen", ""], ["🏢", "Logos von Kunden", ""], ["🔢", "Zahlen & Erfolge", ""], ["🏅", "Siegel & Zertifikate", ""], ["🔀", "Vorher / Nachher", ""]], ws(3));
q("wButtons", "Knöpfe", "Wie auffällig sollen Aktions-Knöpfe sein?", [["🚨", "Sehr auffällig", ""], ["🙂", "Dezent", ""]], ws(3));
q("wPopup", "Einblendungen", "Soll es Einblendungen geben?", [["➖", "Keine", "", "x"], ["📬", "Newsletter-Hinweis", ""], ["🏷️", "Aktion oder Rabatt", ""]], ws(3));
q("wSpeed", "Ladezeit", "Wie wichtig ist blitzschnelles Laden?", [["⚡", "Sehr wichtig", ""], ["🙂", "Normal", ""]], ws(3));
q("wBooking", "Terminbuchung", "Wie werden Termine gebucht?", [["🧩", "Fertiges Buchungstool einbinden", ""], ["📝", "Eigenes Formular", ""], ["📞", "Anruf-Knopf", ""]], ws(3, iff("wGoal", "Termin buchen")));
q("wFavicon", "Tab-Symbol", "Welches Symbol im Browser-Tab?", [["🏷️", "Mein Logo", ""], ["🔤", "Anfangsbuchstabe", ""]], ws(4));
q("wSharePrev", "Vorschau beim Teilen", "Soll beim Teilen in WhatsApp & Co. ein schönes Vorschaubild erscheinen?", yesNo(), ws(4));
q("w404", "Fehlerseite", "Wie sieht die Seite „Nicht gefunden“ aus?", [["😄", "Witzig mit Link zur Startseite", ""], ["📏", "Schlicht", ""]], ws(4));
q("wTop", "Nach oben", "Soll es einen „Nach oben“-Knopf geben?", yesNo(), ws(4));
q("wSticky", "Fixes Menü", "Soll das Menü beim Scrollen sichtbar bleiben?", yesNo(), ws(4));
q("wSitemap", "Für Suchmaschinen", "Was soll für Google vorbereitet werden?", [["🗺️", "Sitemap", ""], ["⭐", "Sterne & Infos in Suchergebnissen", ""], ["🏷️", "Seitentitel & Beschreibungen", ""]], ws(4));
q("wMove", "Umzug", "Gibt es eine alte Website, deren Links weiter funktionieren sollen?", yesNo(), ws(4));
q("wBanner", "Hinweisleiste", "Soll man oben kurz Hinweise einblenden können (z. B. „Betriebsurlaub“)?", yesNo(), ws(4));

/* Programm zum Arbeiten */
at("work");
const wkq = (l, f) => ({ l, if: f ? and(K("Programm zum Arbeiten"), f) : K("Programm zum Arbeiten") });
q("wkGoal", "Ziel", "Was soll durch das Programm besser werden?", [["⏳", "Zeit sparen", ""], ["🎯", "Weniger Fehler", ""], ["👀", "Besserer Überblick", ""], ["📄", "Weg vom Papier", ""], ["😊", "Zufriedenere Kunden", ""]], wkq(1));
q("wkMobile", "Unterwegs", "Was muss unterwegs funktionieren?", [["📶", "Ohne Internet beim Kunden", ""], ["📸", "Fotos zur Dokumentation", ""], ["✍️", "Unterschrift auf dem Tablet", ""], ["🧭", "Navigation zum Kunden", ""]], wkq(3, iff("wkWhere", "Unterwegs beim Kunden", "Überall")));
q("wkTemplates", "Vorlagen", "Welche Vorlagen soll es geben?", [["✉️", "Briefe", ""], ["📧", "E-Mails", ""], ["☑️", "Checklisten", ""], ["📄", "Formulare", ""]], wkq(3));
q("wkStart", "Startseite", "Was steht auf der Startseite?", [["📌", "Heute fällig", ""], ["🔢", "Wichtige Zahlen", ""], ["📅", "Kalender", ""], ["✅", "Meine Aufgaben", ""]], wkq(3));
q("wkNumbers", "Nummern", "Wie sollen Nummern aufgebaut sein (z. B. Rechnungsnummer)?", [["🔢", "Einfach fortlaufend", ""], ["📅", "Mit Jahr (2026-0001)", ""], ["🏷️", "Mit Kürzel (RE-0001)", ""]], wkq(4));
q("wkFields", "Eigene Felder", "Sollen eigene Felder ergänzt werden können?", yesNo(), wkq(4));
q("wkTags", "Schlagwörter", "Sollen Einträge mit Schlagwörtern markiert werden können?", yesNo(), wkq(4));
q("wkSites", "Standorte", "Gibt es mehrere Firmen oder Standorte?", [["1️⃣", "Nein, einer", "", "x"], ["🏬", "Mehrere Standorte", ""], ["🏢", "Mehrere Firmen", ""]], wkq(4));
q("wkBulk", "Massenbearbeitung", "Sollen viele Einträge auf einmal geändert werden können?", yesNo(), wkq(4));
q("wkHolidays", "Feiertage", "Sollen Feiertage und Betriebsurlaub berücksichtigt werden?", yesNo(), wkq(4));
q("wkCurrency", "Währungen", "Welche Währungen?", [["💶", "Nur Euro", ""], ["💱", "Mehrere", ""]], wkq(4));
q("wkArchive", "Archiv", "Was passiert mit alten Einträgen?", [["📦", "Archivieren", ""], ["🗑️", "Nach Frist löschen", ""], ["📌", "Alles bleibt", ""]], wkq(4));
q("wkKeys", "Tastenkürzel", "Soll man schnell per Tastatur arbeiten können?", yesNo(), wkq(4));

/* Online-Shop */
at("shop");
const sh = (l, f) => ({ l, if: f ? and(K("Online-Shop"), f) : K("Online-Shop") });
q("sHome", "Shop-Startseite", "Was steht auf der Startseite des Shops?", [["🏆", "Bestseller", ""], ["🆕", "Neuheiten", ""], ["🗂️", "Kategorien", ""], ["🖼️", "Großes Aktionsbanner", ""]], sh(2));
q("sProduct", "Produktseite", "Was gehört auf jede Produktseite?", [["🖼️", "Mehrere Bilder", ""], ["🎥", "Video", ""], ["🔍", "Zoom", ""], ["📏", "Größentabelle", ""], ["🔗", "Ähnliche Produkte", ""], ["🚚", "Lieferzeit", ""]], sh(3));
q("sCart", "Warenkorb", "Wie soll der Warenkorb funktionieren?", [["➡️", "Klappt seitlich auf", ""], ["📄", "Eigene Seite", ""], ["🎁", "Zeigt „noch X € bis Gratisversand“", ""]], sh(3));
q("sCheckout", "Kasse", "Wie läuft die Kasse ab?", [["1️⃣", "Alles auf einer Seite", ""], ["🪜", "Schritt für Schritt", ""], ["⚡", "Express-Kauf mit einem Klick", ""]], sh(3));
q("sNews", "Newsletter", "Soll es einen Newsletter geben?", [["🏷️", "Ja, mit Rabatt bei Anmeldung", ""], ["📬", "Ja, ohne Rabatt", ""], ["➖", "Nein", "", "x"]], sh(3));
q("sAdmin", "Bestellungen verwalten", "Was brauchst du zum Abarbeiten der Bestellungen?", [["📋", "Bestellliste", ""], ["🚦", "Status setzen", ""], ["🏷️", "Versandetiketten drucken", ""], ["🧾", "Rechnung erzeugen", ""]], sh(3));
q("sMinOrder", "Mindestbestellwert", "Gibt es einen Mindestbestellwert?", yesNo(), sh(3));
q("sCross", "Dazu passend", "Sollen passende Produkte vorgeschlagen werden?", yesNo(), sh(4));
q("sGift", "Geschenk", "Soll es Geschenkverpackung oder Grußkarte geben?", yesNo(), sh(4, shopPhys));
q("sAgeCheck", "Altersprüfung", "Braucht es eine Altersprüfung (z. B. Alkohol)?", yesNo(), sh(4));
q("sB2B", "Geschäftskunden", "Gibt es eigene Preise für Firmenkunden?", yesNo(), sh(4));
q("sCurrencies", "Währungen", "In welchen Währungen?", [["💶", "Nur Euro", ""], ["💱", "Mehrere", ""]], sh(4));
q("sMaxQty", "Höchstmenge", "Gibt es eine Höchstmenge pro Kunde?", yesNo(), sh(4));
q("sPriceShow", "Preisanzeige", "Wie werden Preise angezeigt?", [["💶", "Mit MwSt. (Privatkunden)", ""], ["🧾", "Ohne MwSt. (Firmenkunden)", ""], ["🔀", "Umschaltbar", ""]], sh(4));
q("sWishDate", "Wunschtermin", "Können Kunden einen Liefertermin wählen?", yesNo(), sh(4, shopPhys));
/* KI-Assistent */
at("bot");
const bt = (l, f) => ({ l, if: f ? and(K("KI-Assistent / Chatbot"), f) : K("KI-Assistent / Chatbot") });
q("bStart", "Begrüßung", "Wie beginnt ein Gespräch?", [["👋", "Begrüßt von sich aus", ""], ["⌛", "Wartet auf eine Frage", ""], ["🔘", "Mit Vorschlags-Knöpfen", "z. B. „Öffnungszeiten“, „Termin buchen“."]], bt(1));
q("bLength", "Antwortlänge", "Wie lang sollen Antworten sein?", [["✂️", "Kurz", ""], ["⚖️", "Mittel", ""], ["📜", "Ausführlich", ""]], bt(2));
q("bSources", "Quellen", "Soll er sagen, woher eine Antwort stammt?", [["🔗", "Ja, mit Link", ""], ["➖", "Nein", "", "x"]], bt(2));
q("bLang", "Sprachen", "In welcher Sprache antwortet er?", [["🌍", "In der Sprache des Nutzers", ""], ["🇩🇪", "Immer Deutsch", ""]], bt(2));
q("bLook", "Chatfenster", "Wie sieht das Chatfenster aus?", [["💬", "Blase unten rechts", ""], ["🖥️", "Ganze Seite", ""], ["🧩", "In eine Seite eingebettet", ""]], bt(2, iff("bWhere", "Auf meiner Website", "In einer eigenen App")));
q("bAvatar", "Gesicht", "Hat der Assistent ein Gesicht?", [["🏷️", "Logo", ""], ["🧸", "Eine Figur", ""], ["🙂", "Foto einer Person", ""], ["➖", "Keins", "", "x"]], bt(2));
q("bFiles", "Dateien", "Darf man ihm Dateien schicken?", [["🖼️", "Bilder", ""], ["📄", "PDFs", ""], ["➖", "Nein", "", "x"]], bt(2));
q("bLeads", "Kontaktdaten", "Soll er nach Kontaktdaten fragen?", [["📝", "Ja, vor dem Gespräch", ""], ["🤝", "Ja, wenn es nötig wird", ""], ["➖", "Nein", "", "x"]], bt(3));
q("bActions", "Darf handeln", "Darf er selbst Dinge erledigen?", [["📅", "Termine eintragen", ""], ["🛒", "Bestellungen anlegen", ""], ["📧", "E-Mails senden", ""], ["💬", "Nur antworten", "", "x"]], bt(3));
q("bConfirm", "Bestätigen", "Muss der Nutzer Aktionen vorher bestätigen?", [["✅", "Immer", ""], ["🚀", "Nie", ""]], bt(3, a => has(a, "bActions", "Termine eintragen", "Bestellungen anlegen", "E-Mails senden")));
q("bRefresh", "Wissen aktuell halten", "Wie bleibt sein Wissen aktuell?", [["🔄", "Automatisch täglich", ""], ["✋", "Ich aktualisiere von Hand", ""]], bt(3));
q("bRate", "Bewerten", "Sollen Nutzer Antworten bewerten können (Daumen hoch/runter)?", yesNo(), bt(3));
q("bKeep", "Gespräche speichern", "Wie lange werden Gespräche aufbewahrt?", [["🚫", "Gar nicht", ""], ["📅", "30 Tage", ""], ["♾️", "Unbegrenzt", ""]], bt(3));
q("bAbuse", "Missbrauch", "Was passiert bei Beleidigungen oder Spam?", [["⚠️", "Warnen", ""], ["🛑", "Gespräch beenden", ""], ["🔢", "Nachrichten pro Person begrenzen", ""]], bt(3));
q("bTyping", "Schreibanzeige", "Soll „schreibt …“ angezeigt werden, während er antwortet?", yesNo(), bt(4));
q("bFollow", "Folgefragen", "Soll er passende Folgefragen vorschlagen?", yesNo(), bt(4));
q("bSpeak", "Vorlesen", "Soll man sich Antworten vorlesen lassen können?", yesNo(), bt(4));
q("bEmoji", "Emojis", "Darf er Emojis benutzen?", yesNo(), bt(4));
q("bAiNote", "KI-Hinweis", "Soll klar dastehen, dass es eine KI ist?", [["🤖", "Ja, deutlich", ""], ["🔹", "Klein im Fenster", ""]], bt(4));
q("bTestQs", "Testfragen", "Soll es eine Liste mit Testfragen geben, um die Qualität zu prüfen?", yesNo(), bt(4));
q("bMaxMsgs", "Nachrichtenlimit", "Wie viele Nachrichten pro Person und Tag?", [["♾️", "Unbegrenzt", ""], ["🔢", "Begrenzt", "Schützt vor hohen Kosten."]], bt(4));
q("bOffHours", "Außerhalb der Zeiten", "Was passiert, wenn kein Mensch erreichbar ist?", [["📝", "Nachricht hinterlassen", ""], ["🕒", "Zeiten nennen", ""]], bt(4, iff("bHuman", "Leitet an einen Menschen weiter")));

/* Automatisierung */
at("auto");
const au = (l, f) => ({ l, if: f ? and(K("Automatisierung"), f) : K("Automatisierung") });
q("auFilter", "Nur bestimmte Fälle", "Soll sie nur bei bestimmten Fällen laufen?", [["👤", "Bestimmter Absender", ""], ["🔤", "Stichwort im Text", ""], ["💶", "Ab einem Betrag", ""], ["♾️", "Immer", "", "x"]], au(2));
q("auTransform", "Verarbeiten", "Was soll mit den Daten unterwegs passieren?", [["🔎", "Felder herauslesen", ""], ["🧮", "Rechnen", ""], ["🌍", "Übersetzen", ""], ["🧠", "Zusammenfassen", ""], ["➖", "Nichts", "", "x"]], au(2));
q("auAttach", "Anhänge", "Was passiert mit Anhängen?", [["💾", "Speichern", ""], ["➡️", "Weiterleiten", ""], ["🙈", "Ignorieren", ""]], au(2, iff("auTrigger", "Bei neuer E-Mail")));
q("auDone", "Erfolgsmeldung", "Willst du Bescheid bekommen, wenn alles geklappt hat?", yesNo(), au(2));
q("auAccess", "Zugänge", "Welche Zugänge hast du schon?", [["🟦", "Google-Konto", ""], ["🟧", "Microsoft-Konto", ""], ["🛒", "Shop-Zugang", ""], ["🔑", "API-Schlüssel", ""], ["🤷", "Weiß nicht", "", "x"]], au(2));
q("auWhere", "Läuft auf", "Wo soll sie laufen?", [["☁️", "In der Cloud", "Läuft auch, wenn dein PC aus ist."], ["💻", "Auf meinem Computer", ""], ["🗄️", "Auf einem eigenen Server", ""]], au(2));
q("auTexts", "Texte", "Wie entstehen Texte (z. B. E-Mails)?", [["📋", "Feste Vorlage", ""], ["🔤", "Vorlage mit Platzhaltern", "z. B. „Hallo {Name}“."], ["🧠", "KI formuliert", ""]], au(2, iff("auAction", "E-Mail senden", "Nachricht schicken")));
q("auDup", "Doppelte", "Sollen doppelte Einträge erkannt und übersprungen werden?", yesNo(), au(3));
q("auPause", "Pausen", "Soll sie an bestimmten Tagen pausieren?", [["🎄", "An Feiertagen", ""], ["🛌", "Am Wochenende", ""], ["➖", "Nie", "", "x"]], au(3));
q("auTest", "Testlauf", "Soll es einen Testmodus geben, der nichts wirklich verschickt?", yesNo(), au(3));
q("auCost", "Kosten", "Was darf das Werkzeug im Monat kosten?", [["0️⃣", "Nichts", "", "x"], ["💶", "Bis 20 €", ""], ["💰", "Mehr ist okay", ""]], au(3));
q("auSecret", "Passwörter", "Wie werden Passwörter und Schlüssel aufbewahrt?", [["🔐", "Sicher im Tresor des Dienstes", ""], ["🤷", "Weiß nicht, bitte sicher lösen", ""]], au(3));
q("auSteps", "Mehrere Schritte", "Gibt es mehrere Schritte nacheinander, die voneinander abhängen?", yesNo(), au(3));
q("auManual", "Nacharbeit", "Sollen Ergebnisse vor dem Weitergeben von Hand geprüft werden können?", yesNo(), au(3));
q("auTz", "Zeitzone", "In welcher Zeitzone laufen die Zeitpläne?", [["🇩🇪", "Deutschland", ""], ["🌍", "Andere", ""]], au(4, iff("auTrigger", "Zu festen Zeiten")));
q("auKeep", "Aufbewahren", "Wie lange sollen verarbeitete Daten aufbewahrt werden?", [["🚫", "Gar nicht", ""], ["📅", "30 Tage", ""], ["♾️", "Unbegrenzt", ""]], au(4));
q("auPanel", "Steuerung", "Willst du sie selbst an- und ausschalten können?", yesNo(), au(4));
q("auAlertTo", "Fehler an", "Wer bekommt Fehlermeldungen?", [["🙋", "Nur ich", ""], ["👥", "Mehrere Personen", ""]], au(4));
q("auDocs", "Anleitung", "Soll es eine Anleitung geben, wie alles funktioniert?", yesNo(), au(4));
q("auBatch", "Sammeln", "Sollen Dinge gesammelt und gebündelt verarbeitet werden?", [["⚡", "Einzeln sofort", ""], ["📦", "Gesammelt, z. B. einmal am Tag", ""]], au(4));
q("auLang", "Sprache der Texte", "In welcher Sprache sind die erzeugten Texte?", [["🇩🇪", "Deutsch", ""], ["🇬🇧", "Englisch", ""], ["🔀", "Je nach Empfänger", ""]], au(4));
q("auLimit", "Grenze", "Soll es eine Obergrenze pro Tag geben (Schutz vor Fehlern)?", yesNo(), au(4));
q("auHandover", "Übergabe", "Muss jemand anderes das später übernehmen können?", yesNo(), au(4));

/* Lern-App */
at("learn");
const ln = (l, f) => ({ l, if: f ? and(K("Lern-App / Quiz"), f) : K("Lern-App / Quiz") });
q("lStructure", "Aufbau", "Wie ist der Lernstoff aufgebaut?", [["📚", "Kapitel", ""], ["🧩", "Kurze Lektionen", ""], ["🎯", "Freie Auswahl", ""], ["🛤️", "Fester Lernpfad", ""]], ln(2));
q("lDuration", "Dauer", "Wie lange dauert eine Lerneinheit?", [["⚡", "2 Minuten", ""], ["☕", "5–10 Minuten", ""], ["📖", "20 Minuten und mehr", ""]], ln(2));
q("lMedia", "Medien", "Womit wird erklärt?", [["📝", "Texte", ""], ["🖼️", "Bilder", ""], ["🎥", "Videos", ""], ["🔊", "Audio", ""], ["🎞️", "Animationen", ""]], ln(2));
q("lHints", "Hilfen", "Welche Hilfen gibt es bei schweren Fragen?", [["💡", "Tipp", ""], ["✂️", "Zwei falsche Antworten streichen", ""], ["⏭️", "Überspringen", ""], ["➖", "Keine", "", "x"]], ln(2));
q("lRepeat", "Fehler wiederholen", "Sollen falsch beantwortete Fragen wiederkommen?", yesNo(), ln(2));
q("lRemind", "Erinnerung", "Soll an das Lernen erinnert werden?", [["⏰", "Täglich", ""], ["🗓️", "Ein paar Mal pro Woche", ""], ["➖", "Nein", "", "x"]], ln(2));
q("lMascot", "Maskottchen", "Soll eine Figur durch die App begleiten?", yesNo(), ln(2));
q("lStats", "Lernstatistik", "Was sieht der Lernende über sich?", [["📈", "Fortschritt pro Thema", ""], ["🎯", "Trefferquote", ""], ["⏱️", "Lernzeit", ""], ["💪", "Stärken & Schwächen", ""]], ln(3));
q("lBoard", "Rangliste", "Soll es eine Rangliste geben?", [["🏆", "Ja, mit allen", ""], ["👫", "Nur mit Freunden / Klasse", ""], ["➖", "Nein", "", "x"]], ln(3));
q("lAdapt", "Anpassung", "Soll sich die Schwierigkeit anpassen?", yesNo(), ln(3));
q("lTimer", "Zeitlimit", "Gibt es ein Zeitlimit pro Frage?", [["⏱️", "Ja", ""], ["🔀", "Nur im Prüfungsmodus", ""], ["➖", "Nein", "", "x"]], ln(3));
q("lShuffle", "Reihenfolge", "Sollen Fragen und Antworten gemischt werden?", yesNo(), ln(3));
q("lPass", "Bestehen", "Ab wann gilt ein Test als bestanden?", [["5️⃣0️⃣", "50 %", ""], ["7️⃣5️⃣", "75 %", ""], ["9️⃣0️⃣", "90 %", ""], ["➖", "Kein Bestehen nötig", "", "x"]], ln(3));
q("lOffline", "Offline lernen", "Soll man ohne Internet lernen können?", yesNo(), ln(3));
q("lParents", "Eltern", "Sollen Eltern den Fortschritt sehen?", yesNo(), ln(3, iff("gAudience", "Kinder", "Jugendliche")));
q("lSound", "Töne", "Soll es Töne für richtig und falsch geben?", yesNo(), ln(4));
q("lCelebrate", "Feiern", "Wie wird ein Erfolg gefeiert?", [["🎉", "Konfetti", ""], ["🏅", "Medaille", ""], ["🙂", "Kurzes Lob", ""]], ln(4));
q("lExport", "Lernstand exportieren", "Soll man seinen Lernstand exportieren können?", yesNo(), ln(4));
q("lCert", "Zertifikat-Design", "Wie sieht ein Zertifikat aus?", [["🏷️", "Mit meinem Logo", ""], ["📜", "Schlicht", ""], ["➖", "Kein Zertifikat", "", "x"]], ln(4));
q("lImport", "Fragen importieren", "In welchem Format kommen neue Fragen rein?", [["📗", "Excel / CSV", ""], ["✍️", "Formular in der App", ""], ["📄", "Aus Texten oder PDFs", ""]], ln(4));
q("lReport", "Bericht", "Soll es Berichte für Lehrer oder Chefs geben?", yesNo(), ln(4));
q("lRead", "Vorlesen", "Sollen Fragen vorgelesen werden können?", yesNo(), ln(4));
q("lFlag", "Fehler melden", "Sollen Lernende fehlerhafte Fragen melden können?", yesNo(), ln(4));
q("lOwn", "Eigene Karten", "Sollen Lernende eigene Karteikarten erstellen können?", yesNo(), ln(4));

/* Dashboard */
at("dash");
const da = (l, f) => ({ l, if: f ? and(K("Dashboard / Auswertung"), f) : K("Dashboard / Auswertung") });
q("dViewers", "Wer schaut", "Wer schaut sich das Dashboard an?", [["🙋", "Nur ich", ""], ["👥", "Mein Team", ""], ["👑", "Geschäftsführung", ""], ["🛍️", "Kunden", ""]], da(1));
q("dWhere", "Wo", "Wo wird es angeschaut?", [["💻", "Am PC", ""], ["📱", "Am Handy", ""], ["📺", "Auf einem Bildschirm an der Wand", ""]], da(1));
q("dCompare", "Vergleiche", "Womit sollen Zahlen verglichen werden?", [["📅", "Vorjahr", ""], ["🗓️", "Vormonat", ""], ["🎯", "Ziel", ""], ["📍", "Andere Standorte", ""], ["➖", "Nicht nötig", "", "x"]], da(2));
q("dPeriod", "Standardzeitraum", "Welcher Zeitraum ist voreingestellt?", [["📅", "Heute", ""], ["🗓️", "Diese Woche", ""], ["📆", "Dieser Monat", ""], ["📈", "Dieses Jahr", ""]], da(2));
q("dTargets", "Ziele", "Sollen Ziele eingetragen werden können?", yesNo(), da(2));
q("dDrill", "Details", "Soll man auf eine Zahl klicken und die Details dahinter sehen?", yesNo(), da(2));
q("dLayout", "Aufbau", "Wie ist das Dashboard aufgebaut?", [["1️⃣", "Alles auf einer Seite", ""], ["🗂️", "Mehrere Reiter", ""]], da(2));
q("dTraffic", "Ampelfarben", "Sollen gute und schlechte Werte farbig markiert werden?", yesNo(), da(2));
q("dInput", "Eingabe", "Wie werden Zahlen von Hand eingetragen?", [["📝", "Formular", ""], ["📗", "Tabelle hochladen", ""]], da(2, iff("dSrc", "Von Hand eingeben")));
q("dForecast", "Prognose", "Soll eine Prognose gezeigt werden?", yesNo(), da(3));
q("dNotes", "Kommentare", "Sollen Zahlen kommentiert werden können?", yesNo(), da(3));
q("dRights", "Sichtbarkeit", "Sehen alle dasselbe?", [["👀", "Ja", ""], ["🔒", "Jeder nur seinen Bereich", ""]], da(3));
q("dScheduled", "Geplante Berichte", "Sollen Berichte automatisch verschickt werden?", [["📅", "Täglich", ""], ["🗓️", "Wöchentlich", ""], ["📆", "Monatlich", ""], ["➖", "Nein", "", "x"]], da(3));
q("dAnomaly", "Auffälligkeiten", "Soll es ungewöhnliche Ausschläge automatisch markieren?", yesNo(), da(3));
q("dMobile", "Handy-Ansicht", "Wie sieht es am Handy aus?", [["📱", "Eigene vereinfachte Ansicht", ""], ["🔍", "Gleich wie am PC", ""]], da(3));
q("dHistory", "Zeitraum zurück", "Wie weit zurück sollen Daten reichen?", [["🗓️", "1 Jahr", ""], ["📆", "3 Jahre", ""], ["♾️", "Alles", ""]], da(3));
q("dDecimals", "Nachkommastellen", "Wie genau werden Zahlen angezeigt?", [["🔢", "Gerundet", ""], ["🧮", "Mit Nachkommastellen", ""]], da(4));
q("dFiscal", "Geschäftsjahr", "Wann beginnt das Geschäftsjahr?", [["📅", "1. Januar", ""], ["🗓️", "Anders", ""]], da(4));
q("dTv", "Präsentationsmodus", "Sollen Ansichten automatisch durchwechseln (für Wandbildschirme)?", yesNo(), da(4));
q("dPrint", "Drucklayout", "Soll es eine schöne Druckansicht geben?", yesNo(), da(4));
q("dGrain", "Feinheit", "Wie fein wird über die Zeit aufgeteilt?", [["🕐", "Stunden", ""], ["📅", "Tage", ""], ["🗓️", "Wochen", ""], ["📆", "Monate", ""]], da(4));
q("dLog", "Zugriffe", "Soll protokolliert werden, wer was angesehen hat?", yesNo(), da(4));
q("dEmbed", "Einbetten", "Soll das Dashboard in andere Seiten eingebettet werden können?", yesNo(), da(4));
q("dUnits", "Einheiten", "Welche Einheiten kommen vor?", [["💶", "Euro", ""], ["🔢", "Stück", ""], ["⏱️", "Stunden", ""], ["％", "Prozent", ""]], da(4));
q("dDark", "Dunkel", "Soll es eine dunkle Ansicht geben (gut für Wandbildschirme)?", yesNo(), da(4));

/* Etwas anderes */
sec("other", "Dein Projekt", "🧩", "Damit auch ungewöhnliche Ideen genau beschrieben sind.");
const ot = l => ({ l, if: K("Etwas anderes") });
q("oType", "Am ehesten", "Was ist dein Projekt am ehesten?", [["🔧", "Ein Werkzeug", ""], ["🏪", "Ein Marktplatz", "Anbieter und Kunden treffen sich."], ["👥", "Eine Community", ""], ["🎨", "Kunst / Spielerei", ""], ["🔌", "Etwas mit Hardware", "z. B. Sensoren, Raspberry Pi."], ["🧩", "Browser-Erweiterung", ""]], ot(1));
q("oAction", "Hauptsache", "Was tut man hauptsächlich damit?", [["✏️", "Etwas erstellen", ""], ["🔍", "Etwas finden", ""], ["📤", "Etwas teilen", ""], ["🗂️", "Etwas verwalten", ""], ["📏", "Etwas messen", ""], ["💬", "Sich austauschen", ""], ["💱", "Kaufen & verkaufen", ""]], ot(1));
q("oInput", "Eingabe", "Wie kommt etwas hinein?", [["⌨️", "Eintippen", ""], ["📷", "Foto", ""], ["🎤", "Sprache", ""], ["📁", "Datei", ""], ["🤖", "Automatisch", ""]], ot(1));
q("oOutput", "Ergebnis", "Was kommt am Ende heraus?", [["📋", "Eine Liste", ""], ["📄", "Ein Dokument / PDF", ""], ["🖼️", "Ein Bild", ""], ["💬", "Eine Nachricht", ""], ["🔢", "Eine Zahl oder Bewertung", ""]], ot(1));
q("oScreens", "Bildschirme", "Welche Bildschirme braucht es?", [["🏠", "Start", ""], ["📋", "Liste", ""], ["📄", "Detailansicht", ""], ["✏️", "Bearbeiten", ""], ["👤", "Profil", ""], ["⚙️", "Einstellungen", ""]], ot(2));
q("oPeople", "Nutzer untereinander", "Haben Nutzer miteinander zu tun?", [["➖", "Nein", "", "x"], ["👀", "Sehen sich gegenseitig", ""], ["💬", "Schreiben sich", ""], ["👥", "Arbeiten zusammen", ""]], ot(2));
q("oUgc", "Inhalte von Nutzern", "Laden Nutzer eigene Inhalte hoch?", [["📝", "Texte", ""], ["🖼️", "Bilder", ""], ["🎥", "Videos", ""], ["➖", "Nein", "", "x"]], ot(2));
q("oModerate", "Moderation", "Wer prüft Inhalte von Nutzern?", [["🙋", "Ich von Hand", ""], ["🚩", "Melden-Knopf", ""], ["🤖", "Automatischer Filter", ""]], { l: 2, if: and(K("Etwas anderes"), a => has(a, "oUgc", "Texte", "Bilder", "Videos")) });
q("oFind", "Finden", "Wie findet man Dinge?", [["🔍", "Suche", ""], ["🎚️", "Filter", ""], ["🗂️", "Kategorien", ""], ["🗺️", "Auf einer Karte", ""]], ot(2));
q("oFav", "Merken", "Kann man sich Dinge merken?", yesNo(), ot(2));
q("oShare", "Teilen", "Kann man Dinge nach außen teilen?", [["🔗", "Link", ""], ["📱", "Social Media", ""], ["📧", "E-Mail", ""], ["➖", "Nein", "", "x"]], ot(2));
q("oHist", "Verlauf", "Soll ein Verlauf gespeichert werden?", yesNo(), ot(2));
q("oPrefs", "Einstellungen", "Was kann man einstellen?", [["🌗", "Hell / Dunkel", ""], ["🌍", "Sprache", ""], ["🔔", "Benachrichtigungen", ""], ["👤", "Profil", ""]], ot(2));
q("oFirst", "Erster Start", "Was passiert beim ersten Öffnen?", [["🚀", "Direkt loslegen", ""], ["📖", "Kurze Einführung", ""], ["👤", "Konto anlegen", ""]], ot(2));
q("oTemplates", "Vorlagen", "Soll es Vorlagen zum Starten geben?", yesNo(), ot(3));
q("oCollab", "Zusammenarbeiten", "Können mehrere gleichzeitig an etwas arbeiten?", yesNo(), ot(3));
q("oComments", "Kommentare", "Kann man Dinge kommentieren?", yesNo(), ot(3));
q("oVersions", "Versionen", "Sollen ältere Versionen wiederherstellbar sein?", yesNo(), ot(3));
q("oMap", "Karte", "Spielt ein Ort oder eine Karte eine Rolle?", yesNo(), ot(3));
q("oCal", "Kalender", "Spielen Termine eine Rolle?", yesNo(), ot(3));
q("oCharts", "Diagramme", "Sollen Zahlen als Diagramm gezeigt werden?", yesNo(), ot(3));
q("oAuto", "Automatik", "Soll etwas automatisch passieren (z. B. jeden Morgen)?", yesNo(), ot(3));
q("oAi", "KI-Funktionen", "Soll KI im Projekt mithelfen?", [["✍️", "Texte schreiben", ""], ["🔎", "Zusammenfassen", ""], ["💡", "Vorschläge machen", ""], ["🖼️", "Bilder erkennen", ""], ["➖", "Nein", "", "x"]], ot(3));
q("oKeys", "Tastenkürzel", "Soll es Tastenkürzel geben?", yesNo(), ot(4));
q("oThemes", "Designs", "Sollen Nutzer zwischen Farbthemen wählen können?", yesNo(), ot(4));
q("oEmbed", "Einbetten", "Soll man es in andere Websites einbauen können?", yesNo(), ot(4));
q("oApi", "Schnittstelle", "Sollen andere Programme darauf zugreifen können (API)?", yesNo(), ot(4));
q("oPlugins", "Erweiterungen", "Sollen andere Erweiterungen dafür bauen können?", yesNo(), ot(4));
q("oWidgets", "Widgets", "Soll es kleine Ansichten für den Startbildschirm geben?", yesNo(), ot(4));
q("oPrintIt", "Drucken", "Soll man Ergebnisse drucken können?", yesNo(), ot(4));
q("oGame", "Spielerisch", "Sollen Punkte oder Abzeichen motivieren?", yesNo(), ot(4));
q("oLimits", "Grenzen", "Gibt es Grenzen pro Nutzer (z. B. 10 Einträge gratis)?", yesNo(), ot(4));

/* Fragen, die die KI sich selbst ausdenkt, landen in diesem Bereich (siehe ai.js) */
sec("ai", "Feinschliff durch die KI", "🤖", "Fragen, die die KI passend zu deinem Projekt stellt, bis keine Lücken mehr offen sind.");

/* ---------- Reihenfolge: vom Groben ins Feine ---------- */
S.push({ id: "rules", name: "Jugendschutz & Sprachen", icon: "🛡️", desc: "Was tabu ist, Altersfreigabe und Sprachen." });
const MOVE = { languages: "rules", taboo: "rules", parents: "rules", rating: "rules",
  ideaStart: "mechanics", ideaFinale: "mechanics", ideaWow: "mechanics", ideaRule: "mechanics", ideaPerfect: "mechanics",
  internet: "tech", deviceClass: "tech", tablet: "tech", webLaunch: "tech", pcWindow: "tech", size: "tech" };
Object.entries(MOVE).forEach(([id, s]) => { Q.find(q => q.id === id).sec = s; });
["hero", "setting"].forEach(id => { Q.find(q => q.id === id).sec = "idea"; });
Q.find(q => q.id === "nameStyle").sec = "launch";
Q.find(q => q.id === "perspective").sec = "graphics";
S.splice(S.findIndex(s => s.id === "camera"), 1);
const ORDER = ["kind", "thoughts", "gbasics", "gplatform", "wsite", "app", "work", "shop", "bot", "auto", "learn", "dash", "other",
  "gdata", "acc", "dmod", "notify", "design", "a11y", "legal", "gbiz", "ops", "audience", "platform", "vision", "idea", "core", "mechanics", "controls", "difficulty", "progression", "multiplayer",
  "world", "story", "graphics", "audio", "ui", "access", "rules", "data", "monetization", "tech", "launch", "liveops", "ai", "final"];
const SEQ = {
  audience: ["age", "skill", "whereplay", "reading"],
  platform: ["platforms", "primaryPlat", "orientation"],
  vision: ["purpose", "scope", "session", "feeling", "pace"],
  idea: ["ideaRef", "ideaVerb", "ideaGoal", "hero", "setting", "ideaChallenge", "ideaTwist", "ideaEscalation"],
  core: ["core", "qz1", "qz2", "qz4", "qz6", "qz7", "qz8", "coreQuiz", "coreMix", "structure"],
  mechanics: ["ideaStart", "ideaFinale", "ideaWow", "collect", "powerups", "enemies", "bosses", "enemyAI", "npcs", "interact", "physics", "secrets", "inventory", "ideaRule", "ideaPerfect"],
  controls: ["actions", "inputTouch", "inputDesk", "controller", "controlFeel", "haptics"],
  graphics: ["dimension", "artStyle", "perspective", "palette", "effects", "assets"],
  rules: ["languages", "taboo", "rating", "parents"],
  tech: ["devSkill", "workflow", "timeline", "budget", "team", "internet", "deviceClass", "tablet", "webLaunch", "pcWindow", "size"],
  launch: ["nameStyle", "launchWhere"]
};
const _pos = new Map(Q.map((q, i) => [q.id, i]));
const _rank = q => { const l = SEQ[q.sec] || [], i = l.indexOf(q.id); return i >= 0 ? i : 1000 + _pos.get(q.id); };
S.sort((a, b) => ORDER.indexOf(a.id) - ORDER.indexOf(b.id));
// Innerhalb eines Bereichs: erst die groben Fragen (Stufe 1), dann die feineren.
// Ausnahme Spielsystem: dort bleiben die Fragen zum gewählten System zusammen (und folgen auf ihre Auslöser).
const _lv = q => q.sec === "core" ? 0 : q.l;
const _rk = _rank;
Q.sort((a, b) => ORDER.indexOf(a.sec) - ORDER.indexOf(b.sec) || _lv(a) - _lv(b) || _rk(a) - _rk(b));

/* Überall unbegrenzte Mehrfachauswahl. Frühere Einzelfragen (one) speichern eine einzelne Wahl weiter als Text,
   erst ab zwei Antworten als Liste. „Keine“, „Gar nicht“, „Nein“ usw. schließen die anderen Antworten aus. */
const _excl = /^(Kein(e|er)?\b|Gar nicht|Nein\b|Nichts\b|Nie$|Ohne Limit|Ohne Waffen)/;
Q.forEach(q => {
  if (q.t === "t") return;
  if (q.t === "s") { q.one = true; q.t = "m"; }
  delete q.max;
  if (q.h) q.h = q.h.replace(/^(Wähle bis zu (zwei|drei)\.|Bis zu drei\.) ?/, "");
  q.opts.forEach(o => { if (o.v === QUIZ_OPT || _excl.test(o.v)) o.x = true; });
});

/* Satzbausteine für die wachsende Spielidee */
const PH = {
  verb: { "Springen": "springst", "Laufen & Ausweichen": "weichst|aus", "Schießen & Werfen": "schießt|und wirfst", "Kämpfen": "kämpfst", "Bauen": "baust", "Sammeln": "sammelst",
    "Fangen": "fängst|Dinge", "Kochen & Zubereiten": "kochst", "Kombinieren & Verbinden": "kombinierst", "Fahren & Steuern": "fährst", "Schleichen & Verstecken": "schleichst",
    "Sortieren & Ordnen": "sortierst", "Zeichnen": "zeichnest", "Andere anführen": "führst|andere an", "Handeln & Verkaufen": "handelst", "Erkunden": "erkundest",
    "Karten ausspielen": "spielst|Karten aus", "Im Takt tippen": "tippst|im Takt" },
  goal: { "Jemanden retten": "um jemanden zu retten", "Entkommen": "um zu entkommen", "Ans Ziel kommen": "um ans Ziel zu kommen", "Größer & erfolgreicher werden": "um größer und erfolgreicher zu werden",
    "Andere besiegen": "um andere zu besiegen", "Alles einsammeln": "um alles einzusammeln", "Etwas verteidigen": "um etwas zu verteidigen", "Aufträge erfüllen": "um Aufträge zu erfüllen",
    "Rätsel lösen": "um Rätsel zu lösen", "Überleben": "um zu überleben", "Den Highscore knacken": "um den Highscore zu knacken", "Etwas Eigenes erschaffen": "um etwas Eigenes zu erschaffen" },
  hero: { "Mensch": "Als Mensch", "Tier": "Als Tier", "Roboter": "Als Roboter", "Fantasiewesen": "Als Fantasiewesen", "Objekt / Form": "Als lebendiges Objekt",
    "Fahrzeug": "Als Fahrzeug", "Selbst erstellter Avatar": "Mit deinem eigenen Avatar" },
  ch: { "Zeitdruck": "die Zeit läuft", "Gegner": "Gegner sich in den Weg stellen", "Gefährliche Wege & Fallen": "der Weg voller Fallen ist", "Knappe Ressourcen": "Ressourcen knapp sind",
    "Knifflige Logik": "jede Aufgabe eine Denkaufgabe ist", "Andere Spieler": "andere Spieler dasselbe wollen", "Immer mehr gleichzeitig": "immer mehr gleichzeitig passiert", "Unberechenbare Physik": "die Physik unberechenbar ist" }
};
