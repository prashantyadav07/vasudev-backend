import cloudinary from '../config/cloudinary.js';
import Gallery from '../models/Gallery.js';

/**
 * Upload image to Cloudinary and save metadata to MongoDB
 * 
 * Process:
 * 1. Get file from multer (in memory buffer)
 * 2. Upload to Cloudinary
 * 3. Save image metadata to MongoDB
 * 4. Return image data
 */
export const uploadImage = async (req, res, next) => {
  try {
    console.log('[UPLOAD] Upload request started');
    // Check if file exists
    if (!req.file) {
      console.warn('[UPLOAD] No file provided in request');
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    console.log('[UPLOAD] File received:', {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    const { title, category } = req.body;

    // Upload to Cloudinary from buffer
    console.log('[UPLOAD] Starting Cloudinary upload stream...');
    const uploadPromise = new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'vasudev-gallery', // Organize in Cloudinary
          resource_type: 'auto'
        },
        (error, result) => {
          if (error) {
            console.error('[UPLOAD] Cloudinary stream error:', error);
            reject(error);
          } else {
            console.log('[UPLOAD] Cloudinary upload successful:', result.public_id);
            resolve(result);
          }
        }
      );

      uploadStream.end(req.file.buffer);
    });

    const cloudinaryResult = await uploadPromise;

    // Save to MongoDB
    console.log('[UPLOAD] Saving metadata to MongoDB...');
    const galleryImage = new Gallery({
      imageUrl: cloudinaryResult.secure_url,
      publicId: cloudinaryResult.public_id,
      title: title || null,
      category: category || 'All'
    });

    await galleryImage.save();
    console.log('[UPLOAD] MongoDB save successful:', galleryImage._id);

    // Return success response
    return res.status(201).json({
      success: true,
      message: 'Image uploaded successfully',
      image: {
        id: galleryImage._id,
        imageUrl: galleryImage.imageUrl,
        publicId: galleryImage.publicId,
        title: galleryImage.title,
        createdAt: galleryImage.createdAt
      }
    });

  } catch (error) {
    console.error('[UPLOAD] Upload error catch block:', error);
    
    // Parse error string safely
    const errorMessage = error instanceof Error 
      ? error.message 
      : typeof error === 'object' 
        ? JSON.stringify(error) 
        : String(error);

    return res.status(error.statusCode || error.http_code || 500).json({
      success: false,
      message: errorMessage || 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

/**
 * Get all images from gallery
 * 
 * Returns:
 * - Array of all images sorted by latest first
 * - Public endpoint (no auth required)
 */
export const getImages = async (req, res, next) => {
  try {
    // Fetch all images sorted by creation date (latest first)
    const images = await Gallery.find()
      .sort({ createdAt: -1 })
      .select('_id imageUrl title category createdAt');

    return res.status(200).json({
      success: true,
      message: 'Images retrieved successfully',
      count: images.length,
      images
    });

  } catch (error) {
    console.error('Get images error:', error.message);
    next(error);
  }
};

/**
 * Delete image from gallery
 * 
 * Process:
 * 1. Find image by ID
 * 2. Delete from Cloudinary using publicId
 * 3. Delete from MongoDB
 * 4. Return success message
 */
export const deleteImage = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!id || id.length !== 24) {
      return res.status(400).json({
        success: false,
        message: 'Invalid image ID format'
      });
    }

    // Find image in database
    const image = await Gallery.findById(id);

    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    // Delete from Cloudinary
    try {
      await cloudinary.uploader.destroy(image.publicId);
    } catch (cloudinaryError) {
      console.warn(`Warning: Could not delete from Cloudinary: ${cloudinaryError.message}`);
      // Continue anyway - delete from DB
    }

    // Delete from MongoDB
    await Gallery.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Image deleted successfully',
      deletedId: id
    });

  } catch (error) {
    console.error('Delete image error:', error.message);
    next(error);
  }
};

/**
 * Get single image by ID
 * 
 * Returns image details by MongoDB ID
 */
export const getImageById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const image = await Gallery.findById(id);

    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Image retrieved successfully',
      image
    });

  } catch (error) {
    console.error('Get image error:', error.message);
    next(error);
  }
};

/**
 * Update image title
 * 
 * Allows admin to update image title/description
 */
export const updateImageTitle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Title is required'
      });
    }

    const image = await Gallery.findByIdAndUpdate(
      id,
      { title },
      { new: true, runValidators: true }
    );

    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Image title updated successfully',
      image
    });

  } catch (error) {
    console.error('Update image error:', error.message);
    next(error);
  }
};
