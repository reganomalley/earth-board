interface ShareModalProps {
  onClose: () => void;
  objectCount: number;
}

export default function ShareModal({ onClose, objectCount }: ShareModalProps) {
  const shareText = `I just left my mark on Earth Board.\n\nOne canvas. Everyone. Forever.\n\nJoin ${objectCount} others →`;
  const shareUrl = window.location.origin;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    // Could add a toast notification here
  };

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, #1a1f3a 0%, #2a2f4a 100%)',
          borderRadius: '12px',
          padding: '3rem 2.5rem',
          maxWidth: '500px',
          width: '90%',
          border: '2px solid rgba(139, 115, 85, 0.3)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 80px rgba(139, 115, 85, 0.1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            fontSize: '4rem',
            marginBottom: '1rem',
          }}>✨</div>
          <h2 style={{
            fontFamily: '"Kalam", cursive',
            fontSize: '2rem',
            color: '#F5F5DC',
            marginBottom: '0.75rem',
            textTransform: 'lowercase',
          }}>you marked earth board</h2>
          <p style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontSize: '1.125rem',
            color: 'rgba(245, 245, 220, 0.7)',
            fontStyle: 'italic',
            textTransform: 'lowercase',
          }}>your creation is now part of today's eternal canvas</p>
        </div>

        {/* Share message preview */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '8px',
          padding: '1.25rem',
          marginBottom: '2rem',
          border: '1px solid rgba(139, 115, 85, 0.2)',
        }}>
          <p style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontSize: '1rem',
            color: 'rgba(245, 245, 220, 0.9)',
            lineHeight: 1.6,
            whiteSpace: 'pre-line',
          }}>{shareText}</p>
        </div>

        {/* Share buttons */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <button
            onClick={handleTwitterShare}
            style={{
              flex: 1,
              padding: '1rem',
              background: '#1DA1F2',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontFamily: '"Kalam", cursive',
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'all 200ms',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#1a91da';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#1DA1F2';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Share on Twitter
          </button>

          <button
            onClick={handleCopyLink}
            style={{
              flex: 1,
              padding: '1rem',
              background: 'rgba(139, 115, 85, 0.3)',
              border: '1px solid rgba(139, 115, 85, 0.5)',
              borderRadius: '8px',
              color: '#F5F5DC',
              fontFamily: '"Kalam", cursive',
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'all 200ms',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(139, 115, 85, 0.5)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(139, 115, 85, 0.3)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Copy Link
          </button>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '0.75rem',
            background: 'transparent',
            border: 'none',
            color: 'rgba(245, 245, 220, 0.5)',
            fontFamily: '"Cormorant Garamond", serif',
            fontSize: '0.875rem',
            cursor: 'pointer',
            textTransform: 'lowercase',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'rgba(245, 245, 220, 0.8)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'rgba(245, 245, 220, 0.5)';
          }}
        >
          continue creating
        </button>
      </div>
    </div>
  );
}
