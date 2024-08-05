const express = require('express');
const Product = require('../Models/publicProduct'); // Assuming this is where your schema is defined
const router = express.Router();

// Add Public Product (without user ID)
router.post('/add', async (req, res) => {
    const { productName, image, price, title, category, description } = req.body;

    const newProduct = new Product({
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
