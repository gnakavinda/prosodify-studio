interface SpeechControlsSectionProps {
  speechRate: number
  setSpeechRate: (value: number) => void
  pitch: number
  setPitch: (value: number) => void
  volume: number
  setVolume: (value: number) => void
}

const SpeechControlsSection = ({
  speechRate,
  setSpeechRate,
  pitch,
  setPitch,
  volume,
  setVolume
}: SpeechControlsSectionProps) => (
  <div className="space-y-4">
    <SliderControl
      label="Speech Rate"
      value={speechRate}
      onChange={setSpeechRate}
      min={0.5}
      max={2}
      step={0.1}
      leftLabel="Slower"
      rightLabel="Faster"
    />

    <SliderControl
      label="Pitch"
      value={pitch}
      onChange={setPitch}
      min={0.5}
      max={1.5}
      step={0.1}
      leftLabel="Lower"
      rightLabel="Higher"
    />

    <SliderControl
      label="Volume"
      value={volume}
      onChange={setVolume}
      min={0.2}
      max={1.5}
      step={0.1}
      leftLabel="Quieter"
      rightLabel="Louder"
    />
  </div>
)

interface SliderControlProps {
  label: string
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step: number
  leftLabel: string
  rightLabel: string
}

const SliderControl = ({
  label,
  value,
  onChange,
  min,
  max,
  step,
  leftLabel,
  rightLabel
}: SliderControlProps) => {
  const percentage = ((value - min) / (max - min)) * 100

  // Format value for display
  const formatValue = (val: number) => {
    if (label === 'Speech Rate') {
      if (val < 1) return `${val}x (${leftLabel})`
      if (val > 1) return `${val}x (${rightLabel})`
      return `${val}x (Normal)`
    }
    return `${val}x`
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {label}
        </label>
        <span className="text-sm font-medium text-black dark:text-white bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
          {formatValue(value)}
        </span>
      </div>
      
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
      
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-300 dark:bg-gray-600 rounded-full appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, #000000 0%, #000000 ${percentage}%, #d1d5db ${percentage}%, #d1d5db 100%)`
          }}
        />
        <style jsx>{`
          .slider::-webkit-slider-thumb {
            appearance: none;
            height: 20px;
            width: 20px;
            border-radius: 50%;
            background: #ffffff;
            cursor: pointer;
            border: 3px solid #000000;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          
          .slider::-moz-range-thumb {
            height: 20px;
            width: 20px;
            border-radius: 50%;
            background: #ffffff;
            cursor: pointer;
            border: 3px solid #000000;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            appearance: none;
          }
          
          .dark .slider {
            background: linear-gradient(to right, #ffffff 0%, #ffffff ${percentage}%, #4b5563 ${percentage}%, #4b5563 100%) !important;
          }
          
          .dark .slider::-webkit-slider-thumb {
            background: #1f2937;
            border-color: #ffffff;
          }
          
          .dark .slider::-moz-range-thumb {
            background: #1f2937;
            border-color: #ffffff;
          }
        `}</style>
      </div>
    </div>
  )
}

export default SpeechControlsSection