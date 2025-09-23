const router = require('express').Router();
const auth = require('../middlewares/auth');
const cartCtrl = require('../controllers/cartController');

router.get('/me', auth, cartCtrl.getMyCart);
router.post('/', auth, cartCtrl.createOrReplaceCart);
router.put('/:id', auth, cartCtrl.updateCart);
router.delete('/:id', auth, cartCtrl.deleteCart);

module.exports = router;
