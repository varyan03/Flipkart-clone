import { useRef, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { productApi } from '../../api/productApi';

import { TargetIcon, ShirtIcon, SmartphoneIcon, SmileIcon, LaptopIcon, HomeIcon, WrenchIcon, SmilePlusIcon, AppleIcon, CarIcon, BikeIcon, ActivityIcon, BookIcon, SofaIcon } from '../icons/Icons';

export default function CategoryBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const scrollContainer = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
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

  const getCategoryTheme = (slug) => {
    const themes = {
      'electronics': { color: '#FF9F43', icon: <LaptopIcon /> },
      'fashion': { color: '#FF6B9D', icon: <ShirtIcon /> },
      'home-kitchen': { color: '#95E1D3', icon: <HomeIcon /> },
      'books': { color: '#C9ADA7', icon: <BookIcon /> },
      'sports': { color: '#6BCB77', icon: <ActivityIcon /> },
      'beauty': { color: '#FFB6C1', icon: <SmileIcon /> },
    };
    return themes[slug] || { color: '#A8D8EA', icon: <TargetIcon /> };
  };

  // Check if CategoryBar should be displayed (only on home/products page)
  const shouldDisplay = location.pathname === '/' || location.pathname === '/products';

  if (!shouldDisplay) return null;

  const handleScroll = () => {
    if (scrollContainer.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainer.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    handleScroll();
    const element = scrollContainer.current;
    if (element) {
      element.addEventListener('scroll', handleScroll);
      return () => element.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const scroll = (direction) => {
    if (scrollContainer.current) {
      const scrollAmount = 300;
      scrollContainer.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div style={{
      background: '#fff',
      borderBottom: '1px solid #f0f0f0',
      position: 'sticky',
      top: '64px',
      zIndex: 50,
      paddingTop: '12px',
      paddingBottom: '12px'
    }}>
      <div style={{
        maxWidth: '1248px',
        margin: '0 auto',
        position: 'relative',
        paddingLeft: showLeftArrow ? '40px' : '16px',
        paddingRight: showRightArrow ? '40px' : '16px'
      }}>

        {/* Left Scroll Arrow */}
        {showLeftArrow && (
          <button onClick={() => scroll('left')} style={{
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'linear-gradient(to left, transparent, #fff)',
            border: 'none',
            padding: '8px 12px',
            cursor: 'pointer',
            zIndex: 10,
            fontSize: '18px',
            color: '#2874F1'
          }}>
            ◀
          </button>
        )}

        {/* Category Scroll Container */}
        <div ref={scrollContainer} style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '16px',
          overflowX: 'auto',
          scrollBehavior: 'smooth',
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          // Hide scrollbar
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
          paddingBottom: '8px'
        }}
          onScroll={handleScroll}
        >
          {categories.map((category, index) => {
            const theme = getCategoryTheme(category.slug);
            return (
              <div
                key={index}
                onClick={() => navigate(`/products?category=${encodeURIComponent(category.slug)}`)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  minWidth: 'max-content',
                  padding: '0 8px',
                  borderRadius: '4px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(40, 116, 241, 0.04)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {/* Icon Circle */}
                <div style={{
                  width: '64px',
                  height: '64px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'transform 0.2s',
                  color: theme.color
                }}>
                  {theme.icon}
                </div>
                {/* Category Name */}
                <span style={{
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#212121',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                  lineHeight: '1.2'
                }}>
                  {category.name}
                </span>
              </div>
            );
          })}
        </div>

        {/* Right Scroll Arrow */}
        {showRightArrow && (
          <button onClick={() => scroll('right')} style={{
            position: 'absolute',
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'linear-gradient(to right, transparent, #fff)',
            border: 'none',
            padding: '8px 12px',
            cursor: 'pointer',
            zIndex: 10,
            fontSize: '18px',
            color: '#2874F1'
          }}>
            ▶
          </button>
        )}
      </div>

      <style>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
