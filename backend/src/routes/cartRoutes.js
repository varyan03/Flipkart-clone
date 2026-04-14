const express = require('express');
const { createCart, getCart, addItem, updateItemQuantity, removeItem } = require('../services/cartService');
const { sendSuccess } = require('../utils/response');

const router = express.Router();

router.post('/cart', async (req, res, next) => {
  try {
    const data = await createCart();
    sendSuccess(res, data, 'Cart created successfully', 201);
  } catch (err) {
    next(err);
  }
});

router.get('/cart/:cartId', async (req, res, next) => {
  try {
    const data = await getCart(req.params.cartId);
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
});

router.post('/cart/:cartId/items', async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const data = await addItem(req.params.cartId, productId, quantity);
    sendSuccess(res, data, 'Item added to cart', 201);
  } catch (err) {
    next(err);
  }
});

router.patch('/cart/:cartId/items/:productId', async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const data = await updateItemQuantity(req.params.cartId, req.params.productId, quantity);
    sendSuccess(res, data, 'Cart item updated');
  } catch (err) {
    next(err);
  }
});

router.delete('/cart/:cartId/items/:productId', async (req, res, next) => {
  try {
    await removeItem(req.params.cartId, req.params.productId);
    sendSuccess(res, null, 'Item removed from cart');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
