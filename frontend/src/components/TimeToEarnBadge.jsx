import React from 'react';

export default function TimeToEarnBadge({ amount, hours, hourlyWage, currency = '₹' }) {
  const numericAmount = parseFloat(amount) || 0;
  let formattedHours = '0.0';

  if (hours !== undefined && hours !== null) {
    formattedHours = parseFloat(hours).toFixed(1);
  } else if (hourlyWage && hourlyWage > 0) {
    formattedHours = (numericAmount / parseFloat(hourlyWage)).toFixed(1);
  }

  return (
    <span
      className="time-pill-pixel"
      data-tooltip={`${currency}${numericAmount.toFixed(2)} took ${formattedHours}h of work to pay for.`}
    >
      <span>{currency}{numericAmount.toFixed(2)}</span>
      <span className="text-muted">|</span>
      <span className="work-hrs">{formattedHours}h</span>
    </span>
  );
}
