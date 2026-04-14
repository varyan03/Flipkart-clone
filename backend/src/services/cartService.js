const prisma = require('../lib/prisma');
const { AppError } = require('../utils/response');
const { randomUUID } = require('crypto');

async function createCart() {
  const id = randomUUID();
  const cart = await prisma.cart.create({
    data: { id }
  });
  return { cartId: cart.id };
}

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
