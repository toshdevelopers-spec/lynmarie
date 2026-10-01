ALTER TABLE "products" ADD COLUMN "metaTitle" TEXT;
ALTER TABLE "products" ADD COLUMN "metaDescription" TEXT;

CREATE TABLE "store_events" (
  "id" SERIAL NOT NULL,
  "visitorId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "productId" INTEGER,
  "userId" INTEGER,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "store_events_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "store_events_visitorId_createdAt_idx" ON "store_events"("visitorId", "createdAt");
CREATE INDEX "store_events_action_createdAt_idx" ON "store_events"("action", "createdAt");

CREATE TABLE "inquiries" (
  "id" SERIAL NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'NEW',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "inquiries_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "inquiries_status_createdAt_idx" ON "inquiries"("status", "createdAt");
