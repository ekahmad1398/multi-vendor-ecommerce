import { v2 as cloudinary } from "cloudinary";

// Cloudinary uses these server-only credentials to upload and manage images.
// Keep them in .env; never send API_SECRET to the frontend.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;
