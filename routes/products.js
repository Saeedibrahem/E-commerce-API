const router = require('express').Router();
const auth = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');
const { upload } = require('../middlewares/upload');
const productCtrl = require('../controllers/productController');

// public listing
router.get('/public', productCtrl.listProductsPublic);
router.get('/:id', productCtrl.getProduct);

// protected search for registered users only
router.get('/', auth, productCtrl.searchProducts);

// seller CRUD - must be authenticated and seller role (or admin)
router.post('/', auth, authorize('seller'), upload.single('photo'), productCtrl.createProduct);
router.put('/:id', auth, upload.single('photo'), productCtrl.updateProduct);
router.delete('/:id', auth, productCtrl.deleteProduct);

// seller products
router.get('/seller/:sellerId', auth, productCtrl.getSellerProducts);

module.exports = router;
