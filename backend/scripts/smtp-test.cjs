const path = require('node:path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local'), override: true });
const nodemailer = require('nodemailer');

async function main() {
  const required = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'MAIL_FROM', 'FORMS_RECEIVER'];
  const missing = required.filter(key => !process.env[key]?.trim());
  if (missing.length) {
    console.error('Fill these settings in backend/.env.local: ' + missing.join(', '));
    process.exitCode = 1;
    return;
  }
  const port = Number(process.env.SMTP_PORT);
  if (![465, 2526].includes(port)) throw new Error('Use the WorldPosta port: 465 or 2526.');
  const mailer = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    requireTLS: port !== 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 30000,
  });
  await mailer.verify();
  console.log('SMTP connection and login succeeded.');
  if (!process.argv.includes('--send')) {
    console.log('Connection check only. Add --send to send one test email.');
    return;
  }
  const result = await mailer.sendMail({
    from: process.env.MAIL_FROM,
    to: process.env.FORMS_RECEIVER,
    subject: 'Roaya - Form notification test',
    text: 'This is a test of your SMTP connection. No real form data is included.\nSent at: ' + new Date().toISOString(),
  });
  if (!result.accepted?.length || result.rejected?.length) throw new Error('Recipient was not accepted by the SMTP server.');
  console.log('SMTP server accepted the test email. Check your inbox and spam folder.');
}
main().catch(error => {
  console.error('SMTP test failed. Code:', error.code || 'UNKNOWN', 'SMTP status:', error.responseCode || 'none');
  process.exitCode = 1;
});
