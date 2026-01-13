interface Reaction {
  id: string;
  x: number;
  y: number;
  emoji: string;
  timestamp: number;
}

interface FloatingReactionsProps {
  reactions: Reaction[];
}

export default function FloatingReactions({ reactions }: FloatingReactionsProps) {
  return (
    <>
      {reactions.map((reaction) => (
        <div
          key={reaction.id}
          style={{
            position: 'absolute',
            left: `${reaction.x}px`,
            top: `${reaction.y}px`,
            pointerEvents: 'none',
            zIndex: 1001,
            animation: 'floatReaction 3s ease-out forwards',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div style={{
            fontSize: '2rem',
            filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))',
          }}>
            {reaction.emoji}
          </div>
        </div>
      ))}

      <style>{`
        @keyframes floatReaction {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) translateY(0px) scale(0.8);
          }
          20% {
            transform: translate(-50%, -50%) translateY(-10px) scale(1.2);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) translateY(-80px) scale(0.8);
          }
        }
      `}</style>
    </>
  );
}
