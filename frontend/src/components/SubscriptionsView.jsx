import React, { useState } from 'react';
import RegretSlider from './RegretSlider';

// recurring subscriptions view and monthly regret ratings
export default function SubscriptionsView({
  subscriptions = [],
  settings,
  onCreateSubscription,
  onUpdateSubscription,
  onDeleteSubscription,
  onRateSubscription,
  onAddXp,
}) {
  const currency = settings?.currency_symbol || '₹';
  const wage = parseFloat(settings?.net_hourly_wage || 600);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    billing_cycle: 'monthly',
    category: 'entertainment',
    is_active: true,
  });

  const activeSubs = subscriptions.filter((s) => s.is_active);
  const totalMonthlySpend = activeSubs.reduce((acc, sub) => {
    const amt = parseFloat(sub.amount) || 0;
    return acc + (sub.billing_cycle === 'monthly' ? amt : amt / 12);
  }, 0);

  const monthlyHours = wage > 0 ? (totalMonthlySpend / wage).toFixed(1) : '0.0';

  const flaggedSubs = activeSubs.filter((s) => s.should_cancel);
  const potentialSavings = flaggedSubs.reduce((acc, sub) => {
    const amt = parseFloat(sub.amount) || 0;
    return acc + (sub.billing_cycle === 'monthly' ? amt : amt / 12);
  }, 0);

  const handleOpenModal = (sub = null) => {
    if (sub) {
      setEditingSub(sub);
      setFormData({
        name: sub.name,
        amount: sub.amount,
        billing_cycle: sub.billing_cycle,
        category: sub.category,
        is_active: sub.is_active,
      });
    } else {
      setEditingSub(null);
      setFormData({
        name: '',
        amount: '',
        billing_cycle: 'monthly',
        category: 'entertainment',
        is_active: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSub(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.amount || parseFloat(formData.amount) <= 0) {
      alert('Please enter a valid service name and amount.');
      return;
    }

    try {
      if (editingSub) {
        await onUpdateSubscription(editingSub.id, formData);
      } else {
        await onCreateSubscription(formData);
        if (onAddXp) onAddXp(50);
      }
      handleCloseModal();
    } catch (err) {
      console.error('Error saving subscription:', err);
      alert(`Error: ${err.message}`);
    }
  };

  const handleToggleActive = async (sub) => {
    const willDeactivate = sub.is_active;
    const msg = willDeactivate
      ? `Cancel subscription to ${sub.name}? This will save ${currency}${sub.amount}/${sub.billing_cycle}.`
      : `Reactivate subscription to ${sub.name}?`;

    if (window.confirm(msg)) {
      await onUpdateSubscription(sub.id, { is_active: !willDeactivate });
      if (willDeactivate && onAddXp) onAddXp(100);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Permanently delete ${name} and purge its rating history?`)) {
      await onDeleteSubscription(id);
    }
  };

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="page-header-card d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div>
          <h4 className="page-title">
            RECURRING SUBSCRIPTIONS
          </h4>
          <div className="page-subtitle">
            Rate your subscriptions 1–10. If you regret paying for 2 months in a row, it's time to cancel!
          </div>
        </div>

        <button
          type="button"
          className="btn-pixel btn-pixel-primary"
          onClick={() => handleOpenModal(null)}
        >
          + ADD SUBSCRIPTION
        </button>
      </div>

      {/* Summary Pixel Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <div className="pixel-box">
            <div className="pixel-font" style={{ fontSize: '0.62rem', color: 'var(--pixel-black)' }}>
              MONTHLY RECURRING COST
            </div>
            <div className="display-6 fw-bold mt-2 mb-1" style={{ fontFamily: 'var(--font-retro)' }}>
              {currency}{totalMonthlySpend.toFixed(2)}/MO
            </div>
            <div className="text-muted" style={{ fontSize: '0.95rem' }}>
              {activeSubs.length} active service{activeSubs.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="pixel-box" style={{ borderLeft: '8px solid var(--pixel-black)' }}>
            <div className="pixel-font" style={{ fontSize: '0.62rem', color: 'var(--pixel-black)' }}>
              MONTHLY LIFE HOURS
            </div>
            <div className="display-6 fw-bold mt-2 mb-1" style={{ color: 'var(--pixel-black)', fontFamily: 'var(--font-retro)' }}>
              {monthlyHours} HRS/MO
            </div>
            <div className="text-muted" style={{ fontSize: '0.95rem' }}>
              At {currency}{wage.toFixed(0)}/h net rate
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="pixel-box" style={{ borderLeft: flaggedSubs.length > 0 ? '8px solid var(--pixel-red)' : '' }}>
            <div className="pixel-font" style={{ fontSize: '0.62rem', color: flaggedSubs.length > 0 ? 'var(--pixel-red)' : 'var(--pixel-black)' }}>
              SUBSCRIPTIONS TO CANCEL
            </div>
            <div className={`display-6 fw-bold mt-2 mb-1 ${flaggedSubs.length > 0 ? 'text-danger' : 'text-dark'}`} style={{ fontFamily: 'var(--font-retro)' }}>
              {flaggedSubs.length}
            </div>
            <div className="text-muted" style={{ fontSize: '0.95rem' }}>
              {flaggedSubs.length > 0 ? (
                <span className="text-danger fw-bold">
                  Save {currency}{potentialSavings.toFixed(2)}/mo by cancelling
                </span>
              ) : (
                <span>Zero low-rated subscriptions!</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Subscription Item Cards */}
      {subscriptions.length === 0 ? (
        <div className="pixel-box text-center py-5 text-secondary">
          <p className="mb-3">No recurring services in your inventory yet.</p>
          <button
            type="button"
            className="btn-pixel btn-pixel-secondary"
            onClick={() => handleOpenModal(null)}
          >
            ADD FIRST SUBSCRIPTION
          </button>
        </div>
      ) : (
        <div className="row g-4">
          {subscriptions.map((sub) => {
            const isFlagged = sub.should_cancel && sub.is_active;
            const subHours = wage > 0 ? (parseFloat(sub.amount) / wage).toFixed(1) : '0.0';

            return (
              <div key={sub.id} className="col-12 col-lg-6">
                <div
                  className={`pixel-box h-100 ${isFlagged ? 'pixel-box-danger' : ''}`}
                >
                  {/* Aggressive Cursed Warning Banner */}
                  {isFlagged && (
                    <div
                      className="p-2 border border-2 border-danger mb-3 d-flex flex-wrap align-items-center justify-content-between gap-2"
                      style={{ backgroundColor: '#fff' }}
                    >
                      <div>
                        <span className="pixel-badge" style={{ backgroundColor: 'var(--pixel-red)', color: '#fff' }}>
                          CURSED DROP
                        </span>
                        <div className="small fw-bold text-danger mt-1">
                          Rated under 4 for {sub.consecutive_low_count} consecutive months!
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn-pixel btn-pixel-danger"
                        style={{ fontSize: '0.55rem' }}
                        onClick={() => handleToggleActive(sub)}
                      >
                        SLAY &amp; CANCEL
                      </button>
                    </div>
                  )}

                  {/* Header */}
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <div className="d-flex align-items-center gap-2">
                        <span className="pixel-font text-truncate" style={{ fontSize: '0.82rem', color: 'var(--olive)' }}>
                          {sub.name}
                        </span>
                        {!sub.is_active && (
                          <span className="pixel-badge" style={{ backgroundColor: '#ddd', color: '#666' }}>
                            SLAIN / CANCELLED
                          </span>
                        )}
                      </div>
                      <div className="text-secondary small mt-1">
                        {sub.category_display || sub.category} · {sub.billing_cycle}
                      </div>
                    </div>

                    <div className="text-end">
                      <div className="fs-4 fw-bold" style={{ fontFamily: 'var(--font-retro)' }}>
                        {currency}{parseFloat(sub.amount).toFixed(2)}
                      </div>
                      <div className="pixel-badge" style={{ backgroundColor: 'var(--sage-soft)', color: 'var(--olive)' }}>
                        {subHours}h WORK
                      </div>
                    </div>
                  </div>

                  {/* Rating History */}
                  <div className="my-2 border-top border-bottom border-1 border-dark py-1">
                    <span className="pixel-font me-2" style={{ fontSize: '0.55rem' }}>
                      HISTORY:
                    </span>
                    {sub.ratings && sub.ratings.length > 0 ? (
                      <div className="d-inline-flex flex-wrap gap-1">
                        {sub.ratings.slice(0, 4).map((r) => {
                          const isLow = r.value_score < 4;
                          return (
                            <span
                              key={r.id || r.rating_month}
                              className="pixel-badge"
                              style={{
                                backgroundColor: isLow ? 'var(--pixel-red-bg)' : 'var(--sage-soft)',
                                color: isLow ? 'var(--pixel-red)' : 'var(--olive)',
                                borderColor: isLow ? 'var(--pixel-red)' : 'var(--pixel-black)',
                              }}
                              data-tooltip={r.notes || `${r.rating_month} score: ${r.value_score} out of 10`}
                            >
                              {r.rating_month}: {r.value_score}/10
                            </span>
                          );
                        })}
                      </div>
                    ) : (
                      <span className="text-muted" style={{ fontSize: '0.9rem' }}>
                        No monthly reviews yet
                      </span>
                    )}
                  </div>

                  {/* Value vs Regret Slider */}
                  <div className="pt-2">
                    <RegretSlider
                      subscriptionId={sub.id}
                      initialScore={sub.latest_score || 5}
                      onSave={async (ratingData) => {
                        await onRateSubscription(sub.id, ratingData);
                        if (onAddXp) onAddXp(25);
                      }}
                    />
                  </div>

                  {/* Actions */}
                  <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top border-2 border-dark">
                    <button
                      type="button"
                      className={`btn-pixel ${sub.is_active ? 'btn-pixel-danger' : 'btn-pixel-secondary'}`}
                      style={{ fontSize: '0.55rem' }}
                      onClick={() => handleToggleActive(sub)}
                    >
                      {sub.is_active ? 'CANCEL SERVICE' : 'RE-EQUIP'}
                    </button>

                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="btn-pixel btn-pixel-light"
                        style={{ fontSize: '0.55rem' }}
                        onClick={() => handleOpenModal(sub)}
                      >
                        EDIT
                      </button>
                      <button
                        type="button"
                        className="btn-pixel btn-pixel-danger"
                        style={{ fontSize: '0.55rem' }}
                        onClick={() => handleDelete(sub.id, sub.name)}
                      >
                        PURGE
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="pixel-modal-backdrop" onClick={handleCloseModal}>
          <div className="pixel-modal-window" onClick={(e) => e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-center mb-3 border-bottom border-2 border-dark pb-2">
              <h5 className="pixel-font mb-0" style={{ color: 'var(--olive)' }}>
                {editingSub ? 'EDIT RECURRING ITEM' : 'ADD RECURRING ITEM'}
              </h5>
              <button
                type="button"
                className="btn-pixel btn-pixel-danger"
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.65rem' }}
                onClick={handleCloseModal}
              >
                X
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="pixel-font small d-block mb-1" style={{ fontSize: '0.6rem' }}>
                  SERVICE NAME
                </label>
                <input
                  type="text"
                  required
                  className="form-control"
                  placeholder="e.g. Cult.fit, Netflix, Swiggy One"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="pixel-font small d-block mb-1" style={{ fontSize: '0.6rem' }}>
                    COST ({currency})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    className="form-control fw-bold"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>

                <div className="col-6">
                  <label className="pixel-font small d-block mb-1" style={{ fontSize: '0.6rem' }}>
                    BILLING CYCLE
                  </label>
                  <select
                    className="form-select"
                    value={formData.billing_cycle}
                    onChange={(e) => setFormData({ ...formData, billing_cycle: e.target.value })}
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="pixel-font small d-block mb-1" style={{ fontSize: '0.6rem' }}>
                  CATEGORY
                </label>
                <select
                  className="form-select"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="entertainment">Entertainment</option>
                  <option value="utilities">Bills &amp; Utilities</option>
                  <option value="health">Health &amp; Fitness</option>
                  <option value="shopping">Shopping</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="d-flex justify-content-end gap-2 border-top border-2 border-dark pt-3">
                <button type="button" className="btn-pixel btn-pixel-light" onClick={handleCloseModal}>
                  CANCEL
                </button>
                <button type="submit" className="btn-pixel btn-pixel-primary px-3">
                  {editingSub ? 'SAVE SUBSCRIPTION' : '+ ADD SUBSCRIPTION'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
