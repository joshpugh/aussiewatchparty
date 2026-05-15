import type { Match, Party, Rsvp } from '@/lib/db/schema';

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
}

/**
 * We don't know the recipient's timezone at send time, so emails format
 * kickoffs in Eastern Time (the most commonly-relevant US timezone for our
 * audience). The site itself shows the visitor's local timezone.
 */
function formatKickoff(d: Date) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
    timeZone: 'America/New_York',
  }).format(d);
}

function shell(title: string, body: string, footer = `You're getting this because you RSVP'd at <a href="${siteUrl()}" style="color:#00843D">aussiewatchparty.com</a>.`) {
  return `<!doctype html>
<html><head><meta charset="utf-8"><title>${title}</title></head>
<body style="margin:0;background:#f7f7f5;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;color:#0a0a0a">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f7f5">
    <tr><td align="center" style="padding:24px">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e5e5e5;border-radius:12px;overflow:hidden">
        <tr><td style="background:#00843D;padding:20px 24px;color:#FFCD00;font-weight:800;font-size:18px;letter-spacing:0.5px">
          GO SOCCEROOS ✨
        </td></tr>
        <tr><td style="padding:24px">${body}</td></tr>
        <tr><td style="padding:16px 24px;background:#fafaf7;color:#737373;font-size:12px;line-height:1.5">
          ${footer}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export function confirmationEmail({
  rsvp,
  party,
  match,
}: {
  rsvp: Rsvp;
  party: Party;
  match: Match;
}) {
  const subject = `You're in — ${party.venueName} for ${match.opponent}`;
  const partyUrl = `${siteUrl()}/parties/${party.slug}`;
  const body = `
    <h1 style="margin:0 0 12px;font-size:22px">G'day ${rsvp.name.split(' ')[0]} — you're locked in.</h1>
    <p style="margin:0 0 16px;line-height:1.55">
      You're heading to <strong>${party.venueName}</strong> to watch the Socceroos take on
      <strong>${match.opponent}</strong>.
    </p>
    <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:0 0 16px">
      <tr><td style="padding:4px 0;color:#737373;width:120px">Kickoff</td><td>${formatKickoff(match.kickoffUtc)}</td></tr>
      <tr><td style="padding:4px 0;color:#737373">Where</td><td>${party.venueName}<br>${party.addressLine}, ${party.city}, ${party.state} ${party.zip}</td></tr>
      <tr><td style="padding:4px 0;color:#737373">Your group</td><td>${rsvp.partySize} ${rsvp.partySize === 1 ? 'person' : 'people'}</td></tr>
    </table>
    ${party.hostNotes ? `<p style="margin:0 0 16px;padding:12px;background:#fff8dc;border-left:3px solid #FFCD00;line-height:1.55">${party.hostNotes}</p>` : ''}
    <p style="margin:0 0 20px">
      <a href="${partyUrl}" style="display:inline-block;padding:12px 20px;background:#00843D;color:#FFCD00;border-radius:8px;text-decoration:none;font-weight:700">View watch party details</a>
    </p>
    <p style="margin:0;color:#737373;font-size:13px;line-height:1.5">
      We'll send a reminder ~24 hours before kickoff. If plans change, just reply to this email and we'll sort it.
    </p>
  `;
  return {
    subject,
    html: shell(subject, body),
    text:
      `You're in!\n\n${party.venueName}\n${party.addressLine}, ${party.city}, ${party.state} ${party.zip}\n` +
      `Kickoff: ${formatKickoff(match.kickoffUtc)}\n` +
      `Party size: ${rsvp.partySize}\n\n${partyUrl}\n`,
  };
}

/** Sent to a venue host when a new RSVP comes in for their watch party. */
export function rsvpHostNotificationEmail({
  rsvp,
  party,
  match,
}: {
  rsvp: Rsvp;
  party: Party;
  match: Match;
}) {
  const subject = `New RSVP — ${rsvp.name} for ${party.venueName} (vs ${match.opponent})`;
  const partyUrl = `${siteUrl()}/parties/${party.slug}`;
  const body = `
    <h1 style="margin:0 0 12px;font-size:22px">New RSVP at ${party.venueName}.</h1>
    <p style="margin:0 0 16px;line-height:1.55">
      Someone just RSVP'd to your watch party for <strong>AUS vs ${match.opponent}</strong>.
    </p>
    <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:0 0 16px">
      <tr><td style="padding:4px 0;color:#737373;width:120px">Name</td><td>${rsvp.name}</td></tr>
      <tr><td style="padding:4px 0;color:#737373">Email</td><td><a href="mailto:${rsvp.email}" style="color:#00843D">${rsvp.email}</a></td></tr>
      <tr><td style="padding:4px 0;color:#737373">Group size</td><td>${rsvp.partySize} ${rsvp.partySize === 1 ? 'person' : 'people'}</td></tr>
      <tr><td style="padding:4px 0;color:#737373">Match</td><td>AUS vs ${match.opponent} · ${formatKickoff(match.kickoffUtc)}</td></tr>
    </table>
    <p style="margin:0 0 20px">
      <a href="${partyUrl}" style="display:inline-block;padding:12px 20px;background:#00843D;color:#FFCD00;border-radius:8px;text-decoration:none;font-weight:700">View watch party page</a>
    </p>
    <p style="margin:0;color:#737373;font-size:13px;line-height:1.5">
      You'll get one of these for each RSVP. Reply to this email if anything looks off.
    </p>
  `;
  const footer = `You're hosting <strong>${party.venueName}</strong> on aussiewatchparty.com. RSVP alerts go to this address.`;
  return {
    subject,
    html: shell(subject, body, footer),
    text:
      `New RSVP at ${party.venueName}\n\nName: ${rsvp.name}\nEmail: ${rsvp.email}\n` +
      `Group size: ${rsvp.partySize}\nMatch: AUS vs ${match.opponent} (${formatKickoff(match.kickoffUtc)})\n\n${partyUrl}`,
  };
}

/** Sent to a host immediately after they submit /submit. May reference
 *  multiple matches if they selected more than one. */
export function submissionReceivedEmail({
  party,
  matches,
}: {
  party: Party;
  matches: Match[];
}) {
  const subject = `We got your watch party — ${party.venueName}`;
  const matchRows = matches
    .map(
      (m) =>
        `<tr><td style="padding:4px 0;color:#737373">Match</td><td>AUS vs ${m.opponent} · ${formatKickoff(m.kickoffUtc)}</td></tr>`,
    )
    .join('');
  const body = `
    <h1 style="margin:0 0 12px;font-size:22px">Thanks for putting your hand up.</h1>
    <p style="margin:0 0 16px;line-height:1.55">
      We received your submission for <strong>${party.venueName}</strong>. Someone will review
      it within 24 hours and email you back when it&apos;s live (or if we need to clarify
      anything).
    </p>
    <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:0 0 16px">
      <tr><td style="padding:4px 0;color:#737373;width:120px">Venue</td><td>${party.venueName}</td></tr>
      <tr><td style="padding:4px 0;color:#737373">Address</td><td>${party.addressLine}, ${party.city}, ${party.state} ${party.zip}</td></tr>
      ${matchRows}
    </table>
    <p style="margin:0;color:#737373;font-size:13px;line-height:1.5">
      Need to change something or cancel? Reply to this email and we&apos;ll sort it.
    </p>
  `;
  const footer = `You submitted this watch party on aussiewatchparty.com.`;
  return {
    subject,
    html: shell(subject, body, footer),
    text:
      `Thanks for submitting!\n\nVenue: ${party.venueName}\n` +
      `${party.addressLine}, ${party.city}, ${party.state} ${party.zip}\n` +
      matches.map((m) => `Match: AUS vs ${m.opponent} (${formatKickoff(m.kickoffUtc)})`).join('\n') +
      `\n\nWe'll review within 24h and let you know.`,
  };
}

/** Sent when admin approves a public submission. */
export function submissionApprovedEmail({
  party,
  match,
}: {
  party: Party;
  match: Match;
}) {
  const subject = `You're live — ${party.venueName} on aussiewatchparty.com`;
  const partyUrl = `${siteUrl()}/parties/${party.slug}`;
  const body = `
    <h1 style="margin:0 0 12px;font-size:22px">You&apos;re on the map. Literally.</h1>
    <p style="margin:0 0 16px;line-height:1.55">
      <strong>${party.venueName}</strong> is now listed for <strong>AUS vs ${match.opponent}</strong>.
      Fans in your area can RSVP and we&apos;ll email you whenever they do.
    </p>
    <p style="margin:0 0 20px">
      <a href="${partyUrl}" style="display:inline-block;padding:12px 20px;background:#00843D;color:#FFCD00;border-radius:8px;text-decoration:none;font-weight:700">View your listing</a>
    </p>
    <p style="margin:0;color:#737373;font-size:13px;line-height:1.5">
      Need to change something or cancel? Reply to this email.
    </p>
  `;
  const footer = `You submitted this watch party on aussiewatchparty.com.`;
  return {
    subject,
    html: shell(subject, body, footer),
    text: `Live!\n${party.venueName} — AUS vs ${match.opponent}\n${partyUrl}`,
  };
}

/** Sent when admin rejects a public submission. */
export function submissionRejectedEmail({
  party,
  match,
  reason,
}: {
  party: Party;
  match: Match;
  reason?: string;
}) {
  const subject = `Couldn't list ${party.venueName}`;
  const body = `
    <h1 style="margin:0 0 12px;font-size:22px">Sorry — we couldn&apos;t list this one.</h1>
    <p style="margin:0 0 16px;line-height:1.55">
      Your submission for <strong>${party.venueName}</strong> (AUS vs ${match.opponent}) won&apos;t
      be published. ${reason ? `Here&apos;s why:` : 'Reply if you&apos;d like to know more.'}
    </p>
    ${reason ? `<p style="margin:0 0 16px;padding:12px;background:#fff8dc;border-left:3px solid #FFCD00;line-height:1.55">${reason}</p>` : ''}
    <p style="margin:0;color:#737373;font-size:13px;line-height:1.5">
      Reply to this email if there&apos;s something we got wrong — we&apos;d love to fix it and get you listed.
    </p>
  `;
  const footer = `You submitted this watch party on aussiewatchparty.com.`;
  return {
    subject,
    html: shell(subject, body, footer),
    text: `We couldn't list ${party.venueName}.\n${reason ? `\nReason: ${reason}` : ''}`,
  };
}

export function reminderEmail({
  rsvp,
  party,
  match,
}: {
  rsvp: Rsvp;
  party: Party;
  match: Match;
}) {
  const subject = `Tomorrow — ${match.opponent} at ${party.venueName}`;
  const partyUrl = `${siteUrl()}/parties/${party.slug}`;
  const body = `
    <h1 style="margin:0 0 12px;font-size:22px">Match day's nearly here.</h1>
    <p style="margin:0 0 16px;line-height:1.55">
      Quick reminder: the Socceroos play <strong>${match.opponent}</strong> at <strong>${formatKickoff(match.kickoffUtc)}</strong>.
    </p>
    <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:0 0 16px">
      <tr><td style="padding:4px 0;color:#737373;width:120px">Where</td><td>${party.venueName}<br>${party.addressLine}, ${party.city}, ${party.state} ${party.zip}</td></tr>
      <tr><td style="padding:4px 0;color:#737373">Your group</td><td>${rsvp.partySize} ${rsvp.partySize === 1 ? 'person' : 'people'}</td></tr>
    </table>
    <p style="margin:0 0 20px">
      <a href="${partyUrl}" style="display:inline-block;padding:12px 20px;background:#00843D;color:#FFCD00;border-radius:8px;text-decoration:none;font-weight:700">Watch party details</a>
    </p>
  `;
  return {
    subject,
    html: shell(subject, body),
    text: `Reminder: Socceroos vs ${match.opponent}\n${formatKickoff(match.kickoffUtc)}\n${party.venueName} — ${party.addressLine}, ${party.city}, ${party.state}\n${partyUrl}`,
  };
}
