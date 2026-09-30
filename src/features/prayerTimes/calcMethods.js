import { CalculationMethod, Coordinates, Madhab } from 'adhan'

// Begins times are for the town as a whole, not the phone's GPS position.
// Approximate town centre; across Melapalayam the times differ by seconds.
export const MELAPALAYAM = new Coordinates(8.69, 77.72)

// Stored value (localStorage `mbeat_prayer_calc_method`) -> adhan-js method.
// Order is the order shown in the method picker. Labels come from i18n
// `calcMethod.<value>.name` / `.description`.
const METHODS = {
  karachi: CalculationMethod.Karachi,
  muslim_world_league: CalculationMethod.MuslimWorldLeague,
  egyptian: CalculationMethod.Egyptian,
  umm_al_qura: CalculationMethod.UmmAlQura,
  north_america: CalculationMethod.NorthAmerica,
}

export const CALC_METHODS = Object.keys(METHODS)
export const DEFAULT_CALC_METHOD = 'karachi'

export function isCalcMethod(value) {
  return Object.hasOwn(METHODS, value)
}

// Library parameters for a method. Asr is always Shafi'i (decided 2026-09-30).
// Unknown values fall back to the default rather than throwing.
export function calcParams(method) {
  const params = METHODS[isCalcMethod(method) ? method : DEFAULT_CALC_METHOD]()
  params.madhab = Madhab.Shafi
  return params
}
