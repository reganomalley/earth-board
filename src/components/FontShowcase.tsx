// Temporary component to showcase different font options
// Delete this file after choosing your font

export default function FontShowcase() {
  const fonts = [
    { name: 'Fredericka the Great', family: '"Fredericka the Great", serif', note: 'Current (2011 Tumblr vibe)' },
    { name: 'Cinzel', family: '"Cinzel", serif', note: 'Classical, elegant' },
    { name: 'Playfair Display', family: '"Playfair Display", serif', note: 'Sophisticated, editorial' },
    { name: 'Cormorant Garamond', family: '"Cormorant Garamond", serif', note: 'Currently used for body text' },
    { name: 'Abril Fatface', family: '"Abril Fatface", serif', note: 'Bold, dramatic' },
    { name: 'Spectral', family: '"Spectral", serif', note: 'Modern serif, elegant' },
    { name: 'Libre Baskerville', family: '"Libre Baskerville", serif', note: 'Classic, refined' },
    { name: 'EB Garamond', family: '"EB Garamond", serif', note: 'Timeless, book-like' },
    { name: 'Crimson Text', family: '"Crimson Text", serif', note: 'Scholarly, classic' },
    { name: 'Lora', family: '"Lora", serif', note: 'Contemporary serif' },
    { name: 'Josefin Slab', family: '"Josefin Slab", serif', note: 'Geometric slab serif' },
    { name: 'Montserrat', family: '"Montserrat", sans-serif', note: 'Modern, clean sans-serif' },
    { name: 'Raleway', family: '"Raleway", sans-serif', note: 'Elegant sans-serif, thin' },
    { name: 'Philosopher', family: '"Philosopher", sans-serif', note: 'Unique, architectural' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%)',
      padding: '4rem 2rem',
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <h1 style={{
          fontFamily: '"Cormorant Garamond", serif',
          fontSize: '2rem',
          color: '#F5F5DC',
          textAlign: 'center',
          marginBottom: '1rem',
          fontWeight: 300,
        }}>Font Showcase - Choose Your Style</h1>

        <p style={{
          fontFamily: '"Cormorant Garamond", serif',
          fontSize: '1rem',
          color: 'rgba(245, 245, 220, 0.6)',
          textAlign: 'center',
          marginBottom: '4rem',
          fontStyle: 'italic',
        }}>scroll through and see which font speaks to you</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
          {fonts.map((font) => (
            <div key={font.name} style={{
              background: 'rgba(30, 35, 50, 0.6)',
              borderRadius: '12px',
              padding: '3rem 2rem',
              border: '2px solid rgba(139, 115, 85, 0.3)',
            }}>
              {/* Font name and note */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem',
                flexWrap: 'wrap',
                gap: '1rem',
              }}>
                <h3 style={{
                  fontFamily: '"Cormorant Garamond", serif',
                  fontSize: '1.25rem',
                  color: '#F5F5DC',
                  fontWeight: 600,
                }}>{font.name}</h3>
                <span style={{
                  fontFamily: '"Cormorant Garamond", serif',
                  fontSize: '0.875rem',
                  color: 'rgba(245, 245, 220, 0.5)',
                  fontStyle: 'italic',
                }}>{font.note}</span>
              </div>

              {/* Earth Board example */}
              <div style={{
                background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 25%, #2a2f4a 50%, #1a1f3a 75%, #0a0e27 100%)',
                padding: '3rem 2rem',
                borderRadius: '8px',
                marginBottom: '2rem',
                position: 'relative',
                overflow: 'hidden',
              }}>
                {/* Cosmic background */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `
                    radial-gradient(2px 2px at 20% 30%, white, transparent),
                    radial-gradient(1px 1px at 60% 70%, white, transparent),
                    radial-gradient(1px 1px at 50% 50%, white, transparent)
                  `,
                  backgroundSize: '200px 200px, 250px 250px, 300px 300px',
                  opacity: 0.3,
                  pointerEvents: 'none',
                }} />

                <div style={{ position: 'relative', zIndex: 1 }}>
                  <p style={{
                    fontFamily: '"Cormorant Garamond", serif',
                    fontSize: '0.75rem',
                    color: 'rgba(245, 245, 220, 0.4)',
                    marginBottom: '0.5rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                  }}>Canvas Page</p>
                  <h2 style={{
                    fontFamily: font.family,
                    fontSize: '4rem',
                    color: '#F5F5DC',
                    textShadow: '0 0 30px rgba(245, 245, 220, 0.3), 0 4px 15px rgba(0,0,0,0.8)',
                    letterSpacing: '0.05em',
                    textTransform: 'lowercase',
                    marginBottom: '0.5rem',
                  }}>earth board</h2>
                  <p style={{
                    fontFamily: '"Cormorant Garamond", serif',
                    fontSize: '1.25rem',
                    color: 'rgba(245, 245, 220, 0.7)',
                    fontStyle: 'italic',
                  }}>a shared canvas where earth and creativity converge.</p>
                </div>
              </div>

              {/* Archives example */}
              <div style={{
                background: 'linear-gradient(to bottom, #0d0a15 0%, #1a1520 50%, #0d0a15 100%)',
                padding: '3rem 2rem',
                borderRadius: '8px',
                position: 'relative',
                overflow: 'hidden',
              }}>
                {/* Ethereal background */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `
                    radial-gradient(ellipse at 30% 50%, rgba(140, 120, 180, 0.15) 0%, transparent 50%)
                  `,
                  pointerEvents: 'none',
                }} />

                <div style={{ position: 'relative', zIndex: 1 }}>
                  <p style={{
                    fontFamily: '"Cormorant Garamond", serif',
                    fontSize: '0.75rem',
                    color: 'rgba(200, 180, 220, 0.4)',
                    marginBottom: '0.5rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                  }}>Archives Page</p>
                  <h2 style={{
                    fontFamily: font.family,
                    fontSize: '4rem',
                    color: '#E8DCF0',
                    textShadow: '0 0 40px rgba(200, 180, 220, 0.3), 0 4px 20px rgba(0,0,0,0.9)',
                    letterSpacing: '0.1em',
                    textTransform: 'lowercase',
                    marginBottom: '0.5rem',
                  }}>the archives</h2>
                  <p style={{
                    fontFamily: '"Cormorant Garamond", serif',
                    fontSize: '1.25rem',
                    color: 'rgba(200, 180, 220, 0.7)',
                    fontStyle: 'italic',
                  }}>where canvases rest eternal</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
