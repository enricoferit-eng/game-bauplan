/* Game-Bauplan – Online speichern & teilen (Supabase) */
const SUPABASE_URL = "https://rpiopejbdhqjdhgdrnne.supabase.co";
const SUPABASE_KEY = "sb_publishable_sZN7Px0rPVVmAjptx2Sj9A_RhCldM7H";
let sb = null;
try { if (window.supabase && !(window.claude && window.claude.use)) sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY); } catch (e) {}
const CLOUD = { id: null, secret: null, msg: "", busy: false, lastSaved: "" };
try { Object.assign(CLOUD, JSON.parse(localStorage.getItem("gamebauplan.cloud")) || {}); } catch (e) {}
const cloudKeep = () => { try { localStorage.setItem("gamebauplan.cloud", JSON.stringify({ id: CLOUD.id, secret: CLOUD.secret })); } catch (e) {} };
const rnd = n => { const c = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789", b = crypto.getRandomValues(new Uint8Array(n)); return [...b].map(x => c[x % c.length]).join(""); };
const shareURL = () => `${location.origin}${location.pathname}?b=${CLOUD.id}`;
const payload = () => ({ a: st.a, level: st.level, ai: st.ai || null, aiSig: st.aiSig || null });

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
  st.a = data.a || {}; st.level = data.level || 2; st.ai = data.ai || null; st.aiSig = data.aiSig || null;
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
