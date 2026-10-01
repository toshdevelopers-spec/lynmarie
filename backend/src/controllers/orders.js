import { z } from "zod";
import crypto from "node:crypto";
import { prisma } from "../config/prisma.js";
import { asyncHandler } from "../middleware/errors.js";
const schema = z.object({ items: z.array(z.object({ productId: z.coerce.number().int().positive(), quantity: z.coerce.number().int().min(1).max(100) })).min(1), billing: z.object({ first_name: z.string().min(1), last_name: z.string().min(1), email: z.string().email(), phone: z.string().min(1), address_1: z.string().min(1), city: z.string().min(1), state: z.string().optional(), postcode: z.string().optional() }), shipping: z.object({ first_name: z.string().optional(), last_name: z.string().optional(), address_1: z.string().optional(), city: z.string().optional(), state: z.string().optional(), phone: z.string().optional() }).optional(), notes: z.string().max(2000).optional(), payment_method: z.string().optional() });
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
    return tx.order.create({ data: { userId: req.user?.id, orderNumber: `LM-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`, status: "PENDING", subtotal, total: subtotal, billingFirstName: input.billing.first_name, billingLastName: input.billing.last_name, billingEmail: input.billing.email, billingPhone: input.billing.phone, shippingFirstName: ship.first_name || input.billing.first_name, shippingLastName: ship.last_name || input.billing.last_name, shippingAddress: [ship.address_1 || input.billing.address_1, ship.city || input.billing.city, ship.state || input.billing.state, ship.postcode || input.billing.postcode].filter(Boolean).join(", "), shippingCity: ship.city || input.billing.city, shippingCounty: ship.state || input.billing.state, shippingPhone: ship.phone || input.billing.phone, paymentMethod: input.payment_method || "cod", notes: input.notes, items: { create: rows } }, include: { items: true } });
  });
  res.status(201).json({ success: true, data: order });
});
export const listMine = asyncHandler(async (req, res) => { res.json({ success: true, data: await prisma.order.findMany({ where: { userId: req.user.id }, include: { items: true }, orderBy: { createdAt: "desc" } }) }); });
export const showMine = asyncHandler(async (req, res) => { const id = Number(req.params.id); const row = await prisma.order.findFirst({ where: { id, userId: req.user.id }, include: { items: true } }); if (!row) return res.status(404).json({ success: false, message: "Order not found" }); res.json({ success: true, data: row }); });
