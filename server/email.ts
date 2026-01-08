import sgMail from "@sendgrid/mail";

const API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || "noreply@chatlet.app";

if (!API_KEY) {
  console.warn("[SendGrid] API key not configured");
} else {
  sgMail.setApiKey(API_KEY);
}

export async function sendVerificationEmail(email: string, token: string): Promise<boolean> {
  if (!API_KEY) {
    console.warn("[SendGrid] Cannot send email: API key not configured");
    return false;
  }

  try {
    const verificationLink = `${process.env.PUBLIC_URL || "https://chatlet-i19c.onrender.com"}/verify?token=${token}`;
    
    await sgMail.send({
      to: email,
      from: FROM_EMAIL,
      subject: "Confirme ton email - Chatlet",
      html: `
        <h2>Bienvenue sur Chatlet ! 👋</h2>
        <p>Clique sur le lien ci-dessous pour confirmer ton email :</p>
        <a href="${verificationLink}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Confirmer mon email</a>
        <p>Ou copie ce lien : ${verificationLink}</p>
        <p>Le lien expire dans 24 heures.</p>
      `,
    });
    
    console.log(`📧 Verification email sent to ${email}`);
    return true;
  } catch (error) {
    console.error("[SendGrid] Failed to send verification email:", error);
    return false;
  }
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<boolean> {
  if (!API_KEY) {
    console.warn("[SendGrid] Cannot send email: API key not configured");
    return false;
  }

  try {
    const resetLink = `${process.env.PUBLIC_URL || "https://chatlet-i19c.onrender.com"}/reset-password?token=${token}`;
    
    await sgMail.send({
      to: email,
      from: FROM_EMAIL,
      subject: "Réinitialise ton mot de passe - Chatlet",
      html: `
        <h2>Réinitialisation de mot de passe 🔐</h2>
        <p>Clique sur le lien ci-dessous pour réinitialiser ton mot de passe :</p>
        <a href="${resetLink}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Réinitialiser mon mot de passe</a>
        <p>Ou copie ce lien : ${resetLink}</p>
        <p>Le lien expire dans 1 heure.</p>
        <p><strong>Attention :</strong> Si tu n'as pas demandé de réinitialisation, ignore ce mail.</p>
      `,
    });
    
    console.log(`📧 Password reset email sent to ${email}`);
    return true;
  } catch (error) {
    console.error("[SendGrid] Failed to send password reset email:", error);
    return false;
  }
}
