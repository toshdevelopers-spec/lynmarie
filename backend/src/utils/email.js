const sender = () => process.env.EMAIL_FROM || "Lyn Marie Boutique <info@lynmarieboutique.com>";

const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);

async function deliver({ to, subject, html, text }) {
  if (!process.env.RESEND_API_KEY) throw new Error("Email delivery is not configured");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: sender(), to: [to], subject, html, text }),
    signal: AbortSignal.timeout(10000),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`Resend rejected email (${response.status}): ${result.message || "request failed"}`);
  return result.id;
}

export async function sendPasswordResetEmail(to, token) {
  const frontendUrl = process.env.PASSWORD_RESET_URL ||
    (process.env.NODE_ENV === "production"
      ? "https://www.lynmarieboutique.com/auth/forgot-password"
      : "http://localhost:5173/auth/forgot-password");
  const resetUrl = new URL(frontendUrl);
  resetUrl.searchParams.set("token", token);
  const id = await deliver({
    to, subject: "Reset your Lyn Marie Boutique password",
    html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#241532"><h1 style="color:#56347b">Lyn Marie Boutique</h1><p>We received a request to reset your password.</p><p><a href="${escapeHtml(resetUrl.href)}" style="display:inline-block;padding:12px 20px;background:#56347b;color:white;text-decoration:none;border-radius:6px">Reset password</a></p><p>This link expires in one hour and can be used once. If you did not request this, you can ignore this email.</p></div>`,
    text: `Reset your Lyn Marie Boutique password: ${resetUrl.href}\nThis link expires in one hour and can be used once. If you did not request this, ignore this email.`,
  });
  console.info("Transactional email accepted by Resend", { kind: "password_reset", id });
  return id;
}

export async function sendAccountWelcomeEmail(user) {
  return deliver({
    to: user.email, subject: "Welcome to Lyn Marie Boutique",
    html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#241532"><h1 style="color:#56347b">Welcome to Lyn Marie Boutique</h1><p>Hi ${escapeHtml(user.firstName || "there")}, your account is ready. Explore dresses, jumpsuits, office wear and occasion outfits from our Nairobi boutique, with delivery across Kenya.</p><p><a href="https://www.lynmarieboutique.com/shop" style="display:inline-block;padding:12px 20px;background:#56347b;color:white;text-decoration:none;border-radius:6px">Explore the collection</a></p></div>`,
    text: `Welcome to Lyn Marie Boutique, ${user.firstName || "there"}! Your account is ready. Shop dresses, jumpsuits, office wear and occasion outfits with delivery across Kenya: https://www.lynmarieboutique.com/shop`,
  });
}

export async function sendPasswordChangedEmail(user) {
  return deliver({
    to: user.email, subject: "Your Lyn Marie Boutique password was changed",
    html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#241532"><h1 style="color:#56347b">Password updated</h1><p>Hi ${escapeHtml(user.firstName || "there")}, your Lyn Marie Boutique account password was changed successfully.</p><p>If you did not make this change, contact us at <a href="mailto:info@lynmarieboutique.com">info@lynmarieboutique.com</a>.</p></div>`,
    text: `Hi ${user.firstName || "there"}, your Lyn Marie Boutique account password was changed. If you did not make this change, contact info@lynmarieboutique.com.`,
  });
}

export async function sendInquiryNotice(inquiry, recipients = []) {
  const jobs = [...new Set(recipients.filter(Boolean))].map(to => deliver({
    to, subject: `New website enquiry from ${inquiry.name} | Lyn Marie Boutique`,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#241532"><h1 style="color:#56347b">New customer enquiry</h1><p><strong>${escapeHtml(inquiry.name)}</strong> &lt;${escapeHtml(inquiry.email)}&gt;</p><p style="white-space:pre-wrap">${escapeHtml(inquiry.message)}</p></div>`,
    text: `New customer enquiry from ${inquiry.name} <${inquiry.email}>\n\n${inquiry.message}`,
  }));
  const results = await Promise.allSettled(jobs);
  results.forEach(result => { if (result.status === "rejected") console.error("Enquiry email delivery failed:", result.reason?.message || "email provider error"); });
  return { sent: results.filter(result => result.status === "fulfilled").length, failed: results.filter(result => result.status === "rejected").length };
}

export async function sendOrderUpdateEmail(order, change) {
  if (!order.billingEmail) return;
  const label = change.kind === "payment" ? "Payment update" : change.kind === "cancellation" ? "Order cancellation" : "Delivery update";
  const html = `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#241532"><h1 style="color:#56347b">${label} for order ${escapeHtml(order.orderNumber || `#${order.id}`)}</h1><p>Hi ${escapeHtml(order.billingFirstName || "there")},</p><p>${escapeHtml(change.message)}</p><p>Questions? Email <a href="mailto:info@lynmarieboutique.com">info@lynmarieboutique.com</a>.</p></div>`;
  await deliver({ to: order.billingEmail, subject: `${label} · ${order.orderNumber || `#${order.id}`} | Lyn Marie Boutique`, html, text: `${label} for order ${order.orderNumber || `#${order.id}`}: ${change.message}` });
}

export async function sendOrderEmails(order, adminEmails = []) {
  const itemsHtml = order.items.map(item => `<tr><td style="padding:8px 0;border-bottom:1px solid #eee">${escapeHtml(item.productName)} × ${Number(item.quantity)}</td><td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right">KES ${Number(item.totalPrice).toLocaleString("en-KE", { minimumFractionDigits: 2 })}</td></tr>`).join("");
  const itemsText = order.items.map(item => `${item.productName} × ${item.quantity} — KES ${Number(item.totalPrice).toLocaleString("en-KE", { minimumFractionDigits: 2 })}`).join("\n");
  const number = escapeHtml(order.orderNumber || `#${order.id}`);
  const total = Number(order.total).toLocaleString("en-KE", { minimumFractionDigits: 2 });
  const fulfillment = order.fulfillmentMethod === "PICKUP" ? "Collect your order from Lyn Marie Boutique at Jamia Mall, 1st Floor, Shop F56, Nairobi." : "We will share delivery updates as your order is prepared.";
  const customerHtml = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#241532"><h1 style="color:#56347b">Thank you for shopping with Lyn Marie Boutique</h1><p>Hi ${escapeHtml(order.billingFirstName || "there")}, we have received your order <strong>${number}</strong>.</p><table style="width:100%;border-collapse:collapse">${itemsHtml}<tr><td style="padding:12px 0"><strong>Order total</strong></td><td style="padding:12px 0;text-align:right"><strong>KES ${total}</strong></td></tr></table><p>${escapeHtml(fulfillment)}</p><p>Payment: ${escapeHtml(order.paymentMethod || "To be confirmed")} · ${escapeHtml(order.paymentStatus || "PENDING")}</p><p>Questions? Call or WhatsApp <a href="https://wa.me/254794071233">0794 071233</a> or email <a href="mailto:info@lynmarieboutique.com">info@lynmarieboutique.com</a>.</p></div>`;
  const customerText = `Thank you for shopping with Lyn Marie Boutique. We received order ${order.orderNumber || `#${order.id}`} for ${order.billingFirstName || "you"}.\n\n${itemsText}\n\nOrder total: KES ${total}\n${fulfillment}\nPayment: ${order.paymentMethod || "To be confirmed"} · ${order.paymentStatus || "PENDING"}\n\nQuestions? 0794 071233 · info@lynmarieboutique.com`;
  const adminHtml = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#241532"><h1 style="color:#56347b">New Lyn Marie Boutique order</h1><p>Order <strong>${number}</strong> was placed by ${escapeHtml(`${order.billingFirstName || ""} ${order.billingLastName || ""}`.trim() || "a customer")} (${escapeHtml(order.billingEmail)}).</p><table style="width:100%;border-collapse:collapse">${itemsHtml}<tr><td style="padding:12px 0"><strong>Total</strong></td><td style="padding:12px 0;text-align:right"><strong>KES ${total}</strong></td></tr></table><p>Fulfilment: ${escapeHtml(order.fulfillmentMethod || "DELIVERY")} · Payment: ${escapeHtml(order.paymentMethod || "To be confirmed")} · ${escapeHtml(order.paymentStatus || "PENDING")}</p><p>Phone: ${escapeHtml(order.billingPhone || "Not provided")}</p><p>Open the admin dashboard to review the order.</p></div>`;
  const adminText = `New Lyn Marie Boutique order ${order.orderNumber || `#${order.id}`}\nCustomer: ${order.billingFirstName || ""} ${order.billingLastName || ""} (${order.billingEmail})\n${itemsText}\nTotal: KES ${total}\nFulfilment: ${order.fulfillmentMethod || "DELIVERY"}\nPayment: ${order.paymentMethod || "To be confirmed"} · ${order.paymentStatus || "PENDING"}\nPhone: ${order.billingPhone || "Not provided"}`;
  const sent = [];
  const recipients = [...new Set(adminEmails.filter(email => email && email.toLowerCase() !== order.billingEmail?.toLowerCase()))];
  const jobs = [];
  if (order.billingEmail) jobs.push(deliver({ to: order.billingEmail, subject: `Order ${order.orderNumber || `#${order.id}`} received | Lyn Marie Boutique`, html: customerHtml, text: customerText }).then(id => sent.push({ kind: "order_confirmation", id })));
  for (const to of recipients) jobs.push(deliver({ to, subject: `New order ${order.orderNumber || `#${order.id}`} | Lyn Marie Boutique`, html: adminHtml, text: adminText }).then(id => sent.push({ kind: "admin_order_notice", id })));
  const results = await Promise.allSettled(jobs);
  for (const result of results) if (result.status === "rejected") console.error("Order email delivery failed:", result.reason?.message || "email provider error");
  for (const email of sent) console.info("Transactional email accepted by Resend", email);
  return { sent: sent.length, failed: results.filter(result => result.status === "rejected").length };
}
