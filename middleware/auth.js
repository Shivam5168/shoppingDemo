const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1]; // Get the token from the header

    if (!token) {
        return res.status(401).json({ error: 'Authentication failed. Please log in to continue.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id; // Ensure the user ID is correctly attached to the request
        next(); // Proceed to the next middleware/route handler
    } catch (error) {
        return res.status(401).json({ error: 'Invalid User. Please log in again.' });
    }
};

module.exports = auth;
