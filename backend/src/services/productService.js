const prisma = require('../lib/prisma');
const { AppError } = require('../utils/response');

async function getProducts({ search, category, minPrice, maxPrice, sort, page = 1, limit = 20 }) {
  page = parseInt(page);
  limit = parseInt(limit);
  
  const where = {
    ...(search && { name: { contains: search } }), // SQLite doesn't support 'mode: insensitive' in Prisma
    ...(category && { category: { slug: category } }),
    ...((minPrice || maxPrice) && {
      price: {
        ...(minPrice && { gte: parseFloat(minPrice) }),
        ...(maxPrice && { lte: parseFloat(maxPrice) })
      }
    })
  };

  const orderByMap = {
    price_asc: { price: 'asc' },
    price_desc: { price: 'desc' },
    rating: { rating: 'desc' },
    newest: { createdAt: 'desc' }
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: orderByMap[sort] || { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: { category: { select: { name: true, slug: true } } }
    }),
    prisma.product.count({ where })
  ]);

  return {
    products,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
}

async function getProductById(id) {
  const product = await prisma.product.findUnique({
    where: { id: parseInt(id) },
    include: { category: true }
  });
  
  if (!product) {
    throw new AppError('Product not found', 404);
  }
  
  return product;
}

async function getCategories() {
  return await prisma.category.findMany();
}

module.exports = {
  getProducts,
  getProductById,
  getCategories
};
