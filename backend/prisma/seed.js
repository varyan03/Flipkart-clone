const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const categories = [
  { slug: 'electronics', name: 'Electronics', imageUrl: 'https://picsum.photos/seed/cat-tech/100/100' },
  { slug: 'fashion', name: 'Fashion', imageUrl: 'https://picsum.photos/seed/cat-fash/100/100' },
  { slug: 'home-kitchen', name: 'Home & Kitchen', imageUrl: 'https://picsum.photos/seed/cat-home/100/100' },
  { slug: 'books', name: 'Books', imageUrl: 'https://picsum.photos/seed/cat-book/100/100' },
  { slug: 'sports', name: 'Sports & Fitness', imageUrl: 'https://picsum.photos/seed/cat-sport/100/100' },
  { slug: 'beauty', name: 'Beauty & Personal Care', imageUrl: 'https://picsum.photos/seed/cat-beauty/100/100' }
];

const generateProducts = (categorySlug, categoryId) => {
  const products = [];
  const startId = categoryId * 10;
  for (let i = 1; i <= 9; i++) {
    const id = startId + i;
    const mrp = 1000 + (id * 100);
    const price = mrp - (mrp * (10 + (id % 30)) / 100); // 10-40% discount
    
    let brand = "Generic";
    let subName = `Product ${id}`;
    if (categorySlug === 'electronics') brand = ["Samsung", "Apple", "Sony"][id%3];
    else if (categorySlug === 'fashion') brand = ["Nike", "Levis", "Adidas"][id%3];
    else if (categorySlug === 'books') brand = "Publisher";

    if (categorySlug === 'electronics') subName = ["Smartphone", "Headphones", "Laptop"][id%3];
    
    const name = `${brand} ${subName} ${id}`;

    products.push({
      name,
      description: `Detailed description for ${name}. This product is great and gives you the best value for money. Built with high quality materials.`,
      price: Math.round(price),
      mrp: Math.round(mrp),
      stock: (id % 5 === 0) ? 0 : 50 + id, // Make some out of stock
      rating: 3.5 + (id % 15) / 10,
      ratingCount: 100 + id * 10,
      brand,
      images: [
        `https://picsum.photos/seed/fk-${id}-1/400/400`,
        `https://picsum.photos/seed/fk-${id}-2/400/400`,
        `https://picsum.photos/seed/fk-${id}-3/400/400`
      ],
      specs: {
        "Color": ["Black", "White", "Blue"][id%3],
        "Weight": `${200 + id}g`,
        "Warranty": "1 Year"
      },
      categoryId
    });
  }
  return products;
};

async function main() {
  console.log('Clearing old data...');
  await prisma.orderItem.deleteMany();
  await prisma.address.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  console.log('Seeding categories...');
  for (let i = 0; i < categories.length; i++) {
    const cat = await prisma.category.create({
      data: categories[i]
    });
    console.log(`Created category: ${cat.name}`);

    const productsToCreate = generateProducts(cat.slug, cat.id);
    for (const prod of productsToCreate) {
      await prisma.product.create({
        data: prod
      });
    }
  }
  
  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
