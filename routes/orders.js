const router = require('express').Router();
const auth = require('../middlewares/auth');
const orderCtrl = require('../controllers/orderController');

/**
 * @openapi
 * tags:
 *   - name: Orders
 *     description: Order endpoints
 */

/**
 * @openapi
 * /orders:
 *   post:
 *     tags: [Orders]
 *     summary: Create an order from my cart
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               paymentMethod:
 *                 type: string
 *                 enum: [cod, stripe]
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/', auth, orderCtrl.createOrder);
/**
 * @openapi
 * /orders/{id}:
 *   get:
 *     tags: [Orders]
 *     summary: Get order by id (owner/admin or seller owning a product in it)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/:id', auth, orderCtrl.getOrder);
/**
 * @openapi
 * /orders/user/{userId}:
 *   get:
 *     tags: [Orders]
 *     summary: Get orders for a user (same user or admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/user/:userId', auth, orderCtrl.getUserOrders);

module.exports = router;
