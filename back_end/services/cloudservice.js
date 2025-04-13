const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const { v2: cloudinary } = require("cloudinary");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a file to Cloudinary
 * @param {string} file - File path or URL
 * @param {Object} options - Upload options (folder, public_id, etc.)
 */
const uploadImage = async (file, options = {}) => {
  try {
    const result = await cloudinary.uploader.upload(file, options);
    console.log("✅ Cloudinary upload successful:", result.secure_url);
    return result;
  } catch (error) {
    console.error("❌ Cloudinary upload failed:", error.message);
    throw error;
  }
};

module.exports = { uploadImage, cloudinary };
