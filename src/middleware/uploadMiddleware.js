const multer = require('multer');

// Configure multer to use memory storage, which is ideal if you plan 
// to upload to cloud services like Cloudinary directly from buffers
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

module.exports = upload;
