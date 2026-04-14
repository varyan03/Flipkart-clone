const express = require('express');
const { getProducts, getProductById, getCategories } = require('../services/productService');
const { sendSuccess } = require('../utils/response');

const router = express.Router();

router.get('/products', async (req, res, next) => {
  try {
    const data = await getProducts(req.query);
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
});

router.get('/products/:id', async (req, res, next) => {
  try {
    const data = await getProductById(req.params.id);
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
});

router.get('/categories', async (req, res, next) => {
  try {
    const data = await getCategories();
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
