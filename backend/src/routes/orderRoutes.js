const express = require('express');
const { placeOrder, getOrderById, getOrderHistory } = require('../services/orderService');
const { authenticate, optionalAuth } = require('../middleware/authenticate');
const { sendSuccess } = require('../utils/response');

const router = express.Router();

// Place order — works for guest and logged-in users
router.post('/', optionalAuth, async (req, res, next) => {
  try {
    const { cartId, address } = req.body;
    const userId = req.user?.id || null;
    const data = await placeOrder(cartId, address, userId);
    sendSuccess(res, data, 'Order placed successfully', 201);
  } catch (err) {
    next(err);
  }
});

// Get single order by ID
router.get('/:orderId', async (req, res, next) => {
  try {
    const data = await getOrderById(req.params.orderId);
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
});

// Get order history — requires auth
router.get('/', authenticate, async (req, res, next) => {
  try {
    const data = await getOrderHistory(req.user.id);
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
