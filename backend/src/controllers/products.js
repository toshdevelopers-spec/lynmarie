import { listProducts, getProduct } from "../services/products.js";
export async function index(req, res) { const result = await listProducts(req.query); res.json({ success: true, ...result }); }
export async function show(req, res) { const product = await getProduct(req.params.id); if (!product) return res.status(404).json({ success: false, message: "Product not found" }); res.json({ success: true, data: product }); }
