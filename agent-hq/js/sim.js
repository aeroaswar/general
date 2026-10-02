// Decorative routines: walking through doors, sitting, reading, coffee breaks.
// Nothing here reads or changes status — that comes only from state.json.
import * as THREE from 'three';

const SPEED = 1.55;

export function buildGraph(world) {
  const nodes = new Map();
  const add = (id, p) => { if (!nodes.has(id)) nodes.set(id, { id, p: p.clone(), edges: new Set() }); return id; };
  const link = (a, b) => { nodes.get(a).edges.add(b); nodes.get(b).edges.add(a); };

  const spineXs = new Set();
  const outs = [];
  for (const [id, R] of world.rooms) {
    const k = R.cfg.kind;
    if (!R.doorIn || k === 'locked' || k === 'hall' || R.cfg.floor === 'basement') continue;
    add(`${id}:in`, R.doorIn);
    add(`${id}:center`, new THREE.Vector3(R.center.x, R.y, R.center.z));
    link(`${id}:in`, `${id}:center`);
    if (id === 'office' && R.stairs) {
      add('stairs:top', R.stairs.top); add('stairs:bottom', R.stairs.bottom);
      link('office:in', 'stairs:top'); link('stairs:top', 'stairs:bottom');
      outs.push(['stairs:bottom', R.stairs.bottom.x]); spineXs.add(R.stairs.bottom.x);
    } else {
      add(`${id}:out`, R.doorOut); link(`${id}:in`, `${id}:out`);
      outs.push([`${id}:out`, R.doorOut.x]); spineXs.add(R.doorOut.x);
    }
    for (const [name, a] of Object.entries(R.anchors)) {
      const list = Array.isArray(a) ? a : [a];
      list.forEach((anc, i) => {
        const nid = `${id}:${name}${Array.isArray(a) ? i : ''}`;
        add(nid, anc.pos); link(nid, `${id}:center`);
        anc.node = nid;
      });
    }
  }
  const hall = world.rooms.get('hall');
  const zc = hall ? hall.rect.cz : 0;
  const xs = [...spineXs].sort((a, b) => a - b);
  xs.forEach((x, i) => {
    add(`hall:${x}`, new THREE.Vector3(x, 0, zc));
    if (i) link(`hall:${xs[i - 1]}`, `hall:${x}`);
  });
  for (const [nid, x] of outs) link(nid, `hall:${x}`);
  if (hall?.anchors.bench) {
    add('hall:bench', hall.anchors.bench.pos); hall.anchors.bench.node = 'hall:bench';
    const near = xs.reduce((b, x) => Math.abs(x - hall.anchors.bench.pos.x) < Math.abs(b - hall.anchors.bench.pos.x) ? x : b, xs[0]);
    link('hall:bench', `hall:${near}`);
  }
  return nodes;
}

function path(nodes, from, to) {
  if (from === to) return [to];
  const dist = new Map([[from, 0]]), prev = new Map(), open = new Set([from]);
  while (open.size) {
    let cur = null, best = Infinity;
    for (const n of open) if (dist.get(n) < best) { best = dist.get(n); cur = n; }
    open.delete(cur);
    if (cur === to) break;
    for (const e of nodes.get(cur).edges) {
      const d = best + nodes.get(cur).p.distanceTo(nodes.get(e).p);
      if (d < (dist.get(e) ?? Infinity)) { dist.set(e, d); prev.set(e, cur); open.add(e); }
    }
  }
  if (!prev.has(to)) return null;
  const out = [to];
  let c = to;
  while (prev.has(c)) { c = prev.get(c); out.unshift(c); }
  return out.slice(1);
}

const angleLerp = (a, b, t) => {
  let d = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (d < -Math.PI) d += Math.PI * 2;
  return a + d * t;
};

export class Sim {
  constructor(world, rand) {
    this.world = world;
    this.nodes = buildGraph(world);
    this.rand = rand;
    this.actors = [];
  }

  /** spec: { id, char, home, role: 'agent'|'boss'|'bot'|'static', anchor } */
  add(spec) {
    const R = this.world.rooms.get(spec.home);
    const a = spec.anchor ? R.anchors[spec.anchor] : (R.anchors.desk || R.anchors.console || Object.values(R.anchors)[0]);
    const anc = Array.isArray(a) ? a[0] : a;
    const actor = { ...spec, R, node: anc?.node || null, path: [], target: null, pose: anc?.sit ? (anc === R.anchors.desk ? 'type' : 'sit') : 'stand',
                    wait: this.rand() * 6, queue: [], seg: null };
    spec.char.root.position.copy(anc?.pos || R.center);
    spec.char.root.rotation.y = anc?.face ?? 0;
    this.actors.push(actor);
    return actor;
  }

  plan(a) {
    const R = a.R, r = this.rand;
    const pick = arr => arr[Math.floor(r() * arr.length)];
    const anchor = (room, name, i) => {
      const x = this.world.rooms.get(room)?.anchors[name];
      return Array.isArray(x) ? x[i ?? Math.floor(r() * x.length)] : x;
    };
    const stay = (anc, pose, lo, hi) => ({ anc, pose, dur: lo + r() * (hi - lo) });

    if (a.role === 'bot') {
      const active = a.char.status === 'working';
      if (!active) return [stay(R.anchors.dock, 'stand', 4, 8)];
      return [stay(R.anchors.botBoard, 'stand', 3, 5), stay(R.anchors.dock, 'stand', 2, 4)];
    }
    if (a.role === 'boss') {
      const roll = r();
      if (roll < 0.35) return [stay(R.anchors.desk, 'type', 10, 20)];
      if (roll < 0.5) return [stay(R.anchors.board, 'stand', 4, 7)];
      if (roll < 0.6) return [stay(R.anchors.sofa, 'sit', 6, 10)];
      if (roll < 0.9) {
        const rooms = ['mmi', 'mme', 'axiom', 'ijba', 'studio'].filter(id => this.world.rooms.get(id));
        const room = pick(rooms);
        return [{ node: `${room}:in`, pose: 'wave', dur: 3 + r() * 2, face: null }, stay(R.anchors.desk, 'type', 8, 14)];
      }
      return this.coffee(a);
    }
    // room agents
    const roll = r();
    const extras = Object.entries(R.anchors).filter(([k]) => !['desk', 'shelf', 'board', 'dock', 'botBoard', 'gate'].includes(k))
      .map(([, v]) => v).filter(v => v && !Array.isArray(v) && v.node);
    if (roll < 0.36 && R.anchors.desk) return [stay(R.anchors.desk, 'type', 12, 26)];
    if (roll < 0.56 && R.anchors.shelf) return [stay(R.anchors.shelf, 'read', 6, 11)];
    if (roll < 0.72 && R.anchors.board) return [stay(R.anchors.board, 'stand', 4, 7)];
    if (roll < 0.86 && extras.length) return [stay(pick(extras), 'stand', 4, 7)];
    if (R.cfg.id === 'ani') return [stay(R.anchors.desk, 'type', 10, 18)];
    return this.coffee(a);
  }

  coffee(a) {
    const r = this.rand;
    const cafe = this.world.rooms.get('cafe');
    if (!cafe) return [{ anc: a.R.anchors.desk, pose: 'type', dur: 10 }];
    const seq = [{ anc: cafe.anchors.counter, pose: 'drink', dur: 4 + r() * 3, jitter: true }];
    const roll = r();
    if (roll < 0.45) seq.push({ anc: cafe.anchors.beanbags[Math.floor(r() * 3)], pose: 'sitlow', dur: 6 + r() * 6 });
    else if (roll < 0.75) seq.push({ anc: cafe.anchors.arcade[Math.floor(r() * 2)], pose: 'stand', dur: 5 + r() * 5 });
    seq.push({ anc: a.R.anchors.desk || Object.values(a.R.anchors)[0], pose: 'type', dur: 8 + r() * 8 });
    return seq;
  }

  goTo(a, step) {
    const targetNode = step.anc?.node || step.node;
    if (!targetNode || !a.node) { a.queue.shift(); return; }
    const p = path(this.nodes, a.node, targetNode);
    if (!p) { a.queue.shift(); return; }
    a.path = p.map(n => this.nodes.get(n).p.clone());
    a.pathNodes = p;
    if (step.jitter) a.path[a.path.length - 1].x += (this.rand() - 0.5) * 1.6;
    a.step = step;
    a.pose = 'walk';
  }

  update(dt, time) {
    for (const a of this.actors) {
      const c = a.char;
      if (a.role === 'static') { c.animate(dt, a.pose, time); continue; }
      if (a.path.length) {
        const tgt = a.path[0];
        const pos = c.root.position;
        const d = tgt.clone().sub(pos);
        const dist = d.length();
        const stepLen = SPEED * dt;
        if (dist <= stepLen) {
          pos.copy(tgt); a.path.shift(); a.node = a.pathNodes.shift();
          if (!a.path.length) {
            const s = a.step;
            a.pose = s.pose; a.wait = s.dur;
            a.faceTo = s.anc?.face ?? s.face ?? c.root.rotation.y;
          }
        } else {
          pos.addScaledVector(d.normalize(), stepLen);
          const flat = Math.hypot(d.x, d.z);
          if (flat > 1e-3) c.root.rotation.y = angleLerp(c.root.rotation.y, Math.atan2(d.x, d.z), Math.min(1, dt * 10));
        }
      } else {
        if (a.faceTo != null) c.root.rotation.y = angleLerp(c.root.rotation.y, a.faceTo, Math.min(1, dt * 6));
        a.wait -= dt;
        if (a.wait <= 0) {
          if (!a.queue.length) a.queue = this.plan(a);
          const step = a.queue.shift();
          if (step) this.goTo(a, step);
        }
      }
      c.animate(dt, a.path.length ? 'walk' : a.pose, time);
    }
  }

  /** Reduced motion: everyone at their desk, no walking. */
  settle() {
    for (const a of this.actors) {
      const R = a.R;
      const anc = a.role === 'bot' ? R.anchors.dock : (R.anchors.desk || R.anchors.console || a.R.anchors[a.anchor]);
      if (anc) { a.char.root.position.copy(anc.pos); a.char.root.rotation.y = anc.face; a.node = anc.node; }
      a.path = []; a.queue = []; a.pose = anc?.sit ? 'sit' : 'stand';
      a.char.animate(0, a.pose, 0);
    }
  }
}
