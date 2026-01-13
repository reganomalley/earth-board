import { COLORS, COLOR_NAMES } from '../utils/colorPalette';

export default function ColorPalette({ selectedColor, onColorSelect, disabled }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <h3 className="text-lg font-semibold text-gray-800">Color Palette</h3>
      <div className="grid grid-cols-4 gap-2">
        {COLORS.map((color, index) => (
          <button
            key={index}
            onClick={() => onColorSelect(index)}
            disabled={disabled}
            className={`
              w-12 h-12 rounded-lg border-2 transition-all
              ${selectedColor === index ? 'border-blue-500 scale-110 shadow-lg' : 'border-gray-300'}
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 hover:shadow-md cursor-pointer'}
            `}
            style={{ backgroundColor: color }}
            title={COLOR_NAMES[index]}
            aria-label={`Select ${COLOR_NAMES[index]}`}
          />
        ))}
      </div>
      {selectedColor !== null && (
        <p className="text-sm text-gray-600">
          Selected: <span className="font-semibold">{COLOR_NAMES[selectedColor]}</span>
        </p>
      )}
    </div>
  );
}
