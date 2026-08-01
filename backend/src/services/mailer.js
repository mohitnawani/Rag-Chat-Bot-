const RESEND_API_KEY = process.env.SMTP_PASS;

exports.sendPasswordResetEmail = async (email, resetUrl) => {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.SMTP_FROM || "onboarding@resend.dev",
      to: [email],
      subject: "Password Reset Request",
      html: `
        <p>You requested a password reset.</p>
        <p>Click the link below to reset your password (valid for 15 minutes):</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>If you did not request this, you can safely ignore this email.</p>
      `,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend API ${res.status}: ${body}`);
  }
};
