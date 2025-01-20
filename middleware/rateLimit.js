const rateLimit = require('express-rate-limit');

const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3 // limit each IP to 3 requests per windowMs
});

module.exports = passwordResetLimiter; 