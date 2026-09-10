const escapeHtml = (value = "") => String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);

export const otpEmail = ({ name, otp, purpose, expiresInMinutes }) => {
  const isPasswordReset = purpose === "reset";
  const title = isPasswordReset ? "Reset your password" : "Verify your email";
  const icon = isPasswordReset ? "🔐" : "✉️";
  const action = isPasswordReset ? "password reset" : "email verification";
  const safeName = escapeHtml(name || "there");
  const safeOtp = escapeHtml(otp);
  const minutes = Number(expiresInMinutes) || 10;
  const text = `Hi ${name || "there"}, your ${action} code is ${otp}. It expires in ${minutes} minutes. If you did not request this, you can ignore this email.`;

  const html = `<!doctype html>
<html lang="en">
  <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
  <body style="margin:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:32px 16px;background:#f4f7fb;"><tr><td align="center">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 8px 28px rgba(15,23,42,.10);">
        <tr><td style="padding:28px 36px;background:linear-gradient(135deg,#312e81,#4f46e5);color:#ffffff;">
          <div style="font-size:24px;font-weight:700;letter-spacing:-.4px;">🛍️ E-Commerce</div>
          <div style="margin-top:7px;font-size:14px;color:#e0e7ff;">Secure account notification</div>
        </td></tr>
        <tr><td style="padding:36px;text-align:center;">
          <div style="width:56px;height:56px;line-height:56px;margin:0 auto 18px;border-radius:50%;background:#eef2ff;font-size:27px;">${icon}</div>
          <h1 style="margin:0 0 12px;font-size:25px;line-height:1.25;color:#111827;">${title}</h1>
          <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#4b5563;">Hi ${safeName}, use the code below to complete your ${action}.</p>
          <div style="margin:0 auto 24px;padding:17px 12px;max-width:310px;border:1px dashed #a5b4fc;border-radius:12px;background:#f5f7ff;color:#3730a3;font-size:30px;font-weight:700;letter-spacing:9px;">${safeOtp}</div>
          <p style="margin:0;font-size:14px;line-height:1.6;color:#6b7280;">This code expires in <strong style="color:#374151;">${minutes} minutes</strong>. Do not share it with anyone.</p>
        </td></tr>
        <tr><td style="padding:20px 36px;background:#f9fafb;border-top:1px solid #e5e7eb;text-align:center;color:#6b7280;font-size:12px;line-height:1.55;">If you did not request this, you can safely ignore this email.<br>© ${new Date().getFullYear()} E-Commerce</td></tr>
      </table>
    </td></tr></table>
  </body>
</html>`;
  return { text, html };
};
