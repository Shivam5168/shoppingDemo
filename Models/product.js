const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }, // Made optional
    productName: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    title: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});


const Product = mongoose.model('Product', productSchema);

module.exports = Product;
