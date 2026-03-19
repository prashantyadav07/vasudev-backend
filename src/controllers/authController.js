import jwt from 'jsonwebtoken';
import tokenBlacklist from '../utils/tokenBlacklist.js';

/**
 * Login admin function
 * Authenticates admin with email and password
 * Returns JWT token valid for 7 days
 */
export const loginAdmin = (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Get admin credentials from environment variables
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const jwtSecret = process.env.JWT_SECRET;

    // Verify email
    if (email !== adminEmail) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Verify password
    if (password !== adminPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token with 7 days expiry
    const token = jwt.sign(
      {
        role: 'admin',
        email: adminEmail
      },
      jwtSecret,
      {
        expiresIn: '7d',
        issuer: 'vasudev-admin',
        subject: 'admin-auth'
      }
    );

    // Return success response with token
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      expiresIn: '7 days'
    });

  } catch (error) {
    console.error('Login error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

/**
 * Logout admin function
 * Blacklists the current token
 * Frontend should remove token from localStorage/sessionStorage
 * 
 * How it works:
 * 1. Extract token from Authorization header
 * 2. Verify the token is valid
 * 3. Add token to blacklist
 * 4. Return success message
 * 5. Frontend removes token from storage
 */
export const logoutAdmin = (req, res) => {
  try {
    // Token should be available from authenticate middleware
    const token = req.token;
    const user = req.user;

    if (!token || !user) {
      return res.status(401).json({
        success: false,
        message: 'No active session found'
      });
    }

    // Add token to blacklist
    // Token will auto-expire from blacklist when it expires naturally
    tokenBlacklist.add(token, user.exp);

    console.log(`[AUTH] Admin logged out: ${user.email}`);

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Logout error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
};

/**
 * Get current session info
 * Returns information about the current user session
 */
export const getSessionInfo = (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'No active session'
      });
    }

    // Convert Unix timestamp to readable date
    const expiryDate = new Date(user.exp * 1000);
    const timeRemaining = user.exp - Math.floor(Date.now() / 1000);

    return res.status(200).json({
      success: true,
      message: 'Session info',
      session: {
        email: user.email,
        role: user.role,
        issuedAt: new Date(user.iat * 1000),
        expiresAt: expiryDate,
        timeRemainingSeconds: timeRemaining,
        timeRemainingMinutes: Math.round(timeRemaining / 60)
      }
    });

  } catch (error) {
    console.error('Session info error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving session info'
    });
  }
};
