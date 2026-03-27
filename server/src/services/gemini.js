const { GoogleGenAI } = require('@google/genai');

/**
 * Extract text from an image using Gemini Vision
 * @param {string} apiKey - decrypted Gemini API key (per-user)
 * @param {string} base64Image - base64 encoded image data
 * @param {string} mimeType - image MIME type (e.g. "image/jpeg")
 * @returns {Promise<{success: boolean, text: string, error?: string}>}
 */
async function extractTextFromImage(apiKey, base64Image, mimeType = 'image/jpeg') {
    try {
        const genAI = new GoogleGenAI({ apiKey });

        const response = await genAI.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                {
                    inlineData: {
                        mimeType,
                        data: base64Image,
                    },
                },
                {
                    text: 'Extract all visible text from this image. Return only the raw text content. If no text is visible, respond with "NO_TEXT_FOUND".',
                },
            ],
        });

        let extractedText = response.text || '';

        if (!extractedText || extractedText.trim() === 'NO_TEXT_FOUND') {
            return { success: false, text: '', error: 'No text found in the image.' };
        }

        extractedText = extractedText.replace(/\n{3,}/g, '\n\n').trim();

        if (extractedText.length > 3000) {
            extractedText = extractedText.substring(0, 3000) + '... [truncated]';
        }

        return { success: true, text: extractedText };
    } catch (error) {
        console.error('Gemini OCR error:', error.message);
        return { success: false, text: '', error: 'Failed to process image: ' + error.message };
    }
}

module.exports = { extractTextFromImage };
