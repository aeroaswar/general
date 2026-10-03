// DOM layer: HUD, room labels, the detail panel / bottom sheet, legend, Step-Inside controls.
import * as THREE from 'three';
import { STATUS } from './kit.js';

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const SOURCE = { git: 'local git', github_api: 'GitHub API', aggregate: 'aggregate of all rooms', none: 'no source', file: 'repo file' };

export function rel(iso) {
  if (!iso) return '—';
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return esc(iso);
  const m = Math.round((Date.now() - t) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 48) return `${h} h ago`;
  return `${Math.round(h / 24)} days ago`;
}

function badge(status) {
  const s = STATUS[status] || STATUS.unknown;
  return `<span class="badge" style="--c:${s.color}"><i></i>${s.label}</span>`;
}

export function createUI(cfg, handlers) {
  const $ = sel => document.querySelector(sel);
  const labelsEl = $('#labels');
  const panel = $('#panel');
  const rooms = cfg.rooms.filter(r => r.kind !== 'hall');
  let state = null, meta = {}, openId = null;

  // room labels
  const labels = new Map();
  for (const r of rooms) {
    const b = document.createElement('button');
    b.className = 'label'; b.dataset.room = r.id; b.dataset.floor = r.floor;
    b.style.setProperty('--accent', r.accent || '#999');
    b.innerHTML = `<i class="dot"></i><span class="full">${esc(r.name)}</span><span class="short">${esc(r.short || r.name)}</span>`;
    b.setAttribute('aria-label', r.name);
    b.addEventListener('click', () => handlers.onSelectRoom(r.id));
    b.addEventListener('dblclick', () => handlers.onStepInside(r.id));
    b.addEventListener('keydown', e => { if (e.key.toLowerCase() === 'i') handlers.onStepInside(r.id); });
    labelsEl.appendChild(b);
    labels.set(r.id, b);
  }

  // toolbar
  $('#btn-basement').addEventListener('click', () => handlers.onToggleBasement());
  $('#btn-rotl').addEventListener('click', () => handlers.onRotate(-1));
  $('#btn-rotr').addEventListener('click', () => handlers.onRotate(1));
  $('#btn-music').addEventListener('click', () => handlers.onMusic());
  $('#btn-sfx').addEventListener('click', () => handlers.onSfx());
  $('#btn-help').addEventListener('click', () => $('#help').toggleAttribute('hidden'));
  $('#help-close').addEventListener('click', () => $('#help').setAttribute('hidden', ''));
  $('#panel-close').addEventListener('click', () => api.close());
  $('#inside-exit').addEventListener('click', () => handlers.onExitInside());
  for (const btn of document.querySelectorAll('#dpad button')) {
    const dir = btn.dataset.dir;
    const on = e => { e.preventDefault(); handlers.onPad(dir, true); };
    const off = e => { e.preventDefault(); handlers.onPad(dir, false); };
    btn.addEventListener('pointerdown', on); btn.addEventListener('pointerup', off);
    btn.addEventListener('pointerleave', off); btn.addEventListener('pointercancel', off);
  }

  function agentFor(roomId) { return state?.agents?.find(a => a.room === roomId && a.kind === 'agent'); }

  function hud() {
    const live = state?.mode === 'live', snap = live && !!state?.snapshot;
    const chip = $('#mode-chip');
    chip.textContent = snap ? 'SNAPSHOT' : live ? 'LIVE' : 'SAMPLE DATA';
    chip.className = 'chip ' + (live ? 'live' : 'sample');
    const fresh = $('#freshness');
    if (!state) { fresh.textContent = 'loading…'; return; }
    const age = (Date.now() - new Date(state.generated_at).getTime()) / 60000;
    // a published snapshot (collect.py --snapshot) is a picture of one moment, not a collector that stopped
    const stale = live && !snap && (meta.fetchFailed || age > cfg.thresholds.stale_state_minutes);
    fresh.innerHTML = snap
      ? `snapshot of the repos, ${new Date(state.generated_at).toLocaleString('en-GB', { timeZone: 'Asia/Jakarta', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} WIB`
      : live
      ? (stale ? `<span class="chip stale">STALE</span> data ${rel(state.generated_at)}${meta.fetchFailed ? ' · collector unreachable' : ''}`
               : `updated ${rel(state.generated_at)}${state.collector?.github_token ? '' : ' · no GitHub token: PR/CI unknown'}`)
      : 'state.json not found — showing fictional sample';
    document.body.classList.toggle('is-stale', !!stale);
    document.body.classList.toggle('is-sample', !live);
    for (const [id, b] of labels) {
      const a = agentFor(id);
      b.style.setProperty('--dot', a ? (STATUS[a.status] || STATUS.unknown).color : 'transparent');
      b.classList.toggle('no-agent', !a);
      b.title = a ? `${STATUS[a.status]?.label}: ${a.reason}` : (cfg.rooms.find(r => r.id === id).note || '');
    }
  }

  function agentCard(a, spec, botRole) {
    if (!spec) return '';
    const st = a ? badge(a.status) : badge('unknown');
    return `<div class="card agent">
      <div class="row"><div><b>${esc(spec.name)}</b> <span class="muted">· ${esc(spec.species)}</span></div>${st}</div>
      <div class="muted small">${esc(botRole || spec.role)}${spec.personality ? ' · ' + esc(spec.personality) : ''}</div>
      ${a ? `<p class="reason">${esc(a.reason)}</p>
      <div class="src">source: <b>${SOURCE[a.source] || esc(a.source)}</b>${a.active_at ? ' · last active ' + rel(a.active_at) : ''}</div>` :
      '<p class="reason">No status for this agent in state.json.</p>'}
    </div>`;
  }

  function signals(id, rs) {
    const s = rs?.signals || {};
    const out = [];
    if (s.hma) {
      const H = s.hma.hma, K = s.hma.kurs;
      out.push(`<div class="card"><h4>Price basis <span class="muted small">site/assets/hma.json</span></h4>
        <div class="row"><span>HMA ${esc(H.monthLabel)} · periode ${esc(H.period)} (eff. ${esc(H.effective)})</span>
        ${H.fresh ? '<span class="chip ok">FRESH</span>' : `<span class="chip bad">STALE · due ${esc(H.due)}</span>`}</div>
        ${H.fresh ? '' : '<p class="small warn">Awaiting the ESDM graphic. Drop it in site/assets/hma-releases/ to update.</p>'}
        <div class="row"><span>Kurs BI mid Rp ${Number(K.rate || 0).toLocaleString('id-ID')} (eff. ${esc(K.effective)})</span>
        ${K.fresh ? '<span class="chip ok">FRESH</span>' : `<span class="chip bad">STALE · due ${esc(K.due)}</span>`}</div>
        <details class="small"><summary>Confidence notes (verbatim)</summary><p>${esc(s.hma.confidence?.hma)}</p><p>${esc(s.hma.confidence?.kurs)}</p></details>
      </div>`);
    }
    if (s.placeholders_open != null) out.push(`<div class="card"><h4>To confirm</h4><p>${s.placeholders_open} open placeholder${s.placeholders_open === 1 ? '' : 's'} in README.md</p></div>`);
    if (s.decisions != null || s.migrations) out.push(`<div class="card"><h4>Platform</h4>
      ${s.decisions != null ? `<p>${s.decisions} decisions in docs/DECISIONS.md</p>` : ''}
      ${s.migrations ? `<p>${s.migrations.count} migrations · latest <code>${esc(s.migrations.latest)}</code></p>` : ''}</div>`);
    if (s.site_pages) out.push(`<div class="card"><h4>jetsport.id pages</h4><p>${s.site_pages.map(p => `<code>${esc(p)}</code>`).join(' ')}</p></div>`);
    if (s.projects) out.push(`<div class="card"><h4>${s.projects.length} projects</h4><p class="small">${s.projects.map(p => `${esc(p.name)} <span class="muted">:${p.port}</span>`).join(' · ')}</p></div>`);
    return out.join('');
  }

  function activity(rs) {
    if (!rs) return '';
    const lc = rs.last_commit;
    let html = `<div class="card"><h4>Activity <span class="muted small">${esc(rs.repo)} · ${esc(rs.branch)}</span></h4>`;
    html += lc ? `<p class="small">Last commit ${rel(lc.at)} · <code>${esc(lc.sha)}</code> ${esc(lc.subject)} <span class="muted">— ${esc(lc.author)}</span></p>` : '<p class="small muted">No commits readable.</p>';
    if (rs.open_prs) {
      html += `<p><b>${rs.open_prs.length}</b> open PR${rs.open_prs.length === 1 ? '' : 's'}</p><ul class="list">` +
        rs.open_prs.slice().sort((a, b) => b.updated_at.localeCompare(a.updated_at)).slice(0, 8)
          .map(p => `<li><a href="${/^https:\/\//.test(p.url) ? esc(p.url) : '#'}" target="_blank" rel="noopener">#${p.number}</a> ${esc(p.title)} <span class="muted">${p.draft ? 'draft · ' : ''}${rel(p.updated_at)}</span></li>`).join('') + '</ul>';
    } else {
      html += '<p class="small muted">PR state unknown (no GitHub token).</p>';
    }
    if (rs.branches?.length) {
      html += `<details class="small"><summary>${rs.branches.length} recent claude/* branch${rs.branches.length === 1 ? '' : 'es'}</summary><ul class="list">` +
        rs.branches.slice(0, 12).map(b => `<li><code>${esc(b.name)}</code> ${rel(b.at)}${b.ahead != null ? ` · ${b.ahead} ahead` : ''}</li>`).join('') + '</ul></details>';
    }
    if (rs.workflows?.length) {
      html += `<details class="small"><summary>Workflow runs</summary><ul class="list">` +
        rs.workflows.slice(0, 10).map(w => `<li><code>${esc(w.file)}</code> on ${esc(w.branch)} · ${esc(w.conclusion || w.status)} · ${rel(w.at)}</li>`).join('') + '</ul></details>';
    }
    return html + '</div>';
  }

  function render(id) {
    const r = cfg.rooms.find(x => x.id === id);
    if (!r) return;
    const rs = state?.rooms?.[id];
    const a = state?.agents?.find(x => x.room === id && x.kind === 'agent');
    let body = `<header style="--accent:${r.accent || '#999'}"><span class="kind">${esc(r.kind === 'repo' ? 'repo room' : r.kind)}</span><h2>${esc(r.name)}</h2>
      ${state && state.mode !== 'live' ? '<span class="chip sample">SAMPLE DATA</span>' : ''}${document.body.classList.contains('is-stale') ? '<span class="chip stale">STALE</span>' : ''}</header>`;
    if (r.note) body += `<p class="note">${esc(r.note)}</p>`;
    body += agentCard(a, r.agent);
    for (const p of r.partners || []) body += agentCard(state?.agents?.find(x => x.id === p.id), p, `${p.company} · ${p.role}`);
    for (const bot of r.bots || []) body += agentCard(state?.agents?.find(x => x.id === bot.id), { ...bot, species: 'bot' }, bot.role);
    body += signals(id, rs);
    body += activity(rs);
    if (r.kind === 'supervisor' || r.kind === 'den') {
      const ag = (state?.agents || []).filter(x => x.id !== 'aero' && x.id !== 'octopus');
      const list = r.kind === 'supervisor' ? ag.filter(x => x.status === 'waiting_review' || x.status === 'blocked') : ag;
      body += `<div class="card"><h4>${r.kind === 'supervisor' ? 'On your desk' : 'All agents'}</h4><ul class="list">` +
        (list.length ? list.map(x => `<li><button class="link" data-goto="${esc(x.room)}">${esc(x.id)}</button> ${badge(x.status)}<div class="small muted">${esc(x.reason)}</div></li>`).join('')
                     : '<li class="muted">Nothing waiting.</li>') + '</ul></div>';
    }
    if (r.kind === 'library') {
      body += cfg.rooms.filter(x => x.kind === 'repo').map(x => {
        const lib = state?.rooms?.[x.id]?.signals?.library;
        return `<details class="card small"><summary><b>${esc(x.name)}</b> · ${lib ? lib.length : '—'} docs</summary><ul class="list">${(lib || []).map(d => `<li>${esc(d.title)} <span class="muted">${esc(d.path)}</span></li>`).join('')}</ul></details>`;
      }).join('') + '<p class="small muted">Titles only. Private repos are never opened here.</p>';
    }
    if (r.floor !== 'basement' && r.kind !== 'locked') body += `<button class="primary" id="btn-inside">Step inside</button>`;
    $('#panel-body').innerHTML = body;
    $('#btn-inside')?.addEventListener('click', () => handlers.onStepInside(id));
    for (const b of $('#panel-body').querySelectorAll('[data-goto]')) b.addEventListener('click', () => handlers.onSelectRoom(b.dataset.goto));
  }

  const v = new THREE.Vector3();
  const api = {
    setState(s, m = {}) { state = s; meta = m; hud(); if (openId) render(openId); },
    open(id) { openId = id; render(id); panel.removeAttribute('hidden'); panel.focus({ preventScroll: true });
               for (const [rid, b] of labels) b.classList.toggle('selected', rid === id); },
    close() { openId = null; panel.setAttribute('hidden', ''); for (const b of labels.values()) b.classList.remove('selected'); },
    get openId() { return openId; },
    updateLabels(camera, world, mode, w, h) {
      for (const [id, b] of labels) {
        const R = world.rooms.get(id);
        const show = mode === 'inside' ? false : mode === 'basement' ? R.cfg.floor === 'basement' : R.cfg.floor !== 'basement';
        if (!show) { b.style.display = 'none'; continue; }
        v.copy(R.labelPos).project(camera);
        if (v.z > 1 || v.x < -1.1 || v.x > 1.1 || v.y < -1.1 || v.y > 1.1) { b.style.display = 'none'; continue; }
        b.style.display = '';
        b.style.transform = `translate(${((v.x + 1) / 2) * w}px, ${((1 - v.y) / 2) * h}px) translate(-50%, -100%)`;
      }
    },
    setMode(mode) {
      document.body.dataset.mode = mode;
      $('#btn-basement').setAttribute('aria-pressed', mode === 'basement');
    },
    setAudio(music, sfx) {
      $('#btn-music').setAttribute('aria-pressed', music); $('#btn-sfx').setAttribute('aria-pressed', sfx);
    },
    insideTitle(name) { $('#inside-title').textContent = name; },
    tick() { hud(); },
  };
  return api;
}
