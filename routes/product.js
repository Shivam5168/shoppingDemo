const express = require('express');
const Product = require('../Models/product');
const auth = require('../middleware/auth'); // Import the auth middleware
const router = express.Router();


// Add Product
router.post('/add', auth, async (req, res) => {
    const { productName, image, price, title, category, description } = req.body;

    const newProduct = new Product({
        userId: req.userId, // Set userId from the verified token
        productName,
        image,
        price,
        title,
        category,
        description
    });

    try {
        const savedProduct = await newProduct.save();
        res.status(201).json({ message: 'Product added successfully', product: savedProduct });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/category/:category', async (req, res) => {
    const { category } = req.params;

    try {
        const products = await Product.find({ category: category });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
