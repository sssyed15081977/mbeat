import { get, getMany, promisifyRequest, set, update } from 'idb-keyval'

// Everything the Amal tracker saves stays on this device (spec §1). This file
// is the only code that touches IndexedDB.
//   entries:  amal date "YYYY-MM-DD" -> { [habitId]: true | level }
//   settings: "hiddenHabits" -> [habitId]
export const AMAL_DB_NAME = 'mbeat_amal'
const AMAL_DB_VERSION = 1
const HIDDEN_HABITS_KEY = 'hiddenHabits'

// idb-keyval's createStore opens one database per store, so open
// mbeat_amal with both stores here and hand idb-keyval a store per name.
async function openDb() {
  const request = indexedDB.open(AMAL_DB_NAME, AMAL_DB_VERSION)
  request.onupgradeneeded = () => {
    request.result.createObjectStore('entries')
    request.result.createObjectStore('settings')
  }
  return promisifyRequest(request)
}

function idbBackend(db) {
  const storeFor = (name) => (txMode, callback) => callback(db.transaction(name, txMode).objectStore(name))
  const stores = { entries: storeFor('entries'), settings: storeFor('settings') }
  return {
    persistent: true,
    get: (store, key) => get(key, stores[store]),
    getMany: (store, keys) => getMany(keys, stores[store]),
    set: (store, key, value) => set(key, value, stores[store]),
    update: (store, key, updater) => update(key, updater, stores[store]),
  }
}

// IndexedDB can be missing or refused (some private modes). The screen still
// works for the session; entries are lost when the app closes (AC17).
function memoryBackend() {
  const stores = { entries: new Map(), settings: new Map() }
  return {
    persistent: false,
    get: async (store, key) => stores[store].get(key),
    getMany: async (store, keys) => keys.map((key) => stores[store].get(key)),
    set: async (store, key, value) => {
      stores[store].set(key, value)
    },
    update: async (store, key, updater) => {
      stores[store].set(key, updater(stores[store].get(key)))
    },
  }
}

// Ask the browser not to clear our data under storage pressure (AC16). It
// may say no; everything works the same either way.
async function requestPersistence() {
  try {
    if (navigator.storage?.persist && !(await navigator.storage.persisted())) {
      await navigator.storage.persist()
    }
  } catch {
    // Not supported or refused: nothing to do.
  }
}

let backendPromise = null

function getBackend() {
  backendPromise ??= openDb().then(
    (db) => {
      requestPersistence()
      return idbBackend(db)
    },
    () => memoryBackend(),
  )
  return backendPromise
}

// Whether entries survive closing the app. False means the AC17 warning.
export async function isAmalStorePersistent() {
  return (await getBackend()).persistent
}

// The entries for `dateKeys`, as { [dateKey]: { [habitId]: value } }.
// Dates with nothing logged map to {}.
export async function getEntries(dateKeys) {
  const backend = await getBackend()
  const values = await backend.getMany('entries', dateKeys)
  return Object.fromEntries(dateKeys.map((dateKey, i) => [dateKey, values[i] ?? {}]))
}

// Log `value` for one habit on one amal date; null clears it ("Not logged").
// Read-modify-write runs in one transaction, so quick taps don't overwrite
// each other.
export async function setEntryValue(dateKey, habitId, value) {
  const backend = await getBackend()
  await backend.update('entries', dateKey, (entry = {}) => {
    const next = { ...entry }
    if (value == null) delete next[habitId]
    else next[habitId] = value
    return next
  })
}

// The habits hidden in Manage habits, or null if the user has never changed
// them (the caller then uses DEFAULT_HIDDEN_HABITS).
export async function getHiddenHabits() {
  const backend = await getBackend()
  return (await backend.get('settings', HIDDEN_HABITS_KEY)) ?? null
}

export async function setHiddenHabits(habitIds) {
  const backend = await getBackend()
  await backend.set('settings', HIDDEN_HABITS_KEY, habitIds)
}
