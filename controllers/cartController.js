const Cart = require('../models/Cart');
const Product = require('../models/Product');

exports.getMyCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  res.json(cart || { items: [] });
};

exports.createOrReplaceCart = async (req, res) => {
  // expects { items: [{ product, quantity }] }
  const { items } = req.body;
  const productDocs = await Product.find({ _id: { $in: items.map(i => i.product) }});
  const formatted = items.map(i => {
    const p = productDocs.find(pd => pd._id.equals(i.product));
    return { product: i.product, quantity: i.quantity || 1, priceAtAdding: p ? p.price : 0 };
  });
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = new Cart({ user: req.user._id, items: formatted });
  } else {
    cart.items = formatted;
    cart.updatedAt = Date.now();
  }
  await cart.save();
  res.json(cart);
};

exports.updateCart = async (req, res) => {
  // only owner or admin can update
  const cart = await Cart.findById(req.params.id);
  if (!cart) return res.status(404).json({ message: 'Cart not found' });
  if (!cart.user.equals(req.user._id) && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  const { items } = req.body;
  if (items) cart.items = items;
  cart.updatedAt = Date.now();
  await cart.save();
  res.json(cart);
};

exports.deleteCart = async (req, res) => {
  const cart = await Cart.findById(req.params.id);
  if (!cart) return res.status(404).json({ message: 'Cart not found' });
  if (!cart.user.equals(req.user._id) && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  await cart.deleteOne();
  res.json({ message: 'Deleted' });
};
