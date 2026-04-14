const express = require('express');
const { authenticate } = require('../middleware/authenticate');
const wishlistController = require('../controllers/wishlistController');

const router = express.Router();

router.use(authenticate);
router.get('/',              wishlistController.getWishlist);
router.post('/:productId',   wishlistController.addToWishlist);
router.delete('/:productId', wishlistController.removeFromWishlist);

module.exports = router;
