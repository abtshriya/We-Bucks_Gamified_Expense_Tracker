import React from 'react';
import { EMOTIONS } from '../constants/emotions';

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
