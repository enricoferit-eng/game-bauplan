/* Nordlicht – ausführlicher KI-Bauauftrag + PDF */
function conceptMD(doc, skip) {
  const L = [];
  let skipping = false;
  doc.blocks.forEach(b => {
    if (b.t === "h2") { skipping = skip.includes(b.x); if (!skipping) L.push("", `### ${b.x}`, ""); return; }
    if (skipping) return;
    if (b.t === "p") L.push(b.x);
    else if (b.t === "ul") b.x.forEach(i => L.push(`- ${i}`));
    else if (b.t === "ol") b.x.forEach((i, n) => L.push(`${n + 1}. ${i}`));
    else if (b.t === "kv") b.x.forEach(r => L.push(`- **${r[0]}:** ${r[1]}`));
  });
  return L;
}
function balancing() {
  const a = st.a, sp = sizePlan();
  const sec = { "1–3 Minuten": 120, "5–10 Minuten": 420, "15–30 Minuten": 1200, "30–60 Minuten": 2400, "Stundenlang": 3600 }[val("session")] || 300;
  const lives = { "Sie hält einiges aus": 5, "Ein Treffer reicht": 1, "Ein paar Versuche": 3, "Nichts Schlimmes": 0 }[val("health")] ?? 3;
  const speed = { "Gemütlich": 0.7, "Mittel": 1, "Schnell": 1.3, "Hektisch": 1.6, "Wechselnd": 1 }[val("pace")] || 1;
  const diff = { "Sehr leicht": 0.6, "Leicht": 0.8, "Mittel": 1, "Schwer": 1.3, "Bockschwer": 1.7 }[val("diff")] || 0.9;
  const w = WORLD[val("setting")] || DEF_WORLD;
  return [
    "const CONFIG = {",
    `  zielRundenDauerSekunden: ${sec},        // aus „Rundendauer“: ${val("session") || "KI entscheidet"}`,
    `  leben: ${lives},                         // 0 = keine Leben, nur Zurücksetzen`,
    `  grundTempo: ${speed},                    // 1 = normal; aus „Tempo“: ${val("pace") || "KI entscheidet"}`,
    `  tempoSteigerungProMinute: ${has(a, "ideaEscalation", "Mehr Tempo") ? 0.12 : 0.04},`,
    `  schwierigkeitsFaktor: ${diff},           // aus „Grundschwierigkeit“: ${val("diff") || "KI entscheidet"}`,
    `  punkteProSammelobjekt: 10,               // Sammelobjekt: ${w.item}`,
    `  komboMultiplikatorMax: 4,`,
    `  welten: ${sp.worlds},`,
    `  levelProWelt: ${sp.levels || "\"endlos\""},`,
    `  ersterGegnerNachSekunden: ${has(a, "ideaChallenge", "Gegner") ? 60 : 90},`,
    `  hilfeNachFehlversuchen: ${val("failHelp") && val("failHelp") !== "Nichts" ? 3 : 0},`,
    `  sterneSchwellen: [0.5, 0.75, 0.95],      // Anteil der maximalen Punkte für 1/2/3 Sterne`,
    "};"
  ];
}
function screens() {
  const a = st.a, s = ["Ladebildschirm (höchstens 3 Sekunden)", "Titelbildschirm mit großem „Spielen“-Knopf"];
  if (!has(a, "structure", "Endloser Lauf", "Eine Arena / ein Spielfeld")) s.push("Levelauswahl bzw. Weltkarte");
  s.push("Spielbildschirm (mit Pause-Knopf)", "Pause-Menü: Weiter, Neustart, Einstellungen, Zurück zum Titel", "Gewonnen-Bildschirm mit Punkten, Sternen und „Weiter“", "Verloren-Bildschirm mit „Nochmal“ (ein Tipp) und „Zurück“", "Einstellungen: Ton/Musik, Sprache, Barrierefreiheit, Daten zurücksetzen");
  if (iap(a) || val("upgrades") || has(a, "progress", "Kosmetik")) s.push("Shop bzw. Upgrade-Bildschirm");
  if (mpAny(a)) s.push("Multiplayer-Lobby: Mitspieler finden oder einladen");
  if (has(a, "parents", "Elternbereich mit Sperre")) s.push("Elternbereich hinter Elternschranke");
  return s;
}
const DOD = {
  "Grundgerüst & Kernmechanik": "Man kann das Spiel starten, die Hauptaktion ausführen, gewinnen und verlieren. Grafik darf aus einfachen Formen bestehen.",
  "Spielinhalte": "Level 1 ist genau wie in Teil B beschrieben spielbar, alle Welten existieren mit mindestens einem Level.",
  "Grafik & Sound": "Kein Platzhalter mehr sichtbar oder hörbar; Stil entspricht Teil C „Grafik & Kunststil“ und „Sound & Musik“.",
  "Menüs & Komfort": "Alle Bildschirme aus „Bildschirme & Ablauf“ funktionieren; Fortschritt bleibt nach Neustart erhalten.",
  "Multiplayer": "Zwei Geräte können gemeinsam eine komplette Runde spielen; Verbindungsabbrüche führen nicht zum Absturz.",
  "Monetarisierung & Marke": "Das Geschäftsmodell funktioniert im Testmodus, ohne den Spielfluss zu stören.",
  "Feinschliff & Balancing": "Drei Testpersonen aus der Zielgruppe schaffen Level 1 ohne Hilfe; keine bekannten Fehler offen.",
  "Veröffentlichung": "Alle Builds und Store-Texte sind fertig; die Launch-Checkliste ist abgearbeitet."
};

function buildGamePrompt() {
  const a = st.a, v = visible().filter(q => !q.quiz), L = [];
  const doc = concept(), lvl = LEVELS.find(l => l.n === st.level);
  const P = (...x) => L.push(...x), blank = () => L.push("");
  const skill = val("devSkill");

  P(`# Spiel-Bauauftrag: „${doc.title}“ (Arbeitstitel)`, "");
  P("Dieses Dokument ist der vollständige Bauauftrag für ein Videospiel. Es wurde mit einem Fragebogen erstellt, den ich (der Auftraggeber) ausgefüllt habe. Lies es komplett, bevor du irgendetwas tust.", "");
  P("**Aufbau des Dokuments:**", "- **Teil A** – So arbeitest du (Regeln, Rangfolge, Begriffe)", "- **Teil B** – Das Spielidee-System (was für ein Spiel es ist und wie es funktioniert)", "- **Teil C** – Alle Detailvorgaben aus dem Fragebogen", "- **Teil D** – Umsetzung, Abnahme, Tests und deine erste Antwort", "");
  P("---", "", "## Teil A – So arbeitest du", "");
  P("### A1. Deine Rolle", "", "Du bist ein komplettes kleines Spielestudio in einer Person: Game Designer, Programmierer, Grafiker, Sounddesigner und Tester. Du baust dieses Spiel von Anfang bis Ende so, dass es fertig, spielbar und fehlerfrei ist.", "");
  P("### A2. Grundregeln", "");
  const rules = [
    "Setze jede Vorgabe dieses Dokuments exakt um. Weiche nur ab, wenn eine Vorgabe technisch unmöglich ist, und sag das dann ausdrücklich mit einer Alternative.",
    "Erfinde keine Features, Modi oder Systeme, die hier nicht stehen. Ausnahme: Dinge, die zwingend nötig sind, damit das Spiel vollständig funktioniert (z. B. Pausenmenü). Liste jede solche Ergänzung auf.",
    "Steht bei einem Punkt „KI entscheidet“, triff die beste Entscheidung passend zu Zielgruppe, Spielidee und Stil. Sammle alle diese Entscheidungen in der Tabelle „Meine Entscheidungen“ (Spalten: Punkt | Entscheidung | abgeleitet aus).",
    `Der Fragebogen wurde in der Detailstufe „${lvl.name}“ ausgefüllt.${st.level < 4 ? " Was hier nicht genannt ist, entscheidest du selbst, konsistent mit allen Vorgaben, und trägst es in „Meine Entscheidungen“ ein." : ""}`,
    "Ich bin kein Spieleentwickler. Viele Antworten beschreiben Gefühle und Vorlieben statt Technik. Leite daraus alle konkreten Details ab: Technik, Waffen und Angriffe, Gegnerverhalten, Zahlenwerte, Kamera, Menüs, Speichern, Datenschutz, Animationen.",
    "Lieblingsspiele sind nur eine Referenz für das Spielgefühl. Kopiere keine geschützten Namen, Figuren, Grafiken, Level, Sounds oder Musik. Das Spiel muss eigenständig sein.",
    "Schreibe vollständigen, lauffähigen Code. Keine Platzhalter wie „TODO“ oder „hier Logik einfügen“, keine gekürzten Dateien, kein „Rest wie oben“.",
    "Alle Spieltexte stehen zentral in einem Text-Objekt bzw. einer Sprachdatei. Alle Zahlenwerte stehen zentral in der Konfiguration (siehe Teil B, „Startwerte“).",
    "Wähle die Technik so, dass das Spiel auf den genannten Plattformen läuft und für meine Kenntnisse machbar ist. Bei wenig Erfahrung: HTML5/JavaScript, das ohne Installation im Browser läuft.",
    "Kommuniziere mit mir auf Deutsch, in kurzen, klaren Sätzen."
  ];
  const sk = {
    "Gar nicht": "Ich kann nicht programmieren. Erkläre jeden Schritt so, dass ein Laie ihn nachmachen kann: welche Programme ich installiere, wo ich welche Datei speichere, wie ich das Spiel starte und teste. Jeder Fachbegriff bekommt beim ersten Mal eine Erklärung in einem Satz.",
    "Anfänger": "Ich habe Grundkenntnisse. Erkläre neue Konzepte kurz und kommentiere den Code verständlich.",
    "Fortgeschritten": "Ich kann programmieren. Kommentiere nur Nicht-Offensichtliches und erkläre Architekturentscheidungen kurz.",
    "Profi": "Ich bin erfahren. Konzentriere dich auf saubere Architektur, Performance und Wartbarkeit."
  }[skill];
  if (sk) rules.push(sk);
  rules.forEach((r, i) => P(`${i + 1}. ${r}`)); blank();
  P("### A3. Rangfolge bei Widersprüchen", "", "Wenn sich Angaben widersprechen, gilt diese Reihenfolge (oben gewinnt). Melde jeden Widerspruch trotzdem bei mir.", "");
  P("1. Strikte Verbote und Schutz der Zielgruppe (Teil C, „Strikte Verbote“, „Zielgruppe“)", "2. Meine eigenen Worte: meine Gedanken (B0) und Notizen (📝) – sie präzisieren oder ändern die ausgewählten Antworten", "3. Das Spielidee-System (Teil B)", "4. Die Detailvorgaben (Teil C)", "5. Deine eigenen Entscheidungen", "");
  P("### A4. Begriffe in diesem Dokument", "");
  [["Kernschleife", "Die Handlung, die sich im Spiel ständig wiederholt und Spaß machen muss."], ["Level / Welt", "Ein Level ist ein spielbarer Abschnitt. Eine Welt ist eine Gruppe von Leveln mit gemeinsamem Ort und Thema."],
   ["Run", "Ein kompletter Durchlauf von Anfang bis zum Scheitern oder Sieg."], ["Power-up", "Ein Gegenstand, der kurzzeitig einen Vorteil gibt."],
   ["Kontrollpunkt", "Stelle, an der man nach dem Scheitern wieder startet."], ["Balancing", "Das Feineinstellen von Zahlen (Tempo, Schaden, Belohnungen), damit es fair und spannend ist."],
   ["Softlock", "Ein Zustand, in dem man nicht mehr weiterkommt und auch nicht zurück kann. Muss ausgeschlossen sein."], ["Platzhalter", "Einfache Formen oder Töne, die später durch fertige Grafik und Sounds ersetzt werden."],
   ["„KI entscheidet“", "Ich habe hier bewusst keine Vorgabe gemacht; du entscheidest."], ["Text nach „–“", "Bei jeder Antwort erklärt der Text nach dem Gedankenstrich verbindlich, was gemeint ist."]]
    .forEach(([k, x]) => P(`- **${k}:** ${x}`));
  blank();

  /* Teil B */
  P("---", "", "## Teil B – Das Spielidee-System", "");
  if (val("thoughts")) {
    P("### B0. Meine Gedanken – der Ausgangspunkt für alles", "", "So habe ich mein Spiel zuerst in eigenen Worten beschrieben. Alle Antworten unten sind daraus entstanden. Das fertige Spiel muss sich wie diese Beschreibung anfühlen. Widerspricht eine Detailantwort diesen Gedanken, frag nach.", "");
    val("thoughts").split(/\n+/).forEach(l => l.trim() && P(`> ${l.trim()}`)); blank();
  }
  P("### B1. Die Spielidee in einem Absatz", "", `> ${ideaText() || summarySentence()}`, "");
  const allNotes = visible().filter(q => noteOf(q.id) || (q.id === "finalNotes" && val("finalNotes")));
  if (allNotes.length) {
    P("### ⚠️ Wichtige Notizen des Auftraggebers", "", "Diese Notizen habe ich selbst geschrieben. Sie sind verbindlich und gehen den Auswahl-Antworten vor.", "");
    if (val("finalNotes")) P(`- **Zum Schluss:** „${val("finalNotes")}“`);
    allNotes.filter(q => noteOf(q.id)).forEach(q => P(`- **${q.label}** (Antwort: ${fmt(q)}): „${noteOf(q.id)}“`));
    blank();
  }
  P("### B2. Steckbrief", "");
  P(`- **Arbeitstitel / Namensideen:** ${doc.blocks.find(b => b.t === "kv").x[0][1]}${val("nameStyle") ? ` (gewünschter Namensstil: ${val("nameStyle")})` : ""}`);
  prof().forEach(([k, x]) => P(`- **${k}:** ${x}`));
  if (val("ideaRef")) P(`- **Gewünschtes Spielgefühl ähnlich wie:** ${val("ideaRef")} (nur als Gefühl, nicht kopieren)`);
  blank();
  P("### B3. Die Bausteine der Idee", "", "Diese Bausteine sind das Herz des Spiels. Jeder muss im fertigen Spiel klar erkennbar sein.", "");
  ["ideaVerb", "ideaGoal", "hero", "setting", "ideaChallenge", "ideaTwist", "ideaEscalation", "ideaStart", "ideaWow", "ideaFinale", "ideaRule", "ideaPerfect"].forEach(id => {
    const q = qOf(id); if (!q || !answered(q)) return; const l = answerLines(q); if (l) P(...l);
  });
  blank();
  const verbs = arrOf("ideaVerb"), w = WORLD[val("setting")] || DEF_WORLD;
  P("### B4. Die Kernschleife", "", "Das Spiel besteht aus drei ineinander greifenden Schleifen:", "");
  P(`1. **Sekunde für Sekunde:** Der Spieler ${verbs.length ? verbs.map(v => (PH.verb[v] || v).split("|").map((s, i) => i ? s : s.replace(/st$/, "t").replace(/st /, "t ")).join(" ")).join(" und ") : "führt die Hauptaktion aus"}${arrOf("ideaChallenge").length ? `, während ${arrOf("ideaChallenge").map(c => PH.ch[c]).filter(Boolean).join(" und ") || "die Herausforderung wächst"}` : ""}. Jede gelungene Aktion gibt sofort sichtbares und hörbares Feedback.`);
  P(`2. **Runde für Runde:** Ziel ist ${val("ideaGoal") ? `„${val("ideaGoal")}“` : "das Level zu schaffen"}. Dabei werden ${val("collect") && val("collect") !== "Nichts" ? val("collect") : w.item} gesammelt. Die Runde endet mit ${val("ideaFinale") ? `„${val("ideaFinale")}“` : "einer Auswertung"} und einer Belohnung.`);
  P(`3. **Tag für Tag:** ${val("progress") ? `Fortschritt durch ${val("progress")}` : "Neue Level und Belohnungen werden freigeschaltet"}${val("daily") && val("daily") !== "Nein" ? `; dazu ${val("daily")}` : ""}. Mit der Zeit wird es spannender durch ${val("ideaEscalation") || "neue Herausforderungen"}.`);
  blank();
  let bn = 5;
  P(...conceptMD(doc, ["Das Spiel in Kürze", "Umsetzungsplan", "Darauf solltest du achten", "Technik, Plattform & Geld"]).map(x => x.startsWith("### ") ? `### B${bn++}. ${x.slice(4)}` : x));
  blank();
  P(`### B${bn++}. Bildschirme & Ablauf`, "", "Das Spiel hat mindestens diese Bildschirme. Von jedem Bildschirm gibt es einen Weg zurück.", "");
  screens().forEach((s, i) => P(`${i + 1}. ${s}`));
  P("", "Ablauf: Laden → Titel → (Levelauswahl) → Spiel ⇄ Pause → Gewonnen oder Verloren → nächstes Level bzw. Nochmal.", "");
  P(`### B${bn++}. Startwerte für das Balancing`, "", "Beginne mit diesen Werten in einer zentralen Konfiguration. Du darfst sie beim Testen anpassen; nenne jede Änderung.", "", "```js", ...balancing(), "```", "");

  /* Teil C */
  P("---", "", "## Teil C – Alle Detailvorgaben", "", "Hier stehen alle Antworten aus dem Fragebogen, nach Bereichen sortiert. Der Text nach „–“ erklärt jeweils verbindlich, was gemeint ist.", "");
  let n = 1;
  S.forEach(s => {
    const qs = v.filter(q => q.sec === s.id && (answered(q) || noteOf(q.id)) && s.id !== "idea" && q.id !== "finalNotes" && q.id !== "thoughts");
    if (!qs.length) return;
    P(`### C${n++}. ${s.name}`, "");
    qs.forEach(q => { const l = answerLines(q); if (l) P(...l); });
    blank();
  });
  const taboo = Array.isArray(a.taboo) ? a.taboo.filter(x => x !== AI && x !== "Keine Einschränkungen") : [];
  P(`### C${n++}. Strikte Verbote`, "");
  if (taboo.length) taboo.forEach(t => P(`- **NIEMALS:** ${t} – ${descOf(qOf("taboo"), t)}`));
  if (kids(a)) P("- **NIEMALS:** Inhalte, Links oder Käufe, die Kinder ohne Elternschranke erreichen.");
  P("- **NIEMALS:** Geschützte Namen, Figuren, Grafiken oder Musik aus bestehenden Spielen.");
  blank();
  const c = conflicts();
  if (c.length) { P(`### C${n++}. Hinweise & mögliche Konflikte`, "", "Kläre diese Punkte mit mir, bevor du die betroffenen Teile baust:", ""); c.forEach(x => P(`- ${x.k === "warn" ? "⚠️" : "ℹ️"} ${x.t}`)); blank(); }

  /* Teil D */
  P("---", "", "## Teil D – Umsetzung & Abnahme", "");
  P("### D1. Technik", "");
  const tech = doc.blocks.findIndex(b => b.t === "h2" && b.x === "Technik, Plattform & Geld");
  if (tech >= 0) doc.blocks[tech + 1].x.forEach(x => P(`- ${x}`));
  P("- Spielzustand, Texte und Konfiguration sind klar voneinander getrennt.", "- Der Code ist in sinnvolle Teile gegliedert (z. B. Spielschleife, Eingabe, Figuren, Level, Oberfläche, Sound, Speichern).", "");
  P("### D2. Meilensteine", "");
  milestones().forEach((m, i) => P(`${i + 1}. **${m[0]}:** ${m[1]}`, `   - *Fertig, wenn:* ${DOD[m[0]] || "alles darin funktioniert und getestet ist."}`));
  if (has(a, "workflow", "Schritt für Schritt")) P("", "Nach jedem Meilenstein: stoppen, kurz zusammenfassen, was fertig ist und wie ich es teste, und auf mein OK warten.");
  else if (has(a, "workflow", "Erst eine Probe")) P("", "Liefere zuerst Meilenstein 1 als spielbare Probe und warte auf mein Feedback. Danach die restlichen Meilensteine.");
  else if (has(a, "workflow", "Alles auf einmal")) P("", "Arbeite alle Meilensteine nacheinander ab, ohne zwischendurch auf Rückmeldung zu warten.");
  blank();
  P("### D3. Abnahmekriterien", "", "Das Spiel gilt erst als fertig, wenn alles hiervon erfüllt ist:", "");
  acceptance().forEach(x => P(`- [ ] ${x}`));
  P("- [ ] Level 1 läuft genau so ab, wie in Teil B beschrieben.", "- [ ] Alle Bausteine aus B3 sind im Spiel klar erkennbar.", "");
  P("### D4. Testplan", "", "Führe diese Tests selbst gedanklich bzw. im Code durch und beschreibe mir, wie ich sie nachmache:", "");
  ["Spiel starten: In höchstens 10 Sekunden ist man im Spiel.", "Level 1 komplett durchspielen und gewinnen.", "Absichtlich scheitern: Der Neustart funktioniert wie beschrieben.",
   "Mitten im Spiel pausieren, Einstellungen ändern, weiterspielen.", "Spiel schließen und neu öffnen: Fortschritt ist noch da.",
   touch(a) ? "Auf einem kleinen Handy und einem Tablet testen: nichts ist abgeschnitten, alle Knöpfe sind gut treffbar." : "In verschiedenen Fenstergrößen testen: nichts ist abgeschnitten.",
   "Ton aus und wieder an: Musik und Effekte reagieren richtig.", "Alles aus „Strikte Verbote“ prüfen: nichts davon kommt vor.", "Zehn Minuten am Stück spielen: kein Ruckeln, kein Absturz, kein Softlock."]
    .forEach((t, i) => P(`${i + 1}. ${t}`));
  blank();
  P("### D5. Lieferumfang", "");
  P("- Vollständiger, lauffähiger Code", "- Anleitung: Wie starte ich das Spiel und wie teste ich es?", "- Tabelle „Meine Entscheidungen“", "- Liste aller Ergänzungen, die nicht im Auftrag standen", "- Liste aller verwendeten fremden Inhalte mit Lizenz (falls vorhanden)");
  if (publicLaunch(a)) P(`- Unterstützung für die Veröffentlichung auf: ${val("launchWhere")}${val("storeAssets") ? ` (${val("storeAssets")})` : ""}`);
  blank();
  P("### D6. Deine erste Antwort", "", "Beginne NICHT sofort mit Code. Antworte zuerst in dieser Reihenfolge:", "");
  P("1. **Verständnischeck:** Beantworte diese Fragen in je einem Satz:",
    "   - Was macht der Spieler die meiste Zeit?", "   - Was ist sein Ziel, und wie gewinnt er ein Level?", "   - Wie verliert man, und was passiert dann?",
    "   - Was ist der besondere Clou des Spiels?", "   - Wie läuft Level 1 ab?", "   - Für wen ist das Spiel, und was darf auf keinen Fall vorkommen?",
    "   - Wie wird das Spiel mit der Zeit spannender?", "   - Auf welchen Geräten läuft es, und wie wird es bedient?",
    "2. **Dein Plan:** Technik, Dateistruktur, Meilensteine.", "3. **Offene Fragen:** Alles, was unklar oder widersprüchlich ist.",
    "4. **Namen:** Drei Namensvorschläge im gewünschten Stil.", "5. Dann wartest du auf mein OK und startest mit Meilenstein 1.");
  return L.join("\n");
}

/* ---------- PDF des KI-Prompts ---------- */
async function savePromptPDF(btn) {
  const J = window.jspdf && window.jspdf.jsPDF, old = btn.textContent;
  if (!J || !canPDF()) { btn.textContent = "PDF hier nicht verfügbar"; setTimeout(() => btn.textContent = old, 2500); return; }
  const md = buildPrompt(), title = concept().title, pdf = new J({ unit: "mm", format: "a4" });
  const W = 210, M = 18, CW = W - 2 * M, BOT = 280, ink = [23, 26, 51], acc = [45, 60, 203], mut = [90, 96, 132];
  let y = M;
  const need = h => { if (y + h > BOT) { pdf.addPage(); y = M; } };
  const text = (s, size, style, color, x = M, width = CW, font = "helvetica") => {
    pdf.setFont(font, style); pdf.setFontSize(size); pdf.setTextColor(...color);
    const h = size * 0.3528 * 1.42;
    pdf.splitTextToSize(pdfTxt(s.replace(/\*\*/g, "").replace(/\*/g, "")), width).forEach(l => { need(h); pdf.text(l, x, y + h * 0.8); y += h; });
  };
  pdf.setFillColor(...ink); pdf.rect(0, 0, W, 70, "F"); pdf.setFillColor(255, 197, 61); pdf.rect(0, 70, W, 3, "F");
  pdf.setTextColor(255, 255, 255); pdf.setFont("helvetica", "bold"); pdf.setFontSize(10.5); pdf.text("KI-BAUAUFTRAG", M, 26);
  pdf.setFontSize(24); pdf.splitTextToSize(pdfTxt(title), CW).forEach((l, i) => pdf.text(l, M, 40 + i * 10));
  pdf.setFont("helvetica", "normal"); pdf.setFontSize(10); pdf.text(pdfTxt(`Komplett in eine KI kopieren (z. B. Claude). Erstellt am ${new Date().toLocaleDateString("de-DE")}.`), M, 62);
  y = 82;
  let code = false;
  md.split("\n").forEach((line, idx) => {
    if (idx === 0) return;
    if (line.startsWith("```")) { code = !code; y += 1.5; return; }
    if (code) { need(4.5); pdf.setFillColor(238, 240, 248); pdf.rect(M, y, CW, 4.6, "F"); text(line, 8.5, "normal", ink, M + 2, CW - 4, "courier"); return; }
    if (!line.trim()) { y += 2; return; }
    if (line === "---") { need(8); y += 3; pdf.setDrawColor(211, 216, 234); pdf.setLineWidth(0.3); pdf.line(M, y, W - M, y); y += 3; return; }
    if (line.startsWith("## ")) { if (y > M + 40) { pdf.addPage(); y = M; } text(line.slice(3), 17, "bold", acc); y += 2; return; }
    if (line.startsWith("### ")) { need(14); y += 3; text(line.slice(4), 12.5, "bold", ink); y += 1; return; }
    if (line.startsWith("> ")) { const y0 = y; text(line.slice(2), 11, "italic", ink, M + 5, CW - 5); pdf.setDrawColor(...acc); pdf.setLineWidth(1); pdf.line(M + 1, y0 + 1, M + 1, y - 0.5); return; }
    let m;
    if ((m = line.match(/^(\s*)- \[ \] (.*)/))) { need(6); pdf.setDrawColor(...ink); pdf.setLineWidth(0.3); pdf.rect(M, y + 1, 3.2, 3.2); text(m[2], 10, "normal", ink, M + 6, CW - 6); return; }
    if ((m = line.match(/^(\s*)- (.*)/))) { const ind = m[1].length ? 6 : 0; need(5); pdf.setFillColor(...acc); pdf.circle(M + ind + 1.2, y + 2.6, 0.7, "F"); text(m[2], 10, "normal", ink, M + ind + 5, CW - ind - 5); return; }
    if ((m = line.match(/^(\s*)(\d+)\. (.*)/))) { const ind = m[1].length ? 6 : 0; need(5); pdf.setFont("helvetica", "bold"); pdf.setFontSize(10); pdf.setTextColor(...acc); pdf.text(`${m[2]}.`, M + ind, y + 3.6); text(m[3], 10, "normal", ink, M + ind + 6, CW - ind - 6); return; }
    text(line, 10, "normal", ink);
  });
  const n = pdf.getNumberOfPages();
  for (let i = 2; i <= n; i++) { pdf.setPage(i); pdf.setFont("helvetica", "normal"); pdf.setFontSize(8.5); pdf.setTextColor(...mut); pdf.text(pdfTxt(`${title} - KI-Bauauftrag`), M, 290); pdf.text(`${i} / ${n}`, W - M, 290, { align: "right" }); }
  const file = (pdfTxt(title).replace(/[^A-Za-z0-9ÄÖÜäöüß -]/g, "").trim() || "Spiel") + " - KI-Bauauftrag.pdf";
  try { btn.textContent = "Speichern bestätigen …"; await deliverPDF(pdf, file); btn.textContent = "PDF gespeichert ✓"; }
  catch (e) { btn.textContent = e && e.code === "declined" ? "Abgebrochen" : "PDF ging nicht"; }
  setTimeout(() => btn.textContent = old, 2500);
}
