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

function shell(title: string, body: string) {
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
          You're getting this because you RSVP'd at <a href="${siteUrl()}" style="color:#00843D">aussiewatchparty.com</a>.
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
