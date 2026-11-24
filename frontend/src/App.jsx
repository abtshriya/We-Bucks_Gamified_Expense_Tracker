import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import DashboardView from './components/DashboardView';
import ExpensesView from './components/ExpensesView';
import SubscriptionsView from './components/SubscriptionsView';
import SettingsView from './components/SettingsView';
import AlienBot from './components/AlienBot';
import PixelCoinBurst from './components/PixelCoinBurst';
import {
  getSettings,
  updateSettings,
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getSubscriptions,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  rateSubscription,
  getDashboardSummary,
} from './api';

// main application shell
export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [settings, setSettings] = useState({ net_hourly_wage: 600.00, currency_symbol: '₹' });
  const [expenses, setExpenses] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // player xp tracked in local storage
  const [xp, setXp] = useState(() => {
    const saved = localStorage.getItem('we_bucks_xp');
    return saved ? parseInt(saved, 10) : 250;
  });
  const [xpToast, setXpToast] = useState(null);

  // floating coin burst animation state
  const [coinBurst, setCoinBurst] = useState({ show: false, message: '' });

  const triggerCoinBurst = (message) => {
    setCoinBurst({ show: true, message });
    setTimeout(() => {
      setCoinBurst({ show: false, message: '' });
    }, 1500);
  };

  // level up every 100 xp
  const level = Math.floor(xp / 100) + 1;

  // show brief xp popup
  const handleAddXp = (amount) => {
    setXp((prev) => {
      const nextXp = prev + amount;
      localStorage.setItem('we_bucks_xp', nextXp.toString());
      return nextXp;
    });
    setXpToast(`+${amount} XP!`);
    setTimeout(() => setXpToast(null), 2000);
  };

  // pull fresh data from api
  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [settingsData, expensesData, subsData, summaryData] = await Promise.all([
        getSettings(),
        getExpenses(),
        getSubscriptions(),
        getDashboardSummary(),
      ]);

      setSettings(settingsData);
      setExpenses(expensesData);
      setSubscriptions(subsData);
      setSummary(summaryData);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Unable to reach server. Make sure Django is running on port 8000.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // expense handlers
  const handleCreateExpense = async (data) => {
    await createExpense(data);
    await loadData();
    handleAddXp(50);
    triggerCoinBurst('+50 XP · EXPENSE LOGGED!');
  };

  const handleUpdateExpense = async (id, data) => {
    await updateExpense(id, data);
    await loadData();
    triggerCoinBurst('EXPENSE UPDATED!');
  };

  const handleDeleteExpense = async (id) => {
    await deleteExpense(id);
    await loadData();
  };

  // subscription handlers
  const handleCreateSubscription = async (data) => {
    await createSubscription(data);
    await loadData();
    handleAddXp(50);
    triggerCoinBurst('+50 XP · SERVICE ADDED!');
  };

  const handleUpdateSubscription = async (id, data) => {
    await updateSubscription(id, data);
    await loadData();
    if (data.is_active === false) {
      triggerCoinBurst('+100 XP · CURSE SLAIN!');
    }
  };

  const handleDeleteSubscription = async (id) => {
    await deleteSubscription(id);
    await loadData();
  };

  const handleRateSubscription = async (id, ratingData) => {
    await rateSubscription(id, ratingData);
    await loadData();
    handleAddXp(25);
    triggerCoinBurst('+25 XP · APPRAISED!');
  };

  // user settings handler
  const handleUpdateSettings = async (data) => {
    await updateSettings(data);
    await loadData();
    handleAddXp(50);
    triggerCoinBurst('+50 XP · FORGED!');
  };

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: 'var(--pixel-bg)' }}>
      {/* xp toast alert */}
      {xpToast && (
        <div
          className="position-fixed top-0 end-0 m-4 pixel-box-olive p-2 px-3 z-3 animate-bounce"
          style={{ zIndex: 9999, border: '3px solid #000' }}
        >
          <span className="pixel-font" style={{ fontSize: '0.75rem', color: '#fff' }}>
            ★ {xpToast} LEVEL PROGRESS! ★
          </span>
        </div>
      )}

      {/* floating pixel coin and cash burst animation */}
      <PixelCoinBurst show={coinBurst.show} message={coinBurst.message} />

      {/* top navbar with level and stats */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        settings={settings}
        xp={xp}
        level={level}
      />

      {error && (
        <div className="container mt-3">
          <div className="pixel-box-danger p-2 px-3 d-flex justify-content-between align-items-center">
            <span className="pixel-font" style={{ fontSize: '0.65rem' }}>{error}</span>
            <button
              type="button"
              className="btn-pixel btn-pixel-danger"
              style={{ fontSize: '0.55rem' }}
              onClick={loadData}
            >
              RETRY
            </button>
          </div>
        </div>
      )}

      <main className="flex-grow-1">
        {loading ? (
          <div className="d-flex justify-content-center align-items-center py-5">
            <div className="pixel-box p-3 text-center">
              <div className="pixel-font" style={{ fontSize: '0.75rem', color: 'var(--olive)' }}>
                LOADING WE-BUCKS...
              </div>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <DashboardView
                summary={summary}
                recentExpenses={expenses}
                settings={settings}
                onCancelSubscription={(subId) => handleUpdateSubscription(subId, { is_active: false })}
                onNavigate={setActiveTab}
                onAddXp={handleAddXp}
                onUpdateSettings={handleUpdateSettings}
              />
            )}

            {activeTab === 'expenses' && (
              <ExpensesView
                expenses={expenses}
                settings={settings}
                onCreateExpense={handleCreateExpense}
                onUpdateExpense={handleUpdateExpense}
                onDeleteExpense={handleDeleteExpense}
                onAddXp={handleAddXp}
              />
            )}

            {activeTab === 'subscriptions' && (
              <SubscriptionsView
                subscriptions={subscriptions}
                settings={settings}
                onCreateSubscription={handleCreateSubscription}
                onUpdateSubscription={handleUpdateSubscription}
                onDeleteSubscription={handleDeleteSubscription}
                onRateSubscription={handleRateSubscription}
                onAddXp={handleAddXp}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsView
                settings={settings}
                onSave={handleUpdateSettings}
                onAddXp={handleAddXp}
              />
            )}
          </>
        )}
      </main>

      {/* alien navigator companion */}
      <AlienBot
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        expenses={expenses}
        summary={summary}
        currency={settings?.currency_symbol || '₹'}
      />

      <footer className="py-3 text-center border-top bg-white mt-auto border-3 border-dark" style={{ fontSize: '0.82rem' }}>
        <div className="container pixel-font" style={{ fontSize: '0.58rem', color: 'var(--olive)' }}>
          WE-BUCKS &bull; YOUR PERSONAL EXPENSE TRACKER &bull; © 2026
        </div>
      </footer>
    </div>
  );
}
