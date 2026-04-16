const prisma = require('../lib/prisma');
const { AppError } = require('../utils/response');
const { randomUUID } = require('crypto');

/**
 * Creates a new empty cart with a unique UUID.
 * 
 * @returns {Promise<Object>} Object containing the new cartId
 */
async function createCart() {
  const id = randomUUID();
  const cart = await prisma.cart.create({
    data: { id }
  });
  return { cartId: cart.id };
}

/**
 * Retrieves a cart by its ID, including all items and product details.
 * 
 * @param {string} cartId - The unique UUID of the cart
 * @returns {Promise<Object>} The cart object with nested items and products
 * @throws {AppError} 404 if cart is not found
 */
async function getCart(cartId) {
  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: {
      items: {
        include: {
          product: {
            select: { id: true, name: true, price: true, mrp: true, images: true, stock: true, brand: true }
          }
        }
      }
    }
  });
  
  if (!cart) throw new AppError('Cart not found', 404);
  return cart;
}

/**
 * Adds an item to a cart or increments quantity if it already exists.
 * 
 * @param {string} cartId - The unique UUID of the cart
 * @param {number|string} productId - ID of the product to add
 * @param {number} [quantity=1] - Number of units to add
 * @returns {Promise<Object>} The created or updated cart item
 * @throws {AppError} 404 if product is not found
 */
async function addItem(cartId, productId, quantity = 1) {
  productId = parseInt(productId);
  quantity = parseInt(quantity);
  
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new AppError('Product not found', 404);
  
  // Upsert pattern
  const cartItem = await prisma.cartItem.upsert({
    where: { cartId_productId: { cartId, productId } },
    update: { quantity: { increment: quantity } },
    create: { cartId, productId, quantity }
  });
  
  return cartItem;
}

/**
 * Updates the quantity of a specific item in the cart.
 * 
 * @param {string} cartId - The unique UUID of the cart
 * @param {number|string} productId - ID of the product to update
 * @param {number} quantity - The new quantity value
 * @returns {Promise<Object>} The updated cart item
 * @throws {AppError} 404 if item is not found in cart
 */
async function updateItemQuantity(cartId, productId, quantity) {
  productId = parseInt(productId);
  quantity = parseInt(quantity);
  
  const cartItem = await prisma.cartItem.update({
    where: { cartId_productId: { cartId, productId } },
    data: { quantity }
  }).catch(() => {
    throw new AppError('Item not found in cart', 404);
  });
  
  return cartItem;
}

/**
 * Removes an item from the cart completely.
 * 
 * @param {string} cartId - The unique UUID of the cart
 * @param {number|string} productId - ID of the product to remove
 * @returns {Promise<void>}
 * @throws {AppError} 404 if item is not found in cart
 */
async function removeItem(cartId, productId) {
  productId = parseInt(productId);
  await prisma.cartItem.delete({
    where: { cartId_productId: { cartId, productId } }
  }).catch(() => {
    throw new AppError('Item not found in cart', 404);
  });
}

module.exports = {
  createCart,
  getCart,
  addItem,
  updateItemQuantity,
  removeItem
};
