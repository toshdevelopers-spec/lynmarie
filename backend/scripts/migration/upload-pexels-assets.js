import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { uploadImageToCloudinary } from "../../src/utils/cloudinary.js";

const workspace = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../");
const directory = path.join(workspace, "recovered-product-images/open-source");
const resultPath = path.join(directory, "cloudinary-assets.json");
const files = (await fs.readdir(directory)).filter((name) => /^pexels-\d+\.jpg$/.test(name)).sort();
const results = [];

for (const name of files) {
  const pexelsId = name.match(/\d+/)[0];
  const data = await fs.readFile(path.join(directory, name));
  const uploaded = await uploadImageToCloudinary(`data:image/jpeg;base64,${data.toString("base64")}`, {
    public_id: `open-source/pexels-${pexelsId}`,
    resource_type: "image",
    overwrite: true,
    invalidate: true,
    format: "webp",
    quality: "auto:good",
  });
  results.push({ pexelsId, filename: name, ...uploaded });
  await fs.writeFile(resultPath, JSON.stringify(results, null, 2));
  console.log(`Uploaded Pexels ${pexelsId}`);
}

console.log(`Uploaded ${results.length} Pexels images to Cloudinary.`);
