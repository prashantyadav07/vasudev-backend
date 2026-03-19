/**
 * YouTube URL Utility Functions
 * Handles extraction of video IDs from various YouTube URL formats
 */

/**
 * Extract video ID from YouTube URL
 * Supports formats:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://youtube.com/embed/VIDEO_ID
 * @param {string} url - YouTube URL
 * @returns {string} Video ID
 * @throws {Error} "Invalid YouTube URL"
 */
export function extractVideoId(url) {
  if (!url || typeof url !== 'string') {
    throw new Error('Invalid YouTube URL');
  }

  try {
    // Format: https://www.youtube.com/watch?v=VIDEO_ID
    if (url.includes('youtube.com/watch')) {
      const urlObj = new URL(url);
      const videoId = urlObj.searchParams.get('v');
      if (videoId && videoId.length === 11) {
        return videoId;
      }
    }

    // Format: https://youtu.be/VIDEO_ID
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      if (videoId && videoId.length === 11) {
        return videoId;
      }
    }

    // Format: https://youtube.com/embed/VIDEO_ID
    if (url.includes('youtube.com/embed/')) {
      const videoId = url.split('youtube.com/embed/')[1]?.split('?')[0];
      if (videoId && videoId.length === 11) {
        return videoId;
      }
    }

    throw new Error('Invalid YouTube URL');
  } catch (error) {
    throw new Error('Invalid YouTube URL');
  }
}

export default {
  extractVideoId
};
