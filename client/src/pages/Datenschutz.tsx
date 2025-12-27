import { Link } from "wouter";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function Datenschutz() {
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
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Link href="/">
              <a className="text-sm text-gold hover:underline">← Zurück zur Startseite</a>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container py-12 max-w-4xl">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-bold text-foreground mb-8">Datenschutzerklärung</h1>

          <section className="space-y-6 text-foreground">
            <div>
              <h2 className="text-2xl font-semibold mb-4">1. Datenschutz auf einen Blick</h2>
              
              <h3 className="text-xl font-semibold mb-3 mt-6">Allgemeine Hinweise</h3>
              <p className="text-muted-foreground leading-relaxed">
                Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen 
                Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit 
                denen Sie persönlich identifiziert werden können. Ausführliche Informationen zum Thema Datenschutz 
                entnehmen Sie unserer unter diesem Text aufgeführten Datenschutzerklärung.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">Datenerfassung auf dieser Website</h3>
              <p className="text-muted-foreground leading-relaxed mb-3">
                <strong className="text-foreground">Wer ist verantwortlich für die Datenerfassung auf dieser Website?</strong>
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten 
                können Sie dem Abschnitt „Hinweis zur verantwortlichen Stelle" in dieser Datenschutzerklärung entnehmen.
              </p>

              <p className="text-muted-foreground leading-relaxed mb-3 mt-4">
                <strong className="text-foreground">Wie erfassen wir Ihre Daten?</strong>
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Hierbei kann es sich 
                z.B. um Daten handeln, die Sie in ein Kontaktformular eingeben. Andere Daten werden automatisch 
                oder nach Ihrer Einwilligung beim Besuch der Website durch unsere IT-Systeme erfasst. Das sind 
                vor allem technische Daten (z.B. Internetbrowser, Betriebssystem oder Uhrzeit des Seitenaufrufs).
              </p>

              <p className="text-muted-foreground leading-relaxed mb-3 mt-4">
                <strong className="text-foreground">Wofür nutzen wir Ihre Daten?</strong>
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Ein Teil der Daten wird erhoben, um eine fehlerfreie Bereitstellung der Website zu gewährleisten. 
                Andere Daten können zur Analyse Ihres Nutzerverhaltens verwendet werden. Daten, die Sie über unser 
                Kontaktformular übermitteln, werden zur Bearbeitung Ihrer Anfrage verwendet.
              </p>

              <p className="text-muted-foreground leading-relaxed mb-3 mt-4">
                <strong className="text-foreground">Welche Rechte haben Sie bezüglich Ihrer Daten?</strong>
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Sie haben jederzeit das Recht, unentgeltlich Auskunft über Herkunft, Empfänger und Zweck Ihrer 
                gespeicherten personenbezogenen Daten zu erhalten. Sie haben außerdem ein Recht, die Berichtigung 
                oder Löschung dieser Daten zu verlangen. Wenn Sie eine Einwilligung zur Datenverarbeitung erteilt 
                haben, können Sie diese Einwilligung jederzeit für die Zukunft widerrufen. Außerdem haben Sie das 
                Recht, unter bestimmten Umständen die Einschränkung der Verarbeitung Ihrer personenbezogenen Daten 
                zu verlangen. Des Weiteren steht Ihnen ein Beschwerderecht bei der zuständigen Aufsichtsbehörde zu.
              </p>
            </div>

            <div className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">2. Hosting</h2>
              <p className="text-muted-foreground leading-relaxed">
                Wir hosten die Inhalte unserer Website bei folgendem Anbieter:
              </p>
              
              <h3 className="text-xl font-semibold mb-3 mt-6">Externes Hosting</h3>
              <p className="text-muted-foreground leading-relaxed">
                Diese Website wird extern gehostet. Die personenbezogenen Daten, die auf dieser Website erfasst 
                werden, werden auf den Servern des Hosters / der Hoster gespeichert. Hierbei kann es sich v.a. 
                um IP-Adressen, Kontaktanfragen, Meta- und Kommunikationsdaten, Vertragsdaten, Kontaktdaten, 
                Namen, Websitezugriffe und sonstige Daten, die über eine Website generiert werden, handeln.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-3">
                Das externe Hosting erfolgt zum Zwecke der Vertragserfüllung gegenüber unseren potenziellen und 
                bestehenden Kunden (Art. 6 Abs. 1 lit. b DSGVO) und im Interesse einer sicheren, schnellen und 
                effizienten Bereitstellung unseres Online-Angebots durch einen professionellen Anbieter 
                (Art. 6 Abs. 1 lit. f DSGVO).
              </p>
            </div>

            <div className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">3. Allgemeine Hinweise und Pflichtinformationen</h2>
              
              <h3 className="text-xl font-semibold mb-3 mt-6">Datenschutz</h3>
              <p className="text-muted-foreground leading-relaxed">
                Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln 
                Ihre personenbezogenen Daten vertraulich und entsprechend den gesetzlichen Datenschutzvorschriften 
                sowie dieser Datenschutzerklärung.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-3">
                Wenn Sie diese Website benutzen, werden verschiedene personenbezogene Daten erhoben. Personenbezogene 
                Daten sind Daten, mit denen Sie persönlich identifiziert werden können. Die vorliegende 
                Datenschutzerklärung erläutert, welche Daten wir erheben und wofür wir sie nutzen. Sie erläutert 
                auch, wie und zu welchem Zweck das geschieht.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">Hinweis zur verantwortlichen Stelle</h3>
              <p className="text-muted-foreground leading-relaxed">
                Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:
              </p>
              <div className="bg-muted p-6 rounded-lg mt-4">
                <p className="text-foreground font-semibold">ANGELUS MANAGEMENT GEORGIA LLC</p>
                <p className="text-muted-foreground mt-2">
                  26 May Street, No. 19<br />
                  Batumi, Georgia
                </p>
                <p className="text-muted-foreground mt-3">
                  Registration number: 445810613<br />
                  Director: Irina Fedotova
                </p>
                <p className="text-muted-foreground mt-3">
                  E-Mail: angelusmanagementgeorgia@gmail.com<br />
                  Telefon: +995 579 10 67 19
                </p>
              </div>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Verantwortliche Stelle ist die natürliche oder juristische Person, die allein oder gemeinsam mit 
                anderen über die Zwecke und Mittel der Verarbeitung von personenbezogenen Daten (z.B. Namen, 
                E-Mail-Adressen o. Ä.) entscheidet.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">Speicherdauer</h3>
              <p className="text-muted-foreground leading-relaxed">
                Soweit innerhalb dieser Datenschutzerklärung keine speziellere Speicherdauer genannt wurde, 
                verbleiben Ihre personenbezogenen Daten bei uns, bis der Zweck für die Datenverarbeitung entfällt. 
                Wenn Sie ein berechtigtes Löschersuchen geltend machen oder eine Einwilligung zur Datenverarbeitung 
                widerrufen, werden Ihre Daten gelöscht, sofern wir keine anderen rechtlich zulässigen Gründe für 
                die Speicherung Ihrer personenbezogenen Daten haben (z.B. steuer- oder handelsrechtliche 
                Aufbewahrungsfristen); im letztgenannten Fall erfolgt die Löschung nach Fortfall dieser Gründe.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">Widerruf Ihrer Einwilligung zur Datenverarbeitung</h3>
              <p className="text-muted-foreground leading-relaxed">
                Viele Datenverarbeitungsvorgänge sind nur mit Ihrer ausdrücklichen Einwilligung möglich. Sie können 
                eine bereits erteilte Einwilligung jederzeit widerrufen. Die Rechtmäßigkeit der bis zum Widerruf 
                erfolgten Datenverarbeitung bleibt vom Widerruf unberührt.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">Beschwerderecht bei der zuständigen Aufsichtsbehörde</h3>
              <p className="text-muted-foreground leading-relaxed">
                Im Falle von Verstößen gegen die DSGVO steht den Betroffenen ein Beschwerderecht bei einer 
                Aufsichtsbehörde, insbesondere in dem Mitgliedstaat ihres gewöhnlichen Aufenthalts, ihres 
                Arbeitsplatzes oder des Orts des mutmaßlichen Verstoßes zu. Das Beschwerderecht besteht 
                unbeschadet anderweitiger verwaltungsrechtlicher oder gerichtlicher Rechtsbehelfe.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">Recht auf Datenübertragbarkeit</h3>
              <p className="text-muted-foreground leading-relaxed">
                Sie haben das Recht, Daten, die wir auf Grundlage Ihrer Einwilligung oder in Erfüllung eines 
                Vertrags automatisiert verarbeiten, an sich oder an einen Dritten in einem gängigen, 
                maschinenlesbaren Format aushändigen zu lassen. Sofern Sie die direkte Übertragung der Daten 
                an einen anderen Verantwortlichen verlangen, erfolgt dies nur, soweit es technisch machbar ist.
              </p>
            </div>

            <div className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">4. Datenerfassung auf dieser Website</h2>
              
              <h3 className="text-xl font-semibold mb-3 mt-6">Kontaktformular</h3>
              <p className="text-muted-foreground leading-relaxed">
                Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus dem 
                Anfrageformular inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks Bearbeitung der 
                Anfrage und für den Fall von Anschlussfragen bei uns gespeichert. Diese Daten geben wir nicht 
                ohne Ihre Einwilligung weiter.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-3">
                Die Verarbeitung dieser Daten erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO, sofern Ihre 
                Anfrage mit der Erfüllung eines Vertrags zusammenhängt oder zur Durchführung vorvertraglicher 
                Maßnahmen erforderlich ist. In allen übrigen Fällen beruht die Verarbeitung auf unserem 
                berechtigten Interesse an der effektiven Bearbeitung der an uns gerichteten Anfragen 
                (Art. 6 Abs. 1 lit. f DSGVO) oder auf Ihrer Einwilligung (Art. 6 Abs. 1 lit. a DSGVO) sofern 
                diese abgefragt wurde.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-3">
                Die von Ihnen im Kontaktformular eingegebenen Daten verbleiben bei uns, bis Sie uns zur Löschung 
                auffordern, Ihre Einwilligung zur Speicherung widerrufen oder der Zweck für die Datenspeicherung 
                entfällt (z.B. nach abgeschlossener Bearbeitung Ihrer Anfrage). Zwingende gesetzliche Bestimmungen 
                – insbesondere Aufbewahrungsfristen – bleiben unberührt.
              </p>
            </div>

            <div className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">5. Analyse-Tools und Werbung</h2>
              
              <h3 className="text-xl font-semibold mb-3 mt-6">Umami Analytics</h3>
              <p className="text-muted-foreground leading-relaxed">
                Diese Website nutzt Umami Analytics zur Analyse des Nutzerverhaltens. Umami ist ein 
                datenschutzfreundliches Analysetool, das keine Cookies verwendet und keine personenbezogenen 
                Daten erfasst. Es werden lediglich anonymisierte Zugriffsdaten wie Seitenaufrufe, Verweildauer 
                und Herkunftsland erfasst. Eine Identifizierung einzelner Nutzer ist nicht möglich.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-3">
                Die Nutzung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO. Der Websitebetreiber hat ein 
                berechtigtes Interesse an der anonymisierten Analyse des Nutzerverhaltens, um sein Webangebot 
                zu optimieren.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground">
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
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            © 2024 Angelus Management Georgia LLC. Alle Rechte vorbehalten.
          </p>
        </div>
      </footer>
    </div>
  );
}
