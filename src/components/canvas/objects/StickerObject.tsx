import { Text } from 'react-konva';
import type { CanvasObject, StickerData } from '../../../types/canvas.types';

interface StickerObjectProps {
  object: CanvasObject;
}

export default function StickerObject({ object }: StickerObjectProps) {
  const data = object.data as StickerData;
  const transform = object.transform || { x: 0, y: 0 };

  // For emoji stickers, we'll render them as text
  const emoji = (data as any).emoji || '🌿';
  const size = (data as any).size || 48;

  return (
    <Text
      text={emoji}
      fontSize={size}
      {...transform}
    />
  );
}
