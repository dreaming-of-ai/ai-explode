# Privacy Policy / Datenschutzerklärung

## Language Notice

This privacy policy (Datenschutzerklärung) is provided in German only, as required
by the EU General Data Protection Regulation (GDPR). Article 12 GDPR stipulates
that information about data processing must be provided in clear and plain language
accessible to the intended audience. Since this service is hosted in Germany and
subject to German data protection law, this privacy policy is provided in German
to ensure full legal compliance.

---

## Datenschutzerklärung

### 1. Verantwortlicher

<!-- TODO: Ersetzen Sie die Platzhalter durch Ihre tatsächlichen Daten -->

Verantwortlicher im Sinne der Datenschutz-Grundverordnung (DSGVO) und anderer
datenschutzrechtlicher Bestimmungen ist:

**{{VORNAME NACHNAME}}**
{{Straße Hausnummer}}
{{PLZ Ort}}
Deutschland

E-Mail: {{ihre-email@example.com}}

---

### 2. Allgemeines zur Datenverarbeitung

Wir verarbeiten personenbezogene Daten unserer Nutzer grundsätzlich nur, soweit
dies zur Bereitstellung einer funktionsfähigen Anwendung sowie unserer Inhalte und
Leistungen erforderlich ist. Die Verarbeitung personenbezogener Daten erfolgt
regelmäßig nur nach Einwilligung des Nutzers oder in Fällen, in denen eine
vorherige Einholung einer Einwilligung aus tatsächlichen Gründen nicht möglich ist
und die Verarbeitung durch gesetzliche Vorschriften gestattet ist.

---

### 3. Bereitstellung der Anwendung und Server-Logfiles

#### 3.1 Beschreibung und Umfang der Datenverarbeitung

Bei jedem Aufruf unserer Anwendung erfasst unser System automatisiert Daten und
Informationen des zugreifenden Rechners. Folgende Daten werden hierbei erhoben:

- IP-Adresse des anfragenden Rechners
- Datum und Uhrzeit des Zugriffs
- Aufgerufene URL bzw. Ressource
- Übertragene Datenmenge
- Meldung über erfolgreichen Abruf (HTTP-Statuscode)
- Browsertyp und verwendete Version
- Betriebssystem des Nutzers
- Referrer-URL (zuvor besuchte Seite)

#### 3.2 Rechtsgrundlage

Rechtsgrundlage für die vorübergehende Speicherung der Daten und der Logfiles ist
Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse). Unser berechtigtes Interesse
liegt in der Sicherstellung eines störungsfreien Betriebs sowie in der Erkennung
und Abwehr von Angriffen.

#### 3.3 Speicherdauer

Die Logfiles werden nach spätestens {{14 Tagen / 30 Tagen}} automatisch gelöscht,
sofern keine weitergehende Aufbewahrung zu Beweiszwecken erforderlich ist.

---

### 4. Cookies

#### 4.1 Beschreibung und Umfang der Datenverarbeitung

Unsere Anwendung verwendet Cookies. Dabei handelt es sich um kleine Textdateien,
die im Browser des Nutzers gespeichert werden. Wir setzen folgende Arten von
Cookies ein:

**Technisch notwendige Cookies (Session-Cookies)**
Diese Cookies sind für den Betrieb der Anwendung zwingend erforderlich. Sie
ermöglichen grundlegende Funktionen wie die Zuordnung einer Spielsitzung und
werden nach Ende der Browser-Sitzung automatisch gelöscht.

**Funktionale Cookies (Präferenz-Cookies)**
Diese Cookies speichern vom Nutzer gewählte Einstellungen (z. B. bevorzugte
Spieloptionen) und verbessern so die Nutzungserfahrung. Sie werden für maximal
{{XX Tage}} gespeichert.

#### 4.2 Rechtsgrundlage

Für technisch notwendige Cookies ist die Rechtsgrundlage Art. 6 Abs. 1 lit. f
DSGVO (berechtigtes Interesse an der Bereitstellung einer funktionsfähigen
Anwendung). Für funktionale Cookies, die nicht streng notwendig sind, holen wir
eine Einwilligung gemäß Art. 6 Abs. 1 lit. a DSGVO i. V. m. § 25 Abs. 1 TDDDG
ein.

#### 4.3 Widerspruch und Beseitigung

Nutzer können die Speicherung von Cookies durch eine entsprechende Einstellung
ihrer Browser-Software verhindern. Bereits gespeicherte Cookies können jederzeit
gelöscht werden. Wir weisen darauf hin, dass in diesem Fall möglicherweise nicht
alle Funktionen der Anwendung vollumfänglich genutzt werden können.

---

### 5. Webanalyse

#### 5.1 Beschreibung und Umfang der Datenverarbeitung

<!-- TODO: Konkreten Analytics-Dienst eintragen (z. B. Matomo, Plausible) -->

Wir setzen {{ANALYTICS-TOOL}} ein, um die Nutzung unserer Anwendung statistisch
auszuwerten und zu verbessern. {{ANALYTICS-TOOL}} wird auf unseren eigenen Servern
betrieben (Self-Hosting), sodass keine Daten an Dritte übermittelt werden.

Dabei werden folgende Daten verarbeitet:

- Gekürzte bzw. anonymisierte IP-Adresse
- Aufgerufene Seiten und Zeitpunkt des Aufrufs
- Verweildauer
- Verwendeter Browser und Betriebssystem
- Herkunftsseite (Referrer)

#### 5.2 Rechtsgrundlage

Sofern {{ANALYTICS-TOOL}} so konfiguriert ist, dass keine Einwilligung
erforderlich ist (z. B. durch vollständige IP-Anonymisierung und Verzicht auf
Tracking-Cookies), ist die Rechtsgrundlage Art. 6 Abs. 1 lit. f DSGVO
(berechtigtes Interesse an der statistischen Analyse zur Verbesserung des
Angebots).

Andernfalls erfolgt die Verarbeitung auf Grundlage einer Einwilligung gemäß
Art. 6 Abs. 1 lit. a DSGVO i. V. m. § 25 Abs. 1 TDDDG.

#### 5.3 Widerspruch

<!-- TODO: Opt-Out-Mechanismus beschreiben, z. B. Matomo Opt-Out-iFrame -->

Nutzer können der Erfassung durch {{ANALYTICS-TOOL}} jederzeit widersprechen.
{{Beschreibung des Opt-Out-Mechanismus}}.

---

### 6. WebSocket-Verbindungen (Mehrspieler-Funktionalität)

#### 6.1 Beschreibung und Umfang der Datenverarbeitung

Für die Mehrspieler-Funktionalität nutzt unsere Anwendung WebSocket-Verbindungen.
WebSockets ermöglichen eine persistente, bidirektionale Kommunikation zwischen dem
Browser des Nutzers und unserem Server. Dabei werden folgende Daten verarbeitet:

- IP-Adresse des Nutzers (für den Verbindungsaufbau)
- Spielzüge und spielbezogene Aktionen
- Vom Nutzer gewählter Anzeigename (sofern angegeben)
- Verbindungszeitpunkte und Sitzungsdauer

Es ist keine Registrierung oder Anmeldung erforderlich. Ein ggf. vom Nutzer
eingegebener Anzeigename wird nur für die Dauer der Spielsitzung verwendet und
nicht dauerhaft gespeichert.

#### 6.2 Rechtsgrundlage

Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung), da die
Datenverarbeitung für die Bereitstellung der vom Nutzer angeforderten
Mehrspieler-Funktionalität erforderlich ist, sowie Art. 6 Abs. 1 lit. f DSGVO
(berechtigtes Interesse an der technischen Bereitstellung des Spiels).

#### 6.3 Speicherdauer

Die im Rahmen der WebSocket-Verbindung verarbeiteten Daten werden nur für die
Dauer der aktiven Spielsitzung vorgehalten. Nach Beendigung der Verbindung werden
die spielbezogenen Daten gelöscht, sofern sie nicht in den unter Abschnitt 3
beschriebenen Server-Logfiles erfasst sind.

---

### 7. Kontaktaufnahme

#### 7.1 Beschreibung und Umfang der Datenverarbeitung

Auf unserer Anwendung ist ein Kontaktformular vorhanden, welches für die
elektronische Kontaktaufnahme genutzt werden kann. Nimmt ein Nutzer diese
Möglichkeit wahr, so werden die im Kontaktformular eingegebenen Daten an uns
übermittelt und gespeichert. Diese Daten umfassen in der Regel:

- Name (sofern angegeben)
- E-Mail-Adresse
- Inhalt der Nachricht
- Zeitpunkt der Absendung

Alternativ ist eine Kontaktaufnahme über die bereitgestellte E-Mail-Adresse
möglich. In diesem Fall werden die mit der E-Mail übermittelten personenbezogenen
Daten gespeichert.

#### 7.2 Rechtsgrundlage

Rechtsgrundlage für die Verarbeitung der Daten ist Art. 6 Abs. 1 lit. f DSGVO
(berechtigtes Interesse an der Beantwortung von Anfragen). Zielt der Kontakt auf
den Abschluss eines Vertrages ab, so ist zusätzliche Rechtsgrundlage Art. 6
Abs. 1 lit. b DSGVO.

#### 7.3 Speicherdauer

Die Daten werden gelöscht, sobald sie für die Erreichung des Zweckes ihrer
Erhebung nicht mehr erforderlich sind. Für personenbezogene Daten aus
Kontaktanfragen ist dies der Fall, wenn die jeweilige Konversation beendet ist
und keine gesetzlichen Aufbewahrungsfristen entgegenstehen.

---

### 8. Keine Datenübermittlung an Dritte

Alle in dieser Datenschutzerklärung beschriebenen Datenverarbeitungen finden
ausschließlich auf unseren eigenen Servern in Deutschland statt. Eine Übermittlung
personenbezogener Daten an Dritte oder in Drittländer findet nicht statt, es sei
denn, wir sind gesetzlich dazu verpflichtet.

---

### 9. Rechte der betroffenen Person

Ihnen stehen als betroffene Person folgende Rechte gegenüber dem Verantwortlichen zu:

**Recht auf Auskunft (Art. 15 DSGVO)**
Sie haben das Recht, Auskunft über die von uns zu Ihrer Person gespeicherten
personenbezogenen Daten zu verlangen.

**Recht auf Berichtigung (Art. 16 DSGVO)**
Sie haben das Recht, die Berichtigung unrichtiger oder die Vervollständigung
Ihrer bei uns gespeicherten personenbezogenen Daten zu verlangen.

**Recht auf Löschung (Art. 17 DSGVO)**
Sie haben das Recht, die Löschung Ihrer bei uns gespeicherten personenbezogenen
Daten zu verlangen, soweit nicht die Verarbeitung zur Ausübung des Rechts auf
freie Meinungsäußerung und Information, zur Erfüllung einer rechtlichen
Verpflichtung oder aus Gründen des öffentlichen Interesses erforderlich ist.

**Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)**
Sie haben das Recht, die Einschränkung der Verarbeitung Ihrer personenbezogenen
Daten zu verlangen.

**Recht auf Datenübertragbarkeit (Art. 20 DSGVO)**
Sie haben das Recht, Ihre personenbezogenen Daten in einem strukturierten,
gängigen und maschinenlesbaren Format zu erhalten oder die Übermittlung an einen
anderen Verantwortlichen zu verlangen.

**Recht auf Widerspruch (Art. 21 DSGVO)**
Sofern Ihre personenbezogenen Daten auf Grundlage von berechtigten Interessen
gemäß Art. 6 Abs. 1 lit. f DSGVO verarbeitet werden, haben Sie das Recht, gemäß
Art. 21 DSGVO Widerspruch gegen die Verarbeitung einzulegen, sofern dafür Gründe
vorliegen, die sich aus Ihrer besonderen Situation ergeben.

**Recht auf Widerruf erteilter Einwilligungen (Art. 7 Abs. 3 DSGVO)**
Sie haben das Recht, eine einmal erteilte Einwilligung jederzeit mit Wirkung für
die Zukunft zu widerrufen. Die Rechtmäßigkeit der aufgrund der Einwilligung bis
zum Widerruf erfolgten Verarbeitung wird dadurch nicht berührt.

**Recht auf Beschwerde bei einer Aufsichtsbehörde (Art. 77 DSGVO)**
Unbeschadet eines anderweitigen verwaltungsrechtlichen oder gerichtlichen
Rechtsbehelfs haben Sie das Recht, sich bei einer Datenschutz-Aufsichtsbehörde
zu beschweren. Die für den Verantwortlichen zuständige Aufsichtsbehörde ist:

<!-- TODO: Zuständige Aufsichtsbehörde eintragen -->

{{Landesbeauftragte/r für Datenschutz und Informationsfreiheit}}
{{Bundesland}}
{{Adresse}}
{{Website}}

---

### 10. Aktualität und Änderung dieser Datenschutzerklärung

Diese Datenschutzerklärung hat den Stand {{Monat Jahr}}. Aufgrund der
Weiterentwicklung unserer Anwendung oder aufgrund geänderter gesetzlicher bzw.
behördlicher Vorgaben kann es notwendig werden, diese Datenschutzerklärung
anzupassen. Die jeweils aktuelle Fassung ist stets unter dem Menüpunkt
„Datenschutz" innerhalb der Anwendung abrufbar.
