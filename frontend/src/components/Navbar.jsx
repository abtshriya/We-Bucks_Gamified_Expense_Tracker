import React from 'react';
import logo from '../assets/logo.png';
import { PixelCoin } from './PixelCoinBurst';

// top navigation and player level bar
export default function Navbar({ activeTab, setActiveTab, settings, xp = 350, level = 3 }) {
  const wage = parseFloat(settings?.net_hourly_wage || 600).toFixed(0);
  const currency = settings?.currency_symbol || '₹';

  const xpCurrent = xp % 100;
  const xpPercent = Math.min(100, Math.max(0, xpCurrent));

  const tabs = [
    { key: 'dashboard', label: 'DASHBOARD' },
    { key: 'expenses', label: 'EXPENSES' },
    { key: 'subscriptions', label: 'SUBSCRIPTIONS' },
    { key: 'settings', label: 'SETTINGS' },
  ];

  return (
    <header className="bg-white border-bottom py-2 sticky-top" style={{ borderColor: 'var(--pixel-black)', borderWidth: '3px' }}>
      <div className="container d-flex flex-wrap align-items-center justify-content-between gap-2">
        {/* app logo and title */}
        <div
          className="d-flex align-items-center gap-2"
          style={{ cursor: 'pointer' }}
          onClick={() => setActiveTab('dashboard')}
        >
          <img
            src={logo}
            alt="We-Bucks Logo"
            style={{ width: '42px', height: '42px', objectFit: 'contain' }}
          />
          <div>
            <div className="pixel-font" style={{ fontSize: '1.05rem', color: 'var(--olive)' }}>
              WE-BUCKS
            </div>
            <div className="pixel-font" style={{ fontSize: '0.52rem', color: 'var(--sage-dark)' }}>
              GAMIFIED EXPENSE TRACKER
            </div>
          </div>
        </div>

        {/* navigation buttons */}
        <nav className="d-flex align-items-center gap-2 my-1 my-md-0">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                className={`btn-pixel ${isActive ? 'btn-pixel-primary' : 'btn-pixel-light'}`}
                style={{ fontSize: '0.62rem', padding: '0.45rem 0.65rem' }}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* player level and hourly rate shortcut */}
        <div className="d-flex align-items-center gap-3">
          <div className="d-none d-lg-block text-end">
            <div className="pixel-font d-flex align-items-center justify-content-end gap-1" style={{ fontSize: '0.58rem', color: 'var(--olive)' }}>
              <span className="pixel-coin-spin"><PixelCoin size={12} /></span>
              <span>LVL {level} SAVER · {xpCurrent}/100 XP</span>
            </div>
            <div className="pixel-bar-container mt-1" style={{ width: '110px', height: '10px' }}>
              <div className="pixel-bar-fill-xp" style={{ width: `${xpPercent}%` }} />
            </div>
          </div>

          <button
            type="button"
            className="btn-pixel btn-pixel-secondary"
            data-tooltip-pos="bottom"
            data-tooltip={`Your hourly rate: ${currency}${wage}/hr`}
            onClick={() => setActiveTab('settings')}
          >
            RATE: {currency}{wage}/H
          </button>
        </div>
      </div>
    </header>
  );
}
