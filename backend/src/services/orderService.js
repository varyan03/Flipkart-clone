const prisma = require('../lib/prisma');
const { AppError } = require('../utils/response');
const { randomUUID } = require('crypto');

/**
 * Places a formal order from a cart. Performs stock validation and 
 * atomic transaction for order creation, stock decrement, and cart deletion.
 * 
 * @param {string} cartId - The unique UUID of the cart to process
 * @param {Object} addressInfo - Delivery address details
 * @param {number|null} [userId=null] - Optional user ID if authenticated
 * @returns {Promise<Object>} Object containing the new orderId
 * @throws {AppError} 400 if cart is empty or items are out of stock
 */
async function placeOrder(cartId, addressInfo, userId = null) {
  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: { items: { include: { product: true } } }
  });

  if (!cart || cart.items.length === 0) {
    throw new AppError('Cart is empty or not found', 400);
  }

  for (const item of cart.items) {
    if (item.product.stock < item.quantity) {
      throw new AppError(`"${item.product.name}" is out of stock`, 400);
    }
  }

  const subtotal = cart.items.reduce((s, i) => s + Number(i.product.price) * i.quantity, 0);
  const discount = cart.items.reduce((s, i) => s + (Number(i.product.mrp) - Number(i.product.price)) * i.quantity, 0);
  const total = subtotal;

  const orderId = randomUUID();
  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        id: orderId,
        userId,           // attach user if logged in
        subtotal,
        discount,
        total,
        address: { create: addressInfo },
        items: {
          create: cart.items.map(i => ({
            productId: i.productId,
            quantity: i.quantity,
            unitPrice: i.product.price
          }))
        }
      }
    });

    for (const item of cart.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } }
      });
    }

    await tx.cart.delete({ where: { id: cartId } });
    return newOrder;
  });

  return { orderId: order.id };
}

/**
 * Retrieves a single order's details by its ID.
 * 
 * @param {string} orderId - The unique UUID of the order
 * @returns {Promise<Object>} The order object with address and items
 * @throws {AppError} 404 if order is not found
 */
async function getOrderById(orderId) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      address: true,
      items: {
        include: {
          product: { select: { name: true, images: true } }
        }
      }
    }
  });

  if (!order) throw new AppError('Order not found', 404);
  return order;
}

/**
 * Fetches the complete order history for a specific user.
 * 
 * @param {number} userId - The unique ID of the user
 * @returns {Promise<Array>} List of orders with items and basic address info
 */
async function getOrderHistory(userId) {
  return prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      address: { select: { city: true, pincode: true } },
      items: {
        include: {
          product: { select: { name: true, images: true } }
        }
      }
    }
  });
}

module.exports = { placeOrder, getOrderById, getOrderHistory };
