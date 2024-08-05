const mongoose = require('mongoose');

const publicProductSchema = new mongoose.Schema({
    productName: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    title: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const PublicProduct = mongoose.model('PublicProduct', publicProductSchema);

module.exports = PublicProduct;
