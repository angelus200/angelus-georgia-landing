import { Link } from "wouter";

export default function AGB() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border py-6 sticky top-0 z-10">
        <div className="container flex items-center justify-between">
          <Link href="/">
            <a>
              <img
                src="/images/angelus-logo.png"
                alt="Angelus Management Georgia"
                className="h-12 w-auto object-contain"
              />
            </a>
          </Link>
          <Link href="/">
            <a className="text-sm text-gold hover:underline">← Zurück zur Startseite</a>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="container py-12 max-w-4xl">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-bold text-foreground mb-8">
            Allgemeine Geschäftsbedingungen (AGB)
          </h1>

          <section className="space-y-6 text-foreground">
            <div>
              <h2 className="text-2xl font-semibold mb-4">1. Geltungsbereich</h2>
              <p className="text-muted-foreground leading-relaxed">
                Diese Allgemeinen Geschäftsbedingungen (nachfolgend „AGB") gelten für alle Verträge zwischen 
                ANGELUS MANAGEMENT GEORGIA LLC (nachfolgend „Angelus Management" oder „wir") und dem Kunden 
                (nachfolgend „Kunde" oder „Sie") über die Erbringung von Beratungsdienstleistungen im Bereich 
                Immobilieninvestitionen in Georgien, Property Management sowie Due Diligence-Prüfungen.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-3">
                Abweichende, entgegenstehende oder ergänzende Allgemeine Geschäftsbedingungen des Kunden werden 
                nur dann und insoweit Vertragsbestandteil, als wir ihrer Geltung ausdrücklich schriftlich 
                zugestimmt haben.
              </p>
            </div>

            <div className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">2. Vertragsgegenstand und Leistungsumfang</h2>
              
              <h3 className="text-xl font-semibold mb-3 mt-6">2.1 Beratungsdienstleistungen</h3>
              <p className="text-muted-foreground leading-relaxed">
                Angelus Management bietet folgende Dienstleistungen an:
              </p>
              <ul className="list-disc pl-6 mt-3 space-y-2 text-muted-foreground">
                <li>Beratung bei Immobilieninvestitionen in Georgien</li>
                <li>Vermittlung von Immobilienobjekten</li>
                <li>Due Diligence-Prüfungen von Immobilien und Projekten</li>
                <li>Property Management und Mietverwaltung</li>
                <li>Unterstützung bei rechtlichen und steuerlichen Fragen</li>
                <li>Marktanalysen und Investitionsstrategien</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">2.2 Leistungserbringung</h3>
              <p className="text-muted-foreground leading-relaxed">
                Der konkrete Leistungsumfang wird in einem individuellen Beratungsvertrag oder Angebot 
                festgelegt. Die Leistungen werden nach bestem Wissen und Gewissen sowie unter Beachtung der 
                anerkannten fachlichen Standards erbracht.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">2.3 Keine Anlageberatung</h3>
              <p className="text-muted-foreground leading-relaxed">
                Unsere Dienstleistungen stellen keine Anlageberatung im Sinne des Kapitalmarktrechts dar. 
                Wir geben keine Garantien oder Zusicherungen hinsichtlich der Wertentwicklung von Immobilien 
                oder der Erzielung bestimmter Renditen. Jede Investitionsentscheidung liegt in der alleinigen 
                Verantwortung des Kunden.
              </p>
            </div>

            <div className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">3. Vertragsschluss</h2>
              <p className="text-muted-foreground leading-relaxed">
                Ein Vertrag kommt durch die schriftliche Bestätigung unseres Angebots durch den Kunden oder 
                durch die Unterzeichnung eines individuellen Beratungsvertrags zustande. Die Präsentation von 
                Immobilienobjekten auf unserer Website stellt kein bindendes Angebot dar, sondern eine 
                unverbindliche Aufforderung zur Abgabe eines Angebots (invitatio ad offerendum).
              </p>
            </div>

            <div className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">4. Vergütung und Zahlungsbedingungen</h2>
              
              <h3 className="text-xl font-semibold mb-3 mt-6">4.1 Honorar</h3>
              <p className="text-muted-foreground leading-relaxed">
                Die Vergütung für unsere Dienstleistungen richtet sich nach dem individuellen Angebot oder 
                Beratungsvertrag. Alle Preise verstehen sich zuzüglich der jeweils gültigen gesetzlichen 
                Mehrwertsteuer, sofern nicht ausdrücklich anders vereinbart.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">4.2 Fälligkeit</h3>
              <p className="text-muted-foreground leading-relaxed">
                Rechnungen sind innerhalb von 14 Tagen nach Rechnungsdatum ohne Abzug zur Zahlung fällig, 
                sofern nicht anders vereinbart. Bei Zahlungsverzug behalten wir uns vor, Verzugszinsen in 
                Höhe von 5 Prozentpunkten über dem jeweiligen Basiszinssatz zu berechnen.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">4.3 Provision bei Immobilienvermittlung</h3>
              <p className="text-muted-foreground leading-relaxed">
                Bei erfolgreicher Vermittlung einer Immobilie wird eine Provision fällig, deren Höhe im 
                Vermittlungsvertrag festgelegt ist. Die Provision wird bei notariellem Abschluss des 
                Kaufvertrags fällig.
              </p>
            </div>

            <div className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">5. Pflichten des Kunden</h2>
              
              <h3 className="text-xl font-semibold mb-3 mt-6">5.1 Mitwirkungspflichten</h3>
              <p className="text-muted-foreground leading-relaxed">
                Der Kunde ist verpflichtet, alle für die Leistungserbringung erforderlichen Informationen 
                und Unterlagen vollständig und wahrheitsgemäß zur Verfügung zu stellen. Der Kunde trägt die 
                Verantwortung für die Richtigkeit und Vollständigkeit der von ihm bereitgestellten Informationen.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">5.2 Eigenverantwortliche Prüfung</h3>
              <p className="text-muted-foreground leading-relaxed">
                Der Kunde ist verpflichtet, alle von uns bereitgestellten Informationen und Empfehlungen 
                eigenverantwortlich zu prüfen und bei Bedarf eigene rechtliche, steuerliche oder finanzielle 
                Beratung einzuholen. Wir empfehlen ausdrücklich, vor jeder Investitionsentscheidung unabhängige 
                Fachberater zu konsultieren.
              </p>
            </div>

            <div className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">6. Haftung und Gewährleistung</h2>
              
              <h3 className="text-xl font-semibold mb-3 mt-6">6.1 Haftungsbeschränkung</h3>
              <p className="text-muted-foreground leading-relaxed">
                Angelus Management haftet nur für Schäden, die auf vorsätzlichem oder grob fahrlässigem 
                Verhalten beruhen. Die Haftung für leichte Fahrlässigkeit ist ausgeschlossen, soweit nicht 
                wesentliche Vertragspflichten (Kardinalpflichten) verletzt wurden oder Schäden aus der 
                Verletzung des Lebens, des Körpers oder der Gesundheit resultieren.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">6.2 Keine Garantie für Investitionserfolg</h3>
              <p className="text-muted-foreground leading-relaxed">
                Wir übernehmen keine Garantie oder Gewährleistung für den wirtschaftlichen Erfolg von 
                Immobilieninvestitionen. Insbesondere garantieren wir nicht die Erzielung bestimmter Renditen, 
                Mieteinnahmen oder Wertsteigerungen. Immobilieninvestitionen unterliegen Marktrisiken, die 
                außerhalb unseres Einflussbereichs liegen.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">6.3 Informationen Dritter</h3>
              <p className="text-muted-foreground leading-relaxed">
                Für die Richtigkeit von Informationen, die wir von Dritten (z.B. Verkäufern, Entwicklern, 
                Behörden) erhalten und an den Kunden weitergeben, übernehmen wir keine Gewähr, es sei denn, 
                wir haben diese Informationen vorsätzlich oder grob fahrlässig nicht überprüft.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">6.4 Haftungshöchstgrenze</h3>
              <p className="text-muted-foreground leading-relaxed">
                Soweit unsere Haftung ausgeschlossen oder beschränkt ist, gilt dies auch für die persönliche 
                Haftung unserer Mitarbeiter, Vertreter und Erfüllungsgehilfen. Die Haftung für leichte 
                Fahrlässigkeit bei Verletzung wesentlicher Vertragspflichten ist der Höhe nach auf den 
                vertragstypischen, vorhersehbaren Schaden begrenzt.
              </p>
            </div>

            <div className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">7. Vertraulichkeit</h2>
              <p className="text-muted-foreground leading-relaxed">
                Beide Vertragsparteien verpflichten sich, alle im Rahmen der Geschäftsbeziehung bekannt 
                gewordenen vertraulichen Informationen streng vertraulich zu behandeln und nur für die 
                vereinbarten Zwecke zu verwenden. Diese Verpflichtung besteht auch nach Beendigung des 
                Vertragsverhältnisses fort.
              </p>
            </div>

            <div className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">8. Laufzeit und Kündigung</h2>
              
              <h3 className="text-xl font-semibold mb-3 mt-6">8.1 Vertragslaufzeit</h3>
              <p className="text-muted-foreground leading-relaxed">
                Die Vertragslaufzeit richtet sich nach dem individuellen Beratungsvertrag. Sofern keine 
                feste Laufzeit vereinbart wurde, kann der Vertrag von beiden Parteien mit einer Frist von 
                vier Wochen zum Monatsende gekündigt werden.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">8.2 Außerordentliche Kündigung</h3>
              <p className="text-muted-foreground leading-relaxed">
                Das Recht zur außerordentlichen Kündigung aus wichtigem Grund bleibt unberührt. Ein wichtiger 
                Grund liegt insbesondere vor bei erheblichen Vertragsverletzungen, Zahlungsverzug von mehr 
                als zwei Monaten oder Insolvenz einer Vertragspartei.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">8.3 Folgen der Beendigung</h3>
              <p className="text-muted-foreground leading-relaxed">
                Bei Beendigung des Vertragsverhältnisses sind bereits erbrachte Leistungen zu vergüten. 
                Bereits gezahlte Honorare für noch nicht erbrachte Leistungen werden anteilig zurückerstattet.
              </p>
            </div>

            <div className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">9. Geistiges Eigentum</h2>
              <p className="text-muted-foreground leading-relaxed">
                Alle von uns erstellten Unterlagen, Analysen, Präsentationen und sonstigen Arbeitsergebnisse 
                bleiben unser geistiges Eigentum. Der Kunde erhält ein nicht-ausschließliches, nicht 
                übertragbares Nutzungsrecht für die vereinbarten Zwecke. Eine Weitergabe an Dritte oder 
                Veröffentlichung bedarf unserer vorherigen schriftlichen Zustimmung.
              </p>
            </div>

            <div className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">10. Datenschutz</h2>
              <p className="text-muted-foreground leading-relaxed">
                Die Verarbeitung personenbezogener Daten erfolgt im Einklang mit den geltenden 
                Datenschutzbestimmungen, insbesondere der DSGVO. Weitere Informationen entnehmen Sie bitte 
                unserer{" "}
                <Link href="/datenschutz">
                  <a className="text-gold hover:underline">Datenschutzerklärung</a>
                </Link>
                .
              </p>
            </div>

            <div className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">11. Anwendbares Recht und Gerichtsstand</h2>
              
              <h3 className="text-xl font-semibold mb-3 mt-6">11.1 Anwendbares Recht</h3>
              <p className="text-muted-foreground leading-relaxed">
                Für alle Rechtsbeziehungen zwischen Angelus Management und dem Kunden gilt das Recht von 
                Georgien unter Ausschluss des UN-Kaufrechts (CISG).
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">11.2 Gerichtsstand</h3>
              <p className="text-muted-foreground leading-relaxed">
                Ausschließlicher Gerichtsstand für alle Streitigkeiten aus oder im Zusammenhang mit diesem 
                Vertrag ist Batumi, Georgien, sofern der Kunde Kaufmann, juristische Person des öffentlichen 
                Rechts oder öffentlich-rechtliches Sondervermögen ist.
              </p>
            </div>

            <div className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">12. Salvatorische Klausel</h2>
              <p className="text-muted-foreground leading-relaxed">
                Sollten einzelne Bestimmungen dieser AGB unwirksam oder undurchführbar sein oder werden, 
                berührt dies die Wirksamkeit der übrigen Bestimmungen nicht. Die unwirksame oder 
                undurchführbare Bestimmung ist durch eine wirksame Regelung zu ersetzen, die dem 
                wirtschaftlichen Zweck der unwirksamen Bestimmung am nächsten kommt.
              </p>
            </div>

            <div className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">13. Änderungen der AGB</h2>
              <p className="text-muted-foreground leading-relaxed">
                Wir behalten uns das Recht vor, diese AGB jederzeit zu ändern. Änderungen werden dem Kunden 
                mindestens vier Wochen vor ihrem Inkrafttreten in Textform mitgeteilt. Widerspricht der Kunde 
                den geänderten AGB nicht innerhalb von vier Wochen nach Zugang der Änderungsmitteilung, gelten 
                die geänderten AGB als angenommen. Auf die Widerspruchsmöglichkeit und die Bedeutung der 
                Widerrufsfrist werden wir in der Änderungsmitteilung besonders hinweisen.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-border">
              <div className="bg-muted p-6 rounded-lg">
                <p className="text-foreground font-semibold mb-3">Kontakt bei Fragen zu den AGB:</p>
                <p className="text-muted-foreground">
                  ANGELUS MANAGEMENT GEORGIA LLC<br />
                  26 May Street, No. 19<br />
                  Batumi, Georgia
                </p>
                <p className="text-muted-foreground mt-3">
                  E-Mail: angelusmanagementgeorgia@gmail.com<br />
                  Telefon: +995 579 10 67 19
                </p>
              </div>
              <p className="text-sm text-muted-foreground mt-6">
                Stand: Dezember 2024
              </p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8 mt-16">
        <div className="container text-center">
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <Link href="/impressum">
              <a className="hover:text-gold transition-colors">Impressum</a>
            </Link>
            <Link href="/datenschutz">
              <a className="hover:text-gold transition-colors">Datenschutz</a>
            </Link>
            <Link href="/agb">
              <a className="hover:text-gold transition-colors">AGB</a>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            © 2024 Angelus Management Georgia LLC. Alle Rechte vorbehalten.
          </p>
        </div>
      </footer>
    </div>
  );
}
