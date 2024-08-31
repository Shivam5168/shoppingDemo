const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../Models/user');
const router = express.Router();

/**
 * @swagger
 * /api/user/signup:
 *   post:
 *     summary: Create a new user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullname:
 *                 type: string
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               mobileNumber:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Error creating user
 */
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

/**
 * @swagger
 * /api/user/login:
 *   post:
 *     summary: User login
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 loginTime:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Invalid username, mobile number, or password
 */
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Please provide both username/mobile number and password' });
    }

    // Check if the username is a valid mobile number (assuming mobile numbers are 10 digits long)
    const isMobileNumber = /^\d{10}$/.test(username);

    try {
        const user = await User.findOne({ 
            $or: [{ username: isMobileNumber ? null : username }, { mobileNumber: isMobileNumber ? username : null }]
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
        res.status(200).json({ token, loginTime: tokenPayload.loginTime });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});



module.exports = router;
