import { useState } from 'react'

// Spec jamaat-board.md AC23–AC24. Saved on this device only, like the
// calculation method.
export const BOARD_STYLES = ['painted', 'digital', 'wooden']
export const DEFAULT_BOARD_STYLE = 'painted'
export const BOARD_STYLE_STORAGE_KEY = 'mbeat_jamaat_board_style'

function isBoardStyle(value) {
  return BOARD_STYLES.includes(value)
}

// A missing, unrecognised or unreadable value means Painted.
function getStoredBoardStyle() {
  try {
    const stored = localStorage.getItem(BOARD_STYLE_STORAGE_KEY)
    return isBoardStyle(stored) ? stored : DEFAULT_BOARD_STYLE
  } catch {
    return DEFAULT_BOARD_STYLE
  }
}

// The chosen board style, and a setter that remembers it. Unknown values are ignored.
export function useBoardStyle() {
  const [style, setStyleState] = useState(getStoredBoardStyle)

  function setStyle(next) {
    if (!isBoardStyle(next)) return
    setStyleState(next)
    try {
      localStorage.setItem(BOARD_STYLE_STORAGE_KEY, next)
    } catch {
      // Not remembered after a reload, but still applied for this visit.
    }
  }

  return [style, setStyle]
}
