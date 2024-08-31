const express = require('express');
const mongoose = require('mongoose');
const Cart = require('../Models/cart');
const Product = require('../Models/products');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Cart management
 */

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Get all items in the cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved cart items
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 products:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       productId:
 *                         type: string
 *                       quantity:
 *                         type: integer
 *       404:
 *         description: Cart not found
 *       500:
 *         description: Internal server error
 */
router.get('/', auth, async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.userId });

        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        res.status(200).json({ products: cart.products });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/cart/add:
 *   post:
 *     summary: Add item to cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Item added to cart
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                 products:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       productId:
 *                         type: string
 *                       quantity:
 *                         type: integer
 *       400:
 *         description: Invalid product ID
 *       404:
 *         description: Product is not available
 *       500:
 *         description: Internal server error
 */
router.post('/add', auth, async (req, res) => {
    const { productId, quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ error: 'Invalid product ID' });
    }

    try {
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ error: 'Product is not available' });
        }

        const cart = await Cart.findOne({ userId: req.userId });

        if (!cart) {
            const newCart = new Cart({
                userId: req.userId,
                products: [{ productId, quantity }]
            });
            await newCart.save();
            return res.status(201).json(newCart);
        }

        const productInCart = cart.products.find(p => p.productId.toString() === productId);

        if (productInCart) {
            productInCart.quantity += quantity;
        } else {
            cart.products.push({ productId, quantity });
        }

        await cart.save();
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/cart/totalItemInCart:
 *   get:
 *     summary: Get total unique items in the cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved total unique products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalUniqueProducts:
 *                   type: integer
 *       404:
 *         description: Cart not found
 *       500:
 *         description: Internal server error
 */
router.get('/totalItemInCart', auth, async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.userId });

        if (!cart) {
            return res.status(200).json({ totalUniqueProducts: 0 }); // No items in the cart
        }

        const uniqueProductIds = new Set(cart.products.map(product => product.productId.toString()));
        const totalUniqueProducts = uniqueProductIds.size;

        res.status(200).json({ totalUniqueProducts });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/cart/remove/{productId}:
 *   delete:
 *     summary: Delete product from cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product removed from cart
 *       404:
 *         description: Cart not found or Product not found in cart
 *       500:
 *         description: Internal server error
 */
router.delete('/remove/:productId', auth, async (req, res) => {
    const { productId } = req.params;

    try {
        const cart = await Cart.findOne({ userId: req.userId });

        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        // Check if the product exists in the cart
        const productIndex = cart.products.findIndex(p => p.productId.toString() === productId);

        if (productIndex === -1) {
            return res.status(404).json({ error: 'Product not found in cart' });
        }

        // Remove the product from the cart
        cart.products.splice(productIndex, 1);
        await cart.save();

        res.status(200).json({ message: 'Product removed from cart', cart });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/cart/updateQuantity/{productId}:
 *   put:
 *     summary: Update product quantity in cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Product quantity updated
 *       400:
 *         description: Quantity must be greater than zero
 *       404:
 *         description: Cart not found or Product not found in cart
 *       500:
 *         description: Internal server error
 */
router.put('/updateQuantity/:productId', auth, async (req, res) => {
    const { productId } = req.params;
    const { quantity } = req.body; // Get the new quantity from the request body

    if (quantity <= 0) {
        return res.status(400).json({ error: 'Quantity must be greater than zero' });
    }

    try {
        const cart = await Cart.findOne({ userId: req.userId });

        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        // Find the product in the cart
        const productIndex = cart.products.findIndex(p => p.productId.toString() === productId);

        if (productIndex === -1) {
            return res.status(404).json({ error: 'Product not found in cart' });
        }

        // Update the product quantity
        cart.products[productIndex].quantity = quantity;

        await cart.save();

        res.status(200).json({ message: 'Product quantity updated', cart });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
