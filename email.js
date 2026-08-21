import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.ALERT_FROM_EMAIL || "alerts@anchorwatch.app";

export async function sendAlertEmail({ to, subject, message }) {
  try {
    await resend.emails.send({
      from: `AnchorWatch <${FROM}>`,
      to,
      subject,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <h2 style="color:#25322A; margin-bottom: 8px;">${subject}</h2>
          <p style="color:#333; line-height:1.6;">${message}</p>
          <p style="margin-top:24px;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard" style="color:#B4831F;">
              Open your dashboard →
            </a>
          </p>
        </div>
      `,
    });
  } catch (err) {
    console.error("Failed to send alert email:", err.message);
  }
}

export async function sendDigestEmail({ to, summaryHtml }) {
  try {
    await resend.emails.send({
      from: `AnchorWatch <${FROM}>`,
      to,
      subject: "Your weekly AnchorWatch digest",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <h2 style="color:#25322A;">Weekly digest</h2>
          ${summaryHtml}
          <p style="margin-top:24px;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard" style="color:#B4831F;">
              Open your dashboard →
            </a>
          </p>
        </div>
      `,
    });
  } catch (err) {
    console.error("Failed to send digest email:", err.message);
  }
}
