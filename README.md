# Grammar Quest 7.0 – Ocean Arcade Light

**[Grammar Quest öffnen](https://suppekreuz.github.io/Grammar-Quest/)**

Ein kostenloses Englisch-Grammatikspiel für **Klasse 8–10**, optimiert für iPads, Tablets, Smartphones und Desktop. Das Spielprinzip aus Version 6 bleibt erhalten: 20 klassische Level pro Klasse und anschließend immer neue Aufgaben in der **Endless Challenge**.

## Das ist neu

- **Ocean Arcade Light:** Komplett überarbeitete Tablet-Oberfläche mit großen Touch-Flächen, kompakter Spielansicht, vier großen Statistikanzeigen und einer festen Navigation: Home, Levels und Ranking. Anpassbare Farbschemata aus dem bisherigen Design-Lab bleiben verfügbar.
- **Vier Spielmodi bleiben erhalten:** Word Order, Multiple Choice, Fill the Gap und Mixed Mode. Der Modus kann im Spiel umgeschaltet werden.
- **Fünf Leben:** Jeder neue Durchlauf beginnt mit 5 Herzen. Jede falsche Lösung kostet 1 Leben; bei 0 Leben endet der Run.
- **Gezielte Lernhilfe:** Nach dem **dritten Fehler bei derselben Aufgabe** wird automatisch eine deutschsprachige Erklärung eingeblendet, die auf die falsche Auswahl beziehungsweise Wortposition eingeht. Hilfen können auch vorher manuell angefordert werden.
- **Jede Namenseingabe beginnt einen neuen Run bei 0 XP.** Es gibt keine Registrierung oder persönlichen Benutzerkonten. Ein vorhandener Name darf erneut verwendet werden.
- **Persönlicher Rekord:** In der lokalen und öffentlichen Rangliste zählt weiterhin **nur der höchste Wert pro Name und Klassenstufe**. Ein neuer Run überschreibt den Rekord nicht; erst mehr XP ergeben eine Verbesserung. Beim Wiederholen sind die neuen Run-Punkte unabhängig vom vorherigen Bestwert.
- **Kindgerechter Namensfilter:** Offensichtlich unangemessene Namen und typische Verschleierungen werden abgewiesen. Die zentrale serverseitige Sperrprüfung läuft auch bei direktem Supabase-Zugriff.
- **Private Admin-Moderation:** Der Admin kann Online-Ergebnisse gezielt löschen, Namen sperren und Sperren wieder aufheben. Die Moderation ist mit dem weiterhin privaten Admin-Code geschützt. Normale Nutzer können weder Ergebnisse löschen noch die interne Sperrliste lesen.
- **Shop und Münzen aus der Benutzeroberfläche entfernt.** Bereits gespeicherte Shop-Daten bleiben erhalten, werden aber nicht mehr angezeigt. Abzeichen und Erfolgsanimationen bleiben.
- **Installierbare Web-App (PWA):** Manifest, App-Icon und Service Worker für zuverlässigeres Öffnen über den Home-Bildschirm. Die PWA speichert keine Supabase-Abfragen im Cache.

## Die vier Aufgabenarten

| Modus | Aufgabe |
| --- | --- |
| Word Order | Wörter in die richtige Reihenfolge setzen |
| Multiple Choice | Den grammatikalisch korrekten Satz auswählen |
| Fill the Gap | Die passende Wortform ergänzen |
| Mixed Mode | Automatischer Wechsel zwischen den drei Modi |

## Rekordbeispiel

| Moment | Run | Persönlicher Rekord |
| --- | ---: | ---: |
| Bestehende Bestleistung | 2.000 XP | 2.000 XP |
| Derselbe Name startet neu | 0 XP | 2.000 XP |
| Neuer Run schafft 1.900 XP | 1.900 XP | 2.000 XP |
| Neuer Run schafft 2.100 XP | 2.100 XP | **2.100 XP** |

**Wichtig:** Ohne Spieleraccounts ist ein Nickname **kein Identitätsnachweis**. Zwei Personen dürfen denselben Namen nutzen und dessen Rekord verbessern. Ein einmal online gespeicherter Bestwert bleibt bei einem schlechteren Run bestehen, kann aber vom Admin bei Namensverstößen entfernt werden.

## Sicherheit und Datenschutz

Die öffentlichen Bestenlisten enthalten nur Nickname, Klassenstufe, gemeldete XP, Fortschritt und Zeitstempel. Gib keine echten Vor- und Nachnamen oder persönlichen Daten als Spitznamen ein. Eine formelle datenschutzrechtliche Prüfung und schulgerechte Datenschutzhinweise müssen vor breiter öffentlicher Nutzung erfolgen.

Der Namensfilter ist **regelbasiert**, kann Varianten übersehen oder harmlose Namen versehentlich ablehnen. Die Sperrliste ist nicht öffentlich einsehbar. Neue Moderationsaktionen erfolgen nur serverseitig. Bereits veröffentlichte problematische Namen werden nicht automatisch gelöscht; der Admin kann sie manuell entfernen.

Es gibt **noch keine serverseitige Überprüfung jeder gelösten Grammatikaufgabe**. Die Online-Rangliste ist daher nicht fälschungssicher. Für schulische Lernmotivation ist das akzeptabel, für einen Wettbewerb mit Preisen wären stärkere Integritätskontrollen nötig.

Beim Offline-Spielen kann nur die integrierte Grundliste geprüft werden; zentral gesperrte Namen werden spätestens bei einem erneuten Online-Upload von der Datenbank abgewiesen. Bei fehlendem Internet werden neue Scores nicht sofort online gespeichert.

## Bestehende Daten erhalten

- Kein altes Online-Ergebnis wurde während der Migration gelöscht.
- Die lokale Speicherstruktur `grammar-quest-v2` für Rekorde und `grammar-quest-v5-extras` für bereits erworbene Elemente bleibt kompatibel.
- Der Moduspräferenz-Schlüssel `grammar-quest-v5-mode` bleibt bestehen.
- Alte Runs werden bei neuer Namenseingabe nicht fortgesetzt; jeder neue Run beginnt bewusst bei 0 XP und 5 Leben.
- Ein neuer Run verändert keine alte persönliche Bestleistung.

## Technik

Das Spiel besteht weiter aus HTML/CSS/JavaScript auf GitHub Pages und einer Supabase-PostgreSQL-Datenbank für die gemeinsame Rangliste. Die Kern-Dateien von Version 5/6 bleiben erhalten. Neu hinzugefügt wurden:

- `v7.css` und `v7-ui.js` für die Touch-App-Oberfläche
- `v7-admin.js` für das geschützte Moderationsmenü
- `manifest.webmanifest`, `app-icon.svg`, `sw.js` für die installierbare Web-App
- `migrations/grammar_quest_v7_moderation.sql` für den serverseitigen Namensfilter, die Sperrliste und das Admin-Protokoll
- `migrations/grammar_quest_v7_security_hardening.sql` für gesperrte öffentliche Zugriffsrechte
- Aktualisierte Supabase Edge Function `supabase/functions/grammar-admin-score/index.ts`

### Bestehendes Supabase-Projekt aktualisieren

Die beiden V7-Migrationen in der genannten Reihenfolge ausführen. Anschließend die aktualisierte `grammar-admin-score`-Edge-Function mit `verify_jwt = false` deployen. Sie prüft den privaten Admin-Code selbst und stellt die öffentliche, nur lesende Namensprüfung bereit. Keine Secrets in `config.js` oder das GitHub-Repository eintragen.

Das bestehende `grammar_best_scores`-View bleibt die maßgebliche, mit RLS geschützte **Bestleistungen-Rangliste**. Die Nutzer müssen dafür keine Konten erstellen.

### Lokal starten

Repository als ZIP herunterladen und alle Dateien in einem Verzeichnis belassen. `index.html` öffnen. Für Online-Funktionen benötigt die Browser-App eine Supabase-Konfiguration; GitHub Pages nutzt die öffentliche `config.js`.

---

**Grammar Quest 7 — Learn. Play. Beat your best.**

## Protected owner account (Grammar Quest 7.1)

- **Fabian** is a password-protected nickname, checked without regard to capitalization or ordinary separators. No student signup or personal account system has been added.
- Enter **Fabian** at the start screen; the password field appears. After verifying with the server, the normal grade/mode selection starts a **fresh run with 0 XP and 5 lives**.
- The verified owner immediately sees an **Admin** tab alongside Home, Levels and Ranking. This opens the existing administrator panel, including protected moderation actions, without requiring the older separate admin passphrase.
- Switching players removes Admin access immediately, and refreshing the page requires another password. The password is kept **in memory only** while the owner is signed in, not written to localStorage or committed to GitHub.
- The owner's score submissions are routed through the password-verified Supabase Edge Function; anonymous direct leaderboard uploads with a normalized Fabian nickname are blocked by restrictive row-level security. Existing scores remain unchanged.
- The password is stored **only as a bcrypt hash** inside the private Supabase table `grammar_owner_credentials`. The hash is deliberately not part of migration files or repository source.
- Wrong password attempts are rate-limited per hashed request origin. The original separate Admin passphrase remains a backup and continues to work for the private Admin console.
- Schema migration files: `migrations/grammar_quest_v71_owner_login.sql` and `migrations/grammar_quest_v71_owner_hardening.sql`. Update the existing `grammar-admin-score` Edge Function with `verify_jwt=false` because it performs its own password verification.

**Security note:** The chosen owner password was supplied in chat and is easier to guess than a strong random password. Replace it with a longer, unique password before sharing the game with many players. There is no password reset via the public app in this version.
