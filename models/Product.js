const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true, text: true },
    description: String,
    photo: String, // URL stored after upload
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sellerName: String,
    price: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
});

ProductSchema.index({ name: 'text', sellerName: 'text' });

module.exports = mongoose.model('Product', ProductSchema);
