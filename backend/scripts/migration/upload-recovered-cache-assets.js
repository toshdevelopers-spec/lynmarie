import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { uploadImageToCloudinary } from "../../src/utils/cloudinary.js";

const workspace = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../");
const imageDirectory = path.join(workspace, "recovered-product-images");
const manifest = JSON.parse(await fs.readFile(path.join(imageDirectory, "neon-image-restore-manifest.json"), "utf8"));

if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  throw new Error("Cloudinary credentials are incomplete.");
}

const results = [];
const errors = [];
const resultsPath = path.join(imageDirectory, "cloudinary-image-restore-results.json");
for (const entry of manifest) {
  const prefix = `${entry.sourceName}--`;
  const candidates = (await fs.readdir(imageDirectory)).filter((name) => name.startsWith(prefix) && name.endsWith(".webp"));
  if (!candidates.length) {
    errors.push({ id: entry.id, error: "No recovered cache file found." });
    continue;
  }
  const ranked = await Promise.all(candidates.map(async (name) => ({
    name,
    size: (await fs.stat(path.join(imageDirectory, name))).size,
  })));
  ranked.sort((a, b) => b.size - a.size || a.name.localeCompare(b.name));
  let uploadedResult = null;
  let lastError = null;
  for (const candidate of ranked) {
    try {
      const bytes = await fs.readFile(path.join(imageDirectory, candidate.name));
      const uploaded = await uploadImageToCloudinary(`data:image/webp;base64,${bytes.toString("base64")}`, {
        public_id: `product-${entry.productId}-${entry.id}`,
        resource_type: "image",
        overwrite: true,
        invalidate: true,
        format: "webp",
        quality: "auto:good",
      });
      uploadedResult = {
        id: entry.id,
        productId: entry.productId,
        sourceName: entry.sourceName,
        fileName: candidate.name,
        url: uploaded.url,
        thumbnailUrl: uploaded.thumbnailUrl,
        publicId: uploaded.publicId,
      };
      break;
    } catch (error) {
      lastError = error;
    }
  }
  if (uploadedResult) {
    results.push(uploadedResult);
    await fs.writeFile(resultsPath, JSON.stringify(results, null, 2));
    console.log(`Uploaded recovered image row ${entry.id}`);
  } else {
    errors.push({ id: entry.id, error: lastError?.message || "All matching cache files failed." });
    console.error(`Upload failed for recovered image row ${entry.id}: ${lastError?.message || "all candidates failed"}`);
  }
}

await fs.writeFile(resultsPath, JSON.stringify(results, null, 2));
console.log(JSON.stringify({ uploaded: results.length, failed: errors.length, errors }));
if (errors.length) process.exitCode = 1;
