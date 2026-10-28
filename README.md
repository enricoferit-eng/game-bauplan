# Ovio

Von der Idee zum exakten Bauplan für die KI – für Spiele, Apps, Websites, Shops, Arbeitsprogramme und alles andere.

1. Man wählt, was gebaut werden soll, und beantwortet ein paar feste Grundfragen mit Bildern (bei Spielen die wichtigsten Game-Fragen).
2. Danach liest Claude den Bauplan, findet offene Stellen und denkt sich Runde für Runde passende Multiple-Choice-Fragen aus, bis keine Lücken mehr bleiben. Die Detailstufe bestimmt, wie genau.
3. Am Ende gibt es ein Konzept, einen ausführlichen KI-Bauauftrag und eine Launch-Checkliste, jeweils auch als PDF.

Mit einem Konto (E-Mail-Bestätigung) werden Projekte gespeichert; Baupläne lassen sich per Link teilen.

## Einrichten (Supabase-Projekt vzoggokzibymbwnmgbqk)

Im Dashboard unter **SQL Editor** ausführen: `supabase-setup.sql`, `supabase-accounts.sql`, `supabase-ai.sql`.

KI-Funktion: `supabase/functions/ai/index.ts`. Secret `ANTHROPIC_API_KEY` setzen, optional `AI_DAILY_LIMIT` (Standard 40 Anfragen pro Konto und Tag), dann deployen:

```
npx supabase functions deploy ai --project-ref vzoggokzibymbwnmgbqk --use-api
```

## Bearbeiten

Quelltexte in `src/`, danach `src/build.sh` ausführen. Das erzeugt `index.html` (Website) und `artifact.html` (claude.ai).
