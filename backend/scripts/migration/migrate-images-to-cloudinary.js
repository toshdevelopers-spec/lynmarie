import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { uploadImageFromUrl } from "../../src/utils/cloudinary.js";

const prisma = new PrismaClient({ 
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) 
});

async function migrateImagesToCloudinary() {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      console.error("CLOUDINARY_CLOUD_NAME not set in environment");
      process.exit(1);
    }

    console.log("Fetching product images from database...");
    const images = await prisma.productImage.findMany({
      include: {
        product: true
      }
    });

    console.log(`Found ${images.length} total images`);

    // Filter WordPress URLs locally
    const wordpressImages = images.filter(img => 
      img.url && img.url.includes('wp-content')
    );

    console.log(`Found ${wordpressImages.length} WordPress images to migrate`);

    if (wordpressImages.length === 0) {
      console.log("No WordPress images found to migrate");
      return;
    }

    let successCount = 0;
    let failureCount = 0;

    for (const image of wordpressImages) {
      try {
        console.log(`Processing image ${image.id} for product ${image.product.name}...`);
        
        const cloudinaryData = await uploadImageFromUrl(
          image.url,
          `product-${image.product.wordpressId || image.product.id}-${image.id}`
        );

        await prisma.productImage.update({
          where: { id: image.id },
          data: {
            url: cloudinaryData.url,
            thumbnailUrl: cloudinaryData.thumbnailUrl
          }
        });

        console.log(`✓ Successfully migrated image ${image.id}`);
        successCount++;
        
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error(`✗ Failed to migrate image ${image.id}:`, error.message);
        failureCount++;
      }
    }

    console.log("\n=== Migration Summary ===");
    console.log(`Total WordPress images: ${wordpressImages.length}`);
    console.log(`Successfully migrated: ${successCount}`);
    console.log(`Failed: ${failureCount}`);

  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

migrateImagesToCloudinary();