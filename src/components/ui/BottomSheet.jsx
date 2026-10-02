import { useEffect, useId, useRef } from 'react'
import { useTranslation } from 'react-i18next'

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'

// A panel that slides up from the bottom for secondary choices (method picker,
// later post ••• menus). Content-blind: the caller passes the title and body.
// Closes on Escape, a tap on the backdrop, or the close button; keeps Tab
// inside while open, and hands focus back to whatever opened it. Mark the
// element to focus first with `data-autofocus` (not React's autoFocus, which
// would fire before the opener is remembered).
export function BottomSheet({ open, onClose, title, children }) {
  const { t } = useTranslation()
  const titleId = useId()
  const panelRef = useRef(null)
  // Latest onClose without re-running the open/close effect on every render.
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    if (!open) return

    const opener = document.activeElement
    const panel = panelRef.current
    // Start on the element the caller marked (e.g. the selected option), else the panel.
    const start = panel.querySelector('[data-autofocus]') ?? panel
    start.focus()

    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onCloseRef.current()
        return
      }
      if (event.key !== 'Tab') return
      const items = [...panel.querySelectorAll(FOCUSABLE)]
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      if (event.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = overflow
      opener?.focus?.()
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-sm max-h-[80vh] overflow-y-auto bg-white rounded-t-2xl shadow-lg outline-none animate-sheet-up pb-[env(safe-area-inset-bottom)]"
      >
        <div className="sticky top-0 bg-white flex items-center justify-between gap-2 px-4 pt-3 pb-2">
          <h2 id={titleId} className="font-semibold text-gray-900">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.close')}
            className="-mr-2 p-2 rounded-full text-gray-500 hover:bg-gray-100"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-2 pb-4">{children}</div>
      </div>
    </div>
  )
}
