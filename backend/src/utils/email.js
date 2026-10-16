const sender = () => process.env.EMAIL_FROM || "Lyn Marie Boutique <info@lynmarieboutique.com>";

export async function sendPasswordResetEmail(to, token) {
  if (!process.env.RESEND_API_KEY) throw new Error("Email delivery is not configured");
  const frontendUrl = process.env.PASSWORD_RESET_URL ||
    (process.env.NODE_ENV === "production"
      ? "https://lynmarieboutique.com/auth/forgot-password"
      : "http://localhost:5173/auth/forgot-password");
  const resetUrl = new URL(frontendUrl);
  resetUrl.searchParams.set("token", token);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: sender(), to: [to], subject: "Reset your Lyn Marie Boutique password",
      html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#241532"><h1 style="color:#56347b">Lyn Marie Boutique</h1><p>We received a request to reset your password.</p><p><a href="${resetUrl.href}" style="display:inline-block;padding:12px 20px;background:#56347b;color:white;text-decoration:none;border-radius:6px">Reset password</a></p><p>This link expires in one hour and can be used once. If you did not request this, you can ignore this email.</p></div>`,
      text: `Reset your Lyn Marie Boutique password: ${resetUrl.href}\nThis link expires in one hour and can be used once. If you did not request this, ignore this email.`,
    }),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`Resend rejected email (${response.status}): ${error.message || "request failed"}`);
  }
}
