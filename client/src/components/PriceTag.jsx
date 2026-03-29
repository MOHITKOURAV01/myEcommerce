import React from 'react';

export default function PriceTag({ text, active, onClick }) {
  return (
    <div 
      className={`price-tag ${active ? 'active' : ''}`} 
      onClick={onClick}
    >
      <div className="tag-hole" />
      {text}
    </div>
  );
}
