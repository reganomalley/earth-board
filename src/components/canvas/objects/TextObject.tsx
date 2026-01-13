import { Text } from 'react-konva';
import type { CanvasObject, TextData, TextStyle } from '../../../types/canvas.types';

interface TextObjectProps {
  object: CanvasObject;
}

export default function TextObject({ object }: TextObjectProps) {
  const data = object.data as TextData;
  const style = object.style as TextStyle;
  const transform = object.transform || { x: 0, y: 0 };

  return (
    <Text
      x={transform.x}
      y={transform.y}
      text={data.text}
      fontSize={data.fontSize}
      fontFamily={data.fontFamily}
      fill={style.fill}
      align={data.align || 'left'}
      width={data.width}
    />
  );
}
