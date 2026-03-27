const Message = require('../models/Message');
const { estimateMessagesTokens } = require('../utils/tokenEstimator');

const SYSTEM_PROMPT = 'You are a helpful AI assistant. You provide clear, accurate, and concise responses. When appropriate, you use markdown formatting for better readability.';
const MAX_CONTEXT_TOKENS = 4000;
const MAX_RECENT_MESSAGES = 12;

/**
 * Build conversation context with session-based memory
 * @param {string} chatId - MongoDB chat ID
 * @param {string} userMessage - current user message
 * @param {string|null} extractedText - extracted text from image (if any)
 * @returns {Promise<Array<{role: string, content: string}>>}
 */
async function buildContext(chatId, userMessage, extractedText = null) {
    // Step 1: Fetch recent messages from DB
    const recentMessages = await Message.find({ chat_id: chatId })
        .sort({ created_at: -1 })
        .limit(MAX_RECENT_MESSAGES)
        .lean();

    // Reverse to chronological order
    recentMessages.reverse();

    // Step 2: Prevent duplication and enrich with OCR context
    // If the most recent message in history is the one we're currently processing (just saved to DB),
    // we remove it from history so we can append it manually with the fresh OCR context.
    if (recentMessages.length > 0) {
        const lastMsg = recentMessages[recentMessages.length - 1];
        if (lastMsg.role === 'user' && lastMsg.content === userMessage) {
            recentMessages.pop();
        }
    }

    // Format messages for API, including OCR context from past messages
    let contextMessages = recentMessages.map(msg => ({
        role: msg.role,
        content: msg.ocr_text ? 
            `Context from uploaded image:\n${msg.ocr_text}\n\nUser query:\n${msg.content}` : 
            msg.content,
    }));

    // Step 3: Token-aware trimming
    const currentMessage = buildUserMessage(userMessage, extractedText);

    // Add system prompt + current message to estimate total
    const systemTokens = Math.ceil(SYSTEM_PROMPT.split(/\s+/).length * 1.3) + 4;
    const currentTokens = Math.ceil(currentMessage.split(/\s+/).length * 1.3) + 4;
    const reservedTokens = systemTokens + currentTokens;

    while (
        contextMessages.length > 0 &&
        estimateMessagesTokens(contextMessages) + reservedTokens > MAX_CONTEXT_TOKENS
    ) {
        contextMessages.shift(); // Remove oldest message
    }

    // Step 4: Construct final messages array
    const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...contextMessages,
        { role: 'user', content: currentMessage },
    ];

    return messages;
}

/**
 * Build user message with optional image text
 */
function buildUserMessage(userMessage, extractedText) {
    if (extractedText) {
        return `User uploaded an image.\n\nExtracted text:\n${extractedText}\n\nUser query:\n${userMessage}`;
    }
    return userMessage;
}

module.exports = { buildContext };
