import { Resend } from 'resend';

const resend = new Resend(process.env.API_KEY_RESEND);

const FROM_EMAIL = 'Angelus Management Georgia <onboarding@resend.dev>'; // Change to your verified domain

export async function sendWelcomeEmail(to: string, name: string) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Willkommen bei Angelus Management Georgia',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #B8860B;">Willkommen, ${name}!</h1>
          <p>Vielen Dank für Ihre Registrierung bei Angelus Management Georgia.</p>
          <p>Wir freuen uns, Sie auf Ihrer Investitionsreise in Georgien begleiten zu dürfen.</p>
          <p>In Ihrem Dashboard können Sie:</p>
          <ul>
            <li>Verfügbare Immobilien durchsuchen</li>
            <li>Service-Pakete buchen</li>
            <li>Ihre Investments verwalten</li>
            <li>Zahlungen einsehen</li>
          </ul>
          <p>Bei Fragen stehen wir Ihnen gerne zur Verfügung.</p>
          <p>Mit freundlichen Grüßen,<br>Ihr Angelus Management Team</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
}

export async function sendEmailVerification(to: string, token: string) {
  const verificationUrl = `${process.env.VITE_APP_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
  
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Bestätigen Sie Ihre E-Mail-Adresse',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #B8860B;">E-Mail-Bestätigung</h1>
          <p>Bitte bestätigen Sie Ihre E-Mail-Adresse, um Ihr Konto zu aktivieren.</p>
          <p style="margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #B8860B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              E-Mail bestätigen
            </a>
          </p>
          <p style="color: #666; font-size: 14px;">
            Oder kopieren Sie diesen Link in Ihren Browser:<br>
            <a href="${verificationUrl}">${verificationUrl}</a>
          </p>
          <p style="color: #666; font-size: 12px;">
            Dieser Link ist 24 Stunden gültig.
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Error sending verification email:', error);
  }
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const resetUrl = `${process.env.VITE_APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
  
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Passwort zurücksetzen',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #B8860B;">Passwort zurücksetzen</h1>
          <p>Sie haben eine Anfrage zum Zurücksetzen Ihres Passworts erhalten.</p>
          <p>Klicken Sie auf den folgenden Link, um ein neues Passwort festzulegen:</p>
          <p style="margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #B8860B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Passwort zurücksetzen
            </a>
          </p>
          <p style="color: #666; font-size: 14px;">
            Oder kopieren Sie diesen Link in Ihren Browser:<br>
            <a href="${resetUrl}">${resetUrl}</a>
          </p>
          <p style="color: #666; font-size: 12px;">
            Dieser Link ist 1 Stunde gültig. Wenn Sie diese Anfrage nicht gestellt haben, ignorieren Sie diese E-Mail.
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Error sending password reset email:', error);
  }
}

export async function sendBookingConfirmation(
  to: string,
  bookingDetails: {
    propertyTitle: string;
    totalPrice: number;
    downPayment: number;
    monthlyPayment: number;
    installments: number;
  }
) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Buchungsbestätigung - Angelus Management Georgia',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #B8860B;">Buchungsbestätigung</h1>
          <p>Vielen Dank für Ihre Buchung!</p>
          <h2>Immobilie: ${bookingDetails.propertyTitle}</h2>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="border-bottom: 1px solid #ddd;">
              <td style="padding: 10px;"><strong>Gesamtpreis:</strong></td>
              <td style="padding: 10px; text-align: right;">€${bookingDetails.totalPrice.toLocaleString()}</td>
            </tr>
            <tr style="border-bottom: 1px solid #ddd;">
              <td style="padding: 10px;"><strong>Anzahlung:</strong></td>
              <td style="padding: 10px; text-align: right;">€${bookingDetails.downPayment.toLocaleString()}</td>
            </tr>
            <tr style="border-bottom: 1px solid #ddd;">
              <td style="padding: 10px;"><strong>Monatliche Rate:</strong></td>
              <td style="padding: 10px; text-align: right;">€${bookingDetails.monthlyPayment.toLocaleString()}</td>
            </tr>
            <tr style="border-bottom: 1px solid #ddd;">
              <td style="padding: 10px;"><strong>Laufzeit:</strong></td>
              <td style="padding: 10px; text-align: right;">${bookingDetails.installments} Monate</td>
            </tr>
          </table>
          <p>Wir werden uns in Kürze mit Ihnen in Verbindung setzen, um die nächsten Schritte zu besprechen.</p>
          <p>Mit freundlichen Grüßen,<br>Ihr Angelus Management Team</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Error sending booking confirmation email:', error);
  }
}
