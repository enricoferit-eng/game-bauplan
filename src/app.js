/* Game-Bauplan – App */
const KEY = "gamebauplan.v1";
const LEVELS = [
  { n: 1, name: "Schnell", tag: "Nur das Wichtigste", desc: "Die großen Entscheidungen. Den Rest übernimmt die KI." },
  { n: 2, name: "Standard", tag: "Gute Balance", desc: "Alle Bereiche mit den wichtigsten Details." },
  { n: 3, name: "Detailliert", tag: "Für Planer", desc: "Mehr Feingefühl: Gegner, Effekte, Abwechslung und mehr." },
  { n: 4, name: "Alles", tag: "Jedes kleinste Feature", desc: "Jedes kleinste Detail, ganz ohne Fachwissen." }
];
const blank = level => ({ view: "start", level: level || 2, off: {}, a: {}, notes: {}, noteOpen: {}, sugg: {}, fromThoughts: {}, skipKnown: false, cur: null, tab: "prompt", done: {}, resetArm: false, pid: null, title: "" });
let st = blank();
try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.a) st = Object.assign(st, s, { resetArm: false, off: {} }); st.notes = st.notes || {}; st.noteOpen = st.noteOpen || {}; st.sugg = st.sugg || {}; st.fromThoughts = st.fromThoughts || {}; } catch (e) {}
function save() { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} }

const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const hue = s => { let h = 0; for (const c of s) h = (h * 31 + c.codePointAt(0)) % 360; return h; };
const secOf = id => S.find(s => s.id === id);
const qOf = id => Q.find(q => q.id === id);

function visible() {
  return Q.filter(q => q.l <= st.level && (!q.if || q.if(st.a)));
}
const answered = q => st.a[q.id] !== undefined && !(Array.isArray(st.a[q.id]) && !st.a[q.id].length);

/* ---------- Werte ---------- */
function val(id) {
  const x = st.a[id];
  if (x == null || x === AI || x === "") return null;
  if (Array.isArray(x)) { const y = x.filter(v => v !== AI); return y.length ? y.join(", ") : null; }
  return x;
}
function optsFor(q) {
  if (q.dyn) {
    const r = quizRank(), top = r[0].score || 1;
    return r.slice(0, 6).map((x, i) => ({ i: x.s[1], v: x.s[2], d: `${Math.round(x.score / top * 100)} % Übereinstimmung. ${x.s[3]}`, best: i === 0 }));
  }
  if (q.id === "core") {
    const r = quizRank();
    if (r[0].score > 0) { const best = r[0].s[2]; const top = r.filter(x => x.score > 0).slice(0, 3).map(x => x.s[2]);
      return q.opts.map(o => o.v === best ? Object.assign({}, o, { best: 1 }) : o)
        .sort((x, y) => (x.v === QUIZ_OPT) - (y.v === QUIZ_OPT) || (top.includes(x.v) ? top.indexOf(x.v) : 99) - (top.includes(y.v) ? top.indexOf(y.v) : 99)); }
  }
  return q.opts;
}
function descOf(q, v) {
  if (q.id === "coreQuiz") { const s = SYS.find(s => s[2] === v); return s ? s[3] : ""; }
  const o = q.opts.find(o => o.v === v);
  return o ? o.d : "";
}
function quizRank() {
  const sc = {}; SYS.forEach(s => sc[s[0]] = 0);
  Q.filter(q => q.quiz || q.id === "ideaVerb" || q.id === "ideaGoal" || q.id === "ideaRef").forEach(q => {
    const x = st.a[q.id], vs = Array.isArray(x) ? x : [x];
    vs.forEach(v => { const o = q.opts.find(o => o.v === v); if (o && o.sc) for (const k in o.sc) sc[k] += o.sc[k] * (q.quiz ? 1 : 2); });
  });
  return SYS.map(s => ({ s, score: sc[s[0]] })).sort((a, b) => b.score - a.score);
}
function fmt(q) {
  const x = st.a[q.id];
  if (x === undefined) return "–";
  if (q.t === "t" && (x === AI || x === "")) return "–";
  if (x === AI || x === "") return "KI entscheidet";
  if (Array.isArray(x)) return x.includes(AI) ? "KI entscheidet" : x.join(", ");
  return x;
}

/* ---------- Rendering ---------- */
function render() {
  save();
  renderTop();
  const app = $("#app");
  if (st.view === "quiz") app.innerHTML = viewQuiz();
  else if (st.view === "analysis") app.innerHTML = viewAnalysis();
  else if (st.view === "result") app.innerHTML = viewResult();
  else app.innerHTML = viewStart();
  if (st.view === "quiz") { const t = $("#txt"); if (t) t.focus(); }
}
function renderTop() {
  const v = visible(), done = v.filter(answered).length, pct = v.length ? Math.round(done / v.length * 100) : 0;
  $("#prog").hidden = st.view === "start";
  $("#progFill").style.width = pct + "%";
  $("#progTxt").textContent = `${done} / ${v.length} Fragen`;
  $("#btnResult").hidden = st.view !== "quiz" || done === 0;
  $("#btnStart").hidden = st.view === "start";
  const nb = $("#btnNew"); nb.hidden = !Object.keys(st.a).length; nb.textContent = st.resetArm ? "Wirklich verwerfen?" : "+ Neues Projekt";
}
/* Projektname: selbst vergeben oder aus den Antworten abgeleitet */
function projTitle() {
  if (st.title) return st.title;
  const first = id => { const v = val(id); return v && (Array.isArray(st.a[id]) ? st.a[id].find(x => x !== AI) : v); };
  const core = first(st.a.core === QUIZ_OPT ? "coreQuiz" : "core"), set = first("setting");
  return core && set ? `${core} · ${set}` : core || set || "Neues Spiel";
}
function startQuiz() {
  st.view = "quiz";
  const v = navList(); const f = v.find(x => !answered(x));
  st.cur = f ? f.id : (v[0] && v[0].id);
  if (!f && v.length) st.view = "result";
  render(); window.scrollTo(0, 0);
}
/* Neues Projekt: mit Konto bleibt das alte gespeichert, ohne Konto wird es ersetzt */
function newProject() {
  if (typeof projFlush === "function") projFlush();
  st = blank(st.level);
  if (typeof cloudForget === "function") cloudForget();
  startQuiz();
}

function viewStart() {
  const started = Object.keys(st.a).length > 0;
  const lv = LEVELS.map(L => {
    const n = Q.filter(q => q.l <= L.n && !q.quiz && !q.dyn && !q.if).length;
    return `<button class="lvl${st.level === L.n ? " on" : ""}" data-act="level" data-n="${L.n}" aria-pressed="${st.level === L.n}">
      <span class="lvl-bars">${[1, 2, 3, 4].map(i => `<i class="${i <= L.n ? "f" : ""}"></i>`).join("")}</span>
      <b>${L.name}</b><span class="lvl-tag">${L.tag}</span><small>${L.desc}</small><span class="lvl-n">ab ${n} Fragen</span></button>`;
  }).join("");
  return `<section class="start">
    <div class="hero">
      <p class="eyebrow">Game-Bauplan</p>
      <h1>Von der Idee zum <span class="hl">exakten Bauplan</span> für die KI.</h1>
      <p class="lead">Du klickst dich durch Multiple-Choice-Fragen mit Beispielbildern. Am Ende bekommst du einen Prompt, mit dem eine KI genau dein Spiel baut, und eine Zusammenfassung mit Launch-Checkliste für dich.</p>
    </div>
    ${typeof accountBox === "function" ? accountBox() : ""}
    <div class="step"><h2><span class="stepn">1</span> Wie detailliert willst du planen?</h2>
      <div class="levels">${lv}</div>
      <p class="fine">Die Zahl wächst je nach Antworten: Wählst du z. B. Multiplayer oder Werbung, kommen passende Folgefragen dazu.</p></div>
    <div class="step"><h2><span class="stepn">2</span> Diese ${S.length} Bereiche werden immer abgedeckt</h2>
      <div class="secpick">${S.map(s => `<span class="secchip on"><span>${s.icon}</span>${esc(s.name)}</span>`).join("")}</div>
      <p class="fine">Die Detailstufe ändert nur, wie tief jeder Bereich abgefragt wird. Alle Fragen sind Multiple Choice.</p></div>
    <div class="cta">
      <button class="btn primary big" data-act="go">${started ? "Weitermachen" : "Los geht's"} →</button>
      ${started ? `<button class="btn" data-act="toresult">Zur Auswertung</button>
      <button class="btn ghost${signedIn() ? "" : " danger"}" data-act="reset">${st.resetArm ? "Wirklich verwerfen?" : "+ Neues Projekt"}</button>` : ""}
    </div>
    <p class="fine">${signedIn() ? "Deine Projekte werden automatisch in deinem Konto gespeichert." : "Ohne Konto werden deine Antworten nur in diesem Browser gespeichert."}</p>
  </section>`;
}

function viewQuiz() {
  const v = navList();
  let q = v.find(x => x.id === st.cur);
  if (!q) { q = v.find(x => !answered(x)) || v[0]; st.cur = q && q.id; }
  if (!q) return `<p>Keine Fragen ausgewählt.</p>`;
  const idx = v.indexOf(q), sec = secOf(q.sec), secIdx = S.indexOf(sec);
  const inSec = v.filter(x => x.sec === q.sec), posInSec = inSec.indexOf(q) + 1;
  const nav = S.map(s => {
    const qs = v.filter(x => x.sec === s.id); if (!qs.length) return "";
    const d = qs.filter(answered).length;
    return `<button class="navi${s.id === q.sec ? " cur" : ""}${d === qs.length ? " done" : ""}" data-act="jump" data-s="${s.id}">
      <span class="navi-i">${s.icon}</span><span class="navi-n">${esc(s.name)}</span><span class="navi-c">${d}/${qs.length}</span></button>`;
  }).join("");
  const cur = st.a[q.id];
  let body = "";
  if (q.t === "t") {
    const tv = cur && cur !== AI ? cur : "";
    body = q.area ? `<textarea id="txt" class="txt${q.id === "thoughts" ? " big" : ""}" rows="${q.id === "thoughts" ? 9 : 4}" placeholder="${esc(q.ph || "")}" data-act="text">${esc(tv)}</textarea>${q.id === "thoughts" ? starterChips() : ""}`
      : `<input id="txt" class="txt" type="text" maxlength="160" placeholder="${esc(q.ph || "")}" value="${esc(tv)}" data-act="text">`;
  } else {
    const os = optsFor(q).slice();
    if (!q.noAi) os.push({ i: "🤖", v: AI, label: "Weiß nicht – KI entscheidet", d: "Die KI wählt passend zum Rest deines Konzepts.", ai: 1 });
    const many = os.length > 9;
    body = `<div class="opts${q.wide ? " wide" : ""}${many ? " many" : ""}" role="${q.t === "m" ? "group" : "radiogroup"}">${os.map((o, i) => {
      const sel = Array.isArray(cur) ? cur.includes(o.v) : cur === o.v;
      return `<button class="opt${sel ? " on" : ""}${o.ai ? " ai" : ""}${o.best ? " best" : ""}" data-act="pick" data-i="${i}" aria-pressed="${sel}">
        <span class="pic" style="--h:${hue(q.id + o.v)}">${pic(o.i)}</span>
        <span class="otx"><b>${esc(o.label || o.v)}</b>${o.d ? `<small>${esc(o.d)}</small>` : ""}${st.sugg && st.sugg[q.id] && st.sugg[q.id].includes(o.v) ? `<em class="fromth">💭 aus deinen Gedanken</em>` : ""}</span>
        ${i < 9 ? `<kbd>${i + 1}</kbd>` : ""}${q.t === "m" ? `<span class="tick" aria-hidden="true"></span>` : ""}${o.best ? `<span class="badge">${q.id === "core" ? "Passt zu deiner Idee" : "Beste Wahl"}</span>` : ""}</button>`;
    }).join("")}</div>`;
  }
  const canNext = q.t === "t" || answered(q) || !!noteOf(q.id);
  const hint = q.h || (q.t === "m" ? "Wähle so viele, wie du willst." : "");
  return `<div class="layout">
    <nav class="secnav" aria-label="Bereiche">${nav}</nav>
    <div class="qcol">${ideaPanel()}<section class="qcard" data-sec="${q.sec}">
      <div class="qmeta"><span class="seclabel">${sec.icon} Bereich ${secIdx + 1}: ${esc(sec.name)}</span>
        ${q.quiz ? `<span class="pill">Quiz</span>` : ""}${q.t === "m" ? `<span class="pill soft">Mehrfachauswahl</span>` : ""}
        <span class="qcount">${posInSec} / ${inSec.length}</span></div>
      <h2 class="qtitle">${esc(q.title)}</h2>
      ${hint ? `<p class="hint">${esc(hint)}</p>` : ""}
      ${body}
      ${q.t === "t" ? "" : noteBox(q)}
      <div class="qnav">
        <button class="btn ghost" data-act="back">← Zurück</button>
        <span class="sp"></span>
        ${q.noAi || q.t === "t" ? "" : `<button class="btn ghost" data-act="skip">Überspringen</button>`}
        <button class="btn primary" data-act="next" ${canNext ? "" : "disabled"}>${idx === v.length - 1 ? "Zur Auswertung" : "Weiter"} →</button>
      </div>
      <p class="fine kb">Tastatur: Ziffern wählen, Enter geht weiter, ← zurück.</p>
    </section></div></div>`;
}

function pic(i) {
  if (!i) return "";
  if (i.startsWith("<svg")) return i;
  if (i.startsWith("pal:")) return `<span class="pal">${i.slice(4).split(",").map(c => `<i style="background:${c}"></i>`).join("")}</span>`;
  return `<span class="emo">${i}</span>`;
}

/* ---------- Aktionen ---------- */
function go(dir) {
  clearTimeout(pick.t);
  if (dir > 0 && st.cur === "thoughts" && val("thoughts")) {
    st.sugg = analyzeThoughts(val("thoughts")); st.view = "analysis"; window.scrollTo(0, 0); return render();
  }
  const v = navList(), i = v.findIndex(x => x.id === st.cur);
  if (dir > 0) {
    const n = v[i + 1];
    if (!n) { st.view = "result"; st.tab = "sum"; window.scrollTo(0, 0); return render(); }
    st.cur = n.id;
  } else {
    if (i <= 0) { st.view = "start"; return render(); }
    st.cur = v[i - 1].id;
  }
  render();
  const c = $(".qcard"); if (c && c.getBoundingClientRect().top < 0) c.scrollIntoView({ block: "start" });
}
function pick(i) {
  const q = qOf(st.cur);
  const os = optsFor(q).slice(); if (!q.noAi) os.push({ v: AI, ai: 1 });
  const o = os[i]; if (!o) return;
  if (q.t === "m") {
    const was = st.a[q.id];
    let cur = Array.isArray(was) ? was.slice() : was !== undefined ? [was] : [];
    if (cur.includes(o.v)) cur = cur.filter(x => x !== o.v);
    else if (o.ai || o.x) cur = [o.v];
    else {
      cur = cur.filter(x => x !== AI && !(q.opts.find(p => p.v === x) || {}).x);
      cur.push(o.v);
    }
    if (q.one) { if (cur.length === 1) st.a[q.id] = cur[0]; else if (cur.length) st.a[q.id] = cur; else delete st.a[q.id]; }
    else st.a[q.id] = cur;
    render();
  }
}
document.addEventListener("click", e => {
  const b = e.target.closest("[data-act]"); if (!b) return;
  const act = b.dataset.act;
  if (act !== "reset" && act !== "newproj") st.resetArm = false;
  switch (act) {
    case "level": st.level = +b.dataset.n; render(); break;
    case "togsec": st.off[b.dataset.s] = !st.off[b.dataset.s]; render(); break;
    case "allsec": st.off = {}; render(); break;
    case "go": startQuiz(); break;
    case "toresult": st.view = "result"; render(); window.scrollTo(0, 0); break;
    case "reset": case "newproj":
      if (!signedIn() && Object.keys(st.a).length && !st.resetArm) { st.resetArm = true; render(); break; }
      newProject(); break;
    case "tostart": st.view = "start"; render(); break;
    case "pick": pick(+b.dataset.i); break;
    case "next": {
      const q = qOf(st.cur);
      if (q.t === "t") { const t = $("#txt"); st.a[q.id] = t && t.value.trim() ? t.value.trim() : AI; }
      else if (!answered(q)) st.a[q.id] = AI;
      go(1); break;
    }
    case "skip": st.a[st.cur] = AI; go(1); break;
    case "back": go(-1); break;
    case "jump": {
      const v = navList().filter(x => x.sec === b.dataset.s);
      st.cur = (v.find(x => !answered(x)) || v[0]).id; render(); break;
    }
    case "edit": st.view = "quiz"; st.cur = b.dataset.q; render(); window.scrollTo(0, 0); break;
    case "tab": st.tab = b.dataset.t; render(); break;
    case "deeper": {
      st.level = Math.min(4, st.level + 1); st.view = "quiz";
      const f = navList().find(x => !answered(x)); st.cur = f && f.id;
      if (!f) st.view = "result";
      render(); window.scrollTo(0, 0); break;
    }
    case "copy": copy(b, b.dataset.w === "sum" ? buildSummaryText() : buildPrompt()); break;
    case "pdf": savePDF(b); break;
    case "ppdf": savePromptPDF(b); break;
    case "elaborate": elaborate(b); break;
    case "check": st.done[b.dataset.k] = !st.done[b.dataset.k]; render(); break;
  }
});
document.addEventListener("input", e => {
  if (e.target.id === "note") {
    const t = e.target.value; if (t.trim()) st.notes[st.cur] = t; else delete st.notes[st.cur]; save();
    const n = document.querySelector('[data-act="next"]'); if (n) n.disabled = !(answered(qOf(st.cur)) || t.trim()); return;
  }
  if (e.target.id === "txt") { const q = qOf(st.cur); st.a[q.id] = e.target.value.trim() || AI; save(); renderTop(); }
});
document.addEventListener("toggle", e => {
  const d = e.target; if (!d.matches || !d.matches("details.note")) return;
  st.noteOpen[d.dataset.q] = d.open; save();
  if (d.open) { const t = d.querySelector("textarea"); if (t && !t.value) t.focus(); }
}, true);
document.addEventListener("keydown", e => {
  if (st.view !== "quiz") return;
  const inText = e.target.matches("input, textarea");
  if (e.key === "Enter" && !(inText && e.target.tagName === "TEXTAREA" && !e.metaKey && !e.ctrlKey)) {
    const n = document.querySelector('[data-act="next"]'); if (n && !n.disabled) { e.preventDefault(); n.click(); } return;
  }
  if (inText) return;
  if (/^[1-9]$/.test(e.key)) { const o = document.querySelector(`.opt[data-i="${+e.key - 1}"]`); if (o) { e.preventDefault(); o.click(); } }
  else if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
});
function copy(btn, text) {
  const done = ok => { const o = btn.textContent; btn.textContent = ok ? "Kopiert ✓" : "Text markiert – mit Strg/Cmd+C kopieren"; setTimeout(() => btn.textContent = o, 2200); };
  const fallback = () => { const pre = btn.closest(".panel").querySelector("pre, .sumtext"); if (pre) { const r = document.createRange(); r.selectNodeContents(pre); const s = getSelection(); s.removeAllRanges(); s.addRange(r); } done(false); };
  try { navigator.clipboard.writeText(text).then(() => done(true), fallback); } catch (e) { fallback(); }
}

/* ---------- Analyse ---------- */
function conflicts() {
  const a = st.a, out = [];
  const W = t => out.push({ k: "warn", t }), I = t => out.push({ k: "info", t });
  if (kids(a) && has(a, "comms", "Text-Chat mit Filter", "Sprach-Chat")) W("Kinder-Zielgruppe mit freiem Chat: In der Kinder-Kategorie der Stores ist das kaum zulässig. Besser nur Emotes oder Schnellnachrichten.");
  if (kids(a) && has(a, "lootbox", "Ja, mit Wahrscheinlichkeiten")) W("Zufallskäufe in einem Kinderspiel: rechtlich heikel (z. B. in Belgien verboten) und in der Kinder-Kategorie problematisch.");
  if (kids(a) && has(a, "adTypes", "Zwischen Leveln (Interstitial)", "Banner")) W("Werbung im Kinderspiel: Nur kindgerechte, nicht personalisierte Werbung ist erlaubt. Prüfe die Familien-Richtlinien von Apple und Google.");
  if (kids(a) && has(a, "account", "Login Pflicht")) W("Login-Pflicht für Kinder unter 16 braucht in der EU die Einwilligung der Eltern (DSGVO).");
  if (has(a, "internet", "Komplett offline") && online(a)) W("„Komplett offline“ passt nicht zu Online-Multiplayer.");
  if (has(a, "internet", "Komplett offline") && has(a, "leaderboard", "Weltweit", "Freunde", "Wöchentlich zurückgesetzt")) W("Online-Ranglisten brauchen eine Internetverbindung, das Spiel soll aber komplett offline sein.");
  if (appStores(a) && !mobileApp(a)) W("Du willst in den App Store oder Google Play, hast aber iOS/Android nicht als Plattform gewählt.");
  if (has(a, "launchWhere", "Steam") && !has(a, "platforms", "PC/Mac")) W("Steam ist eine PC-Plattform, PC/Mac fehlt bei deinen Plattformen.");
  if (has(a, "monet", "Einmalkauf (Premium)") && has(a, "adTypes", "Banner")) I("Kaufspiele mit Werbung werden oft schlecht bewertet.");
  if (has(a, "reading", "Nein, nur Symbole") && has(a, "storyAmount", "Story im Mittelpunkt") && !has(a, "voice", "Volle Sprachausgabe", "Nur Erzähler")) W("Viel Story, aber die Spieler können nicht lesen: Die Geschichte muss über Bilder oder Sprachausgabe erzählt werden.");
  if (has(a, "taboo", "Gewalt gegen Menschen", "Blut") && coreIs("shoot", "act")(a)) I("Kampf oder Shooter ohne Gewalt bzw. Blut: Die KI sollte gewaltfreie Varianten nutzen (z. B. Wasserpistolen, Gegner verpuffen).");
  if (has(a, "taboo", "Werbung") && ads(a)) W("Werbung ist als Tabu markiert, das Geschäftsmodell enthält aber Werbung.");
  if (has(a, "taboo", "Echtgeld-Käufe") && iap(a)) W("Echtgeld-Käufe sind als Tabu markiert, das Geschäftsmodell enthält aber In-App-Käufe.");
  if (has(a, "taboo", "Kontakt mit Fremden") && has(a, "matchmaking", "Mit Fremden", "Beides")) W("Kein Kontakt mit Fremden, aber zufällige Mitspieler oder offene Lobbys sind gewählt.");
  if (has(a, "scope", "Großes Spiel") && has(a, "timeline", "Ein Wochenende", "Ein Monat")) W("Ein großes Spiel ist in diesem Zeitrahmen unrealistisch. Plane erst einen Prototyp.");
  if (has(a, "session", "1–3 Minuten") && has(a, "storyAmount", "Story im Mittelpunkt")) I("Sehr kurze Runden und eine zentrale Story: Die Geschichte muss in kleinen Häppchen erzählt werden.");
  if (has(a, "save", "Gar nicht") && has(a, "progress", "Neue Level freischalten", "Erfahrung & Level-Ups", "Basis oder Laden wächst")) W("Fortschritt ohne Speichern geht beim Schließen verloren.");
  if (has(a, "orientation", "Hochformat") && has(a, "inputTouch", "Virtueller Joystick + Buttons") && has(a, "actions", "Viele")) I("Viele Aktionen mit Joystick im Hochformat werden schnell eng auf dem Bildschirm.");
  return out;
}

function prof() {
  const g = id => val(id);
  const core = g(st.a.core === QUIZ_OPT ? "coreQuiz" : "core");
  const mix = g("coreMix") && g("coreMix") !== "Nein, nur eins" && g("coreMix") !== core ? g("coreMix") : null;
  return [
    ["Kernsystem", [core, mix].filter(Boolean).join(" + ")],
    ["Zielgruppe", [g("age"), g("skill")].filter(Boolean).join(", ")],
    ["Plattformen", [g("platforms"), g("orientation")].filter(Boolean).join(" · ")],
    ["Look", [g("dimension"), g("artStyle"), g("palette")].filter(Boolean).join(", ")],
    ["Perspektive", g("perspective")],
    ["Setting", g("setting")],
    ["Gefühl", [g("feeling"), g("pace")].filter(Boolean).join(", ")],
    ["Rundendauer", g("session")],
    ["Multiplayer", g("mp")],
    ["Geschäftsmodell", g("monet")]
  ].filter(x => x[1] && x[1] !== "null");
}

/* ---------- KI-Prompt ---------- */
function noteBox(q) {
  const n = st.notes[q.id] || "", open = !!(n || st.noteOpen[q.id]);
  return `<details class="note" data-q="${q.id}" ${open ? "open" : ""}><summary>📝 ${n ? "Deine Notiz zu dieser Frage" : "Notiz zu dieser Frage hinzufügen"}</summary>
    <textarea id="note" class="txt sm" rows="3" placeholder="z. B. Genau so wie bei … aber ohne … / Das ist mir besonders wichtig, weil …">${esc(n)}</textarea>
    <small>Optional. Die Notiz landet im KI-Bauauftrag direkt bei dieser Antwort.</small></details>`;
}
const noteOf = id => (st.notes && st.notes[id] || "").trim();
function answerLines(q) {
  const base = answerLinesBase(q), n = noteOf(q.id);
  if (!base) return n ? [`- **${q.label}:** (keine Auswahl)`, `  - 📝 **Notiz des Auftraggebers (verbindlich):** „${n}“`] : null;
  return n ? base.concat([`  - 📝 **Notiz des Auftraggebers (verbindlich):** „${n}“`]) : base;
}
function answerLinesBase(q) {
  const x = st.a[q.id];
  if (q.t === "t" && (x === AI || x === "" || x === undefined)) return null;
  if (x === undefined) return null;
  if (x === AI || x === "" || (Array.isArray(x) && x.includes(AI))) return [`- **${q.label}:** KI entscheidet. Wähle passend zum Gesamtkonzept und trage es in „Meine Entscheidungen“ ein.`];
  if (q.t === "t") return [`- **${q.label}:** „${x}“`];
  if (Array.isArray(x)) {
    if (!x.length) return null;
    const ds = x.map(v => ({ v, d: descOf(q, v) }));
    if (ds.some(d => d.d)) return [`- **${q.label}:**`].concat(ds.map(d => `  - ${d.v}${d.d ? ` – ${d.d}` : ""}`));
    return [`- **${q.label}:** ${x.join(", ")}`];
  }
  const d = descOf(q, x);
  return [`- **${q.label}:** ${x}${d ? ` – ${d}` : ""}`];
}
function acceptance() {
  const a = st.a, out = [], g = val;
  if (g("platforms")) out.push(`Läuft fehlerfrei auf: ${g("platforms")}.`);
  if (g("orientation")) out.push(`Bildschirmausrichtung: ${g("orientation")}; kein Inhalt wird abgeschnitten, auch nicht auf Geräten mit Notch.`);
  if (g("inputTouch")) out.push(`Komplett per Touch spielbar (${g("inputTouch")}).`);
  if (g("inputDesk")) out.push(`Am Computer komplett spielbar per ${g("inputDesk")}.`);
  if (g("internet")) out.push(`Internet: ${g("internet")}.`);
  if (g("session")) out.push(`Eine typische Sitzung dauert ${g("session")}; der Einstieg vom Start bis zum Spielen dauert höchstens 10 Sekunden.`);
  out.push("Läuft flüssig ohne spürbare Ruckler auf den Zielgeräten.");
  if (g("size")) out.push(`Download-Größe: ${g("size")}.`);
  const tb = Array.isArray(a.taboo) ? a.taboo.filter(x => x !== AI && x !== "Keine Einschränkungen") : [];
  if (tb.length) out.push(`Enthält nachweislich nichts aus: ${tb.join(", ")}.`);
  const ax = ["a11yVis", "a11yMotor", "a11yCog", "a11yHear"].flatMap(k => Array.isArray(a[k]) ? a[k].filter(y => y !== AI && y !== "Keine") : []);
  if (ax.length) out.push(`Barrierefreiheit umgesetzt: ${ax.join(", ")}.`);
  if (g("languages")) out.push(`Alle Texte verfügbar in: ${g("languages")}.`);
  if (g("save") && g("save") !== "Gar nicht") out.push("Fortschritt bleibt nach dem Schließen und Neustarten erhalten.");
  if (mpAny(a)) out.push(`Multiplayer funktioniert: ${g("mp")}${g("mpCount") ? `, ${g("mpCount")} Spieler` : ""}.`);
  if (g("monet")) out.push(`Geschäftsmodell umgesetzt: ${g("monet")}${g("iapTypes") ? ` (${g("iapTypes")})` : ""}${g("adTypes") ? ` (${g("adTypes")})` : ""}.`);
  if (has(a, "parents", "Elternbereich mit Sperre")) out.push("Elternschranke vor jedem Kauf und jedem externen Link.");
  out.push("Keine Fehler oder Warnungen in der Konsole bzw. im Log.");
  out.push("Kein Zustand, in dem das Spiel hängen bleibt (Softlock); jeder Bildschirm hat einen Weg zurück.");
  out.push("Pausieren, Neustarten und Zurück zum Menü funktionieren jederzeit.");
  out.push("Jede Vorgabe aus den Abschnitten oben ist sichtbar umgesetzt.");
  return out;
}
function milestones() {
  const a = st.a, m = [];
  const core = val(st.a.core === QUIZ_OPT ? "coreQuiz" : "core") || "das Kernsystem";
  m.push(["Grundgerüst & Kernmechanik", `Projekt aufsetzen, Spielschleife, Steuerung und ${core} mit einfachen Platzhalterformen spielbar machen.`]);
  m.push(["Spielinhalte", "Level bzw. Inhalte, Gegner und Hindernisse, Sammelobjekte, Sieg- und Niederlagebedingungen, Fortschritt."]);
  m.push(["Grafik & Sound", "Kunststil, Animationen, Effekte, Musik und Soundeffekte wie spezifiziert."]);
  m.push(["Menüs & Komfort", "Hauptmenü, Einstellungen, Pause, Tutorial, Speichern, Barrierefreiheit, Sprachen."]);
  if (mpAny(a)) m.push(["Multiplayer", "Verbindung, Mitspieler finden, Synchronisierung, Abbrüche behandeln."]);
  if (ads(a) || iap(a) || has(a, "monet", "Einmalkauf (Premium)", "Abo", "Marketing-Spiel (gratis)")) m.push(["Monetarisierung & Marke", "Geschäftsmodell technisch einbauen, mit Testmodus für Käufe und Werbung."]);
  m.push(["Feinschliff & Balancing", "Schwierigkeit, Belohnungsrhythmus, Feedback-Effekte, Performance, Fehlerbehebung."]);
  if (publicLaunch(a)) m.push(["Veröffentlichung", `Builds und Store-Material für: ${val("launchWhere")}.`]);
  return m;
}

/* ---------- Zusammenfassung & Checkliste ---------- */
function launchItems() {
  const a = st.a, L = [];
  const add = (k, t, d) => L.push({ k, t, d });
  if (!publicLaunch(a)) {
    add("p1", "Auf echten Geräten testen", "Lass 2–3 Leute aus der Zielgruppe spielen und schau zu, ohne zu helfen.");
    add("p2", "Teilen", "Für private Spiele reicht ein Link (z. B. GitHub Pages oder Netlify, beides kostenlos).");
    return L;
  }
  add("g1", "Name prüfen", "In den Stores suchen und bei DPMA/EUIPO prüfen, ob der Name geschützt ist.");
  add("g2", "Datenschutzerklärung online stellen", "Jeder Store verlangt eine öffentlich erreichbare URL.");
  add("g3", "Impressum", "In Deutschland Pflicht bei geschäftsmäßigen Angeboten, auch bei Gratis-Spielen mit Werbezweck.");
  add("g4", "Lizenzen dokumentieren", "Liste aller fremden Grafiken, Sounds, Schriften und Bibliotheken mit Lizenz.");
  add("g5", "Mit echten Spielern testen", "Mindestens 5 Leute aus der Zielgruppe, auf verschiedenen Geräten.");
  if (has(a, "launchWhere", "Apple App Store")) {
    add("a1", "Apple Developer Program", "99 $ pro Jahr. Die Identitätsprüfung kann einige Tage dauern.");
    add("a2", "iOS-Build erstellen", "Braucht einen Mac mit Xcode oder einen Cloud-Build-Dienst (z. B. EAS Build bei Expo).");
    add("a3", "App Store Connect einrichten", "App anlegen, Bundle-ID, Preise, Verfügbarkeit, Screenshots in den geforderten iPhone- und ggf. iPad-Größen.");
    add("a4", "App-Datenschutz-Angaben", "Im Formular angeben, welche Daten erhoben werden (auch durch Werbe- und Analyse-SDKs).");
    add("a5", "Altersfreigabe-Fragebogen", "In App Store Connect ausfüllen.");
    add("a6", "Händlerstatus (EU)", "Pflichtangabe nach dem Digital Services Act. Als Händler werden Adresse und Kontakt öffentlich angezeigt.");
    add("a7", "TestFlight", "Vor dem Release mit Testern ausprobieren.");
    add("a8", "App-Review", "Dauert meist 1–2 Tage. Häufige Ablehnungsgründe: Abstürze, Platzhalterinhalte, fehlende Datenschutz-URL, unvollständige Angaben.");
  }
  if (has(a, "launchWhere", "Google Play")) {
    add("b1", "Google Play Console", "25 $ einmalig, mit Identitätsprüfung.");
    add("b2", "Geschlossener Test", "Neue private Konten müssen vor der Veröffentlichung einen geschlossenen Test mit mindestens 12 Testern über 14 Tage durchführen.");
    add("b3", "Datensicherheit-Formular", "Angeben, welche Daten erhoben und geteilt werden.");
    add("b4", "Inhaltsbewertung (IARC)", "Fragebogen in der Play Console.");
    add("b5", "Zielgruppe & Inhalte", "Bei Kindern gelten die Familien-Richtlinien (Werbung, Datenschutz).");
    add("b6", "App-Bundle hochladen", "Format AAB, aktuelles Ziel-API-Level, Icon 512×512, Feature-Grafik 1024×500.");
  }
  if (has(a, "launchWhere", "Steam")) {
    add("s1", "Steamworks-Konto", "100 $ Gebühr pro Spiel, wird nach Umsatz zurückerstattet.");
    add("s2", "Store-Seite früh online", "Mindestens 2 Wochen vor Release als „Demnächst“ sichtbar; Wunschlisten sammeln.");
    add("s3", "Build- und Store-Prüfung", "Valve prüft Store-Seite und Build vor dem Start.");
  }
  if (has(a, "launchWhere", "itch.io")) add("i1", "itch.io-Seite", "Kostenlos. Web-Spiele als ZIP mit index.html hochladen, Preis frei wählbar.");
  if (has(a, "launchWhere", "Web-Spieleportale")) add("w1", "Portal-Anforderungen", "Jedes Portal hat eigene Regeln (SDK, Ladezeit, Größe, Werbung). Vor dem Bau lesen.");
  if (has(a, "launchWhere", "Eigene Website")) add("e1", "Hosting", "z. B. GitHub Pages oder Netlify mit HTTPS; Impressum und Datenschutz verlinken.");
  if (has(a, "launchWhere", "Konsolen-Stores")) add("k1", "Konsolen-Entwicklerprogramm", "Bei Nintendo, Sony oder Microsoft bewerben; Devkits und Zertifizierung nötig.");
  if (kids(a)) add("c1", "Kinder-Regeln", "Keine personalisierte Werbung, Elternschranke vor Käufen und Links, sparsam mit Daten.");
  if (ads(a)) add("m1", "Werbenetzwerk", "Konto anlegen (z. B. AdMob), Einwilligungsdialog nach DSGVO; auf iOS App-Tracking-Abfrage, falls getrackt wird.");
  if (iap(a) || has(a, "monet", "Einmalkauf (Premium)", "Abo")) add("m2", "Steuer & Bankdaten", "In den Store-Konsolen hinterlegen, sonst gibt es keine Auszahlungen. Kaufartikel im Store anlegen.");
  if (Array.isArray(a.marketing) && a.marketing.some(x => x !== "Gar nicht" && x !== AI)) add("mk", "Marketing starten", `Kanäle: ${val("marketing")}. Am besten schon während der Entwicklung posten.`);
  return L;
}
function ideaText() {
  const a = st.a, arr = id => Array.isArray(a[id]) ? a[id].filter(x => x !== AI) : [];
  const verbs = arr("ideaVerb").map(v => PH.verb[v]).filter(Boolean).map(p => p.split("|"));
  const whole = p => p.join(" ");
  const out = [];
  if (verbs.length || val("ideaGoal")) {
    const hp = PH.hero[val("hero")];
    let s = verbs.length ? (hp ? `${hp} ${verbs[0][0]} du${verbs[0][1] ? " " + verbs[0][1] : ""}` : `Du ${whole(verbs[0])}`) : (hp ? `${hp} spielst du` : "Du spielst");
    if (verbs[1]) s += ` und ${whole(verbs[1])}`;
    if (PH.goal[val("ideaGoal")]) s += `, ${PH.goal[val("ideaGoal")]}`;
    out.push(s + ".");
  }
  if (val("setting")) out.push(`Schauplatz: ${val("setting")}.`);
  const ch = arr("ideaChallenge").map(c => PH.ch[c]).filter(Boolean);
  if (ch.length) out.push(`Schwierig wird es, weil ${ch.join(" und ")}.`);
  else if (has(a, "ideaChallenge", "Gar nichts, es ist entspannt")) out.push("Es bleibt entspannt, ohne Druck.");
  if (val("ideaTwist") && val("ideaTwist") !== "Kein Kniff, klassisch gut") out.push(`Der Clou: ${val("ideaTwist")}. ${descOf(qOf("ideaTwist"), val("ideaTwist"))}`);
  if (val("ideaEscalation")) out.push(`Mit der Zeit wird es spannender durch: ${val("ideaEscalation")}.`);
  if (val("ideaFinale")) out.push(`Finale: ${val("ideaFinale")}.`);
  const core = val(a.core === QUIZ_OPT ? "coreQuiz" : "core");
  if (core) out.push(`Spielsystem: ${core}.`);
  return out.join(" ");
}
function ideaPanel() {
  const t = ideaText();
  const steps = ["ideaVerb", "ideaGoal", "hero", "setting", "ideaChallenge", "ideaTwist", "ideaEscalation"];
  const n = steps.filter(id => st.a[id] !== undefined).length;
  return `<aside class="idea"><div class="idea-h"><b>Deine Spielidee</b><span class="idea-bricks">${steps.map((id, i) => `<i class="${st.a[id] !== undefined ? "f" : ""}" title="${esc(qOf(id).label)}"></i>`).join("")}</span><small>${n}/${steps.length} Bausteine</small></div>
    <p>${t ? esc(t) : val("thoughts") ? `Deine Gedanken: „${esc(val("thoughts").slice(0, 220))}${val("thoughts").length > 220 ? " …" : ""}“` : "Beantworte die Fragen im Bereich „Spielidee“, dann entsteht hier Satz für Satz dein Spiel."}</p></aside>`;
}
function summarySentence() {
  const g = val, a = st.a;
  const core = val(a.core === QUIZ_OPT ? "coreQuiz" : "core");
  const parts = [];
  parts.push(`${g("name") || "Dein Spiel"} ist ${core ? `ein ${core}` : "ein Spiel"}${g("setting") ? ` im Setting „${g("setting")}“` : ""}`);
  if (g("age")) parts[0] += ` für ${g("age") === "Alle Altersgruppen" ? "alle Altersgruppen" : g("age").includes("Jahre") ? "Kinder von " + g("age") : g("age")}`;
  parts[0] += ".";
  if (g("artStyle") || g("perspective")) parts.push(`Es sieht ${g("artStyle") ? `aus wie ${g("artStyle")}` : "eigenständig aus"}${g("perspective") ? `, gespielt in der Perspektive „${g("perspective")}“` : ""}.`);
  if (g("platforms")) parts.push(`Es läuft auf ${g("platforms")}${g("session") ? `, eine Runde dauert ${g("session")}` : ""}.`);
  if (g("feeling")) parts.push(`Im Kern soll es dieses Gefühl auslösen: ${g("feeling")}.`);
  return parts.join(" ");
}
function buildSummaryText() {
  const v = visible().filter(q => !q.quiz), L = [];
  L.push(`ZUSAMMENFASSUNG: Mein Spiel`, "", ideaText() || summarySentence(), "");
  S.forEach(s => {
    const qs = v.filter(q => q.sec === s.id && answered(q)); if (!qs.length) return;
    L.push(`— ${s.name} —`); qs.forEach(q => { L.push(`• ${q.label}: ${fmt(q)}`); if (noteOf(q.id)) L.push(`  📝 ${noteOf(q.id)}`); }); L.push("");
  });
  const c = conflicts(); if (c.length) { L.push("— Hinweise —"); c.forEach(x => L.push(`• ${x.t}`)); L.push(""); }
  L.push("— Launch-Checkliste —"); launchItems().forEach(i => L.push(`☐ ${i.t}: ${i.d}`));
  return L.join("\n");
}

function viewResult() {
  const v = visible().filter(q => !q.quiz);
  const ans = v.filter(answered), aiN = ans.filter(q => fmt(q) === "KI entscheidet").length, open = v.length - ans.length;
  const c = conflicts();
  const tabs = [["sum", "Spielkonzept"], ["prompt", "KI-Prompt"], ["launch", "Launch-Checkliste"]];
  let panel = "";
  if (st.tab === "prompt") {
    const p = buildPrompt();
    panel = `<div class="panel">
      <div class="panelbar"><p>Der komplette Bauauftrag für die KI. Kopiere ihn vollständig in Claude oder eine andere KI. ${p.length.toLocaleString("de-DE")} Zeichen.</p>
      <div class="rbtns"><button class="btn primary" data-act="copy" data-w="prompt">Prompt kopieren</button>${canPDF() ? `<button class="btn" data-act="ppdf">Als PDF speichern</button>` : ""}</div></div>
      <pre class="code">${esc(p)}</pre></div>`;
  } else if (st.tab === "sum") {
    const cards = S.map(s => {
      const qs = v.filter(q => q.sec === s.id && answered(q)); if (!qs.length) return "";
      return `<article class="scard"><h3>${s.icon} ${esc(s.name)}</h3><dl>${qs.map(q => {
        const f = fmt(q);
        return `<button class="row" data-act="edit" data-q="${q.id}" title="Antwort ändern"><dt>${esc(q.label)}</dt><dd class="${f === "KI entscheidet" ? "aiv" : ""}">${esc(f)}${noteOf(q.id) ? `<span class="rnote">📝 ${esc(noteOf(q.id))}</span>` : ""}</dd></button>`;
      }).join("")}</dl></article>`;
    }).join("");
    const doc = concept(), stale = st.ai && st.aiSig !== JSON.stringify(st.a);
    panel = `<div class="panel">
      <div class="panelbar"><p>Dein erstes Spiel, fertig ausgedacht aus deinen Antworten.</p>
        <div class="rbtns">
          ${CAPS.sample ? `<button class="btn" data-act="elaborate" ${elaborate.busy ? "disabled" : ""}>${elaborate.busy ? "Claude arbeitet …" : st.ai ? "Neu ausarbeiten lassen" : "✨ Von Claude ausführlich ausarbeiten"}</button>` : ""}
          ${canPDF() ? `<button class="btn primary" data-act="pdf">Als PDF speichern</button>` : ""}
        </div></div>
      ${elaborate.busy ? `<p class="aistatus" id="aiStatus">Claude denkt sich dein Spiel aus … das dauert etwa eine Minute.</p>` : ""}
      ${st.aiErr ? `<p class="alert warn">${esc(st.aiErr)}</p>` : ""}
      ${stale ? `<p class="alert info">Du hast Antworten geändert, seit Claude das Konzept ausgearbeitet hat. Lass es neu ausarbeiten, damit alles zusammenpasst.</p>` : ""}
      ${inClaude && !CAPS.downloads ? `<p class="fine">Der PDF-Download erscheint, sobald die Seite in claude.ai geöffnet ist.</p>` : ""}
      <article class="doc">
        <p class="eyebrow">Spielkonzept${st.ai ? " · ausgearbeitet mit Claude" : ""}</p>
        <h1>${esc(doc.title)}</h1>
        ${docHTML(doc)}
      </article>
      <h2 class="h2s">Alle Antworten <small>Tippe auf eine Zeile, um sie zu ändern.</small></h2>
      <div class="scards">${cards}</div></div>`;
  } else {
    const items = launchItems(), d = items.filter(i => st.done[i.k]).length;
    panel = `<div class="panel">
      <div class="panelbar"><p>${d} von ${items.length} erledigt. Abhaken wird in diesem Browser gespeichert.</p></div>
      <ul class="checks">${items.map(i => `<li><button class="chk${st.done[i.k] ? " on" : ""}" data-act="check" data-k="${i.k}" aria-pressed="${!!st.done[i.k]}"><span class="box" aria-hidden="true"></span><span><b>${esc(i.t)}</b><small>${esc(i.d)}</small></span></button></li>`).join("")}</ul>
      <p class="fine">Stand Oktober 2026. Gebühren und Regeln ändern sich, prüfe sie vor dem Einreichen auf den offiziellen Seiten. Keine Rechtsberatung.</p></div>`;
  }
  return `<section class="result">
    <div class="rhead">
      <div><p class="eyebrow">Dein Bauplan</p><h1>${esc(val("name") || "Dein Spiel")}</h1>
      <p class="stats"><span><b>${ans.length}</b> beantwortet</span><span><b>${aiN}</b> entscheidet die KI</span>${open ? `<span><b>${open}</b> offen</span>` : ""}<span>Stufe „${LEVELS[st.level - 1].name}“</span></p></div>
      <div class="rbtns">${open ? `<button class="btn" data-act="go">Offene Fragen beantworten</button>` : ""}${st.level < 4 ? `<button class="btn primary" data-act="deeper">Noch detaillierter →</button>` : ""}</div>
    </div>
    ${typeof cloudBox === "function" ? cloudBox() : ""}
    ${c.length ? `<div class="alerts">${c.map(x => `<p class="alert ${x.k}"><b>${x.k === "warn" ? "Achtung" : "Hinweis"}</b> ${esc(x.t)}</p>`).join("")}</div>` : ""}
    <div class="tabs" role="tablist">${tabs.map(([k, l]) => `<button role="tab" class="tab${st.tab === k ? " on" : ""}" aria-selected="${st.tab === k}" data-act="tab" data-t="${k}">${l}</button>`).join("")}</div>
    ${panel}
  </section>`;
}

/* ---------- Start ---------- */
const signedIn = () => typeof AUTH !== "undefined" && !!AUTH.user;
function boot(d) { if (d && d.st) st = d.st; render(); }

