/* Game-Bauplan – Spielkonzept (erstes Spiel aus den Antworten) + PDF */
const CAPS = { downloads: null, sample: null };
const inClaude = !!(window.claude && window.claude.use);
const canPDF = () => !!(window.jspdf && (CAPS.downloads || !inClaude));
async function deliverPDF(pdf, file) {
  if (CAPS.downloads) { await CAPS.downloads.save({ filename: file, data: pdf.output("blob") }); return; }
  pdf.save(file);
}
const arrOf = id => Array.isArray(st.a[id]) ? st.a[id].filter(x => x !== AI) : (val(id) ? [val(id)] : []);
const pickN = (list, n, seed) => { const out = [], l = list.slice(); let s = seed; while (out.length < n && l.length) { s = (s * 9301 + 49297) % 233280; out.push(l.splice(s % l.length, 1)[0]); } return out; };
const seedOf = () => hue(JSON.stringify(st.a));

const WORLD = {
  "Fantasy": { n: ["Zauber", "Drachen", "Kristall"], places: ["Funkelwald", "Kristallhöhlen", "Drachengipfel", "Wolkenschloss"], foes: [["Wackelpilz", "hüpft im Kreis und lässt Sporen fallen"], ["Kobold-Dieb", "schnappt sich Sammelobjekte und rennt weg"], ["Steingolem", "langsam, aber blockiert Wege"], ["Irrlicht", "lockt in Sackgassen"]], boss: "der Kristalldrache", item: "Mondkristalle" },
  "Sci-Fi / Weltraum": { n: ["Orbit", "Nova", "Astro"], places: ["Raumstation Alpha", "Asteroidengürtel", "Eisplanet", "Mutterschiff"], foes: [["Drohne", "patrouilliert und piept, wenn sie dich sieht"], ["Meteorit", "fliegt quer durchs Bild"], ["Glibber-Alien", "teilt sich bei Treffern"], ["Laserturm", "feuert im festen Takt"]], boss: "das Mutterschiff", item: "Energiezellen" },
  "Moderne Stadt": { n: ["City", "Dach", "Block"], places: ["Hinterhof", "Hauptstraße", "Baustelle", "Dächer der Stadt"], foes: [["Kampftaube", "stürzt im Bogen herab"], ["Mülltonne", "rollt los, wenn man vorbeigeht"], ["Ordnungshüter", "verfolgt dich ein Stück"], ["Baukran-Last", "schwingt hin und her"]], boss: "der Baustellen-Roboter", item: "Münzen" },
  "Natur & Wald": { n: ["Moos", "Wald", "Wurzel"], places: ["Lichtung", "Pilzhain", "Wasserfall", "Uralter Baum"], foes: [["Igel", "rollt sich ein und rollt los"], ["Wespenschwarm", "folgt dir ein paar Sekunden"], ["Dornenranke", "wächst plötzlich aus dem Boden"], ["Waldschrat", "wirft Tannenzapfen"]], boss: "der Wurzelriese", item: "Eicheln" },
  "Unterwasser": { n: ["Tiefsee", "Koralle", "Blubb"], places: ["Korallenriff", "Seegraswald", "Wrack", "Tiefseegraben"], foes: [["Kugelfisch", "bläst sich auf, wenn man nah kommt"], ["Qualle", "schwebt langsam auf und ab"], ["Krabbe", "läuft seitwärts hin und her"], ["Muräne", "schnellt aus Höhlen"]], boss: "der Riesenkrake", item: "Perlen" },
  "Mittelalter": { n: ["Burg", "Ritter", "Krone"], places: ["Marktplatz", "Burggraben", "Rittersaal", "Turmspitze"], foes: [["Wachritter", "läuft Patrouille"], ["Bogenschütze", "schießt von Mauern"], ["Rammbock", "kracht durch Türen"], ["Rabe", "klaut glänzende Dinge"]], boss: "der Schwarze Ritter", item: "Goldtaler" },
  "Endzeit": { n: ["Schrott", "Ödland", "Asche"], places: ["Schrottplatz", "Verlassene Tankstelle", "Staubwüste", "Bunker"], foes: [["Schrottkäfer", "krabbelt in Gruppen"], ["Plünderer", "will deine Vorräte"], ["Sandsturm", "schiebt dich zurück"], ["Mutantenratte", "springt dich an"]], boss: "der Schrottkönig", item: "Schrauben" },
  "Süßigkeiten & Cartoon": { n: ["Zucker", "Bonbon", "Keks"], places: ["Lutscherwiese", "Schokofluss", "Gummibärenberg", "Tortenturm"], foes: [["Gummibär", "hüpft auf dich zu"], ["Kaugummiblase", "platzt und klebt fest"], ["Brauselawine", "sprudelt plötzlich hoch"], ["Lakritzschlange", "schlängelt durch Lücken"]], boss: "die Riesentorte", item: "Zuckerperlen" },
  "Steampunk": { n: ["Zahnrad", "Dampf", "Kessel"], places: ["Werkstatt", "Dampflok", "Uhrturm", "Luftschiff"], foes: [["Aufziehkäfer", "läuft geradeaus, bis er abläuft"], ["Dampfventil", "zischt im Takt"], ["Zahnradwächter", "rotiert und blockiert"], ["Messingvogel", "kreist über dir"]], boss: "die große Maschine", item: "Zahnräder" },
  "Wilder Westen": { n: ["Prärie", "Saloon", "Sporen"], places: ["Geisterstadt", "Canyon", "Goldmine", "Zug"], foes: [["Steppenläufer", "rollt mit dem Wind"], ["Klapperschlange", "lauert hinter Steinen"], ["Bandit", "wirft Lassos"], ["Geier", "kreist und stößt herab"]], boss: "der Banditenboss", item: "Goldnuggets" },
  "Antike": { n: ["Tempel", "Olymp", "Sphinx"], places: ["Basar", "Pyramide", "Säulenhalle", "Götterberg"], foes: [["Mumie", "schlurft langsam, gibt nicht auf"], ["Skarabäus", "krabbelt in Schwärmen"], ["Statue", "bewegt sich nur, wenn du nicht hinsiehst"], ["Speerfalle", "schießt aus Wänden"]], boss: "die Sphinx", item: "Amulette" },
  "Küche & Restaurant": { n: ["Pizza", "Pfanne", "Küchen"], places: ["Vorratskammer", "Küche", "Gastraum", "Terrasse"], foes: [["Wütende Tomate", "rollt hin und her"], ["Fettspritzer", "springen aus heißen Pfannen"], ["Küchenratte", "klaut Zutaten"], ["Hungriger Gast", "wird ungeduldig und schimpft"]], boss: "der Oberkoch beim Stoßgeschäft", item: "Zutaten" },
  "Abstrakt": { n: ["Pixel", "Form", "Linie"], places: ["Weiße Leere", "Farbraum", "Geometrie-Labyrinth", "Der Kern"], foes: [["Dreieck", "dreht sich und sticht"], ["Rotes Quadrat", "springt im Raster"], ["Linie", "zieht sich quer über den Bildschirm"], ["Fraktal", "teilt sich immer weiter"]], boss: "die große Form", item: "Lichtpunkte" }
};
const DEF_WORLD = WORLD["Fantasy"];
const CTRL = {
  "Springen": ["Tippen", "Leertaste"], "Laufen & Ausweichen": ["Wischen nach links/rechts", "Pfeiltasten"], "Schießen & Werfen": ["Auf das Ziel tippen", "Mit der Maus zielen und klicken"],
  "Kämpfen": ["Angriffs-Knopf rechts unten", "Taste J"], "Bauen": ["Bauteil auf das Feld ziehen", "Bauteil anklicken und platzieren"], "Sammeln": ["passiert automatisch beim Berühren", "passiert automatisch beim Berühren"],
  "Fangen": ["Figur mit dem Finger nach links/rechts ziehen", "Maus nach links/rechts bewegen"], "Kochen & Zubereiten": ["Zutat antippen und auf den Teller ziehen", "Zutat anklicken und auf den Teller ziehen"],
  "Kombinieren & Verbinden": ["Teile wischen oder verbinden", "Teile anklicken und verbinden"], "Fahren & Steuern": ["Linke/rechte Bildschirmhälfte gedrückt halten", "Pfeiltasten"],
  "Schleichen & Verstecken": ["Joystick, gedrückt halten zum Ducken", "WASD, Shift zum Schleichen"], "Sortieren & Ordnen": ["Ziehen und Ablegen", "Ziehen und Ablegen mit der Maus"],
  "Zeichnen": ["Mit dem Finger zeichnen", "Mit der Maus zeichnen"], "Andere anführen": ["Einheit antippen, dann Ziel antippen", "Einheit anklicken, dann Ziel anklicken"],
  "Handeln & Verkaufen": ["Knöpfe im Handelsfenster", "Knöpfe im Handelsfenster"], "Erkunden": ["Virtueller Joystick", "WASD"], "Karten ausspielen": ["Karte aufs Feld ziehen", "Karte aufs Feld ziehen"],
  "Im Takt tippen": ["Im Takt auf die Spuren tippen", "Tasten D, F, J, K im Takt"]
};

function nameIdeas(w) {
  const style = val("nameStyle"), hero = val("hero"), s = seedOf();
  const heroN = { "Tier": "Fuchs", "Roboter": "Robo", "Mensch": "Max", "Fantasiewesen": "Flumm", "Objekt / Form": "Klötzchen", "Fahrzeug": "Turbo" }[hero] || "Held";
  const verbN = { "Springen": "Hüpf", "Laufen & Ausweichen": "Flitz", "Fangen": "Fang", "Kochen & Zubereiten": "Koch", "Bauen": "Bau", "Sammeln": "Sammel", "Fahren & Steuern": "Turbo", "Kämpfen": "Krawall", "Schießen & Werfen": "Wurf" }[arrOf("ideaVerb")[0]] || "Abenteuer";
  const [a, b, c] = w.n;
  const sets = {
    "Kurz & knackig": [`${a}${verbN.toLowerCase()}`, `${b}rush`, `${heroN}!`],
    "Lustiges Wortspiel": [`Alles ${a}, oder was?`, `${b}-Alarm`, `Keine Panik, ${heroN}!`],
    "Name der Hauptfigur": [`${heroN}`, `${heroN} und die ${w.item}`, `${heroN}s großes ${verbN}`],
    "Beschreibend": [`${a}-${verbN}`, `Die ${w.item}-Jagd`, `${w.places[0]}-Rettung`],
    "Episch & geheimnisvoll": [`Das Geheimnis von ${w.places[3]}`, `${c}feuer`, `Die letzte ${a}-Legende`],
    "Mit Ort oder Marke": [`${a} Club`, `[Dein Laden]: ${verbN}-Chaos`, `Abenteuer im ${w.places[1]}`]
  };
  return sets[style] || pickN([].concat(...Object.values(sets)), 3, s);
}

function sizePlan() {
  return {
    "Mini-Prototyp": { worlds: 1, levels: 1, effort: "1–3 Tage" }, "Kleines Spiel": { worlds: 2, levels: 4, effort: "1–3 Wochen" },
    "Mittleres Spiel": { worlds: 4, levels: 8, effort: "2–4 Monate" }, "Großes Spiel": { worlds: 6, levels: 15, effort: "6–12 Monate" },
    "Endlos / prozedural": { worlds: 3, levels: 0, effort: "2–6 Wochen" }
  }[val("scope")] || (has(st.a, "structure", "Endloser Lauf", "Zufällig generierte Runs") ? { worlds: 3, levels: 0, effort: "2–6 Wochen" } : { worlds: 3, levels: 5, effort: "2–6 Wochen" });
}

function concept() {
  const a = st.a, w = WORLD[val("setting")] || DEF_WORLD, s = seedOf();
  const verbs = arrOf("ideaVerb"), chall = arrOf("ideaChallenge"), esc2 = arrOf("ideaEscalation");
  const core = val(st.a.core === QUIZ_OPT ? "coreQuiz" : "core");
  const touchP = touch(a), deskP = desk(a);
  const vph = v => (PH.verb[v] || v.toLowerCase()).replace("|", " ");
  const B = [];
  const H = x => B.push({ t: "h2", x }), P = x => x && B.push({ t: "p", x }), UL = x => x.length && B.push({ t: "ul", x }), OL = x => x.length && B.push({ t: "ol", x }), KV = x => B.push({ t: "kv", x: x.filter(r => r[1]) });
  const ai = st.ai;

  /* 1 Überblick */
  const names = ai && ai.titel && ai.titel.length ? ai.titel : nameIdeas(w);
  H("Das Spiel in Kürze");
  P(ai && ai.pitch ? ai.pitch : ideaText() || summarySentence());
  KV([["Namensideen", names.join(" · ")], ["Spielsystem", core], ["Für wen", [val("age"), val("skill")].filter(Boolean).join(", ")],
    ["Plattform", [val("platforms"), val("orientation")].filter(Boolean).join(", ")], ["Look", [val("dimension"), val("artStyle"), val("perspective")].filter(Boolean).join(", ")],
    ["Rundendauer", val("session")], ["Umfang", val("scope")], ["Geschäftsmodell", val("monet")]]);

  /* 2 Spielablauf */
  H("So spielt sich eine Runde");
  if (ai && ai.spielablauf) OL(ai.spielablauf);
  else {
    const st1 = { "Sofort Action": "Das Spiel startet ohne Menü direkt in die Action.", "Kurze Story-Szene": "Drei kurze Bilder erklären, worum es geht, dann geht es los.", "Spielplatz zum Ausprobieren": "Man landet in einem gefahrlosen Bereich und probiert die Steuerung aus.", "Bei null anfangen": "Man startet auf einem leeren Feld und legt los." }[val("ideaStart")] || "Nach einem Tipp auf „Spielen“ geht es direkt los.";
    const heroP = PH.hero[val("hero")] ? PH.hero[val("hero")].replace("Als ", "die Spielfigur, ein ").replace("Mit deinem eigenen Avatar", "deinen eigenen Avatar") : "deine Spielfigur";
    const steps = [st1];
    steps.push(`Du steuerst ${heroP}${val("perspective") ? ` in der Ansicht „${val("perspective")}“` : ""}. Erster Schauplatz: ${w.places[0]}.`);
    verbs.forEach(v => { const c = CTRL[v]; steps.push(`Du ${vph(v)}: ${c ? (touchP ? c[0] : c[1]) + (touchP && deskP && c[0] !== c[1] ? ` (am PC: ${c[1]})` : "") : "mit einfachen Eingaben"}.`); });
    if (val("ideaGoal")) steps.push(`Dein Ziel: ${val("ideaGoal")}.`);
    const chp = chall.map(c => PH.ch[c]).filter(Boolean);
    if (chp.length) steps.push(`Druck entsteht, weil ${chp.join(" und ")}.`);
    if (has(a, "ideaChallenge", "Gegner") || (val("enemies") && val("enemies") !== "Keine Gegner")) steps.push(`Unterwegs tauchen zum Beispiel ${w.foes[0][0]} und ${w.foes[1][0]} auf.`);
    steps.push(`Dabei sammelst du ${val("collect") && val("collect") !== "Nichts" ? val("collect") : w.item}.`);
    if (val("ideaTwist") && val("ideaTwist") !== "Kein Kniff, klassisch gut") steps.push(`Der Clou: ${descOf(qOf("ideaTwist"), val("ideaTwist"))}`);
    if (val("health")) steps.push(`Wirst du getroffen: ${descOf(qOf("health"), val("health"))}`);
    if (val("failPenalty")) steps.push(`Scheitern heißt: ${descOf(qOf("failPenalty"), val("failPenalty"))}`);
    steps.push(`Am Ende ${val("ideaFinale") ? `wartet: ${val("ideaFinale")}` : "kommt die Auswertung"}.${val("levelRating") && val("levelRating") !== "Gar nicht" ? ` Bewertung: ${val("levelRating")}.` : ""}`);
    OL(steps);
  }

  /* 3 Steuerung */
  H("Steuerung");
  if (ai && ai.steuerung) KV(ai.steuerung.map(x => [x.eingabe, x.aktion]));
  else {
    const rows = verbs.map(v => { const c = CTRL[v] || ["Tippen", "Taste"]; return [touchP ? c[0] : c[1], v]; });
    if (!rows.length) rows.push([touchP ? "Tippen" : "Leertaste", "Hauptaktion"]);
    rows.push([touchP ? "Pause-Knopf oben rechts" : "Esc", "Pause"]);
    if (has(a, "actions", "Ein Finger reicht")) P("Alles ist mit einem Finger bzw. einer Taste spielbar.");
    KV(rows);
  }

  /* 4 Regeln */
  H("Spielregeln");
  UL(ai && ai.regeln ? ai.regeln : [
    val("ideaGoal") && `Ziel: ${val("ideaGoal")}.`,
    `Treffer: ${val("health") ? descOf(qOf("health"), val("health")) : "Die Figur hat 3 Herzen; Herzen tauchen gelegentlich als Sammelobjekt auf."}`,
    `Punkte: Jedes Sammelobjekt (${w.item}) gibt 10 Punkte; mehrere direkt hintereinander verdoppeln die Punkte.`,
    `Nach dem Scheitern: ${val("failPenalty") ? descOf(qOf("failPenalty"), val("failPenalty")) : "Neustart am letzten Kontrollpunkt, ohne Wartezeit."}`,
    val("ideaRule") && val("ideaRule") !== "Keine Sonderregel" && `Sonderregel: ${val("ideaRule")}.`,
    `Grundschwierigkeit: ${val("diff") || "Leicht bis mittel"}${val("diffModes") ? ` (${val("diffModes")})` : ""}.`,
    val("session") && `Eine Runde bzw. ein Level dauert ${val("session")}.`,
    val("failHelp") && `Hilfe bei Frust: ${val("failHelp")}.`
  ].filter(Boolean));

  /* 5 Level 1 */
  H("Level 1 – komplett ausgearbeitet");
  if (ai && ai.level1) OL(ai.level1.map(x => `${x.abschnitt}: ${x.beschreibung}`));
  else {
    const v1 = verbs[0], v2 = verbs[1];
    const L1 = [
      `Ankommen (0:00–0:15): ${w.places[0]}. Ruhige Musik, keine Gefahr. Ein leuchtender Pfeil oder eine Geste zeigt, was zu tun ist.`,
      v1 ? `Erste Aktion (0:15–0:45): Der Spieler ${vph(v1).replace(/st\b/, "t").replace("du ", "")} zum ersten Mal, an einer Stelle, an der nichts schiefgehen kann.` : "Erste Aktion (0:15–0:45): Die Hauptaktion wird gefahrlos geübt.",
      `Erstes Sammeln (0:45–1:00): Eine Reihe ${w.item} führt den Weg entlang und belohnt jede richtige Aktion mit Ton und Funkeln.`,
      v2 ? `Zweite Aktion (1:00–1:30): Jetzt kommt „${v2}“ dazu, zuerst allein, dann zusammen mit „${v1}“.` : `Erste echte Herausforderung (1:00–1:30): ${chall[0] ? `Sanfte Version von „${chall[0]}“.` : "Ein einfaches Hindernis."}`,
      (has(a, "ideaChallenge", "Gegner") || (val("enemies") && val("enemies") !== "Keine Gegner")) ? `Erster Gegner (1:30–2:00): ${w.foes[0][0]} – ${w.foes[0][1]}. Leicht zu durchschauen.` : `Steigerung (1:30–2:00): Dieselbe Aufgabe, etwas schneller und mit weniger Platz.`,
      `Mini-Finale (2:00–2:30): ${val("ideaFinale") ? `Eine kleine Version von „${val("ideaFinale")}“` : "Ein letzter, etwas schwierigerer Abschnitt"} kombiniert alles Gelernte.`,
      `Belohnung: ${val("levelRating") && val("levelRating") !== "Gar nicht" ? val("levelRating") : "Jubel-Animation"}, ${w.item} werden gezählt, Level 2 wird freigeschaltet.`
    ];
    OL(L1);
  }

  /* 6 Welten */
  const sp = sizePlan();
  H(has(st.a, "structure", "Endloser Lauf", "Zufällig generierte Runs") ? "Ablauf eines endlosen Laufs" : "Welten & Levelplan");
  if (ai && ai.welten) UL(ai.welten.map(x => `${x.name}: Neu: ${x.neu}. Gegner/Hindernisse: ${x.gegner}. Finale: ${x.finale}.`));
  else {
    const biomes = arrOf("biomes"), places = biomes.length ? biomes.concat(w.places) : w.places;
    const news = esc2.length ? esc2 : ["Neue Hindernisse", "Mehr Tempo", "Neue Fähigkeiten"];
    const rows = [];
    for (let i = 0; i < Math.max(1, Math.min(sp.worlds, 6)); i++) {
      const place = places[i % places.length];
      const neu = i === 0 ? "Grundlagen" : i === 1 && val("ideaTwist") && val("ideaTwist") !== "Kein Kniff, klassisch gut" ? `der Clou „${val("ideaTwist")}“` : news[(i - 1) % news.length];
      const foe = w.foes[i % w.foes.length];
      const last = i === Math.min(sp.worlds, 6) - 1;
      rows.push(`${has(st.a, "structure", "Endloser Lauf", "Zufällig generierte Runs") ? `Abschnitt ${i + 1}` : `Welt ${i + 1}`}: ${place}${sp.levels ? ` (${sp.levels} Level)` : ""}. Neu: ${neu}. Typisch: ${foe[0]} (${foe[1]}).${last ? ` Großes Finale (${val("ideaFinale") || "Bosskampf"}) mit ${w.boss}.` : ""}`);
    }
    UL(rows);
  }

  /* 7 Gegner & Objekte */
  H("Figuren, Gegner & Objekte");
  if (ai && ai.gegner) KV(ai.gegner.map(x => [x.name, x.verhalten]));
  else if (val("enemies") === "Keine Gegner" || has(a, "ideaChallenge", "Gar nichts, es ist entspannt")) P(`Keine Gegner. Die Herausforderung kommt aus der Umgebung: ${w.places.slice(0, 3).join(", ")}.`);
  else KV(pickN(w.foes, 4, s).map(f => [f[0], f[1]]).concat(val("enemies") === "Viele Typen plus Bosse" || val("ideaFinale") === "Bosskampf" ? [[w.boss.replace(/^der |^die |^das /, "").replace(/^\w/, c => c.toUpperCase()), "Endgegner mit mehreren Phasen"]] : []));
  if (ai && ai.gegenstaende) KV(ai.gegenstaende.map(x => [x.name, x.wirkung]));
  else {
    const pu = arrOf("powerups").filter(x => x !== "Keine");
    UL([`${w.item}: Haupt-Sammelobjekt${val("currency") ? "" : ", dient als Währung"}.`].concat(pu.map(p => `${p}: ${descOf(qOf("powerups"), p) || "kurzzeitiger Vorteil"}`)));
  }

  /* 8 Fortschritt */
  H("Fortschritt & Motivation");
  UL(ai && ai.fortschritt ? ai.fortschritt : [
    val("progress") && `Fortschritt durch: ${val("progress")}.`, val("upgrades") && `Verbessern: ${val("upgrades")}.`, val("unlocks") && `Freischaltbar: ${val("unlocks")}.`,
    val("daily") && `Täglich: ${val("daily")}.`, val("leaderboard") && val("leaderboard") !== "Keine" && `Ranglisten: ${val("leaderboard")}.`, val("ideaWow") && `Wow-Moment, auf den alles hinarbeitet: ${val("ideaWow")}.`
  ].filter(Boolean).concat(val("progress") ? [] : [`Level schalten nacheinander frei; pro Level gibt es bis zu 3 Sterne.`, `Mit gesammelten ${w.item} kauft man neue Outfits für die Spielfigur.`, `Alle paar Level gibt es eine Überraschung: neue Fähigkeit, neuer Ort oder neuer Gegner.`]));

  /* 9 Look & Sound */
  H("Look & Sound");
  UL(ai && ai.look_und_sound ? ai.look_und_sound : [
    [val("dimension"), val("artStyle")].filter(Boolean).length && `Grafik: ${[val("dimension"), val("artStyle")].filter(Boolean).join(", ")}${val("palette") ? `, Farben ${val("palette")}` : ""}.`,
    val("perspective") && `Ansicht: ${val("perspective")}.`, val("effects") && `Effekte: ${val("effects")}.`,
    val("music") && `Musik: ${val("music")}.`, val("sfx") && `Soundeffekte: ${val("sfx")}.`, val("uiStyle") && `Menüs: ${val("uiStyle")}.`,
    `Jede wichtige Aktion bekommt sichtbares und hörbares Feedback (kleiner Wackler, Funkeln, kurzer Ton).`,
    `Die Spielfigur ist auf jedem Hintergrund klar erkennbar (Umriss oder Kontrastfarbe).`
  ].filter(Boolean));

  /* 10 Multiplayer, Plattform, Geld */
  if (mpAny(a)) { H("Gemeinsam spielen"); UL([`Modus: ${val("mp")}${val("mpKind") ? `, ${val("mpKind")}` : ""}${val("mpCount") ? `, ${val("mpCount")} Spieler` : ""}.`, val("matchmaking") && `Mitspieler: ${val("matchmaking")}.`, val("comms") && `Kommunikation: ${val("comms")}.`].filter(Boolean)); }
  H("Technik, Plattform & Geld");
  UL([val("platforms") && `Läuft auf: ${val("platforms")}.`, val("internet") && `Internet: ${val("internet")}.`, val("save") && `Speichern: ${val("save")}.`, val("account") && `Konto: ${val("account")}.`,
    val("monet") && `Geschäftsmodell: ${val("monet")}${val("iapTypes") ? ` (${val("iapTypes")})` : ""}${val("adTypes") ? ` (${val("adTypes")})` : ""}.`,
    `Empfohlene Technik: ${has(a, "platforms", "Konsole", "VR/AR") ? "Godot oder Unity" : (mobileApp(a) && !web(a)) ? "HTML5/JavaScript mit Capacitor oder Godot, je nach Erfahrung" : "HTML5/JavaScript (läuft sofort im Browser, später als App verpackbar)"}.`].filter(Boolean));

  /* 11 Plan */
  H("Umsetzungsplan");
  P(`Geschätzter Aufwand mit KI-Unterstützung: ${sp.effort}${has(a, "devSkill", "Gar nicht", "Anfänger") ? " (eher am oberen Ende, weil du noch lernst)" : ""}.`);
  OL(ai && ai.erste_schritte ? ai.erste_schritte : milestones().map(m => `${m[0]}: ${m[1]}`));
  const notes = visible().filter(q => noteOf(q.id));
  if (val("finalNotes") || notes.length) { H("Deine Notizen"); UL((val("finalNotes") ? [`Zum Schluss: ${val("finalNotes")}`] : []).concat(notes.map(q => `${q.label}: ${noteOf(q.id)}`))); }
  const c = conflicts();
  if (c.length) { H("Darauf solltest du achten"); UL(c.map(x => x.t)); }
  return { title: names[0], blocks: B };
}

/* ---------- Darstellung im Browser ---------- */
function docHTML(doc) {
  return doc.blocks.map(b => {
    if (b.t === "h2") return `<h2>${esc(b.x)}</h2>`;
    if (b.t === "p") return `<p>${esc(b.x)}</p>`;
    if (b.t === "ul") return `<ul>${b.x.map(i => `<li>${esc(i)}</li>`).join("")}</ul>`;
    if (b.t === "ol") return `<ol>${b.x.map(i => `<li>${esc(i)}</li>`).join("")}</ol>`;
    if (b.t === "kv") return `<dl class="kv">${b.x.map(r => `<div><dt>${esc(r[0])}</dt><dd>${esc(r[1])}</dd></div>`).join("")}</dl>`;
    return "";
  }).join("");
}

/* ---------- KI-Ausarbeitung ---------- */
async function elaborate(btn) {
  if (!CAPS.sample || elaborate.busy) return;
  elaborate.busy = true; st.aiErr = ""; render();
  const status = () => document.getElementById("aiStatus");
  const schema = `{"titel":["3 Namensvorschläge"],"pitch":"3-4 Sätze, die Lust aufs Spiel machen","spielablauf":["8-12 konkrete Schritte einer typischen Runde, Moment für Moment"],"steuerung":[{"eingabe":"z. B. Tippen","aktion":"was passiert"}],"regeln":["6-10 klare Regeln mit konkreten Zahlen"],"level1":[{"abschnitt":"Name + Zeitangabe","beschreibung":"was genau passiert, was der Spieler lernt"}],"welten":[{"name":"","neu":"neue Mechanik","gegner":"","finale":""}],"gegner":[{"name":"","verhalten":"konkretes Verhalten mit Werten"}],"gegenstaende":[{"name":"","wirkung":""}],"fortschritt":["5-8 Punkte"],"look_und_sound":["5-8 konkrete Punkte"],"erste_schritte":["6-8 Umsetzungsschritte"]}`;
  const input = `Du bist ein erfahrener Game Designer. Entwirf aus der folgenden Spezifikation ein konkretes, eigenständiges erstes Spiel. Erfinde konkrete Namen, Zahlen, Gegner, Level-Abläufe und Regeln, die genau zu den Antworten passen. Alles auf Deutsch, verständlich für Laien. Kopiere keine bestehenden Spiele.

Antworte NUR mit JSON exakt in dieser Form (6-8 Einträge bei Listen, Level 1 mit 6-8 Abschnitten, 3-6 Welten passend zum Umfang):
${schema}

SPEZIFIKATION:
${buildPrompt()}`;
  try {
    const out = await CAPS.sample.json(input, { modelTier: "complex", cache: false, onText: ({ text }) => { const s = status(); if (s) s.textContent = `Claude schreibt … ${text.length.toLocaleString("de-DE")} Zeichen`; } });
    if (out && typeof out === "object") { st.ai = out; st.aiSig = JSON.stringify(st.a); }
  } catch (e) {
    st.aiErr = e && e.code === "rate_limited" ? "Gerade zu viele Anfragen. Versuch es in einer Minute noch einmal." : e && e.code === "not_granted" ? "Claude-Ausarbeitung wurde nicht erlaubt." : "Die Ausarbeitung hat nicht geklappt. Du kannst es noch einmal versuchen.";
  }
  elaborate.busy = false; render();
}

/* ---------- PDF ---------- */
const pdfTxt = s => String(s).replace(/[„“”]/g, '"').replace(/[‘’]/g, "'").replace(/[–—]/g, "-").replace(/…/g, "...").replace(/→/g, "->").replace(/⇄/g, "<->").replace(/·/g, "-")
  .replace(/[^\x00-\xFF]/g, "").replace(/\s+/g, " ").trim();
async function savePDF(btn) {
  const J = window.jspdf && window.jspdf.jsPDF;
  const old = btn.textContent;
  if (!J || !canPDF()) { btn.textContent = "PDF hier nicht verfügbar"; setTimeout(() => btn.textContent = old, 2500); return; }
  const doc = concept(), pdf = new J({ unit: "mm", format: "a4" });
  const W = 210, M = 18, CW = W - 2 * M, BOT = 280;
  let y = M;
  const ink = [23, 26, 51], acc = [45, 60, 203], mut = [90, 96, 132];
  const need = h => { if (y + h > BOT) { pdf.addPage(); y = M; } };
  const text = (s, size, style, color, x = M, width = CW, lh = 1.45) => {
    pdf.setFont("helvetica", style); pdf.setFontSize(size); pdf.setTextColor(...color);
    const lines = pdf.splitTextToSize(pdfTxt(s), width); const h = size * 0.3528 * lh;
    lines.forEach(l => { need(h); pdf.text(l, x, y + h * 0.8); y += h; });
  };
  // Titelseite
  pdf.setFillColor(...acc); pdf.rect(0, 0, W, 95, "F");
  pdf.setFillColor(255, 197, 61); pdf.rect(0, 95, W, 4, "F");
  pdf.setTextColor(255, 255, 255); pdf.setFont("helvetica", "bold"); pdf.setFontSize(11); pdf.text("SPIELKONZEPT", M, 30);
  pdf.setFontSize(30); pdf.splitTextToSize(pdfTxt(doc.title), CW).forEach((l, i) => pdf.text(l, M, 48 + i * 12));
  pdf.setFont("helvetica", "normal"); pdf.setFontSize(11);
  pdf.text(pdfTxt(`Erstellt mit dem Game-Bauplan am ${new Date().toLocaleDateString("de-DE")}${st.ai ? " - ausgearbeitet mit Claude" : ""}`), M, 85);
  y = 104;
  doc.blocks.forEach(b => {
    if (b.t === "h2") { need(18); y += 6; pdf.setDrawColor(...acc); pdf.setLineWidth(0.6); pdf.line(M, y, M + 14, y); y += 3; text(b.x, 15, "bold", acc); y += 1.5; }
    else if (b.t === "p") { text(b.x, 10.5, "normal", ink); y += 2; }
    else if (b.t === "ul" || b.t === "ol") b.x.forEach((it, i) => {
      const mark = b.t === "ol" ? `${i + 1}.` : "-"; need(6);
      pdf.setFont("helvetica", "bold"); pdf.setFontSize(10.5); pdf.setTextColor(...acc); pdf.text(mark, M, y + 3.6);
      text(it, 10.5, "normal", ink, M + 7, CW - 7); y += 1.2;
    });
    else if (b.t === "kv") b.x.forEach(r => {
      const yy = y; pdf.setFont("helvetica", "bold"); pdf.setFontSize(9.5);
      const kl = pdf.splitTextToSize(pdfTxt(r[0]), 48); need(kl.length * 5 + 2);
      const y0 = y; text(r[0], 9.5, "bold", mut, M, 48); const y1 = y; y = y0;
      text(r[1], 10.5, "normal", ink, M + 52, CW - 52); y = Math.max(y, y1) + 1.5;
      pdf.setDrawColor(211, 216, 234); pdf.setLineWidth(0.2); pdf.line(M, y - 0.8, W - M, y - 0.8);
    });
  });
  // Checkliste + alle Antworten
  pdf.addPage(); y = M;
  text("Launch-Checkliste", 15, "bold", acc); y += 2;
  launchItems().forEach(i => { need(10); pdf.setDrawColor(...ink); pdf.setLineWidth(0.3); pdf.rect(M, y + 1, 3.5, 3.5); text(`${i.t}: ${i.d}`, 10, "normal", ink, M + 7, CW - 7); y += 1.5; });
  y += 6; text("Alle Antworten", 15, "bold", acc); y += 2;
  const v = visible().filter(q => !q.quiz);
  S.forEach(sec => {
    const qs = v.filter(q => q.sec === sec.id && answered(q)); if (!qs.length) return;
    need(14); y += 2; text(sec.name, 11.5, "bold", ink);
    qs.forEach(q => { const y0 = y; text(q.label, 9, "normal", mut, M, 55); const y1 = y; y = y0; text(fmt(q) + (noteOf(q.id) ? `  |  Notiz: ${noteOf(q.id)}` : ""), 9.5, "normal", ink, M + 58, CW - 58); y = Math.max(y, y1) + 0.8; });
  });
  const n = pdf.getNumberOfPages();
  for (let i = 2; i <= n; i++) { pdf.setPage(i); pdf.setFont("helvetica", "normal"); pdf.setFontSize(8.5); pdf.setTextColor(...mut); pdf.text(pdfTxt(`${doc.title} - Spielkonzept`), M, 290); pdf.text(`${i} / ${n}`, W - M, 290, { align: "right" }); }
  const file = (pdfTxt(doc.title).replace(/[^A-Za-z0-9ÄÖÜäöüß -]/g, "").trim() || "Spielkonzept") + " - Spielkonzept.pdf";
  try {
    btn.textContent = "Speichern bestätigen …";
    await deliverPDF(pdf, file);
    btn.textContent = "PDF gespeichert ✓";
  } catch (e) {
    btn.textContent = e && e.code === "declined" ? "Abgebrochen" : "PDF ging nicht";
  }
  setTimeout(() => btn.textContent = old, 2500);
}

/* ---------- Fähigkeiten der Seite ---------- */
(async () => {
  if (!window.claude || !window.claude.use) return;
  const [d, s] = await Promise.all([window.claude.use("downloads").catch(() => null), window.claude.use("sample").catch(() => null)]);
  CAPS.downloads = d; CAPS.sample = s;
  if (st.view === "result") render();
})();
