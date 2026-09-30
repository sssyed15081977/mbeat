import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export function ImageLightbox({ src, alt, open, onClose }) {
  const { t } = useTranslation()

  useEffect(() => {
    if (!open) return

    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label={t('common.close')}
        className="absolute top-4 right-4 text-white p-2 rounded-full hover:bg-white/10"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
      <img
        src={src}
        alt={alt}
        onClick={(event) => event.stopPropagation()}
        className="max-w-full max-h-full object-contain rounded"
      />
    </div>
  )
}
