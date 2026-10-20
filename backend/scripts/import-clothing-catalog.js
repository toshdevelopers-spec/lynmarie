import "dotenv/config";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { v2 as cloudinary } from "cloudinary";
import { prisma } from "../src/config/prisma.js";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, "../..");
const manifestPath = process.argv[2] || "/tmp/lynmarie-clothing-catalog.json";
const categories = [
  ["Dresses", "dresses", "Shop women’s day dresses, occasion dresses, maxi dresses, midi dresses and fitted styles in a range of colours and prints."],
  ["Two-Piece Sets", "two-piece-sets", "Coordinated two-piece outfits, including matching tops and trousers or skirts for polished everyday and occasion dressing."],
  ["Office Wear", "office-wear", "Polished women’s workwear, including tailored trouser suits, skirt suits and coordinated pieces for meetings and professional occasions."],
  ["Evening & Dinner Dresses", "evening-dinner-dresses", "Women’s dinner dresses, evening gowns and cocktail styles for dinners, celebrations and special nights out."],
  ["Tops & Blouses", "tops-blouses", "Blouses, shirts, dressy tops and casual separates in solid colours, prints and statement details."],
  ["Bottoms", "bottoms", "Women’s trousers, skirts and other separates to pair with tops, blouses and coordinated outfits."],
  ["Jumpsuits", "jumpsuits", "One-piece women’s jumpsuits and playsuits, from relaxed daytime pieces to polished evening styles."],
  ["Outerwear", "outerwear", "Light jackets, cardigans and layering pieces to complete workwear, casual and occasion outfits."],
  ["Bridal & Occasion", "bridal-occasion", "Wedding, bridal party and special-event clothing and accessories, including elegant formalwear."],
  ["Kidswear", "kidswear", "Children’s clothing and occasion outfits in playful colours and comfortable styles."],
  ["Bags", "bags", "Handbags, shoulder bags, clutches and practical fashion bags in classic and seasonal colours."],
  ["Shoes", "shoes", "Women’s footwear, including heels, flats, sandals and casual shoes for everyday and occasion wear."],
  ["Hats & Accessories", "hats-accessories", "Fashion hats, scarves, jewellery and finishing accessories for everyday looks and special occasions."],
];

const slugify = value => value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "product";
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function retryUpload(file, options, attempts = 4) {
  for (let attempt = 1; ; attempt += 1) {
    try { return await cloudinary.uploader.upload(file, options); }
    catch (error) {
      if (attempt >= attempts) throw error;
      await delay(attempt * 1000);
    }
  }
}

async function withConcurrency(items, limit, worker) {
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (true) {
      const index = next++;
      if (index >= items.length) return;
      await worker(items[index], index);
    }
  });
  await Promise.all(workers);
}

async function existingProductAssets() {
  const publicIds = new Set();
  let nextCursor;
  do {
    const page = await cloudinary.api.resources({
      type: "upload",
      prefix: "lynmarie-products/",
      max_results: 500,
      ...(nextCursor ? { next_cursor: nextCursor } : {}),
    });
    for (const resource of page.resources || []) publicIds.add(resource.public_id);
    nextCursor = page.next_cursor;
  } while (nextCursor);
  return publicIds;
}

function productImageAlt(product, index) {
  return `${product.name} in ${product.color}, product view ${index + 1}`;
}

async function main() {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error("Cloudinary credentials are missing from the backend environment.");
  }
  if (!fs.existsSync(manifestPath)) throw new Error(`Catalog manifest not found: ${manifestPath}`);
  const catalog = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  if (!Array.isArray(catalog) || catalog.length < 20) throw new Error("The prepared catalog is empty or incomplete.");

  const imagePaths = [...new Set(catalog.flatMap(product => product.files))];
  const resolved = new Map();
  for (const relative of imagePaths) {
    const file = path.resolve(root, relative);
    if (!file.startsWith(`${root}${path.sep}`) || !fs.existsSync(file)) throw new Error(`Missing or invalid catalog image: ${relative}`);
    resolved.set(relative, file);
  }
  if (catalog.some(product => !product.files.length || product.files.length > 30 || !product.name || !product.description || !product.metaDescription || !product.color || !product.category || !product.price)) {
    throw new Error("A product is missing required copy, price, category, color or gallery images.");
  }

  cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET, secure: true });
  // Confirm database connectivity before transferring the image set.
  await prisma.$queryRaw`SELECT 1`;
  await cloudinary.api.ping();
  const existingAssets = await existingProductAssets();

  const uploads = new Map();
  const imageList = [...resolved.entries()];
  console.log(`Uploading ${imageList.length} product photos for ${catalog.length} grouped products to Cloudinary...`);
  await withConcurrency(imageList, 5, async ([relative, file], index) => {
    const content = fs.readFileSync(file);
    const digest = crypto.createHash("sha1").update(content).digest("hex").slice(0, 12);
    const product = catalog.find(item => item.files.includes(relative));
    const publicId = `${slugify(product.name)}-${digest}`;
    const result = existingAssets.has(`lynmarie-products/${publicId}`)
      ? { public_id: `lynmarie-products/${publicId}`, secure_url: cloudinary.url(`lynmarie-products/${publicId}`, { secure: true }) }
      : await retryUpload(file, {
        folder: "lynmarie-products",
        public_id: publicId,
        overwrite: true,
        unique_filename: false,
        resource_type: "image",
      });
    uploads.set(relative, {
      url: result.secure_url,
      thumbnailUrl: cloudinary.url(result.public_id, { secure: true, width: 600, height: 800, crop: "fill", quality: "auto:best", fetch_format: "auto" }),
      publicId: result.public_id,
    });
    if ((index + 1) % 25 === 0 || index + 1 === imageList.length) console.log(`Cloudinary uploads complete: ${index + 1}/${imageList.length}`);
  });

  const imported = await prisma.$transaction(async tx => {
    const categoryIds = new Map();
    for (const [name, slug, description] of categories) {
      const category = await tx.category.upsert({ where: { slug }, create: { name, slug, description }, update: { name, description } });
      categoryIds.set(name, category.id);
    }

    // Replace the old open-source catalog. Order items retain their saved name,
    // SKU and price; the Product relation uses onDelete:SetNull for history.
    await tx.product.deleteMany();
    await tx.category.deleteMany({ where: { slug: { notIn: categories.map(([, slug]) => slug) } } });
    await tx.tag.deleteMany();
    await tx.brand.deleteMany();
    await tx.attribute.deleteMany();
    const colorAttribute = await tx.attribute.create({ data: { name: "Color", slug: "pa_color", type: "select" } });

    const usedSlugs = new Set();
    const productRows = [];
    const rowMetadata = [];
    const timestamp = new Date();
    for (let index = 0; index < catalog.length; index += 1) {
      const item = catalog[index];
      const baseSlug = slugify(item.name);
      let slug = baseSlug;
      let suffix = 2;
      while (usedSlugs.has(slug)) slug = `${baseSlug}-${suffix++}`;
      usedSlugs.add(slug);
      const categoryId = categoryIds.get(item.category);
      if (!categoryId) throw new Error(`No category is configured for ${item.category}`);
      const price = Number(Number(item.price).toFixed(2));
      productRows.push({
        name: item.name,
        slug,
        description: item.description,
        shortDescription: item.shortDescription,
        sku: `LM26-${String(index + 1).padStart(4, "0")}`,
        price,
        regularPrice: price,
        salePrice: null,
        status: "PUBLISHED",
        purchasable: true,
        manageStock: false,
        stockStatus: "IN_STOCK",
        metaTitle: item.metaTitle,
        metaDescription: item.metaDescription,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
      rowMetadata.push({ item, slug, categoryId });
    }
    await tx.product.createMany({ data: productRows });
    const savedProducts = await tx.product.findMany({ where: { slug: { in: rowMetadata.map(row => row.slug) } }, select: { id: true, slug: true } });
    const productIds = new Map(savedProducts.map(product => [product.slug, product.id]));
    const productCategories = [];
    const productImages = [];
    const productAttributes = [];
    for (const { item, slug, categoryId } of rowMetadata) {
      const productId = productIds.get(slug);
      if (!productId) throw new Error(`Created product could not be found: ${slug}`);
      productCategories.push({ productId, categoryId });
      productAttributes.push({ productId, attributeId: colorAttribute.id, value: item.color, visible: true });
      item.files.forEach((relative, position) => productImages.push({
        productId,
        url: uploads.get(relative).url,
        thumbnailUrl: uploads.get(relative).thumbnailUrl,
        altText: productImageAlt(item, position),
        name: path.basename(relative),
        position,
      }));
    }
    await tx.productCategory.createMany({ data: productCategories });
    await tx.productAttributeValue.createMany({ data: productAttributes });
    await tx.productImage.createMany({ data: productImages });
    return { products: catalog.length, images: imageList.length, categories: categories.length };
  }, { maxWait: 15000, timeout: 120000 });

  const [products, images, orderItems] = await Promise.all([
    prisma.product.count(),
    prisma.productImage.count(),
    prisma.orderItem.count({ where: { productId: null } }),
  ]);
  console.log(JSON.stringify({ imported, verified: { products, images }, historicalOrderItemsDetached: orderItems }));
}

main().catch(error => {
  console.error(`Clothing catalog import failed: ${error.message}`);
  process.exitCode = 1;
}).finally(async () => {
  await prisma.$disconnect();
});
