import { useTranslation } from 'react-i18next'
import { BottomSheet } from '../../components/ui/BottomSheet'
import { SheetOption as Option } from '../../components/ui/SheetOption'

function Group({ heading, masjids, selectedId, onPick }) {
  if (!masjids.length) return null
  return (
    <section className="mt-3">
      <h3 className="px-3 pb-1 text-xs font-semibold text-gray-500 uppercase">{heading}</h3>
      <ul>
        {masjids.map((m) => (
          <Option key={m.id} label={m.name} selected={m.id === selectedId} onPick={() => onPick(m.id)} />
        ))}
      </ul>
    </section>
  )
}

// "Choose masjid" (spec jamaat-board.md §4.3, AC11): No masjid, then My
// masjids and All masjids, as on the tab. Picking one applies it and closes.
export function ChooseMasjidSheet({ open, onClose, myMasjids, otherMasjids, selectedId, onSelect }) {
  const { t } = useTranslation()

  function pick(id) {
    onSelect(id)
    onClose()
  }

  return (
    <BottomSheet open={open} onClose={onClose} title={t('board.chooseMasjid')}>
      <ul>
        <Option label={t('board.noMasjid')} selected={!selectedId} onPick={() => pick(null)} />
      </ul>
      <Group heading={t('prayerTimes.myMasjids')} masjids={myMasjids} selectedId={selectedId} onPick={pick} />
      <Group heading={t('prayerTimes.allMasjids')} masjids={otherMasjids} selectedId={selectedId} onPick={pick} />
    </BottomSheet>
  )
}
