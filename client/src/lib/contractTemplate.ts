/**
 * Georgian Pre-Contract (Vorvertrag) Template
 * Based on Georgian Civil Code and Real Estate Law
 * 
 * This template generates a legally compliant pre-contract for property purchases
 * in Georgia with a 14-day withdrawal period.
 */

export interface ContractData {
  // Contract info
  contractNumber: string;
  contractDate: string;
  
  // Buyer info
  buyerFirstName: string;
  buyerLastName: string;
  buyerEmail: string;
  buyerPhone?: string;
  buyerAddress?: string;
  buyerIdType?: string;
  buyerIdNumber?: string;
  buyerDateOfBirth?: string;
  buyerNationality?: string;
  
  // Property info
  propertyTitle: string;
  propertyLocation: string;
  propertyCity: string;
  propertyArea: number;
  
  // Financial terms
  purchasePrice: number;
  downPaymentPercent: number;
  downPaymentAmount: number;
  remainingAmount: number;
  
  // Payment plan
  paymentPlan: 'full' | 'installment';
  installmentMonths?: number;
  monthlyInstallment?: number;
  interestRate?: number;
  
  // Dates
  expectedCompletionDate?: string;
  withdrawalDeadline: string;
  
  // Special conditions
  specialConditions?: string;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function generateContractHtml(data: ContractData): string {
  const idTypeLabels: Record<string, string> = {
    passport: 'Reisepass',
    id_card: 'Personalausweis',
    drivers_license: 'Führerschein',
  };

  return `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title>Vorvertrag Nr. ${data.contractNumber}</title>
  <style>
    @page {
      size: A4;
      margin: 2cm;
    }
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #000;
      max-width: 21cm;
      margin: 0 auto;
      padding: 2cm;
    }
    .header {
      text-align: center;
      margin-bottom: 2cm;
      border-bottom: 2px solid #C4A052;
      padding-bottom: 1cm;
    }
    .header h1 {
      font-size: 18pt;
      margin: 0;
      color: #1a1a1a;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    .header h2 {
      font-size: 14pt;
      margin: 0.5cm 0 0;
      color: #C4A052;
      font-weight: normal;
    }
    .contract-number {
      font-size: 10pt;
      color: #666;
      margin-top: 0.5cm;
    }
    .section {
      margin-bottom: 1cm;
    }
    .section-title {
      font-size: 12pt;
      font-weight: bold;
      color: #1a1a1a;
      margin-bottom: 0.5cm;
      padding-bottom: 0.2cm;
      border-bottom: 1px solid #C4A052;
    }
    .parties {
      display: flex;
      justify-content: space-between;
      margin-bottom: 1cm;
    }
    .party {
      width: 48%;
    }
    .party h3 {
      font-size: 11pt;
      color: #C4A052;
      margin-bottom: 0.3cm;
    }
    .party-info {
      font-size: 10pt;
      line-height: 1.4;
    }
    .article {
      margin-bottom: 0.8cm;
    }
    .article-title {
      font-weight: bold;
      margin-bottom: 0.3cm;
    }
    .article-content {
      text-align: justify;
    }
    .financial-table {
      width: 100%;
      border-collapse: collapse;
      margin: 0.5cm 0;
    }
    .financial-table th,
    .financial-table td {
      border: 1px solid #ddd;
      padding: 0.3cm;
      text-align: left;
    }
    .financial-table th {
      background-color: #f5f5f5;
      font-weight: bold;
    }
    .financial-table .amount {
      text-align: right;
      font-family: 'Courier New', monospace;
    }
    .highlight-box {
      background-color: #FFF8E7;
      border: 1px solid #C4A052;
      padding: 0.5cm;
      margin: 0.5cm 0;
      border-radius: 4px;
    }
    .warning-box {
      background-color: #FFF3CD;
      border: 1px solid #FFD700;
      padding: 0.5cm;
      margin: 0.5cm 0;
      border-radius: 4px;
    }
    .warning-box strong {
      color: #856404;
    }
    .signature-section {
      margin-top: 2cm;
      page-break-inside: avoid;
    }
    .signature-row {
      display: flex;
      justify-content: space-between;
      margin-top: 1cm;
    }
    .signature-box {
      width: 45%;
      text-align: center;
    }
    .signature-line {
      border-top: 1px solid #000;
      margin-top: 2cm;
      padding-top: 0.3cm;
    }
    .signature-image {
      height: 60px;
      margin-bottom: 0.5cm;
    }
    .footer {
      margin-top: 2cm;
      padding-top: 0.5cm;
      border-top: 1px solid #ddd;
      font-size: 9pt;
      color: #666;
      text-align: center;
    }
    .legal-notice {
      font-size: 9pt;
      color: #666;
      margin-top: 1cm;
      padding: 0.5cm;
      background-color: #f9f9f9;
      border-radius: 4px;
    }
    @media print {
      body {
        padding: 0;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Vorvertrag</h1>
    <h2>Immobilienkaufvertrag nach georgischem Recht</h2>
    <div class="contract-number">
      Vertragsnummer: ${data.contractNumber}<br>
      Datum: ${formatDate(data.contractDate)}
    </div>
  </div>

  <div class="section">
    <div class="section-title">Vertragsparteien</div>
    <div class="parties">
      <div class="party">
        <h3>Verkäufer</h3>
        <div class="party-info">
          <strong>Angelus Management Georgia LLC</strong><br>
          Registrierungsnummer: 445678901<br>
          Adresse: Batumi, Adjara, Georgia<br>
          E-Mail: info@angelus-georgia.com<br>
          Vertreten durch: Geschäftsführung
        </div>
      </div>
      <div class="party">
        <h3>Käufer</h3>
        <div class="party-info">
          <strong>${data.buyerFirstName} ${data.buyerLastName}</strong><br>
          ${data.buyerIdType ? `${idTypeLabels[data.buyerIdType] || data.buyerIdType}: ${data.buyerIdNumber}<br>` : ''}
          ${data.buyerDateOfBirth ? `Geburtsdatum: ${formatDate(data.buyerDateOfBirth)}<br>` : ''}
          ${data.buyerNationality ? `Staatsangehörigkeit: ${data.buyerNationality}<br>` : ''}
          ${data.buyerAddress ? `Adresse: ${data.buyerAddress}<br>` : ''}
          E-Mail: ${data.buyerEmail}<br>
          ${data.buyerPhone ? `Telefon: ${data.buyerPhone}` : ''}
        </div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Präambel</div>
    <p class="article-content">
      Dieser Vorvertrag (nachfolgend "Vertrag") wird gemäß den Bestimmungen des georgischen Zivilgesetzbuches 
      (Artikel 317-331) und dem georgischen Immobilienrecht geschlossen. Die Parteien vereinbaren hiermit 
      verbindlich den Kauf der nachfolgend beschriebenen Immobilie unter den in diesem Vertrag festgelegten 
      Bedingungen.
    </p>
    <p class="article-content">
      Dieser Vorvertrag begründet die Verpflichtung beider Parteien, nach Fertigstellung der Immobilie 
      einen notariellen Hauptvertrag abzuschließen. Der Vorvertrag ist nach georgischem Recht 
      rechtlich bindend.
    </p>
  </div>

  <div class="section">
    <div class="section-title">§ 1 Vertragsgegenstand</div>
    <div class="article">
      <p class="article-content">
        Der Verkäufer verpflichtet sich, dem Käufer die folgende Immobilie zu verkaufen und zu übereignen:
      </p>
      <table class="financial-table">
        <tr>
          <th style="width: 30%;">Bezeichnung</th>
          <td><strong>${data.propertyTitle}</strong></td>
        </tr>
        <tr>
          <th>Standort</th>
          <td>${data.propertyLocation}</td>
        </tr>
        <tr>
          <th>Stadt</th>
          <td>${data.propertyCity}, Georgia</td>
        </tr>
        <tr>
          <th>Wohnfläche</th>
          <td>${data.propertyArea.toFixed(2)} m²</td>
        </tr>
        ${data.expectedCompletionDate ? `
        <tr>
          <th>Voraussichtliche Fertigstellung</th>
          <td>${formatDate(data.expectedCompletionDate)}</td>
        </tr>
        ` : ''}
      </table>
    </div>
  </div>

  <div class="section">
    <div class="section-title">§ 2 Kaufpreis und Zahlungsbedingungen</div>
    <div class="article">
      <p class="article-content">
        Die Parteien vereinbaren den folgenden Kaufpreis und die nachstehenden Zahlungsbedingungen:
      </p>
      <table class="financial-table">
        <tr>
          <th style="width: 50%;">Position</th>
          <th style="width: 25%;">Prozent</th>
          <th style="width: 25%;">Betrag</th>
        </tr>
        <tr>
          <td><strong>Gesamtkaufpreis</strong></td>
          <td class="amount">100%</td>
          <td class="amount"><strong>${formatCurrency(data.purchasePrice)}</strong></td>
        </tr>
        <tr>
          <td>Anzahlung (fällig bei Vertragsunterzeichnung)</td>
          <td class="amount">${data.downPaymentPercent.toFixed(1)}%</td>
          <td class="amount">${formatCurrency(data.downPaymentAmount)}</td>
        </tr>
        <tr>
          <td>Restbetrag</td>
          <td class="amount">${(100 - data.downPaymentPercent).toFixed(1)}%</td>
          <td class="amount">${formatCurrency(data.remainingAmount)}</td>
        </tr>
      </table>
      
      ${data.paymentPlan === 'installment' && data.installmentMonths ? `
      <div class="highlight-box">
        <strong>Ratenzahlungsvereinbarung:</strong><br>
        Der Restbetrag von ${formatCurrency(data.remainingAmount)} wird in ${data.installmentMonths} monatlichen Raten 
        zu je ${formatCurrency(data.monthlyInstallment || 0)} gezahlt.
        ${data.interestRate && data.interestRate > 0 ? `<br>Zinssatz: ${data.interestRate}% p.a.` : '<br>Zinsfrei.'}
      </div>
      ` : `
      <div class="highlight-box">
        <strong>Vollzahlung:</strong><br>
        Der Restbetrag von ${formatCurrency(data.remainingAmount)} ist bei Fertigstellung und Übergabe der Immobilie fällig.
      </div>
      `}
    </div>
  </div>

  <div class="section">
    <div class="section-title">§ 3 Widerrufsrecht</div>
    <div class="warning-box">
      <strong>WICHTIGE INFORMATION ZUM WIDERRUFSRECHT</strong>
    </div>
    <div class="article">
      <p class="article-content">
        <strong>3.1</strong> Der Käufer hat das Recht, diesen Vertrag innerhalb von <strong>14 (vierzehn) Kalendertagen</strong> 
        ohne Angabe von Gründen zu widerrufen.
      </p>
      <p class="article-content">
        <strong>3.2</strong> Die Widerrufsfrist beginnt mit dem Tag der Unterzeichnung dieses Vertrages. 
        Die Widerrufsfrist endet am <strong>${formatDate(data.withdrawalDeadline)}</strong>.
      </p>
      <p class="article-content">
        <strong>3.3</strong> Um das Widerrufsrecht auszuüben, muss der Käufer den Verkäufer mittels einer 
        eindeutigen Erklärung (z.B. per E-Mail an info@angelus-georgia.com) über seinen Entschluss, 
        diesen Vertrag zu widerrufen, informieren.
      </p>
      <p class="article-content">
        <strong>3.4</strong> Im Falle eines wirksamen Widerrufs wird die geleistete Anzahlung innerhalb 
        von 14 Tagen nach Eingang der Widerrufserklärung vollständig zurückerstattet.
      </p>
    </div>
  </div>

  <div class="section">
    <div class="section-title">§ 4 Pflichten des Verkäufers</div>
    <div class="article">
      <p class="article-content">
        <strong>4.1</strong> Der Verkäufer verpflichtet sich, die Immobilie gemäß den vereinbarten 
        Spezifikationen und in vertragsgemäßem Zustand zu errichten bzw. fertigzustellen.
      </p>
      <p class="article-content">
        <strong>4.2</strong> Der Verkäufer wird den Käufer regelmäßig über den Baufortschritt informieren.
      </p>
      <p class="article-content">
        <strong>4.3</strong> Nach Fertigstellung und vollständiger Zahlung wird der Verkäufer alle 
        erforderlichen Dokumente für die Eigentumsübertragung beim zuständigen georgischen Grundbuchamt 
        (Public Registry) bereitstellen.
      </p>
      <p class="article-content">
        <strong>4.4</strong> Der Verkäufer garantiert, dass die Immobilie frei von Rechten Dritter, 
        Belastungen und Verbindlichkeiten ist.
      </p>
    </div>
  </div>

  <div class="section">
    <div class="section-title">§ 5 Pflichten des Käufers</div>
    <div class="article">
      <p class="article-content">
        <strong>5.1</strong> Der Käufer verpflichtet sich, die vereinbarten Zahlungen fristgerecht zu leisten.
      </p>
      <p class="article-content">
        <strong>5.2</strong> Der Käufer wird alle für die Eigentumsübertragung erforderlichen persönlichen 
        Dokumente und Informationen bereitstellen.
      </p>
      <p class="article-content">
        <strong>5.3</strong> Der Käufer verpflichtet sich, nach Fertigstellung der Immobilie an der 
        Beurkundung des notariellen Hauptvertrages mitzuwirken.
      </p>
    </div>
  </div>

  <div class="section">
    <div class="section-title">§ 6 Eigentumsübertragung</div>
    <div class="article">
      <p class="article-content">
        <strong>6.1</strong> Die Eigentumsübertragung erfolgt nach vollständiger Zahlung des Kaufpreises 
        durch Eintragung im georgischen Grundbuch (Public Registry).
      </p>
      <p class="article-content">
        <strong>6.2</strong> Die Kosten der Eigentumsübertragung und Grundbucheintragung trägt der Käufer, 
        sofern nicht anders vereinbart.
      </p>
      <p class="article-content">
        <strong>6.3</strong> Nach Fertigstellung der Immobilie wird ein notarieller Hauptvertrag 
        (Kaufvertrag) abgeschlossen, der diesen Vorvertrag ersetzt.
      </p>
    </div>
  </div>

  <div class="section">
    <div class="section-title">§ 7 Gewährleistung</div>
    <div class="article">
      <p class="article-content">
        <strong>7.1</strong> Der Verkäufer gewährt eine Gewährleistung von 2 (zwei) Jahren ab Übergabe 
        der Immobilie für Mängel, die bei ordnungsgemäßer Nutzung auftreten.
      </p>
      <p class="article-content">
        <strong>7.2</strong> Von der Gewährleistung ausgenommen sind Mängel, die durch unsachgemäße 
        Nutzung, höhere Gewalt oder Eingriffe Dritter verursacht wurden.
      </p>
    </div>
  </div>

  ${data.specialConditions ? `
  <div class="section">
    <div class="section-title">§ 8 Besondere Vereinbarungen</div>
    <div class="article">
      <p class="article-content">${data.specialConditions}</p>
    </div>
  </div>
  ` : ''}

  <div class="section">
    <div class="section-title">§ ${data.specialConditions ? '9' : '8'} Anwendbares Recht und Gerichtsstand</div>
    <div class="article">
      <p class="article-content">
        <strong>${data.specialConditions ? '9' : '8'}.1</strong> Dieser Vertrag unterliegt ausschließlich dem Recht von Georgien. 
        Die Anwendung deutschen Rechts oder des Rechts anderer Staaten ist ausdrücklich ausgeschlossen.
      </p>
      <p class="article-content">
        <strong>${data.specialConditions ? '9' : '8'}.2</strong> Für alle Streitigkeiten aus oder im Zusammenhang mit diesem 
        Vertrag sind ausschließlich die Gerichte in Batumi, Georgien, zuständig.
      </p>
      <p class="article-content">
        <strong>${data.specialConditions ? '9' : '8'}.3</strong> Sollten einzelne Bestimmungen dieses Vertrages unwirksam sein 
        oder werden, berührt dies die Wirksamkeit der übrigen Bestimmungen nicht.
      </p>
    </div>
  </div>

  <div class="section">
    <div class="section-title">§ ${data.specialConditions ? '10' : '9'} Schlussbestimmungen</div>
    <div class="article">
      <p class="article-content">
        <strong>${data.specialConditions ? '10' : '9'}.1</strong> Änderungen und Ergänzungen dieses Vertrages bedürfen der Schriftform.
      </p>
      <p class="article-content">
        <strong>${data.specialConditions ? '10' : '9'}.2</strong> Der Käufer bestätigt, dass er diesen Vertrag vollständig gelesen 
        und verstanden hat und alle Bestimmungen akzeptiert.
      </p>
      <p class="article-content">
        <strong>${data.specialConditions ? '10' : '9'}.3</strong> Dieser Vertrag wird in zwei gleichlautenden Ausfertigungen 
        erstellt, von denen jede Partei eine erhält.
      </p>
    </div>
  </div>

  <div class="signature-section">
    <div class="section-title">Unterschriften</div>
    <p style="text-align: center; margin-bottom: 1cm;">
      Durch ihre Unterschrift bestätigen beide Parteien, dass sie diesen Vertrag gelesen haben, 
      mit allen Bedingungen einverstanden sind und sich rechtlich gebunden fühlen.
    </p>
    <div class="signature-row">
      <div class="signature-box">
        <div class="signature-line">
          <strong>Verkäufer</strong><br>
          Angelus Management Georgia LLC<br>
          <small>Datum: _________________</small>
        </div>
      </div>
      <div class="signature-box">
        <div class="signature-line">
          <strong>Käufer</strong><br>
          ${data.buyerFirstName} ${data.buyerLastName}<br>
          <small>Datum: _________________</small>
        </div>
      </div>
    </div>
  </div>

  <div class="legal-notice">
    <strong>Rechtlicher Hinweis:</strong> Dieser Vorvertrag ist ein rechtlich bindendes Dokument nach 
    georgischem Recht. Der Käufer wird darauf hingewiesen, dass er vor Unterzeichnung rechtliche 
    Beratung in Anspruch nehmen kann. Die Widerrufsfrist von 14 Tagen beginnt mit der Unterzeichnung 
    dieses Vertrages.
  </div>

  <div class="footer">
    <p>
      Angelus Management Georgia LLC | Batumi, Adjara, Georgia<br>
      E-Mail: info@angelus-georgia.com | Web: www.angelus-georgia.com<br>
      Vertrag erstellt am: ${formatDate(data.contractDate)}
    </p>
  </div>
</body>
</html>
`;
}

/**
 * Generate withdrawal notice template
 */
export function generateWithdrawalNoticeHtml(data: {
  contractNumber: string;
  buyerName: string;
  propertyTitle: string;
  withdrawalDate: string;
  refundAmount: number;
}): string {
  return `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title>Widerrufsbestätigung</title>
  <style>
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 11pt;
      line-height: 1.6;
      max-width: 21cm;
      margin: 0 auto;
      padding: 2cm;
    }
    .header {
      text-align: center;
      margin-bottom: 2cm;
      border-bottom: 2px solid #C4A052;
      padding-bottom: 1cm;
    }
    h1 {
      font-size: 16pt;
      color: #1a1a1a;
    }
    .content {
      margin: 1cm 0;
    }
    .highlight {
      background-color: #FFF8E7;
      padding: 1cm;
      border-radius: 4px;
      margin: 1cm 0;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Widerrufsbestätigung</h1>
    <p>Vertragsnummer: ${data.contractNumber}</p>
  </div>
  
  <div class="content">
    <p>Sehr geehrte/r ${data.buyerName},</p>
    
    <p>hiermit bestätigen wir den Eingang Ihrer Widerrufserklärung vom ${formatDate(data.withdrawalDate)} 
    bezüglich des Vorvertrages für die Immobilie "${data.propertyTitle}".</p>
    
    <div class="highlight">
      <strong>Rückerstattung:</strong><br>
      Der Betrag von ${formatCurrency(data.refundAmount)} wird innerhalb von 14 Werktagen 
      auf Ihr Wallet-Konto zurückerstattet.
    </div>
    
    <p>Der Vorvertrag Nr. ${data.contractNumber} ist damit aufgehoben.</p>
    
    <p>Mit freundlichen Grüßen,<br>
    Angelus Management Georgia LLC</p>
  </div>
</body>
</html>
`;
}
