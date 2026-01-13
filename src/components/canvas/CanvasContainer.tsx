import { useState, useEffect } from 'react';
import { useCanvas } from '../../hooks/useCanvas';
import { useCanvasObjects } from '../../hooks/useCanvasObjects';
import { useArchives } from '../../hooks/useArchives';
import { usePresence } from '../../hooks/usePresence';
import { useCountdown } from '../../hooks/useCountdown';
import { useLiveCursors } from '../../hooks/useLiveCursors';
import { useReactions } from '../../hooks/useReactions';
import CanvasStage from './CanvasStage';
import LandingPage from '../landing/LandingPage';
import ShareModal from '../ShareModal';
import ActivityFeed from '../ActivityFeed';
import LiveCursors from '../LiveCursors';
import TimelapseViewer from '../TimelapseViewer';
import FloatingReactions from '../FloatingReactions';
import CollaborativeEffects from '../CollaborativeEffects';
import type { CanvasObject, PenOptions, ToolType, Canvas } from '../../types/canvas.types';
import { DEFAULT_PEN_OPTIONS } from '../../utils/strokeHelpers';
import { EMOJI_CATEGORIES } from '../../utils/emojiStickers';
import { getTodaysTheme } from '../../utils/dailyThemes';
import { soundSystem } from '../../utils/soundEffects';

const CANVAS_WIDTH = 1400;
const CANVAS_HEIGHT = 800;

// Nature-themed colors
const NATURE_COLORS = [
  '#2D5016', // Forest green
  '#4A7C59', // Moss green
  '#6B8E23', // Olive
  '#228B22', // Forest green bright
  '#8B4513', // Saddle brown
  '#D2691E', // Chocolate
  '#CD853F', // Peru
  '#DEB887', // Burlywood
  '#87CEEB', // Sky blue
  '#4682B4', // Steel blue
  '#000000', // Black
  '#FFFFFF', // White
  '#FF6347', // Tomato red
  '#FFD700', // Gold
  '#FF69B4', // Hot pink
];

export default function CanvasContainer() {
  const { canvas, canvasDate, loading: canvasLoading } = useCanvas();
  const { objects, loading: objectsLoading, addObject } = useCanvasObjects(canvas?.id);
  const { archives, loading: archivesLoading } = useArchives();
  const { liveUsers } = usePresence(canvas?.id);
  const { formatTime } = useCountdown();
  const { cursors, broadcastCursor } = useLiveCursors(canvas?.id);
  const { reactions, addReaction } = useReactions(canvas?.id);
  const todaysTheme = getTodaysTheme();

  const [showLanding, setShowLanding] = useState(true);
  const [activeTool, setActiveTool] = useState<ToolType>('pen');
  const [penOptions, setPenOptions] = useState<PenOptions>({
    ...DEFAULT_PEN_OPTIONS,
    color: '#2D5016',
  });
  const [showGallery, setShowGallery] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState<string>('🌿');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showTimelapse, setShowTimelapse] = useState(false);
  const [selectedCanvas, setSelectedCanvas] = useState<Canvas | null>(null);
  const [themeBannerPos, setThemeBannerPos] = useState({ x: 0, y: 0 });
  const [isDraggingBanner, setIsDraggingBanner] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleObjectCreate = async (object: Omit<CanvasObject, 'id' | 'canvas_id' | 'created_by' | 'created_at'>) => {
    await addObject(object);
  };

  const updatePenColor = (color: string) => {
    setPenOptions((prev) => ({ ...prev, color }));
  };

  const updatePenSize = (size: number) => {
    setPenOptions((prev) => ({ ...prev, size }));
  };

  const handleEmojiSelect = (emoji: string) => {
    setSelectedEmoji(emoji);
    setShowEmojiPicker(false);
    setActiveTool('sticker');
  };

  const handleEnterCanvas = () => {
    setShowLanding(false);
  };

  const handleWatchTimelapse = (archive: Canvas) => {
    setSelectedCanvas(archive);
    setShowTimelapse(true);
  };

  const handleBannerMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    setIsDraggingBanner(true);
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // Use effect to handle document-level mouse events for dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingBanner) {
        setThemeBannerPos({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDraggingBanner(false);
    };

    if (isDraggingBanner) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingBanner, dragOffset]);

  // Show landing page on first visit (disabled for testing - set to true for production)
  if (showLanding) {
    return <LandingPage onEnter={handleEnterCanvas} />;
  }

  if (canvasLoading || objectsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        background: 'linear-gradient(135deg, #1a3a1a 0%, #2d5016 50%, #4a7c59 100%)'
      }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-300 mx-auto mb-4"></div>
          <p className="text-2xl text-green-100 font-light">Entering Earth Board...</p>
        </div>
      </div>
    );
  }

  const formattedDate = canvasDate ? new Date(canvasDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : '';

  return (
    <div
      style={{
        minHeight: '100vh',
        overflow: 'hidden',
        position: 'relative',
        background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 25%, #2a2f4a 50%, #1a1f3a 75%, #0a0e27 100%)',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Cosmic universe background effects */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {/* Real universe/nebula background image */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'url(/universe-background.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: 0.4,
          }}
        />

        {/* Nebula-like glows */}
        <div
          style={{
            position: 'absolute',
            width: '600px',
            height: '600px',
            top: '10%',
            left: '15%',
            borderRadius: '50%',
            opacity: 0.15,
            background: 'radial-gradient(circle, rgba(100, 60, 180, 0.4) 0%, rgba(60, 40, 120, 0.2) 40%, transparent 70%)',
            filter: 'blur(100px)',
            animation: 'float 30s ease-in-out infinite',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: '500px',
            height: '500px',
            bottom: '15%',
            right: '20%',
            borderRadius: '50%',
            opacity: 0.12,
            background: 'radial-gradient(circle, rgba(60, 100, 180, 0.4) 0%, rgba(40, 60, 120, 0.2) 40%, transparent 70%)',
            filter: 'blur(90px)',
            animation: 'float 35s ease-in-out infinite reverse',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: '450px',
            height: '450px',
            top: '50%',
            right: '10%',
            borderRadius: '50%',
            opacity: 0.1,
            background: 'radial-gradient(circle, rgba(140, 100, 60, 0.3) 0%, rgba(100, 70, 40, 0.2) 40%, transparent 70%)',
            filter: 'blur(85px)',
            animation: 'float 28s ease-in-out infinite',
            animationDelay: '5s',
          }}
        />

        {/* Stars */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(2px 2px at 20% 30%, white, transparent),
              radial-gradient(2px 2px at 60% 70%, white, transparent),
              radial-gradient(1px 1px at 50% 50%, white, transparent),
              radial-gradient(1px 1px at 80% 10%, white, transparent),
              radial-gradient(2px 2px at 90% 60%, white, transparent),
              radial-gradient(1px 1px at 33% 87%, white, transparent),
              radial-gradient(1px 1px at 75% 44%, white, transparent)
            `,
            backgroundSize: '200px 200px, 250px 250px, 300px 300px, 180px 180px, 220px 220px, 270px 270px, 190px 190px',
            opacity: 0.5,
          }}
        />

        {/* Vignette */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.6) 100%)',
          }}
        />
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(30px, -30px) scale(1.05);
          }
          50% {
            transform: translate(-20px, 20px) scale(0.95);
          }
          75% {
            transform: translate(20px, 30px) scale(1.02);
          }
        }
      `}</style>

      {/* Floating header */}
      <header style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 30, padding: '2rem', pointerEvents: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Title and stats */}
          <div style={{ pointerEvents: 'none' }}>
            <h1 style={{
              fontFamily: '"Patrick Hand", cursive',
              fontSize: '3rem',
              fontWeight: 400,
              color: '#F5F5DC',
              textShadow: '0 0 30px rgba(245, 245, 220, 0.3), 0 4px 15px rgba(0,0,0,0.8)',
              letterSpacing: '0.05em',
              textTransform: 'lowercase',
              marginBottom: '0.5rem',
            }}>
              earth board
            </h1>
            {/* Live stats */}
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <p style={{
                fontFamily: '"Cormorant Garamond", serif',
                fontSize: '0.875rem',
                color: 'rgba(245, 245, 220, 0.7)',
                letterSpacing: '0.05em',
                fontStyle: 'italic',
              }}>
                {liveUsers} {liveUsers === 1 ? 'soul' : 'souls'} creating
              </p>
              <span style={{
                width: '3px',
                height: '3px',
                borderRadius: '50%',
                background: 'rgba(245, 245, 220, 0.4)',
              }} />
              <p style={{
                fontFamily: '"Cormorant Garamond", serif',
                fontSize: '0.875rem',
                color: 'rgba(245, 245, 220, 0.7)',
                letterSpacing: '0.05em',
                fontStyle: 'italic',
              }}>
                {formatTime()} until eternal
              </p>
            </div>
          </div>

          {/* Date and Archives */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', pointerEvents: 'auto' }}>
            <div style={{ textAlign: 'right' }} className="hidden md:block">
              <p style={{
                fontSize: '0.75rem',
                color: 'rgba(200, 180, 140, 0.8)',
                fontWeight: 300,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                textShadow: '0 2px 6px rgba(0,0,0,0.8)',
                fontFamily: '"Oswald", sans-serif',
              }}>{formattedDate}</p>
            </div>
            <button
              onClick={() => setShowGallery(true)}
              style={{
                padding: '0.65rem 1.5rem',
                background: 'rgba(30, 25, 20, 0.6)',
                backdropFilter: 'blur(8px)',
                border: '2px solid rgba(139, 115, 85, 0.4)',
                borderRadius: '25px',
                fontSize: '0.875rem',
                fontWeight: 300,
                color: 'rgba(200, 180, 140, 0.9)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 300ms',
                fontFamily: '"Oswald", sans-serif',
                textShadow: '0 2px 6px rgba(0,0,0,0.6)',
                pointerEvents: 'auto',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(40, 35, 30, 0.8)';
                e.currentTarget.style.borderColor = 'rgba(139, 115, 85, 0.6)';
                e.currentTarget.style.color = '#F5F5DC';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(30, 25, 20, 0.6)';
                e.currentTarget.style.borderColor = 'rgba(139, 115, 85, 0.4)';
                e.currentTarget.style.color = 'rgba(200, 180, 140, 0.9)';
              }}
            >
              Archives
            </button>
          </div>
        </div>
      </header>

      {/* Activity Feed */}
      {canvas?.id && <ActivityFeed canvasId={canvas.id} />}

      {/* Daily Theme Banner */}
      <div
        style={{
          position: 'fixed',
          top: themeBannerPos.y === 0 ? '50%' : 'auto',
          left: themeBannerPos.x === 0 ? '2rem' : `${themeBannerPos.x}px`,
          ...(themeBannerPos.y !== 0 && { top: `${themeBannerPos.y}px` }),
          transform: themeBannerPos.y === 0 ? 'translateY(-50%)' : 'none',
          zIndex: 25,
          background: 'rgba(20, 25, 15, 0.7)',
          backdropFilter: 'blur(12px)',
          borderRadius: '8px',
          border: '1px solid rgba(139, 115, 85, 0.3)',
          padding: '1.5rem 1rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          maxWidth: '180px',
          pointerEvents: 'auto',
          cursor: isDraggingBanner ? 'grabbing' : 'grab',
          userSelect: 'none',
        }}
        onMouseDown={handleBannerMouseDown}
      >
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.75rem',
        }}>
          <div style={{ fontSize: '2.5rem' }}>{todaysTheme.emoji}</div>
          <div style={{ textAlign: 'center' }}>
            <p style={{
              fontFamily: '"Kalam", cursive',
              fontSize: '1rem',
              color: 'rgba(200, 180, 140, 0.9)',
              marginBottom: '0.25rem',
              textTransform: 'lowercase',
            }}>{todaysTheme.name}</p>
            <p style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontSize: '0.75rem',
              color: 'rgba(200, 180, 140, 0.6)',
              fontStyle: 'italic',
              textTransform: 'lowercase',
            }}>{todaysTheme.description}</p>
          </div>

          {/* Theme colors */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.5rem',
            marginTop: '0.5rem',
          }}>
            {todaysTheme.colors.slice(0, 6).map((color, i) => (
              <button
                key={i}
                onClick={() => updatePenColor(color)}
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: color,
                  border: penOptions.color === color ? '2px solid rgba(200, 180, 140, 0.8)' : '1px solid rgba(139, 115, 85, 0.3)',
                  cursor: 'pointer',
                  transition: 'all 200ms',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Elegant help icon with tooltip - bottom left */}
      <div style={{ position: 'fixed', bottom: '2rem', left: '2rem', zIndex: 20, pointerEvents: 'none' }} className="group">
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'rgba(30, 25, 20, 0.7)',
            backdropFilter: 'blur(10px)',
            border: '3px solid rgba(139, 115, 85, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 300ms',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            pointerEvents: 'auto',
          }}
        >
          <span style={{
            fontSize: '1.5rem',
            color: 'rgba(200, 180, 140, 0.9)',
            fontWeight: 600,
            fontFamily: '"Cormorant Garamond", serif',
          }}>?</span>
        </div>

        {/* Tooltip on hover */}
        <div
          className="opacity-0 group-hover:opacity-100"
          style={{
            position: 'absolute',
            bottom: 0,
            left: '100%',
            marginLeft: '1rem',
            padding: '1rem 1.25rem',
            background: 'rgba(20, 15, 10, 0.95)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(139, 115, 85, 0.3)',
            borderRadius: '12px',
            minWidth: '280px',
            transition: 'opacity 300ms',
            boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
            pointerEvents: 'auto',
            zIndex: 50,
          }}
        >
          <p style={{
            fontSize: '0.875rem',
            color: 'rgba(200, 180, 140, 0.95)',
            lineHeight: 1.6,
            marginBottom: '0.5rem',
            fontFamily: '"Cormorant Garamond", serif',
            textTransform: 'lowercase',
          }}>
            • use <strong>draw</strong>, <strong>text</strong>, <strong>circle</strong>, <strong>rectangle</strong>, <strong>stickers</strong>
          </p>
          <p style={{
            fontSize: '0.875rem',
            color: 'rgba(200, 180, 140, 0.95)',
            lineHeight: 1.6,
            marginBottom: '0.5rem',
            fontFamily: '"Cormorant Garamond", serif',
            textTransform: 'lowercase',
          }}>
            • <strong>double-click</strong> to send reactions ✨❤️
          </p>
          <p style={{
            fontSize: '0.875rem',
            color: 'rgba(200, 180, 140, 0.95)',
            lineHeight: 1.6,
            fontFamily: '"Cormorant Garamond", serif',
            textTransform: 'lowercase',
          }}>
            • sparkles appear when creators collaborate nearby
          </p>
          <div style={{
            marginTop: '0.75rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid rgba(139, 115, 85, 0.2)',
          }}>
            <p style={{
              fontSize: '0.75rem',
              color: 'rgba(200, 180, 140, 0.6)',
              fontStyle: 'italic',
              fontFamily: '"Cormorant Garamond", serif',
            }}>
              {objects.length} marks placed today
            </p>
          </div>
        </div>
      </div>

      {/* Mobile styles */}
      <style>{`
        @media (max-width: 768px) {
          .canvas-main {
            padding: 5rem 0.5rem !important;
            overflow-x: auto;
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
          }

          .canvas-main > div {
            margin: 0 auto;
          }

          .toolbar-container {
            bottom: 1rem !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
            width: 95vw !important;
            max-width: 100% !important;
          }

          .toolbar-container > div {
            padding: 0.75rem !important;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }

          .toolbar-container button {
            padding: 0.75rem 1rem !important;
            font-size: 0.875rem !important;
            white-space: nowrap;
          }

          .toolbar-container .flex {
            flex-wrap: nowrap !important;
            gap: 0.5rem !important;
          }
        }
      `}</style>

      {/* Floating toolbar - bottom */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30 toolbar-container">
        <div
          className="backdrop-blur-xl rounded-sm shadow-2xl px-10 py-5 border"
          style={{
            background: 'rgba(25, 20, 15, 0.7)',
            border: '1px solid rgba(139, 115, 85, 0.3)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.6), 0 0 80px rgba(139, 115, 85, 0.15)',
          }}
        >
          <div className="flex items-center gap-8">
            {/* Tools */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                onClick={() => setActiveTool('pen')}
                style={{
                  padding: '0.5rem 1.25rem',
                  borderRadius: '4px',
                  fontFamily: '"Oswald", sans-serif',
                  fontWeight: 300,
                  fontSize: '0.875rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  transition: 'all 300ms',
                  border: activeTool === 'pen' ? '1px solid rgba(217, 119, 6, 0.5)' : '1px solid transparent',
                  background: activeTool === 'pen' ? 'rgba(180, 83, 9, 0.4)' : 'transparent',
                  color: activeTool === 'pen' ? '#FFF7ED' : 'rgba(254, 243, 199, 0.7)',
                  boxShadow: activeTool === 'pen' ? '0 4px 12px rgba(0,0,0,0.3)' : 'none',
                  textShadow: activeTool === 'pen' ? '0 2px 8px rgba(0,0,0,0.6)' : 'none',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  if (activeTool !== 'pen') {
                    e.currentTarget.style.color = '#FFF7ED';
                    e.currentTarget.style.background = 'rgba(0,0,0,0.2)';
                    e.currentTarget.style.borderColor = 'rgba(120, 53, 15, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTool !== 'pen') {
                    e.currentTarget.style.color = 'rgba(254, 243, 199, 0.7)';
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = 'transparent';
                  }
                }}
              >
                Draw
              </button>
              <button
                onClick={() => setActiveTool('text')}
                style={{
                  padding: '0.5rem 1.25rem',
                  borderRadius: '4px',
                  fontFamily: '"Oswald", sans-serif',
                  fontWeight: 300,
                  fontSize: '0.875rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  transition: 'all 300ms',
                  border: activeTool === 'text' ? '1px solid rgba(217, 119, 6, 0.5)' : '1px solid transparent',
                  background: activeTool === 'text' ? 'rgba(180, 83, 9, 0.4)' : 'transparent',
                  color: activeTool === 'text' ? '#FFF7ED' : 'rgba(254, 243, 199, 0.7)',
                  boxShadow: activeTool === 'text' ? '0 4px 12px rgba(0,0,0,0.3)' : 'none',
                  textShadow: activeTool === 'text' ? '0 2px 8px rgba(0,0,0,0.6)' : 'none',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  if (activeTool !== 'text') {
                    e.currentTarget.style.color = '#FFF7ED';
                    e.currentTarget.style.background = 'rgba(0,0,0,0.2)';
                    e.currentTarget.style.borderColor = 'rgba(120, 53, 15, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTool !== 'text') {
                    e.currentTarget.style.color = 'rgba(254, 243, 199, 0.7)';
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = 'transparent';
                  }
                }}
              >
                Text
              </button>
              <button
                onClick={() => setActiveTool('circle')}
                style={{
                  padding: '0.5rem 1.25rem',
                  borderRadius: '4px',
                  fontFamily: '"Oswald", sans-serif',
                  fontWeight: 300,
                  fontSize: '0.875rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  transition: 'all 300ms',
                  border: activeTool === 'circle' ? '1px solid rgba(217, 119, 6, 0.5)' : '1px solid transparent',
                  background: activeTool === 'circle' ? 'rgba(180, 83, 9, 0.4)' : 'transparent',
                  color: activeTool === 'circle' ? '#FFF7ED' : 'rgba(254, 243, 199, 0.7)',
                  boxShadow: activeTool === 'circle' ? '0 4px 12px rgba(0,0,0,0.3)' : 'none',
                  textShadow: activeTool === 'circle' ? '0 2px 8px rgba(0,0,0,0.6)' : 'none',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  if (activeTool !== 'circle') {
                    e.currentTarget.style.color = '#FFF7ED';
                    e.currentTarget.style.background = 'rgba(0,0,0,0.2)';
                    e.currentTarget.style.borderColor = 'rgba(120, 53, 15, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTool !== 'circle') {
                    e.currentTarget.style.color = 'rgba(254, 243, 199, 0.7)';
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = 'transparent';
                  }
                }}
              >
                Circle
              </button>
              <button
                onClick={() => setActiveTool('rectangle')}
                style={{
                  padding: '0.5rem 1.25rem',
                  borderRadius: '4px',
                  fontFamily: '"Oswald", sans-serif',
                  fontWeight: 300,
                  fontSize: '0.875rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  transition: 'all 300ms',
                  border: activeTool === 'rectangle' ? '1px solid rgba(217, 119, 6, 0.5)' : '1px solid transparent',
                  background: activeTool === 'rectangle' ? 'rgba(180, 83, 9, 0.4)' : 'transparent',
                  color: activeTool === 'rectangle' ? '#FFF7ED' : 'rgba(254, 243, 199, 0.7)',
                  boxShadow: activeTool === 'rectangle' ? '0 4px 12px rgba(0,0,0,0.3)' : 'none',
                  textShadow: activeTool === 'rectangle' ? '0 2px 8px rgba(0,0,0,0.6)' : 'none',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  if (activeTool !== 'rectangle') {
                    e.currentTarget.style.color = '#FFF7ED';
                    e.currentTarget.style.background = 'rgba(0,0,0,0.2)';
                    e.currentTarget.style.borderColor = 'rgba(120, 53, 15, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTool !== 'rectangle') {
                    e.currentTarget.style.color = 'rgba(254, 243, 199, 0.7)';
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = 'transparent';
                  }
                }}
              >
                Rectangle
              </button>
              <button
                onClick={() => setShowEmojiPicker(true)}
                style={{
                  padding: '0.5rem 1.25rem',
                  borderRadius: '4px',
                  fontFamily: '"Oswald", sans-serif',
                  fontWeight: 300,
                  fontSize: '0.875rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  transition: 'all 300ms',
                  border: activeTool === 'sticker' ? '1px solid rgba(217, 119, 6, 0.5)' : '1px solid transparent',
                  background: activeTool === 'sticker' ? 'rgba(180, 83, 9, 0.4)' : 'transparent',
                  color: activeTool === 'sticker' ? '#FFF7ED' : 'rgba(254, 243, 199, 0.7)',
                  boxShadow: activeTool === 'sticker' ? '0 4px 12px rgba(0,0,0,0.3)' : 'none',
                  textShadow: activeTool === 'sticker' ? '0 2px 8px rgba(0,0,0,0.6)' : 'none',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  if (activeTool !== 'sticker') {
                    e.currentTarget.style.color = '#FFF7ED';
                    e.currentTarget.style.background = 'rgba(0,0,0,0.2)';
                    e.currentTarget.style.borderColor = 'rgba(120, 53, 15, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTool !== 'sticker') {
                    e.currentTarget.style.color = 'rgba(254, 243, 199, 0.7)';
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = 'transparent';
                  }
                }}
              >
                Stickers
              </button>
            </div>

            {/* Divider */}
            <div className="h-8 w-px bg-gradient-to-b from-transparent via-amber-900/30 to-transparent"></div>

            {/* Colors */}
            <div className="flex items-center gap-2">
              {NATURE_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => updatePenColor(color)}
                  className={`w-7 h-7 rounded-full border-2 transition-all hover:scale-110 ${
                    penOptions.color === color
                      ? 'border-amber-300 scale-110 shadow-lg'
                      : 'border-amber-900/20 hover:border-amber-800/40'
                  }`}
                  style={{
                    backgroundColor: color,
                    boxShadow: penOptions.color === color ? `0 0 20px ${color}40, 0 4px 12px rgba(0,0,0,0.4)` : 'none',
                  }}
                  title={color}
                />
              ))}
            </div>

            {/* Divider */}
            <div className="h-8 w-px bg-gradient-to-b from-transparent via-amber-900/30 to-transparent"></div>

            {/* Brush size */}
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="50"
                value={penOptions.size}
                onChange={(e) => updatePenSize(parseInt(e.target.value))}
                className="w-24 accent-amber-700"
                style={{
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))',
                }}
              />
              <span className="text-sm text-amber-100 font-heading font-light w-10 text-center tracking-wide" style={{
                textShadow: '0 2px 6px rgba(0,0,0,0.6)',
              }}>{penOptions.size}px</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main content - Full screen with centered canvas */}
      <main className="min-h-screen flex items-center justify-center py-20 px-4 relative canvas-main">
        {/* Canvas with earth surroundings */}
        <div className="relative">
          {/* Multi-layered organic earth glow - creates depth */}
          <div
            className="absolute -inset-16 opacity-60 blur-2xl"
            style={{
              background: `
                radial-gradient(ellipse at 30% 25%, rgba(100, 140, 70, 0.5) 0%, transparent 55%),
                radial-gradient(ellipse at 70% 30%, rgba(80, 120, 60, 0.4) 0%, transparent 60%),
                radial-gradient(ellipse at 65% 75%, rgba(90, 130, 65, 0.45) 0%, transparent 58%),
                radial-gradient(ellipse at 15% 70%, rgba(70, 110, 55, 0.35) 0%, transparent 52%)
              `
            }}
          />

          {/* Secondary earth glow - tighter */}
          <div
            className="absolute -inset-10 opacity-70 blur-xl"
            style={{
              background: `
                radial-gradient(ellipse at 45% 35%, rgba(120, 160, 80, 0.4) 0%, transparent 50%),
                radial-gradient(ellipse at 55% 65%, rgba(100, 140, 70, 0.35) 0%, transparent 48%)
              `
            }}
          />

          {/* Subtle organic texture ring */}
          <div
            className="absolute -inset-8 opacity-40"
            style={{
              background: `
                repeating-conic-gradient(
                  from 0deg at 50% 50%,
                  rgba(139, 115, 85, 0.15) 0deg,
                  transparent 2deg,
                  transparent 4deg,
                  rgba(139, 115, 85, 0.15) 6deg
                )
              `,
              filter: 'blur(1px)',
            }}
          />

          {/* Canvas container with premium shadow */}
          <div
            className="relative z-10 rounded-sm overflow-hidden border-4"
            style={{
              borderColor: 'rgba(60, 50, 40, 0.8)',
              boxShadow: `
                0 0 100px rgba(139, 115, 85, 0.2),
                0 40px 90px rgba(0,0,0,0.7),
                0 20px 50px rgba(0,0,0,0.5),
                0 10px 30px rgba(0,0,0,0.4),
                inset 0 0 0 1px rgba(232, 220, 200, 0.08)
              `,
            }}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              broadcastCursor(x, y);
            }}
            onDoubleClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              addReaction(x, y);
            }}
          >
            <CanvasStage
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              objects={objects}
              activeTool={activeTool}
              penOptions={penOptions}
              selectedEmoji={selectedEmoji}
              onObjectCreate={handleObjectCreate}
            />

            {/* Live cursors overlay */}
            <LiveCursors cursors={cursors} />

            {/* Floating reactions overlay */}
            <FloatingReactions reactions={reactions} />

            {/* Collaborative effects (sparkles when users are near each other) */}
            <CollaborativeEffects cursors={cursors} />
          </div>

          {/* Elegant caption below canvas */}
          <div className="absolute -bottom-20 left-0 right-0 text-center">
            <p className="text-amber-200/60 font-heading font-light text-xs tracking-[0.3em] uppercase" style={{
              textShadow: '0 2px 10px rgba(0,0,0,0.8)',
            }}>
              {objects.length} {objects.length === 1 ? 'mark' : 'marks'} placed today
            </p>
          </div>
        </div>
      </main>

      {/* Emoji Picker Modal */}
      {showEmojiPicker && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          zIndex: 50,
        }} onClick={() => setShowEmojiPicker(false)}>
          <div style={{
            borderRadius: '4px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
            maxWidth: '900px',
            width: '100%',
            maxHeight: '85vh',
            overflow: 'auto',
            border: '2px solid rgba(139, 115, 85, 0.4)',
            background: 'linear-gradient(135deg, #2a3820 0%, #3d4d2a 100%)',
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              position: 'sticky',
              top: 0,
              padding: '2rem',
              borderBottom: '1px solid rgba(139, 115, 85, 0.3)',
              zIndex: 10,
              background: 'rgba(20, 25, 15, 0.95)',
              backdropFilter: 'blur(12px)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h2 style={{
                    fontSize: '2.25rem',
                    fontFamily: '"Kalam", cursive',
                    letterSpacing: '0.15em',
                    color: '#FFF7ED',
                    textShadow: '0 0 40px rgba(232, 220, 200, 0.2), 0 4px 20px rgba(0,0,0,0.8)',
                  }}>ALL STICKERS</h2>
                  <p style={{
                    color: 'rgba(254, 243, 199, 0.7)',
                    marginTop: '0.5rem',
                    fontFamily: '"Cormorant Garamond", serif',
                    fontWeight: 300,
                    fontSize: '0.875rem',
                    letterSpacing: '0.1em',
                    textTransform: 'lowercase',
                  }}>select any emoji to place on the canvas</p>
                </div>
                <button
                  onClick={() => setShowEmojiPicker(false)}
                  style={{
                    fontSize: '3rem',
                    color: 'rgba(254, 243, 199, 0.8)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 300,
                    lineHeight: 1,
                    transition: 'all 300ms',
                    padding: '0 0.5rem',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#FFF7ED';
                    e.currentTarget.style.transform = 'rotate(90deg)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'rgba(254, 243, 199, 0.8)';
                    e.currentTarget.style.transform = 'rotate(0deg)';
                  }}
                >
                  ×
                </button>
              </div>
            </div>

            <div style={{ padding: '2rem' }}>
              {Object.entries(EMOJI_CATEGORIES).map(([key, category]) => (
                <div key={key} style={{ marginBottom: '2rem' }}>
                  <h3 style={{
                    fontSize: '1.125rem',
                    fontFamily: '"Oswald", sans-serif',
                    fontWeight: 300,
                    color: 'rgba(254, 243, 199, 0.9)',
                    marginBottom: '1rem',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    textShadow: '0 2px 10px rgba(0,0,0,0.8)',
                  }}>{category.label}</h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(8, 1fr)',
                    gap: '0.75rem',
                  }}>
                    {category.emojis.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleEmojiSelect(emoji)}
                        style={{
                          fontSize: '2.25rem',
                          padding: '0.75rem',
                          borderRadius: '4px',
                          border: '2px solid transparent',
                          background: 'rgba(40, 35, 25, 0.6)',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                          cursor: 'pointer',
                          transition: 'all 200ms',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.25)';
                          e.currentTarget.style.borderColor = 'rgba(180, 83, 9, 0.5)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.borderColor = 'transparent';
                        }}
                        title={emoji}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Gallery modal - Afterlife/Cemetery theme */}
      {showGallery && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 60,
          overflow: 'auto',
          background: 'linear-gradient(to bottom, #0d0a15 0%, #1a1520 30%, #2a2030 60%, #1a1520 80%, #0d0a15 100%)',
        }}>
          {/* Ethereal mist/fog effects */}
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(ellipse at 20% 40%, rgba(140, 120, 180, 0.15) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 60%, rgba(100, 80, 140, 0.12) 0%, transparent 50%),
              radial-gradient(ellipse at 50% 80%, rgba(120, 100, 160, 0.1) 0%, transparent 50%)
            `,
            pointerEvents: 'none',
          }} />

          {/* Subtle stars (souls?) */}
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(1px 1px at 15% 25%, rgba(200, 180, 220, 0.6), transparent),
              radial-gradient(1px 1px at 45% 65%, rgba(200, 180, 220, 0.5), transparent),
              radial-gradient(1px 1px at 75% 35%, rgba(200, 180, 220, 0.6), transparent),
              radial-gradient(1px 1px at 85% 75%, rgba(200, 180, 220, 0.4), transparent),
              radial-gradient(1px 1px at 25% 85%, rgba(200, 180, 220, 0.5), transparent)
            `,
            backgroundSize: '300px 300px, 400px 400px, 350px 350px, 380px 380px, 320px 320px',
            opacity: 0.4,
            pointerEvents: 'none',
          }} />

          {/* Content container */}
          <div style={{ position: 'relative', zIndex: 10, padding: '3rem 2rem', minHeight: '100vh' }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '3rem',
              maxWidth: '1200px',
              margin: '0 auto 3rem',
            }}>
              <div>
                <h2 style={{
                  fontSize: '4rem',
                  fontFamily: '"Patrick Hand", cursive',
                  letterSpacing: '0.1em',
                  color: '#E8DCF0',
                  textShadow: '0 0 40px rgba(200, 180, 220, 0.3), 0 4px 20px rgba(0,0,0,0.9)',
                  textTransform: 'lowercase',
                }}>the archives</h2>
                <p style={{
                  color: 'rgba(200, 180, 220, 0.7)',
                  marginTop: '0.75rem',
                  fontFamily: '"Cormorant Garamond", serif',
                  fontWeight: 300,
                  fontSize: '1.125rem',
                  letterSpacing: '0.1em',
                  fontStyle: 'italic',
                  textTransform: 'lowercase',
                }}>where canvases rest eternal</p>
              </div>
              <button
                onClick={() => setShowGallery(false)}
                style={{
                  fontSize: '3.5rem',
                  color: 'rgba(200, 180, 220, 0.7)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 300,
                  lineHeight: 1,
                  transition: 'all 300ms',
                  padding: '0 1rem',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#E8DCF0';
                  e.currentTarget.style.transform = 'rotate(90deg)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'rgba(200, 180, 220, 0.7)';
                  e.currentTarget.style.transform = 'rotate(0deg)';
                }}
              >
                ×
              </button>
            </div>

            {/* Archives grid */}
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              {archivesLoading ? (
                <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                  <p style={{
                    fontSize: '1.5rem',
                    color: 'rgba(200, 180, 220, 0.6)',
                    fontFamily: '"Cormorant Garamond", serif',
                    fontStyle: 'italic',
                  }}>loading the eternal gallery...</p>
                </div>
              ) : archives.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '4rem 2rem',
                  background: 'rgba(30, 25, 40, 0.4)',
                  borderRadius: '8px',
                  border: '2px solid rgba(140, 120, 180, 0.2)',
                }}>
                  <p style={{
                    fontSize: '2rem',
                    color: 'rgba(200, 180, 220, 0.8)',
                    fontFamily: '"Patrick Hand", cursive',
                    marginBottom: '1rem',
                    textTransform: 'lowercase',
                  }}>the archives await</p>
                  <p style={{
                    fontSize: '1rem',
                    color: 'rgba(200, 180, 220, 0.5)',
                    fontFamily: '"Cormorant Garamond", serif',
                    fontStyle: 'italic',
                    textTransform: 'lowercase',
                  }}>begin creating today's canvas to be preserved for eternity</p>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: '2rem',
                }}>
                  {archives.map((archive) => (
                    <div
                      key={archive.id}
                      style={{
                        background: 'rgba(30, 25, 40, 0.6)',
                        borderRadius: '8px',
                        border: '2px solid rgba(140, 120, 180, 0.3)',
                        padding: '1.5rem',
                        transition: 'all 300ms',
                        cursor: 'pointer',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.borderColor = 'rgba(140, 120, 180, 0.5)';
                        e.currentTarget.style.boxShadow = '0 8px 30px rgba(140, 120, 180, 0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.borderColor = 'rgba(140, 120, 180, 0.3)';
                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.5)';
                      }}
                    >
                      {/* Canvas preview placeholder */}
                      <div style={{
                        width: '100%',
                        aspectRatio: '16 / 9',
                        background: 'rgba(20, 15, 30, 0.8)',
                        borderRadius: '4px',
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid rgba(140, 120, 180, 0.2)',
                      }}>
                        <p style={{
                          fontSize: '3rem',
                          color: 'rgba(140, 120, 180, 0.3)',
                        }}>🎨</p>
                      </div>

                      {/* Canvas name */}
                      <h3 style={{
                        fontSize: '1.75rem',
                        fontFamily: '"Patrick Hand", cursive',
                        color: '#E8DCF0',
                        marginBottom: '0.5rem',
                        textTransform: 'lowercase',
                      }}>{archive.name || 'untitled'}</h3>

                      {/* Canvas info */}
                      <div style={{
                        fontSize: '0.875rem',
                        color: 'rgba(200, 180, 220, 0.6)',
                        fontFamily: '"Cormorant Garamond", serif',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.25rem',
                        marginBottom: '1rem',
                      }}>
                        <p>{new Date(archive.date).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}</p>
                        <p>{archive.object_count || 0} marks • {archive.participant_count || 0} souls</p>
                      </div>

                      {/* Watch timelapse button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleWatchTimelapse(archive);
                        }}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          background: 'rgba(140, 120, 180, 0.2)',
                          border: '1px solid rgba(140, 120, 180, 0.4)',
                          borderRadius: '4px',
                          color: 'rgba(200, 180, 220, 0.9)',
                          fontFamily: '"Kalam", cursive',
                          fontSize: '0.875rem',
                          cursor: 'pointer',
                          transition: 'all 200ms',
                          textTransform: 'lowercase',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(140, 120, 180, 0.3)';
                          e.currentTarget.style.borderColor = 'rgba(140, 120, 180, 0.6)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(140, 120, 180, 0.2)';
                          e.currentTarget.style.borderColor = 'rgba(140, 120, 180, 0.4)';
                        }}
                      >
                        ▶ watch timelapse
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal
          onClose={() => setShowShareModal(false)}
          objectCount={objects.length}
        />
      )}

      {/* Timelapse Viewer */}
      {showTimelapse && selectedCanvas && (
        <TimelapseViewer
          canvas={selectedCanvas}
          onClose={() => {
            setShowTimelapse(false);
            setSelectedCanvas(null);
          }}
        />
      )}
    </div>
  );
}
