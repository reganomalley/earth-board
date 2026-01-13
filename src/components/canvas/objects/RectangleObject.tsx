import { Rect } from 'react-konva';
import type { CanvasObject, RectangleData, RectangleStyle } from '../../../types/canvas.types';

interface RectangleObjectProps {
  object: CanvasObject;
}

export default function RectangleObject({ object }: RectangleObjectProps) {
  const data = object.data as RectangleData;
  const style = object.style as RectangleStyle;
  const transform = object.transform || { x: 0, y: 0 };

  return (
    <Rect
      x={transform.x}
      y={transform.y}
      width={data.width}
      height={data.height}
      fill={style.fill}
      stroke={style.stroke}
      strokeWidth={style.strokeWidth || 2}
      cornerRadius={style.cornerRadius || 0}
    />
  );
}
