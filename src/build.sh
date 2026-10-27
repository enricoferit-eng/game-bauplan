#!/bin/zsh
cd "$(dirname "$0")"
JS() { echo '<script>'; cat data.js; echo; cat app.js; echo; cat concept.js; echo; cat prompt.js; echo; cat thoughts.js; echo; cat cloud.js; echo; cat boot.js; echo '</script>'; }
# claude.ai-Artifact
{ cat shell.html; echo '<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>'; JS; } > ../artifact.html
# GitHub Pages

{ echo '<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
  echo '<meta name="description" content="Fragebogen, der deine Spielidee Schritt für Schritt aufbaut und daraus ein Spielkonzept und einen exakten KI-Bauauftrag macht.">'
  echo '<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}[hidden]{display:none!important}img{max-width:100%}</style>'
  sed -n '1,/<\/style>/p' shell.html; echo '</head><body>'
  sed -n '/<\/style>/,$p' shell.html | tail -n +2
  echo '<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>'
  echo '<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js"></script>'
  JS; echo '</body></html>'; } > ../index.html
