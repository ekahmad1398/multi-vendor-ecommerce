export const notFound = (req, res) => res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });

export const errorHandler = (err, req, res, next) => {
  if (process.env.NODE_ENV !== "production") console.error(err);
  if (err.name === "CastError") return res.status(400).json({ message: "Invalid resource id" });
  if (err.code === 11000) return res.status(409).json({ message: "A record with that value already exists" });
  if (err.name === "ValidationError") return res.status(400).json({ message: err.message });
  if (err.name === "MulterError") return res.status(400).json({ message: err.code === "LIMIT_FILE_SIZE" ? "Image file is too large" : "Invalid image upload" });
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") return res.status(401).json({ message: "Invalid or expired authentication token" });
  const status = err.statusCode || 500;
  const message = status >= 500 && process.env.NODE_ENV === "production" && !err.isOperational
    ? "Internal server error"
    : err.message || "Internal server error";
  res.status(status).json({ message });
};
