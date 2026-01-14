import { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Line, Circle, Rect, Text } from 'react-konva';
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
          background: '#F5F5DC',
          borderRadius: '8px',
          border: '2px solid rgba(139, 115, 85, 0.3)',
          marginBottom: '1.5rem',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <Stage width={800} height={450} scaleX={0.571} scaleY={0.571}>
            <Layer>
              {visibleObjects.map((obj) => {
                const transform = obj.transform || { x: 0, y: 0 };
                const style = obj.style || {};

                // Render stroke/pen
                if (obj.type === 'stroke' && obj.data?.strokePoints) {
                  return (
                    <Line
                      key={obj.id}
                      points={obj.data.strokePoints.flat()}
                      stroke={style.color || '#000000'}
                      strokeWidth={style.strokeWidth || 2}
                      fill={style.fill || style.color || '#000000'}
                      lineCap="round"
                      lineJoin="round"
                      tension={0.5}
                      closed={true}
                    />
                  );
                }

                // Render circle
                if (obj.type === 'circle' && obj.data) {
                  const radius = Math.sqrt(
                    Math.pow(obj.data.endX - transform.x, 2) +
                    Math.pow(obj.data.endY - transform.y, 2)
                  );
                  return (
                    <Circle
                      key={obj.id}
                      x={transform.x}
                      y={transform.y}
                      radius={radius}
                      stroke={style.color || '#000000'}
                      strokeWidth={style.strokeWidth || 2}
                      fill={style.fill || 'transparent'}
                    />
                  );
                }

                // Render rectangle
                if (obj.type === 'rectangle' && obj.data) {
                  const width = obj.data.endX - transform.x;
                  const height = obj.data.endY - transform.y;
                  return (
                    <Rect
                      key={obj.id}
                      x={transform.x}
                      y={transform.y}
                      width={width}
                      height={height}
                      stroke={style.color || '#000000'}
                      strokeWidth={style.strokeWidth || 2}
                      fill={style.fill || 'transparent'}
                    />
                  );
                }

                // Render text
                if (obj.type === 'text' && obj.data?.text) {
                  return (
                    <Text
                      key={obj.id}
                      x={transform.x}
                      y={transform.y}
                      text={obj.data.text}
                      fontSize={style.fontSize || 24}
                      fontFamily={style.fontFamily || 'Kalam'}
                      fill={style.color || '#000000'}
                    />
                  );
                }

                // Render sticker (emoji)
                if (obj.type === 'sticker' && obj.data?.emoji) {
                  return (
                    <Text
                      key={obj.id}
                      x={transform.x}
                      y={transform.y}
                      text={obj.data.emoji}
                      fontSize={obj.data.size || 48}
                    />
                  );
                }

                return null;
              })}
            </Layer>
          </Stage>
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
