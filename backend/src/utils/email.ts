import { logger } from '../logger.js';

export interface SendOptions { to: string; subject: string; html: string; text: string; }
export interface EmailProvider { sendEmail(opts: SendOptions): Promise<void>; }

class SendGridProvider implements EmailProvider {
  private sg: any;
  private from: string;
  constructor(apiKey: string, from: string){
    // lazy require to keep optional
    // @ts-ignore
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(apiKey);
    this.sg = sgMail;
    this.from = from;
  }
  async sendEmail(opts: SendOptions){
    await this.sg.send({ to: opts.to, from: this.from, subject: opts.subject, html: opts.html, text: opts.text });
  }
}

class ResendProvider implements EmailProvider {
  private resend: any;
  private from: string;
  constructor(apiKey: string, from: string){
    // @ts-ignore
    const { Resend } = require('resend');
    this.resend = new Resend(apiKey);
    this.from = from;
  }
  async sendEmail(opts: SendOptions){
    await this.resend.emails.send({ from: this.from, to: opts.to, subject: opts.subject, html: opts.html, text: opts.text });
  }
}

export function createEmailProvider(): EmailProvider | null {
  const from = process.env.EMAIL_FROM || 'AI Platforms <noreply@example.com>';
  if (process.env.SENDGRID_API_KEY) return new SendGridProvider(process.env.SENDGRID_API_KEY, from);
  if (process.env.RESEND_API_KEY) return new ResendProvider(process.env.RESEND_API_KEY, from);
  logger.warn('No email provider configured');
  return null;
}

export function confirmationEmailTemplate(link: string){
  const html = `<div style="font-family:system-ui;padding:24px"><h1>Confirm your subscription</h1><p>Click the button below to confirm your email subscription to AI Platforms Hub.</p><p style="margin:32px 0"><a href="${link}" style="background:#6366f1;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600">Confirm Subscription</a></p><p>If the button doesn't work, copy and paste this URL into your browser:</p><code>${link}</code><p style="margin-top:40px;font-size:12px;opacity:.7">If you did not subscribe you can ignore this email.</p></div>`;
  const text = `Confirm your subscription: ${link}\nIf you did not subscribe just ignore this email.`;
  return { html, text, subject: 'Confirm your subscription' };
}
