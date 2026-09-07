
// Reuseable currency symbol mapping dictionary

/**
 * Converts a 3-letter currency code into its respective geographic currency symbol.
 * Defaults to the Nigerian Naira symbol (₦) if undefined or unmatched.
 * @param {string} currencyCode - Standard currency string shortcode (NGN, USD, EUR, etc.)
 * @returns {string} The active display symbol string
 */
exports.formatCurrencySymbol = (currencyCode) => {
    const currencySymbols = {
        NGN: '₦',
        USD: '$',
        GBP: '£',
        EUR: '€'
    };
    return currencySymbols[currencyCode] || '₦';
};

//

/**
 * Trims blank trailing space weight and normalizes string casing for database safety.
 * @param {string} text - Raw unformatted text input
 * @returns {string} Cleaned lowercase string
 */
exports.normalizeStringInput = (text) => {
    if (!text) return '';
    return text.toLowerCase().trim();
};