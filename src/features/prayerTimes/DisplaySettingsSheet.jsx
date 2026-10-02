import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import { BottomSheet } from '../../components/ui/BottomSheet'
import { BoardStylePicker } from './BoardStylePicker'
import { CalcMethodPicker } from './CalcMethodPicker'

// "Display settings", opened from the gear on the Jamaat board (spec
// jamaat-board.md AC9, AC23): Board style, then Calculation method. Each
// choice applies at once and the sheet stays open, so both can be changed
// in one visit; it closes with ×, Escape or a tap outside.
export function DisplaySettingsSheet({ open, onClose, style, onStyleChange, method, onMethodChange }) {
  const { t } = useTranslation()
  const styleHeadingId = useId()

  return (
    <BottomSheet open={open} onClose={onClose} title={t('board.displaySettings')}>
      <section className="pt-1 pb-3">
        <h3 id={styleHeadingId} className="px-3 pb-2 text-xs font-semibold text-gray-500 uppercase">
          {t('board.style')}
        </h3>
        <BoardStylePicker style={style} onChange={onStyleChange} labelledBy={styleHeadingId} />
      </section>
      <section>
        <h3 className="px-3 pb-1 text-xs font-semibold text-gray-500 uppercase">{t('begins.methodHeading')}</h3>
        <CalcMethodPicker method={method} onChange={onMethodChange} />
      </section>
    </BottomSheet>
  )
}
