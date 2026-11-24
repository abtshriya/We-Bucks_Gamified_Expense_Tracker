import React, { useState, useEffect } from 'react';

// user settings for profile, monthly salary, other incomes, hourly wage and balance
export default function SettingsView({ settings, onSave, onResetDefaults, onAddXp }) {
  const [userName, setUserName] = useState('Saver');
  const [salary, setSalary] = useState('0.00');
  const [otherIncome, setOtherIncome] = useState('0.00');
  const [wage, setWage] = useState('600.00');
  const [currency, setCurrency] = useState('₹');
  const [balance, setBalance] = useState('50000.00');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (settings) {
      setUserName(settings.user_name || 'Saver');
      setSalary(settings.monthly_salary !== undefined ? settings.monthly_salary.toString() : '0.00');
      setOtherIncome(settings.other_income !== undefined ? settings.other_income.toString() : '0.00');
      setWage(settings.net_hourly_wage?.toString() || '600.00');
      setCurrency(settings.currency_symbol || '₹');
      setBalance(settings.available_balance?.toString() || '50000.00');
    }
  }, [settings]);

  const numericSalary = parseFloat(salary) || 0;
  const numericOther = parseFloat(otherIncome) || 0;
  const totalMonthlyIncome = numericSalary + numericOther;
  const numericWage = parseFloat(wage) || 1;
  const numericBalance = parseFloat(balance) || 0;

  const handleAutoCalcWage = () => {
    if (totalMonthlyIncome <= 0) {
      alert('Please enter a monthly salary or other income amount first.');
      return;
    }
    // standard 160 working hours per month (40h/week * 4 weeks)
    const calculatedHourly = (totalMonthlyIncome / 160).toFixed(2);
    setWage(calculatedHourly);
  };

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
        user_name: userName.trim() || 'Saver',
        monthly_salary: numericSalary,
        other_income: numericOther,
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
          PROFILE &amp; FINANCIAL SETTINGS
        </h4>
        <div className="page-subtitle">
          Customize your name, monthly salary, side incomes, and hourly wage to power your expense tracker.
        </div>
      </div>

      {saved && (
        <div className="pixel-box-sage p-2 px-3 mb-3 pixel-font" style={{ fontSize: '0.65rem' }}>
          ✓ SAVED! YOUR PROFILE AND FINANCIAL RATES HAVE BEEN UPDATED.
        </div>
      )}

      <div className="pixel-box p-3 p-md-4 mb-4">
        <form onSubmit={handleSubmit}>
          {/* SECTION 1: USER PROFILE & INCOME SOURCES */}
          <div className="border-bottom border-2 border-dark pb-3 mb-3">
            <h6 className="pixel-font mb-3" style={{ color: 'var(--pixel-black)' }}>
              1. USER PROFILE &amp; MONTHLY INFLOWS
            </h6>

            {/* User Name */}
            <div className="mb-3">
              <label className="pixel-font small d-block mb-1" style={{ fontSize: '0.62rem' }}>
                YOUR NAME / DISPLAY NAME
              </label>
              <input
                type="text"
                maxLength="80"
                className="form-control fw-bold"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="e.g. Shriya"
              />
              <div className="text-muted mt-1" style={{ fontSize: '0.95rem' }}>
                Used to personalize your Treasury Vault and budget navigator.
              </div>
            </div>

            {/* Income Streams Row */}
            <div className="row g-3 mb-2">
              <div className="col-12 col-md-6">
                <label className="pixel-font small d-block mb-1" style={{ fontSize: '0.62rem' }}>
                  MONTHLY SALARY (TAKE-HOME)
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-2 border-dark fw-bold">{currency}</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.00"
                    className="form-control fw-bold fs-5"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    placeholder="0.00"
                  />
                  <span className="input-group-text bg-white border-2 border-dark" style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.55rem' }}>
                    /MO
                  </span>
                </div>
                <div className="text-secondary mt-1" style={{ fontSize: '0.88rem' }}>
                  Primary monthly take-home salary after taxes.
                </div>
              </div>

              <div className="col-12 col-md-6">
                <label className="pixel-font small d-block mb-1" style={{ fontSize: '0.62rem' }}>
                  OTHER MONTHLY INCOMES
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-2 border-dark fw-bold">{currency}</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.00"
                    className="form-control fw-bold fs-5"
                    value={otherIncome}
                    onChange={(e) => setOtherIncome(e.target.value)}
                    placeholder="0.00"
                  />
                  <span className="input-group-text bg-white border-2 border-dark" style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.55rem' }}>
                    /MO
                  </span>
                </div>
                <div className="text-secondary mt-1" style={{ fontSize: '0.88rem' }}>
                  Freelance, investments, rentals, or side hustles.
                </div>
              </div>
            </div>

            {/* Inflow Summary & Auto-calc */}
            <div className="p-2 px-3 border border-2 border-dark mt-3 d-flex flex-wrap justify-content-between align-items-center gap-2" style={{ backgroundColor: 'var(--sage-soft)' }}>
              <div>
                <span className="pixel-font" style={{ fontSize: '0.58rem' }}>TOTAL MONTHLY INFLOW:</span>
                <span className="fw-bold fs-5 ms-2">
                  {currency}{totalMonthlyIncome.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mo
                </span>
              </div>
              <button
                type="button"
                className="btn-pixel btn-pixel-secondary"
                style={{ fontSize: '0.55rem' }}
                onClick={handleAutoCalcWage}
                data-tooltip="Auto-calculates hourly rate assuming standard 160 hours/month"
              >
                ⚡ AUTO-CALCULATE HOURLY WAGE
              </button>
            </div>
          </div>

          {/* SECTION 2: HOURLY RATE & TREASURY */}
          <h6 className="pixel-font mb-3" style={{ color: 'var(--pixel-black)' }}>
            2. HOURLY RATE &amp; TREASURY SETTINGS
          </h6>

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
                Converts prices into working life-hours across your ledger.
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
                Your current liquid cash and bank balance, dynamically updated on expenses.
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-end border-top border-2 border-dark pt-3">
            <button
              type="submit"
              className="btn-pixel btn-pixel-primary px-4"
              disabled={isSaving}
            >
              {isSaving ? 'SAVING...' : 'SAVE SETTINGS'}
            </button>
          </div>
        </form>
      </div>

      {/* Benchmark Reference Table */}
      <div className="pixel-box p-3 p-md-4 mb-4">
        <h6 className="pixel-font mb-1" style={{ color: 'var(--pixel-black)' }}>
          LIFE-HOUR EXCHANGE RATES
        </h6>
        <div className="mb-3" style={{ fontSize: '1.15rem', color: 'var(--pixel-black)' }}>
          At your current wage rate of <strong>{currency}{numericWage.toFixed(0)}/hour</strong>:
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

      {/* Fresh Start / Reset Data */}
      {onResetDefaults && (
        <div className="pixel-box p-3 p-md-4">
          <h6 className="pixel-font mb-1 text-danger" style={{ fontSize: '0.72rem' }}>
            FRESH START / RESET ALL DATA
          </h6>
          <div className="mb-3 text-secondary" style={{ fontSize: '1rem' }}>
            Wipe all logged expenses and subscriptions, and reset your starting balance back to default.
          </div>
          <button
            type="button"
            className="btn-pixel btn-pixel-danger"
            onClick={onResetDefaults}
          >
            RESET ALL TO DEFAULT (CLEAN SLATE)
          </button>
        </div>
      )}
    </div>
  );
}
