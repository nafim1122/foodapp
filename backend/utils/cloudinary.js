const cloudinary = require('cloudinary').v2;

// Configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload single image to cloudinary
exports.uploadToCloudinary = async (fileBuffer, folder = 'foodapp') => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto',
        folder: folder,
        transformation: [
          { width: 800, height: 600, crop: 'limit' },
          { quality: 'auto' },
          { format: 'auto' }
        ]
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            url: result.secure_url,
            public_id: result.public_id
          });
        }
      }
    ).end(fileBuffer);
  });
};

// Upload multiple images to cloudinary
exports.uploadMultipleToCloudinary = async (files, folder = 'foodapp') => {
  const uploadPromises = files.map(file => 
    this.uploadToCloudinary(file.buffer, folder)
  );
  
  return Promise.all(uploadPromises);
};

// Delete image from cloudinary
exports.deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw error;
  }
};

// Delete multiple images from cloudinary
exports.deleteMultipleFromCloudinary = async (publicIds) => {
  try {
    const result = await cloudinary.api.delete_resources(publicIds);
    return result;
  } catch (error) {
    throw error;
  }
};

module.exports = cloudinary;
