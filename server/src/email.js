// Sending emails, through Resend (resend.com). We call its HTTP API with fetch, so no extra package.
//
// Needs two values in .env:
//   RESEND_API_KEY  from the Resend dashboard -> API Keys
//   EMAIL_FROM      who the email is from, e.g. "Lens Theory <hello@lenstheory.co.uk>"
//                   (until you verify a domain in Resend, use "Lens Theory <onboarding@resend.dev>",
//                   which can only send to the email address you signed up to Resend with)

export function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM)
}

// Sends one plain-text email. Throws an Error with Resend's message if it was refused.
// `replyTo`: where the customer's answer goes when they press Reply in their inbox.
export async function sendEmail({ to, subject, text, replyTo }) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: process.env.EMAIL_FROM, to: [to], subject, text, reply_to: replyTo }),
  })

  if (!response.ok) {
    const data = await response.json().catch(() => null)
    throw new Error(data?.message ?? `The email could not be sent (${response.status})`)
  }
}
