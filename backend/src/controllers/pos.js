import crypto from "node:crypto";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { asyncHandler } from "../middleware/errors.js";
import { sendOrderUpdateEmail } from "../utils/email.js";

const inventoryInclude = {
  images: { orderBy: { position: "asc" }, take: 1 },
  attributes: { include: { attribute: true }, orderBy: { attributeId: "asc" } },
};
const methodSchema = z.enum(["CASH", "CARD", "MPESA", "BANK"]);
const inventory = asyncHandler(async (req, res) => {
  const products = await prisma.product.findMany({ where: { status: "PUBLISHED", purchasable: true }, include: inventoryInclude, orderBy: { name: "asc" } });
  res.json({ success: true, data: products });
});

const sales = asyncHandler(async (req, res) => {
  const from = req.query.from ? new Date(req.query.from) : new Date(Date.now() - 24 * 60 * 60 * 1000);
  if (Number.isNaN(from.getTime())) return res.status(400).json({ success: false, message: "Invalid sales date" });
  const sellerFilter = req.user.role === "ADMIN" ? {} : { sellerId: req.user.id };
  const [rows, pickupOrders] = await Promise.all([
    prisma.order.findMany({ where: { orderType: "POS", createdAt: { gte: from }, ...sellerFilter }, include: { items: true, seller: { select: { id: true, firstName: true, lastName: true, email: true } } }, orderBy: { createdAt: "desc" }, take: 200 }),
    prisma.order.findMany({ where: { fulfillmentMethod: "PICKUP", pickedUpAt: null, status: { notIn: ["CANCELLED", "REFUNDED"] } }, include: { items: true }, orderBy: { createdAt: "asc" }, take: 100 }),
  ]);
  res.json({ success: true, data: { sales: rows, pickupOrders } });
});

const saleSchema = z.object({
  items: z.array(z.object({ productId: z.coerce.number().int().positive(), quantity: z.coerce.number().int().min(1).max(50), size: z.string().trim().max(100).optional(), color: z.string().trim().max(100).optional() })).min(1).max(100),
  customerName: z.string().trim().max(200).optional(), customerPhone: z.string().trim().max(50).optional(),
  paymentMethod: methodSchema, paymentReference: z.string().trim().max(100).optional(), amountTendered: z.coerce.number().min(0),
  discountAmount: z.coerce.number().min(0).default(0), discountReason: z.string().trim().max(300).optional(),
});

const recordPaymentSchema = z.object({ paymentMethod: methodSchema.optional(), paymentReference: z.string().trim().max(100).optional(), amountTendered: z.coerce.number().min(0).optional() });
const validateReference = (method, reference) => ["MPESA", "BANK"].includes(method) && !reference?.trim();

const checkoutSale = asyncHandler(async (req, res) => {
  const input = saleSchema.parse(req.body);
  if (validateReference(input.paymentMethod, input.paymentReference)) return res.status(400).json({ success: false, message: "Enter the M-Pesa or bank transaction code" });
  const ids = [...new Set(input.items.map(item => item.productId))];
  const products = await prisma.product.findMany({ where: { id: { in: ids }, status: "PUBLISHED", purchasable: true }, include: inventoryInclude });
  const byId = new Map(products.map(product => [product.id, product]));
  if (ids.some(id => !byId.has(id))) return res.status(409).json({ success: false, message: "A selected item is no longer available" });

  for (const item of input.items) {
    const product = byId.get(item.productId);
    if (product.stockStatus === "OUT_OF_STOCK") return res.status(409).json({ success: false, message: `${product.name} is out of stock` });
    const options = product.attributes.reduce((grouped, row) => {
      const name = row.attribute.name.toLowerCase();
      (grouped[name] ||= []).push(row.value);
      return grouped;
    }, {});
    const sizeValues = options.size || [];
    const colorValues = options.color || options.colour || [];
    if (sizeValues.length && !item.size) return res.status(400).json({ success: false, message: `Choose a size for ${product.name}` });
    if (colorValues.length && !item.color) return res.status(400).json({ success: false, message: `Choose a color for ${product.name}` });
    if (item.size && sizeValues.length && !sizeValues.includes(item.size)) return res.status(400).json({ success: false, message: `Invalid size for ${product.name}` });
    if (item.color && colorValues.length && !colorValues.includes(item.color)) return res.status(400).json({ success: false, message: `Invalid color for ${product.name}` });
  }

  const lines = input.items.map(item => {
    const product = byId.get(item.productId);
    const unitPrice = Number(product.salePrice ?? product.price);
    const totalPrice = Number((unitPrice * item.quantity).toFixed(2));
    const variantDetails = [item.size && `Size: ${item.size}`, item.color && `Color: ${item.color}`].filter(Boolean).join(" · ") || null;
    return { productId: product.id, productName: product.name, sku: product.sku, quantity: item.quantity, unitPrice, totalPrice, variantDetails };
  });
  const subtotal = Number(lines.reduce((sum, line) => sum + line.totalPrice, 0).toFixed(2));
  if (input.discountAmount > subtotal) return res.status(400).json({ success: false, message: "Discount cannot exceed the sale subtotal" });
  const total = Number((subtotal - input.discountAmount).toFixed(2));
  if (input.amountTendered < total) return res.status(400).json({ success: false, message: "Amount paid must cover the discounted total" });
  if (input.paymentMethod !== "CASH" && input.amountTendered !== total) return res.status(400).json({ success: false, message: "Card, M-Pesa, or bank payment must equal the amount due" });
  const [firstName, ...lastParts] = (input.customerName || "Walk-in customer").split(/\s+/);
  const lastName = lastParts.join(" ") || null;
  const quantities = lines.reduce((grouped, line) => grouped.set(line.productId, (grouped.get(line.productId) || 0) + line.quantity), new Map());

  const order = await prisma.$transaction(async tx => {
    for (const [productId, quantity] of quantities) {
      const product = byId.get(productId);
      if (!product.manageStock || product.stockQuantity == null) continue;
      const changed = await tx.product.updateMany({ where: { id: productId, status: "PUBLISHED", stockQuantity: { gte: quantity } }, data: { stockQuantity: { decrement: quantity } } });
      if (!changed.count) throw Object.assign(new Error(`${product.name} no longer has enough stock`), { status: 409 });
      const updated = await tx.product.findUnique({ where: { id: productId }, select: { stockQuantity: true } });
      await tx.product.update({ where: { id: productId }, data: { stockStatus: updated.stockQuantity === 0 ? "OUT_OF_STOCK" : "IN_STOCK", totalSales: { increment: quantity } } });
    }
    return tx.order.create({ data: {
      orderNumber: `POS-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`,
      status: "COMPLETED", orderType: "POS", fulfillmentMethod: "IN_STORE", paymentStatus: "PAID",
      sellerId: req.user.id, paymentMethod: input.paymentMethod, paymentReference: input.paymentReference || null,
      amountPaid: total, amountTendered: input.amountTendered, subtotal, discountTotal: input.discountAmount, total,
      discountReason: input.discountReason || null, billingFirstName: firstName, billingLastName: lastName,
      billingPhone: input.customerPhone || null, items: { create: lines },
    }, include: { items: true, seller: { select: { id: true, firstName: true, lastName: true, email: true } } } });
  });
  res.status(201).json({ success: true, data: order, change: Number((input.amountTendered - total).toFixed(2)) });
});

const collectPickupOrder = asyncHandler(async (req, res) => {
  const id = z.coerce.number().int().positive().parse(req.params.id);
  const input = recordPaymentSchema.parse(req.body);
  const order = await prisma.order.findUniqueOrThrow({ where: { id }, include: { items: true } });
  if (order.fulfillmentMethod !== "PICKUP" || order.orderType !== "ONLINE" || ["CANCELLED", "REFUNDED"].includes(order.status)) return res.status(409).json({ success: false, message: "This is not an open shop pickup order" });
  const total = Number(order.total);
  const paymentMethod = order.paymentStatus === "PAID" ? order.paymentMethod : input.paymentMethod;
  const amountTendered = order.paymentStatus === "PAID" ? Number(order.amountTendered ?? order.amountPaid) : input.amountTendered;
  if (!paymentMethod || amountTendered == null) return res.status(400).json({ success: false, message: "Choose how the customer is paying" });
  if (order.paymentStatus !== "PAID" && amountTendered < total) return res.status(400).json({ success: false, message: "Payment must cover the order total" });
  if (order.paymentStatus !== "PAID" && paymentMethod !== "CASH" && amountTendered !== total) return res.status(400).json({ success: false, message: "Card, M-Pesa, or bank payment must equal the order total" });
  const reference = input.paymentReference || (order.paymentMethod === paymentMethod.toLowerCase() ? order.paymentReference : null);
  if (order.paymentStatus !== "PAID" && validateReference(paymentMethod, reference)) return res.status(400).json({ success: false, message: "Enter the M-Pesa or bank transaction code" });
  const result = await prisma.order.updateMany({ where: { id, fulfillmentMethod: "PICKUP", pickedUpAt: null, status: { notIn: ["CANCELLED", "REFUNDED"] } }, data: {
    status: "COMPLETED", paymentStatus: "PAID", paymentMethod, paymentReference: reference || null,
    amountPaid: order.paymentStatus === "PAID" ? order.amountPaid : total, amountTendered, pickedUpAt: new Date(), sellerId: req.user.id,
  } });
  if (!result.count) return res.status(409).json({ success: false, message: "This pickup has already been collected or paid" });
  const updated = await prisma.order.findUnique({ where: { id }, include: { items: true, seller: { select: { id: true, firstName: true, lastName: true, email: true } } } });
  if (order.paymentStatus !== "PAID") {
    try { await sendOrderUpdateEmail(updated, { kind: "payment", message: `We have recorded your payment of KES ${total.toLocaleString("en-KE", { minimumFractionDigits: 2 })} via ${paymentMethod}. Your order has also been marked as collected.` }); }
    catch (error) { console.error("Pickup payment email could not be sent:", error.message); }
  }
  res.json({ success: true, data: updated, change: Number((input.amountTendered - total).toFixed(2)) });
});

export { inventory, sales, checkoutSale, collectPickupOrder };
