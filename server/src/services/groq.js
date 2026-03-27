const Groq = require('groq-sdk');

/**
 * Stream chat completion from Groq
 * @param {string} apiKey - decrypted Groq API key
 * @param {Array<{role: string, content: string}>} messages - conversation messages
 * @param {import('express').Response} res - Express response for SSE
 * @returns {Promise<string>} - full response text
 */
async function streamChatCompletion(apiKey, messages, res) {
    const groq = new Groq({ apiKey });

    const completion = await groq.chat.completions.create({
        messages,
        model: 'moonshotai/kimi-k2-instruct-0905',
        temperature: 0.6,
        max_completion_tokens: 4096,
        stream: true,
    });

    let fullResponse = '';

    for await (const chunk of completion) {
        const token = chunk.choices[0]?.delta?.content || '';
        if (token) {
            fullResponse += token;
            // Send SSE event
            res.write(`data: ${JSON.stringify({ token })}\n\n`);
        }
    }

    // Signal stream end
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);

    return fullResponse;
}

module.exports = { streamChatCompletion };
