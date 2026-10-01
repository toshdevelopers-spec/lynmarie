import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { asyncHandler } from "../middleware/errors.js";

const registerSchema = z.object({ email: z.string().email().transform(v => v.toLowerCase()), password: z.string().min(8), firstName: z.string().trim().min(1).optional(), lastName: z.string().trim().min(1).optional(), phone: z.string().optional() });
const publicUser = ({ id, email, firstName, lastName, phone, role }) => ({ id, email, first_name: firstName, last_name: lastName, phone, role });
const tokenFor = (user) => jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
export const register = asyncHandler(async (req, res) => {
  const body = registerSchema.parse(req.body);
  const existing = await prisma.user.findUnique({ where: { email: body.email } });
  if (existing?.passwordHash) return res.status(409).json({ success: false, message: "An account with this email already exists" });
  const passwordHash = await bcrypt.hash(body.password, 12);
  const { password, ...profile } = body;
  const user = existing ? await prisma.user.update({ where: { id: existing.id }, data: { ...profile, passwordHash, isActive: true } }) : await prisma.user.create({ data: { ...profile, passwordHash } });
  res.status(201).json({ success: true, data: publicUser(user), token: tokenFor(user) });
});
export const login = asyncHandler(async (req, res) => {
  const body = z.object({ email: z.string().email(), password: z.string().min(1) }).parse(req.body);
  const user = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });
  if (!user?.passwordHash || !user.isActive || !(await bcrypt.compare(body.password, user.passwordHash))) return res.status(401).json({ success: false, message: "Email or password is incorrect" });
  res.json({ success: true, data: publicUser(user), token: tokenFor(user) });
});
export const me = (req, res) => res.json({ success: true, data: publicUser(req.user) });
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = z.object({ email: z.string().email() }).parse(req.body);
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  let resetToken;
  if (user) {
    resetToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");
    await prisma.passwordResetToken.create({ data: { userId: user.id, tokenHash, expiresAt: new Date(Date.now() + 60 * 60 * 1000) } });
  }
  const response = { success: true, message: "If an account exists, password reset instructions will be sent." };
  // In development, surface a one-time token for manual local reset; never log it.
  if (process.env.NODE_ENV === "development" && resetToken) response.resetToken = resetToken;
  res.json(response);
});
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = z.object({ token: z.string().min(16), password: z.string().min(8) }).parse(req.body);
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });
  if (!record || record.usedAt || record.expiresAt < new Date()) return res.status(400).json({ success: false, message: "Reset token is invalid or expired" });
  await prisma.$transaction([prisma.user.update({ where: { id: record.userId }, data: { passwordHash: await bcrypt.hash(password, 12) } }), prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } })]);
  res.json({ success: true, message: "Password has been reset" });
});
