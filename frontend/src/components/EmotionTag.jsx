import React from 'react';
import { EMOTIONS } from '../constants/emotions';

// pixel tag for emotional triggers
export default function EmotionTag({ emotion }) {
  const item = EMOTIONS[emotion] || {
    label: emotion || 'Other',
    pixelClass: 'pixel-tag-content',
    tooltip: 'Emotional trigger',
  };

  return (
    <span
      className={`pixel-badge ${item.pixelClass}`}
      data-tooltip={item.tooltip}
    >
      {item.label}
    </span>
  );
}

export { EMOTIONS };
