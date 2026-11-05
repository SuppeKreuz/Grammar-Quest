# Grammar Quest 6.0

**Englische Grammatik lernen, Punkte sammeln und deinen persönlichen Rekord knacken – ohne festes letztes Level.**

**[Grammar Quest spielen](https://suppekreuz.github.io/Grammar-Quest/)**

Grammar Quest ist ein kostenloses Browser-Lernspiel für die **Klassen 8 bis 10**. Es läuft auf Desktop, Tablet und Smartphone.

## Neu in Version 6.0: Endless Challenge

Die ersten **20 Level pro Klassenstufe** bleiben vollständig erhalten. Danach öffnet sich die **Endless Challenge**: Ab Level 21 werden auf Grundlage der Klassenstufe und des erreichten Levels weitere Grammatikaufgaben erzeugt. Der Satzgenerator kombiniert verschiedene Aufgabenmuster und Begriffe, die Themen werden zunehmend anspruchsvoll. Es gibt kein festes letztes Level und kein Limit von 2.000 XP mehr.

**Die Bestenliste zeigt deinen persönlichen Rekord (Personal Best), nicht die Summe aller Durchläufe.**

Beispiel:

| Was du machst | Aktuelle Runde | Persönlicher Rekord |
| --- | ---: | ---: |
| Erster Durchlauf bis Level 20 | 2.000 XP | 2.000 XP |
| Neue Runde starten | 0 XP | 2.000 XP |
| Zweiter Durchlauf bis Level 10 | 1.000 XP | 2.000 XP |
| Zweiter Durchlauf bis Level 21 | 2.100 XP | **2.100 XP** |

Über **New run · keep best** kann man jederzeit mit 0 Punkten von vorn beginnen. Der alte Rekord bleibt sowohl in den lokalen gespeicherten Ergebnissen als auch in der Online-Bestenliste erhalten. Die öffentliche Bestenliste liest dafür eine spezielle Datenbankansicht aus, die für jeden Nicknamen und jede Klassenstufe nur dessen **höchsten jemals gemeldeten Wert** auswählt. Ein niedrigeres späteres Ergebnis überschreibt diesen Wert nicht. Auch der Admin-Modus kann die lokale Bestenliste nicht mehr über einen Löschknopf zurücksetzen.

**Hinweis:** Der lokale Rekord ist nur so dauerhaft wie die Browserdaten; bei gelöschten Browserdaten kann er lokal verschwinden. Bereits erfolgreich online gespeicherte Rekorde bleiben in der Supabase-Datenbank bestehen. Spielernamen sind derzeit nicht per Benutzerkonto geschützt – benutze daher einen Spitznamen.

### Spielprinzip

1. **Spielername:** Nicknamen eingeben und Klasse 8, 9 oder 10 wählen.
2. **Klassischer Lernpfad:** Easy (6 Aufgaben), Medium (7 Aufgaben), Hard (7 Aufgaben).
3. **Endlos-Modus:** Ab Level 21 immer neue, mit höherem Fortschritt anspruchsvollere Aufgaben.
4. **Drei Aufgabentypen:** Word Order, Multiple Choice und Fill the Gap, einzeln oder gemischt auswählbar.
5. **Deutsche Fehlererklärungen:** Bei falschen Antworten lassen sich passende Grammatik-Tipps anzeigen.
6. **Runden und Rekorde:** Jede richtige Antwort bringt 100 XP. Wenn die Leben ausgehen oder du bewusst neu startest, beginnt der aktuelle Punktestand wieder bei 0; nur ein neuer Bestwert verbessert die Bestenliste.

### Weitere Funktionen

- Interaktive Level-Karte mit den 20 Anfangsleveln und einem dynamischen Ausschnitt der Endlos-Aufgaben
- Münzen, Kosmetik-Shop, Avatare, Titel und Erfolge
- Keine doppelten Shop-Münzen für bereits gutgeschriebene Levels beim Wiederholen
- Lokale und Online-Bestenliste mit Podium und Klassenfiltern
- Zusätzliche Wochenansicht für Scores der letzten sieben Tage
- Anpassbares Design-Studio mit Lesbarkeitsschutz und **Ocean Splash** als Standard
- Optionale Soundeffekte und Animationen, responsives Layout
- Automatisch gespeicherte Fortschritte, Ausrüstung und Designwahl im Browser

## Kompatibilität

- **Bestehende Spielstände bleiben erhalten.** Die alten Speicherbereiche `grammar-quest-v2` (Spielstände und Rekorde) und `grammar-quest-v5-extras` (Shop und Erfolge) bleiben bestehen.
- Ein bereits abgeschlossenes Level 20 geht beim Fortsetzen in Level 21 über, ohne die bisherigen Punkte zu verlieren.
- Ein neuer Durchlauf setzt **nur die aktuelle Runde**, niemals den lokalen Rekordeintrag zurück.
- Frühere Online-Ergebnisse werden nicht gelöscht. Das Datenbank-Update erweitert vorhandene Zahlenfelder und fügt eine Ansicht für persönliche Rekorde hinzu.
- Shop-Käufe und Münzen sind weiterhin **nur lokal** auf dem jeweiligen Gerät vorhanden und werden nicht online synchronisiert.
- Admin-Punkte können unverändert in der **gleichen öffentlichen Rangliste** erscheinen; ein privater Admin-Code wird nur serverseitig geprüft.

## Technik

| Bereich | Technologie |
| --- | --- |
| Spiel | HTML, CSS, JavaScript |
| Hosting | GitHub Pages |
| Shared Leaderboard | Supabase (PostgreSQL) |
| Admin-Prüfung | Supabase Edge Function mit privatem, RLS-geschütztem Prüfwert |
| Lokaler Fortschritt | Browser-Local-Storage |
| Endlos-Aufgaben | `v6-endless.js` – reproduzierbarer Generator aus Jahrgang und Levelindex |

### Lokal testen

1. Das GitHub-Repository als ZIP herunterladen und entpacken.
2. `index.html` im Browser öffnen. Alle `v5-*.js`-, `v5.css`- und `v6-endless.js`-Dateien müssen im selben Verzeichnis liegen.
3. Einen Testnamen und eine Klasse wählen und Aufgaben lösen; für einen schnellen Funktionstest im Browser-Entwicklerwerkzeug kann ein Teststand verwendet werden.
4. Ab Level 21 erscheinen dynamisch generierte Aufgaben. Bei einem neuen Durchlauf startet der Run bei 0, der Rekord bleibt erhalten.

### In Supabase einrichten

**Neues Projekt:** `supabase-leaderboard.sql` im SQL Editor ausführen. Der Online-Admin-Modus benötigt zusätzlich die Edge Function unter `supabase/functions/grammar-admin-score/` sowie die private Passwort-Prüftabelle aus `migrations/private_admin_verifier.sql`. Der echte Admin-Code und sein Hash dürfen **niemals** ins Repository.

**Bestehendes Projekt:** Die Migration `migrations/endless_personal_best.sql` anwenden. Sie erweitert die Score-/Level-/Streak-Felder auf `bigint`, lockert die 2.000-XP-Beschränkung für reguläre Punkte und erstellt die `grammar_best_scores`-Ansicht. Danach die aktualisierte Admin-Edge-Function bereitstellen. Bereits gespeicherte Datensätze bleiben erhalten.

Trage anschließend die Supabase-Projekt-URL und **ausschließlich den Publishable Key** in `config.js` ein. Niemals einen Secret- oder `service_role`-Schlüssel im Browser verwenden.

### Fairness und Datenschutz

Die öffentliche Bestenliste speichert Spitznamen, Klassenstufe, gemeldete Punkte, Fortschritt und Zeitstempel. Jeder mit demselben Nicknamen kann bisher Scores unter diesem Namen einreichen; echte Konten und eine serverseitige Prüfung gelöster Aufgaben sind noch nicht eingebaut. Die Rangliste ist daher als Lernwettbewerb gedacht, **nicht** als fälschungssicherer Wettkampf. Der Admin-Zugangscode wird zwar privat auf dem Server geprüft, die Browser-Spieloberfläche lässt sich technisch weiterhin manipulieren.

---

**Grammar Quest — Learn. Play. Beat your best.**
