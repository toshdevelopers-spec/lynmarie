import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function uploadImageToCloudinary(imageUrl, options = {}) {
  try {
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: 'lynmarie-products',
      ...options,
    });
    return {
      url: result.secure_url,
      publicId: result.public_id,
      thumbnailUrl: cloudinary.url(result.public_id, {
        width: 300,
        height: 300,
        crop: 'fill',
      }),
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }
}

export async function uploadImageFromUrl(imageUrl, filename = null) {
  try {
    const options = {
      public_id: filename || `product-${Date.now()}`,
      resource_type: 'image',
    };
    return await uploadImageToCloudinary(imageUrl, options);
  } catch (error) {
    console.error('Error uploading image from URL:', error);
    throw error;
  }
}

export function getCloudinaryUrl(publicId, options = {}) {
  return cloudinary.url(publicId, {
    secure: true,
    ...options,
  });
}

export default cloudinary;