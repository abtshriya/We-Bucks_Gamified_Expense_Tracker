import React, { useState } from 'react';
import TimeToEarnBadge from './TimeToEarnBadge';
import EmotionTag from './EmotionTag';
import { PixelCoin, PixelCash } from './PixelCoinBurst';

// main dashboard view with vault, stats and boss damage
export default function DashboardView({
  summary,
  recentExpenses = [],
  settings,
  onCancelSubscription,
  onNavigate,
  onAddXp,
  onUpdateSettings,
}) {
  const currency = settings?.currency_symbol || '₹';
  const wage = parseFloat(settings?.net_hourly_wage || 600);

  const [calcAmount, setCalcAmount] = useState('1500');

  // Balance edit modal state
  const [isEditingBalance, setIsEditingBalance] = useState(false);
  const [inputBalance, setInputBalance] = useState('');

  // Balances
  const availableBalance = summary?.available_balance !== undefined
    ? parseFloat(summary.available_balance)
    : (parseFloat(settings?.available_balance) || 50000);
  
  const yetToPay = summary?.yet_to_pay !== undefined
    ? parseFloat(summary.yet_to_pay)
    : (parseFloat(summary?.subscriptions_summary?.total_monthly_recurring) || 0);

  const spendableBalance = summary?.spendable_balance !== undefined
    ? parseFloat(summary.spendable_balance)
    : (availableBalance - yetToPay);

  const spendableHours = wage > 0
    ? (spendableBalance / wage).toFixed(1)
    : '0.0';

  const calcHours = wage > 0 && parseFloat(calcAmount) > 0
    ? (parseFloat(calcAmount) / wage).toFixed(1)
    : '0.0';

  const totalSpend = summary?.total_spend || 0;
  const totalHours = summary?.total_hours || 0;
  const emotionalBreakdown = summary?.emotional_breakdown || [];
  const subsSummary = summary?.subscriptions_summary || {};
  const flaggedSubs = subsSummary.flagged_subscriptions || [];

  const topEmotion = emotionalBreakdown.length > 0 ? emotionalBreakdown[0] : null;

  const handleQuickCancel = (subId, subName) => {
    if (window.confirm(`[QUEST] Slay & cancel ${subName}? You will recover ${currency}${subsSummary.potential_monthly_savings}/month and gain +100 XP!`)) {
      onCancelSubscription(subId);
      if (onAddXp) onAddXp(100);
    }
  };

  const handleSaveBalance = async (e) => {
    e.preventDefault();
    const val = parseFloat(inputBalance);
    if (isNaN(val) || val < 0) {
      alert('Please enter a valid balance amount (0 or greater).');
      return;
    }
    if (onUpdateSettings) {
      await onUpdateSettings({ available_balance: val });
    }
    setIsEditingBalance(false);
  };

  return (
    <div className="container py-4">
      {/* TREASURY BALANCE VAULT: Available Balance, Yet to Pay, Spendable Balance */}
      <div className="pixel-box mb-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center border-bottom border-2 border-dark pb-2 mb-3">
          <div className="d-flex align-items-center gap-2">
            <span className="pixel-font" style={{ fontSize: '0.85rem', color: 'var(--olive)' }}>
              TREASURY BALANCE VAULT
            </span>
            <span className="pixel-badge" style={{ backgroundColor: 'var(--sage-soft)', color: 'var(--olive)' }}>
              LIVE LEDGER
            </span>
          </div>
          <button
            type="button"
            className="btn-pixel btn-pixel-light"
            style={{ fontSize: '0.55rem', padding: '0.3rem 0.6rem' }}
            onClick={() => {
              setInputBalance(availableBalance.toString());
              setIsEditingBalance(true);
            }}
          >
            ✎ UPDATE BALANCE
          </button>
        </div>

        <div className="row g-3 align-items-stretch">
          {/* 1. AVAILABLE BALANCE */}
          <div className="col-12 col-md-4">
            <div
              className="p-3 border border-2 border-dark h-100 pixel-stat-card"
              style={{ backgroundColor: 'var(--sage-soft)' }}
              data-tooltip="Total money in your bank and wallet right now."
            >
              <div className="d-flex justify-content-between align-items-center">
                <div className="pixel-font text-muted d-flex align-items-center gap-1" style={{ fontSize: '0.62rem' }}>
                  <span className="pixel-coin-spin"><PixelCoin size={14} /></span>
                  <span>AVAILABLE BALANCE</span>
                </div>
              </div>
              <div className="display-6 fw-bold mt-2 mb-1" style={{ fontFamily: 'var(--font-retro)' }}>
                {currency}{availableBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-secondary" style={{ fontSize: '0.95rem' }}>
                Total liquid funds in your treasury
              </div>
            </div>
          </div>

          {/* 2. YET TO PAY */}
          <div className="col-12 col-md-4">
            <div
              className="p-3 border border-2 border-dark h-100 pixel-stat-card"
              style={{ backgroundColor: 'var(--pixel-gold-bg)' }}
              data-tooltip="Money reserved for your upcoming monthly subscriptions."
            >
              <div className="d-flex justify-content-between align-items-center">
                <div className="pixel-font text-muted" style={{ fontSize: '0.62rem' }}>
                  YET TO PAY
                </div>
              </div>
              <div className="display-6 fw-bold mt-2 mb-1" style={{ color: '#826315', fontFamily: 'var(--font-retro)' }}>
                {currency}{yetToPay.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-secondary" style={{ fontSize: '0.95rem' }}>
                Committed recurring subscriptions &amp; dues
              </div>
            </div>
          </div>

          {/* 3. SPENDABLE BALANCE (Available Balance - Yet to Pay) */}
          <div className="col-12 col-md-4">
            <div
              className="pixel-box-olive p-3 h-100 pixel-stat-card"
              style={{ border: '2px solid var(--pixel-black)' }}
              data-tooltip="Safe money you can freely spend without falling short on bills."
            >
              <div className="d-flex justify-content-between align-items-center">
                <div className="pixel-font d-flex align-items-center gap-1" style={{ fontSize: '0.62rem', color: '#fff' }}>
                  <PixelCash width={18} height={11} />
                  <span>SPENDABLE BALANCE</span>
                </div>
                <span className="pixel-badge" style={{ backgroundColor: 'var(--sage-light)', color: 'var(--pixel-black)', fontSize: '0.5rem' }}>
                  SAFE TO SPEND
                </span>
              </div>
              <div className="display-6 fw-bold mt-2 mb-1 text-white" style={{ fontFamily: 'var(--font-retro)' }}>
                {currency}{spendableBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="small" style={{ opacity: 0.9, fontSize: '0.9rem' }}>
                (Available Balance - Yet to Pay) · {spendableHours}h life-hours
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Updating Available Balance */}
      {isEditingBalance && (
        <div className="pixel-modal-backdrop" onClick={() => setIsEditingBalance(false)}>
          <div className="pixel-modal-window" onClick={(e) => e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-center mb-3 border-bottom border-2 border-dark pb-2">
              <h5 className="pixel-font mb-0" style={{ color: 'var(--olive)' }}>
                UPDATE AVAILABLE BALANCE
              </h5>
              <button
                type="button"
                className="btn-pixel btn-pixel-danger"
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.65rem' }}
                onClick={() => setIsEditingBalance(false)}
              >
                X
              </button>
            </div>

            <form onSubmit={handleSaveBalance}>
              <div className="mb-3">
                <label className="pixel-font small d-block mb-1" style={{ fontSize: '0.62rem' }}>
                  NEW AVAILABLE BALANCE ({currency})
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  className="form-control fw-bold fs-4"
                  value={inputBalance}
                  onChange={(e) => setInputBalance(e.target.value)}
                  placeholder="50000.00"
                />
                <div className="text-muted mt-1" style={{ fontSize: '0.9rem' }}>
                  Enter your current total liquid cash or bank balance.
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2 border-top border-2 border-dark pt-3">
                <button
                  type="button"
                  className="btn-pixel btn-pixel-light"
                  onClick={() => setIsEditingBalance(false)}
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="btn-pixel btn-pixel-primary px-4"
                >
                  SAVE BALANCE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Gamified Quest Alert: Low-Value / Cursed Subscriptions */}
      {flaggedSubs.length > 0 && (
        <div className="pixel-box-danger p-3 mb-4">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div>
              <div className="d-flex align-items-center gap-2">
                <span className="pixel-badge" style={{ backgroundColor: 'var(--pixel-red)', color: '#fff' }}>
                  CURSED ITEM DETECTED
                </span>
                <span className="pixel-font" style={{ fontSize: '0.75rem', color: 'var(--pixel-red)' }}>
                  {flaggedSubs.length} SUBSCRIPTION RATED &lt; 4 FOR 2 CONSECUTIVE MONTHS!
                </span>
              </div>
              <p className="mb-0 mt-1" style={{ fontSize: '1.15rem' }}>
                Cancel to save{' '}
                <strong>
                  {currency}{subsSummary.potential_monthly_savings.toFixed(2)}/mo
                </strong>{' '}
                ({(subsSummary.potential_monthly_savings / wage).toFixed(1)} work hours) and clear your inventory!
              </p>
            </div>

            <button
              type="button"
              className="btn-pixel btn-pixel-danger"
              onClick={() => onNavigate('subscriptions')}
            >
              VIEW SUBSCRIPTIONS
            </button>
          </div>

          <div className="mt-3 pt-2 border-top" style={{ borderColor: 'var(--pixel-black)' }}>
            <div className="row g-2">
              {flaggedSubs.map((sub) => (
                <div key={sub.id} className="col-md-6 col-lg-4">
                  <div className="bg-white p-2 px-3 border border-2 border-dark d-flex justify-content-between align-items-center">
                    <div>
                      <div className="pixel-font text-truncate" style={{ fontSize: '0.65rem' }}>{sub.name}</div>
                      <div className="text-muted" style={{ fontSize: '0.95rem' }}>
                        {currency}{sub.monthly_cost.toFixed(2)}/mo · {sub.ratings_summary}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn-pixel btn-pixel-danger"
                      style={{ fontSize: '0.55rem', padding: '0.35rem 0.55rem' }}
                      onClick={() => handleQuickCancel(sub.id, sub.name)}
                    >
                      SLAY / CANCEL
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Top 4 Pixel Stat HUD Cards */}
      <div className="row g-3 mb-4">
        {/* 1. TREASURY SPENT */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div
            className="pixel-box pixel-stat-card h-100"
            data-tooltip="Total money you have spent so far."
          >
            <div className="d-flex justify-content-between align-items-center">
              <div className="pixel-font" style={{ fontSize: '0.62rem', color: 'var(--olive)' }}>
                TREASURY SPENT
              </div>
            </div>
            <div className="display-6 fw-bold mt-2 mb-1" style={{ fontFamily: 'var(--font-retro)' }}>
              {currency}{totalSpend.toFixed(2)}
            </div>
            <div className="text-secondary" style={{ fontSize: '0.95rem' }}>
              Current month: {currency}{(summary?.month_spend || 0).toFixed(2)}
            </div>
          </div>
        </div>

        {/* 2. LIFE HOURS LOST */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div
            className="pixel-box pixel-stat-card h-100"
            style={{ borderLeft: '8px solid var(--olive)' }}
            data-tooltip="Hours of work it took to pay for what you bought."
          >
            <div className="d-flex justify-content-between align-items-center">
              <div className="pixel-font" style={{ fontSize: '0.62rem', color: 'var(--olive)' }}>
                LIFE HOURS LOST
              </div>
            </div>
            <div className="display-6 fw-bold mt-2 mb-1" style={{ color: 'var(--olive)', fontFamily: 'var(--font-retro)' }}>
              {totalHours} HRS
            </div>
            <div className="text-secondary" style={{ fontSize: '0.95rem' }}>
              At {currency}{wage.toFixed(0)}/h net rate
            </div>
          </div>
        </div>

        {/* 3. TOP SPEND BOSS */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div
            className="pixel-box pixel-stat-card h-100"
            data-tooltip="The mood that caused you to spend the most money."
          >
            <div className="d-flex justify-content-between align-items-center">
              <div className="pixel-font" style={{ fontSize: '0.62rem', color: 'var(--olive)' }}>
                TOP SPEND BOSS
              </div>
            </div>
            <div className="mt-2 mb-1">
              {topEmotion ? (
                <EmotionTag emotion={topEmotion.emotion} />
              ) : (
                <span className="small text-secondary">NO DATA</span>
              )}
            </div>
            <div className="text-secondary" style={{ fontSize: '0.95rem' }}>
              {topEmotion ? `${topEmotion.percentage}% of damage (${currency}${topEmotion.total.toFixed(2)})` : 'Log expenses'}
            </div>
          </div>
        </div>

        {/* 4. CURSED SERVICES */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div
            className="pixel-box pixel-stat-card h-100"
            data-tooltip="Subscriptions you rarely use — cancel them to save cash."
          >
            <div className="d-flex justify-content-between align-items-center">
              <div className="pixel-font" style={{ fontSize: '0.62rem', color: 'var(--olive)' }}>
                CURSED SERVICES
              </div>
            </div>
            <div className={`display-6 fw-bold mt-2 mb-1 ${flaggedSubs.length > 0 ? 'text-danger' : 'text-dark'}`} style={{ fontFamily: 'var(--font-retro)' }}>
              {flaggedSubs.length}
            </div>
            <div className="text-secondary" style={{ fontSize: '0.95rem' }}>
              {flaggedSubs.length > 0 ? (
                <span className="text-danger fw-bold">
                  Recover {currency}{subsSummary.potential_monthly_savings.toFixed(2)}/mo
                </span>
              ) : (
                <span>Inventory is clean!</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Boss Battle (Emotional Spending) & Work Hours Simulator */}
      <div className="row g-4 mb-4">
        {/* Emotional Spending Breakdown as Boss Damage Bars */}
        <div className="col-lg-7">
          <div className="pixel-box h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h6 className="pixel-font mb-1" style={{ color: 'var(--olive)' }}>
                  EMOTIONAL SPEND BOSSES
                </h6>
                <div style={{ fontSize: '1rem', color: 'var(--olive-light)' }}>
                  Damage inflicted on your coin pouch by psychological trigger
                </div>
              </div>
              <button
                type="button"
                className="btn-pixel btn-pixel-secondary"
                onClick={() => onNavigate('expenses')}
              >
                LEDGER
              </button>
            </div>

            {emotionalBreakdown.length === 0 ? (
              <div className="text-center py-5 text-secondary">
                No transactions recorded yet. Log an expense to reveal your triggers!
              </div>
            ) : (
              <div className="d-flex flex-column gap-3 mt-2">
                {emotionalBreakdown.map((item) => (
                  <div key={item.emotion} className="p-2 border border-2 border-dark" style={{ backgroundColor: 'var(--sage-soft)' }}>
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <div className="d-flex align-items-center gap-2">
                        <EmotionTag emotion={item.emotion} />
                        <span style={{ fontSize: '1.05rem' }}>({item.count} hits)</span>
                      </div>
                      <div className="text-end">
                        <span className="fw-bold me-2" style={{ fontSize: '1.2rem' }}>
                          {currency}{item.total.toFixed(2)}
                        </span>
                        <span className="pixel-badge" style={{ backgroundColor: 'var(--olive)', color: '#fff' }}>
                          {item.hours}h LOST
                        </span>
                      </div>
                    </div>

                    {/* Retro HP Bar */}
                    <div className="pixel-bar-container">
                      <div
                        className="pixel-bar-fill"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <div className="d-flex justify-content-between align-items-center mt-1 text-secondary" style={{ fontSize: '0.95rem' }}>
                      <span>Trigger: {item.label}</span>
                      <span>{item.percentage}% of total damage</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Work Hours Simulator */}
        <div className="col-lg-5">
          <div className="pixel-box h-100">
            <h6 className="pixel-font mb-1" style={{ color: 'var(--olive)' }}>
              TIME-TO-EARN SIMULATOR
            </h6>
            <div className="mb-3" style={{ fontSize: '1rem', color: 'var(--olive-light)' }}>
              Translate any potential purchase into hours of your working life.
            </div>

            <div className="p-3 border border-2 border-dark mb-3" style={{ backgroundColor: 'var(--sage-soft)' }}>
              <label className="pixel-font small d-block mb-1" style={{ fontSize: '0.62rem' }}>
                ENTER ITEM PRICE ({currency})
              </label>
              <div className="input-group mb-2">
                <span className="input-group-text bg-white border-2 border-dark fw-bold">{currency}</span>
                <input
                  type="number"
                  step="1"
                  min="0"
                  className="form-control fw-bold fs-4"
                  value={calcAmount}
                  onChange={(e) => setCalcAmount(e.target.value)}
                  placeholder="0"
                />
              </div>

              <div className="text-center pt-2">
                <div className="pixel-font" style={{ fontSize: '0.58rem', color: 'var(--olive)' }}>
                  COSTS YOUR LIFE:
                </div>
                <div className="display-5 fw-bold mt-1" style={{ color: 'var(--olive)', fontFamily: 'var(--font-retro)' }}>
                  {calcHours} <span style={{ fontSize: '1.3rem' }}>HOURS</span>
                </div>
                <div className="text-secondary" style={{ fontSize: '0.95rem' }}>
                  At {currency}{wage.toFixed(0)}/h net take-home rate
                </div>
              </div>
            </div>

            <div className="mt-auto">
              <span className="pixel-font d-block mb-2" style={{ fontSize: '0.58rem' }}>
                QUICK BENCHMARKS:
              </span>
              <div className="d-flex flex-wrap gap-2">
                {[
                  { label: 'Chai (₹30)', amount: 30 },
                  { label: 'Swiggy (₹350)', amount: 350 },
                  { label: 'Dinner (₹1,800)', amount: 1800 },
                  { label: 'Trip (₹12,000)', amount: 12000 },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    className="btn-pixel btn-pixel-light"
                    style={{ fontSize: '0.55rem', padding: '0.35rem 0.55rem' }}
                    onClick={() => setCalcAmount(item.amount.toString())}
                  >
                    {item.label} → {(item.amount / wage).toFixed(1)}h
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Active Quests & Recent Ledger */}
      <div className="row g-4 mb-4">
        {/* Active Quests Widget */}
        <div className="col-lg-4">
          <div className="pixel-box h-100">
            <h6 className="pixel-font mb-3" style={{ color: 'var(--olive)' }}>
              QUEST BOARD
            </h6>
            <div className="d-flex flex-column gap-2">
              <div className="quest-item completed">
                <div>
                  <div className="pixel-font" style={{ fontSize: '0.62rem' }}>✓ SET TAKE-HOME RATE</div>
                  <div className="text-muted" style={{ fontSize: '0.9rem' }}>Configured hourly rate ({currency}{wage}/h)</div>
                </div>
                <span className="pixel-badge" style={{ backgroundColor: 'var(--pixel-gold-bg)', color: '#826315' }}>+50 XP</span>
              </div>

              <div className={`quest-item ${recentExpenses.length > 0 ? 'completed' : ''}`}>
                <div>
                  <div className="pixel-font" style={{ fontSize: '0.62rem' }}>
                    {recentExpenses.length > 0 ? '✓' : '○'} FIRST LEDGER
                  </div>
                  <div className="text-muted" style={{ fontSize: '0.9rem' }}>Log an expense with emotion tag</div>
                </div>
                <span className="pixel-badge" style={{ backgroundColor: 'var(--pixel-gold-bg)', color: '#826315' }}>+50 XP</span>
              </div>

              <div className={`quest-item ${flaggedSubs.length > 0 ? '' : 'completed'}`}>
                <div>
                  <div className="pixel-font" style={{ fontSize: '0.62rem' }}>
                    {flaggedSubs.length === 0 ? '✓' : '○'} SUBSCRIPTION SLAYER
                  </div>
                  <div className="text-muted" style={{ fontSize: '0.9rem' }}>Cancel low-value subscriptions</div>
                </div>
                <span className="pixel-badge" style={{ backgroundColor: 'var(--pixel-gold-bg)', color: '#826315' }}>+100 XP</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Expenses Ledger */}
        <div className="col-lg-8">
          <div className="pixel-box h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h6 className="pixel-font mb-1" style={{ color: 'var(--olive)' }}>
                  RECENT LEDGER LOGS
                </h6>
                <div style={{ fontSize: '1rem', color: 'var(--olive-light)' }}>
                  Latest purchases with their life-hour cost and trigger
                </div>
              </div>
              <button
                type="button"
                className="btn-pixel btn-pixel-primary"
                onClick={() => onNavigate('expenses')}
              >
                + LOG EXPENSE
              </button>
            </div>

            {recentExpenses.length === 0 ? (
              <div className="text-center py-4 text-secondary">No ledger entries logged yet.</div>
            ) : (
              <div className="table-responsive">
                <table className="table-pixel">
                  <thead>
                    <tr>
                      <th>DATE</th>
                      <th>ITEM</th>
                      <th>EMOTION</th>
                      <th>COST &amp; HOURS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentExpenses.slice(0, 5).map((exp) => (
                      <tr key={exp.id}>
                        <td>{exp.date}</td>
                        <td>
                          <div className="fw-bold">{exp.title}</div>
                          {exp.description && (
                            <div className="text-muted text-truncate" style={{ maxWidth: '280px', fontSize: '0.95rem' }}>
                              {exp.description}
                            </div>
                          )}
                        </td>
                        <td>
                          <EmotionTag emotion={exp.emotional_state} />
                        </td>
                        <td>
                          <TimeToEarnBadge
                            amount={exp.amount}
                            hours={exp.hours_to_earn}
                            hourlyWage={wage}
                            currency={currency}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
