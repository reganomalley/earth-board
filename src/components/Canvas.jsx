import { useEffect, useRef, useState } from 'react';
import { COLORS, getColorHex } from '../utils/colorPalette';

const GRID_SIZE = 100;
const PIXEL_SIZE = 10;
const CANVAS_WIDTH = GRID_SIZE * PIXEL_SIZE;
const CANVAS_HEIGHT = GRID_SIZE * PIXEL_SIZE;

export default function Canvas({ pixels, selectedColor, onPixelClick, disabled }) {
  const canvasRef = useRef(null);
  const [hoveredPixel, setHoveredPixel] = useState(null);

  // Render all pixels to canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Clear canvas
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw grid
    ctx.strokeStyle = '#E0E0E0';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * PIXEL_SIZE, 0);
      ctx.lineTo(i * PIXEL_SIZE, CANVAS_HEIGHT);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * PIXEL_SIZE);
      ctx.lineTo(CANVAS_WIDTH, i * PIXEL_SIZE);
      ctx.stroke();
    }

    // Draw pixels
    pixels.forEach(({ x, y, color }) => {
      ctx.fillStyle = getColorHex(color);
      ctx.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
    });

    // Draw hover preview
    if (hoveredPixel && !disabled) {
      const { x, y } = hoveredPixel;
      ctx.fillStyle = getColorHex(selectedColor);
      ctx.globalAlpha = 0.5;
      ctx.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
      ctx.globalAlpha = 1.0;
    }
  }, [pixels, hoveredPixel, selectedColor, disabled]);

  const handleCanvasClick = (e) => {
    if (disabled) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / PIXEL_SIZE);
    const y = Math.floor((e.clientY - rect.top) / PIXEL_SIZE);

    if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
      onPixelClick(x, y);
    }
  };

  const handleMouseMove = (e) => {
    if (disabled) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / PIXEL_SIZE);
    const y = Math.floor((e.clientY - rect.top) / PIXEL_SIZE);

    if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
      setHoveredPixel({ x, y });
    } else {
      setHoveredPixel(null);
    }
  };

  const handleMouseLeave = () => {
    setHoveredPixel(null);
  };

  return (
    <div className="flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={`border-2 border-gray-800 rounded shadow-lg ${
          disabled ? 'cursor-not-allowed opacity-60' : 'cursor-crosshair'
        }`}
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
}
