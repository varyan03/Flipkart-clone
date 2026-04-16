import { useRef, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { productApi } from '../../api/productApi';

import { TargetIcon, ShirtIcon, SmartphoneIcon, SmileIcon, LaptopIcon, HomeIcon, WrenchIcon, ActivityIcon, BookIcon, SofaIcon } from '../icons/Icons';

export default function CategoryBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const scrollContainer = useRef(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await productApi.getCategories();
        setCategories(response.data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const getCategoryIcon = (slug = '', name = '') => {
    const key = `${slug} ${name}`.toLowerCase();

    if (key.includes('fashion') || key.includes('cloth')) return <ShirtIcon />;
    if (key.includes('mobile') || key.includes('phone')) return <SmartphoneIcon />;
    if (key.includes('beauty') || key.includes('personal')) return <SmileIcon />;
    if (key.includes('electronic') || key.includes('laptop') || key.includes('computer')) return <LaptopIcon />;
    if (key.includes('home') || key.includes('kitchen') || key.includes('furniture')) return <HomeIcon />;
    if (key.includes('book')) return <BookIcon />;
    if (key.includes('sport') || key.includes('fitness')) return <ActivityIcon />;
    if (key.includes('tool') || key.includes('appliance')) return <WrenchIcon />;
    if (key.includes('decor')) return <SofaIcon />;

    return <TargetIcon />;
  };

  // Check if CategoryBar should be displayed (only on home/products page)
  const shouldDisplay = location.pathname === '/' || location.pathname === '/products';

  if (!shouldDisplay) return null;

  const selectedCategory = new URLSearchParams(location.search).get('category');

  const categoryItems = [
    { slug: 'all', name: 'For You', icon: <HomeIcon /> },
    ...categories.map((category, index) => {
      return { slug: category.slug, name: category.name, icon: getCategoryIcon(category.slug, category.name), index };
    }),
  ];

  const handleCategoryClick = (slug) => {
    if (slug === 'all') {
      navigate('/products');
      return;
    }
    navigate(`/products?category=${encodeURIComponent(slug)}`);
  };

  const isActiveCategory = (slug) => {
    if (slug === 'all') {
      return location.pathname === '/' || (location.pathname === '/products' && !selectedCategory);
    }
    return selectedCategory === slug;
  };

  return (
    <div className="category-bar">
      <div className="category-bar-inner">
        <div ref={scrollContainer} className="category-bar-scroll">
          {categoryItems.map((category) => (
            <button
              key={category.slug}
              onClick={() => handleCategoryClick(category.slug)}
              className={`category-pill ${isActiveCategory(category.slug) ? 'is-active' : ''}`}
            >
              <div className="category-icon-bubble">{category.icon}</div>
              <span className="category-label">{category.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
