/* Start – ganz am Ende, wenn alle Teile geladen sind */
try { window.claude?.hot?.snapshot(() => ({ st })); } catch (e) {}
window.claude?.hot?.ready ? window.claude.hot.ready(boot) : boot(window.claude?.hot?.data ?? {});
