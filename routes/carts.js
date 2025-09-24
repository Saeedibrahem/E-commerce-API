const router = require('express').Router();
const auth = require('../middlewares/auth');
const cartCtrl = require('../controllers/cartController');

/**
 * @openapi
 * tags:
 *   - name: Carts
 *     description: Cart endpoints
 */

/**
 * @openapi
 * /carts/me:
 *   get:
 *     tags: [Carts]
 *     summary: Get my cart
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user cart
 */
router.get('/me', auth, cartCtrl.getMyCart);
/**
 * @openapi
 * /carts:
 *   post:
 *     tags: [Carts]
 *     summary: Create or replace my cart
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     product: { type: string }
 *                     quantity: { type: integer }
 *     responses:
 *       200:
 *         description: Cart saved
 */
router.post('/', auth, cartCtrl.createOrReplaceCart);
/**
 * @openapi
 * /carts/{id}:
 *   put:
 *     tags: [Carts]
 *     summary: Update a cart by id (owner or admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Updated cart
 */
router.put('/:id', auth, cartCtrl.updateCart);
/**
 * @openapi
 * /carts/{id}:
 *   delete:
 *     tags: [Carts]
 *     summary: Delete a cart by id (owner or admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Deleted
 */
router.delete('/:id', auth, cartCtrl.deleteCart);

module.exports = router;
