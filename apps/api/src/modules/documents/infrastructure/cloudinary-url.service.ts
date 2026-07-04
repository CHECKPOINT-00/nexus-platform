// Re-export from unified Cloudinary service
// This file is kept for backward compatibility
export {
  generateSignedUrl as generateSignedCloudinaryUrl,
  extractPublicId as extractPublicIdFromUrl,
} from '../../../services/cloudinary.js';

