const router = require('express').Router();
const auth = require('../middlewares/auth');
const orderCtrl = require('../controllers/orderController');

router.post('/', auth, orderCtrl.createOrder);
router.get('/:id', auth, orderCtrl.getOrder);
router.get('/user/:userId', auth, orderCtrl.getUserOrders);

module.exports = router;
