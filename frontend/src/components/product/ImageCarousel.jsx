import { useState } from 'react';

export default function ImageCarousel({ images }) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  
  if (!images || images.length === 0) return null;

  return (
    <div style={{ display: 'flex', gap: '16px', position: 'sticky', top: '80px' }}>
      
      {/* Thumbnails */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {images.map((img, idx) => (
          <div 
            key={idx}
            onMouseEnter={() => setSelectedIdx(idx)}
            style={{
              width: '64px', height: '64px',
              border: selectedIdx === idx ? '2px solid var(--fk-blue)' : '1px solid #f0f0f0',
              padding: '4px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <img src={img} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} alt={`Thumb ${idx}`} />
          </div>
        ))}
      </div>

      {/* Main Image */}
      <div style={{ 
        width: '400px', height: '400px', 
        border: '1px solid #f0f0f0', 
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px'
      }}>
        <img 
          src={images[selectedIdx]} 
          alt="Main Product" 
          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
        />
      </div>
    </div>
  );
}
