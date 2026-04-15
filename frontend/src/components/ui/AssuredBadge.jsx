import React from 'react';

const AssuredBadge = ({ height = 15 }) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', marginLeft: '6px', verticalAlign: 'middle', flexShrink: 0 }}>
    <svg 
      width={height * 4.6} 
      height={height} 
      viewBox="0 0 77 15" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Shield Icon */}
      <path d="M7.4 0L14.8 3.2V8.4C14.8 12.1 11.7 15.6 7.4 17.5C3.1 15.6 0 12.1 0 8.4V3.2L7.4 0Z" fill="#F8E831" transform="scale(0.8)"/>
      <path d="M7.4 2L12.8 4.3V8.4C12.8 11.2 10.5 13.8 7.4 15.2C4.3 13.8 2 11.2 2 8.4V4.3L7.4 2Z" fill="#1A73E8" transform="scale(0.8)"/>
      <path d="M7.4 11.5L5.4 12.6L5.8 10.3L4.1 8.7L6.4 8.4L7.4 6.3L8.4 8.4L10.7 8.7L9 10.3L9.4 12.6L7.4 11.5Z" fill="#F8E831" transform="scale(0.8)"/>
      
      {/* Assured Text */}
      <path d="M22.5 12H20.7L18.8 4H20.6L21.7 9.5L22.8 4H24.6L22.5 12Z" fill="#1A73E8"/>
      <path d="M29.5 12V4H31.3V12H29.5Z" fill="#1A73E8"/>
      <path d="M36.2 12C34.5 12 33.2 11.2 33.2 9.5V4H35V9.4C35 10.4 35.6 10.8 36.2 10.8C36.8 10.8 37.4 10.4 37.4 9.4V4H39.2V9.5C39.2 11.2 37.9 12 36.2 12Z" fill="#1A73E8"/>
      <path d="M44.5 12V4H49V5.5H46.3V7.2H48.5V8.7H46.3V10.5H49.2V12H44.5Z" fill="#1A73E8"/>
      <path d="M54.5 12C52.8 12 51.5 11.2 51.5 9.5C51.5 7.8 52.8 7 54.5 7C56.2 7 57.5 7.8 57.5 9.5C57.5 11.2 56.2 12 54.5 12ZM54.5 10.5C55.1 10.5 55.7 10.1 55.7 9.5C55.7 8.9 55.1 8.5 54.5 8.5C53.9 8.5 53.3 8.9 53.3 9.5C53.3 10.1 53.9 10.5 54.5 10.5Z" fill="#1A73E8"/>
      <path d="M62 12V4H64.5C66.5 4 67.5 4.8 67.5 6.2C67.5 7.2 66.8 7.8 65.5 8.1L67.8 12H65.8L63.8 8.5H62.9V12H62ZM63.8 7.2H64.2C64.9 7.2 65.7 7 65.7 6.2C65.7 5.4 64.9 5.3 64.2 5.3H63.8V7.2Z" fill="#1A73E8"/>
      <path d="M72.2 12V4H76.7V5.5H74V7.2H76.2V8.7H74V10.5H76.9V12H72.2Z" fill="#1A73E8"/>
    </svg>
  </div>
);

export default AssuredBadge;
