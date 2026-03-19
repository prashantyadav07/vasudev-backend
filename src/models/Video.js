/**
 * Video Model
 * Stores YouTube video information in MongoDB
 */

import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Video title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [200, 'Title must not exceed 200 characters']
    },
    youtubeUrl: {
      type: String,
      required: [true, 'YouTube URL is required'],
      validate: {
        validator: function (url) {
          // Valid YouTube URL patterns
          const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube|youtu|youtube-nocookie)\.(com|be)\//;
          return youtubeRegex.test(url);
        },
        message: 'Invalid YouTube URL format'
      }
    },
    thumbnail: {
      type: String,
      optional: true,
      default: null
    },
    createdAt: {
      type: Date,
      default: Date.now,
      immutable: true
    }
  },
  {
    timestamps: true
  }
);

// Index for efficient sorting
videoSchema.index({ createdAt: -1 });

const Video = mongoose.model('Video', videoSchema);

export default Video;
