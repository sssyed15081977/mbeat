// The tab's "needs volunteers" line, once dismissed, stays hidden for that
// masjid for 30 days on this device (AC16; §7 decision 8). Stored as a map of
// masjid id -> dismissed-at (ms).
export const VOLUNTEER_PROMPT_STORAGE_KEY = 'mbeat_volunteer_prompt_dismissed'
const DISMISS_FOR_MS = 30 * 24 * 60 * 60 * 1000

// Storage can throw (private mode, blocked site data); that means "not dismissed".
function read() {
  try {
    const parsed = JSON.parse(localStorage.getItem(VOLUNTEER_PROMPT_STORAGE_KEY) ?? '{}')
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export function isPromptDismissed(masjidId, now = Date.now()) {
  const dismissedAt = read()[masjidId]
  return typeof dismissedAt === 'number' && now - dismissedAt < DISMISS_FOR_MS
}

export function dismissPrompt(masjidId, now = Date.now()) {
  // Drop expired entries so the map doesn't grow forever.
  const kept = Object.fromEntries(Object.entries(read()).filter(([, at]) => now - at < DISMISS_FOR_MS))
  kept[masjidId] = now
  try {
    localStorage.setItem(VOLUNTEER_PROMPT_STORAGE_KEY, JSON.stringify(kept))
  } catch {
    // Not remembered after a reload, but hidden for this visit.
  }
}
