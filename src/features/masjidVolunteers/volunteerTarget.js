// v1 aims for at least this many volunteers per masjid (spec
// masjid-volunteer-requests.md §1, AC2). A constant in code, not a database
// setting (§7 decision 3).
export const MIN_MASJID_VOLUNTEERS = 2

// Every "this masjid needs volunteers" check goes through here (AC2).
export function needsVolunteers(volunteerCount) {
  return volunteerCount < MIN_MASJID_VOLUNTEERS
}
