// ==========================================
// 📤 MULTER FILE UPLOAD MIDDLEWARE
// ==========================================
// Ye middleware Multipart Form-Data Files ko memory buffer me parse karta hai (Disk I/O bypass karke direct Cloudinary stream upload ke liye).

import multer from 'multer';

// Memory Storage (RAM memory Buffer storage)
const storage = multer.memoryStorage();

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // Maximum 100MB file size limit
  },
});

