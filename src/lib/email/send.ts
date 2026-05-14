import 'server-only';
import { Resend } from 'resend';
import { confirmationEmail, reminderEmail } from './templates';
import type { Match, Party, Rsvp } from '@/lib/db/schema';

function client() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('RESEND_API_KEY is not set');
  return new Resend(key);
}

function from() {
  const f = process.env.RESEND_FROM;
  if (!f) throw new Error('RESEND_FROM is not set (e.g. "Socceroos <hello@your-domain.com>")');
  return f;
}

export async function sendConfirmation(rsvp: Rsvp, party: Party, match: Match) {
  const { subject, html, text } = confirmationEmail({ rsvp, party, match });
  return client().emails.send({ from: from(), to: rsvp.email, subject, html, text });
}

export async function sendReminder(rsvp: Rsvp, party: Party, match: Match) {
  const { subject, html, text } = reminderEmail({ rsvp, party, match });
  return client().emails.send({ from: from(), to: rsvp.email, subject, html, text });
}
