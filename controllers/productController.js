const Product = require('../models/Product');
const User = require('../models/User');
const { uploadToCloudinary } = require('../middlewares/upload');

exports.createProduct = async (req, res) => {
  // expects multipart/form-data with file 'photo'
  const { name, description, price } = req.body;
  if (!name || !price) return res.status(400).json({ message: 'Missing fields' });

  let photoUrl;
  if (req.file) {
    const result = await uploadToCloudinary(req.file.buffer);
    photoUrl = result.secure_url;
  }

  const seller = req.user;
  const product = new Product({
    name, description, price,
    photo: photoUrl,
    seller: seller._id,
    sellerName: seller.name
  });
  await product.save();
  res.status(201).json(product);
};

exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  if (!product) return res.status(404).json({ message: 'Product not found' });

  // ownership check
  if (!product.seller.equals(req.user._id) && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const { name, description, price } = req.body;
  if (name) product.name = name;
  if (description) product.description = description;
  if (price) product.price = price;

  if (req.file) {
    const result = await uploadToCloudinary(req.file.buffer);
    product.photo = result.secure_url;
  }

  await product.save();
  res.json(product);
};

exports.deleteProduct = async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  if (!product.seller.equals(req.user._id) && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  await product.deleteOne();
  res.json({ message: 'Deleted' });
};

exports.getProduct = async (req, res) => {
  const product = await Product.findById(req.params.id).populate('seller', 'name email');
  if (!product) return res.status(404).json({ message: 'Not found' });
  res.json(product);
};

// List products (public listing)
exports.listProductsPublic = async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const products = await Product.find()
    .skip((page-1)*limit).limit(parseInt(limit)).sort({ createdAt: -1 });
  res.json(products);
};

// Search (protected only for registered users)
exports.searchProducts = async (req, res) => {
  const { q, page = 1, limit = 20 } = req.query;
  if (!q) return res.status(400).json({ message: 'Missing search query "q"' });
  // use text index
  const products = await Product.find({ $text: { $search: q } })
    .skip((page-1)*limit).limit(parseInt(limit));
  res.json(products);
};

// Seller's products (only for that seller or admin)
exports.getSellerProducts = async (req, res) => {
  const sellerId = req.params.sellerId;
  if (req.user.role !== 'admin' && req.user._id.toString() !== sellerId) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  const products = await Product.find({ seller: sellerId }).sort({ createdAt: -1 });
  res.json(products);
};
