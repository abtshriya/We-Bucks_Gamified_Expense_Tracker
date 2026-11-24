import React, { useState } from 'react';

// 1-10 monthly regret and value slider
export default function RegretSlider({ subscriptionId, initialScore = 5, onSave }) {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [score, setScore] = useState(initialScore);
  const [month, setMonth] = useState(currentMonth);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  // Gamified Item Ranks
  const getRank = (val) => {
    if (val <= 3) return { label: 'CURSED / REGRET', color: 'var(--pixel-red)', bg: 'var(--pixel-red-bg)' };
    if (val <= 6) return { label: 'COMMON ITEM', color: 'var(--pixel-gold)', bg: 'var(--pixel-gold-bg)' };
    return { label: 'LEGENDARY VALUE', color: 'var(--olive)', bg: 'var(--sage-light)' };
  };

  const rank = getRank(score);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        rating_month: month,
        value_score: score,
        notes: notes.trim(),
      });
    } catch (err) {
      console.error('Error saving subscription rating:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="py-2">
      <div className="d-flex justify-content-between align-items-center mb-1">
        <span className="pixel-font" style={{ fontSize: '0.62rem' }}>
          ITEM VALUE:
        </span>
        <span
          className="pixel-badge"
          style={{ backgroundColor: rank.bg, color: rank.color, borderColor: rank.color }}
        >
          {score}/10 · {rank.label}
        </span>
      </div>

      <input
        type="range"
        className="pixel-slider my-2"
        min="1"
        max="10"
        step="1"
        value={score}
        onChange={(e) => setScore(parseInt(e.target.value, 10))}
      />

      <div className="d-flex justify-content-between pixel-font" style={{ fontSize: '0.55rem', opacity: 0.7 }}>
        <span>1: NO VALUE</span>
        <span>5: NEUTRAL</span>
        <span>10: ESSENTIAL</span>
      </div>

      {showNotes && (
        <div className="mt-2">
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Add log / review notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center mt-2 pt-1">
        <div className="d-flex align-items-center gap-2">
          <input
            type="month"
            className="form-control form-control-sm"
            style={{ width: '140px', fontSize: '1rem', padding: '0.2rem 0.4rem' }}
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
          <button
            type="button"
            className="btn btn-link btn-sm text-dark p-0"
            style={{ fontSize: '0.9rem', textDecoration: 'none' }}
            onClick={() => setShowNotes(!showNotes)}
          >
            {showNotes ? '[- Note]' : '[+ Note]'}
          </button>
        </div>

        <button
          type="button"
          className="btn-pixel btn-pixel-primary"
          style={{ padding: '0.35rem 0.65rem' }}
          disabled={saving}
          onClick={handleSave}
        >
          {saving ? 'SAVING...' : 'APPRAISE'}
        </button>
      </div>
    </div>
  );
}
