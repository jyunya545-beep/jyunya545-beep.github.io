let deck = [], cols = [], found = { S: 0, H: 0, D: 0, C: 0 };
let free = [null, null, null, null], waste = null, sel = null;
const suits = ['S', 'H', 'D', 'C'];
const mark = { S: 'S', H: 'H', D: 'D', C: 'C' };

function card(s, n) { return { s, n }; }
function buildDeck() {
  deck = [];
  suits.forEach(s => { for (let n = 1; n <= 13; n++) deck.push(card(s, n)); });
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
}
function start() {
  buildDeck(); found = { S: 0, H: 0, D: 0, C: 0 };
  free = [null, null, null, null]; waste = null; sel = null; msg.textContent = '';
  if (window.CARD_GAME === 'freecell') {
    cols = Array.from({ length: 8 }, () => []);
    deck.forEach((c, i) => cols[i % 8].push(c));
    deck = [];
  } else {
    cols = Array.from({ length: 7 }, () => []);
    for (let i = 0; i < 28; i++) cols[i % 7].push(deck.pop());
  }
  draw();
}
function val(c) { return ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'][c.n] + mark[c.s]; }
function red(c) { return c.s === 'H' || c.s === 'D'; }
function draw() {
  colsEl.innerHTML = '';
  cols.forEach((col, ci) => {
    const d = document.createElement('div');
    d.className = 'col';
    d.onclick = () => placeCol(ci);
    col.forEach((c, ri) => d.appendChild(cardEl(c, { type: 'col', ci, ri })));
    colsEl.appendChild(d);
  });
  foundEl.innerHTML = '';
  suits.forEach(s => {
    const d = document.createElement('div');
    d.className = 'slot';
    d.textContent = found[s] ? val(card(s, found[s])) : mark[s];
    d.onclick = () => placeFound(s);
    foundEl.appendChild(d);
  });
  if (freeEl) {
    freeEl.innerHTML = '';
    free.forEach((c, i) => {
      const d = document.createElement('div');
      d.className = 'slot';
      d.onclick = () => c ? select({ type: 'free', i }) : placeFree(i);
      if (c) d.appendChild(cardEl(c, { type: 'free', i }));
      freeEl.appendChild(d);
    });
  }
  if (wasteEl) {
    wasteEl.innerHTML = '';
    if (waste) wasteEl.appendChild(cardEl(waste, { type: 'waste' }));
  }
}
function cardEl(c, ref) {
  const e = document.createElement('button');
  e.className = 'card ' + (red(c) ? 'red' : '') + (sameRef(sel, ref) ? ' sel' : '');
  e.textContent = val(c);
  e.onclick = ev => { ev.stopPropagation(); select(ref); };
  return e;
}
function sameRef(a, b) { return a && b && JSON.stringify(a) === JSON.stringify(b); }
function get(ref) {
  if (!ref) return null;
  if (ref.type === 'col') return cols[ref.ci][ref.ri];
  if (ref.type === 'free') return free[ref.i];
  if (ref.type === 'waste') return waste;
  return null;
}
function remove(ref) {
  if (ref.type === 'col') return cols[ref.ci].pop();
  if (ref.type === 'free') { const c = free[ref.i]; free[ref.i] = null; return c; }
  if (ref.type === 'waste') { const c = waste; waste = null; return c; }
  return null;
}
function select(ref) {
  const c = get(ref);
  if (!c) return;
  if (ref.type === 'col' && ref.ri !== cols[ref.ci].length - 1) return;
  sel = ref; draw();
}
function canStack(a, b) { return !b || (red(a) !== red(b) && a.n === b.n - 1); }
function placeCol(ci) {
  if (!sel) return;
  const c = get(sel), top = cols[ci][cols[ci].length - 1];
  if (canStack(c, top)) { cols[ci].push(remove(sel)); sel = null; draw(); }
}
function placeFound(s) {
  if (!sel) return;
  const c = get(sel);
  if (c.s === s && c.n === found[s] + 1) {
    found[s]++; remove(sel); sel = null; draw();
    if (Object.values(found).every(v => v === 13)) msg.textContent = 'CLEAR!';
  }
}
function placeFree(i) {
  if (!sel || free[i]) return;
  free[i] = remove(sel); sel = null; draw();
}
function dealOne() {
  if (deck.length) { waste = deck.pop(); sel = null; draw(); }
  else msg.textContent = 'No cards left.';
}
const colsEl = document.getElementById('cols');
const foundEl = document.getElementById('found');
const freeEl = document.getElementById('free');
const wasteEl = document.getElementById('waste');
if (document.getElementById('deal')) deal.onclick = dealOne;
reset.onclick = start;
start();
