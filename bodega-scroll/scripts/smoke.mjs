// Headless smoke test for the DOM-free logic most likely to break (R1 guard).
// Runs in plain Node — no browser, no WebGL. Exits non-zero on failure.
import { resolveProgress, sectionAt, SECTIONS } from '../src/data/sections.js'

let failures = 0
const ok = (cond, msg) => {
  if (!cond) {
    failures++
    console.error('  ✗', msg)
  } else {
    console.log('  ✓', msg)
  }
}

console.log('bodega smoke test')

// resolveProgress clamps numbers and maps section ids
ok(resolveProgress(null) === null, 'null cap -> null')
ok(resolveProgress('0.5') === 0.5, 'numeric cap parsed')
ok(resolveProgress('-2') === 0, 'numeric cap clamped low')
ok(resolveProgress('9') === 1, 'numeric cap clamped high')
ok(resolveProgress('door') === SECTIONS.find((s) => s.id === 'door').progress, 'section id maps to its progress')
ok(resolveProgress('grid') === null, 'unknown id -> null (grid handled separately)')

// SECTIONS progresses are sorted ascending and within 0..1
let sorted = true
for (let i = 1; i < SECTIONS.length; i++) if (SECTIONS[i].progress < SECTIONS[i - 1].progress) sorted = false
ok(sorted, 'section progresses ascending')
ok(SECTIONS.every((s) => s.progress >= 0 && s.progress <= 1), 'section progresses within [0,1]')

// sectionAt returns a valid id across the range
ok(sectionAt(0) === 'hero', 'progress 0 -> hero')
ok(SECTIONS.some((s) => s.id === sectionAt(1)), 'progress 1 -> a known section')

if (failures) {
  console.error(`\n${failures} check(s) failed`)
  process.exit(1)
}
console.log('\nall smoke checks passed')
