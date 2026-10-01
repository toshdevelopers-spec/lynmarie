import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import net from "node:net";

// Neon hostnames can resolve to IPv4 and IPv6 addresses even when the current
// network has no IPv6 route. Node's address-family racing can then time out
// PostgreSQL connections; let the resolver select the usable address.
net.setDefaultAutoSelectFamily(false);

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
export const prisma = new PrismaClient({ adapter });
