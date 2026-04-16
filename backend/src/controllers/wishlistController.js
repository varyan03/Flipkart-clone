const wishlistService = require('../services/wishlistService');
const { sendSuccess } = require('../utils/response');

/**
 * Handler for fetching the authenticated user's wishlist.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getWishlist = async (req, res) => {
  const items = await wishlistService.getWishlist(req.user.id);
  sendSuccess(res, items);
};

/**
 * Handler for adding a product to the user's wishlist.
 * Expects productId in route parameters.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const addToWishlist = async (req, res) => {
  const productId = parseInt(req.params.productId);
  const item = await wishlistService.addToWishlist(req.user.id, productId);
  sendSuccess(res, item, 'Added to wishlist', 201);
};

/**
 * Handler for removing a product from the user's wishlist.
 * Expects productId in route parameters.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const removeFromWishlist = async (req, res) => {
  const productId = parseInt(req.params.productId);
  await wishlistService.removeFromWishlist(req.user.id, productId);
  sendSuccess(res, null, 'Removed from wishlist');
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
