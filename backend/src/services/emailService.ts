import nodemailer from 'nodemailer';

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

const getTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error('SMTP not configured');
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });
};

export const sendEmail = async ({ to, subject, html, text }: EmailPayload) => {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@abelaccessories.com';
  const transporter = getTransporter();
  await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html
  });
};
