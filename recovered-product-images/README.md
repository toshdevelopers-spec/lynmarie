# Lyn Marie product image recovery

On 2026-10-16, the production `product_images` table had 121 records. The previous browser cache recovery produced visibly corrupted photos, so those were replaced along with the old WordPress links using 18 representative fashion photos from Pexels. The images are assigned to products by garment category and description. They are stock references, not photos of the exact items for sale.

The original downloaded JPEGs are in `open-source/`. Pexels photo IDs, original CDN URLs, Cloudinary URLs, and license information are in `open-source/pexels-sources.json`. The images are served from Cloudinary at `lynmarie-products/open-source/pexels-<id>`; the production Neon image rows now point to optimized Cloudinary URLs.

Pexels' license permits free use, including commercial use, and does not require attribution. It prohibits implying that a depicted person endorses the business. See [Pexels License](https://www.pexels.com/license/). Product pages should be updated with the actual product photography when it becomes available.

The earlier damaged browser-cache recovery files and their manifests remain here for provenance; they are no longer referenced by the product database.
