import multer from 'multer';

// Use MemoryStorage to stream directly to Cloudinary without writing to ephemeral disk
const storage = multer.memoryStorage();

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // Maximum 100MB buffer limit
  },
});
