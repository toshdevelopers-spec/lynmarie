import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { asyncHandler } from "../middleware/errors.js";
import { sendAccountWelcomeEmail, sendPasswordResetEmail } from "../utils/email.js";
import { passwordSchema } from "../utils/security.js";

const registerSchema = z.object({ email: z.string().email().max(254).transform(v => v.toLowerCase()), password: passwordSchema, firstName: z.string().trim().min(1).max(100).optional(), lastName: z.string().trim().min(1).max(100).optional(), phone: z.string().max(40).optional() });
const publicUser = ({ id, email, firstName, lastName, phone, role }) => ({ id, email, first_name: firstName, last_name: lastName, phone, role });
const tokenFor = (user) => jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d", algorithm: "HS256" });
export const register = asyncHandler(async (req, res) => {
  const body = registerSchema.parse(req.body);
  const existing = await prisma.user.findUnique({ where: { email: body.email } });
  if (existing?.passwordHash) return res.status(409).json({ success: false, message: "An account with this email already exists" });
  const passwordHash = await bcrypt.hash(body.password, 12);
  const { password, ...profile } = body;
  const user = existing ? await prisma.user.update({ where: { id: existing.id }, data: { ...profile, passwordHash, isActive: true } }) : await prisma.user.create({ data: { ...profile, passwordHash } });
  try { await sendAccountWelcomeEmail(user); }
  catch (error) { console.error("Welcome email could not be sent:", error.message); }
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
  if (process.env.NODE_ENV === "production" && !process.env.RESEND_API_KEY) {
    return res.status(503).json({ success: false, message: "Password reset email is temporarily unavailable. Please contact the store for help." });
  }
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  let resetToken;
  if (user) {
    resetToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");
    await prisma.passwordResetToken.updateMany({ where: { userId: user.id, usedAt: null }, data: { usedAt: new Date() } });
    await prisma.passwordResetToken.create({ data: { userId: user.id, tokenHash, expiresAt: new Date(Date.now() + 60 * 60 * 1000) } });
    try { await sendPasswordResetEmail(user.email, resetToken); }
    catch (error) {
      console.error("Password reset email could not be sent:", error.message);
      return res.status(503).json({ success: false, message: "We could not send the reset email just now. Please try again." });
    }
  }
  const response = { success: true, message: "If an account exists, password reset instructions will be sent." };
  // In development, surface a one-time token for manual local reset; never log it.
  if (process.env.NODE_ENV === "development" && resetToken) response.resetToken = resetToken;
  res.json(response);
});
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = z.object({ token: z.string().min(16).max(256), password: passwordSchema }).parse(req.body);
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });
  if (!record || record.usedAt || record.expiresAt < new Date()) return res.status(400).json({ success: false, message: "Reset token is invalid or expired" });
  await prisma.$transaction([prisma.user.update({ where: { id: record.userId }, data: { passwordHash: await bcrypt.hash(password, 12) } }), prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } })]);
  res.json({ success: true, message: "Password has been reset" });
});
