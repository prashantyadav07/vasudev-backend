/**
 * Request Logger Middleware
 * Logs all incoming HTTP requests for debugging and monitoring
 */

const requestLogger = (req, res, next) => {
  // Capture request start time
  const startTime = Date.now();

  // Capture response end
  const originalSend = res.send;
  res.send = function (data) {
    const duration = Date.now() - startTime;
    
    // Log request details
    const logLevel = res.statusCode >= 400 ? '⚠️ ' : '✓ ';
    
    console.log(
      `${logLevel} [${req.method}] ${req.path} - ${res.statusCode} (${duration}ms)`
    );

    // Log additional info for errors
    if (res.statusCode >= 400) {
      if (req.user) {
        console.log(`   User: ${req.user.email}`);
      }
      if (req.body && Object.keys(req.body).length > 0) {
        console.log(`   Body:`, req.body);
      }
    }

    return originalSend.call(this, data);
  };

  next();
};

export default requestLogger;
