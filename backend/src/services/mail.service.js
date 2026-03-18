// src/services/mail.service.js
const nodemailer = require('nodemailer');
const logger = require('../config/logger.config');

// En développement, toujours utiliser MailHog
// En production, utiliser les variables d'environnement
const isDev = process.env.NODE_ENV === 'development';

// Debug: Show which env vars are loaded
console.log('=== MAIL SERVICE DEBUG ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('MAIL_HOST:', process.env.MAIL_HOST);
console.log('MAIL_USER:', process.env.MAIL_USER ? 'SET' : 'NOT SET');
console.log('MAIL_PASSWORD:', process.env.MAIL_PASSWORD ? 'SET' : 'NOT SET');
console.log('========================');

const config = {
  host: isDev ? 'mailhog-griote' : (process.env.MAIL_HOST || process.env.SMTP_HOST || 'smtp.gmail.com'),
  port: isDev ? 1025 : parseInt(process.env.MAIL_PORT || process.env.SMTP_PORT || '587', 10),
  secure: isDev ? false : String(process.env.MAIL_SECURE || 'false').toLowerCase() === 'true',
  auth: isDev ? {
    user: '',
    pass: '',
  } : {
    user: process.env.MAIL_USER || process.env.SMTP_USER || '',
    pass: process.env.MAIL_PASSWORD || process.env.SMTP_PASSWORD || '',
  },
  tls: {
    rejectUnauthorized: !isDev,
  },
};

// En dev, on utilise toujours le transporter
// En prod, on vérifie les credentials
const useTransporter = isDev || Boolean(config.auth.user && config.auth.pass);

let transporter = null;

if (useTransporter) {
  transporter = nodemailer.createTransport(config);

  logger.info(
    `Email transporter configured → ${config.host}:${config.port} (secure: ${config.secure})`
  );

  transporter.verify((error) => {
    if (error) {
      logger.warn('SMTP connection failed at startup (will retry on each send)', {
        error: error.message,
      });
    } else {
      logger.info('SMTP connection successful – ready to send emails');
    }
  });
} else {
  logger.warn(
    'No SMTP credentials found → Development mode: emails will be logged only (no real send)'
  );
}

/**
 * Send verification email
 */
async function sendVerificationEmail(email, token) {
  const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  const html = `
    <h2 style="color:#0066cc;">Welcome to Griote Foundation!</h2>
    <p>Thank you for signing up.</p>
    <p>Please verify your email address by clicking the button below:</p>
    <p style="text-align:center; margin:30px 0;">
      <a href="${verificationLink}" style="background:#0066cc; color:white; padding:14px 28px; text-decoration:none; border-radius:8px; font-weight:bold;">
        Verify my email
      </a>
    </p>
    <p>Or copy-paste this link into your browser:</p>
    <p><strong>${verificationLink}</strong></p>
    <hr>
    <small>If you didn't create an account, you can ignore this email.</small>
  `;

  // Development mode – just log the link
  if (!transporter) {
    logger.info('VERIFICATION EMAIL (dev mode – not sent)', { to: email });
    logger.info(`Verification link → ${verificationLink}`);
    return true;
  }

  // Production – send with error handling
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'contact@griote.org',
      to: email,
      subject: 'Verify your email – Griote Foundation',
      html,
    });
    logger.info('Verification email sent successfully', { to: email });
    return true;
  } catch (err) {
    logger.warn('Failed to send verification email (registration continues anyway)', {
      to: email,
      error: err.message,
    });
    return true; // ✅ Still return true so registration continues
  }
}

/**
 * Send password reset email
 */
async function sendPasswordResetEmail(email, token) {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  const html = `
    <h2 style="color:#cc6600;">Password reset request</h2>
    <p>You requested a password reset.</p>
    <p>Click the button below to set a new password:</p>
    <p style="text-align:center; margin:30px 0;">
      <a href="${resetLink}" style="background:#cc6600; color:white; padding:14px 28px; text-decoration:none; border-radius:8px; font-weight:bold;">
        Reset my password
      </a>
    </p>
    <p>Or copy-paste this link:</p>
    <p><strong>${resetLink}</strong></p>
    <p><em>This link expires in 1 hour.</em></p>
    <hr>
    <small>If you didn't request this, you can safely ignore this email.</small>
  `;

  if (!transporter) {
    logger.info('PASSWORD RESET EMAIL (dev mode – not sent)', { to: email });
    logger.info(`Reset link → ${resetLink}`);
    return true;
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Griote Foundation" <no-reply@griote.org>',
      to: email,
      subject: 'Reset your password – Griote Foundation',
      html,
    });
    logger.info('Password reset email sent successfully', { to: email });
    return true;
  } catch (err) {
    logger.warn('Failed to send password reset email (operation continues)', {
      to: email,
      error: err.message,
    });
    return true;
  }
}

/**
 * Send depot approved notification
 */
async function sendDepotApprovedEmail(email, depotTitle) {
  const html = `
    <h2 style="color:#10b981;">Votre dépôt a été approuvé !</h2>
    <p>Bonjour,</p>
    <p>Nous avons le plaisir de vous informer que votre dépôt "<strong>${depotTitle}</strong>" a été approuvé et publié sur la plateforme Griote.</p>
    <p>Votre contribution est désormais visible par tous les utilisateurs.</p>
    <p>Cordialement,<br>L'équipe Griote Foundation</p>
  `;

  return sendEmail(email, 'Votre dépôt a été publié - Griote Foundation', html);
}

/**
 * Send depot rejected notification
 */
async function sendDepotRejectedEmail(email, depotTitle, reason) {
  const html = `
    <h2 style="color:#ef4444;">Votre dépôt a été rejeté</h2>
    <p>Bonjour,</p>
    <p>Nous regrettons de vous informer que votre dépôt "<strong>${depotTitle}</strong>" a été rejeté.</p>
    ${reason ? `<p><strong>Raison :</strong> ${reason}</p>` : ''}
    <p>Veuillez corriger les problèmes signalés et soumettre à nouveau votre dépôt.</p>
    <p>Cordialement,<br>L'équipe Griote Foundation</p>
  `;

  return sendEmail(email, 'Votre dépôt nécessite des modifications - Griote Foundation', html);
}

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendDepotApprovedEmail,
  sendDepotRejectedEmail,
  transporter,
};