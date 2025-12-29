import { Resend } from 'resend';

const resend = new Resend(process.env.API_KEY_RESEND);

const FROM_EMAIL = 'Angelus Management Georgia <onboarding@resend.dev>';
const REPLY_TO_EMAIL = 'angelusmanagementgeorgia@gmail.com';

export async function sendWelcomeEmail(to: string, name: string) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      replyTo: REPLY_TO_EMAIL,
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
      replyTo: REPLY_TO_EMAIL,
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
      replyTo: REPLY_TO_EMAIL,
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
      replyTo: REPLY_TO_EMAIL,
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


// E-Commerce Order Confirmation Email
export async function sendOrderConfirmation(
  to: string,
  orderDetails: {
    orderNumber: string;
    customerName: string;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
    totalAmount: number;
    paymentMethod: string;
    paymentInstructions?: string;
  }
) {
  const itemsHtml = orderDetails.items.map(item => `
    <tr style="border-bottom: 1px solid #eee;">
      <td style="padding: 12px;">${item.name}</td>
      <td style="padding: 12px; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; text-align: right;">€${item.price.toLocaleString()}</td>
    </tr>
  `).join('');

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      replyTo: REPLY_TO_EMAIL,
      to,
      subject: `Bestellbestätigung #${orderDetails.orderNumber} - Angelus Management Georgia`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #B8860B; margin: 0;">Bestellbestätigung</h1>
              <p style="color: #666; margin-top: 10px;">Bestellung #${orderDetails.orderNumber}</p>
            </div>
            
            <p>Sehr geehrte(r) ${orderDetails.customerName},</p>
            <p>vielen Dank für Ihre Bestellung bei Angelus Management Georgia!</p>
            
            <h2 style="color: #333; border-bottom: 2px solid #B8860B; padding-bottom: 10px;">Ihre Bestellung</h2>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <thead>
                <tr style="background-color: #f5f5f5;">
                  <th style="padding: 12px; text-align: left;">Artikel</th>
                  <th style="padding: 12px; text-align: center;">Menge</th>
                  <th style="padding: 12px; text-align: right;">Preis</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                <tr style="background-color: #B8860B; color: white;">
                  <td colspan="2" style="padding: 12px;"><strong>Gesamtsumme</strong></td>
                  <td style="padding: 12px; text-align: right;"><strong>€${orderDetails.totalAmount.toLocaleString()}</strong></td>
                </tr>
              </tfoot>
            </table>
            
            <h2 style="color: #333; border-bottom: 2px solid #B8860B; padding-bottom: 10px;">Zahlungsinformationen</h2>
            <p><strong>Zahlungsmethode:</strong> ${orderDetails.paymentMethod}</p>
            ${orderDetails.paymentInstructions ? `
              <div style="background-color: #fff8e1; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #B8860B;">
                <p style="margin: 0;"><strong>Zahlungsanweisungen:</strong></p>
                <p style="margin: 10px 0 0 0; white-space: pre-line;">${orderDetails.paymentInstructions}</p>
              </div>
            ` : ''}
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #666; font-size: 14px;">
                Bei Fragen zu Ihrer Bestellung kontaktieren Sie uns bitte unter:<br>
                <a href="mailto:angelusmanagementgeorgia@gmail.com" style="color: #B8860B;">angelusmanagementgeorgia@gmail.com</a><br>
                Tel: +995 579 10 67 19
              </p>
            </div>
            
            <p style="margin-top: 30px;">Mit freundlichen Grüßen,<br><strong>Ihr Angelus Management Team</strong></p>
          </div>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    return { success: false, error };
  }
}

// Payment Received Confirmation Email
export async function sendPaymentReceivedEmail(
  to: string,
  paymentDetails: {
    orderNumber: string;
    customerName: string;
    amount: number;
    paymentMethod: string;
    transactionId?: string;
    remainingBalance?: number;
  }
) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      replyTo: REPLY_TO_EMAIL,
      to,
      subject: `Zahlungseingang bestätigt #${paymentDetails.orderNumber} - Angelus Management Georgia`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="background-color: #4CAF50; color: white; width: 60px; height: 60px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 30px;">✓</div>
              <h1 style="color: #4CAF50; margin: 20px 0 0 0;">Zahlung erhalten</h1>
            </div>
            
            <p>Sehr geehrte(r) ${paymentDetails.customerName},</p>
            <p>wir bestätigen den Eingang Ihrer Zahlung für Bestellung #${paymentDetails.orderNumber}.</p>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <table style="width: 100%;">
                <tr>
                  <td style="padding: 8px 0;"><strong>Betrag:</strong></td>
                  <td style="text-align: right; color: #4CAF50; font-size: 18px;"><strong>€${paymentDetails.amount.toLocaleString()}</strong></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Zahlungsmethode:</strong></td>
                  <td style="text-align: right;">${paymentDetails.paymentMethod}</td>
                </tr>
                ${paymentDetails.transactionId ? `
                <tr>
                  <td style="padding: 8px 0;"><strong>Transaktions-ID:</strong></td>
                  <td style="text-align: right; font-family: monospace; font-size: 12px;">${paymentDetails.transactionId}</td>
                </tr>
                ` : ''}
                ${paymentDetails.remainingBalance !== undefined && paymentDetails.remainingBalance > 0 ? `
                <tr style="border-top: 1px solid #ddd;">
                  <td style="padding: 8px 0;"><strong>Restbetrag:</strong></td>
                  <td style="text-align: right; color: #B8860B;"><strong>€${paymentDetails.remainingBalance.toLocaleString()}</strong></td>
                </tr>
                ` : ''}
              </table>
            </div>
            
            ${paymentDetails.remainingBalance === 0 || paymentDetails.remainingBalance === undefined ? `
            <div style="background-color: #e8f5e9; padding: 15px; border-radius: 5px; text-align: center;">
              <p style="margin: 0; color: #2e7d32;"><strong>✓ Ihre Bestellung ist vollständig bezahlt</strong></p>
            </div>
            ` : ''}
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #666; font-size: 14px;">
                Sie können den Status Ihrer Bestellung jederzeit in Ihrem Dashboard einsehen.
              </p>
            </div>
            
            <p style="margin-top: 30px;">Mit freundlichen Grüßen,<br><strong>Ihr Angelus Management Team</strong></p>
          </div>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error('Error sending payment received email:', error);
    return { success: false, error };
  }
}

// Admin Notification for New Order
export async function sendAdminOrderNotification(
  orderDetails: {
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    totalAmount: number;
    paymentMethod: string;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
  }
) {
  const adminEmail = 'angelusmanagementgeorgia@gmail.com';
  
  const itemsHtml = orderDetails.items.map(item => `
    <tr style="border-bottom: 1px solid #eee;">
      <td style="padding: 8px;">${item.name}</td>
      <td style="padding: 8px; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; text-align: right;">€${item.price.toLocaleString()}</td>
    </tr>
  `).join('');

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      replyTo: REPLY_TO_EMAIL,
      to: adminEmail,
      subject: `🔔 Neue Bestellung #${orderDetails.orderNumber} - €${orderDetails.totalAmount.toLocaleString()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #B8860B; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">Neue Bestellung eingegangen!</h1>
          </div>
          
          <div style="padding: 20px; background-color: #f9f9f9;">
            <h2 style="color: #333;">Bestellung #${orderDetails.orderNumber}</h2>
            
            <div style="background-color: white; padding: 15px; border-radius: 5px; margin-bottom: 15px;">
              <h3 style="margin-top: 0; color: #B8860B;">Kundeninformationen</h3>
              <p><strong>Name:</strong> ${orderDetails.customerName}</p>
              <p><strong>E-Mail:</strong> <a href="mailto:${orderDetails.customerEmail}">${orderDetails.customerEmail}</a></p>
            </div>
            
            <div style="background-color: white; padding: 15px; border-radius: 5px; margin-bottom: 15px;">
              <h3 style="margin-top: 0; color: #B8860B;">Bestelldetails</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background-color: #f5f5f5;">
                    <th style="padding: 8px; text-align: left;">Artikel</th>
                    <th style="padding: 8px; text-align: center;">Menge</th>
                    <th style="padding: 8px; text-align: right;">Preis</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
              <p style="text-align: right; font-size: 18px; margin-top: 15px;">
                <strong>Gesamt: €${orderDetails.totalAmount.toLocaleString()}</strong>
              </p>
            </div>
            
            <div style="background-color: white; padding: 15px; border-radius: 5px;">
              <h3 style="margin-top: 0; color: #B8860B;">Zahlungsmethode</h3>
              <p style="font-size: 16px;"><strong>${orderDetails.paymentMethod}</strong></p>
            </div>
          </div>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error('Error sending admin order notification:', error);
    return { success: false, error };
  }
}

// ==================== WALLET EMAIL FUNCTIONS ====================

import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Get user email by user ID
 */
async function getUserEmailById(userId: number): Promise<{ email: string; name: string } | null> {
  const db = await getDb();
  if (!db) return null;
  
  const user = await db.select({
    email: users.email,
    firstName: users.firstName,
    lastName: users.lastName,
  }).from(users).where(eq(users.id, userId)).limit(1);
  
  if (user.length === 0 || !user[0].email) return null;
  
  return {
    email: user[0].email,
    name: `${user[0].firstName || ''} ${user[0].lastName || ''}`.trim() || 'Kunde',
  };
}

/**
 * Send email when a deposit is confirmed
 */
export async function sendDepositConfirmationEmail(
  userId: number,
  amount: number,
  method: string,
  newBalance: number
): Promise<{ success: boolean; error?: any }> {
  try {
    const userData = await getUserEmailById(userId);
    if (!userData) {
      console.error('User not found for deposit confirmation email');
      return { success: false, error: 'User not found' };
    }

    const methodLabel = method === 'bank_transfer' ? 'Banküberweisung' :
                        method === 'crypto_btc' ? 'Bitcoin' :
                        method === 'crypto_eth' ? 'Ethereum' :
                        method === 'crypto_usdt' ? 'USDT' : 'Krypto';

    await resend.emails.send({
      from: FROM_EMAIL,
      replyTo: REPLY_TO_EMAIL,
      to: userData.email,
      subject: 'Einzahlung bestätigt - Angelus Management Georgia',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #B8860B;">Einzahlung bestätigt</h1>
          <p>Guten Tag ${userData.name},</p>
          <p>Ihre Einzahlung wurde erfolgreich bestätigt und Ihrem Wallet gutgeschrieben.</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <table style="width: 100%;">
              <tr>
                <td style="padding: 8px 0;"><strong>Betrag:</strong></td>
                <td style="text-align: right; color: #2e7d32; font-weight: bold;">+${amount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Zahlungsmethode:</strong></td>
                <td style="text-align: right;">${methodLabel}</td>
              </tr>
              <tr style="border-top: 1px solid #ddd;">
                <td style="padding: 12px 0;"><strong>Neues Guthaben:</strong></td>
                <td style="text-align: right; font-size: 18px; font-weight: bold; color: #B8860B;">${newBalance.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</td>
              </tr>
            </table>
          </div>
          
          <p>Sie können Ihr Guthaben jetzt für Immobilienkäufe und Services verwenden.</p>
          
          <p style="margin-top: 30px;">
            <a href="${process.env.VITE_APP_URL || 'http://localhost:3000'}/wallet" 
               style="background-color: #B8860B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Zum Wallet
            </a>
          </p>
          
          <p style="margin-top: 30px;">Mit freundlichen Grüßen,<br>Ihr Angelus Management Team</p>
        </div>
      `,
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error sending deposit confirmation email:', error);
    return { success: false, error };
  }
}

/**
 * Send email when interest is credited to bonus balance
 */
export async function sendInterestCreditEmail(
  userId: number,
  interestAmount: number,
  newBonusBalance: number
): Promise<{ success: boolean; error?: any }> {
  try {
    const userData = await getUserEmailById(userId);
    if (!userData) {
      console.error('User not found for interest credit email');
      return { success: false, error: 'User not found' };
    }

    await resend.emails.send({
      from: FROM_EMAIL,
      replyTo: REPLY_TO_EMAIL,
      to: userData.email,
      subject: 'Zinsgutschrift - Angelus Management Georgia',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #B8860B;">Zinsgutschrift</h1>
          <p>Guten Tag ${userData.name},</p>
          <p>Ihnen wurden Zinsen auf Ihr Bonus-Guthaben gutgeschrieben.</p>
          
          <div style="background-color: #fff8e1; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #B8860B;">
            <table style="width: 100%;">
              <tr>
                <td style="padding: 8px 0;"><strong>Zinsgutschrift:</strong></td>
                <td style="text-align: right; color: #2e7d32; font-weight: bold;">+${interestAmount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Zinssatz:</strong></td>
                <td style="text-align: right;">7% p.a.</td>
              </tr>
              <tr style="border-top: 1px solid #B8860B;">
                <td style="padding: 12px 0;"><strong>Neues Bonus-Guthaben:</strong></td>
                <td style="text-align: right; font-size: 18px; font-weight: bold; color: #B8860B;">${newBonusBalance.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</td>
              </tr>
            </table>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            <strong>Hinweis:</strong> Das Bonus-Guthaben kann für Einkäufe bei Angelus Management Georgia verwendet werden.
            Es ist nicht auszahlbar, bietet Ihnen aber einen wertvollen Rabatt auf Ihre Investitionen.
          </p>
          
          <p style="margin-top: 30px;">
            <a href="${process.env.VITE_APP_URL || 'http://localhost:3000'}/wallet" 
               style="background-color: #B8860B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Zum Wallet
            </a>
          </p>
          
          <p style="margin-top: 30px;">Mit freundlichen Grüßen,<br>Ihr Angelus Management Team</p>
        </div>
      `,
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error sending interest credit email:', error);
    return { success: false, error };
  }
}

/**
 * Send email when a deposit request is rejected
 */
export async function sendDepositRejectionEmail(
  userId: number,
  amount: number,
  reason: string
): Promise<{ success: boolean; error?: any }> {
  try {
    const userData = await getUserEmailById(userId);
    if (!userData) {
      console.error('User not found for deposit rejection email');
      return { success: false, error: 'User not found' };
    }

    await resend.emails.send({
      from: FROM_EMAIL,
      replyTo: REPLY_TO_EMAIL,
      to: userData.email,
      subject: 'Einzahlung nicht bestätigt - Angelus Management Georgia',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #B8860B;">Einzahlung nicht bestätigt</h1>
          <p>Guten Tag ${userData.name},</p>
          <p>Leider konnte Ihre Einzahlungsanfrage nicht bestätigt werden.</p>
          
          <div style="background-color: #ffebee; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <table style="width: 100%;">
              <tr>
                <td style="padding: 8px 0;"><strong>Betrag:</strong></td>
                <td style="text-align: right;">${amount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Grund:</strong></td>
                <td style="text-align: right;">${reason}</td>
              </tr>
            </table>
          </div>
          
          <p>Bitte kontaktieren Sie uns bei Fragen oder versuchen Sie es erneut.</p>
          
          <p style="margin-top: 30px;">
            <a href="${process.env.VITE_APP_URL || 'http://localhost:3000'}/wallet" 
               style="background-color: #B8860B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Neue Einzahlung
            </a>
          </p>
          
          <p style="margin-top: 30px;">Mit freundlichen Grüßen,<br>Ihr Angelus Management Team</p>
        </div>
      `,
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error sending deposit rejection email:', error);
    return { success: false, error };
  }
}
