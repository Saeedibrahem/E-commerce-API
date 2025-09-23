const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

exports.createOrder = async (req, res) => {
  // expects { paymentMethod: 'cod' } or with stripe payment info handled separately
  const user = req.user;
  const cart = await Cart.findOne({ user: user._id }).populate('items.product');
  if (!cart || cart.items.length === 0) return res.status(400).json({ message: 'Cart empty' });

  const products = cart.items.map(it => ({
    product: it.product._id,
    quantity: it.quantity,
    price: it.priceAtAdding || it.product.price
  }));
  const total = products.reduce((s, p) => s + p.quantity * p.price, 0);

  const order = new Order({
    user: user._id,
    products,
    total,
    paymentMethod: req.body.paymentMethod || 'cod',
    paymentStatus: req.body.paymentMethod === 'stripe' ? 'pending' : 'pending'
  });
  await order.save();

  // optionally clear cart
  await cart.deleteOne();

  res.status(201).json(order);
};

exports.getOrder = async (req, res) => {
  const order = await Order.findById(req.params.id).populate('products.product');
  if (!order) return res.status(404).json({ message: 'Not found' });
  // owner or admin or seller who owns product
  if (req.user.role !== 'admin' && !order.user.equals(req.user._id)) {
    // seller check: if any product belongs to this seller
    const productIds = order.products.map(p => p.product._id ? p.product._id : p.product);
    const owns = await Product.exists({ _id: { $in: productIds }, seller: req.user._id });
    if (!owns) return res.status(403).json({ message: 'Forbidden' });
  }
  res.json(order);
};

exports.getUserOrders = async (req, res) => {
  const userId = req.params.userId;
  if (req.user.role !== 'admin' && req.user._id.toString() !== userId) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
  res.json(orders);
};
