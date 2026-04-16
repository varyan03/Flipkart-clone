const prisma = require('../lib/prisma');
const { AppError } = require('../utils/response');

/**
 * Fetches products with optional filtering, sorting, and pagination.
 * 
 * @param {Object} filters - Filter criteria
 * @param {string} [filters.search] - Search term for product names
 * @param {string} [filters.category] - Category slug to filter by
 * @param {number|string} [filters.minPrice] - Minimum price range
 * @param {number|string} [filters.maxPrice] - Maximum price range
 * @param {string} [filters.sort] - Sort order (price_asc, price_desc, rating, newest)
 * @param {number|string} [filters.page=1] - Page number for pagination
 * @param {number|string} [filters.limit=20] - Number of items per page
 * @returns {Promise<Object>} Object containing products, total count, and pagination metadata
 */
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

/**
 * Retrieves a single product by its unique ID.
 * 
 * @param {number|string} id - The product ID
 * @returns {Promise<Object>} The product object with category details
 * @throws {AppError} 404 if product is not found
 */
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

/**
 * Fetches all available product categories.
 * 
 * @returns {Promise<Array>} Array of all category objects
 */
async function getCategories() {
  return await prisma.category.findMany();
}

module.exports = {
  getProducts,
  getProductById,
  getCategories
};
