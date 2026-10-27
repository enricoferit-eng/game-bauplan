/* Game-Bauplan – Fragenkatalog */
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
const coreIs = (...keys) => a => keys.some(k => SYSN[k] === coreName(a) || SYSN[k] === a.coreMix);
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
  ["♾️", "Endlos / prozedural", "Inhalte werden zufällig erzeugt, unbegrenzt spielbar."]]);
q("tone", "Grundton", "Welchen Grundton hat dein Spiel?", [
  ["🌈", "Fröhlich & kindlich", "Bunt und freundlich, keine echten Gefahren."],
  ["🤪", "Humorvoll", "Witze und Übertreibung, nimmt sich nicht ernst."],
  ["🛡️", "Episch & heroisch", "Große Momente, Heldenreise, mitreißend."],
  ["🌑", "Düster & ernst", "Bedrückende Stimmung, ernste Themen."],
  ["🍂", "Melancholisch & poetisch", "Ruhig, nachdenklich, emotional."],
  ["🌀", "Absurd & surreal", "Traumartig und verrückt, auf charmante Art unlogisch."]], { l: 2 });
q("pace", "Tempo", "Wie schnell soll sich das Spiel anfühlen?", [
  ["🐢", "Gemütlich", "Kein Zeitdruck, der Spieler bestimmt das Tempo."],
  ["🚶", "Mittel", "Gleichmäßiges Tempo mit gelegentlichen Spannungsspitzen."],
  ["🏃", "Schnell", "Ständige Action, schnelle Reaktionen nötig."],
  ["🌪️", "Hektisch", "Viele Dinge gleichzeitig, maximale Reizdichte."],
  ["🎢", "Wechselnd", "Bewusster Wechsel zwischen ruhigen und hektischen Phasen."]], { l: 2 });
q("usp", "Alleinstellungsmerkmal", "Was soll dein Spiel besonders machen?", [
  ["💡", "Neue Mechanik", "Eine ungewöhnliche Spielidee, die es so selten gibt."],
  ["🖼️", "Einzigartiger Look", "Der Grafikstil ist das Aushängeschild."],
  ["📜", "Starke Geschichte", "Story und Figuren sind das Herzstück."],
  ["😄", "Humor", "Das Spiel ist vor allem lustig."],
  ["👯", "Gemeinsam spielen", "Das Erlebnis mit anderen steht im Mittelpunkt."],
  ["🧱", "Selbst gestalten", "Spieler erschaffen eigene Inhalte."],
  ["🎓", "Lernwert", "Man lernt beim Spielen etwas."],
  ["🏪", "Echter Ort oder Marke", "Spielt an einem echten Ort oder für eine echte Marke (z. B. Restaurant, Verein)."]], { l: 2, t: "m" });
q("purpose", "Projektziel", "Wofür entsteht das Spiel?", [
  ["🎈", "Hobby & Spaß", "Für mich selbst, zum Lernen und Ausprobieren."],
  ["🎁", "Für Familie oder Freunde", "Als Geschenk oder für eine bestimmte Gruppe."],
  ["💼", "Portfolio", "Zeigen, was ich kann (Bewerbung, Showreel)."],
  ["💶", "Geld verdienen", "Kommerzieller Erfolg ist ein Ziel."],
  ["🏫", "Bildung", "Für Schule, Unterricht oder Lernzwecke."],
  ["📣", "Marketing für Firma/Verein", "Das Spiel bewirbt ein Geschäft, einen Verein oder eine Marke."]], { l: 2 });
q("ending", "Spielende", "Hat das Spiel ein richtiges Ende?", [
  ["🎬", "Ja, mit Abspann", "Klares Ende nach dem letzten Level oder Kapitel."],
  ["🔁", "Ende plus Weiterspielen", "Nach dem Ende gibt es Zusatzinhalte (Postgame)."],
  ["📈", "Endlos mit Highscore", "Kein Ende; Ziel ist eine möglichst hohe Punktzahl."],
  ["📅", "Wächst ständig weiter", "Das Spiel wird mit Updates und Saisons immer erweitert."]], { l: 2 });

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
q("motivation", "Motivatoren", "Was motiviert deine Spieler am meisten weiterzuspielen?", [
  ["🗂️", "Sammeln", "Alles einsammeln und komplettieren."],
  ["📊", "Zahlen steigen", "Werte, Level, Highscores verbessern."],
  ["📖", "Wie geht's weiter?", "Neugier auf die Story."],
  ["🥇", "Andere schlagen", "Ranglisten und Duelle."],
  ["🌳", "Etwas wachsen sehen", "Basis, Stadt oder Figur entwickelt sich sichtbar."],
  ["🧠", "Neues lernen", "Neue Fähigkeiten und Wissen."],
  ["🌿", "Abschalten", "Ein entspannter Rückzugsort."]], { l: 3, t: "m" });

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
q("runSpeed", "Tempo-Steigerung", "Wie verändert sich das Tempo?", [
  ["➖", "Konstant", "Gleiches Tempo, Schwierigkeit über Hindernisse."], ["📈", "Steigt langsam", "Tempo wächst sanft mit der Distanz."], ["🚀", "Steigt stark", "Wird schnell sehr hektisch."]], { l: 3, if: coreIs("runner") });
q("actCombat", "Kampfgefühl", "Was macht dir beim Kämpfen in Spielen am meisten Spaß?", [
  ["💥", "Wild draufhauen", "Viele schnelle Treffer, laut und chaotisch."],
  ["⏱️", "Den richtigen Moment abpassen", "Gegner beobachten und genau dann zuschlagen oder blocken."],
  ["🤸", "Geschickt ausweichen", "Elegant um Angriffe herumtanzen."],
  ["✨", "Coole Spezialkräfte", "Seltene, besonders starke Angriffe einsetzen."]], { l: 2, t: "m", max: 2, if: coreIs("act") });
q("actEnemies", "Gegnermenge", "Lieber gegen wenige starke oder viele schwache Gegner?", [
  ["🤺", "Wenige starke", "Jeder Kampf ist ein Duell."], ["👥", "Kleine Gruppen", "Ein paar Gegner gleichzeitig."], ["🧟", "Riesige Massen", "Hunderte schwache Gegner auf einmal."]], { l: 3, if: coreIs("act") });
q("actWeapons", "Kampf-Look", "Wie soll der Kampf aussehen?", [
  ["🧙", "Fantasy", "Wie in Märchen und Sagen."], ["🪖", "Realistisch", "Wie es in echt aussehen könnte."], ["🥄", "Albern", "Mit Kissen, Kochlöffeln und Quatsch."],
  ["🥋", "Ohne Waffen", "Nur mit Körper und Geschick."], ["🚀", "Futuristisch", "Hightech und Laser."]], { l: 2, if: coreIs("act", "rpg") , h: "Die KI denkt sich passend dazu die Waffen und Angriffe aus." });
q("shootType", "Shooter-Sicht", "Wie erlebst du das Zielen und Schießen?", [
  ["🔝", "Von oben", "Man sieht die Figur von oben und schießt in alle Richtungen."],
  ["➡️", "Von der Seite", "Laufen und schießen wie in einem Jump'n'Run."],
  ["🧍", "Hinter der Figur", "Man sieht die Figur von hinten."],
  ["👁️", "Durch die Augen", "Man sieht nur die eigenen Hände."],
  ["🔄", "Schießt von selbst", "Du musst nur ausweichen und Verbesserungen wählen."],
  ["🚀", "Mit einem Raumschiff", "Fliegen und Gegnerwellen abschießen."]], { l: 2, if: coreIs("shoot") });
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
q("puzHints", "Tipps", "Wie bekommt man Hilfe bei Rätseln?", [
  ["💡", "Unbegrenzte Tipps", ""], ["🪙", "Begrenzt, verdienbar", "Tipps kosten Spielwährung."], ["🚫", "Keine Tipps", ""]], { l: 2, if: coreIs("puz") });
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
q("rogueRun", "Run-Länge", "Wie lange dauert ein kompletter Durchlauf?", [
  ["⏱️", "Ca. 10 Minuten", ""], ["🕐", "20–30 Minuten", ""], ["🕰️", "Ca. 60 Minuten", ""]], { l: 2, if: coreIs("rogue") });
q("rogueMeta", "Nach dem Scheitern", "Was soll bleiben, wenn ein Versuch scheitert?", [
  ["🧊", "Nichts", "Jeder Versuch startet bei null."], ["📈", "Etwas Stärke", "Man wird von Versuch zu Versuch dauerhaft etwas stärker."], ["🔓", "Neues freigeschaltet", "Neue Figuren oder Gegenstände für die nächsten Versuche."]], { l: 2, if: coreIs("rogue") });
q("raceType", "Rennstil", "Wie fühlt sich das Fahren an?", [
  ["🕹️", "Arcade", "Einfach, schnell, spektakuläre Drifts."], ["🍄", "Kart mit Items", "Power-ups und Waffen auf der Strecke."], ["🏁", "Simulation", "Realistische Physik und Tuning."], ["🚧", "Ausweichen endlos", "Verkehr ausweichen, so weit wie möglich."]], { l: 2, if: coreIs("race") });
q("raceVehicles", "Fahrzeuge", "Womit wird gefahren?", [
  ["🚗", "Autos", ""], ["🏍️", "Motorräder", ""], ["🚤", "Boote", ""], ["✈️", "Flugzeuge", ""], ["🐎", "Tiere", ""], ["🛸", "Fantasie-Fahrzeuge", ""]], { l: 3, t: "m", if: coreIs("race") });
q("sandBuild", "Bausystem", "Wie wird gebaut?", [
  ["🧊", "Blöcke im Raster", "Würfel platzieren und abbauen."], ["🪑", "Freies Platzieren", "Objekte frei drehen und setzen."], ["🌉", "Physikbasiert", "Konstruktionen müssen halten."]], { l: 2, if: coreIs("sand") });
q("sandGoal", "Sandbox-Ziel", "Gibt es ein Ziel?", [
  ["🕊️", "Kein Ziel", "Reines Kreativspielen."], ["🎯", "Lockere Ziele", "Optionale Aufgaben als Anreiz."], ["🔥", "Überlebensmodus", "Zusätzlich Gefahren und Ressourcenknappheit."]], { l: 3, if: coreIs("sand") });
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
q("survThreat", "Bedrohung", "Was ist die größte Gefahr?", [
  ["🌙", "Gegner in der Nacht", ""], ["⛈️", "Wetter & Natur", ""], ["👥", "Andere Spieler", ""], ["📉", "Knappe Ressourcen", ""]], { l: 3, t: "m", if: coreIs("surv") });
q("horrorType", "Horror-Art", "Welche Art Grusel?", [
  ["🧠", "Psychologisch", "Unbehagen, Wahrnehmung täuscht."], ["👹", "Verfolgung", "Ein Monster jagt den Spieler."], ["💥", "Jumpscares", "Plötzliche Schreckmomente."], ["🌫️", "Atmosphärisch", "Leise Spannung, kaum Schocks."]], { l: 2, if: coreIs("horror") });
q("coreLoop", "Spielkreislauf", "Welcher Kreislauf beschreibt dein Spiel am besten?", [
  ["🔁", "Spielen → Belohnung → Upgrade", "Level spielen, Belohnung bekommen, stärker werden, schwerere Level."],
  ["🧭", "Erkunden → Finden → Freischalten", "Neue Orte entdecken, Dinge finden, neue Bereiche öffnen."],
  ["🏗️", "Sammeln → Bauen → Wachsen", "Ressourcen sammeln, bauen, das Erbaute erzeugt mehr."],
  ["🏁", "Runde → Punkte → Rangliste", "Kurze Runde, Punktzahl, mit sich oder anderen vergleichen."],
  ["📖", "Kapitel → Entscheidung → Folgen", "Story erleben, entscheiden, Konsequenzen spüren."],
  ["🎲", "Run → Scheitern → Neu & besser", "Durchlauf, scheitern, mit neuem Wissen oder Meta-Upgrades erneut."]], { l: 2 });
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
  ["🔨", "Crafting", "Aus Materialien Gegenstände herstellen."], ["🎁", "Beute & Items", "Gegenstände mit Werten finden."], ["🌳", "Fähigkeitenbaum", "Punkte in Fähigkeiten investieren."],
  ["🏠", "Basisbau", "Eigene Basis errichten und ausbauen."], ["💱", "Handel", "Kaufen und verkaufen."], ["🗨️", "Dialogsystem", "Gespräche mit Antwortmöglichkeiten."],
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
  ["🛒", "Händler", ""], ["❗", "Auftraggeber", ""], ["🏘️", "Bewohner mit Tagesablauf", ""], ["🧑‍🏫", "Mentor / Helfer", ""], ["➖", "Keine", "", "x"]], { l: 3, t: "m" });
q("physics", "Bewegung der Dinge", "Wie sollen sich Dinge im Spiel bewegen?", [
  ["🕹️", "Wie im Zeichentrick", "Vorhersehbar und einfach."], ["🌍", "Wie in echt", "Dinge fallen, rollen und prallen realistisch ab."],
  ["🤸", "Wackelig & lustig", "Alles schwabbelt, kippt und fliegt herum."]], { l: 3 });
q("interact", "Interaktive Welt", "Womit kann man in der Welt interagieren?", [
  ["💥", "Zerstörbare Objekte", ""], ["🔘", "Schalter & Türen", ""], ["📦", "Schiebbare Kisten", ""], ["🐾", "Tiere", ""], ["🗣️", "Figuren ansprechen", ""], ["🪜", "Kletterbare Objekte", ""]], { l: 3, t: "m" });
q("secrets", "Geheimnisse", "Wie viele Geheimnisse sind versteckt?", [
  ["🔍", "Viele", "Geheime Räume, Abkürzungen, Bonuslevel."], ["🥚", "Ein paar Easter Eggs", "Kleine Überraschungen."], ["➖", "Keine", ""]], { l: 3 });
q("inventory", "Gepäck", "Wie viele Dinge trägt die Figur mit sich herum?", [
  ["➖", "Gar keine", ""], ["🎒", "Ein paar", "Eine Handvoll Gegenstände zur schnellen Auswahl."], ["🧳", "Eine ganze Tasche voll", "Viele Dinge zum Sortieren."]], { l: 3 });
q("procedural", "Abwechslung", "Soll jede Runde gleich aussehen oder jedes Mal anders?", [
  ["✍️", "Immer gleich", "Man kann Level auswendig lernen."], ["🎲", "Etwas anders", "Bekannt, aber mit Überraschungen."], ["🌀", "Jedes Mal komplett neu", ""]], { l: 3 });
/* ======================================================= */
sec("controls", "Steuerung", "🕹️", "Wie der Spieler das Spiel bedient.");
q("inputTouch", "Touch-Steuerung", "Wie wird auf dem Touchscreen gesteuert?", [
  ["👆", "Tippen", "Auf Dinge oder den Bildschirm tippen."], ["👉", "Wischen", "Wischgesten für Richtungen."], ["🕹️", "Virtueller Joystick + Buttons", "Steuerkreuz links, Aktionsknöpfe rechts."],
  ["📐", "Neigen", "Gerät kippen (Bewegungssensor)."], ["✋", "Ziehen & Ablegen", "Objekte mit dem Finger verschieben."], ["⏺️", "Halten & Loslassen", "Ein Finger, Dauer zählt."]], { t: "m", if: touch });
q("inputDesk", "PC-Bedienung", "Womit spielt man am Computer?", [
  ["⌨️", "Tastatur", ""], ["🖱️", "Maus", ""], ["🖱️⌨️", "Maus und Tastatur", ""], ["🎮", "Gamepad", ""]], { t: "m", if: desk });
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
q("era", "Epoche", "Wann spielt die Geschichte?", [
  ["🦕", "Urzeit", ""], ["📜", "Vergangenheit", ""], ["📱", "Gegenwart", ""], ["🛸", "Zukunft", ""], ["⌛", "Zeitlos", ""]], { l: 3 });
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
q("storyTheme", "Story-Thema", "Worum geht es in der Geschichte?", [
  ["🦸", "Rettung", "Jemanden oder etwas retten."], ["🧭", "Abenteuerreise", "Aufbruch ins Unbekannte."], ["🤝", "Freundschaft", ""], ["🕵️", "Geheimnis lösen", ""],
  ["🔥", "Überleben", ""], ["📈", "Vom Nichts nach oben", "Klein anfangen, groß rauskommen."], ["⚖️", "Rache / Gerechtigkeit", ""]], { l: 2, if: someStory });
q("storyTell", "Erzählweise", "Wie wird die Geschichte erzählt?", [
  ["🎬", "Zwischensequenzen", ""], ["💬", "Textboxen", ""], ["🎙️", "Sprachausgabe", ""], ["🏚️", "Durch die Umgebung", "Details in der Welt erzählen."],
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
  ["➖", "Kein Humor", ""], ["🔤", "Wortwitz", ""], ["🍌", "Slapstick", ""], ["🪞", "Selbstironisch & Meta", ""], ["🖤", "Schwarzer Humor", ""]], { l: 3, if: iff("tone", "Humorvoll", "Absurd & surreal") });

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
q("animation", "Animationsstil", "Wie sind Bewegungen animiert?", [
  ["🎞️", "Wenige Bilder (retro)", "Bewusst ruckelig."], ["🌊", "Flüssig", ""], ["🫧", "Gummi-artig", "Quetschen und Dehnen, sehr lebendig."], ["🏃", "Realistisch", "Wie echte Bewegungen."]], { l: 3 });
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
q("unlocks", "Freischaltbares", "Was kann man freischalten?", [
  ["🧑", "Figuren", ""], ["🗺️", "Level / Welten", ""], ["👕", "Outfits", ""], ["🎮", "Spielmodi", ""], ["🎵", "Musik", ""], ["🖼️", "Galerie & Konzeptkunst", ""]], { l: 3, t: "m" });
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
q("a11yVis", "Sehen", "Welche Hilfen fürs Sehen?", [
  ["🎨", "Farbenblind-Modus", "Infos nie nur über Farbe."], ["🔠", "Größere Schrift", ""], ["🌗", "Hoher Kontrast", ""], ["🔊", "Screenreader für Menüs", ""], ["➖", "Keine", "", "x"]],  { t: "m" });
q("a11yMotor", "Bedienung", "Welche Hilfen für die Bedienung?", [
  ["✋", "Einhändig spielbar", ""], ["🐌", "Spieltempo regelbar", ""], ["⏺️", "Halten statt Hämmern", "Kein schnelles Wiederholtes Drücken nötig."], ["🎯", "Größere Trefferflächen", ""], ["➖", "Keine", "", "x"]], { l: 3, t: "m" });
q("a11yCog", "Verständnis", "Welche Hilfen fürs Verständnis?", [
  ["🌈", "Weniger Effekte", "Keine Blitze, weniger Bewegung (Epilepsie)."], ["🧭", "Ziel jederzeit abrufbar", ""], ["🐢", "Kein Zeitdruck einstellbar", ""], ["📝", "Einfache Sprache", ""], ["➖", "Keine", "", "x"]], { l: 3, t: "m" });
q("a11yHear", "Hören", "Welche Hilfen fürs Hören?", [
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
/* ---------- Reihenfolge: Gameplay zuerst, Idee baut sich auf ---------- */
["hero", "setting"].forEach(id => { Q.find(q => q.id === id).sec = "idea"; });
Q.find(q => q.id === "nameStyle").sec = "launch";
Q.find(q => q.id === "perspective").sec = "graphics";
S.splice(S.findIndex(s => s.id === "camera"), 1);
const ORDER = ["audience", "vision", "idea", "core", "mechanics", "difficulty", "progression", "multiplayer", "world", "story", "graphics", "audio",
  "platform", "controls", "ui", "access", "data", "monetization", "tech", "launch", "liveops"];
const IDEA_ORDER = ["ideaRef", "ideaVerb", "ideaGoal", "hero", "setting", "ideaChallenge", "ideaTwist", "ideaEscalation", "ideaStart", "ideaWow", "ideaFinale", "ideaRule", "ideaPerfect", "ideaReplay"];
S.sort((a, b) => ORDER.indexOf(a.id) - ORDER.indexOf(b.id));
const _pos = new Map(Q.map((q, i) => [q.id, i]));
const FIRST = ["nameStyle", "dimension", "artStyle", "perspective"];
const _rank = q => q.sec === "idea" ? IDEA_ORDER.indexOf(q.id) : FIRST.includes(q.id) ? -10 + FIRST.indexOf(q.id) : _pos.get(q.id);
Q.sort((a, b) => ORDER.indexOf(a.sec) - ORDER.indexOf(b.sec) || _rank(a) - _rank(b));

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
