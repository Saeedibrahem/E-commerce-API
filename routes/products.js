const router = require('express').Router();
const auth = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');
const { upload } = require('../middlewares/upload');
const productCtrl = require('../controllers/productController');

/**
 * @openapi
 * tags:
 *   - name: Products
 *     description: Product endpoints
 */

// public listing
/**
 * @openapi
 * /api/products/public:
 *   get:
 *     tags: [Products]
 *     summary: Public listing
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/public', productCtrl.listProductsPublic);
router.get('/:id', productCtrl.getProduct);

// protected search for registered users only
/**
 * @openapi
 * /api/products:
 *   get:
 *     tags: [Products]
 *     summary: Search products (requires auth)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *         required: true
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: List of products
 */
router.get('/', auth, productCtrl.searchProducts);

// seller CRUD - must be authenticated and seller role (or admin)
/**
 * @openapi
 * /api/products:
 *   post:
 *     tags: [Products]
 *     summary: Create product (seller/admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [name, price]
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               price: { type: number }
 *               photo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/', auth, authorize('seller'), upload.single('photo'), productCtrl.createProduct);
router.put('/:id', auth, upload.single('photo'), productCtrl.updateProduct);
router.delete('/:id', auth, productCtrl.deleteProduct);

// seller products
/**
 * @openapi
 * /api/products/seller/{sellerId}:
 *   get:
 *     tags: [Products]
 *     summary: Get products for a seller (auth; same seller or admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sellerId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/seller/:sellerId', auth, productCtrl.getSellerProducts);

module.exports = router;
