// Single source of truth for the scroll journey. Both the scroll wiring and the
// static-capture harness (?cap=) map section ids to the SAME progress values, so
// "what the camera does at the door" is identical whether you scroll there or jump there.
export const SECTIONS = [
  { id: 'hero', label: 'Street', progress: 0.02 },
  { id: 'door', label: 'The Door', progress: 0.26 },
  { id: 'threshold', label: 'Threshold', progress: 0.48 },
  { id: 'drop', label: 'The Drop', progress: 0.66 },
  { id: 'collabs', label: 'Collabs', progress: 0.84 },
  { id: 'footer', label: 'Find the door', progress: 0.995 },
]

// Resolve a ?cap= value to a numeric progress 0..1.
export function resolveProgress(capValue) {
  if (capValue == null) return null
  const asNum = Number(capValue)
  if (!Number.isNaN(asNum)) return Math.min(1, Math.max(0, asNum))
  const hit = SECTIONS.find((s) => s.id === capValue)
  return hit ? hit.progress : null
}

// Which section id is active for a given progress (for the debug overlay).
export function sectionAt(progress) {
  let active = SECTIONS[0]
  for (const s of SECTIONS) if (progress >= s.progress - 0.12) active = s
  return active.id
}
