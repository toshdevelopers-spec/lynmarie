import { prisma } from "../config/prisma.js";
export async function categories(req, res) {
  const where = req.query.slug ? { slug: String(req.query.slug) } : {};
  res.json({ success: true, data: await prisma.category.findMany({ where, orderBy: { name: "asc" }, include: { _count: { select: { products: true } } } }) });
}
export async function category(req, res) {
  const id = Number(req.params.id);
  const row = await prisma.category.findFirst({ where: { OR: [{ slug: req.params.id }, ...(Number.isInteger(id) ? [{ id }, { wordpressId: id }] : [])] }, include: { _count: { select: { products: true } } } });
  if (!row) return res.status(404).json({ success: false, message: "Category not found" });
  res.json({ success: true, data: row });
}
export async function brands(req, res) { res.json({ success: true, data: await prisma.brand.findMany({ orderBy: { name: "asc" } }) }); }
