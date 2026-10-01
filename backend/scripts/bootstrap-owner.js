import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const email = "adelewigitz@gmail.com";
const resetPassword = process.argv.includes("--reset-password");
async function readInitialPassword() {
  if (process.env.ADMIN_INITIAL_PASSWORD) return process.env.ADMIN_INITIAL_PASSWORD;
  if (!process.stdin.isTTY) throw new Error("Run this command in a terminal or set ADMIN_INITIAL_PASSWORD securely.");
  process.stdout.write("Set an initial password for the owner account (12+ characters): ");
  return new Promise((resolve, reject) => {
    let value = "";
    const onData = chunk => {
      const key = chunk.toString();
      if (key === "\u0003") { process.stdin.setRawMode(false); process.stdin.pause(); reject(new Error("Setup cancelled.")); return; }
      if (key === "\r" || key === "\n") {
        process.stdin.off("data", onData); process.stdin.setRawMode(false); process.stdin.pause(); process.stdout.write("\n"); resolve(value); return;
      }
      if (key === "\u007f" || key === "\b") value = value.slice(0, -1);
      else if (!key.startsWith("\u001b")) value += key;
    };
    process.stdin.setRawMode(true); process.stdin.resume(); process.stdin.on("data", onData);
  });
}
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
try {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (!existing || !existing.passwordHash || resetPassword) {
    const password = await readInitialPassword();
    if (!password || password.length < 12) throw new Error("Set ADMIN_INITIAL_PASSWORD to a unique password of at least 12 characters for the first administrator setup.");
    const passwordHash = await bcrypt.hash(password, 12);
    if (existing) await prisma.user.update({ where: { id: existing.id }, data: { passwordHash, role: "ADMIN", isActive: true } });
    else await prisma.user.create({ data: { email, passwordHash, role: "ADMIN", isActive: true } });
  } else {
    await prisma.user.update({ where: { id: existing.id }, data: { role: "ADMIN", isActive: true } });
  }
  console.log(`Administrator access is ready for ${email}. Passwords are never stored in source or printed.`);
} finally { await prisma.$disconnect(); }
