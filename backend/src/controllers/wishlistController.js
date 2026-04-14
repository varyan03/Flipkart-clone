const wishlistService = require('../services/wishlistService');
const { sendSuccess } = require('../utils/response');

const getWishlist = async (req, res) => {
  const items = await wishlistService.getWishlist(req.user.id);
  sendSuccess(res, items);
};

const addToWishlist = async (req, res) => {
  const productId = parseInt(req.params.productId);
  const item = await wishlistService.addToWishlist(req.user.id, productId);
  sendSuccess(res, item, 'Added to wishlist', 201);
};

const removeFromWishlist = async (req, res) => {
  const productId = parseInt(req.params.productId);
  await wishlistService.removeFromWishlist(req.user.id, productId);
  sendSuccess(res, null, 'Removed from wishlist');
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
