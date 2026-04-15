import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{ background: '#172033', color: '#fff', paddingTop: '24px' }}>
      {/* Main Footer Sections */}
      <div style={{ maxWidth: '1248px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '24px', padding: '0 16px 24px' }}>
        
        {/* ABOUT */}
        <div>
          <h4 style={{ fontSize: '12px', fontWeight: 700, marginBottom: '12px', textTransform: 'uppercase', color: '#fff', letterSpacing: '0.5px' }}>
            About
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {['Contact Us', 'About Us', 'Careers', 'Press', 'Blog'].map(item => (
              <li key={item}>
                <a href="#" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '11px', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}>
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* HELP */}
        <div>
          <h4 style={{ fontSize: '12px', fontWeight: 700, marginBottom: '12px', textTransform: 'uppercase', color: '#fff', letterSpacing: '0.5px' }}>
            Help
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {['Payments', 'Shipping', 'Returns', 'FAQ', 'Support'].map(item => (
              <li key={item}>
                <a href="#" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '11px', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}>
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* POLICY */}
        <div>
          <h4 style={{ fontSize: '12px', fontWeight: 700, marginBottom: '12px', textTransform: 'uppercase', color: '#fff', letterSpacing: '0.5px' }}>
            Policy
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {['Return Policy', 'Terms', 'Security', 'Privacy', 'Sitemap'].map(item => (
              <li key={item}>
                <a href="#" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '11px', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}>
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* SOCIAL */}
        <div>
          <h4 style={{ fontSize: '12px', fontWeight: 700, marginBottom: '12px', textTransform: 'uppercase', color: '#fff', letterSpacing: '0.5px' }}>
            Follow Us
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {['Facebook', 'Twitter', 'YouTube', 'Instagram'].map(item => (
              <li key={item}>
                <a href="#" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '11px', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}>
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom Section */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', padding: '16px' }}>
        <div style={{ maxWidth: '1248px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>
          <div>© 2025-2026 Flipkart Clone. All rights reserved.</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span>We accept:</span>
            {['Visa', 'Mastercard', 'UPI'].map(m => (
              <span key={m} style={{ color: 'rgba(255,255,255,0.6)' }}>{m}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
