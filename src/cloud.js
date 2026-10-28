/* Ovio – Online speichern & teilen (Supabase) */
const SUPABASE_URL = "https://vzoggokzibymbwnmgbqk.supabase.co";
const SUPABASE_KEY = "sb_publishable_2ZjnZYQzM7Sw9x0d1M1sNA_2QGUI82b";
let sb = null;
try { if (window.supabase && !(window.claude && window.claude.use)) sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY); } catch (e) {}
const CLOUD = { id: null, secret: null, msg: "", busy: false, lastSaved: "" };
try { Object.assign(CLOUD, JSON.parse(localStorage.getItem("gamebauplan.cloud")) || {}); } catch (e) {}
const cloudKeep = () => { try { localStorage.setItem("gamebauplan.cloud", JSON.stringify({ id: CLOUD.id, secret: CLOUD.secret })); } catch (e) {} };
const rnd = n => { const c = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789", b = crypto.getRandomValues(new Uint8Array(n)); return [...b].map(x => c[x % c.length]).join(""); };
const shareURL = () => `${location.origin}${location.pathname}?b=${CLOUD.id}`;
const AI_KEYS = ["aq", "aiRounds", "aiCov", "aiGaps", "aiDone", "aiLevel"];
const payload = () => Object.assign({ a: st.a, notes: st.notes || {}, level: st.level, ai: st.ai || null, aiSig: st.aiSig || null }, ...AI_KEYS.map(k => ({ [k]: st[k] === undefined ? null : st[k] })));
const aiRestore = d => AI_KEYS.forEach(k => { st[k] = d[k] === null ? undefined : d[k]; });
/* Teil-Link vergessen, z. B. bei einem neuen Projekt */
function cloudForget() { CLOUD.id = null; CLOUD.secret = null; CLOUD.msg = ""; CLOUD.lastSaved = ""; cloudKeep(); }

async function cloudSave(silent) {
  if (!sb || CLOUD.busy) return;
  if (!CLOUD.id || !CLOUD.secret) { CLOUD.id = rnd(10); CLOUD.secret = rnd(32); cloudKeep(); }
  CLOUD.busy = true; if (!silent) { CLOUD.msg = "Speichere …"; render(); }
  const data = JSON.stringify(payload());
  const { data: ok, error } = await sb.rpc("gb_save", { p_id: CLOUD.id, p_secret: CLOUD.secret, p_data: payload() });
  CLOUD.busy = false;
  if (error) CLOUD.msg = /gb_save|function|schema/i.test(error.message) ? "Online-Speichern ist noch nicht eingerichtet." : "Speichern hat nicht geklappt. Prüfe deine Internetverbindung.";
  else if (ok === false) { CLOUD.id = null; CLOUD.secret = null; cloudKeep(); return cloudSave(silent); }
  else { CLOUD.lastSaved = data; CLOUD.msg = "Online gespeichert ✓"; }
  if (!silent || error) render();
}
async function cloudLoad(id) {
  if (!sb) return;
  const { data, error } = await sb.rpc("gb_load", { p_id: id });
  if (error || !data) { CLOUD.msg = "Dieser Bauplan wurde nicht gefunden."; render(); return; }
  st.a = data.a || {}; st.notes = data.notes || {}; st.level = data.level || 2; st.ai = data.ai || null; st.aiSig = data.aiSig || null;
  aiRestore(data);
  st.view = "result"; st.tab = "sum";
  if (CLOUD.id !== id) { CLOUD.id = null; CLOUD.secret = null; CLOUD.msg = "Geteilter Bauplan geladen. Wenn du speicherst, entsteht deine eigene Kopie."; cloudKeep(); }
  else CLOUD.lastSaved = JSON.stringify(payload());
  render();
}
function cloudBox() {
  if (!sb) return "";
  return `<div class="cloud">
    <div><b>Online speichern & teilen</b><small>${CLOUD.id ? "Dein Bauplan hat einen eigenen Link. Änderungen werden automatisch gespeichert." : "Speichere deinen Bauplan online, um ihn zu teilen oder auf einem anderen Gerät weiterzumachen."}</small></div>
    ${CLOUD.id ? `<input class="sharelink" id="shareLink" readonly value="${esc(shareURL())}"><button class="btn sm" data-act="copylink">Link kopieren</button>` : ""}
    <button class="btn sm primary" data-act="cloud" ${CLOUD.busy ? "disabled" : ""}>${CLOUD.id ? "Jetzt speichern" : "Online speichern"}</button>
    ${CLOUD.msg ? `<p class="fine">${esc(CLOUD.msg)}</p>` : ""}</div>`;
}
document.addEventListener("click", e => {
  const b = e.target.closest("[data-act]"); if (!b) return;
  if (b.dataset.act === "cloud") cloudSave(false);
  if (b.dataset.act === "copylink") {
    const t = shareURL();
    navigator.clipboard.writeText(t).then(() => { b.textContent = "Kopiert ✓"; setTimeout(() => b.textContent = "Link kopieren", 2000); },
      () => { const i = document.getElementById("shareLink"); i.select(); });
  }
});
/* Automatisch speichern, sobald sich etwas ändert (nur eigener Bauplan) */
setInterval(() => { if (sb && CLOUD.id && !CLOUD.busy && JSON.stringify(payload()) !== CLOUD.lastSaved) cloudSave(true); }, 4000);
(() => { const id = new URLSearchParams(location.search).get("b"); if (sb && id && /^[A-Za-z0-9]{10}$/.test(id)) cloudLoad(id); })();

/* ---------- Konto & Projekte (Supabase Auth, Bestätigung per E-Mail) ---------- */
const AUTH = { user: null, projects: null, mode: "", email: "", msg: "", busy: false, recover: false, lastSig: "", saving: false, delArm: null };
const HASH0 = location.hash; /* vor supabase-js merken, das den Link-Teil sofort auswertet */
const HERE = () => location.origin + location.pathname;
const projData = () => ({ ...payload(), done: st.done || {}, fromThoughts: st.fromThoughts || {}, cur: st.cur, share: CLOUD.id ? { id: CLOUD.id, secret: CLOUD.secret } : null });
const projSig = () => JSON.stringify([projTitle(), projData()]);
const authErr = m => /invalid login/i.test(m) ? "E-Mail oder Passwort stimmt nicht."
  : /not confirmed/i.test(m) ? "Bitte bestätige zuerst deine E-Mail – der Link steht in der Nachricht, die wir dir geschickt haben."
  : /already registered|already been registered/i.test(m) ? "Für diese E-Mail gibt es schon ein Konto. Melde dich einfach an."
  : /password/i.test(m) && /6|short|least/i.test(m) ? "Das Passwort braucht mindestens 6 Zeichen."
  : /rate limit|too many/i.test(m) ? "Gerade wurden zu viele E-Mails verschickt. Bitte versuche es in ein paar Minuten noch einmal."
  : /gb_projects|relation|schema/i.test(m) ? "Konten sind noch nicht fertig eingerichtet."
  : "Das hat nicht geklappt. Prüfe deine Internetverbindung.";

async function projList() {
  const { data, error } = await sb.from("gb_projects").select("id,title,progress,updated_at").order("updated_at", { ascending: false });
  AUTH.projects = error ? [] : data; if (error) AUTH.msg = authErr(error.message);
  if (st.view === "start") render();
}
/* Aktuelles Projekt ins Konto speichern (nur wenn schon etwas beantwortet ist) */
async function projSave() {
  if (!sb || !AUTH.user || AUTH.saving || !Object.keys(st.a).length) return;
  const sig = projSig(); if (sig === AUTH.lastSig) return;
  if (!st.pid) st.pid = crypto.randomUUID();
  const v = visible(), progress = v.length ? Math.round(v.filter(answered).length / v.length * 100) : 0;
  const row = { id: st.pid, title: projTitle(), progress, data: projData(), updated_at: new Date().toISOString() };
  AUTH.saving = true;
  const { error } = await sb.from("gb_projects").upsert(row);
  AUTH.saving = false;
  if (error) return;
  AUTH.lastSig = sig;
  if (AUTH.projects) AUTH.projects = [{ id: row.id, title: row.title, progress, updated_at: row.updated_at }, ...AUTH.projects.filter(p => p.id !== row.id)];
}
function projFlush() { AUTH.lastSig = ""; AUTH.saving = false; projSave(); }
async function projOpen(id) {
  projFlush();
  const { data, error } = await sb.from("gb_projects").select("id,title,data").eq("id", id).single();
  if (error || !data) { AUTH.msg = "Das Projekt konnte nicht geladen werden."; return render(); }
  const d = data.data || {};
  st = Object.assign(blank(d.level), { a: d.a || {}, notes: d.notes || {}, ai: d.ai || null, aiSig: d.aiSig || null, done: d.done || {}, fromThoughts: d.fromThoughts || {}, cur: d.cur || null, pid: data.id });
  aiRestore(d);
  if (data.title !== projTitle()) st.title = data.title;
  CLOUD.id = d.share ? d.share.id : null; CLOUD.secret = d.share ? d.share.secret : null; CLOUD.msg = ""; CLOUD.lastSaved = JSON.stringify(payload()); cloudKeep();
  AUTH.lastSig = projSig(); AUTH.msg = "";
  startQuiz();
}
async function projDelete(id) {
  await sb.from("gb_projects").delete().eq("id", id);
  AUTH.projects = (AUTH.projects || []).filter(p => p.id !== id);
  if (st.pid === id) { st = blank(st.level); cloudForget(); AUTH.lastSig = ""; }
  render();
}
async function authSubmit(f) {
  const email = f.email.value.trim(), pw = f.pw ? f.pw.value : "";
  if (email) AUTH.email = email;
  AUTH.busy = true; AUTH.msg = ""; render();
  let r;
  if (AUTH.recover) r = await sb.auth.updateUser({ password: pw });
  else if (AUTH.mode === "signup") r = await sb.auth.signUp({ email, password: pw, options: { emailRedirectTo: HERE() } });
  else if (AUTH.mode === "forgot") r = await sb.auth.resetPasswordForEmail(email, { redirectTo: HERE() });
  else r = await sb.auth.signInWithPassword({ email, password: pw });
  AUTH.busy = false;
  if (r.error) AUTH.msg = authErr(r.error.message);
  else if (AUTH.recover) { AUTH.recover = false; AUTH.mode = ""; AUTH.msg = "Neues Passwort gespeichert ✓"; }
  else if (AUTH.mode === "signup" && !r.data.session) {
    /* Bei schon registrierten Adressen liefert Supabase einen Nutzer ohne identities */
    if (r.data.user && r.data.user.identities && !r.data.user.identities.length) { AUTH.msg = "Für diese E-Mail gibt es schon ein Konto. Melde dich einfach an."; AUTH.mode = "login"; }
    else { AUTH.msg = `Wir haben dir eine E-Mail an ${email} geschickt. Klicke auf den Link darin, um dein Konto zu bestätigen – danach bist du automatisch angemeldet.`; AUTH.mode = "sent"; }
  } else if (AUTH.mode === "forgot") { AUTH.msg = `Wir haben dir eine E-Mail an ${email} geschickt. Über den Link darin kannst du ein neues Passwort festlegen.`; AUTH.mode = "sent"; }
  render();
}
function accountBox() {
  if (!sb) return "";
  const msg = AUTH.msg ? `<p class="msg" role="status">${esc(AUTH.msg)}</p>` : "";
  if (AUTH.recover) return `<div class="acct"><div class="acct-h"><div><h2>Neues Passwort festlegen</h2></div></div>
    <form data-form="auth"><input type="hidden" name="email" value=""><label>Neues Passwort<input name="pw" type="password" minlength="6" required autocomplete="new-password"></label>
    <button class="btn primary" ${AUTH.busy ? "disabled" : ""}>Passwort speichern</button></form>${msg}</div>`;
  if (!AUTH.user) {
    const title = { signup: "Konto erstellen", login: "Anmelden", forgot: "Passwort vergessen", sent: "Schau in dein Postfach" }[AUTH.mode] || "Projekte speichern";
    const form = !AUTH.mode || AUTH.mode === "sent" ? "" : `<form data-form="auth">
      <label>E-Mail<input name="email" type="email" required autocomplete="email" value="${esc(AUTH.email)}"></label>
      ${AUTH.mode === "forgot" ? "" : `<label>Passwort${AUTH.mode === "signup" ? " (mind. 6 Zeichen)" : ""}<input name="pw" type="password" minlength="6" required autocomplete="${AUTH.mode === "signup" ? "new-password" : "current-password"}"></label>`}
      <button class="btn primary" ${AUTH.busy ? "disabled" : ""}>${AUTH.busy ? "Einen Moment …" : { signup: "Konto erstellen", login: "Anmelden", forgot: "Link schicken" }[AUTH.mode]}</button>
      <p class="fine">${AUTH.mode === "signup" ? `Du bekommst eine E-Mail zum Bestätigen. Schon ein Konto? <button type="button" class="link" data-act="authmode" data-m="login">Anmelden</button>`
        : AUTH.mode === "login" ? `Noch kein Konto? <button type="button" class="link" data-act="authmode" data-m="signup">Konto erstellen</button> · <button type="button" class="link" data-act="authmode" data-m="forgot">Passwort vergessen?</button>`
        : `<button type="button" class="link" data-act="authmode" data-m="login">Zurück zum Anmelden</button>`}</p></form>`;
    return `<div class="acct"><div class="acct-h"><div><h2>${title}</h2>
      <small>Mit einem kostenlosen Konto bleiben alle deine Baupläne gespeichert. Du kannst jederzeit zwischen ihnen wechseln und mit einem Klick ein neues Projekt starten – auch auf anderen Geräten.</small></div>
      ${AUTH.mode ? "" : `<div class="cta"><button class="btn primary" data-act="authmode" data-m="signup">Konto erstellen</button><button class="btn" data-act="authmode" data-m="login">Anmelden</button></div>`}</div>
      ${form}${msg}${AUTH.mode === "sent" ? `<p class="fine"><button class="link" data-act="authmode" data-m="login">Zum Anmelden</button></p>` : ""}</div>`;
  }
  const ps = AUTH.projects;
  const date = t => new Date(t).toLocaleDateString("de-DE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  const cards = ps === null ? `<p class="fine">Lade deine Projekte …</p>` : `<div class="projs">
    <button class="proj new" data-act="newproj"><span>+</span>Neues Projekt</button>
    ${ps.map(p => `<div class="proj${p.id === st.pid ? " cur" : ""}">
      <b>${esc(p.title || "Neues Projekt")}</b>
      <div class="bar"><span style="width:${p.progress || 0}%"></span></div>
      <small>${p.progress || 0} % · ${p.id === st.pid ? "gerade geöffnet" : "geändert " + date(p.updated_at)}</small>
      <button class="btn sm${p.id === st.pid ? "" : " primary"}" data-act="openproj" data-id="${p.id}">${p.id === st.pid ? "Weitermachen" : "Öffnen"}</button>
      <span class="proj-tools"><button data-act="renproj" data-id="${p.id}" title="Umbenennen" aria-label="Umbenennen">✎</button><button class="${AUTH.delArm === p.id ? "arm" : ""}" data-act="delproj" data-id="${p.id}" title="Löschen" aria-label="Löschen">${AUTH.delArm === p.id ? "Löschen?" : "🗑"}</button></span>
    </div>`).join("")}</div>`;
  return `<div class="acct"><div class="acct-h"><div><h2>Meine Projekte</h2><small>Angemeldet als ${esc(AUTH.user.email)}</small></div>
    <button class="btn sm ghost" data-act="logout">Abmelden</button></div>${cards}${msg}</div>`;
}
document.addEventListener("submit", e => {
  if (e.target.dataset.form === "auth") { e.preventDefault(); authSubmit(e.target); }
});
document.addEventListener("click", e => {
  const b = e.target.closest("[data-act]"); if (!b || !sb) return;
  const id = b.dataset.id, act = b.dataset.act;
  if (act !== "delproj") AUTH.delArm = null;
  if (act === "authmode") { AUTH.mode = b.dataset.m; AUTH.msg = ""; render(); setTimeout(() => { const i = document.querySelector('.acct input[name="email"]'); if (i) i.focus(); }); }
  if (act === "logout") { projFlush(); sb.auth.signOut(); }
  if (act === "openproj") { if (id === st.pid) startQuiz(); else projOpen(id); }
  if (act === "delproj") { if (AUTH.delArm !== id) { AUTH.delArm = id; render(); } else { AUTH.delArm = null; projDelete(id); } }
  if (act === "renproj") {
    const p = AUTH.projects.find(x => x.id === id), t = (prompt("Wie soll das Projekt heißen?", p.title) || "").trim().slice(0, 80);
    if (!t || t === p.title) return;
    p.title = t; render();
    if (id === st.pid) { st.title = t; projSave(); } else sb.from("gb_projects").update({ title: t }).eq("id", id).then(() => {});
  }
});
if (sb) {
  sb.auth.onAuthStateChange((ev, session) => setTimeout(() => {
    const before = AUTH.user && AUTH.user.id, now = session && session.user;
    if (ev === "PASSWORD_RECOVERY") { AUTH.recover = true; AUTH.msg = ""; st.view = "start"; }
    if (now && now.id !== before) {
      AUTH.user = now; AUTH.mode = ""; AUTH.projects = null;
      if (/type=signup/.test(HASH0)) AUTH.msg = "Deine E-Mail ist bestätigt – willkommen! ✓";
      if (location.hash) history.replaceState(null, "", location.pathname + location.search);
      projList(); projSave();
    } else if (!now && before) {
      AUTH.user = null; AUTH.projects = null; AUTH.mode = ""; AUTH.msg = "Du bist abgemeldet."; AUTH.lastSig = "";
      st = blank(st.level); cloudForget();
    }
    render();
  }));
  /* Fehler im Bestätigungslink (z. B. abgelaufen) anzeigen */
  const h = new URLSearchParams(HASH0.slice(1));
  if (h.get("error")) { AUTH.msg = /expired|invalid/i.test(h.get("error_description") || "") ? "Der Bestätigungslink ist abgelaufen. Melde dich an oder lass dir einen neuen schicken." : "Der Link hat nicht funktioniert."; AUTH.mode = "login"; history.replaceState(null, "", location.pathname + location.search); }
  setInterval(projSave, 4000);
}
