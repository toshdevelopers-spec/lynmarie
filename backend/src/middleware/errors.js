export const notFound = (req, res) => res.status(404).json({ success: false, message: "Route not found" });
export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);
  if (err.name === "ZodError") return res.status(400).json({ success: false, message: "Invalid request", errors: err.issues });
  if (err.code === "P2002") return res.status(409).json({ success: false, message: "A record with that email, SKU, slug, or identifier already exists" });
  if (err.code === "P2025") return res.status(404).json({ success: false, message: "Requested record was not found" });
  if (["P1001", "P1002", "ECONNREFUSED", "ETIMEDOUT"].includes(err.code) || ["ECONNREFUSED", "ETIMEDOUT"].includes(err.cause?.code)) {
    if (process.env.NODE_ENV !== "production") console.error("Database connection failed:", err.message);
    return res.status(503).json({ success: false, message: "The store database is unavailable. Start PostgreSQL and confirm DATABASE_URL points to the running database." });
  }
  if (err.code === "P2021" || err.code === "P2022") {
    if (process.env.NODE_ENV !== "production") console.error("Database schema is not up to date:", err.message);
    return res.status(503).json({ success: false, message: "The store database schema is missing or out of date. Run the backend migrations." });
  }
  const status = Number(err.status) || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ success: false, message: status >= 500 ? "Internal server error" : err.message });
};
export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
