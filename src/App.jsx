import { useState } from 'react';
import CanvasContainer from './components/canvas/CanvasContainer';
import FontShowcase from './components/FontShowcase';

function App() {
  // Temporarily show font showcase - change to false to see the actual app
  const [showFontShowcase, setShowFontShowcase] = useState(false);

  if (showFontShowcase) {
    return (
      <div>
        <FontShowcase />
        <button
          onClick={() => setShowFontShowcase(false)}
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            padding: '1rem 2rem',
            background: 'rgba(245, 245, 220, 0.9)',
            border: '2px solid rgba(139, 115, 85, 0.6)',
            borderRadius: '8px',
            fontFamily: '"Cormorant Garamond", serif',
            fontSize: '1rem',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            zIndex: 1000,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 230, 1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(245, 245, 220, 0.9)';
          }}
        >
          Back to Earth Board
        </button>
      </div>
    );
  }

  return <CanvasContainer />;
}

export default App;
