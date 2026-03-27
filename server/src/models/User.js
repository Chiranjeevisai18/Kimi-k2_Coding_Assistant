const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password_hash: {
        type: String,
        required: true,
    },
    encrypted_groq_key: {
        type: String,
        required: true,
    },
    encrypted_gemini_key: {
        type: String,
        required: true,
    },
    encrypted_cloudinary_name: {
        type: String,
        required: true,
    },
    encrypted_cloudinary_key: {
        type: String,
        required: true,
    },
    encrypted_cloudinary_secret: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password_hash')) return next();
    const salt = await bcrypt.genSalt(12);
    this.password_hash = await bcrypt.hash(this.password_hash, salt);
    next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password_hash);
};

module.exports = mongoose.model('User', userSchema);
