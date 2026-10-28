/* Ovio – Konzept, Bauauftrag und Checkliste für alles außer Spielen.
   Die Spiel-Varianten (gameConcept, buildGamePrompt, …) bleiben unverändert; hier wird je nach Projektart verteilt. */
const kindText = () => val("kind") || "Software-Projekt";
const concept = () => isGame(st.a) ? gameConcept() : genConcept();
const buildPrompt = () => isGame(st.a) ? buildGamePrompt() : buildGenPrompt();
const launchItems = () => isGame(st.a) ? gameLaunchItems() : genLaunchItems();
const conflicts = () => isGame(st.a) ? gameConflicts() : [];
function buildSummaryText() {
  if (isGame(st.a)) return gameSummaryText();
  const doc = genConcept();
  return [`ZUSAMMENFASSUNG: ${doc.title}`, ""].concat(conceptMD(doc, []), ["", "— Launch-Checkliste —"], genLaunchItems().map(i => `☐ ${i.t}: ${i.d}`)).join("\n");
}
/* Beantwortete Fragen eines Bereichs (ohne Gedanken/Schluss) */
const answeredIn = secId => visible().filter(q => q.sec === secId && answered(q) && q.id !== "thoughts" && q.id !== "finalNotes");

function genConcept() {
  const ai = st.ai && st.ai.funktionen ? st.ai : null;
  const B = [];
  const H = x => B.push({ t: "h2", x }), P = x => x && B.push({ t: "p", x }), UL = x => x && x.length && B.push({ t: "ul", x }), OL = x => x && x.length && B.push({ t: "ol", x }), KV = x => B.push({ t: "kv", x: x.filter(r => r[1]) });
  if (val("thoughts")) { H("Deine Ausgangsidee"); P(`„${val("thoughts")}“`); }
  H("Überblick");
  if (ai && ai.pitch) P(ai.pitch);
  KV([["Projektart", kindText()], ["Hauptaufgabe", val("gGoal")], ["Für wen", val("gAudience")], ["Nutzer", val("gUsers")], ["Vorbild", val("gRef")],
    ["Läuft auf", val("gPlatforms")], ["Aussehen", val("gLook")], ["Sprachen", val("gLang")]]);
  if (ai && ai.titel && ai.titel.length > 1) { H("Namensideen"); UL(ai.titel); }
  if (ai) {
    H("Funktionen"); UL(ai.funktionen.map(f => `${f.name}: ${f.beschreibung}`));
    if (ai.bildschirme) { H("Bildschirme & Seiten"); UL(ai.bildschirme.map(b => `${b.name}: ${b.inhalt}`)); }
    if (ai.ablaeufe) { H("Typische Abläufe"); OL(ai.ablaeufe); }
    if (ai.daten) { H("Daten"); UL(ai.daten.map(d => `${d.name}: ${d.felder}`)); }
    if (ai.rollen && ai.rollen.length) { H("Wer darf was"); UL(ai.rollen); }
    if (ai.verbindungen && ai.verbindungen.length) { H("Verbindungen zu anderen Diensten"); UL(ai.verbindungen); }
    if (ai.technik) { H("Empfohlene Technik"); UL(ai.technik); }
  } else {
    const det = answeredIn("ai");
    if (det.length) { H("Details aus den KI-Fragen"); UL(det.map(q => `${q.label}: ${fmt(q)}`)); }
    H("Technik & Daten");
    KV([["Anmeldung", val("gAccounts")], ["Gespeicherte Daten", val("gData")], ["Verbindungen", val("gConnect")], ["Ohne Internet", val("gOffline")], ["Datenschutz", val("gPrivacy")]]);
  }
  H("Umsetzung");
  KV([["Geld verdienen", val("gMoney")], ["Erste Version", val("gTimeline")], ["Laufende Kosten", val("gBudget")], ["Veröffentlichung", val("gLaunch")], ["Deine Erfahrung", val("gSkill")]]);
  OL(ai && ai.erste_schritte ? ai.erste_schritte : genMilestones().map(m => `${m[0]}: ${m[1]}`));
  const notes = visible().filter(q => noteOf(q.id));
  if (val("finalNotes") || notes.length) { H("Deine Notizen"); UL((val("finalNotes") ? [`Zum Schluss: ${val("finalNotes")}`] : []).concat(notes.map(q => `${q.label}: ${noteOf(q.id)}`))); }
  return { title: ai && ai.titel && ai.titel[0] || projTitle(), blocks: B };
}

function genTech() {
  const a = st.a, out = [];
  const app = has(a, "gPlatforms", "iPhone/iPad (iOS)", "Android"), web = has(a, "gPlatforms", "Im Browser"), desk = has(a, "gPlatforms", "Als Programm auf PC/Mac");
  const server = has(a, "gPlatforms", "Im Hintergrund auf einem Server", "In einem Messenger") || has(a, "kind", "Automatisierung", "KI-Assistent / Chatbot");
  const beginner = has(a, "gSkill", "Gar keine", "Ein bisschen");
  if (app) out.push(`App: React Native mit Expo${web ? " (ein Code für iPhone, Android und Browser)" : ""}.`);
  else if (web || !desk) out.push(beginner ? "Oberfläche: eine Web-App mit HTML, CSS und JavaScript bzw. React, die ohne Installation im Browser läuft." : "Oberfläche: React mit TypeScript (z. B. Vite oder Next.js).");
  if (desk) out.push("PC/Mac: Web-App als Desktop-Programm verpacken (z. B. Tauri oder Electron).");
  if (has(a, "gAccounts", "Mit E-Mail und Passwort", "Mit Google oder Apple", "Verschiedene Rollen", "Einfacher PIN oder Code") || (Array.isArray(a.gData) ? a.gData.some(x => x !== "Nichts" && x !== AI) : val("gData") && val("gData") !== "Nichts"))
    out.push(`Daten & Anmeldung: ein gehosteter Dienst wie Supabase (Datenbank, Login, Dateien)${has(a, "gPrivacy", "Server müssen in der EU stehen", "Sehr sensibel") ? " mit Servern in der EU" : ""}.`);
  if (server) out.push("Hintergrund-Aufgaben: serverlose Funktionen oder ein kleiner Server, der zeitgesteuert läuft.");
  if (has(a, "gConnect", "Künstliche Intelligenz") || has(a, "kind", "KI-Assistent / Chatbot")) out.push("KI: die Claude API von Anthropic, der Schlüssel liegt nur auf dem Server.");
  if (has(a, "gConnect", "Bezahlen") || has(a, "kind", "Online-Shop")) out.push("Bezahlen: Stripe oder PayPal, keine Kartendaten selbst speichern.");
  return out;
}
function genMilestones() {
  const a = st.a, m = [];
  m.push(["Grundgerüst", "Projekt aufsetzen, Hauptbildschirm und Navigation, Platzhalter-Daten, läuft auf dem Zielgerät."]);
  m.push(["Kernfunktionen", "Die wichtigsten Funktionen vollständig und benutzbar, mit echten Daten."]);
  if (!has(a, "gAccounts", "Nein, ohne Anmeldung") && val("gAccounts")) m.push(["Konten & Rechte", "Anmeldung, Rollen und wer welche Daten sehen und ändern darf."]);
  if (val("gConnect") && !has(a, "gConnect", "Mit nichts")) m.push(["Verbindungen", `Anbindung an: ${val("gConnect")}.`]);
  m.push(["Aussehen & Komfort", "Design wie gewünscht, verständliche Texte, Fehlermeldungen, leere Zustände, Handy-Ansicht."]);
  m.push(["Testen & Feinschliff", "Alle Abläufe durchspielen, Sonderfälle, Geschwindigkeit, Datenschutz prüfen."]);
  if (val("gLaunch") && !has(a, "gLaunch", "Nur privat / intern")) m.push(["Veröffentlichung", `Bereitstellen auf: ${val("gLaunch")}.`]);
  return m;
}

function buildGenPrompt() {
  const v = visible(), L = [], P = (...x) => L.push(...x), blank = () => L.push("");
  const doc = genConcept(), lvl = LEVELS.find(l => l.n === st.level), ai = st.ai && st.ai.funktionen ? st.ai : null;
  P(`# Bauauftrag: „${doc.title}“ (Arbeitstitel)`, "");
  P(`Dieses Dokument ist der vollständige Bauauftrag für ein Software-Projekt (${kindText()}). Ich (der Auftraggeber) habe es mit einem Fragebogen erstellt; eine KI hat dabei gezielt nach offenen Stellen gefragt. Lies es komplett, bevor du irgendetwas tust.`, "");
  P("**Aufbau:** Teil A – So arbeitest du · Teil B – Idee und Überblick · Teil C – Alle Vorgaben · Teil D – Umsetzung, Abnahme und deine erste Antwort", "");
  P("---", "", "## Teil A – So arbeitest du", "");
  P("Du bist ein komplettes kleines Software-Team in einer Person: Produktplaner, Designer, Entwickler und Tester. Du baust dieses Projekt so, dass es fertig, benutzbar und fehlerfrei ist.", "");
  [
    "Setze jede Vorgabe exakt um. Weiche nur ab, wenn etwas technisch unmöglich ist, und sag das dann ausdrücklich mit einer Alternative.",
    "Erfinde keine Funktionen, die hier nicht stehen. Ausnahme: Dinge, die zwingend nötig sind, damit es vollständig funktioniert. Liste jede solche Ergänzung auf.",
    "Steht bei einem Punkt „KI entscheidet“, triff die beste Entscheidung passend zu Zielgruppe und Zweck und trage sie in die Tabelle „Meine Entscheidungen“ ein (Punkt | Entscheidung | abgeleitet aus).",
    `Gewünschte Genauigkeit: „${lvl.name}“. Was hier nicht genannt ist, entscheidest du selbst, passend zu allen Vorgaben, und trägst es in „Meine Entscheidungen“ ein.`,
    "Rangfolge bei Widersprüchen: 1. Notizen (📝) und meine eigenen Worte, 2. ausgewählte Antworten, 3. deine Entscheidungen.",
    "Ich bin " + ({ "Gar keine": "kein Programmierer. Erkläre jeden Schritt so, dass ich ihn ohne Vorwissen ausführen kann.", "Ein bisschen": "Einsteiger. Erkläre Schritte kurz und verständlich." }[val("gSkill")] || "erfahren genug für normale Fachsprache.")
  ].forEach((r, i) => P(`${i + 1}. ${r}`));
  blank();
  P("---", "", "## Teil B – Idee und Überblick", "");
  if (val("thoughts")) { P("### B0. Meine Idee in meinen eigenen Worten", ""); val("thoughts").split(/\n+/).forEach(l => l.trim() && P(`> ${l.trim()}`)); blank(); }
  if (val("finalNotes")) P(`**Besonders wichtig (Zum Schluss):** „${val("finalNotes")}“`, "");
  P("### B1. Überblick", "");
  conceptMD({ blocks: doc.blocks.filter(b => b.x !== "Deine Ausgangsidee") }, ["Deine Ausgangsidee", "Deine Notizen", "Umsetzung"]).forEach(l => P(l));
  blank();
  P("---", "", "## Teil C – Alle Vorgaben", "", "Alle Antworten nach Bereichen. Der Text nach „–“ erklärt jeweils verbindlich, was gemeint ist.", "");
  S.forEach(s => {
    const qs = v.filter(q => q.sec === s.id && (answered(q) || noteOf(q.id)) && !["thoughts", "finalNotes"].includes(q.id));
    if (!qs.length) return;
    P(`### ${s.name}`, "");
    qs.forEach(q => { const l = answerLines(q); if (l) P(...l); });
    blank();
  });
  if (st.aiGaps && st.aiGaps.length && !st.aiDone) { P("### Noch offen", "", "Diese Punkte waren beim Erstellen noch nicht geklärt. Kläre sie mit mir, bevor du sie baust:", ""); st.aiGaps.forEach(g => P(`- ${g}`)); blank(); }
  P("---", "", "## Teil D – Umsetzung", "", "### D1. Technik", "");
  (ai && ai.technik ? ai.technik : genTech()).forEach(t => P(`- ${t}`));
  P("- Wenn du eine bessere Technik für meine Vorgaben kennst, schlag sie in deiner ersten Antwort mit Begründung vor.", "");
  P("### D2. Meilensteine", "", "Arbeite in diesen Schritten. Nach jedem Schritt muss etwas Lauffähiges da sein, das ich ausprobieren kann.", "");
  genMilestones().forEach((m, i) => P(`${i + 1}. **${m[0]}:** ${m[1]}`));
  blank();
  P("### D3. Abnahme", "", "Fertig ist es erst, wenn:", "");
  [
    "Jede Vorgabe aus Teil C sichtbar umgesetzt ist.",
    "Alle Abläufe von Anfang bis Ende funktionieren, auch bei falschen Eingaben, leeren Listen und ohne Internet (Fehlermeldung statt Absturz).",
    "Es auf allen genannten Geräten gut bedienbar ist, auch auf kleinen Handy-Bildschirmen.",
    "Keine Fehler in Konsole oder Log auftauchen.",
    has(st.a, "gData", "Nichts") || !val("gData") ? "" : "Daten sicher gespeichert werden und jeder nur sieht, was er sehen darf.",
    has(st.a, "gPrivacy", "Normale persönliche Daten", "Sehr sensibel") ? "Die DSGVO eingehalten wird: Datenschutzerklärung, nur nötige Daten, Löschen auf Wunsch möglich." : ""
  ].filter(Boolean).forEach(x => P(`- ${x}`));
  blank();
  P("### D4. Lieferumfang", "", "- Vollständiger, lauffähiger Code", "- Anleitung: Wie starte, teste und veröffentliche ich es?", "- Tabelle „Meine Entscheidungen“", "- Liste aller Ergänzungen, die nicht im Auftrag standen", "");
  P("### D5. Deine erste Antwort", "", "Beginne NICHT sofort mit Code. Antworte zuerst so:", "");
  P("1. **Verständnischeck:** Beschreibe in 5–8 Sätzen, was das Projekt ist, für wen, was man damit macht und was auf keinen Fall passieren darf.",
    "2. **Dein Plan:** Technik, Aufbau, Meilensteine.", "3. **Offene Fragen:** Alles, was unklar oder widersprüchlich ist.", "4. **Namen:** Drei Namensvorschläge.", "5. Dann wartest du auf mein OK und startest mit Meilenstein 1.");
  return L.join("\n");
}

function genLaunchItems() {
  const a = st.a, L = [], add = (k, t, d) => L.push({ k, t, d });
  add("t1", "Mit echten Nutzern testen", "Lass 3–5 Leute aus der Zielgruppe die wichtigsten Abläufe ausprobieren und schau zu, ohne zu helfen.");
  add("t2", "Backups einrichten", "Daten automatisch sichern und einmal testen, ob die Wiederherstellung klappt.");
  if (has(a, "gPrivacy", "Normale persönliche Daten", "Sehr sensibel") || has(a, "gAccounts", "Mit E-Mail und Passwort", "Mit Google oder Apple", "Verschiedene Rollen")) {
    add("d1", "Datenschutzerklärung", "Pflicht, sobald persönliche Daten verarbeitet werden. Nenne alle Dienste, die Daten erhalten.");
    add("d2", "Auftragsverarbeitung (AVV)", "Mit jedem Dienst abschließen, der Daten für dich speichert (z. B. Hosting, Datenbank, E-Mail).");
  }
  if (has(a, "gPrivacy", "Sehr sensibel")) add("d3", "Sensible Daten absichern", "Verschlüsselung, strenge Rechte, Protokoll, wer was angesehen hat. Bei Gesundheitsdaten ggf. Fachberatung.");
  if (has(a, "gLaunch", "Unter einer eigenen Internetadresse")) {
    add("w1", "Domain & Hosting", "Domain registrieren, Hosting mit HTTPS (z. B. Vercel, Netlify, GitHub Pages).");
    add("w2", "Impressum", "In Deutschland Pflicht bei geschäftsmäßigen Websites.");
    add("w3", "Cookie-Hinweis prüfen", "Nur nötig, wenn Tracking, Werbung oder externe Inhalte genutzt werden.");
  }
  if (has(a, "gLaunch", "Apple App Store")) add("a1", "Apple Developer Program", "99 $ pro Jahr, App-Review dauert meist 1–2 Tage; Datenschutz-Angaben und Screenshots nötig.");
  if (has(a, "gLaunch", "Google Play")) add("b1", "Google Play Console", "25 $ einmalig; neue private Konten brauchen einen geschlossenen Test mit 12 Testern über 14 Tage.");
  if (has(a, "gLaunch", "Zum Herunterladen für PC/Mac")) add("p1", "Programm signieren", "Damit Windows und macOS keine Warnungen zeigen (Code-Signing-Zertifikat, auf dem Mac Notarisierung).");
  if (has(a, "gMoney", "Einmal kaufen", "Abo", "Über verkaufte Produkte") || has(a, "kind", "Online-Shop")) {
    add("m1", "Zahlungsanbieter einrichten", "Konto bei Stripe oder PayPal, Testzahlungen durchspielen.");
    add("m2", "AGB & Widerrufsbelehrung", "Pflicht beim Verkauf an Verbraucher in der EU.");
    add("m3", "Steuern klären", "Umsatzsteuer und ggf. Gewerbeanmeldung mit Steuerberater klären.");
  }
  if (has(a, "gMoney", "Werbung")) add("m4", "Werbung & Einwilligung", "Einwilligungsdialog nach DSGVO vor personalisierter Werbung.");
  if (has(a, "gConnect", "Künstliche Intelligenz") || has(a, "kind", "KI-Assistent / Chatbot")) add("k1", "KI-Kosten begrenzen", "Ausgabenlimit beim KI-Anbieter setzen und Nutzung pro Person begrenzen.");
  if (has(a, "gAudience", "Kinder")) add("c1", "Kinder schützen", "Keine personalisierte Werbung, Einwilligung der Eltern, so wenig Daten wie möglich.");
  add("z1", "Erste Nutzer gewinnen", "Freunde, Kunden oder Kollegen gezielt ansprechen und um ehrliches Feedback bitten.");
  return L;
}
