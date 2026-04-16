const prisma = require('../lib/prisma');

/**
 * Retrieves the wishlist for a specific user, including product details.
 * 
 * @param {number} userId - The unique ID of the user
 * @returns {Promise<Array>} List of wishlist items with product information
 */
async function getWishlist(userId) {
  return prisma.wishlist.findMany({
    where: { userId },
    include: {
      product: {
        select: { id: true, name: true, price: true, mrp: true, images: true, rating: true, ratingCount: true, stock: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

/**
 * Adds a product to a user's wishlist. Uses upsert to prevent duplicates.
 * 
 * @param {number} userId - The unique ID of the user
 * @param {number} productId - The unique ID of the product
 * @returns {Promise<Object>} The created or existing wishlist record
 */
async function addToWishlist(userId, productId) {
  return prisma.wishlist.upsert({
    where: { userId_productId: { userId, productId } },
    update: {},
    create: { userId, productId }
  });
}

/**
 * Removes a product from a user's wishlist.
 * 
 * @param {number} userId - The unique ID of the user
 * @param {number} productId - The unique ID of the product
 * @returns {Promise<void>}
 */
async function removeFromWishlist(userId, productId) {
  await prisma.wishlist.deleteMany({ where: { userId, productId } });
}

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
