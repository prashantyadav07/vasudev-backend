/**
 * Video Controller
 * Handles video upload and management operations
 */

import Video from '../models/Video.js';
import { extractVideoId } from '../utils/youtube.js';
import { sendSuccess, sendError } from '../utils/helpers.js';

/**
 * Add a new video
 * POST /api/videos
 */
export async function addVideo(req, res) {
  try {
    const { title, youtubeUrl } = req.body;

    // Validate required fields
    if (!title || !youtubeUrl) {
      return sendError(res, 'Title and YouTube URL are required', 400);
    }

    // Extract video ID and validate URL
    let videoId;
    try {
      videoId = extractVideoId(youtubeUrl);
    } catch (error) {
      return sendError(res, error.message, 400);
    }

    // Generate thumbnail URL
    const thumbnail = `https://img.youtube.com/vi/${videoId}/0.jpg`;

    // Create and save video
    const video = new Video({
      title: title.trim(),
      youtubeUrl,
      thumbnail
    });

    await video.save();

    return sendSuccess(res, {
      id: video._id,
      title: video.title,
      youtubeUrl: video.youtubeUrl,
      thumbnail: video.thumbnail,
      createdAt: video.createdAt
    }, 'Video added successfully', 201);
  } catch (error) {
    console.error('Error adding video:', error);

    // Handle duplicate URL
    if (error.code === 11000) {
      return sendError(res, 'This video already exists', 400);
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return sendError(res, messages[0], 400);
    }

    return sendError(res, 'Failed to add video', 500);
  }
}

/**
 * Get all videos
 * GET /api/videos
 */
export async function getVideos(req, res) {
  try {
    const videos = await Video.find()
      .sort({ createdAt: -1 })
      .select('_id title youtubeUrl thumbnail createdAt');

    return sendSuccess(res, {
      count: videos.length,
      videos
    }, 'Videos retrieved successfully');
  } catch (error) {
    console.error('Error fetching videos:', error);
    return sendError(res, 'Failed to fetch videos', 500);
  }
}

/**
 * Get single video by ID
 * GET /api/videos/:id
 */
export async function getVideoById(req, res) {
  try {
    const { id } = req.params;

    const video = await Video.findById(id);

    if (!video) {
      return sendError(res, 'Video not found', 404);
    }

    return sendSuccess(res, video, 'Video retrieved successfully');
  } catch (error) {
    console.error('Error fetching video:', error);

    if (error.kind === 'ObjectId') {
      return sendError(res, 'Invalid video ID', 400);
    }

    return sendError(res, 'Failed to fetch video', 500);
  }
}

/**
 * Delete a video
 * DELETE /api/videos/:id
 */
export async function deleteVideo(req, res) {
  try {
    const { id } = req.params;

    const video = await Video.findByIdAndDelete(id);

    if (!video) {
      return sendError(res, 'Video not found', 404);
    }

    return sendSuccess(res, {
      deletedId: video._id
    }, 'Video deleted successfully');
  } catch (error) {
    console.error('Error deleting video:', error);

    if (error.kind === 'ObjectId') {
      return sendError(res, 'Invalid video ID', 400);
    }

    return sendError(res, 'Failed to delete video', 500);
  }
}

/**
 * Update video title
 * PUT /api/videos/:id
 */
export async function updateVideoTitle(req, res) {
  try {
    const { id } = req.params;
    const { title } = req.body;

    if (!title) {
      return sendError(res, 'Title is required', 400);
    }

    const video = await Video.findByIdAndUpdate(
      id,
      { title: title.trim() },
      { new: true, runValidators: true }
    );

    if (!video) {
      return sendError(res, 'Video not found', 404);
    }

    return sendSuccess(res, video, 'Video title updated successfully');
  } catch (error) {
    console.error('Error updating video:', error);

    if (error.kind === 'ObjectId') {
      return sendError(res, 'Invalid video ID', 400);
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return sendError(res, messages[0], 400);
    }

    return sendError(res, 'Failed to update video', 500);
  }
}

export default {
  addVideo,
  getVideos,
  getVideoById,
  deleteVideo,
  updateVideoTitle
};
