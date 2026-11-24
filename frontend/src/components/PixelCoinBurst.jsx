import React from 'react';

export function PixelCoin({ size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 12 12"
      style={{ shapeRendering: 'crispEdges', display: 'inline-block' }}
    >
      <rect x="3" y="1" width="6" height="1" fill="#0E140F" />
      <rect x="3" y="10" width="6" height="1" fill="#0E140F" />
      <rect x="1" y="3" width="1" height="6" fill="#0E140F" />
      <rect x="10" y="3" width="1" height="6" fill="#0E140F" />
      <rect x="2" y="2" width="1" height="1" fill="#0E140F" />
      <rect x="9" y="2" width="1" height="1" fill="#0E140F" />
      <rect x="2" y="9" width="1" height="1" fill="#0E140F" />
      <rect x="9" y="9" width="1" height="1" fill="#0E140F" />

      <rect x="3" y="2" width="6" height="8" fill="#F4C430" />
      <rect x="2" y="3" width="8" height="6" fill="#F4C430" />

      <rect x="3" y="3" width="2" height="2" fill="#FFF275" />
      <rect x="3" y="5" width="1" height="2" fill="#FFF275" />

      <rect x="5" y="4" width="3" height="1" fill="#826315" />
      <rect x="5" y="6" width="3" height="1" fill="#826315" />
      <rect x="6" y="5" width="1" height="3" fill="#826315" />
      <rect x="7" y="7" width="1" height="1" fill="#826315" />
    </svg>
  );
}

export function PixelCash({ width = 24, height = 14 }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 16 10"
      style={{ shapeRendering: 'crispEdges', display: 'inline-block' }}
    >
      <rect x="1" y="0" width="14" height="1" fill="#0E140F" />
      <rect x="1" y="9" width="14" height="1" fill="#0E140F" />
      <rect x="0" y="1" width="1" height="8" fill="#0E140F" />
      <rect x="15" y="1" width="1" height="8" fill="#0E140F" />

      <rect x="1" y="1" width="14" height="8" fill="#8BA890" />
      <rect x="2" y="2" width="12" height="6" fill="#C2D4C5" />

      <rect x="7" y="3" width="3" height="1" fill="#3D5038" />
      <rect x="7" y="5" width="3" height="1" fill="#3D5038" />
      <rect x="8" y="4" width="1" height="3" fill="#3D5038" />
      <rect x="9" y="6" width="1" height="1" fill="#3D5038" />

      <rect x="2" y="2" width="1" height="1" fill="#3D5038" />
      <rect x="13" y="2" width="1" height="1" fill="#3D5038" />
      <rect x="2" y="7" width="1" height="1" fill="#3D5038" />
      <rect x="13" y="7" width="1" height="1" fill="#3D5038" />
    </svg>
  );
}

export default function PixelCoinBurst({ show, message = '+50 XP!' }) {
  if (!show) return null;

  const particles = [
    { id: 1, type: 'coin', left: -45, delay: 0 },
    { id: 2, type: 'cash', left: -20, delay: 0.1 },
    { id: 3, type: 'coin', left: 0, delay: 0.05 },
    { id: 4, type: 'cash', left: 25, delay: 0.15 },
    { id: 5, type: 'coin', left: 50, delay: 0.08 },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        top: '40%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 99999,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div style={{ position: 'relative', width: '120px', height: '60px' }}>
        {particles.map((p) => (
          <div
            key={p.id}
            className="pixel-coin-float"
            style={{
              position: 'absolute',
              bottom: '0',
              left: `calc(50% + ${p.left}px)`,
              animationDelay: `${p.delay}s`,
            }}
          >
            {p.type === 'coin' ? <PixelCoin size={26} /> : <PixelCash width={32} height={18} />}
          </div>
        ))}
      </div>

      <div
        className="pixel-box-olive px-3 py-1 mt-1 text-center"
        style={{
          border: '3px solid #0E140F',
          boxShadow: '4px 4px 0px #0E140F',
          animation: 'pixel-pop 0.3s ease-out',
        }}
      >
        <span className="pixel-font" style={{ fontSize: '0.72rem', color: '#FFFFFF' }}>
          🪙 {message} 💵
        </span>
      </div>
    </div>
  );
}
