import { useState, useEffect, useRef } from 'react';
import type { Canvas, CanvasObject } from '../types/canvas.types';
import { supabase } from '../services/supabase';

interface TimelapseViewerProps {
  canvas: Canvas;
  onClose: () => void;
}

export default function TimelapseViewer({ canvas, onClose }: TimelapseViewerProps) {
  const [objects, setObjects] = useState<CanvasObject[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(50); // milliseconds per object
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch all objects for this canvas, sorted by creation time
  useEffect(() => {
    const fetchObjects = async () => {
      const { data, error } = await supabase
        .from('canvas_objects')
        .select('*')
        .eq('canvas_id', canvas.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching objects:', error);
        return;
      }

      setObjects(data || []);
    };

    fetchObjects();
  }, [canvas.id]);

  // Handle playback
  useEffect(() => {
    if (isPlaying && currentIndex < objects.length) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex(prev => {
          if (prev >= objects.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, speed);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, currentIndex, objects.length, speed]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
  };

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
  };

  // Get visible objects up to current index
  const visibleObjects = objects.slice(0, currentIndex + 1);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 100,
        background: 'rgba(0, 0, 0, 0.95)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, #1a1f3a 0%, #2a2f4a 100%)',
          borderRadius: '12px',
          padding: '2rem',
          maxWidth: '90vw',
          maxHeight: '90vh',
          border: '2px solid rgba(139, 115, 85, 0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
        }}>
          <div>
            <h2 style={{
              fontFamily: '"Kalam", cursive',
              fontSize: '1.75rem',
              color: '#F5F5DC',
              marginBottom: '0.25rem',
              textTransform: 'lowercase',
            }}>{canvas.name || 'untitled'}</h2>
            <p style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontSize: '0.875rem',
              color: 'rgba(245, 245, 220, 0.6)',
              fontStyle: 'italic',
            }}>
              {currentIndex + 1} of {objects.length} marks
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              fontSize: '2rem',
              color: 'rgba(245, 245, 220, 0.7)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0 0.5rem',
            }}
          >
            ×
          </button>
        </div>

        {/* Canvas preview */}
        <div style={{
          width: '800px',
          height: '450px',
          background: '#000000',
          borderRadius: '8px',
          border: '2px solid rgba(139, 115, 85, 0.3)',
          marginBottom: '1.5rem',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Render visible objects */}
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            {visibleObjects.map((obj) => (
              <div
                key={obj.id}
                style={{
                  position: 'absolute',
                  left: obj.transform?.x || 0,
                  top: obj.transform?.y || 0,
                  fontSize: obj.type === 'sticker' ? '2rem' : '1rem',
                  color: obj.style?.color || '#FFFFFF',
                  pointerEvents: 'none',
                }}
              >
                {obj.type === 'sticker' && obj.data?.stickerId}
              </div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <button
            onClick={handleReset}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'rgba(139, 115, 85, 0.3)',
              border: '1px solid rgba(139, 115, 85, 0.5)',
              borderRadius: '8px',
              color: '#F5F5DC',
              fontFamily: '"Kalam", cursive',
              fontSize: '0.875rem',
              cursor: 'pointer',
              textTransform: 'lowercase',
            }}
          >
            reset
          </button>

          <button
            onClick={handlePlayPause}
            style={{
              padding: '0.75rem 2rem',
              background: isPlaying ? 'rgba(139, 115, 85, 0.5)' : 'rgba(180, 83, 9, 0.5)',
              border: '1px solid rgba(139, 115, 85, 0.6)',
              borderRadius: '8px',
              color: '#F5F5DC',
              fontFamily: '"Kalam", cursive',
              fontSize: '0.875rem',
              cursor: 'pointer',
              textTransform: 'lowercase',
            }}
          >
            {isPlaying ? 'pause' : 'play'}
          </button>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              onClick={() => handleSpeedChange(100)}
              style={{
                padding: '0.5rem 1rem',
                background: speed === 100 ? 'rgba(139, 115, 85, 0.5)' : 'rgba(139, 115, 85, 0.2)',
                border: '1px solid rgba(139, 115, 85, 0.4)',
                borderRadius: '6px',
                color: 'rgba(245, 245, 220, 0.8)',
                fontFamily: '"Cormorant Garamond", serif',
                fontSize: '0.75rem',
                cursor: 'pointer',
              }}
            >
              1x
            </button>
            <button
              onClick={() => handleSpeedChange(50)}
              style={{
                padding: '0.5rem 1rem',
                background: speed === 50 ? 'rgba(139, 115, 85, 0.5)' : 'rgba(139, 115, 85, 0.2)',
                border: '1px solid rgba(139, 115, 85, 0.4)',
                borderRadius: '6px',
                color: 'rgba(245, 245, 220, 0.8)',
                fontFamily: '"Cormorant Garamond", serif',
                fontSize: '0.75rem',
                cursor: 'pointer',
              }}
            >
              2x
            </button>
            <button
              onClick={() => handleSpeedChange(10)}
              style={{
                padding: '0.5rem 1rem',
                background: speed === 10 ? 'rgba(139, 115, 85, 0.5)' : 'rgba(139, 115, 85, 0.2)',
                border: '1px solid rgba(139, 115, 85, 0.4)',
                borderRadius: '6px',
                color: 'rgba(245, 245, 220, 0.8)',
                fontFamily: '"Cormorant Garamond", serif',
                fontSize: '0.75rem',
                cursor: 'pointer',
              }}
            >
              10x
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
