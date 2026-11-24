import React from 'react';
import logo from '../assets/logo.png';
import { PixelCoin } from './PixelCoinBurst';

export default function Navbar({ activeTab, setActiveTab, settings, summary, xp = 0, level = 1 }) {
  const wage = parseFloat(settings?.net_hourly_wage || 600).toFixed(0);
  const currency = settings?.currency_symbol || '₹';
  const availableBal = summary?.available_balance !== undefined
    ? parseFloat(summary.available_balance)
    : (parseFloat(settings?.available_balance) || 50000);

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
            <div className="pixel-font" style={{ fontSize: '1.05rem', color: 'var(--pixel-black)' }}>
              WE-BUCKS
            </div>
            <div className="pixel-font" style={{ fontSize: '0.52rem', color: 'var(--pixel-black)' }}>
              YOUR PERSONAL EXPENSE TRACKER
            </div>
          </div>
        </div>

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

        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn-pixel btn-pixel-light d-flex align-items-center gap-1"
            data-tooltip-pos="bottom"
            data-tooltip={`Available liquid balance: ${currency}${availableBal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <span className="pixel-coin-spin"><PixelCoin size={13} /></span>
            <span>BAL: {currency}{availableBal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
          </button>

          <div className="d-none d-lg-block text-end">
            <div className="pixel-font d-flex align-items-center justify-content-end gap-1" style={{ fontSize: '0.58rem', color: 'var(--pixel-black)' }}>
              <span>{settings?.user_name ? `${settings.user_name.toUpperCase()} · ` : ''}LVL {level} · {xpCurrent}/100 XP</span>
            </div>
            <div className="pixel-bar-container mt-1" style={{ width: '90px', height: '10px' }}>
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
