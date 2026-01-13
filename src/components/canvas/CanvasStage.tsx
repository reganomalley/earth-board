import { useState, useRef } from 'react';
import { Stage } from 'react-konva';
import CanvasLayer from './CanvasLayer';
import { generateStroke } from '../../utils/strokeHelpers';
import { validateTextInput } from '../../utils/moderationHelpers';
import { dateToRoman } from '../../utils/romanNumerals';
import { soundSystem } from '../../utils/soundEffects';
import type { CanvasObject, PenOptions, ToolType } from '../../types/canvas.types';

interface CanvasStageProps {
  width: number;
  height: number;
  objects: CanvasObject[];
  activeTool: ToolType;
  penOptions: PenOptions;
  selectedEmoji: string;
  onObjectCreate: (object: Omit<CanvasObject, 'id' | 'canvas_id' | 'created_by' | 'created_at'>) => void;
  disabled?: boolean;
}

export default function CanvasStage({
  width,
  height,
  objects,
  activeTool,
  penOptions,
  selectedEmoji,
  onObjectCreate,
  disabled,
}: CanvasStageProps) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<number[][]>([]);
  const [shapeStart, setShapeStart] = useState<{ x: number; y: number } | null>(null);
  const [shapeEnd, setShapeEnd] = useState<{ x: number; y: number } | null>(null);
  const stageRef = useRef<any>(null);

  const handleMouseDown = (e: any) => {
    if (disabled) return;

    const pos = e.target.getStage().getPointerPosition();

    // Handle text placement
    if (activeTool === 'text') {
      const text = prompt('Enter text (max 30 characters):');
      if (text && text.trim()) {
        const trimmedText = text.trim().slice(0, 30);

        // Validate text for inappropriate content
        const validation = validateTextInput(trimmedText);
        if (!validation.valid) {
          alert(validation.message || 'Invalid text');
          return;
        }

        const textObject: Omit<CanvasObject, 'id' | 'canvas_id' | 'created_by' | 'created_at'> = {
          type: 'text',
          data: {
            text: trimmedText,
            fontSize: penOptions.size * 2,
            fontFamily: '"Kalam", cursive',
            align: 'left',
          },
          style: {
            fill: penOptions.color,
          },
          transform: {
            x: pos.x,
            y: pos.y,
          },
        };
        onObjectCreate(textObject);
        soundSystem.playPop();
      }
      return;
    }

    // Handle sticker placement
    if (activeTool === 'sticker') {
      const stickerObject: Omit<CanvasObject, 'id' | 'canvas_id' | 'created_by' | 'created_at'> = {
        type: 'sticker',
        data: {
          emoji: selectedEmoji,
          size: 48,
        },
        style: {},
        transform: {
          x: pos.x,
          y: pos.y,
        },
      };
      onObjectCreate(stickerObject);
      soundSystem.playPop();
      return;
    }

    // Handle shape drawing (circle, rectangle)
    if (activeTool === 'circle' || activeTool === 'rectangle') {
      setIsDrawing(true);
      setShapeStart(pos);
      setShapeEnd(pos);
      return;
    }

    // Handle pen drawing
    if (activeTool !== 'pen') return;

    setIsDrawing(true);
    setCurrentPoints([[pos.x, pos.y, 0.5]]);
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing) return;

    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();

    // Handle shape dragging
    if ((activeTool === 'circle' || activeTool === 'rectangle') && shapeStart) {
      setShapeEnd(pos);
      return;
    }

    // Handle pen drawing
    if (activeTool === 'pen') {
      setCurrentPoints((prev) => [...prev, [pos.x, pos.y, 0.5]]);
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;

    setIsDrawing(false);

    // Handle shape creation
    if ((activeTool === 'circle' || activeTool === 'rectangle') && shapeStart && shapeEnd) {
      const minSize = 10; // Minimum shape size

      if (activeTool === 'circle') {
        const radius = Math.sqrt(
          Math.pow(shapeEnd.x - shapeStart.x, 2) + Math.pow(shapeEnd.y - shapeStart.y, 2)
        );

        if (radius >= minSize) {
          const circleObject: Omit<CanvasObject, 'id' | 'canvas_id' | 'created_by' | 'created_at'> = {
            type: 'circle',
            data: {
              radius: radius,
            },
            style: {
              fill: 'transparent',
              stroke: penOptions.color,
              strokeWidth: penOptions.size / 4,
            },
            transform: {
              x: shapeStart.x,
              y: shapeStart.y,
            },
          };
          onObjectCreate(circleObject);
          soundSystem.playPop();
        }
      } else if (activeTool === 'rectangle') {
        const width = Math.abs(shapeEnd.x - shapeStart.x);
        const height = Math.abs(shapeEnd.y - shapeStart.y);

        if (width >= minSize && height >= minSize) {
          const rectangleObject: Omit<CanvasObject, 'id' | 'canvas_id' | 'created_by' | 'created_at'> = {
            type: 'rectangle',
            data: {
              width: width,
              height: height,
            },
            style: {
              fill: 'transparent',
              stroke: penOptions.color,
              strokeWidth: penOptions.size / 4,
            },
            transform: {
              x: Math.min(shapeStart.x, shapeEnd.x),
              y: Math.min(shapeStart.y, shapeEnd.y),
            },
          };
          onObjectCreate(rectangleObject);
          soundSystem.playPop();
        }
      }

      setShapeStart(null);
      setShapeEnd(null);
      return;
    }

    // Handle pen drawing
    if (activeTool === 'pen') {
      if (currentPoints.length < 2) {
        setCurrentPoints([]);
        return;
      }

      // Generate smooth stroke with perfect-freehand
      const strokePoints = generateStroke(currentPoints, penOptions);

      // Create stroke object
      const strokeObject: Omit<CanvasObject, 'id' | 'canvas_id' | 'created_by' | 'created_at'> = {
        type: 'stroke',
        data: {
          points: currentPoints,
          strokePoints: strokePoints,
        },
        style: {
          color: penOptions.color,
          size: penOptions.size,
          thinning: penOptions.thinning,
          smoothing: penOptions.smoothing,
          streamline: penOptions.streamline,
        },
        transform: {
          x: 0,
          y: 0,
        },
      };

      onObjectCreate(strokeObject);
      soundSystem.playWhoosh();
      setCurrentPoints([]);
    }
  };

  // Temporary objects being created
  const tempObjects: CanvasObject[] = [];

  // Temporary stroke being drawn
  if (isDrawing && activeTool === 'pen' && currentPoints.length > 1) {
    tempObjects.push({
      id: 'temp-stroke',
      canvas_id: 'temp',
      type: 'stroke',
      data: {
        points: currentPoints,
        strokePoints: generateStroke(currentPoints, penOptions),
      },
      style: {
        color: penOptions.color,
        size: penOptions.size,
      },
      transform: { x: 0, y: 0 },
    });
  }

  // Temporary circle being drawn
  if (isDrawing && activeTool === 'circle' && shapeStart && shapeEnd) {
    const radius = Math.sqrt(
      Math.pow(shapeEnd.x - shapeStart.x, 2) + Math.pow(shapeEnd.y - shapeStart.y, 2)
    );
    tempObjects.push({
      id: 'temp-circle',
      canvas_id: 'temp',
      type: 'circle',
      data: { radius },
      style: {
        fill: 'transparent',
        stroke: penOptions.color,
        strokeWidth: penOptions.size / 4,
      },
      transform: { x: shapeStart.x, y: shapeStart.y },
    });
  }

  // Temporary rectangle being drawn
  if (isDrawing && activeTool === 'rectangle' && shapeStart && shapeEnd) {
    const width = Math.abs(shapeEnd.x - shapeStart.x);
    const height = Math.abs(shapeEnd.y - shapeStart.y);
    tempObjects.push({
      id: 'temp-rectangle',
      canvas_id: 'temp',
      type: 'rectangle',
      data: { width, height },
      style: {
        fill: 'transparent',
        stroke: penOptions.color,
        strokeWidth: penOptions.size / 4,
      },
      transform: {
        x: Math.min(shapeStart.x, shapeEnd.x),
        y: Math.min(shapeStart.y, shapeEnd.y),
      },
    });
  }

  const allObjects = [...objects, ...tempObjects];

  const todayRoman = dateToRoman(new Date());

  return (
    <div className="border-2 border-gray-800 rounded-lg shadow-xl overflow-hidden relative">
      {/* Earth-textured background layer */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            linear-gradient(135deg,
              #FFF8DC 0%,
              #F5F5DC 25%,
              #FAEBD7 50%,
              #F0E68C 75%,
              #FFF8DC 100%
            )
          `,
          opacity: 0.4,
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 3px,
              rgba(139, 115, 85, 0.02) 3px,
              rgba(139, 115, 85, 0.02) 6px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 3px,
              rgba(139, 115, 85, 0.02) 3px,
              rgba(139, 115, 85, 0.02) 6px
            )
          `,
          opacity: 0.3,
        }}
      />

      {/* Date watermark in Roman numerals */}
      <div
        className="absolute bottom-6 right-8 pointer-events-none select-none"
        style={{
          fontFamily: '"Cormorant Garamond", serif',
          fontSize: '1.25rem',
          fontWeight: 700,
          color: '#8B0000',
          opacity: 0.6,
          letterSpacing: '0.15em',
          textShadow: '0 2px 4px rgba(0,0,0,0.2)',
          zIndex: 10,
        }}
      >
        {todayRoman}
      </div>

      <Stage
        ref={stageRef}
        width={width}
        height={height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
        style={{
          cursor: !disabled && activeTool === 'pen' ? 'crosshair' : !disabled && (activeTool === 'sticker' || activeTool === 'text' || activeTool === 'circle' || activeTool === 'rectangle') ? 'pointer' : 'default',
          backgroundColor: '#FFFEF5',
          touchAction: 'none', // Prevent default touch behaviors
        }}
      >
        <CanvasLayer objects={allObjects} />
      </Stage>
    </div>
  );
}
