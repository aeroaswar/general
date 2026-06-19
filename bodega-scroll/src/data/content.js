// Real, Bodega-inspired editorial copy — no lorem ipsum. The brand's actual story is a
// curated boutique hidden behind a fake corner-store facade ("the door"). Copy leans into
// that: discovery, curation, the detour being worth it.

export const HERO = {
  kicker: 'Est. on a corner you walked past',
  // Split into words so the headline can stagger in per-word (Framer Motion).
  headline: ['Hidden', 'in', 'plain', 'sight.'],
  sub: 'A boutique behind the cooler door. The drops worth the detour — and the door only the curious find.',
  cta: 'Find the door',
}

export const DOOR = {
  kicker: '01 — The Facade',
  headline: ['Everyone', 'walks', 'past.'],
  body: 'Out front it reads like any bodega: fluorescent hum, a fridge full of cold drinks, a lottery sign in the window. Pull the right handle and the wall swings open.',
}

export const THRESHOLD = {
  kicker: '02 — The Threshold',
  headline: ['Through', 'the', 'cold', 'aisle.'],
  body: 'Past the door the noise drops away. Concrete, soft light, and a room that was never meant to be easy to find.',
}

export const DROP = {
  kicker: '03 — The Drop',
  headline: ['This', 'week’s', 'detour.'],
  product: {
    name: 'Corner-Store Trainer — “Snapple” Colorway',
    edition: 'Numbered / 240 pairs',
    price: '$190',
    specs: [
      { label: 'Material', value: 'Suede + ripstop, cold-press sole' },
      { label: 'Release', value: 'In-store first, online Friday 11am' },
      { label: 'Origin', value: 'Made small, sold quiet' },
    ],
  },
}

export const COLLABS = {
  kicker: '04 — The Shelf',
  headline: ['Friends', 'of', 'the', 'house.'],
  tiles: [
    { id: 'c1', tag: 'Footwear', title: 'Saucony × House', note: 'Grid pack, 3 makeups' },
    { id: 'c2', tag: 'Apparel', title: 'Reverse-Weave Capsule', note: 'Heavy fleece, boxed fit' },
    { id: 'c3', tag: 'Print', title: 'Zine No. 07', note: '48 pages, riso, numbered' },
    { id: 'c4', tag: 'Goods', title: 'Cold-Drink Tote', note: 'Recycled canvas, lined' },
    { id: 'c5', tag: 'Footwear', title: 'New Balance Detour', note: 'Made for the long way home' },
  ],
}

export const FOOTER = {
  headline: ['Find', 'the', 'door.'],
  sub: 'Drops land Fridays. The address is the easy part.',
  cta: 'Join the list',
  email: 'hello@bodega.example',
  socials: [
    { id: 'ig', label: 'Instagram', icon: 'mdi:instagram', href: '#' },
    { id: 'x', label: 'X', icon: 'mdi:alpha-x-box-outline', href: '#' },
    { id: 'tk', label: 'TikTok', icon: 'ic:baseline-tiktok', href: '#' },
  ],
  links: ['Stores', 'Shipping', 'Returns', 'Careers', 'Stockists'],
}
