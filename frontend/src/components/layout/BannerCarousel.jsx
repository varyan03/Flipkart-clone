import { useState, useEffect, useCallback } from 'react';
import { ChevronDownIcon } from '../icons/Icons';

const slides = [
  {
    id: 1,
    bg: 'linear-gradient(90deg, #ff7e5f 0%, #feb47b 100%)',
    title: 'Hear every note',
    tagline: 'From ₹999',
    subtext: 'Experience true clarity',
    brand: 'MIVI',
    img: 'https://static-assets-web.flixcart.com/batman-returns/batman-returns/p/images/fkheaderlogo_exploreplus-44005d.svg'
  },
  {
    id: 2,
    bg: 'linear-gradient(90deg, #4b6cb7 0%, #182848 100%)',
    title: 'Relaxed Style, Everyday',
    tagline: 'FROM ₹199',
    subtext: 'Flipkart Unique',
    brand: 'SANDALS',
    img: 'https://static-assets-web.flixcart.com/batman-returns/batman-returns/p/images/fkheaderlogo_exploreplus-44005d.svg'
  },
  {
    id: 3,
    bg: 'linear-gradient(90deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
    title: 'T5 Pro | From ₹4,666',
    tagline: 'Sale on 21st Apr, 12PM',
    subtext: 'Slimmest 9020 mAh smartphone',
    brand: 'OriginOS',
    img: 'https://static-assets-web.flixcart.com/batman-returns/batman-returns/p/images/fkheaderlogo_exploreplus-44005d.svg'
  },
  {
    id: 4,
    bg: 'linear-gradient(90deg, #11998e 0%, #38ef7d 100%)',
    title: 'Kitchen Essentials',
    tagline: 'MIN. 50% OFF',
    subtext: 'Upgrade your home',
    brand: 'PRESTIGE',
    img: 'https://static-assets-web.flixcart.com/batman-returns/batman-returns/p/images/fkheaderlogo_exploreplus-44005d.svg'
  },
  {
    id: 5,
    bg: 'linear-gradient(90deg, #fc466b 0%, #3f5efb 100%)',
    title: 'Summer Fashion',
    tagline: 'EXTRA 20% OFF',
    subtext: 'Style for the season',
    brand: 'ADIDAS',
    img: 'https://static-assets-web.flixcart.com/batman-returns/batman-returns/p/images/fkheaderlogo_exploreplus-44005d.svg'
  }
];

/**
 * A responsive, slim hero banner carousel with auto-play functionality.
 * Displays promotional cards with custom gradients and brand identification.
 * Uses CSS transforms for high-performance transitions.
 * 
 * @component
 */
export default function BannerCarousel() {
  const [current, setCurrent] = useState(0);
  const [slidesPerView, setSlidesPerView] = useState(3);

  useEffect(() => {
    const updateSlidesPerView = () => {
      if (window.innerWidth <= 640) {
        setSlidesPerView(1);
      } else if (window.innerWidth <= 1024) {
        setSlidesPerView(2);
      } else {
        setSlidesPerView(3);
      }
    };

    updateSlidesPerView();
    window.addEventListener('resize', updateSlidesPerView);
    return () => window.removeEventListener('resize', updateSlidesPerView);
  }, []);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, []);

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  const carouselHeight = slidesPerView === 1 ? 170 : slidesPerView === 2 ? 200 : 230;

  return (
    <div style={{ position: 'relative', width: '100%', height: `${carouselHeight}px`, overflow: 'hidden', borderRadius: '8px' }}>
      <div style={{ 
        display: 'flex', 
        width: `${(slides.length * 100) / slidesPerView}%`,
        height: '100%', 
        gap: '12px',
        transform: `translateX(-${(current * 100) / slides.length}%)`, 
        transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        padding: '0 4px'
      }}>
        {slides.map((slide) => (
          <div key={slide.id} style={{ 
            width: `${100 / slides.length}%`,
            height: '100%', 
            background: slide.bg, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            padding: slidesPerView === 1 ? '0 14px' : '0 20px',
            color: '#fff',
            position: 'relative',
            borderRadius: '8px',
            flexShrink: 0
          }}>
            <div style={{ maxWidth: slidesPerView === 1 ? '72%' : '70%' }}>
              <div style={{ background: '#000', color: '#fff', display: 'inline-block', padding: '2px 6px', fontSize: '11px', fontWeight: 'bold', marginBottom: '8px' }}>
                {slide.brand}
              </div>
              <h2 style={{ fontSize: slidesPerView === 1 ? '16px' : '20px', fontWeight: 800, margin: '0 0 4px 0', lineHeight: 1.2 }}>
                {slide.title}
              </h2>
              <p style={{ fontSize: slidesPerView === 1 ? '12px' : '14px', fontWeight: 600, margin: '0 0 4px 0' }}>
                {slide.tagline}
              </p>
              <p style={{ fontSize: slidesPerView === 1 ? '11px' : '12px', opacity: 0.8, margin: 0 }}>
                {slide.subtext}
              </p>
            </div>
            
            {/* Visual element (placeholder) */}
            <div style={{ width: slidesPerView === 1 ? '58px' : '80px', height: slidesPerView === 1 ? '58px' : '80px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.2)' }}>
               <img src={slide.img} alt="Deal" style={{ width: slidesPerView === 1 ? '34px' : '50px', opacity: 0.9 }} />
            </div>
          </div>
        ))}
      </div>


      {/* Indicators */}
      <div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '6px' }}>
        {slides.map((_, i) => (
          <div key={i} onClick={() => setCurrent(i)} style={{ width: '6px', height: '6px', borderRadius: '50%', background: i === current ? '#fff' : 'rgba(255,255,255,0.4)', cursor: 'pointer', transition: 'all 0.3s' }} />
        ))}
      </div>
    </div>
  );
}
