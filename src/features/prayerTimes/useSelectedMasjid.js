import { useEffect, useState } from 'react'

// Saved on this device only, like the calculation method (spec jamaat-board.md AC13).
export const SELECTED_MASJID_STORAGE_KEY = 'mbeat_selected_masjid'

// Storage can throw (private mode, blocked site data); that means "no masjid" (AC14).
function getStoredId() {
  try {
    return localStorage.getItem(SELECTED_MASJID_STORAGE_KEY)
  } catch {
    return null
  }
}

function storeId(id) {
  try {
    if (id) localStorage.setItem(SELECTED_MASJID_STORAGE_KEY, id)
    else localStorage.removeItem(SELECTED_MASJID_STORAGE_KEY)
  } catch {
    // Not remembered after a reload, but still applied for this visit.
  }
}

// The masjid whose jamaat times fill the board on the Prayer Times tab.
// `masjids` is the tab's loaded list and `ready` says it loaded without error.
// Until then the selected masjid is null, so the Jamaat column stays blank
// (AC15). A saved id missing from a loaded list is dropped (AC14).
export function useSelectedMasjid(masjids, ready) {
  const [selectedId, setSelectedId] = useState(getStoredId)
  const masjid = ready ? (masjids.find((m) => m.id === selectedId) ?? null) : null
  const isMissing = ready && selectedId !== null && masjid === null

  useEffect(() => {
    if (isMissing) storeId(null)
  }, [isMissing])

  function select(id) {
    setSelectedId(id)
    storeId(id)
  }

  return { masjid, select }
}
