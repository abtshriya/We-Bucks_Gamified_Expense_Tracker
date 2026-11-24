import React, { useState } from 'react';

// pixel alien companion that helps navigate and reacts to impulse spending
export default function AlienBot({
  activeTab,
  setActiveTab,
  expenses = [],
  summary,
  settings,
  currency = '₹',
}) {
  // toggle speech bubble
  const [isOpen, setIsOpen] = useState(true);

  // user display name
  const displayName = settings?.user_name || 'Saver';

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

  // page-specific quick instructions from Zog
  const getInstructions = () => {
    if (isAngry) {
      return {
        title: '⚠️ IMPULSE SPEND ALERT',
        badge: 'ACTION NEEDED',
        badgeBg: 'var(--pixel-red)',
        mainText: latestExpense?.emotional_state === 'impulsive'
          ? `GAAAH! You spent ${currency}${latestExpense?.amount} on "${latestExpense?.title}" as an IMPULSE buy!`
          : `ALERT! High emotional spending detected on recent purchases!`,
        tips: [
          'Pause Rule: Wait 24 to 48 hours before buying non-essentials.',
          'Check Life-Hours: Ask yourself if this item is worth the work hours.',
          'Identify Triggers: Notice if stress or boredom prompted the purchase.',
        ],
      };
    }

    switch (activeTab) {
      case 'dashboard':
        return {
          title: 'DASHBOARD GUIDE',
          badge: 'OVERVIEW',
          badgeBg: '#588157',
          mainText: `Welcome back, ${displayName}! Quick guide to your financial hub:`,
          tips: [
            'Spendable Balance: Safe money left after upcoming recurring bills.',
            'Available Balance: Click "✎ UPDATE BALANCE" to sync your bank funds.',
            'Emotional Spend: See which feelings (Stress, Boredom) cost you most.',
            'Life-Hours Simulator: Test potential big buys against working hours below.',
          ],
        };
      case 'expenses':
        return {
          title: 'EXPENSES GUIDE',
          badge: 'TRACKING',
          badgeBg: '#588157',
          mainText: 'How to manage your personal expense ledger:',
          tips: [
            'Log Purchases: Click "+ LOG EXPENSE" to record any new transaction.',
            'Tag Emotion: Always pick how you felt (Stressed, Hungry, Bored, etc.).',
            'Life-Hours: Notice how many hours of work each purchase required.',
            'Filter & Search: Use the search bar above to look up past logs.',
          ],
        };
      case 'subscriptions':
        return {
          title: 'SUBSCRIPTIONS GUIDE',
          badge: 'REGRET SLIDER',
          badgeBg: '#588157',
          mainText: 'How to monitor and eliminate recurring money drains:',
          tips: [
            'Add Services: Click "+ ADD SUBSCRIPTION" for streaming, apps, or gym.',
            'Rate 1–10: Use the Regret Slider every month to rate its value.',
            'Cancel Warning: Services rated < 4 for 2 months get flagged to cancel!',
            'Recover Cash: Slaying unused subscriptions boosts your spendable money.',
          ],
        };
      case 'settings':
        return {
          title: 'SETTINGS GUIDE',
          badge: 'CONFIG',
          badgeBg: '#588157',
          mainText: 'Set your foundational financial baselines here:',
          tips: [
            'Hourly Rate: Set your net take-home pay to calculate real work-hours.',
            'Starting Treasury: Set your initial liquid bank & wallet balance.',
            'Currency Symbol: Choose your preferred currency (₹, $, €, £, etc.).',
            'Clean Slate: Use the reset button at the bottom to start fresh anytime.',
          ],
        };
      default:
        return {
          title: 'BUDGET CO-PILOT',
          badge: 'ZOG TIPS',
          badgeBg: '#588157',
          mainText: 'Welcome to We-Bucks! Quick tips for your financial journey:',
          tips: [
            'Dashboard: See your live spendable balance and emotional triggers.',
            'Expenses: Log daily purchases with life-hours and emotion tags.',
            'Subscriptions: Rate recurring bills with the 1-10 Regret Slider.',
          ],
        };
    }
  };

  const info = getInstructions();

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
            width: '320px',
            maxWidth: 'calc(100vw - 40px)',
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
                  backgroundColor: info.badgeBg,
                  color: '#FFFFFF',
                  fontSize: '0.52rem',
                }}
              >
                {isAngry ? '💢 ZOG (ALERT)' : `🛸 ZOG (${info.badge})`}
              </span>
            </div>
            <button
              type="button"
              className="btn-pixel btn-pixel-light"
              style={{ fontSize: '0.55rem', padding: '0.1rem 0.35rem', lineHeight: '1' }}
              onClick={() => setIsOpen(false)}
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* Section Title */}
          <div
            className="pixel-font mb-1"
            style={{
              fontSize: '0.66rem',
              color: isAngry ? 'var(--pixel-red)' : 'var(--pixel-black)',
            }}
          >
            {info.title}
          </div>

          {/* Intro text */}
          <p
            className="mb-2"
            style={{
              fontSize: '1rem',
              color: isAngry ? '#780000' : 'var(--pixel-black)',
              lineHeight: '1.3',
              fontFamily: 'var(--font-retro)',
            }}
          >
            {info.mainText}
          </p>

          {/* Page-Specific Quick Instructions */}
          <div className="border-top border-2 border-dark pt-2">
            <div
              className="pixel-font text-muted mb-1"
              style={{ fontSize: '0.52rem' }}
            >
              WHAT TO DO ON THIS PAGE:
            </div>
            <ul
              className="list-unstyled mb-0 d-flex flex-column gap-1"
              style={{
                fontSize: '1.05rem',
                fontFamily: 'var(--font-retro)',
                lineHeight: '1.3',
              }}
            >
              {info.tips.map((tip, idx) => (
                <li key={idx} className="d-flex align-items-start gap-1">
                  <span style={{ color: isAngry ? 'var(--pixel-red)' : 'var(--pixel-black)', fontWeight: 'bold' }}>▸</span>
                  <span style={{ color: 'var(--pixel-black)' }}>{tip}</span>
                </li>
              ))}
            </ul>
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
