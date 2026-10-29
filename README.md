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

**Hinweis zur Fairness:** Eine öffentlich zugängliche Datenbank für Punktmeldungen ist ohne serverseitige Spielprüfung nicht vollständig gegen manipulierte Ergebnisse geschützt. Der integrierte Admin-/Testmodus ist **keine sichere Zugangskontrolle**; sein Code ist in der öffentlich einsehbaren Website enthalten. Admin-unterstützte Spielstände sollen nicht automatisch online übertragen werden, aber dies ersetzt keine serverseitige Anti-Cheat-Prüfung.

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
3. Lege in Supabase ein Projekt an und führe `supabase-leaderboard.sql` im **SQL Editor** aus.
4. Trage in `config.js` die **Projekt-URL** und ausschließlich den **Publishable Key** ein.
5. Veröffentliche deine Änderungen und teste die Online-Rangliste mit zwei verschiedenen Browsern oder Geräten.

**Sicherheit:** `service_role`-, Secret- und Datenbankpasswörter gehören **niemals** in GitHub, `config.js` oder andere öffentlich ausgelieferte Dateien. Die Supabase-Tabelle verwendet Row Level Security (RLS) und passende Zugriffsrechte; für einen ernsthaften Wettbewerb empfiehlt sich zusätzlich eine serverseitige Punkteprüfung und Spam-Begrenzung.

---

**Grammar Quest** – Learn. Play. Level up.
