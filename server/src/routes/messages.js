const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const Message = require('../models/Message');
const Chat = require('../models/Chat');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimiter');
const { decrypt } = require('../services/encryption');
const { buildContext } = require('../services/memory');
const { extractTextFromImage } = require('../services/gemini');
const { streamChatCompletion } = require('../services/groq');

const router = express.Router();

// Multer config for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only JPEG, PNG, WebP, and GIF images are allowed.'));
        }
    },
});

// All routes require authentication
router.use(auth);

// GET /messages/:chat_id - Fetch messages for a chat
router.get('/:chat_id', async (req, res) => {
    try {
        const { chat_id } = req.params;
        const { page = 1, limit = 50 } = req.query;

        const chat = await Chat.findOne({ _id: chat_id, user_id: req.user.id });
        if (!chat) {
            return res.status(404).json({ error: 'Chat not found.' });
        }

        const messages = await Message.find({ chat_id })
            .sort({ created_at: 1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .lean();

        const total = await Message.countDocuments({ chat_id });

        res.json({ messages, total, page: parseInt(page), limit: parseInt(limit) });
    } catch (error) {
        console.error('Fetch messages error:', error.message);
        res.status(500).json({ error: 'Failed to fetch messages.' });
    }
});

// POST /messages - Save a message only
router.post('/', async (req, res) => {
    try {
        const { chat_id, content } = req.body;

        if (!chat_id || !content) {
            return res.status(400).json({ error: 'chat_id and content are required.' });
        }

        const chat = await Chat.findOne({ _id: chat_id, user_id: req.user.id });
        if (!chat) {
            return res.status(404).json({ error: 'Chat not found.' });
        }

        const message = new Message({ chat_id, role: 'user', content });
        await message.save();

        chat.updated_at = new Date();
        await chat.save();

        res.status(201).json({ message });
    } catch (error) {
        console.error('Save message error:', error.message);
        res.status(500).json({ error: 'Failed to save message.' });
    }
});

// POST /chat/stream - Stream AI response via SSE
router.post('/chat/stream', aiLimiter, upload.array('images', 8), async (req, res) => {
    try {
        const { chat_id, content } = req.body;

        if (!chat_id || !content) {
            return res.status(400).json({ error: 'chat_id and content are required.' });
        }

        const chat = await Chat.findOne({ _id: chat_id, user_id: req.user.id });
        if (!chat) {
            return res.status(404).json({ error: 'Chat not found.' });
        }

        // Set SSE headers immediately so we can stream status updates
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');
        res.flushHeaders();

        // Get user and decrypt ALL their keys
        const user = await User.findById(req.user.id);
        if (!user) {
            res.write(`data: ${JSON.stringify({ error: 'User not found.' })}\n\n`);
            return res.end();
        }

        let decryptedGroqKey, decryptedGeminiKey, decryptedCloudName, decryptedCloudKey, decryptedCloudSecret;
        try {
            decryptedGroqKey = decrypt(user.encrypted_groq_key);
            decryptedGeminiKey = decrypt(user.encrypted_gemini_key);
            decryptedCloudName = decrypt(user.encrypted_cloudinary_name);
            decryptedCloudKey = decrypt(user.encrypted_cloudinary_key);
            decryptedCloudSecret = decrypt(user.encrypted_cloudinary_secret);
        } catch (err) {
            res.write(`data: ${JSON.stringify({ error: 'Failed to decrypt API keys. Please re-register.' })}\n\n`);
            return res.end();
        }

        // Process images if uploaded
        let extractedTexts = [];
        let imageUrls = [];

        if (req.files && req.files.length > 0) {
            res.write(`data: ${JSON.stringify({ status: 'Extracting text from images...' })}\n\n`);

            cloudinary.config({
                cloud_name: decryptedCloudName,
                api_key: decryptedCloudKey,
                api_secret: decryptedCloudSecret,
            });

            for (const file of req.files) {
                try {
                    const filePath = file.path;
                    const base64Image = fs.readFileSync(filePath).toString('base64');

                    // OCR via Gemini using USER's Gemini key
                    const ocrResult = await extractTextFromImage(decryptedGeminiKey, base64Image, file.mimetype);

                    if (ocrResult.success && ocrResult.text) {
                        extractedTexts.push(`[Image ${imageUrls.length + 1} Context]:\n${ocrResult.text}`);
                    }

                    // Upload to Cloudinary using USER's Cloudinary credentials
                    const cloudResult = await cloudinary.uploader.upload(filePath, {
                        folder: 'ai_chat_images',
                        resource_type: 'image',
                    });

                    imageUrls.push(cloudResult.secure_url);
                    fs.unlinkSync(filePath);
                } catch (imgError) {
                    console.error('Image processing error:', imgError.message);
                    if (fs.existsSync(file.path)) {
                        fs.unlinkSync(file.path);
                    }
                    // We continue processing other images even if one fails
                }
            }
        }

        const combinedExtractedText = extractedTexts.length > 0 ? extractedTexts.join('\n\n') : null;

        // Save user message to DB
        const userMessage = new Message({
            chat_id,
            role: 'user',
            content,
            image_url: imageUrls.length > 0 ? imageUrls[0] : null,
            image_urls: imageUrls,
            ocr_text: combinedExtractedText,
        });
        await userMessage.save();

        // Auto-title: set chat title from first message
        const messageCount = await Message.countDocuments({ chat_id });
        if (messageCount === 1) {
            chat.title = content.substring(0, 50) + (content.length > 50 ? '...' : '');
            await chat.save();
        }

        // Build conversation context with memory
        const messages = await buildContext(chat_id, content, combinedExtractedText);

        res.write(`data: ${JSON.stringify({ status: 'Thinking...' })}\n\n`);

        // Stream response from Groq using USER's Groq key
        let fullResponse;
        try {
            fullResponse = await streamChatCompletion(decryptedGroqKey, messages, res);
        } catch (streamError) {
            console.error('Stream error:', streamError.message);
            res.write(`data: ${JSON.stringify({ error: 'AI response failed: ' + streamError.message })}\n\n`);
            res.end();
            return;
        }

        // Save assistant response to DB
        if (fullResponse) {
            const assistantMessage = new Message({
                chat_id,
                role: 'assistant',
                content: fullResponse,
            });
            await assistantMessage.save();

            chat.updated_at = new Date();
            await chat.save();
        }

        res.end();
    } catch (error) {
        console.error('Chat stream error:', error.message);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to process chat request.' });
        } else {
            res.write(`data: ${JSON.stringify({ error: 'Stream interrupted.' })}\n\n`);
            res.end();
        }
    }
});

module.exports = router;
