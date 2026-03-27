const express = require('express');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const auth = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(auth);

// GET /chats - List user's chats
router.get('/', async (req, res) => {
    try {
        const chats = await Chat.find({ user_id: req.user.id })
            .sort({ updated_at: -1 })
            .lean();

        res.json({ chats });
    } catch (error) {
        console.error('Fetch chats error:', error.message);
        res.status(500).json({ error: 'Failed to fetch chats.' });
    }
});

// POST /chats - Create new chat
router.post('/', async (req, res) => {
    try {
        const { title } = req.body;

        const chat = new Chat({
            user_id: req.user.id,
            title: title || 'New Chat',
        });

        await chat.save();
        res.status(201).json({ chat });
    } catch (error) {
        console.error('Create chat error:', error.message);
        res.status(500).json({ error: 'Failed to create chat.' });
    }
});

// DELETE /chats/:id - Delete chat and its messages
router.delete('/:id', async (req, res) => {
    try {
        const chat = await Chat.findOne({ _id: req.params.id, user_id: req.user.id });

        if (!chat) {
            return res.status(404).json({ error: 'Chat not found.' });
        }

        // Delete all messages in this chat
        await Message.deleteMany({ chat_id: chat._id });

        // Delete the chat
        await Chat.deleteOne({ _id: chat._id });

        res.json({ message: 'Chat deleted successfully.' });
    } catch (error) {
        console.error('Delete chat error:', error.message);
        res.status(500).json({ error: 'Failed to delete chat.' });
    }
});

// PUT /chats/:id - Rename chat
router.put('/:id', async (req, res) => {
    try {
        const { title } = req.body;

        const chat = await Chat.findOneAndUpdate(
            { _id: req.params.id, user_id: req.user.id },
            { title },
            { new: true }
        );

        if (!chat) {
            return res.status(404).json({ error: 'Chat not found.' });
        }

        res.json({ chat });
    } catch (error) {
        console.error('Rename chat error:', error.message);
        res.status(500).json({ error: 'Failed to rename chat.' });
    }
});

module.exports = router;
