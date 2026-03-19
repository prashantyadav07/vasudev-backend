import mongoose from 'mongoose';

// Gallery schema for storing image metadata
const gallerySchema = new mongoose.Schema(
  {
    // Image URL from Cloudinary
    imageUrl: {
      type: String,
      required: [true, 'Image URL is required'],
      trim: true
    },

    // Cloudinary public ID for deletion
    publicId: {
      type: String,
      required: [true, 'Public ID is required'],
      unique: true,
      trim: true
    },

    // Optional title/description
    title: {
      type: String,
      trim: true,
      default: null
    },

    // Optional category
    category: {
      type: String,
      trim: true,
      default: 'All'
    },

    // Upload timestamp
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true // Adds createdAt and updatedAt automatically
  }
);

// Index for better query performance
gallerySchema.index({ createdAt: -1 });

// Export model
export default mongoose.model('Gallery', gallerySchema);
