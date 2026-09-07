
const { rateLimit } = require('express-rate-limit');

// General Limiter for entire bsupermarket application
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, //15mins window
    limit: 100, // Max allowed hits per IP adddress the windowMs (limit can be changed to max for better compatibilty with older versions of express-rate-limit)
    // Handler block to force clean JSON output
    handler: (req, res, next, options) => {
        return res.status(429).json({
            success: false,
            message: 'Too many requests from this device. Please try again after 15 minutes.'
        });
    },
    standardHeaders: true, // true is used in place of 'draft-8' for better compatibilty with older versions of express-rate-limit and to allow for more information columns
    legacyHeaders: false,
});

module.exports = { apiLimiter };