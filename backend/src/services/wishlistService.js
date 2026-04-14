const prisma = require('../lib/prisma');

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

async function addToWishlist(userId, productId) {
  return prisma.wishlist.upsert({
    where: { userId_productId: { userId, productId } },
    update: {},
    create: { userId, productId }
  });
}

async function removeFromWishlist(userId, productId) {
  await prisma.wishlist.deleteMany({ where: { userId, productId } });
}

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
