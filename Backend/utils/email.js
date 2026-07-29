import { Resend } from 'resend'

const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'

export async function sendPasswordResetEmail({ to, resetCode }) {
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    return {
      sent: false,
      error: 'RESEND_API_KEY is missing.',
    }
  }

  if (!RESEND_FROM_EMAIL) {
    return {
      sent: false,
      error: 'RESEND_FROM_EMAIL is missing.',
    }
  }

  const resend = new Resend(apiKey)
  let result

  try {
    result = await resend.emails.send({
      from: RESEND_FROM_EMAIL,
      to,
      subject: 'AroundU password reset code',
      html: `
        <p>Your AroundU password reset code is:</p>
        <p><strong>${resetCode}</strong></p>
        <p>This code expires in 15 minutes.</p>
      `,
    })
  } catch (error) {
    return {
      sent: false,
      error: error.message || 'Could not send password reset email.',
    }
  }

  if (result.error) {
    return {
      sent: false,
      error: result.error.message || 'Could not send password reset email.',
    }
  }

  return { sent: true }
}
