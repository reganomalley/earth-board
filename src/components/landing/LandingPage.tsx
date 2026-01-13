import { useState, useEffect } from 'react';

interface LandingPageProps {
  onEnter: () => void;
}

export default function LandingPage({ onEnter }: LandingPageProps) {
  const [fadeOut, setFadeOut] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleEnter = () => {
    setFadeOut(true);
    setTimeout(() => {
      onEnter();
    }, 1200);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 50,
        opacity: fadeOut ? 0 : 1,
        transform: fadeOut ? 'scale(1.1)' : 'scale(1)',
        transition: 'opacity 1200ms ease-out, transform 1200ms ease-out',
        overflow: 'hidden',
      }}
    >
      {/* Video background - aerial sheep */}
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          minWidth: '100%',
          minHeight: '100%',
          width: 'auto',
          height: 'auto',
          transform: 'translate(-50%, -50%)',
          objectFit: 'cover',
        }}
      >
        <source src="/aerial-animals.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay for readability */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.55) 100%)',
        }}
      />

      {/* Subtle guide text that fades away */}
      <div
        style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 15,
          opacity: showContent ? 0 : 1,
          transition: 'opacity 2s',
          pointerEvents: 'none',
        }}
      >
        <p
          style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontSize: '1.5rem',
            fontStyle: 'normal',
            color: 'rgba(255,255,255,0.9)',
            textShadow: '0 2px 8px rgba(0,0,0,0.8)',
            letterSpacing: '0.1em',
          }}
        >
          follow the herd...
        </p>
      </div>

      {/*
        TO USE YOUR OWN AI-GENERATED IMAGE:

        1. Generate an aerial nature image using:
           - Midjourney, DALL-E 3, or Leonardo.ai

        2. Prompt example:
           "Aerial drone photography of sheep grazing on rolling green hills,
           birds eye view, moody earth tones, cinematic lighting,
           Terry Evans nature photography style, ultra realistic 8k"

        3. Save the image to: /public/landing.jpg

        4. Replace the URL above with: url('/landing.jpg')
      */}

      {/* Subtle vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 100%)',
        }}
      />

      {/* Animated animals moving across the landscape */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Sheep herd from left */}
        <div className="absolute" style={{ top: '25%', left: '-10%', animation: 'moveRight 20s linear infinite' }}>
          <svg width="60" height="40" viewBox="0 0 60 40" fill="none" opacity="0.8">
            <ellipse cx="30" cy="25" rx="20" ry="15" fill="#E8E8E8"/>
            <circle cx="30" cy="18" r="12" fill="#F5F5F5"/>
            <rect x="25" y="30" width="3" height="8" fill="#D0D0D0"/>
            <rect x="32" y="30" width="3" height="8" fill="#D0D0D0"/>
          </svg>
        </div>
        <div className="absolute" style={{ top: '28%', left: '-10%', animation: 'moveRight 22s linear infinite', animationDelay: '2s' }}>
          <svg width="60" height="40" viewBox="0 0 60 40" fill="none" opacity="0.7">
            <ellipse cx="30" cy="25" rx="20" ry="15" fill="#E8E8E8"/>
            <circle cx="30" cy="18" r="12" fill="#F5F5F5"/>
            <rect x="25" y="30" width="3" height="8" fill="#D0D0D0"/>
            <rect x="32" y="30" width="3" height="8" fill="#D0D0D0"/>
          </svg>
        </div>
        <div className="absolute" style={{ top: '23%', left: '-10%', animation: 'moveRight 24s linear infinite', animationDelay: '4s' }}>
          <svg width="60" height="40" viewBox="0 0 60 40" fill="none" opacity="0.6">
            <ellipse cx="30" cy="25" rx="20" ry="15" fill="#E8E8E8"/>
            <circle cx="30" cy="18" r="12" fill="#F5F5F5"/>
            <rect x="25" y="30" width="3" height="8" fill="#D0D0D0"/>
            <rect x="32" y="30" width="3" height="8" fill="#D0D0D0"/>
          </svg>
        </div>

        {/* Sheep herd from right */}
        <div className="absolute" style={{ top: '70%', right: '-10%', animation: 'moveLeft 18s linear infinite' }}>
          <svg width="60" height="40" viewBox="0 0 60 40" fill="none" opacity="0.7" transform="scale(-1,1)">
            <ellipse cx="30" cy="25" rx="20" ry="15" fill="#E8E8E8"/>
            <circle cx="30" cy="18" r="12" fill="#F5F5F5"/>
            <rect x="25" y="30" width="3" height="8" fill="#D0D0D0"/>
            <rect x="32" y="30" width="3" height="8" fill="#D0D0D0"/>
          </svg>
        </div>
        <div className="absolute" style={{ top: '68%', right: '-10%', animation: 'moveLeft 20s linear infinite', animationDelay: '3s' }}>
          <svg width="60" height="40" viewBox="0 0 60 40" fill="none" opacity="0.8" transform="scale(-1,1)">
            <ellipse cx="30" cy="25" rx="20" ry="15" fill="#E8E8E8"/>
            <circle cx="30" cy="18" r="12" fill="#F5F5F5"/>
            <rect x="25" y="30" width="3" height="8" fill="#D0D0D0"/>
            <rect x="32" y="30" width="3" height="8" fill="#D0D0D0"/>
          </svg>
        </div>

        {/* Birds flying across */}
        <div className="absolute" style={{ top: '15%', left: '-5%', animation: 'flyAcross 25s linear infinite' }}>
          <svg width="40" height="30" viewBox="0 0 40 30" fill="none" opacity="0.6">
            <path d="M5 15 Q 10 10, 15 15 Q 20 20, 25 15 Q 30 10, 35 15" stroke="#333" strokeWidth="2" fill="none"/>
          </svg>
        </div>
        <div className="absolute" style={{ top: '18%', left: '-5%', animation: 'flyAcross 30s linear infinite', animationDelay: '5s' }}>
          <svg width="40" height="30" viewBox="0 0 40 30" fill="none" opacity="0.5">
            <path d="M5 15 Q 10 10, 15 15 Q 20 20, 25 15 Q 30 10, 35 15" stroke="#333" strokeWidth="2" fill="none"/>
          </svg>
        </div>
      </div>

      {/* Animation keyframes */}
      <style>{`
        @keyframes moveRight {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(100vw + 100px)); }
        }
        @keyframes moveLeft {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-100vw - 100px)); }
        }
        @keyframes flyAcross {
          0% { transform: translate(0, 0); }
          100% { transform: translate(calc(100vw + 100px), -50px); }
        }
      `}</style>

      {/* Main content - minimal centered text */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 2rem',
      }}>
        <h1
          style={{
            textAlign: 'center',
            opacity: showContent ? 1 : 0,
            transform: showContent ? 'translateY(0)' : 'translateY(2rem)',
            transition: 'all 1500ms',
            fontSize: '3rem',
            fontWeight: 300,
            lineHeight: 1.5,
            fontFamily: '"Cormorant Garamond", serif',
            color: 'rgba(255,255,255,0.98)',
            textShadow: '0 4px 20px rgba(0,0,0,0.9)',
            letterSpacing: '0.05em',
            textTransform: 'lowercase',
          }}
        >
          draw with the world
        </h1>
      </div>

      {/* Enter button - simple black box with ripple effect */}
      <button
        onClick={handleEnter}
        className="enter-button"
        style={{
          position: 'fixed',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 20,
          padding: '1.25rem 3rem',
          opacity: showContent ? 1 : 0,
          transition: 'opacity 1500ms 2000ms, transform 200ms ease-out, box-shadow 300ms',
          background: '#000000',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '2px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.8)',
          cursor: 'pointer',
          overflow: 'hidden',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateX(-50%) translateY(-2px) scale(1.02)';
          e.currentTarget.style.boxShadow = '0 15px 50px rgba(0,0,0,0.9)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateX(-50%) translateY(0) scale(1)';
          e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.8)';
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.transform = 'translateX(-50%) translateY(1px) scale(0.98)';

          // Create ripple effect
          const button = e.currentTarget;
          const rect = button.getBoundingClientRect();
          const ripple = document.createElement('span');
          const size = Math.max(rect.width, rect.height);
          const x = e.clientX - rect.left - size / 2;
          const y = e.clientY - rect.top - size / 2;

          ripple.style.width = ripple.style.height = size + 'px';
          ripple.style.left = x + 'px';
          ripple.style.top = y + 'px';
          ripple.style.position = 'absolute';
          ripple.style.borderRadius = '50%';
          ripple.style.background = 'rgba(255, 255, 255, 0.3)';
          ripple.style.transform = 'scale(0)';
          ripple.style.animation = 'ripple 600ms ease-out';
          ripple.style.pointerEvents = 'none';

          button.appendChild(ripple);
          setTimeout(() => ripple.remove(), 600);
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = 'translateX(-50%) translateY(-2px) scale(1.02)';
        }}
      >
        <span
          style={{
            fontSize: '1.25rem',
            fontFamily: '"Cormorant Garamond", serif',
            color: '#FFFFFF',
            letterSpacing: '0.2em',
            textTransform: 'lowercase',
            fontWeight: 300,
            position: 'relative',
            zIndex: 1,
          }}
        >
          enter
        </span>
      </button>

      <style>{`
        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }

        .enter-button {
          bottom: 18rem;
        }

        @media (max-width: 768px) {
          .enter-button {
            bottom: 8rem !important;
          }
        }
      `}</style>
    </div>
  );
}
