import sgMail from "@sendgrid/mail";
import nodemailer from "nodemailer";

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.EMAIL_FROM || process.env.SENDGRID_FROM_EMAIL || "noreply@chatlet.app";

// Configuration SMTP (Hostinger ou autre)
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.hostinger.com';
const SMTP_PORT = Number(process.env.SMTP_PORT) || 587;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

let transporter: any = null;

if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
  console.log("[Email] SMTP configured using", SMTP_HOST, "on port", SMTP_PORT);
  
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: false, // IMPORTANT avec 587
    requireTLS: true,
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 30000,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false, // important sur certains environnements
    },
  });

  transporter.verify((err: any, success: any) => {
    console.log("[Email] VERIFY ERROR:", err);
    console.log("[Email] VERIFY SUCCESS:", success);
  });
} else if (SENDGRID_API_KEY) {
  console.log("[Email] SendGrid configured");
  sgMail.setApiKey(SENDGRID_API_KEY);
} else {
  console.warn("[Email] No email service configured (SMTP or SendGrid)");
}

export async function sendVerificationEmail(email: string, token: string): Promise<boolean> {
  const verificationLink = `${process.env.PUBLIC_URL || "https://" + (process.env.DOMAIN || "chatlet.app")}/verify?token=${token}`;
  const subject = "Confirme ton email - Chatlet";
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #3b82f6;">Bienvenue sur Chatlet ! 👋</h2>
      <p>Clique sur le lien ci-dessous pour confirmer ton email :</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationLink}" style="background-color: #3b82f6; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Confirmer mon email</a>
      </div>
      <p style="color: #666; font-size: 14px;">Ou copie ce lien : <br>${verificationLink}</p>
      <p style="color: #999; font-size: 12px; margin-top: 30px;">Le lien expire dans 24 heures.</p>
    </div>
  `;

  return sendEmail(email, subject, html);
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<boolean> {
  const resetLink = `${process.env.PUBLIC_URL || "https://" + (process.env.DOMAIN || "chatlet.app")}/reset-password?token=${token}`;
  const subject = "Réinitialise ton mot de passe - Chatlet";
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #3b82f6;">Réinitialisation de mot de passe 🔐</h2>
      <p>Clique sur le lien ci-dessous pour réinitialiser ton mot de passe :</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" style="background-color: #3b82f6; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Réinitialiser mon mot de passe</a>
      </div>
      <p style="color: #666; font-size: 14px;">Ou copie ce lien : <br>${resetLink}</p>
      <p style="color: #999; font-size: 12px; margin-top: 30px;">Le lien expire dans 1 heure.</p>
      <p style="color: #999; font-size: 12px;">Si tu n'as pas demandé de réinitialisation, ignore ce mail.</p>
    </div>
  `;

  return sendEmail(email, subject, html);
}

async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  try {
    if (transporter) {
      await transporter.sendMail({
        from: FROM_EMAIL,
        to,
        subject,
        html,
      });
      console.log(`📧 Email (SMTP) sent to ${to}`);
      return true;
    } else if (SENDGRID_API_KEY) {
      await sgMail.send({
        to,
        from: FROM_EMAIL,
        subject,
        html,
      });
      console.log(`📧 Email (SendGrid) sent to ${to}`);
      return true;
    } else {
      console.warn("[Email] No email service available to send email");
      return false;
    }
  } catch (error) {
    console.error("[Email] Failed to send email:", error);
    return false;
  }
}
