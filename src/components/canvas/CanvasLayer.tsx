import { Layer } from 'react-konva';
import type { CanvasObject } from '../../types/canvas.types';
import StrokeObject from './objects/StrokeObject';
import StickerObject from './objects/StickerObject';
import TextObject from './objects/TextObject';
import CircleObject from './objects/CircleObject';
import RectangleObject from './objects/RectangleObject';

interface CanvasLayerProps {
  objects: CanvasObject[];
}

export default function CanvasLayer({ objects }: CanvasLayerProps) {
  return (
    <Layer>
      {objects.map((obj) => {
        switch (obj.type) {
          case 'stroke':
            return <StrokeObject key={obj.id} object={obj} />;
          case 'sticker':
            return <StickerObject key={obj.id} object={obj} />;
          case 'text':
            return <TextObject key={obj.id} object={obj} />;
          case 'circle':
            return <CircleObject key={obj.id} object={obj} />;
          case 'rectangle':
            return <RectangleObject key={obj.id} object={obj} />;
          default:
            return null;
        }
      })}
    </Layer>
  );
}
