import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { asyncHandler } from "../middleware/errors.js";

const productInclude = { images: { orderBy: { position: "asc" } }, categories: { include: { category: true } }, brand: true };
const slugify = value => value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const productInput = z.object({
  name: z.string().trim().min(1).max(250), slug: z.string().trim().optional(), description: z.string().optional().nullable(),
  shortDescription: z.string().optional().nullable(), sku: z.string().trim().max(100).optional().nullable().transform(value => value || null), price: z.coerce.number().min(0),
  regularPrice: z.coerce.number().min(0).optional().nullable(), salePrice: z.coerce.number().min(0).optional().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED", "PRIVATE"]).default("PUBLISHED"), featured: z.boolean().default(false),
  manageStock: z.boolean().default(true), stockQuantity: z.coerce.number().int().min(0).optional().nullable(),
  stockStatus: z.enum(["IN_STOCK", "OUT_OF_STOCK", "ON_BACKORDER"]).optional(), categoryIds: z.array(z.coerce.number().int().positive()).default([]),
  imageUrls: z.array(z.string().url()).default([]), metaTitle: z.string().max(250).optional().nullable(), metaDescription: z.string().max(500).optional().nullable(),
  brandId: z.coerce.number().int().positive().optional().nullable(),
}).superRefine((v, ctx) => { if (v.salePrice != null && v.regularPrice != null && v.salePrice >= v.regularPrice) ctx.addIssue({ code: "custom", path: ["salePrice"], message: "Sale price must be lower than regular price" }); });

export const dashboard = asyncHandler(async (req, res) => {
  const [products, customers, orders, reviews, inquiries, visitors, cartAdds, lowStock] = await Promise.all([
    prisma.product.count(), prisma.user.count({ where: { role: "CUSTOMER" } }), prisma.order.count(), prisma.review.count(), prisma.inquiry.count(),
    prisma.storeEvent.findMany({ distinct: ["visitorId"], select: { visitorId: true } }),
    prisma.storeEvent.count({ where: { action: "ADD_TO_CART" } }), prisma.product.count({ where: { manageStock: true, stockQuantity: { lte: 5 }, status: "PUBLISHED" } }),
  ]);
  const frequentVisitors = await prisma.storeEvent.groupBy({ by: ["visitorId"], _count: { id: true }, _max: { createdAt: true }, orderBy: { _count: { id: "desc" } }, take: 8 });
  const [recentOrders, recentEvents] = await Promise.all([
    prisma.order.findMany({ include: { items: true }, orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.storeEvent.findMany({ orderBy: { createdAt: "desc" }, take: 12 }),
  ]);
  res.json({ success: true, data: { counts: { products, customers, orders, reviews, inquiries, visitors: visitors.length, cartAdds, lowStock }, frequentVisitors, recentOrders, recentEvents } });
});
export const cartActivity = asyncHandler(async (req, res) => {
  const events = await prisma.storeEvent.findMany({
    where: { action: "ADD_TO_CART" },
    include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  const productIds = [...new Set(events.map(event => event.productId).filter(Boolean))];
  const products = await prisma.product.findMany({ where: { id: { in: productIds } }, select: { id: true, name: true, sku: true, images: { select: { url: true }, take: 1, orderBy: { position: "asc" } } } });
  const productMap = new Map(products.map(product => [product.id, product]));
  res.json({ success: true, data: events.map(event => ({ ...event, product: productMap.get(event.productId) || null })) });
});

export const products = asyncHandler(async (req, res) => {
  const rows = await prisma.product.findMany({ include: productInclude, orderBy: { updatedAt: "desc" } });
  res.json({ success: true, data: rows });
});
export const createProduct = asyncHandler(async (req, res) => {
  const input = productInput.parse(req.body); const { categoryIds, imageUrls, ...fields } = input;
  const slug = fields.slug || slugify(fields.name) || `product-${Date.now()}`;
  const row = await prisma.product.create({ data: {
    ...fields, slug, price: fields.salePrice ?? fields.price, regularPrice: fields.regularPrice ?? fields.price,
    stockStatus: fields.stockStatus || ((fields.stockQuantity ?? 0) > 0 ? "IN_STOCK" : "OUT_OF_STOCK"),
    categories: { create: categoryIds.map(categoryId => ({ category: { connect: { id: categoryId } } })) },
    images: { create: imageUrls.map((url, position) => ({ url, position, altText: fields.name })) },
  }, include: productInclude });
  res.status(201).json({ success: true, data: row });
});
export const updateProduct = asyncHandler(async (req, res) => {
  const id = z.coerce.number().int().positive().parse(req.params.id); const input = productInput.partial().parse(req.body);
  const { categoryIds, imageUrls, ...fields } = input; const update = { ...fields };
  if (fields.name && !fields.slug) update.slug = slugify(fields.name) || `product-${Date.now()}`;
  if (fields.salePrice !== undefined) update.price = fields.salePrice ?? fields.regularPrice ?? fields.price;
  if (fields.stockQuantity !== undefined && fields.stockStatus === undefined) update.stockStatus = fields.stockQuantity > 0 ? "IN_STOCK" : "OUT_OF_STOCK";
  const row = await prisma.$transaction(async tx => {
    if (categoryIds) await tx.productCategory.deleteMany({ where: { productId: id } });
    if (imageUrls) await tx.productImage.deleteMany({ where: { productId: id } });
    return tx.product.update({ where: { id }, data: {
      ...update,
      ...(categoryIds ? { categories: { create: categoryIds.map(categoryId => ({ category: { connect: { id: categoryId } } })) } } : {}),
      ...(imageUrls ? { images: { create: imageUrls.map((url, position) => ({ url, position, altText: fields.name })) } } : {}),
    }, include: productInclude });
  });
  res.json({ success: true, data: row });
});
export const deleteProduct = asyncHandler(async (req, res) => {
  const id = z.coerce.number().int().positive().parse(req.params.id);
  const row = await prisma.product.update({ where: { id }, data: { status: "PRIVATE", purchasable: false } });
  res.json({ success: true, data: row, message: "Product removed from the storefront" });
});

export const customers = asyncHandler(async (req, res) => {
  const rows = await prisma.user.findMany({ where: { role: { in: ["CUSTOMER", "ADMIN"] } }, select: { id: true, email: true, firstName: true, lastName: true, phone: true, role: true, isActive: true, createdAt: true, _count: { select: { orders: true } } }, orderBy: { createdAt: "desc" } });
  res.json({ success: true, data: rows });
});
export const createUser = asyncHandler(async (req, res) => {
  const input = z.object({ email: z.string().email().transform(v => v.toLowerCase()), password: z.string().min(8), firstName: z.string().trim().min(1).optional(), lastName: z.string().trim().min(1).optional(), phone: z.string().optional(), role: z.enum(["CUSTOMER", "ADMIN"]).default("CUSTOMER") }).parse(req.body);
  if (input.role === "ADMIN" && req.user.email.toLowerCase() !== "adelewigitz@gmail.com") return res.status(403).json({ success: false, message: "Only the store owner can add administrators" });
  const { password, ...profile } = input;
  const row = await prisma.user.create({ data: { ...profile, passwordHash: await bcrypt.hash(password, 12) }, select: { id: true, email: true, firstName: true, lastName: true, phone: true, role: true, isActive: true } });
  res.status(201).json({ success: true, data: row });
});
export const updateUser = asyncHandler(async (req, res) => {
  const id = z.coerce.number().int().positive().parse(req.params.id);
  const input = z.object({ firstName: z.string().trim().min(1).optional(), lastName: z.string().trim().min(1).optional(), phone: z.string().optional(), role: z.enum(["CUSTOMER", "ADMIN"]).optional(), isActive: z.boolean().optional() }).parse(req.body);
  const current = await prisma.user.findUniqueOrThrow({ where: { id } });
  const isOwner = req.user.email.toLowerCase() === "adelewigitz@gmail.com";
  if ((current.email.toLowerCase() === "adelewigitz@gmail.com" || (!isOwner && current.role === "ADMIN") || (input.role === "ADMIN" && !isOwner)) && (input.role !== undefined || input.isActive === false)) return res.status(403).json({ success: false, message: "Only the store owner can change administrator access" });
  const row = await prisma.user.update({ where: { id }, data: input, select: { id: true, email: true, firstName: true, lastName: true, phone: true, role: true, isActive: true } });
  res.json({ success: true, data: row });
});
export const deleteUser = asyncHandler(async (req, res) => {
  const id = z.coerce.number().int().positive().parse(req.params.id); const user = await prisma.user.findUniqueOrThrow({ where: { id } });
  if (user.email.toLowerCase() === "adelewigitz@gmail.com") return res.status(403).json({ success: false, message: "The owner account cannot be removed" });
  if (user.role === "ADMIN" && req.user.email.toLowerCase() !== "adelewigitz@gmail.com") return res.status(403).json({ success: false, message: "Only the store owner can disable another administrator" });
  res.json({ success: true, data: await prisma.user.update({ where: { id }, data: { isActive: false } }), message: "User access disabled; order history is preserved" });
});
export const orders = asyncHandler(async (req, res) => res.json({ success: true, data: await prisma.order.findMany({ include: { items: true, user: { select: { id: true, email: true, firstName: true, lastName: true } } }, orderBy: { createdAt: "desc" } }) }));
export const setOrderStatus = asyncHandler(async (req, res) => {
  const status = z.enum(["PENDING", "PROCESSING", "COMPLETED", "CANCELLED", "REFUNDED"]).parse(req.body.status);
  const id = z.coerce.number().int().positive().parse(req.params.id);
  const row = await prisma.$transaction(async tx => {
    const order = await tx.order.findUniqueOrThrow({ where: { id }, include: { items: true } });
    const releasesStock = !["CANCELLED", "REFUNDED"].includes(order.status) && ["CANCELLED", "REFUNDED"].includes(status);
    const reservesStock = ["CANCELLED", "REFUNDED"].includes(order.status) && !["CANCELLED", "REFUNDED"].includes(status);
    if (releasesStock || reservesStock) {
      for (const item of order.items) {
        if (!item.productId) continue;
        const product = await tx.product.findUnique({ where: { id: item.productId }, select: { id: true, name: true, manageStock: true, stockQuantity: true } });
        if (!product?.manageStock || product.stockQuantity == null) continue;
        if (reservesStock) {
          const result = await tx.product.updateMany({ where: { id: product.id, stockQuantity: { gte: item.quantity } }, data: { stockQuantity: { decrement: item.quantity } } });
          if (!result.count) throw Object.assign(new Error(`Not enough stock to reopen this order (${product.name})`), { status: 409 });
          const current = await tx.product.findUnique({ where: { id: product.id }, select: { stockQuantity: true } });
          const remaining = current.stockQuantity;
          await tx.product.update({ where: { id: product.id }, data: { stockStatus: remaining === 0 ? "OUT_OF_STOCK" : "IN_STOCK" } });
        } else {
          await tx.product.update({ where: { id: product.id }, data: { stockQuantity: { increment: item.quantity }, stockStatus: "IN_STOCK" } });
        }
      }
    }
    return tx.order.update({ where: { id }, data: { status }, include: { items: true, user: { select: { id: true, email: true, firstName: true, lastName: true } } } });
  });
  res.json({ success: true, data: row });
});
export const reviews = asyncHandler(async (req, res) => res.json({ success: true, data: await prisma.review.findMany({ include: { product: { select: { id: true, name: true } } }, orderBy: { createdAt: "desc" } }) }));
export const setReviewApproval = asyncHandler(async (req, res) => {
  const { approved } = z.object({ approved: z.boolean() }).parse(req.body);
  res.json({ success: true, data: await prisma.review.update({ where: { id: z.coerce.number().int().positive().parse(req.params.id) }, data: { approved } }) });
});
export const categories = asyncHandler(async (req, res) => res.json({ success: true, data: await prisma.category.findMany({ include: { _count: { select: { products: true } } }, orderBy: { name: "asc" } }) }));
export const createCategory = asyncHandler(async (req, res) => {
  const body = z.object({ name: z.string().trim().min(1).max(150), slug: z.string().optional(), description: z.string().optional() }).parse(req.body);
  res.status(201).json({ success: true, data: await prisma.category.create({ data: { ...body, slug: body.slug || slugify(body.name) } }) });
});
export const updateCategory = asyncHandler(async (req, res) => {
  const body = z.object({ name: z.string().trim().min(1).max(150).optional(), slug: z.string().optional(), description: z.string().optional() }).parse(req.body);
  res.json({ success: true, data: await prisma.category.update({ where: { id: z.coerce.number().int().positive().parse(req.params.id) }, data: body }) });
});
export const deleteCategory = asyncHandler(async (req, res) => {
  const id = z.coerce.number().int().positive().parse(req.params.id);
  const category = await prisma.category.findUniqueOrThrow({ where: { id }, include: { _count: { select: { products: true } } } });
  if (category._count.products) return res.status(409).json({ success: false, message: "Move this category’s products to another category before deleting it." });
  await prisma.category.delete({ where: { id } });
  res.json({ success: true, message: "Category deleted" });
});
export const inquiries = asyncHandler(async (req, res) => res.json({ success: true, data: await prisma.inquiry.findMany({ orderBy: { createdAt: "desc" } }) }));
export const updateInquiry = asyncHandler(async (req, res) => {
  const status = z.enum(["NEW", "IN_PROGRESS", "RESOLVED"]).parse(req.body.status);
  res.json({ success: true, data: await prisma.inquiry.update({ where: { id: z.coerce.number().int().positive().parse(req.params.id) }, data: { status } }) });
});
export const trackEvent = asyncHandler(async (req, res) => {
  const input = z.object({ visitorId: z.string().trim().min(8).max(120), action: z.enum(["PAGE_VIEW", "PRODUCT_VIEW", "SEARCH", "ADD_TO_CART", "CHECKOUT"]), productId: z.coerce.number().int().positive().optional(), metadata: z.record(z.string(), z.unknown()).optional() }).parse(req.body);
  // A verified login identifies earlier guest activity from the same browser.
  if (req.user?.id) {
    await prisma.storeEvent.updateMany({
      where: { visitorId: input.visitorId, userId: null },
      data: { userId: req.user.id },
    });
  }
  await prisma.storeEvent.create({ data: { ...input, userId: req.user?.id, metadata: input.metadata } });
  res.status(202).json({ success: true });
});
