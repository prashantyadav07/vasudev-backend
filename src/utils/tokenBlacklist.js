/**
 * Token Blacklist Service
 * Manages invalidated tokens (logged out or revoked)
 * 
 * In-memory implementation:
 * - Simple and fast for moderate usage
 * - Tokens auto-expire based on JWT expiry
 * 
 * For production with high concurrency:
 * - Migrate to Redis for distributed caching
 * - Use database for persistent storage
 */

class TokenBlacklist {
  constructor() {
    this.blacklist = new Set();
    // Clean up expired tokens every 10 minutes
    this.cleanupInterval = setInterval(() => this.cleanup(), 10 * 60 * 1000);
  }

  /**
   * Add token to blacklist
   * Store token + expiry time for cleanup
   */
  add(token, expiryTime) {
    this.blacklist.add({
      token,
      expiryTime,
      addedAt: Date.now()
    });
  }

  /**
   * Check if token is blacklisted
   */
  isBlacklisted(token) {
    for (let entry of this.blacklist) {
      if (entry.token === token) {
        return true;
      }
    }
    return false;
  }

  /**
   * Remove expired tokens from blacklist
   * Called periodically to prevent memory leaks
   */
  cleanup() {
    const now = Math.floor(Date.now() / 1000);
    let removedCount = 0;

    for (let entry of this.blacklist) {
      if (entry.expiryTime < now) {
        this.blacklist.delete(entry);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      console.log(`[TokenBlacklist] Cleaned up ${removedCount} expired tokens`);
    }
  }

  /**
   * Get current blacklist size (for monitoring)
   */
  getSize() {
    return this.blacklist.size;
  }

  /**
   * Clear entire blacklist (use with caution)
   */
  clear() {
    this.blacklist.clear();
  }

  /**
   * Destroy cleanup interval (on app shutdown)
   */
  destroy() {
    clearInterval(this.cleanupInterval);
  }
}

// Create singleton instance
const tokenBlacklist = new TokenBlacklist();

export default tokenBlacklist;
