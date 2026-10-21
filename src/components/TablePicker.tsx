import { TABLE_ORDER, useSuggestedTable, type TableChoice } from '../utils/timesFacts'

interface Props {
  value: TableChoice
  onChange: (t: TableChoice) => void
}

export default function TablePicker({ value, onChange }: Props) {
  const suggested = useSuggestedTable()
  const choices: TableChoice[] = [...TABLE_ORDER, 'mix']
  return (
    <div className="max-w-xs w-full">
      <p className="text-white/60 text-sm mb-2">Which times table?</p>
      <div className="grid grid-cols-5 gap-2">
        {choices.map(t => (
          <button
            key={t}
            type="button"
            onClick={() => onChange(t)}
            className={`relative rounded-xl py-2.5 font-black text-sm border-2 transition-colors ${
              value === t
                ? 'bg-yellow-400 border-yellow-300 text-amber-900'
                : 'bg-white/10 border-white/20 text-white'
            }`}
          >
            {t === 'mix' ? '🎲' : `×${t}`}
            {t === suggested && (
              <span className="absolute -top-2 -right-1 text-[9px] bg-pink-500 text-white rounded-full px-1 leading-4">now</span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
