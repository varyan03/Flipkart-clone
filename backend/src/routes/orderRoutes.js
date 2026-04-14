const express = require('express');
const { placeOrder, getOrderById, getOrderHistory } = require('../services/orderService');
const { authenticate, optionalAuth } = require('../middleware/authenticate');
const { sendSuccess } = require('../utils/response');

const router = express.Router();

// NOTE: Keep specific method routes above wildcard :param routes

// Get order history — requires auth  (GET /orders)
router.get('/orders', authenticate, async (req, res, next) => {
  try {
    const data = await getOrderHistory(req.user.id);
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
});

// Place order — works for guest and logged-in users (POST /orders)
router.post('/orders', optionalAuth, async (req, res, next) => {
  try {
    const { cartId, address } = req.body;
    const userId = req.user?.id || null;
    const data = await placeOrder(cartId, address, userId);
    sendSuccess(res, data, 'Order placed successfully', 201);
  } catch (err) {
    next(err);
  }
});

// Get single order by ID (GET /orders/:orderId)
router.get('/orders/:orderId', async (req, res, next) => {
  try {
    const data = await getOrderById(req.params.orderId);
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
