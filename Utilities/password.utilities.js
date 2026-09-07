
const bcrypt = require('bcrypt');

// Reusable Hashing tool

/**
 * Encrypts a plain-text password using strong bcrypt hashing.
 * @param {string} password - The raw plain-text password typed by the user
 * @returns {Promise<string>} A promise that resolves to the securely encrypted hash string
 */
exports.hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

// Reusable Password Checking tool

/**
 * Validates a plain-text password input against an encrypted database hash.
 * @param {string} plainPassword - Raw text input from a login request
 * @param {string} hashedPassword - The custom encrypted hash variable stored in MongoDB
 * @returns {Promise<boolean>} A promise that resolves to true if they match, or false if invalid
 */
exports.comparePassword = async (plainPassword, hashedPassword) => {
    return await bcrypt.compare(plainPassword, hashedPassword);
};