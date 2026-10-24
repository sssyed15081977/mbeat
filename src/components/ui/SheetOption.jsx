function Check() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-brand flex-none" aria-hidden="true">
      <path d="M5 12l5 5L20 7" />
    </svg>
  )
}

// One choice in a BottomSheet list (Choose masjid, the amal level picker).
// The selected one is ticked and gets focus when the sheet opens.
export function SheetOption({ label, selected, onPick }) {
  return (
    <li>
      <button
        type="button"
        onClick={onPick}
        aria-current={selected ? 'true' : undefined}
        data-autofocus={selected || undefined}
        className={`w-full min-h-11 flex items-center gap-3 text-left px-3 py-3 rounded-lg ${
          selected ? 'bg-brand/10 text-brand font-medium' : 'text-gray-900 hover:bg-gray-50'
        }`}
      >
        <span className="flex-1 min-w-0 truncate">{label}</span>
        {selected && <Check />}
      </button>
    </li>
  )
}
