const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.hostinger.com',
  port: 587,
  secure: false,
  requireTLS: true,
  connectionTimeout: 30000,
  greetingTimeout: 30000,
  socketTimeout: 30000,
  auth: {
    user: 'marklanders666@chaltet.com',
    pass: 't5K[^HOx6S;^'
  },
  tls: {
    rejectUnauthorized: false
  }
});

console.log('Tentative de vérification de la connexion SMTP (Port 587 avec Timeouts)...');

transporter.verify(function(error, success) {
  if (error) {
    console.error('VERIFY ERROR:', error);
    process.exit(1);
  } else {
    console.log('VERIFY SUCCESS: Server is ready to take our messages');
    process.exit(0);
  }
});
