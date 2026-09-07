
const crypto = require('crypto');

// Reusable OTP generation tool

/**
 * Generates a cryptographically secure 6-digit numeric OTP string.
 * @param {number} min - Lower bound inclusive (Default: 100000)
 * @param {number} max - Upper bound inclusive (Default: 999999)
 * @returns {string} Safe random 6-digit number string
 */
exports.generateNumericOtp = (min = 100000, max = 999999) => {
    return crypto.randomInt(min, max).toString();
};