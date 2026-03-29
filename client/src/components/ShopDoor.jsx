import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ShopDoor({ path }) {
  const navigate = useNavigate();

  return (
    <div className="shop-door" onClick={() => navigate(`/paths#${path.id}`)}>
      <div className="door-frame">
        <div className="door-panel">
          <div className="door-window">
            <div className="window-glow" />
          </div>
          <div className="door-knob" />
          <div className="door-sign">{path.name}</div>
        </div>
      </div>
      <div className="door-label">{path.desc}</div>
      <div className="door-count">{path.count} books</div>
    </div>
  );
}
