import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { uploadImageFromUrl } from "../../src/utils/cloudinary.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const dataDir = process.env.WC_EXPORT_DIR || path.resolve(here, "../../../../../LynMarie-Migration/api-export/data");
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const summary = Object.fromEntries(["categories", "tags", "brands", "attributes", "customers", "addresses", "products", "images", "orders", "orderItems"].map(k => [k, 0]));
const failures = [];
const read = async name => { const value = JSON.parse(await fs.readFile(path.join(dataDir, name), "utf8")); if (!Array.isArray(value)) throw new Error(`${name} must contain a JSON array`); return value; };
const validName = v => String(v || "").trim() || null;
const money = v => { if (v === "" || v == null) return null; const n = Number(v); return Number.isFinite(n) ? n : null; };
const wp = n => Number.isInteger(Number(n)) && Number(n) > 0 ? Number(n) : null;
const recordError = (type, id, error) => failures.push({ type, wordpressId: id ?? null, reason: error.message });
const tryRecord = async (type, row, fn) => { try { await fn(); summary[type]++; } catch (e) { recordError(type, row?.id, e); } };
try {
  const categories = await read("categories.json");
  for (const x of categories) await tryRecord("categories", x, async () => { const id = wp(x.id); if (!id || !validName(x.name) || !x.slug) throw new Error("Missing ID, name, or slug"); await prisma.category.upsert({ where: { wordpressId: id }, create: { wordpressId: id, name: x.name, slug: x.slug, description: x.description || null }, update: { name: x.name, slug: x.slug, description: x.description || null } }); });
  const tags = await read("tags.json");
  for (const x of tags) await tryRecord("tags", x, async () => { const id = wp(x.id); if (!id || !validName(x.name) || !x.slug) throw new Error("Missing ID, name, or slug"); await prisma.tag.upsert({ where: { wordpressId: id }, create: { wordpressId: id, name: x.name, slug: x.slug }, update: { name: x.name, slug: x.slug } }); });
  const products = await read("products.json");
  const brandRows = new Map();
  for (const p of products) for (const b of p.brands || []) if (validName(b.name) && b.slug) brandRows.set(String(b.id || b.slug), b);
  for (const b of brandRows.values()) await tryRecord("brands", b, async () => { const id = wp(b.id); if (id) await prisma.brand.upsert({ where: { wordpressId: id }, create: { wordpressId: id, name: b.name, slug: b.slug }, update: { name: b.name, slug: b.slug } }); else await prisma.brand.upsert({ where: { slug: b.slug }, create: { name: b.name, slug: b.slug }, update: { name: b.name } }); });
  const attrs = await read("attributes.json");
  const attrMap = new Map();
  for (const a of attrs) {
    const row = await prisma.attribute.upsert({ where: { wordpressId: wp(a.id) || -1 }, create: { wordpressId: wp(a.id), name: a.name, slug: a.slug, type: a.type || null }, update: { name: a.name, slug: a.slug, type: a.type || null } });
    attrMap.set(String(a.name).toLowerCase(), row); summary.attributes++;
  }
  for (const p of products) for (const a of p.attributes || []) if (!attrMap.has(String(a.name).toLowerCase())) {
    const row = await prisma.attribute.upsert({ where: { name_slug: { name: a.name, slug: a.slug || a.name.toLowerCase() } }, create: { wordpressId: null, name: a.name, slug: a.slug || a.name.toLowerCase() }, update: {} });
    attrMap.set(String(a.name).toLowerCase(), row);
  }
  const customers = await read("customers.json");
  for (const c of customers) await tryRecord("customers", c, async () => {
    const id = wp(c.id); const email = String(c.email || "").trim().toLowerCase(); if (!id || !email) throw new Error("Missing customer ID or email");
    const firstName = c.first_name || null, lastName = c.last_name || null;
    const user = await prisma.user.upsert({ where: { wordpressId: id }, create: { wordpressId: id, email, firstName, lastName, phone: c.billing?.phone || null, passwordHash: null, isActive: true }, update: { email, firstName, lastName, phone: c.billing?.phone || null } });
    for (const type of ["billing", "shipping"]) {
      const a = c[type]; if (!a || ![a.address_1, a.city, a.postcode, a.first_name, a.last_name].some(Boolean)) continue;
      await prisma.address.upsert({ where: { userId_type: { userId: user.id, type: type.toUpperCase() } }, create: { userId: user.id, type: type.toUpperCase(), firstName: a.first_name || null, lastName: a.last_name || null, company: a.company || null, address1: a.address_1 || null, address2: a.address_2 || null, city: a.city || null, state: a.state || null, postcode: a.postcode || null, country: a.country || "KE", phone: a.phone || null }, update: { firstName: a.first_name || null, lastName: a.last_name || null, company: a.company || null, address1: a.address_1 || null, address2: a.address_2 || null, city: a.city || null, state: a.state || null, postcode: a.postcode || null, country: a.country || "KE", phone: a.phone || null } });
      summary.addresses++;
    }
  });
  for (const p of products) await tryRecord("products", p, async () => {
    const id = wp(p.id), basePrice = money(p.price) ?? money(p.regular_price), regularPrice = money(p.regular_price), sale = money(p.sale_price); if (!id || !p.name || !p.slug || basePrice == null) throw new Error("Missing required product ID/name/slug or usable price");
    const brand = (p.brands || [])[0]; const brandRecord = brand ? await prisma.brand.findFirst({ where: { OR: [...(wp(brand.id) ? [{ wordpressId: wp(brand.id) }] : []), { slug: brand.slug }] } }) : null;
    const stockQty = p.stock_quantity == null || p.stock_quantity === "" ? null : Number(p.stock_quantity);
    const data = { name: p.name, slug: p.slug, description: p.description || null, shortDescription: p.short_description || null, sku: p.sku || null, price: basePrice, regularPrice, salePrice: sale, status: p.status === "publish" ? "PUBLISHED" : p.status === "private" ? "PRIVATE" : "DRAFT", featured: Boolean(p.featured), purchasable: Boolean(p.purchasable), manageStock: Boolean(p.manage_stock), stockQuantity: Number.isInteger(stockQty) ? stockQty : null, stockStatus: p.stock_status === "instock" ? "IN_STOCK" : p.stock_status === "onbackorder" ? "ON_BACKORDER" : "OUT_OF_STOCK", backordersAllowed: ["yes", "notify"].includes(p.backorders), weight: p.weight || null, shippingRequired: Boolean(p.shipping_required), taxStatus: p.tax_status || null, taxClass: p.tax_class || null, totalSales: Number(p.total_sales) || 0, averageRating: Number(p.average_rating) || 0, ratingCount: Number(p.rating_count) || 0, brandId: brandRecord?.id || null };
    const product = await prisma.product.upsert({ where: { wordpressId: id }, create: { wordpressId: id, ...data }, update: data });
    await prisma.productCategory.deleteMany({ where: { productId: product.id } });
    for (const c of p.categories || []) { const cat = await prisma.category.findFirst({ where: { OR: [{ wordpressId: wp(c.id) || -1 }, { slug: c.slug }] } }); if (cat) await prisma.productCategory.createMany({ data: [{ productId: product.id, categoryId: cat.id }], skipDuplicates: true }); else recordError("productCategory", p.id, new Error(`Unknown category ${c.id ?? c.slug ?? "(missing ID)"}`)); }
    await prisma.productTag.deleteMany({ where: { productId: product.id } });
    for (const t of p.tags || []) { const tag = await prisma.tag.findFirst({ where: { OR: [{ wordpressId: wp(t.id) || -1 }, { slug: t.slug }] } }); if (tag) await prisma.productTag.createMany({ data: [{ productId: product.id, tagId: tag.id }], skipDuplicates: true }); else recordError("productTag", p.id, new Error(`Unknown tag ${t.id ?? t.slug ?? "(missing ID)"}`)); }
    await prisma.productAttributeValue.deleteMany({ where: { productId: product.id } });
    for (const a of p.attributes || []) { const attribute = attrMap.get(String(a.name).toLowerCase()); for (const v of a.options || []) if (String(v).trim()) await prisma.productAttributeValue.createMany({ data: [{ productId: product.id, attributeId: attribute.id, value: String(v), visible: Boolean(a.visible) }], skipDuplicates: true }); }
    for (const [position, i] of (p.images || []).entries()) await tryRecord("images", i, async () => { 
      const imageId = wp(i.id); 
      if (!i.src) throw new Error("Image source URL is missing");
      
      let cloudinaryData = null;
      if (process.env.CLOUDINARY_CLOUD_NAME && i.src) {
        try {
          cloudinaryData = await uploadImageFromUrl(i.src, `product-${id}-${position}`);
        } catch (uploadError) {
          console.warn(`Failed to upload image to Cloudinary: ${uploadError.message}. Using original URL.`);
        }
      }
      
      const data = { 
        productId: product.id, 
        wordpressId: imageId, 
        url: cloudinaryData?.url || i.src, 
        thumbnailUrl: cloudinaryData?.thumbnailUrl || i.thumbnail || null, 
        altText: i.alt || null, 
        name: i.name || null, 
        position 
      };
      
      const existing = imageId ? await prisma.productImage.findFirst({ where: { productId: product.id, wordpressId: imageId } }) : null; 
      if (existing) await prisma.productImage.update({ where: { id: existing.id }, data }); 
      else await prisma.productImage.create({ data }); 
    });
  });
  const orderRows = await read("orders.json");
  for (const o of orderRows) await tryRecord("orders", o, async () => {
    const id = wp(o.id); if (!id || !Array.isArray(o.line_items)) throw new Error("Missing order ID or line items");
    const customer = o.customer_id ? await prisma.user.findUnique({ where: { wordpressId: wp(o.customer_id) || -1 } }) : null;
    const items = await Promise.all(o.line_items.map(async line => { const quantity = Math.max(1, Number(line.quantity) || 1); const totalPrice = money(line.total) ?? 0; const product = line.product_id ? await prisma.product.findUnique({ where: { wordpressId: wp(line.product_id) || -1 } }) : null; return { productId: product?.id || null, productName: line.name || "Unknown product", sku: line.sku || product?.sku || null, quantity, unitPrice: money(line.price) ?? totalPrice / quantity, totalPrice }; }));
    const orderData = { userId: customer?.id || null, orderNumber: String(o.number || `WP-${id}`), status: String(o.status || "pending").toUpperCase(), currency: o.currency || "KES", subtotal: money(o.total) ?? items.reduce((a, i) => a + i.totalPrice, 0), discountTotal: money(o.discount_total) ?? 0, shippingTotal: money(o.shipping_total) ?? 0, taxTotal: money(o.total_tax) ?? 0, total: money(o.total) ?? 0, billingFirstName: o.billing?.first_name || null, billingLastName: o.billing?.last_name || null, billingEmail: o.billing?.email || null, billingPhone: o.billing?.phone || null, shippingFirstName: o.shipping?.first_name || null, shippingLastName: o.shipping?.last_name || null, shippingAddress: [o.shipping?.address_1, o.shipping?.address_2].filter(Boolean).join(", ") || null, shippingCity: o.shipping?.city || null, shippingCounty: o.shipping?.state || null, shippingPhone: o.shipping?.phone || null, paymentMethod: o.payment_method || null, notes: o.customer_note || null };
    const existing = await prisma.order.findUnique({ where: { wordpressId: id } });
    const order = existing ? await prisma.order.update({ where: { id: existing.id }, data: orderData }) : await prisma.order.create({ data: { wordpressId: id, ...orderData } });
    await prisma.orderItem.deleteMany({ where: { orderId: order.id } });
    if (items.length) await prisma.orderItem.createMany({ data: items.map(i => ({ ...i, orderId: order.id })) });
    summary.orderItems += items.length;
  });
  console.log(JSON.stringify({ summary, failures }, null, 2));
  if (failures.length) process.exitCode = 2;
} finally { await prisma.$disconnect(); }
