interface LiveCursor {
  sessionId: string;
  x: number;
  y: number;
  emoji: string;
  lastUpdate: number;
}

interface LiveCursorsProps {
  cursors: LiveCursor[];
}

export default function LiveCursors({ cursors }: LiveCursorsProps) {
  return (
    <>
      {cursors.map((cursor) => (
        <div
          key={cursor.sessionId}
          style={{
            position: 'absolute',
            left: `${cursor.x}px`,
            top: `${cursor.y}px`,
            pointerEvents: 'none',
            zIndex: 1000,
            transition: 'left 100ms ease-out, top 100ms ease-out',
            transform: 'translate(-50%, -50%)',
          }}
        >
          {/* Cursor emoji */}
          <div style={{
            fontSize: '1.25rem',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
            animation: 'floatCursor 2s ease-in-out infinite',
          }}>
            {cursor.emoji}
          </div>
        </div>
      ))}

      <style>{`
        @keyframes floatCursor {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-3px);
          }
        }
      `}</style>
    </>
  );
}
