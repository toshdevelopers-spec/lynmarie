ALTER TABLE "orders"
  ADD COLUMN "paymentMessage" TEXT,
  ADD COLUMN "paymentReviewedAt" TIMESTAMP(3),
  ADD COLUMN "paymentReviewedById" INTEGER,
  ADD COLUMN "paymentReviewNote" TEXT,
  ADD COLUMN "collectionConfirmedById" INTEGER,
  ADD COLUMN "deliveryRiderId" INTEGER,
  ADD COLUMN "deliveryPaymentAmount" DECIMAL(12,2),
  ADD COLUMN "deliveryPaymentConfirmedAt" TIMESTAMP(3),
  ADD COLUMN "deliveryPaymentConfirmedById" INTEGER;

CREATE INDEX "orders_deliveryRiderId_fulfillmentMethod_paymentStatus_idx" ON "orders"("deliveryRiderId", "fulfillmentMethod", "paymentStatus");
ALTER TABLE "orders" ADD CONSTRAINT "orders_paymentReviewedById_fkey" FOREIGN KEY ("paymentReviewedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "orders" ADD CONSTRAINT "orders_collectionConfirmedById_fkey" FOREIGN KEY ("collectionConfirmedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "orders" ADD CONSTRAINT "orders_deliveryRiderId_fkey" FOREIGN KEY ("deliveryRiderId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "orders" ADD CONSTRAINT "orders_deliveryPaymentConfirmedById_fkey" FOREIGN KEY ("deliveryPaymentConfirmedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
