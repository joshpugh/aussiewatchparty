import 'server-only';
import { Resend } from 'resend';
import {
  confirmationEmail,
  reminderEmail,
  rsvpHostNotificationEmail,
  submissionReceivedEmail,
  submissionApprovedEmail,
  submissionRejectedEmail,
} from './templates';
import type { Match, Party, Rsvp } from '@/lib/db/schema';
import type { PartyWithMatch } from '@/lib/parties';

function client() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('RESEND_API_KEY is not set');
  return new Resend(key);
}

function from() {
  const f = process.env.RESEND_FROM;
  if (!f) throw new Error('RESEND_FROM is not set (e.g. "Aussie Watch Party <hello@your-domain.com>")');
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

/** Notify the host's private email whenever a new RSVP lands. */
export async function sendRsvpHostNotification(rsvp: Rsvp, party: Party, match: Match) {
  if (!party.hostEmail) return null;
  const { subject, html, text } = rsvpHostNotificationEmail({ rsvp, party, match });
  return client().emails.send({ from: from(), to: party.hostEmail, subject, html, text });
}

export async function sendSubmissionReceived(party: Party, matches: Match[]) {
  if (!party.hostEmail) return null;
  const { subject, html, text } = submissionReceivedEmail({ party, matches });
  return client().emails.send({ from: from(), to: party.hostEmail, subject, html, text });
}

export async function sendSubmissionApproved(party: PartyWithMatch) {
  if (!party.hostEmail) return null;
  const { subject, html, text } = submissionApprovedEmail({ party, match: party.match });
  return client().emails.send({ from: from(), to: party.hostEmail, subject, html, text });
}

export async function sendSubmissionRejected(party: PartyWithMatch, reason?: string) {
  if (!party.hostEmail) return null;
  const { subject, html, text } = submissionRejectedEmail({
    party,
    match: party.match,
    reason,
  });
  return client().emails.send({ from: from(), to: party.hostEmail, subject, html, text });
}
