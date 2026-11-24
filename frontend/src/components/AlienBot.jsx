import React, { useState } from 'react';

// pixel alien companion that helps navigate and reacts to impulse spending
export default function AlienBot({
  activeTab,
  setActiveTab,
  expenses = [],
  summary,
  currency = '₹',
}) {
  // toggle speech bubble
  const [isOpen, setIsOpen] = useState(true);

  // check if recent spend or top boss is an impulse purchase
  const latestExpense = expenses && expenses.length > 0 ? expenses[0] : null;
  const topEmotion = summary?.emotional_breakdown?.[0]?.emotion;

  const isLatestUnwanted =
    latestExpense &&
    (latestExpense.emotional_state === 'impulsive' ||
     latestExpense.emotional_state === 'bored' ||
     latestExpense.emotional_state === 'peer_pressured');

  const isTopBossUnwanted =
    topEmotion === 'impulsive' ||
    topEmotion === 'bored' ||
    topEmotion === 'peer_pressured';

  // turns angry red on unwanted expenses
  const isAngry = isLatestUnwanted || isTopBossUnwanted;

  // dialogue based on mood and current tab
  const getDialogue = () => {
    if (isAngry) {
      if (latestExpense?.emotional_state === 'impulsive') {
        return `GAAAH! ${currency}${latestExpense.amount} on "${latestExpense.title}"?! That was an IMPULSE buy! Control your budget, human! 💢`;
      }
      return `ALERT! High emotional spending detected! Stop making impulse purchases! 💢`;
    }

    switch (activeTab) {
      case 'dashboard':
        return 'All green, Commander! Check your Treasury Balance vault above. Where to next?';
      case 'expenses':
        return 'Every expense logged tracks the real hours of work it cost you. Where to next?';
      case 'subscriptions':
        return 'Check your recurring subscriptions! Cancelling unused services saves real cash.';
      case 'settings':
        return 'Tuning your hourly wage updates all life-hours across the entire galaxy!';
      default:
        return 'I am Zog, your budget co-pilot! Welcome to We-Bucks! Click any button below to navigate.';
    }
  };

  // theme colors: angry red vs friendly green
  const alienMainColor = isAngry ? '#E63946' : '#588157';
  const alienAccentColor = isAngry ? '#A61C26' : '#3A5A40';
  const alienEyeColor = isAngry ? '#FFE3E3' : '#FFFFFF';
  const alienPupilColor = isAngry ? '#780000' : '#1B4332';

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 1050,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
      }}
    >
      {/* dialogue bubble */}
      {isOpen && (
        <div
          className="pixel-box mb-2 p-3"
          style={{
            maxWidth: '300px',
            backgroundColor: isAngry ? '#FFF0F0' : '#FFFFFF',
            borderColor: isAngry ? '#E63946' : '#0E140F',
            boxShadow: isAngry ? '4px 4px 0px #A61C26' : '4px 4px 0px #0E140F',
          }}
        >
          {/* status bar */}
          <div className="d-flex justify-content-between align-items-center border-bottom border-2 border-dark pb-1 mb-2">
            <div className="d-flex align-items-center gap-1">
              <span
                className="pixel-badge"
                style={{
                  backgroundColor: isAngry ? '#E63946' : '#588157',
                  color: '#FFFFFF',
                  fontSize: '0.52rem',
                }}
              >
                {isAngry ? '💢 ANGRY ALIEN (ALERT)' : '🛸 ZOG (NAVIGATOR)'}
              </span>
            </div>
            <button
              type="button"
              className="btn-pixel btn-pixel-light"
              style={{ fontSize: '0.5rem', padding: '0.1rem 0.35rem' }}
              onClick={() => setIsOpen(false)}
            >
              _
            </button>
          </div>

          {/* dialogue text */}
          <p
            className="mb-2"
            style={{
              fontSize: '0.92rem',
              color: isAngry ? '#900C3F' : '#2D3748',
              lineHeight: '1.25',
              fontWeight: isAngry ? 'bold' : 'normal',
            }}
          >
            {getDialogue()}
          </p>

          {/* teleport navigation buttons */}
          <div className="border-top border-2 border-dark pt-2">
            <div
              className="pixel-font text-muted mb-1"
              style={{ fontSize: '0.52rem' }}
            >
              TELEPORT TO:
            </div>
            <div className="d-flex flex-wrap gap-1">
              <button
                type="button"
                className={`btn-pixel ${activeTab === 'dashboard' ? 'btn-pixel-primary' : 'btn-pixel-light'}`}
                style={{ fontSize: '0.52rem', padding: '0.25rem 0.45rem' }}
                onClick={() => setActiveTab('dashboard')}
              >
                📊 Dashboard
              </button>
              <button
                type="button"
                className={`btn-pixel ${activeTab === 'expenses' ? 'btn-pixel-primary' : 'btn-pixel-light'}`}
                style={{ fontSize: '0.52rem', padding: '0.25rem 0.45rem' }}
                onClick={() => setActiveTab('expenses')}
              >
                💸 Expenses
              </button>
              <button
                type="button"
                className={`btn-pixel ${activeTab === 'subscriptions' ? 'btn-pixel-primary' : 'btn-pixel-light'}`}
                style={{ fontSize: '0.52rem', padding: '0.25rem 0.45rem' }}
                onClick={() => setActiveTab('subscriptions')}
              >
                🔄 Subs
              </button>
              <button
                type="button"
                className={`btn-pixel ${activeTab === 'settings' ? 'btn-pixel-primary' : 'btn-pixel-light'}`}
                style={{ fontSize: '0.52rem', padding: '0.25rem 0.45rem' }}
                onClick={() => setActiveTab('settings')}
              >
                ⚙️ Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* clickable pixel alien avatar */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          cursor: 'pointer',
          padding: '6px',
          backgroundColor: isAngry ? '#FFEAEA' : '#E8EFE9',
          border: `3px solid ${isAngry ? '#E63946' : '#0E140F'}`,
          boxShadow: isAngry ? '4px 4px 0px #A61C26' : '4px 4px 0px #0E140F',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          userSelect: 'none',
          transition: 'transform 0.1s ease',
        }}
        data-tooltip={isOpen ? 'Click to minimize Zog' : 'Click to ask Zog for tips'}
      >
        {/* 16x16 pixel alien sprite */}
        <svg
          width="44"
          height="44"
          viewBox="0 0 16 16"
          style={{ shapeRendering: 'crispEdges', display: 'block' }}
        >
          {/* antenna stalks */}
          <rect x="3" y="1" width="2" height="2" fill={isAngry ? '#FF0055' : '#88D49E'} />
          <rect x="11" y="1" width="2" height="2" fill={isAngry ? '#FF0055' : '#88D49E'} />
          <rect x="4" y="3" width="1" height="2" fill={alienAccentColor} />
          <rect x="11" y="3" width="1" height="2" fill={alienAccentColor} />

          {/* head & ears */}
          <rect x="2" y="5" width="12" height="7" fill={alienMainColor} />
          <rect x="1" y="6" width="1" height="4" fill={alienAccentColor} />
          <rect x="14" y="6" width="1" height="4" fill={alienAccentColor} />
          <rect x="3" y="5" width="10" height="1" fill={alienAccentColor} />

          {/* eyes */}
          <rect x="4" y="7" width="3" height="3" fill={alienEyeColor} />
          <rect x="9" y="7" width="3" height="3" fill={alienEyeColor} />

          {/* pupils & brows */}
          {isAngry ? (
            <>
              <rect x="4" y="6" width="3" height="1" fill="#780000" />
              <rect x="9" y="6" width="3" height="1" fill="#780000" />
              <rect x="5" y="8" width="2" height="2" fill={alienPupilColor} />
              <rect x="9" y="8" width="2" height="2" fill={alienPupilColor} />
            </>
          ) : (
            <>
              <rect x="5" y="8" width="2" height="2" fill={alienPupilColor} />
              <rect x="10" y="8" width="2" height="2" fill={alienPupilColor} />
              <rect x="4" y="7" width="1" height="1" fill="#FFFFFF" />
              <rect x="9" y="7" width="1" height="1" fill="#FFFFFF" />
            </>
          )}

          {/* mouth */}
          {isAngry ? (
            <>
              <rect x="6" y="11" width="4" height="1" fill="#FFFFFF" />
              <rect x="7" y="10" width="2" height="1" fill="#500000" />
            </>
          ) : (
            <>
              <rect x="7" y="11" width="2" height="1" fill="#1B4332" />
              <rect x="6" y="10" width="1" height="1" fill="#1B4332" />
              <rect x="9" y="10" width="1" height="1" fill="#1B4332" />
            </>
          )}

          {/* feet */}
          <rect x="4" y="12" width="8" height="2" fill={alienAccentColor} />
          <rect x="2" y="14" width="3" height="2" fill={alienMainColor} />
          <rect x="7" y="14" width="2" height="2" fill={alienMainColor} />
          <rect x="11" y="14" width="3" height="2" fill={alienMainColor} />
        </svg>

        {/* badge label */}
        <div className="d-none d-sm-block">
          <div
            className="pixel-font"
            style={{
              fontSize: '0.55rem',
              color: isAngry ? '#E63946' : 'var(--pixel-black)',
              lineHeight: 1,
            }}
          >
            {isAngry ? 'ZOG (MAD!)' : 'ZOG'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#162415' }}>
            {isOpen ? 'Click to close' : 'Click to open'}
          </div>
        </div>
      </div>
    </div>
  );
}
