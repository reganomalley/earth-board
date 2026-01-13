import { useEffect, useState } from 'react';

interface Cursor {
  sessionId: string;
  x: number;
  y: number;
  emoji: string;
  lastUpdate: number;
}

interface EffectSparkle {
  id: string;
  x: number;
  y: number;
  timestamp: number;
}

interface CollaborativeEffectsProps {
  cursors: Cursor[];
}

const PROXIMITY_THRESHOLD = 150; // pixels
const SPARKLE_LIFETIME = 2000; // 2 seconds

export default function CollaborativeEffects({ cursors }: CollaborativeEffectsProps) {
  const [sparkles, setSparkles] = useState<EffectSparkle[]>([]);

  useEffect(() => {
    if (cursors.length < 2) return;

    // Check for cursors that are close to each other
    const pairs: [Cursor, Cursor][] = [];
    for (let i = 0; i < cursors.length; i++) {
      for (let j = i + 1; j < cursors.length; j++) {
        const distance = Math.sqrt(
          Math.pow(cursors[i].x - cursors[j].x, 2) +
          Math.pow(cursors[i].y - cursors[j].y, 2)
        );

        if (distance < PROXIMITY_THRESHOLD) {
          pairs.push([cursors[i], cursors[j]]);
        }
      }
    }

    // Generate sparkles for close pairs
    if (pairs.length > 0) {
      const interval = setInterval(() => {
        pairs.forEach(([cursor1, cursor2]) => {
          // Create sparkle between the two cursors
          const midX = (cursor1.x + cursor2.x) / 2;
          const midY = (cursor1.y + cursor2.y) / 2;

          // Random offset
          const offsetX = (Math.random() - 0.5) * 60;
          const offsetY = (Math.random() - 0.5) * 60;

          const sparkle: EffectSparkle = {
            id: `${Date.now()}-${Math.random()}`,
            x: midX + offsetX,
            y: midY + offsetY,
            timestamp: Date.now(),
          };

          setSparkles(prev => [...prev, sparkle]);

          // Remove after lifetime
          setTimeout(() => {
            setSparkles(prev => prev.filter(s => s.id !== sparkle.id));
          }, SPARKLE_LIFETIME);
        });
      }, 300); // Generate every 300ms

      return () => clearInterval(interval);
    }
  }, [cursors]);

  return (
    <>
      {sparkles.map((sparkle) => (
        <div
          key={sparkle.id}
          style={{
            position: 'absolute',
            left: `${sparkle.x}px`,
            top: `${sparkle.y}px`,
            pointerEvents: 'none',
            zIndex: 999,
            animation: 'sparkleEffect 2s ease-out forwards',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div style={{
            fontSize: '1.5rem',
            filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.8))',
          }}>
            ✨
          </div>
        </div>
      ))}

      <style>{`
        @keyframes sparkleEffect {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) translateY(0px) scale(0.5) rotate(0deg);
          }
          50% {
            opacity: 1;
            transform: translate(-50%, -50%) translateY(-20px) scale(1) rotate(180deg);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) translateY(-40px) scale(0.3) rotate(360deg);
          }
        }
      `}</style>
    </>
  );
}
