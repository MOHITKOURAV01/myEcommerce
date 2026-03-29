import React from 'react';

export default function NoticeBoard({ moods, problems, activeMood, activeProblem, onMoodClick, onProblemClick }) {
  return (
    <aside className="wood-panel" style={{ borderRadius: 'var(--radius-xl)', padding: '24px' }}>
      <div className="flex" style={{ alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <div style={{ width: '16px', height: '16px', background: 'var(--terra)', borderRadius: '50%', boxShadow: 'inset -2px -2px 0 rgba(0,0,0,0.2), 0 4px 6px rgba(0,0,0,0.5)' }} />
        <h3 style={{ margin: 0, fontSize: '22px', color: 'var(--clay-cream)' }}>Filter Books</h3>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <div className="eyebrow" style={{ marginBottom: '12px' }}>By Mood</div>
        <div className="flex-wrap" style={{ display: 'flex', gap: '8px' }}>
          <button 
            className={`clay-btn btn-sm ${activeMood === '' ? 'btn-gold' : 'btn-ghost'}`} 
            onClick={() => onMoodClick('')}
          >All</button>
          {moods.map(m => (
            <button 
              key={m} 
              className={`clay-btn btn-sm ${activeMood === m ? 'btn-gold' : 'btn-ghost'}`} 
              style={{ fontSize: '12px', padding: '6px 12px' }}
              onClick={() => onMoodClick(m)}
            >
              {m}
            </button>
          ))}
        </div>
      </div>
      
      <div>
        <div className="eyebrow" style={{ marginBottom: '12px' }}>By Problem</div>
        <div className="flex-wrap" style={{ display: 'flex', gap: '8px' }}>
          <button 
            className={`clay-btn btn-sm ${activeProblem === '' ? 'btn-primary' : 'btn-ghost'}`} 
            onClick={() => onProblemClick('')}
          >All</button>
          {problems.map(p => (
            <button 
              key={p} 
              className={`clay-btn btn-sm ${activeProblem === p ? 'btn-primary' : 'btn-ghost'}`} 
              style={{ fontSize: '12px', padding: '6px 12px' }}
              onClick={() => onProblemClick(p)}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
