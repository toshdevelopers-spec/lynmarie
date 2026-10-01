import { prisma } from "../config/prisma.js";
import { productDto } from "../utils/product.js";

const include = { images: { orderBy: { position: "asc" } }, categories: { include: { category: true } }, tags: { include: { tag: true } }, attributes: { include: { attribute: true } }, brand: true };

export async function listProducts(q) {
  const page = Math.max(1, Number(q.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(q.limit || q.per_page) || 20));
  const where = { status: "PUBLISHED", AND: [{ OR: [{ stockStatus: { not: "OUT_OF_STOCK" } }, { backordersAllowed: true }] }] };
  if (q.search?.trim()) {
    const terms = q.search.trim().split(/\s+/).filter(Boolean).slice(0, 8);
    where.AND.push(...terms.map(term => ({ OR: [
      { name: { contains: term, mode: "insensitive" } }, { description: { contains: term, mode: "insensitive" } },
      { shortDescription: { contains: term, mode: "insensitive" } }, { sku: { contains: term, mode: "insensitive" } },
      { categories: { some: { category: { name: { contains: term, mode: "insensitive" } } } } },
      { tags: { some: { tag: { name: { contains: term, mode: "insensitive" } } } } },
      { attributes: { some: { value: { contains: term, mode: "insensitive" } } } },
    ] })));
  }
  if (q.featured === "true" || q.featured === true) where.featured = true;
  if (q.on_sale === "true" || q.onSale === "true") where.salePrice = { not: null };
  if (q.category) where.categories = { some: { category: { OR: [{ id: Number(q.category) || -1 }, { slug: String(q.category) }] } } };
  if (q.brand) where.brand = { OR: [{ id: Number(q.brand) || -1 }, { slug: String(q.brand) }] };
  if (q.stockStatus) where.stockStatus = q.stockStatus.toUpperCase().replaceAll("-", "_");
  if (q.minPrice || q.maxPrice) {
    const priceFilter = { ...(q.minPrice ? { gte: Number(q.minPrice) } : {}), ...(q.maxPrice ? { lte: Number(q.maxPrice) } : {}) };
    where.AND.push({ OR: [{ salePrice: priceFilter }, { AND: [{ salePrice: null }, { price: priceFilter }] }] });
  }
  const sortMap = { price: "price", date: "createdAt", popularity: "totalSales", rating: "averageRating", title: "name", name: "name" };
  let orderBy = { createdAt: "desc" };
  if (q.sort) { const [key, dir] = q.sort.split("_"); orderBy = { [sortMap[key] || sortMap[q.sort] || "createdAt"]: dir === "asc" ? "asc" : q.order === "asc" ? "asc" : "desc" }; }
  else if (q.orderby) orderBy = { [sortMap[q.orderby] || "createdAt"]: q.order === "asc" ? "asc" : "desc" };
  const [rows, total] = await Promise.all([prisma.product.findMany({ where, include, orderBy, skip: (page - 1) * limit, take: limit }), prisma.product.count({ where })]);
  return { data: rows.map(productDto), pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}
export async function getProduct(id) {
  const numeric = Number(id);
  return productDto(await prisma.product.findFirst({ where: {
    OR: [...(Number.isInteger(numeric) ? [{ id: numeric }, { wordpressId: numeric }] : []), { slug: id }], status: "PUBLISHED",
    AND: [{ OR: [{ stockStatus: { not: "OUT_OF_STOCK" } }, { backordersAllowed: true }] }],
  }, include }));
}
