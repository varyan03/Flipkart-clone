import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';
import { ChevronDownIcon, CircleArrowIcon } from '../icons/Icons';

export default function ProductCarousel({ title, products, categorySlug, variant = 'default', isStatic = false }) {
  const scrollRef = useRef(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  const isDeals = variant === 'deals';

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeft(scrollLeft > 10);
      setShowRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    handleScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', handleScroll);
      return () => el.removeEventListener('scroll', handleScroll);
    }
  }, [products]);

  const scroll = (dir) => {
    if (scrollRef.current) {
      const amount = scrollRef.current.clientWidth * 0.8;
      scrollRef.current.scrollBy({
        left: dir === 'left' ? -amount : amount,
        behavior: 'smooth'
      });
    }
  };

  if (!products || products.length === 0) return null;

  return (
    <div style={{ 
      maxWidth: '1248px', 
      margin: '0 auto 24px', 
      background: isDeals ? '#e3effb' : '#fff', 
      boxShadow: isDeals ? 'none' : '0 1px 2px rgba(0,0,0,0.1)',
      borderRadius: isDeals ? '16px' : '4px',
      overflow: 'hidden',
      padding: isDeals ? '16px' : '0'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: isDeals ? '8px 8px 16px' : '16px 20px',
        borderBottom: isDeals ? 'none' : '1px solid #f0f0f0' 
      }}>
        <h2 style={{ 
          fontSize: isDeals ? '24px' : '22px', 
          fontWeight: 700, 
          color: '#212121', 
          margin: 0 
        }}>
          {title}
        </h2>
        <Link 
          to={categorySlug === 'all' ? '/products' : `/products?category=${categorySlug}`}
          style={{ textDecoration: 'none' }}
        >
          {isDeals ? (
            <CircleArrowIcon size={32} />
          ) : (
            <div style={{ 
              backgroundColor: '#2874f0', 
              color: '#fff', 
              padding: '8px 24px', 
              borderRadius: '2px',
              fontSize: '13px',
              fontWeight: 500,
              boxShadow: '0 2px 4px 0 rgba(0,0,0,0.2)'
            }}>
              VIEW ALL
            </div>
          )}
        </Link>
      </div>

      {/* Carousel Container */}
      <div style={{ 
        position: 'relative', 
        padding: isDeals ? '0' : '12px 0',
        background: isDeals ? '#fff' : 'transparent',
        borderRadius: isDeals ? '16px' : '0',
        overflow: 'hidden'
      }}>
        {/* Navigation Arrows (Only when not static) */}
        {!isStatic && showLeft && (
          <button 
            onClick={() => scroll('left')}
            style={{
              position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
              zIndex: 20, background: '#fff', border: '1px solid #e0e0e0',
              borderRadius: '0 4px 4px 0', width: '40px', height: '100px',
              padding: 0, cursor: 'pointer', boxShadow: '0 1px 5px rgba(0,0,0,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <ChevronDownIcon style={{ transform: 'rotate(90deg)', color: '#212121' }} />
          </button>
        )}
        
        {!isStatic && showRight && (
          <button 
            onClick={() => scroll('right')}
            style={{
              position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
              zIndex: 20, background: '#fff', border: '1px solid #e0e0e0',
              borderRadius: '4px 0 0 4px', width: '40px', height: '100px',
              padding: 0, cursor: 'pointer', boxShadow: '0 1px 5px rgba(0,0,0,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <ChevronDownIcon style={{ transform: 'rotate(-90deg)', color: '#212121' }} />
          </button>
        )}

        {/* Scroll/Static Area */}
        <div 
          ref={scrollRef}
          onScroll={isStatic ? null : handleScroll}
          style={{ 
            display: isStatic ? 'grid' : 'flex',
            gridTemplateColumns: isStatic ? 'repeat(auto-fit, minmax(0, 1fr))' : 'none',
            gap: isDeals ? '16px' : '12px', 
            overflowX: isStatic ? 'hidden' : 'auto', 
            scrollBehavior: 'smooth',
            scrollSnapType: isStatic ? 'none' : 'x mandatory',
            padding: isDeals ? '16px' : '4px 16px',
            // Hide scrollbar
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
          }}
        >
          {(isStatic ? products.slice(0, 4) : products).map(product => (
            <div key={product.id} style={{ 
              minWidth: isStatic ? '0' : (isDeals ? '210px' : '232px'), 
              width: isStatic ? 'auto' : (isDeals ? '210px' : '232px'), 
              scrollSnapAlign: 'start',
              border: isDeals ? 'none' : '1px solid #f0f0f0',
              borderRadius: isDeals ? '0' : '4px',
              overflow: 'hidden'
            }}>
              <ProductCard product={product} isDealsVariant={isDeals} />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        div::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
