import React from 'react';

export default function SignboardCard({ mood, onClick, theme }) {
  // theme can be 'terra', 'green', 'gold', 'purple'
  return (
    <div className="signboard" onClick={() => onClick(mood)}>
      <div className="sign-rope-left" />
      <div className="sign-rope-right" />

      <div className={`sign-face wood-bg sign-${theme || 'green'}`}>
        <div className="sign-name">{mood.name}</div>
        <div className="sign-desc">{mood.desc}</div>
        <div className="sign-count clay-btn">{mood.count} books</div>
      </div>
    </div>
  );
}
