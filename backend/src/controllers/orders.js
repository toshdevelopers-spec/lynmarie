import { z } from "zod";
import crypto from "node:crypto";
import { prisma } from "../config/prisma.js";
import { asyncHandler } from "../middleware/errors.js";
import { sendOrderEmails } from "../utils/email.js";
const schema = z.object({ items: z.array(z.object({ productId: z.coerce.number().int().positive(), quantity: z.coerce.number().int().min(1).max(100) })).min(1), billing: z.object({ first_name: z.string().min(1), last_name: z.string().min(1), email: z.string().email(), phone: z.string().min(1), address_1: z.string().optional(), city: z.string().optional(), county: z.string().optional() }), shipping: z.object({ first_name: z.string().optional(), last_name: z.string().optional(), address_1: z.string().optional(), city: z.string().optional(), county: z.string().optional(), phone: z.string().optional() }).optional(), notes: z.string().max(2000).optional(), payment_method: z.enum(["cod", "mpesa", "pay_on_pickup"]).default("cod"), payment_reference: z.string().trim().max(100).optional(), payment_message: z.string().trim().max(5000).optional(), fulfillment_method: z.enum(["DELIVERY", "PICKUP"]).default("DELIVERY") }).superRefine((input, ctx) => {
  if (input.fulfillment_method === "DELIVERY" && (!input.billing.address_1 || !input.billing.city)) ctx.addIssue({ code: "custom", path: ["billing", "address_1"], message: "A billing address is required for delivery" });
  if (input.payment_method === "pay_on_pickup" && input.fulfillment_method !== "PICKUP") ctx.addIssue({ code: "custom", path: ["payment_method"], message: "Pay on pickup is only available for shop collection" });
});
export const create = asyncHandler(async (req, res) => {
  const input = schema.parse(req.body);
  const ids = [...new Set(input.items.map(i => i.productId))];
  const products = await prisma.product.findMany({ where: { id: { in: ids }, status: "PUBLISHED", purchasable: true } });
  const byId = new Map(products.map(p => [p.id, p]));
  if (ids.some(id => !byId.has(id))) return res.status(400).json({ success: false, message: "One or more products are unavailable" });
  for (const item of input.items) { const p = byId.get(item.productId); if (p.stockStatus === "OUT_OF_STOCK" || (p.manageStock && p.stockQuantity != null && p.stockQuantity < item.quantity)) return res.status(409).json({ success: false, message: `${p.name} does not have enough stock` }); }
  const rows = input.items.map(item => { const p = byId.get(item.productId); const unitPrice = p.salePrice ?? p.price; const totalPrice = Number((Number(unitPrice) * item.quantity).toFixed(2)); return { productId: p.id, productName: p.name, sku: p.sku, quantity: item.quantity, unitPrice, totalPrice }; });
  const subtotal = Number(rows.reduce((sum, row) => sum + Math.round(row.totalPrice * 100), 0) / 100);
  const ship = input.shipping || input.billing;
  const order = await prisma.$transaction(async tx => {
    for (const item of input.items) { const p = byId.get(item.productId); if (p.manageStock && p.stockQuantity != null) { const result = await tx.product.updateMany({ where: { id: p.id, stockQuantity: { gte: item.quantity } }, data: { stockQuantity: { decrement: item.quantity } } }); if (!result.count) { const e = new Error(`${p.name} does not have enough stock`); e.status = 409; throw e; } const remaining = await tx.product.findUnique({ where: { id: p.id }, select: { stockQuantity: true } }); if (remaining.stockQuantity <= 0) await tx.product.update({ where: { id: p.id }, data: { stockStatus: "OUT_OF_STOCK" } }); } }
    if (req.user) await tx.user.update({ where: { id: req.user.id }, data: { phone: input.billing.phone } });
    if (req.user && input.fulfillment_method === "DELIVERY") await tx.address.upsert({ where: { userId_type: { userId: req.user.id, type: "SHIPPING" } }, create: { userId: req.user.id, type: "SHIPPING", firstName: req.user.firstName, lastName: req.user.lastName, address1: ship.address_1 || input.billing.address_1, city: ship.city || input.billing.city, state: ship.county || input.billing.county, country: "KE", phone: input.billing.phone }, update: { firstName: req.user.firstName, lastName: req.user.lastName, address1: ship.address_1 || input.billing.address_1, city: ship.city || input.billing.city, state: ship.county || input.billing.county, phone: input.billing.phone } });
    return tx.order.create({ data: { userId: req.user?.id, orderNumber: `LM-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`, status: "PENDING", paymentStatus: input.payment_method === "mpesa" ? "AWAITING_REVIEW" : "PENDING", amountPaid: 0, orderType: "ONLINE", fulfillmentMethod: input.fulfillment_method, subtotal, total: subtotal, billingFirstName: req.user?.firstName || input.billing.first_name, billingLastName: req.user?.lastName || input.billing.last_name, billingEmail: req.user?.email || input.billing.email, billingPhone: input.billing.phone, shippingFirstName: req.user?.firstName || ship.first_name || input.billing.first_name, shippingLastName: req.user?.lastName || ship.last_name || input.billing.last_name, shippingAddress: input.fulfillment_method === "PICKUP" ? "Shop collection" : [ship.address_1 || input.billing.address_1, ship.city || input.billing.city, ship.county || input.billing.county].filter(Boolean).join(", "), shippingCity: input.fulfillment_method === "PICKUP" ? "Nairobi" : (ship.city || input.billing.city), shippingCounty: ship.county || input.billing.county, shippingPhone: ship.phone || input.billing.phone, paymentMethod: input.payment_method, paymentReference: input.payment_reference, paymentMessage: input.payment_message, notes: input.notes, items: { create: rows } }, include: { items: true } });
  });
  const adminUsers = await prisma.user.findMany({ where: { role: "ADMIN", isActive: true }, select: { email: true } });
  await sendOrderEmails(order, adminUsers.map(user => user.email));
  res.status(201).json({ success: true, data: order });
});
export const listMine = asyncHandler(async (req, res) => { res.json({ success: true, data: await prisma.order.findMany({ where: { userId: req.user.id }, include: { items: true }, orderBy: { createdAt: "desc" } }) }); });
export const showMine = asyncHandler(async (req, res) => { const id = Number(req.params.id); const row = await prisma.order.findFirst({ where: { id, userId: req.user.id }, include: { items: true } }); if (!row) return res.status(404).json({ success: false, message: "Order not found" }); res.json({ success: true, data: row }); });
export const cancelMine = asyncHandler(async (req, res) => {
  const id = z.coerce.number().int().positive().parse(req.params.id);
  const row = await prisma.$transaction(async tx => {
    const order = await tx.order.findFirst({ where: { id, userId: req.user.id }, include: { items: true } });
    if (!order) return null;
    if (["COMPLETED", "CANCELLED", "REFUNDED"].includes(order.status)) throw Object.assign(new Error("This order can no longer be cancelled"), { status: 409 });
    for (const item of order.items) {
      if (!item.productId) continue;
      const product = await tx.product.findUnique({ where: { id: item.productId }, select: { id: true, manageStock: true, stockQuantity: true } });
      if (!product?.manageStock || product.stockQuantity == null) continue;
      await tx.product.update({ where: { id: product.id }, data: { stockQuantity: { increment: item.quantity }, stockStatus: "IN_STOCK" } });
    }
    const changed = await tx.order.updateMany({ where: { id, userId: req.user.id, status: { notIn: ["COMPLETED", "CANCELLED", "REFUNDED"] } }, data: { status: "CANCELLED" } });
    if (!changed.count) throw Object.assign(new Error("This order has already been completed or cancelled"), { status: 409 });
    return tx.order.findUnique({ where: { id }, include: { items: true } });
  });
  if (!row) return res.status(404).json({ success: false, message: "Order not found" });
  let emailSent = true;
  try { await sendOrderUpdateEmail(row, { kind: "cancellation", message: `Your order ${row.orderNumber || `#${row.id}`} has been cancelled as requested. If you already paid, please contact us about the payment return.` }); }
  catch (error) { emailSent = false; console.error("Order cancellation email could not be sent:", error.message); }
  res.json({ success: true, data: row, emailSent, message: emailSent ? "Order cancelled. A confirmation email has been sent." : "Order cancelled, but the email could not be sent. Please contact the store." });
});
