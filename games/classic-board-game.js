(function () {
  const cfg = window.CLASSIC_GAME || {};
  const $ = (id) => document.getElementById(id);
  const state = { board: [], turn: 'black', selected: null, legal: [], hand: { black: {}, white: {} }, passCount: 0, message: '' };
  const jpTurn = { black: '黒', white: '白' };
  const other = (c) => c === 'black' ? 'white' : 'black';
  const inb = (r, c, n) => r >= 0 && c >= 0 && r < n && c < n;

  function init() {
    $('title').textContent = cfg.title;
    $('subtitle').textContent = cfg.desc;
    $('reset').onclick = start;
    $('pass').onclick = passTurn;
    $('undoSelect').onclick = () => { state.selected = null; state.legal = []; render(); };
    start();
  }

  function start() {
    state.turn = 'black'; state.selected = null; state.legal = []; state.hand = { black: {}, white: {} }; state.passCount = 0; state.message = '';
    if (cfg.type === 'reversi') setupReversi();
    if (cfg.type === 'go') setupEmpty(9);
    if (cfg.type === 'chess') setupChess();
    if (cfg.type === 'shogi') setupShogi();
    render();
  }

  function setupEmpty(n) { state.board = Array.from({ length: n }, () => Array(n).fill(null)); }

  function setupReversi() {
    setupEmpty(8);
    state.board[3][3] = 'white'; state.board[3][4] = 'black';
    state.board[4][3] = 'black'; state.board[4][4] = 'white';
  }

  function setupChess() {
    const back = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];
    state.board = Array.from({ length: 8 }, () => Array(8).fill(null));
    for (let c = 0; c < 8; c++) {
      state.board[0][c] = { c: 'black', t: back[c] };
      state.board[1][c] = { c: 'black', t: 'p' };
      state.board[6][c] = { c: 'white', t: 'p' };
      state.board[7][c] = { c: 'white', t: back[c] };
    }
    state.turn = 'white';
  }

  function setupShogi() {
    const row = ['L', 'N', 'S', 'G', 'K', 'G', 'S', 'N', 'L'];
    state.board = Array.from({ length: 9 }, () => Array(9).fill(null));
    for (let c = 0; c < 9; c++) {
      state.board[0][c] = { c: 'white', t: row[c], p: false };
      state.board[2][c] = { c: 'white', t: 'P', p: false };
      state.board[6][c] = { c: 'black', t: 'P', p: false };
      state.board[8][c] = { c: 'black', t: row[c], p: false };
    }
    state.board[1][1] = { c: 'white', t: 'R', p: false };
    state.board[1][7] = { c: 'white', t: 'B', p: false };
    state.board[7][1] = { c: 'black', t: 'B', p: false };
    state.board[7][7] = { c: 'black', t: 'R', p: false };
  }

  function render() {
    const n = state.board.length;
    const board = $('board');
    board.style.gridTemplateColumns = `repeat(${n}, 1fr)`;
    board.innerHTML = '';
    const legalKeys = new Set(state.legal.map(p => `${p.r},${p.c}`));
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        const cell = document.createElement('button');
        cell.type = 'button';
        cell.className = 'cell';
        if ((r + c) % 2) cell.classList.add('alt');
        if (legalKeys.has(`${r},${c}`)) cell.classList.add('legal');
        if (state.selected && state.selected.r === r && state.selected.c === c) cell.classList.add('selected');
        cell.dataset.r = r; cell.dataset.c = c;
        cell.innerHTML = cellHtml(state.board[r][c]);
        cell.onclick = () => clickCell(r, c);
        board.appendChild(cell);
      }
    }
    renderHand('black'); renderHand('white');
    $('turn').textContent = `${jpTurn[state.turn]}番`;
    $('score').textContent = scoreText();
    $('message').textContent = state.message || helpText();
  }

  function cellHtml(v) {
    if (!v) return '';
    if (cfg.type === 'reversi' || cfg.type === 'go') return `<span class="stone ${v}"></span>`;
    if (cfg.type === 'chess') return `<span class="piece ${v.c}">${chessGlyph(v)}</span>`;
    if (cfg.type === 'shogi') return `<span class="piece ${v.c}">${shogiGlyph(v)}</span>`;
    return '';
  }

  function chessGlyph(p) {
    const m = { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' };
    return m[p.t];
  }

  function shogiGlyph(p) {
    const promoted = { P: 'と', L: '成香', N: '成桂', S: '成銀', B: '馬', R: '龍' };
    const base = { K: '玉', R: '飛', B: '角', G: '金', S: '銀', N: '桂', L: '香', P: '歩' };
    return p.p && promoted[p.t] ? promoted[p.t] : base[p.t];
  }

  function clickCell(r, c) {
    if (cfg.type === 'reversi') return moveReversi(r, c);
    if (cfg.type === 'go') return moveGo(r, c);
    if (cfg.type === 'chess') return clickPieceGame(r, c, chessMoves);
    if (cfg.type === 'shogi') return clickPieceGame(r, c, shogiMoves);
  }

  function clickPieceGame(r, c, moveFn) {
    const p = state.board[r][c];
    if (state.selected) {
      const ok = state.legal.find(x => x.r === r && x.c === c);
      if (ok) {
        movePiece(state.selected.r, state.selected.c, r, c);
        state.selected = null; state.legal = []; state.turn = other(state.turn);
        render(); return;
      }
    }
    if (p && p.c === state.turn) {
      state.selected = { r, c };
      state.legal = moveFn(r, c);
    } else {
      state.selected = null; state.legal = [];
    }
    render();
  }

  function movePiece(sr, sc, tr, tc) {
    const p = state.board[sr][sc], captured = state.board[tr][tc];
    if (cfg.type === 'shogi' && captured) addHand(p.c, captured.t);
    state.board[tr][tc] = p; state.board[sr][sc] = null;
    if (cfg.type === 'chess' && p.t === 'p' && (tr === 0 || tr === 7)) p.t = 'q';
    if (cfg.type === 'shogi') maybePromote(p, sr, tr);
    state.message = captured && captured.t === 'k' ? `${jpTurn[p.c]}の勝ち` : '';
    if (cfg.type === 'shogi' && captured && captured.t === 'K') state.message = `${jpTurn[p.c]}の勝ち`;
  }

  function addHand(color, type) {
    state.hand[color][type] = (state.hand[color][type] || 0) + 1;
  }

  function renderHand(color) {
    const box = $(color === 'black' ? 'blackHand' : 'whiteHand');
    if (!box) return;
    if (cfg.type !== 'shogi') { box.parentElement.style.display = 'none'; return; }
    box.parentElement.style.display = '';
    box.innerHTML = '';
    Object.entries(state.hand[color]).forEach(([t, n]) => {
      if (!n) return;
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'hand-piece'; b.textContent = `${shogiGlyph({ t, p: false })}x${n}`;
      b.onclick = () => selectDrop(color, t);
      box.appendChild(b);
    });
    if (!box.innerHTML) box.textContent = 'なし';
  }

  function selectDrop(color, type) {
    if (color !== state.turn) return;
    state.selected = { drop: type };
    state.legal = [];
    for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) {
      if (!state.board[r][c] && canDrop(type, color, r)) state.legal.push({ r, c });
    }
    render();
    Array.from(document.querySelectorAll('.cell')).forEach(cell => {
      cell.onclick = () => {
        const r = Number(cell.dataset.r), c = Number(cell.dataset.c);
        if (!state.legal.find(x => x.r === r && x.c === c)) return;
        state.board[r][c] = { c: color, t: type, p: false };
        state.hand[color][type]--; state.selected = null; state.legal = []; state.turn = other(state.turn); render();
      };
    });
  }

  function canDrop(type, color, r) {
    if (type === 'P' || type === 'L') return color === 'black' ? r > 0 : r < 8;
    if (type === 'N') return color === 'black' ? r > 1 : r < 7;
    return true;
  }

  function maybePromote(p, sr, tr) {
    if (p.p || p.t === 'K' || p.t === 'G') return;
    const zone = p.c === 'black' ? (sr <= 2 || tr <= 2) : (sr >= 6 || tr >= 6);
    const must = (p.t === 'P' || p.t === 'L') && (p.c === 'black' ? tr === 0 : tr === 8) ||
      p.t === 'N' && (p.c === 'black' ? tr <= 1 : tr >= 7);
    if (zone && (must || confirm('成りますか？'))) p.p = true;
  }

  function moveReversi(r, c) {
    const flips = reversiFlips(r, c, state.turn);
    if (state.board[r][c] || !flips.length) { state.message = '置ける場所を選んでください。'; render(); return; }
    state.board[r][c] = state.turn; flips.forEach(([rr, cc]) => state.board[rr][cc] = state.turn);
    state.turn = other(state.turn);
    if (!hasReversiMove(state.turn)) { state.message = `${jpTurn[state.turn]}は置けないためパス`; state.turn = other(state.turn); }
    render();
  }

  function reversiFlips(r, c, color) {
    if (state.board[r][c]) return [];
    const dirs = [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]], out = [];
    dirs.forEach(([dr, dc]) => {
      let rr = r + dr, cc = c + dc, line = [];
      while (inb(rr, cc, 8) && state.board[rr][cc] === other(color)) { line.push([rr, cc]); rr += dr; cc += dc; }
      if (line.length && inb(rr, cc, 8) && state.board[rr][cc] === color) out.push(...line);
    });
    return out;
  }

  function hasReversiMove(color) {
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) if (reversiFlips(r, c, color).length) return true;
    return false;
  }

  function moveGo(r, c) {
    if (state.board[r][c]) { state.message = '空いている交点を選んでください。'; render(); return; }
    state.board[r][c] = state.turn;
    const enemy = other(state.turn);
    neighbors(r, c, 9).forEach(([rr, cc]) => {
      if (state.board[rr][cc] === enemy && liberties(group(rr, cc)).length === 0) {
        group(rr, cc).forEach(([gr, gc]) => state.board[gr][gc] = null);
      }
    });
    if (liberties(group(r, c)).length === 0) { state.board[r][c] = null; state.message = '自殺手は打てません。'; render(); return; }
    state.passCount = 0; state.turn = enemy; render();
  }

  function group(r, c) {
    const color = state.board[r][c], seen = new Set(), out = [], stack = [[r, c]];
    while (stack.length) {
      const [rr, cc] = stack.pop(), key = `${rr},${cc}`;
      if (seen.has(key)) continue; seen.add(key); out.push([rr, cc]);
      neighbors(rr, cc, state.board.length).forEach(([nr, nc]) => { if (state.board[nr][nc] === color) stack.push([nr, nc]); });
    }
    return out;
  }

  function liberties(g) {
    const s = new Set();
    g.forEach(([r, c]) => neighbors(r, c, state.board.length).forEach(([rr, cc]) => { if (!state.board[rr][cc]) s.add(`${rr},${cc}`); }));
    return Array.from(s);
  }

  function neighbors(r, c, n) { return [[r+1,c],[r-1,c],[r,c+1],[r,c-1]].filter(p => inb(p[0], p[1], n)); }

  function chessMoves(r, c) {
    const p = state.board[r][c], moves = [], own = p.c, dir = own === 'white' ? -1 : 1;
    const add = (rr, cc) => { if (inb(rr, cc, 8) && (!state.board[rr][cc] || state.board[rr][cc].c !== own)) moves.push({ r: rr, c: cc }); };
    const slide = (dirs) => dirs.forEach(([dr, dc]) => { let rr = r+dr, cc = c+dc; while (inb(rr, cc, 8)) { if (!state.board[rr][cc]) moves.push({ r: rr, c: cc }); else { if (state.board[rr][cc].c !== own) moves.push({ r: rr, c: cc }); break; } rr += dr; cc += dc; } });
    if (p.t === 'p') {
      if (inb(r+dir, c, 8) && !state.board[r+dir][c]) moves.push({ r: r+dir, c });
      if ((own === 'white' && r === 6 || own === 'black' && r === 1) && !state.board[r+dir][c] && !state.board[r+dir*2][c]) moves.push({ r: r+dir*2, c });
      [[dir,1],[dir,-1]].forEach(([dr,dc]) => { if (inb(r+dr,c+dc,8) && state.board[r+dr][c+dc] && state.board[r+dr][c+dc].c !== own) moves.push({ r:r+dr,c:c+dc }); });
    }
    if (p.t === 'n') [[2,1],[2,-1],[-2,1],[-2,-1],[1,2],[1,-2],[-1,2],[-1,-2]].forEach(([dr,dc]) => add(r+dr,c+dc));
    if (p.t === 'b') slide([[1,1],[1,-1],[-1,1],[-1,-1]]);
    if (p.t === 'r') slide([[1,0],[-1,0],[0,1],[0,-1]]);
    if (p.t === 'q') slide([[1,1],[1,-1],[-1,1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]]);
    if (p.t === 'k') for (let dr=-1; dr<=1; dr++) for (let dc=-1; dc<=1; dc++) if (dr || dc) add(r+dr,c+dc);
    return moves;
  }

  function shogiMoves(r, c) {
    const p = state.board[r][c], moves = [], own = p.c, f = own === 'black' ? -1 : 1;
    const add = (rr, cc) => { if (inb(rr, cc, 9) && (!state.board[rr][cc] || state.board[rr][cc].c !== own)) moves.push({ r: rr, c: cc }); };
    const gold = [[f,0],[f,1],[f,-1],[0,1],[0,-1],[-f,0]];
    const silver = [[f,0],[f,1],[f,-1],[-f,1],[-f,-1]];
    const slide = (dirs) => dirs.forEach(([dr, dc]) => { let rr=r+dr, cc=c+dc; while(inb(rr,cc,9)){ if(!state.board[rr][cc]) moves.push({r:rr,c:cc}); else { if(state.board[rr][cc].c!==own) moves.push({r:rr,c:cc}); break; } rr+=dr; cc+=dc; } });
    if (p.p && ['P','L','N','S'].includes(p.t)) gold.forEach(([dr, dc]) => add(r+dr, c+dc));
    else if (p.t === 'K') for (let dr=-1; dr<=1; dr++) for (let dc=-1; dc<=1; dc++) if (dr || dc) add(r+dr,c+dc);
    else if (p.t === 'G') gold.forEach(([dr, dc]) => add(r+dr, c+dc));
    else if (p.t === 'S') silver.forEach(([dr, dc]) => add(r+dr, c+dc));
    else if (p.t === 'N') [[f*2,1],[f*2,-1]].forEach(([dr, dc]) => add(r+dr, c+dc));
    else if (p.t === 'L') slide([[f,0]]);
    else if (p.t === 'P') add(r+f, c);
    else if (p.t === 'B') { slide([[1,1],[1,-1],[-1,1],[-1,-1]]); if (p.p) [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dr,dc]) => add(r+dr,c+dc)); }
    else if (p.t === 'R') { slide([[1,0],[-1,0],[0,1],[0,-1]]); if (p.p) [[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([dr,dc]) => add(r+dr,c+dc)); }
    return moves;
  }

  function passTurn() {
    if (cfg.type !== 'go' && cfg.type !== 'reversi') return;
    state.passCount++;
    state.turn = other(state.turn);
    state.message = state.passCount >= 2 ? '両者パス。終了です。' : 'パスしました。';
    render();
  }

  function scoreText() {
    let b = 0, w = 0;
    state.board.flat().forEach(v => {
      if (!v) return;
      const c = typeof v === 'string' ? v : v.c;
      if (c === 'black') b++; else w++;
    });
    return `黒 ${b} / 白 ${w}`;
  }

  function helpText() {
    if (cfg.type === 'reversi') return '相手の石をはさめる場所に置いてください。';
    if (cfg.type === 'go') return '9路盤です。石を囲むと取れます。';
    if (cfg.type === 'shogi') return '駒を選んで移動先を選択。持ち駒も打てます。';
    return '駒を選んで移動先を選択してください。';
  }

  document.addEventListener('DOMContentLoaded', init);
})();
