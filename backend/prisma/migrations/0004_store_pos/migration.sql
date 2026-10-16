ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'SELLER';

ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "barcode" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "products_barcode_key" ON "products"("barcode");

ALTER TABLE "orders"
  ADD COLUMN IF NOT EXISTS "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
  ADD COLUMN IF NOT EXISTS "amountPaid" DECIMAL(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "amountTendered" DECIMAL(12,2),
  ADD COLUMN IF NOT EXISTS "orderType" TEXT NOT NULL DEFAULT 'ONLINE',
  ADD COLUMN IF NOT EXISTS "fulfillmentMethod" TEXT NOT NULL DEFAULT 'DELIVERY',
  ADD COLUMN IF NOT EXISTS "pickedUpAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "sellerId" INTEGER,
  ADD COLUMN IF NOT EXISTS "discountReason" TEXT;
ALTER TABLE "orders" ADD CONSTRAINT "orders_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX IF NOT EXISTS "orders_orderType_createdAt_idx" ON "orders"("orderType", "createdAt");
CREATE INDEX IF NOT EXISTS "orders_fulfillmentMethod_paymentStatus_idx" ON "orders"("fulfillmentMethod", "paymentStatus");
CREATE INDEX IF NOT EXISTS "orders_sellerId_createdAt_idx" ON "orders"("sellerId", "createdAt");

ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "variantDetails" TEXT;
