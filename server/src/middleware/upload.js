import multer from "multer";
import AppError from "../utils/AppError.js";

// memoryStorage keeps the temporary image in RAM so it can be sent straight to Cloudinary.
const storage = multer.memoryStorage();

const fileFilter = (req, file, callback) => {
  if (["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.mimetype)) return callback(null, true);
  callback(new AppError("Only image files are allowed", 400));
};

const upload = multer({
  storage,
  fileFilter,
  // A small limit prevents a large upload from using too much server memory.
  limits: { fileSize: 5 * 1024 * 1024, files: 6 }, // 5 MB each, max six
});

export default upload;
