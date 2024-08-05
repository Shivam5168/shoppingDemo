const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1]; // Get the token from the header

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id; // Extract the user ID from the token
        next(); // Proceed to the next middleware/route handler
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

module.exports = auth;
