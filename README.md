# Game-Bauplan

Ein Fragebogen mit Bildern, der eine Spielidee Schritt für Schritt aufbaut. Am Ende gibt es:

- ein fertiges **Spielkonzept** (Spielablauf, Steuerung, Regeln, Level 1, Welten, Gegner) als PDF
- einen ausführlichen **KI-Bauauftrag**, den man in Claude oder eine andere KI kopiert, als Text oder PDF
- eine **Launch-Checkliste** für App Store, Google Play, Steam und itch.io

Baupläne lassen sich online speichern und per Link teilen (Supabase).

## Online-Speichern einrichten

`supabase-setup.sql` einmal im Supabase-Dashboard unter **SQL Editor** ausführen.

## Bearbeiten

Die Quelltexte liegen in `src/`. Nach Änderungen `src/build.sh` ausführen; das erzeugt `index.html` neu.
