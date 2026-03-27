const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { encrypt } = require('../services/encryption');

const router = express.Router();

// POST /auth/register
router.post('/register', async (req, res) => {
    try {
        const { email, password, groqApiKey, geminiApiKey, cloudinaryName, cloudinaryKey, cloudinarySecret } = req.body;

        // Validation
        if (!email || !password || !groqApiKey || !geminiApiKey || !cloudinaryName || !cloudinaryKey || !cloudinarySecret) {
            return res.status(400).json({ error: 'All fields are required: email, password, Groq API key, Gemini API key, and Cloudinary credentials.' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters.' });
        }

        // Check if user exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({ error: 'An account with this email already exists.' });
        }

        // Encrypt all API keys
        const user = new User({
            email: email.toLowerCase(),
            password_hash: password,
            encrypted_groq_key: encrypt(groqApiKey),
            encrypted_gemini_key: encrypt(geminiApiKey),
            encrypted_cloudinary_name: encrypt(cloudinaryName),
            encrypted_cloudinary_key: encrypt(cloudinaryKey),
            encrypted_cloudinary_secret: encrypt(cloudinarySecret),
        });

        await user.save();

        // Generate JWT
        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'Registration successful.',
            token,
            user: { id: user._id, email: user.email },
        });
    } catch (error) {
        console.error('Registration error:', error.message);
        res.status(500).json({ error: 'Server error during registration.' });
    }
});

// POST /auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful.',
            token,
            user: { id: user._id, email: user.email },
        });
    } catch (error) {
        console.error('Login error:', error.message);
        res.status(500).json({ error: 'Server error during login.' });
    }
});

module.exports = router;
