import React, { useState, useEffect } from 'react';

// user settings for hourly wage and available balance
export default function SettingsView({ settings, onSave, onAddXp }) {
  const [wage, setWage] = useState('600.00');
  const [currency, setCurrency] = useState('₹');
  const [balance, setBalance] = useState('50000.00');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (settings) {
      setWage(settings.net_hourly_wage?.toString() || '600.00');
      setCurrency(settings.currency_symbol || '₹');
      setBalance(settings.available_balance?.toString() || '50000.00');
    }
  }, [settings]);

  const numericWage = parseFloat(wage) || 1;
  const numericBalance = parseFloat(balance) || 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (numericWage <= 0) {
      alert('Hourly rate must be greater than zero.');
      return;
    }
    if (numericBalance < 0) {
      alert('Available balance cannot be negative.');
      return;
    }

    setIsSaving(true);
    setSaved(false);

    try {
      await onSave({
        net_hourly_wage: numericWage,
        currency_symbol: currency,
        available_balance: numericBalance,
      });
      setSaved(true);
      if (onAddXp) onAddXp(50);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error('Error updating settings:', err);
      alert(`Error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container py-4" style={{ maxWidth: '720px' }}>
      <div className="page-header-card">
        <h4 className="page-title">
          HOURLY WAGE SETTINGS
        </h4>
        <div className="page-subtitle">
          Set your hourly take-home pay to see how many hours of work your purchases actually cost.
        </div>
      </div>

      {saved && (
        <div className="pixel-box-sage p-2 px-3 mb-3 pixel-font" style={{ fontSize: '0.65rem' }}>
          ✓ SAVED! YOUR HOURLY RATE HAS BEEN UPDATED.
        </div>
      )}

      <div className="pixel-box p-3 p-md-4 mb-4">
        <form onSubmit={handleSubmit}>
          <div className="row g-3 mb-3">
            <div className="col-12 col-md-8">
              <label className="pixel-font small d-block mb-1" style={{ fontSize: '0.62rem' }}>
                NET HOURLY TAKE-HOME RATE
              </label>
              <div className="input-group">
                <span className="input-group-text bg-white border-2 border-dark fw-bold">{currency}</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  className="form-control fw-bold fs-4"
                  value={wage}
                  onChange={(e) => setWage(e.target.value)}
                  placeholder="600.00"
                />
                <span className="input-group-text bg-white border-2 border-dark" style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.62rem' }}>
                  /HOUR
                </span>
              </div>
              <div className="text-muted mt-1" style={{ fontSize: '0.95rem' }}>
                Calculated by dividing your monthly take-home salary by ~160 working hours.
              </div>
            </div>

            <div className="col-12 col-md-4">
              <label className="pixel-font small d-block mb-1" style={{ fontSize: '0.62rem' }}>
                CURRENCY
              </label>
              <select
                className="form-select"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="₹">₹ (INR)</option>
                <option value="$">$ (USD)</option>
                <option value="€">€ (EUR)</option>
                <option value="£">£ (GBP)</option>
                <option value="¥">¥ (JPY)</option>
              </select>
            </div>
          </div>

          <div className="row g-3 mb-3">
            <div className="col-12">
              <label className="pixel-font small d-block mb-1" style={{ fontSize: '0.62rem' }}>
                AVAILABLE BALANCE (LIQUID TREASURY)
              </label>
              <div className="input-group">
                <span className="input-group-text bg-white border-2 border-dark fw-bold">{currency}</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.00"
                  required
                  className="form-control fw-bold fs-4"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  placeholder="50000.00"
                />
              </div>
              <div className="text-muted mt-1" style={{ fontSize: '0.95rem' }}>
                Your current liquid cash and bank balance, used to compute guilt-free spendable balance.
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-end border-top border-2 border-dark pt-3">
            <button
              type="submit"
              className="btn-pixel btn-pixel-primary px-4"
              disabled={isSaving}
            >
              {isSaving ? 'SAVING...' : 'SAVE & FORGE STATS'}
            </button>
          </div>
        </form>
      </div>

      {/* Benchmark Reference Table */}
      <div className="pixel-box p-3 p-md-4">
        <h6 className="pixel-font mb-1" style={{ color: 'var(--olive)' }}>
          LIFE-HOUR EXCHANGE RATES
        </h6>
        <div className="mb-3" style={{ fontSize: '1rem', color: 'var(--olive-light)' }}>
          At your current forge rate of <strong>{currency}{numericWage.toFixed(0)}/hour</strong>:
        </div>

        <div className="table-responsive">
          <table className="table-pixel">
            <thead>
              <tr>
                <th>TYPICAL EXPENSE</th>
                <th>PRICE</th>
                <th>LIFE HOURS REQUIRED</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Filter Coffee / Cutting Chai', cost: 40.00 },
                { name: 'Swiggy / Zomato Lunch', cost: 350.00 },
                { name: 'Weekend Dinner & Drinks', cost: 2000.00 },
                { name: 'Running Shoes / Gear', cost: 4500.00 },
                { name: 'Weekend Trip (Goa / Coorg)', cost: 15000.00 },
              ].map((item) => {
                const hours = (item.cost / numericWage).toFixed(1);
                return (
                  <tr key={item.name}>
                    <td><strong>{item.name}</strong></td>
                    <td>{currency}{item.cost.toFixed(2)}</td>
                    <td>
                      <span className="time-pill-pixel">
                        <span className="work-hrs">{hours}h WORK</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
