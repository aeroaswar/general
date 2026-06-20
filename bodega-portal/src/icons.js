// Inline stroke-icon set (24×24, currentColor). Self-hosted — no runtime CDN.
// Consistent 1.6px round-cap line style tuned for the aurora-glass UI.

const P = {
  "arrow-right": '<path d="M5 12h14M13 6l6 6-6 6"/>',
  "arrow-up-right": '<path d="M7 17 17 7M8 7h9v9"/>',
  "arrow-up": '<path d="M12 19V5M6 11l6-6 6 6"/>',
  "arrow-down": '<path d="M12 5v14M6 13l6 6 6-6"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  check: '<path d="M5 12.5 10 17.5 19.5 7"/>',
  dot: '<circle cx="12" cy="12" r="4" fill="currentColor" stroke="none"/>',
  spark:
    '<path d="M12 3c.6 4.3 1.7 5.4 6 6-4.3.6-5.4 1.7-6 6-.6-4.3-1.7-5.4-6-6 4.3-.6 5.4-1.7 6-6Z"/>',
  // contact / social
  whatsapp:
    '<path d="M5 19l1.3-3.8A7.5 7.5 0 1 1 9 18.3L5 19Z"/><path d="M9.2 9.3c.2-.5.4-.5.7-.5h.5c.2 0 .4 0 .6.5l.6 1.4c.1.2 0 .4-.1.6l-.4.5c-.1.2-.2.3 0 .6.3.5.8 1 1.4 1.4.4.2.6.2.8 0l.4-.5c.2-.2.4-.2.6-.1l1.3.6c.2.1.4.3.4.5v.5c0 .5-.4.9-.9 1.1-.7.3-1.6.3-3-.4a8 8 0 0 1-3.4-3.3c-.5-1-.5-1.9-.3-2.4Z" fill="currentColor" stroke="none"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m4 7 8 6 8-6"/>',
  pin: '<path d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6"/>',
  instagram:
    '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17" cy="7" r="1.2" fill="currentColor" stroke="none"/>',
  linkedin:
    '<rect x="3.5" y="3.5" width="17" height="17" rx="3"/><path d="M8 10.5V17M8 7.6v.1M11.5 17v-3.6a2 2 0 0 1 4 0V17"/>',
  x: '<path d="M5 5l14 14M19 5 5 19"/>',
  play: '<path d="M9 7.5v9l7-4.5-7-4.5Z" fill="currentColor" stroke="none"/>',
  game:
    '<rect x="3" y="7" width="18" height="10" rx="5"/><path d="M8 11v3M6.5 12.5h3M15 12h.1M17.5 14h.1"/>',
  // services
  identity: '<path d="M12 3 4 7v5c0 4.5 3.3 7.6 8 9 4.7-1.4 8-4.5 8-9V7l-8-4Z"/><path d="M9.5 12l2 2 3.5-4"/>',
  target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/>',
  megaphone: '<path d="M4 10v4l3 .5 1.5 4h2L9 14.7 18 17V7L9 9.3 4 10Z"/><path d="M18 9.5a3 3 0 0 1 0 5"/>',
  window: '<rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><path d="M3.5 9h17M7 6.7h.1M9.5 6.7h.1"/>',
  chartline: '<path d="M4 19V5M4 19h16"/><path d="m7 14 3.2-3.4 2.6 2 4.2-5"/>',
  chat: '<path d="M5 17.5 4 20l2.5-1H17a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H7a3 3 0 0 0-3 3v6a3 3 0 0 0 1 3.5Z"/><path d="M8.5 10h7M8.5 13h4"/>',
  // why
  users: '<circle cx="9" cy="9" r="3"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><path d="M15.5 6.2a3 3 0 0 1 0 5.6M16.5 14a5.5 5.5 0 0 1 4 5"/>',
  sliders: '<path d="M5 5v6M5 15v4M12 5v3M12 12v7M19 5v9M19 18v1"/><circle cx="5" cy="13" r="2"/><circle cx="12" cy="10" r="2"/><circle cx="19" cy="16" r="2"/>',
  tag: '<path d="M4 11V5a1 1 0 0 1 1-1h6l9 9-7 7-9-9Z"/><circle cx="8.5" cy="8.5" r="1.3" fill="currentColor" stroke="none"/>',
  search: '<circle cx="11" cy="11" r="6"/><path d="m20 20-4.5-4.5"/>',
  // portal workflow
  handshake: '<path d="M3 8l4-1 3 2 3-2 4 1M12 9v3M8 12l2 2.5a1.6 1.6 0 0 0 2.4.1L16 11"/><path d="M3 8v6l3 2M21 8v6l-3 2"/>',
  folder: '<path d="M3.5 7.5A2 2 0 0 1 5.5 5.5h3l2 2h8a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5.5a2 2 0 0 1-2-2v-9Z"/>',
  layers: '<path d="m12 3 8 4.5-8 4.5-8-4.5L12 3Z"/><path d="m4 12 8 4.5L20 12M4 16.5 12 21l8-4.5"/>',
  pen: '<path d="M4 20l1-4L16 5l3 3L8 19l-4 1Z"/><path d="m14 7 3 3"/>',
  checkcircle: '<circle cx="12" cy="12" r="8.5"/><path d="m8.5 12 2.4 2.4L16 9"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 9.5h17M8 3.5v3M16 3.5v3M7.5 13h2M14.5 13h2M7.5 16.5h2"/>',
  report: '<rect x="4" y="3.5" width="16" height="17" rx="2.5"/><path d="M8 15v-3M12 15v-6M16 15v-4"/>',
  shield: '<path d="M12 3 5 6v5c0 4.4 3 7.4 7 9 4-1.6 7-4.6 7-9V6l-7-3Z"/>',
  lock: '<rect x="5" y="11" width="14" height="9" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  bolt: '<path d="M13 3 5 13h5l-1 8 8-11h-5l1-7Z"/>',
  globe: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.6 2.6 2.6 14.4 0 17M12 3.5c-2.6 2.6-2.6 14.4 0 17"/>',
};

/**
 * Returns an inline <svg> string for the given icon name.
 * @param {string} name key in the icon table
 * @param {{size?:number, cls?:string, fill?:boolean}} [opts]
 */
export function icon(name, opts = {}) {
  const body = P[name] || P.dot;
  const size = opts.size || 24;
  const cls = opts.cls ? ` class="${opts.cls}"` : "";
  return `<svg${cls} viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
}

/** Replace any <i data-icon="name"></i> placeholders inside root with inline SVG. */
export function hydrateIcons(root = document) {
  root.querySelectorAll("[data-icon]").forEach((el) => {
    const name = el.getAttribute("data-icon");
    el.innerHTML = icon(name, { size: Number(el.getAttribute("data-size")) || 24 });
  });
}
