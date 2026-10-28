/* Nordlicht – KI: findet offene Stellen im Bauplan und denkt sich passende Fragen aus.
   In claude.ai läuft das über die Seite selbst (CAPS.sample), auf der Website über die Supabase-Funktion „ai“. */
const AI_MAX_ROUNDS = 20;
const DEPTH = {
  1: "nur die entscheidenden Lücken; insgesamt höchstens etwa 10 KI-Fragen",
  2: "alle wichtigen Punkte; insgesamt etwa 25 KI-Fragen",
  3: "auch Details, Sonderfälle und Feinheiten; insgesamt etwa 50 KI-Fragen",
  4: "jede Kleinigkeit, bis wirklich nichts mehr offen ist; so viele Fragen wie nötig"
};
const aiReady = () => !!CAPS.sample || (typeof sb !== "undefined" && !!sb && signedIn());
const aiWant = () => aiReady() && !st.aiDone && (st.aiRounds || 0) < AI_MAX_ROUNDS;

async function aiCall(task, prompt) {
  if (CAPS.sample) return CAPS.sample.json(prompt, { modelTier: task === "elaborate" ? "complex" : "default", cache: false });
  const { data, error } = await sb.functions.invoke("ai", { body: { task, prompt } });
  if (error) {
    let code = "";
    try { code = (await error.context.json()).error; } catch (e) {}
    throw Object.assign(new Error(code || error.message), { code });
  }
  return data.json;
}
function aiErrText(e, fallback) {
  const c = e && e.code;
  return c === "limit" ? "Du hast das Tageslimit für KI-Anfragen erreicht. Morgen geht es weiter."
    : c === "rate_limited" ? "Gerade zu viele Anfragen. Versuch es in einer Minute noch einmal."
    : c === "not_granted" ? "Die Nutzung von Claude wurde nicht erlaubt."
    : c === "auth" ? "Bitte melde dich erneut an."
    : c === "config" ? "Die KI ist auf dem Server noch nicht eingerichtet."
    : fallback;
}

/* Die Fragen der KI als normale Fragen (Bereich „ai“) */
let _aqSrc = null, _aqOut = [];
function aiQs() {
  if (st.aq === _aqSrc) return _aqOut;
  _aqSrc = st.aq;
  _aqOut = (st.aq || []).map(x => ({ id: x.id, label: x.label, title: x.title, h: x.h, sec: "ai", l: 1, t: "m", aiq: true, topic: x.topic, opts: x.opts }));
  return _aqOut;
}

/* Der bisherige Bauplan als Text für die KI */
function specText() {
  const L = [];
  if (val("thoughts")) L.push("GEDANKEN DES AUFTRAGGEBERS:", val("thoughts"), "");
  S.forEach(s => {
    const qs = visible().filter(q => q.sec === s.id && !q.quiz && q.id !== "thoughts" && (answered(q) || noteOf(q.id)));
    if (!qs.length) return;
    L.push(`[${s.name}]`);
    qs.forEach(q => L.push(`- ${q.title} → ${answered(q) ? fmt(q) : "(keine Auswahl)"}${noteOf(q.id) ? ` (Notiz: ${noteOf(q.id)})` : ""}`));
    L.push("");
  });
  const open = aiQs().filter(q => !answered(q));
  if (open.length) L.push("SCHON GESTELLT, NOCH OFFEN:", ...open.map(q => `- ${q.title}`), "");
  return L.join("\n");
}

async function aiRound() {
  if (aiRound.busy) return;
  aiRound.busy = true; st.aiErr2 = ""; st.view = "thinking"; render(); window.scrollTo(0, 0);
  const tok = aiRound.tok = (aiRound.tok || 0) + 1;
  const asked = aiQs().length;
  const prompt = `Du hilfst Laien, ein Projekt so genau zu planen, dass eine KI es danach ohne Rückfragen exakt bauen kann.

Projektart: ${val("kind") || "unbekannt"}
Gewünschte Genauigkeit: ${DEPTH[st.level]}
Bisher gestellte KI-Fragen: ${asked}

BISHERIGER BAUPLAN:
${specText()}

AUFGABE: Finde die Stellen, die für den Bau noch offen, unklar oder widersprüchlich sind, und stelle dazu die nächsten 4–7 Multiple-Choice-Fragen.
Regeln:
- Frag nur, was für genau dieses Projekt gebraucht wird. Nichts doppelt und nichts, was oben schon beantwortet ist, auch nicht in anderen Worten.
- Vom Groben ins Feine: erst Funktionen und Abläufe, dann Details.
- Laiensprache in Du-Form, keine Fachbegriffe (oder kurz in Klammern erklärt).
- Jede Frage hat 3–8 konkrete, auf das Projekt zugeschnittene Antworten: passendes Emoji, Antworttext höchstens 6 Wörter, dazu ein kurzer Erklärsatz. Mehrfachauswahl ist immer erlaubt. Markiere Antworten wie „Keine“ oder „Gar nicht“ als exklusiv. Keine Antwort „Weiß nicht“, die gibt es automatisch.
- "kurz" ist ein Stichwort aus 1–3 Wörtern für die Übersicht, "thema" der Bereich (z. B. „Bezahlung“).
- "abdeckung": wie vollständig der Bauplan für die gewünschte Genauigkeit schon ist (0–100).
- "fertig": true, wenn bei dieser Genauigkeit keine wichtigen Lücken mehr bleiben; dann bleibt "fragen" leer.
- "luecken": die noch offenen Punkte in je einem kurzen Satz.
Antworte NUR mit JSON in dieser Form:
{"abdeckung": 0, "fertig": false, "luecken": [""], "fragen": [{"thema": "", "kurz": "", "frage": "", "hilfe": "", "optionen": [{"emoji": "", "text": "", "info": "", "exklusiv": false}]}]}`;
  try {
    const out = await aiCall("questions", prompt) || {};
    if (tok !== aiRound.tok) return; /* inzwischen abgebrochen */
    const r = (st.aiRounds || 0) + 1, seen = new Set(aiQs().map(q => q.title.toLowerCase()));
    const qs = (Array.isArray(out.fragen) ? out.fragen : []).filter(f => f && f.frage && Array.isArray(f.optionen) && f.optionen.length >= 2 && !seen.has(String(f.frage).toLowerCase()))
      .slice(0, 8).map((f, i) => ({
        id: `k${r}_${i + 1}`, label: String(f.kurz || f.thema || "Detail").slice(0, 40), title: String(f.frage), h: f.hilfe ? String(f.hilfe) : "", topic: String(f.thema || ""),
        opts: f.optionen.slice(0, 10).map(o => ({ i: String(o.emoji || "•").slice(0, 8), v: String(o.text || "").slice(0, 80), d: String(o.info || ""), x: !!o.exklusiv })).filter(o => o.v)
      }));
    st.aiRounds = r; st.aiLevel = st.level;
    st.aiCov = Math.max(0, Math.min(100, +out.abdeckung || 0));
    st.aiGaps = Array.isArray(out.luecken) ? out.luecken.filter(Boolean).map(String).slice(0, 12) : [];
    if (out.fertig || !qs.length || r >= AI_MAX_ROUNDS) st.aiDone = true;
    st.aq = (st.aq || []).concat(qs);
    aiRound.busy = false;
    if (qs.length) { st.view = "quiz"; st.cur = qs[0].id; render(); window.scrollTo(0, 0); }
    else aiFinish();
  } catch (e) {
    if (tok !== aiRound.tok) return;
    aiRound.busy = false;
    st.aiErr2 = aiErrText(e, "Die KI konnte gerade keine Fragen erstellen. Versuch es noch einmal oder mach ohne KI weiter.");
    render();
  }
}
/* Nach der letzten KI-Runde: Schlussfrage oder Auswertung */
function aiFinish() {
  const f = qOf("finalNotes");
  if (f && !answered(f)) { st.view = "quiz"; st.cur = f.id; }
  else { st.view = "result"; st.tab = "sum"; }
  render(); window.scrollTo(0, 0);
}

function viewThinking() {
  const busy = aiRound.busy;
  return `<section class="analysis thinking">
    <p class="eyebrow">Feinschliff durch die KI${st.aiRounds ? ` · Runde ${st.aiRounds + (busy ? 1 : 0)}` : ""}</p>
    <h1>${busy ? "Die KI sucht nach offenen Stellen …" : "Das hat nicht geklappt"}</h1>
    ${busy ? `<div class="spin" aria-hidden="true"></div><p class="lead">Sie liest deinen ganzen Bauplan und überlegt, welche Fragen noch fehlen, damit beim Bauen nichts geraten werden muss. Das dauert meist 10–40 Sekunden.</p>` : ""}
    ${st.aiCov ? `<p class="fine">Bisherige Abdeckung: <b>${st.aiCov} %</b></p>` : ""}
    ${st.aiErr2 ? `<p class="alert warn">${esc(st.aiErr2)}</p>` : ""}
    <div class="cta">
      ${busy ? "" : `<button class="btn primary" data-act="airetry">Noch einmal versuchen</button>`}
      <button class="btn${busy ? "" : " ghost"}" data-act="aistop">${busy ? "Abbrechen, zur Auswertung" : "Ohne KI weiter"}</button>
    </div>
  </section>`;
}

/* Kasten auf der Auswertung: Stand der Lücken */
function aiBox() {
  if (!aiReady()) {
    if (typeof sb === "undefined" || !sb) return "";
    return `<div class="cloud aibox"><div><b>🤖 Lücken mit KI schließen</b><small>Mit einem kostenlosen Konto liest die KI deinen Bauplan, findet offene Stellen und stellt dir genau die Fragen, die noch fehlen.</small></div>
      <button class="btn sm primary" data-act="tostart">Konto erstellen oder anmelden</button></div>`;
  }
  const cov = st.aiCov ? `<span class="cov"><i style="width:${st.aiCov}%"></i></span><small>Abdeckung laut KI: ${st.aiCov} %</small>` : "";
  if (st.aiDone) return `<div class="cloud aibox"><div><b>✓ Die KI findet keine wichtigen Lücken mehr</b>${cov}<small>Für die Stufe „${LEVELS[st.level - 1].name}“ ist alles geklärt.${st.level < 4 ? " Du kannst trotzdem noch genauer werden." : ""}</small></div>
    ${st.level < 4 ? `<button class="btn sm" data-act="deeper">Noch genauer →</button>` : ""}</div>`;
  return `<div class="cloud aibox"><div><b>🤖 Es gibt noch offene Stellen</b>${cov}${st.aiGaps && st.aiGaps.length ? `<small>${esc(st.aiGaps.slice(0, 4).join(" · "))}</small>` : "<small>Die KI stellt dir passende Zusatzfragen, bis nichts mehr offen ist.</small>"}</div>
    <button class="btn sm primary" data-act="aimore">Lücken schließen →</button></div>`;
}

document.addEventListener("click", e => {
  const b = e.target.closest("[data-act]"); if (!b) return;
  const act = b.dataset.act;
  if (act === "airetry" || act === "aimore") {
    const open = aiQs().find(q => !answered(q));
    if (open) { st.view = "quiz"; st.cur = open.id; render(); window.scrollTo(0, 0); }
    else aiRound();
  }
  if (act === "aistop") { aiRound.busy = false; aiRound.tok = (aiRound.tok || 0) + 1; st.aiDone = true; aiFinish(); }
});

/* Generisches Konzept von Claude ausarbeiten lassen */
async function elaborateGen() {
  elaborate.busy = true; st.aiErr = ""; render();
  const schema = `{"titel":["3 Namensvorschläge"],"pitch":"3-4 Sätze: was es ist und warum man es will","funktionen":[{"name":"","beschreibung":"was genau passiert, konkret"}],"bildschirme":[{"name":"","inhalt":"was man dort sieht und tun kann"}],"ablaeufe":["5-8 typische Abläufe Schritt für Schritt"],"daten":[{"name":"z. B. Kunde","felder":"welche Angaben gespeichert werden"}],"rollen":["wer darf was"],"verbindungen":["andere Dienste und wofür"],"technik":["empfohlene Technik mit kurzer Begründung"],"erste_schritte":["6-8 Umsetzungsschritte"]}`;
  const input = `Du bist ein erfahrener Produktplaner und Software-Architekt. Arbeite aus der folgenden Spezifikation ein konkretes Konzept für das Projekt aus. Bleib exakt bei den Vorgaben, triff bei „KI entscheidet“ passende Entscheidungen und erfinde keine Funktionen, die nicht dazu passen. Alles auf Deutsch, verständlich für Laien.

Antworte NUR mit JSON exakt in dieser Form (bei Listen 5-10 Einträge, passend zum Umfang):
${schema}

SPEZIFIKATION:
${buildGenPrompt()}`;
  try {
    const out = await aiCall("elaborate", input);
    if (out && typeof out === "object" && Array.isArray(out.funktionen)) { st.ai = out; st.aiSig = JSON.stringify(st.a); }
    else st.aiErr = "Die Ausarbeitung kam unvollständig zurück. Versuch es noch einmal.";
  } catch (e) { st.aiErr = aiErrText(e, "Die Ausarbeitung hat nicht geklappt. Du kannst es noch einmal versuchen."); }
  elaborate.busy = false; render();
}
