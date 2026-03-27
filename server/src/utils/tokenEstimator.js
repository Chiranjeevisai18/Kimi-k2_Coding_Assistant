/**
 * Estimate token count from text using word-based approximation.
 * Roughly 1 word ≈ 1.3 tokens for English text.
 * @param {string} text
 * @returns {number}
 */
function estimateTokens(text) {
    if (!text) return 0;
    const words = text.split(/\s+/).filter(Boolean).length;
    return Math.ceil(words * 1.3);
}

/**
 * Estimate total tokens from an array of messages
 * @param {Array<{role: string, content: string}>} messages
 * @returns {number}
 */
function estimateMessagesTokens(messages) {
    return messages.reduce((total, msg) => {
        // ~4 tokens overhead per message (role, formatting)
        return total + estimateTokens(msg.content) + 4;
    }, 0);
}

module.exports = { estimateTokens, estimateMessagesTokens };
