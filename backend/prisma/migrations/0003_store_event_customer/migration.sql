CREATE INDEX "store_events_userId_createdAt_idx" ON "store_events"("userId", "createdAt");

ALTER TABLE "store_events"
ADD CONSTRAINT "store_events_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
