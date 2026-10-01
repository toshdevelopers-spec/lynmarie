import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { asyncHandler } from "../middleware/errors.js";
import bcrypt from "bcryptjs";
export const updateMe = asyncHandler(async (req, res) => {
  const body = z.object({ first_name: z.string().trim().min(1).optional(), last_name: z.string().trim().min(1).optional(), phone: z.string().optional() }).parse(req.body);
  const user = await prisma.user.update({ where: { id: req.user.id }, data: { firstName: body.first_name, lastName: body.last_name, phone: body.phone } });
  res.json({ success: true, data: { id: user.id, email: user.email, first_name: user.firstName, last_name: user.lastName, phone: user.phone } });
});
export const orders = asyncHandler(async (req, res) => { const rows = await prisma.order.findMany({ where: { userId: req.user.id }, include: { items: true }, orderBy: { createdAt: "desc" } }); res.json({ success: true, data: rows }); });
const addressSchema = z.object({ first_name: z.string().trim().min(1).max(100), last_name: z.string().trim().min(1).max(100), company: z.string().max(160).optional(), address_1: z.string().trim().min(1).max(250), address_2: z.string().max(250).optional(), city: z.string().trim().min(1).max(120), state: z.string().max(120).optional(), postcode: z.string().trim().min(1).max(30), country: z.string().length(2).default("KE"), phone: z.string().max(40).optional() });
const addressDto = a => ({ first_name: a.firstName, last_name: a.lastName, company: a.company, address_1: a.address1, address_2: a.address2, city: a.city, state: a.state, postcode: a.postcode, country: a.country, phone: a.phone });
export const getAddresses = asyncHandler(async (req, res) => { const rows = await prisma.address.findMany({ where: { userId: req.user.id } }); res.json({ success: true, data: Object.fromEntries(rows.map(a => [a.type.toLowerCase(), addressDto(a)])) }); });
export const saveAddress = asyncHandler(async (req, res) => {
  const type = z.enum(["BILLING", "SHIPPING"]).parse(req.params.type.toUpperCase());
  const a = addressSchema.parse(req.body);
  const data = { firstName: a.first_name, lastName: a.last_name, company: a.company, address1: a.address_1, address2: a.address_2, city: a.city, state: a.state, postcode: a.postcode, country: a.country, phone: a.phone };
  const row = await prisma.address.upsert({ where: { userId_type: { userId: req.user.id, type } }, create: { userId: req.user.id, type, ...data }, update: data });
  res.json({ success: true, data: addressDto(row) });
});
export const changePassword = asyncHandler(async (req, res) => {
  const input = z.object({ current_password: z.string().min(1), new_password: z.string().min(8).max(200) }).parse(req.body);
  if (!req.user.passwordHash || !(await bcrypt.compare(input.current_password, req.user.passwordHash))) return res.status(400).json({ success: false, message: "Current password is incorrect" });
  await prisma.user.update({ where: { id: req.user.id }, data: { passwordHash: await bcrypt.hash(input.new_password, 12) } });
  res.json({ success: true, message: "Password changed successfully" });
});
