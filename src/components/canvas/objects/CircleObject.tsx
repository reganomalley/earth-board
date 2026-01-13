import { Circle } from 'react-konva';
import type { CanvasObject, CircleData, CircleStyle } from '../../../types/canvas.types';

interface CircleObjectProps {
  object: CanvasObject;
}

export default function CircleObject({ object }: CircleObjectProps) {
  const data = object.data as CircleData;
  const style = object.style as CircleStyle;
  const transform = object.transform || { x: 0, y: 0 };

  return (
    <Circle
      x={transform.x}
      y={transform.y}
      radius={data.radius}
      fill={style.fill}
      stroke={style.stroke}
      strokeWidth={style.strokeWidth || 2}
    />
  );
}
