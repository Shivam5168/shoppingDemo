const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../Models/user');
const router = express.Router();

// Signup
router.post('/signup', async (req, res) => {
    const { fullname, username, password, mobileNumber, dateOfBirth } = req.body;
    try {
        const newUser = new User({ fullname, username, password, mobileNumber, dateOfBirth });
        await newUser.save();
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { username, mobileNumber, password } = req.body;
    try {
        const user = await User.findOne({ 
            $or: [{ username: username }, { mobileNumber: mobileNumber }]
        });

        if (!user) {
            return res.status(400).json({ error: 'Invalid username or mobile number' });
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid password' });
        }

        // Create token payload with user ID and current date
        const tokenPayload = {
            id: user._id,
            loginTime: new Date() // Current date and time
        };

        // Generate token
        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Return token, user ID, and current login time
        res.status(200).json({ token, userId: user._id, loginTime: tokenPayload.loginTime });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
