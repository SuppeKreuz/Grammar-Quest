> **Grammar Quest 5.0** – mit Level-Karte, Shop, Abzeichen, neuen Aufgabenarten, Online-Rangliste und einem serverseitig geschützten privaten Admin-Zugang.

## Neu in Grammar Quest 5.0

- **Interaktive Level-Karte:** 20 anklickbare Stationen pro Klasse, unterteilt in Easy, Medium und Hard, mit gesperrten und abgeschlossenen Levels.
- **Drei Aufgabentypen:** Word Order, Multiple Choice und Fill the Gap. Du kannst zwischen den drei Modi oder einem gemischten Modus wechseln; die bisherigen Satzinhalte bleiben erhalten.
- **Deutschsprachige Fehlererklärungen:** Nach falschen Antworten erscheint eine Grammatik-Erklärung; sie ist auch manuell abrufbar.
- **Münzen und Shop:** Für neue, regulär abgeschlossene Levels und Stufen erhältst du Münzen. Damit lassen sich Maskottchen/Avatare und Spielertitel kaufen und ausrüsten.
- **Achievements:** Acht sammelbare Abzeichen, u. a. für Serien, abgeschlossene Pfade und Shop-Käufe.
- **Rangliste 2.0:** Podium, eigene Platzierung, Klassenfilter, Lokal/Online und ein optionaler Filter für die letzten sieben Tage.
- **Kontrastschutz im Design-Studio:** Unsichtbare Farbkombinationen werden beim Anzeigen automatisch korrigiert; zusätzlich gibt es den jederzeit erreichbaren Button "Restore Ocean Splash".

### Kompatibilität und Datenschutz

- **Vorhandene Spielstände bleiben unangetastet.** Die v4-Daten bleiben unter dem bisherigen Local-Storage-Schlüssel `grammar-quest-v2`. Die neuen Extras werden separat unter `grammar-quest-v5-extras` gespeichert.
- Vorhandener Spielfortschritt wird bei der ersten Nutzung für Münzen/Abzeichen berücksichtigt. Wiederholtes Absolvieren bereits gutgeschriebener Levels gibt nicht erneut Münzen.
- Shop, Münzen, Avatare und Erfolge werden **nur im jeweiligen Browser** gespeichert und **nicht geräteübergreifend synchronisiert**.
- Das bestehende Supabase-Online-Leaderboard behält seine Tabellenstruktur; für dieses Update sind **keine Datenbankänderungen nötig**.
- **Privater Admin-Code:** Die GitHub-Pages-Website enthält weder den Admin-Code noch seinen Hash. Eine Supabase Edge Function prüft ihn anhand eines nur für den Server lesbaren, gesalzenen Prüfwerts in PostgreSQL. Der vorher öffentlich sichtbare Code wurde ersetzt.

### Version 5.0 lokal testen

1. Im Repository unter **Code → Download ZIP** die Dateien herunterladen.
2. Das ZIP entpacken und die `index.html` öffnen. Die zusätzlichen Dateien `v5.css`, `v5-design.js`, `v5-game.js`, `v5-hub.js` und `v5-weekly.js` müssen im selben Verzeichnis bleiben.
3. Einen Spielernamen anlegen oder einen bestehenden Namen eingeben; dann einen Jahrgang und eine Schwierigkeit auswählen.
4. Map, Shop, Badges, alternative Aufgaben, Fehlererklärungen und alle Designfarben ausprobieren.
5. Die Online-Version unter https://suppekreuz.github.io/Grammar-Quest/ öffnen und den eigenen Fortschritt mit einem Spitznamen fortsetzen.

---

# Grammar Quest

**Englische Grammatik lernen – spielerisch und gemeinsam.**

Grammar Quest ist ein kostenloses Lernspiel für die **8., 9. und 10. Klasse**. Statt trockener Arbeitsblätter setzt du englische Wörter in die richtige Reihenfolge, sammelst Punkte und schaltest immer schwierigere Aufgaben frei.

**[🎮 Jetzt Grammar Quest spielen](https://suppekreuz.github.io/Grammar-Quest/)**

## So funktioniert das Spiel

1. **Spielernamen eingeben:** Nutze am besten einen Spitznamen.
2. **Jahrgang auswählen:** Klasse 8, 9 oder 10.
3. **Lernpfad starten:** Arbeite dich von **Easy** über **Medium** bis **Hard** vor. Die nächste Schwierigkeit wird erst nach Abschluss der vorherigen Stufe freigeschaltet.
4. **Sätze bilden:** Klicke die durcheinandergewürfelten Wörter in der richtigen Reihenfolge an.
5. **Punkte sammeln:** Jede richtige Antwort bringt Punkte. Fehler kosten Leben.

Jede Klassenstufe enthält **20 Aufgaben**:

| Schwierigkeitsstufe | Aufgaben | Freischaltung |
| --- | ---: | --- |
| Easy | 6 | Sofort spielbar |
| Medium | 7 | Nach Easy |
| Hard | 7 | Nach Medium |

## Lerninhalte

- **Klasse 8:** Unter anderem Simple Present, Present Progressive, Simple Past und Going-to Future.
- **Klasse 9:** Unter anderem Present Perfect, Modalverben, Fragen und komplexere Satzstrukturen.
- **Klasse 10:** Unter anderem Past Perfect, Passiv, indirekte Rede, Relativsätze und Conditionals.

Die Spieloberfläche ist auf Englisch. **Grammatikregeln und Lerntipps sind auf Deutsch**, damit sich schwierige Regeln leichter verstehen lassen.

## Funktionen

- Drei Klassenstufen mit aufeinander aufbauenden Lernpfaden
- Punkte, Leben, Erfolgsserien, Fortschrittsanzeige und Animationen
- **Lokale Rangliste** für Spielstände im selben Browser
- **Online-Rangliste** über Supabase für Ergebnisse auf verschiedenen Geräten
- Anpassbares Design mit **Ocean Splash als Standard**, weiteren Farbvorlagen und eigenem Design-Editor
- Einstellungen für Animationen und Sound
- Responsive Oberfläche für Smartphone, Tablet und Computer
- Automatische Speicherung von Fortschritt und Design im jeweiligen Browser

## Rangliste und Datenschutz

In der Online-Rangliste werden **Spielername, Klassenstufe, Punkte und Spielfortschritt** gespeichert und öffentlich angezeigt. Verwende deshalb bitte **einen Spitznamen, nicht deinen echten Namen**. Der lokale Spielstand und die Designauswahl werden im Browser gespeichert.

**Hinweis zur Fairness:** Admin-Punkte werden weiterhin in derselben Online-Rangliste wie normale Punkte angezeigt. Der Admin-Zugang wird inzwischen **serverseitig anhand eines privaten Geheimnisses** geprüft; der alte, öffentlich bekannt gewordene Code funktioniert nicht mehr. Normale Spieler können die Admin-Prüftabelle nicht auslesen und keine Admin-Punkte über die öffentliche Datenbank-API hochladen. Die regulären Punktmeldungen sind ohne zusätzliche Spielprüfung weiterhin nicht vollständig fälschungssicher.


### Privater Admin-Zugang

Der Admin-Modus öffnet sich weiterhin über die bisherige Tastenkombination oder die Logo-Geste, aber die Freischaltung erfordert einen **privaten, zufällig erzeugten Code**. Die Seite sendet die Eingabe über HTTPS an die Supabase-Edge-Function mit `action: "verify"`. Erst nach erfolgreicher Serverantwort werden Admin-Werkzeuge aktiviert. Der Code wird nur für die aktuelle Sitzung im Arbeitsspeicher des Browsers gehalten und **nicht** in `localStorage` oder im GitHub-Repository abgelegt.

Die Supabase-Tabelle `grammar_admin_config` enthält nur Salt und Passwortprüfwert. Row Level Security und entzogene Lese-Rechte verhindern Zugriffe für Besucher. Bitte nicht die private SQL-Anweisung mit dem echten Prüfwert in dieses Repository committen. **Ein öffentlich gewordener alter Admin-Code muss immer durch einen neuen ersetzt werden**; das bloße Löschen aus der aktuellen HTML-Datei genügt wegen der Git-Historie nicht.

## Technik

Das Spiel läuft mit **HTML, CSS und JavaScript** direkt im Browser. Es benötigt für das eigentliche Spielen keinen eigenen Server.

| Bestandteil | Dienst |
| --- | --- |
| Website und Hosting | GitHub Pages |
| Datenbank für gemeinsame Ergebnisse | Supabase (PostgreSQL) |
| Lokale Spielstände und Designwahl | Browser-Local-Storage |

### Lokal starten

Lade das Repository herunter und öffne `index.html` in einem Browser. Das Spiel selbst funktioniert auch ohne Supabase; eine gemeinsame Online-Rangliste braucht jedoch die konfigurierte Datenbank.

### Selbst veröffentlichen

1. Erstelle ein GitHub-Repository mit den Dateien aus diesem Projekt.
2. Aktiviere unter **Settings → Pages** die Veröffentlichung von `main` und `/(root)`.
3. Lege in Supabase ein Projekt an und führe `supabase-leaderboard.sql` im **SQL Editor** aus. Für bestehende Datenbanken steht `supabase-admin-scores-migration.sql` bereit. Erstelle außerdem die private Admin-Prüftabelle nach `migrations/private_admin_verifier.sql` und hinterlege dort **ausschließlich** einen zufällig gesalzenen SHA-256-Prüfwert – niemals den Admin-Code im öffentlichen Repo. Deploye anschließend die Edge Function aus `supabase/functions/grammar-admin-score/index.ts` mit `verify_jwt = false`; sie prüft den Code serverseitig.
4. Trage in `config.js` die **Projekt-URL** und ausschließlich den **Publishable Key** ein.
5. Veröffentliche deine Änderungen und teste die Online-Rangliste mit zwei verschiedenen Browsern oder Geräten.

**Sicherheit:** `service_role`-, Secret- und Datenbankpasswörter gehören **niemals** in GitHub, `config.js` oder andere öffentlich ausgelieferte Dateien. Die Supabase-Tabelle verwendet Row Level Security (RLS) und passende Zugriffsrechte; für einen ernsthaften Wettbewerb empfiehlt sich zusätzlich eine serverseitige Punkteprüfung und Spam-Begrenzung.

---

**Grammar Quest** – Learn. Play. Level up.
