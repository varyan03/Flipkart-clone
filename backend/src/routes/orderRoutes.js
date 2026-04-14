const express = require('express');
const { placeOrder, getOrderById } = require('../services/orderService');
const { sendSuccess } = require('../utils/response');

const router = express.Router();

router.post('/orders', async (req, res, next) => {
  try {
    const { cartId, address } = req.body;
    const data = await placeOrder(cartId, address);
    sendSuccess(res, data, 'Order placed successfully', 201);
  } catch (err) {
    next(err);
  }
});

router.get('/orders/:orderId', async (req, res, next) => {
  try {
    const data = await getOrderById(req.params.orderId);
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
