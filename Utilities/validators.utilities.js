
// Reuseable Password Validator tool

/**
 * Validates whether a password meets security strength standards.
 * Requirements: At least 1 uppercase letter, 1 special character, and 1 number.
 * @param {string} password - The raw plain-text password to check
 * @returns {boolean} True if the password meets specifications, false if weak
 */
exports.validatePasswordStrength = (password) => {
    // If no password string was provided, fail early
    if (!password) return false;

    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])(?=.*\d)/;
    return passwordRegex.test(password);
};