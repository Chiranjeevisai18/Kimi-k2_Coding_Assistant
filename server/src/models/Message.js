const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    chat_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat',
        required: true,
        index: true,
    },
    role: {
        type: String,
        enum: ['user', 'assistant'],
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    image_url: {
        type: String,
        default: null,
    },
    image_urls: {
        type: [String],
        default: [],
    },
    ocr_text: {
        type: String,
        default: null,
    },
}, {
    timestamps: { createdAt: 'created_at' },
});

module.exports = mongoose.model('Message', messageSchema);
