import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",

  migrations: {
    path: "prisma/migrations",
  },

  datasource: {
    // Migrations need a direct Neon connection. The pooled URL remains the
    // runtime default when no separate migration URL is configured.
    url: process.env.DATABASE_URL_UNPOOLED || env("DATABASE_URL"),
  },
});
