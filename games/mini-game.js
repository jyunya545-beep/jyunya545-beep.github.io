(function () {
  const cfg = window.GAME || {};
  const $ = (s) => document.querySelector(s);
  const app = $('#app');
  const icons = ['●', '■', '▲', '◆', '★', '✚', '◎', '☀', '☂', '♪'];
  let score = 0;
  let round = 0;
  let timer = 0;
  let interval = 0;
  let runId = 0;
  let timeouts = [];
  let rafs = [];

  function shell() {
    document.title = cfg.title + ' | 無料ゲーム';
    app.innerHTML =
      '<div class="head"><a href="../">← 無料ゲーム一覧</a><strong>' + cfg.title + '</strong></div>' +
      '<div class="panel"><h1>' + cfg.icon + ' ' + cfg.title + '</h1><p>' + cfg.desc + '</p>' +
      '<div class="hud"><div>Score <b id="score">0</b></div><div id="state">Ready</div><button id="reset">新規</button></div>' +
      '<div id="stage"></div><div class="msg" id="msg"></div></div>';
    $('#reset').onclick = start;
  }

  function clearRun() {
    clearInterval(interval);
    timeouts.forEach(clearTimeout);
    rafs.forEach(cancelAnimationFrame);
    timeouts = [];
    rafs = [];
    document.onkeydown = null;
    document.onkeyup = null;
    timer = 0;
    runId++;
  }

  function later(fn, ms) {
    const id = setTimeout(fn, ms);
    timeouts.push(id);
    return id;
  }

  function frame(fn) {
    const id = requestAnimationFrame(fn);
    rafs.push(id);
    return id;
  }

  function setScore(v) { score = v; $('#score').textContent = score; }
  function msg(t) { $('#msg').textContent = t; }
  function state(t) { $('#state').textContent = t; }
  function rand(n) { return Math.floor(Math.random() * n); }
  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = rand(i + 1);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function buttons(items, fn, cls = '') {
    const st = $('#stage');
    st.innerHTML = '';
    items.forEach((x, i) => {
      const b = document.createElement('button');
      b.className = 'tile ' + cls;
      b.textContent = x;
      b.onclick = () => fn(x, i, b);
      st.appendChild(b);
    });
  }
  function countdown(sec, done) {
    clearInterval(interval);
    timer = sec;
    state(timer + 's');
    const token = runId;
    interval = setInterval(() => {
      if (token !== runId) return;
      timer--;
      state(timer + 's');
      if (timer <= 0) {
        clearInterval(interval);
        if (done) done();
      }
    }, 1000);
  }

  function memory() {
    const n = cfg.options.pairs || 8;
    const vals = shuffle([...Array(n).keys(), ...Array(n).keys()]);
    let open = [];
    let hit = 0;
    buttons(vals.map(() => '?'), (_, i, b) => {
      if (b.dataset.done || open.find((o) => o.i === i)) return;
      b.textContent = icons[vals[i] % icons.length];
      open.push({ i, b, v: vals[i] });
      if (open.length !== 2) return;
      round++;
      if (open[0].v === open[1].v) {
        open.forEach((o) => { o.b.dataset.done = 1; o.b.classList.add('good'); });
        hit += 2;
        setScore(score + 10);
        open = [];
        if (hit === vals.length) msg('CLEAR!');
      } else {
        later(() => { open.forEach((o) => { o.b.textContent = '?'; }); open = []; }, 520);
      }
    });
  }

  function sequence() {
    const seq = [];
    let pos = 0;
    const items = ['青', '赤', '黄', '緑', '紫', '白'].slice(0, cfg.options.buttons || 4);
    function next() {
      seq.push(rand(items.length));
      pos = 0;
      msg('順番を覚えてください');
      buttons(items, (x, i) => {
        if (i === seq[pos]) {
          pos++;
          if (pos === seq.length) {
            setScore(score + seq.length);
            later(next, 420);
          }
        } else {
          msg('MISS: ' + seq.length + '手まで成功');
        }
      });
      const bs = [...document.querySelectorAll('.tile')];
      seq.forEach((v, k) => later(() => bs[v] && bs[v].classList.add('flash'), 280 * k));
      seq.forEach((v, k) => later(() => bs[v] && bs[v].classList.remove('flash'), 280 * k + 180));
    }
    next();
  }

  function scramble() {
    const words = cfg.options.words || ['PUZZLE'];
    const w = words[rand(words.length)];
    const letters = shuffle(w.split(''));
    let ans = '';
    msg('お題の英単語を作成');
    buttons(letters, (x, i, b) => {
      ans += x;
      b.disabled = true;
      state(ans);
      if (ans.length === w.length) {
        if (ans === w) {
          setScore(score + 10);
          later(start, 500);
        } else {
          msg('答え: ' + w);
          later(start, 1100);
        }
      }
    });
  }

  function code() {
    const slots = cfg.options.slots || 4;
    const colors = '12345678'.slice(0, cfg.options.colors || 6).split('');
    const secret = Array.from({ length: slots }, () => colors[rand(colors.length)]);
    let pick = [];
    msg(slots + '桁のコードを推理');
    buttons(colors, (x) => {
      pick.push(x);
      state(pick.join(' '));
      if (pick.length !== slots) return;
      const hit = pick.filter((v, i) => v === secret[i]).length;
      const counts = {};
      secret.forEach((v, i) => { if (pick[i] !== v) counts[v] = (counts[v] || 0) + 1; });
      let colorOnly = 0;
      pick.forEach((v, i) => {
        if (secret[i] === v) return;
        if (counts[v]) { colorOnly++; counts[v]--; }
      });
      round++;
      msg('位置一致 ' + hit + ' / 色のみ ' + colorOnly + ' / ' + round + '手');
      if (hit === slots) {
        setScore(Math.max(1, 12 - round) * 10);
        msg('CLEAR!');
      }
      pick = [];
    });
  }

  function math() {
    const max = cfg.options.max || 20;
    countdown(cfg.options.seconds || 45, () => msg('TIME UP'));
    function q() {
      let a = rand(max) + 1;
      let b = rand(max) + 1;
      let op = Math.random() < .5 ? '+' : '-';
      let ans = op === '+' ? a + b : a - b;
      if (cfg.options.balance) {
        ans = rand(10) + 1;
        a = ans + rand(5);
        b = a - ans;
        op = '-';
      }
      state(a + ' ' + op + ' ' + b + ' = ?');
      const opts = shuffle([ans, ans + 1 + rand(3), ans - 1 - rand(3), ans + 4 + rand(4)]);
      buttons(opts, (x) => {
        if (x === ans) { setScore(score + 5); q(); }
        else msg('MISS');
      });
    }
    q();
  }

  function sort() {
    const arr = shuffle(Array.from({ length: cfg.options.count || 16 }, (_, i) => i + 1));
    let need = 1;
    buttons(arr, (x, i, b) => {
      if (x === need) {
        b.disabled = true;
        b.classList.add('good');
        setScore(score + 1);
        need++;
        if (need > arr.length) msg('CLEAR!');
      } else msg('MISS');
    });
  }

  function make10() {
    function q() {
      let nums = shuffle([rand(9) + 1, rand(9) + 1, rand(9) + 1, rand(9) + 1]);
      const pair = [rand(9) + 1, 0];
      pair[1] = 10 - pair[0];
      nums[0] = pair[0];
      nums[1] = pair[1];
      nums = shuffle(nums);
      const sel = [];
      buttons(nums, (x, i, b) => {
        sel.push(x);
        b.disabled = true;
        if (sel.length !== 2) return;
        if (sel[0] + sel[1] === 10) {
          setScore(score + 10);
          round++;
          if (round >= (cfg.options.rounds || 10)) msg('CLEAR!');
          else q();
        } else {
          msg('MISS');
          later(q, 500);
        }
      });
    }
    q();
  }

  function target() {
    countdown(cfg.options.seconds || 30, () => msg('TIME UP'));
    function pop() {
      const mark = cfg.options.pattern ? ['●', '■', '▲', '◆'][rand(4)] : '◎';
      $('#stage').innerHTML = '<button class="big-target">' + mark + '</button>';
      const target = $('.big-target');
      target.style.marginLeft = rand(55) + '%';
      target.style.marginTop = rand(120) + 'px';
      target.onclick = () => { setScore(score + 1); pop(); };
    }
    pop();
  }

  function reaction() {
    let total = 0;
    function one() {
      state('待機');
      buttons(['まだ押さない'], () => msg('早すぎ'));
      const wait = 800 + rand(2200);
      later(() => {
        const t = performance.now();
        buttons(['今!'], () => {
          const r = Math.floor(performance.now() - t);
          total += r;
          round++;
          setScore(Math.max(0, 1000 - r));
          msg(r + 'ms');
          if (round < (cfg.options.rounds || 5)) later(one, 650);
          else msg('平均 ' + Math.floor(total / round) + 'ms');
        }, 'good');
      }, wait);
    }
    one();
  }

  function colorTap() {
    const names = ['赤', '青', '黄', '緑'];
    const css = { '赤': '#ef4444', '青': '#2563eb', '黄': '#ca8a04', '緑': '#16a34a' };
    countdown(cfg.options.seconds || 30, () => msg('TIME UP'));
    function q() {
      const target = names[rand(names.length)];
      state(target + ' を押す');
      buttons(shuffle(names.slice()), (x) => {
        if (x === target) { setScore(score + 3); q(); }
        else msg('MISS');
      });
      if (cfg.options.stroop) {
        [...document.querySelectorAll('.tile')].forEach((b) => {
          const shownColor = names[rand(names.length)];
          b.textContent = shownColor;
          b.dataset.answer = shownColor;
          b.style.color = css[names[rand(names.length)]];
          b.onclick = () => {
            if (b.dataset.answer === target) { setScore(score + 3); q(); }
            else msg('MISS');
          };
        });
      }
    }
    q();
  }

  function catcher() {
    let x = 45;
    let items = [];
    $('#stage').innerHTML = '<canvas width="420" height="320"></canvas>';
    const c = $('canvas');
    const ctx = c.getContext('2d');
    countdown(cfg.options.seconds || 45, () => msg('TIME UP'));
    document.onkeydown = (e) => { if (e.key === 'ArrowLeft') x -= 8; if (e.key === 'ArrowRight') x += 8; };
    c.onpointermove = (e) => { const r = c.getBoundingClientRect(); x = (e.clientX - r.left) / r.width * 100; };
    function loop() {
      if (timer <= 0) return;
      x = Math.max(10, Math.min(90, x));
      ctx.clearRect(0, 0, 420, 320);
      if (Math.random() < .05) items.push({ x: rand(400), y: 0 });
      items.forEach((o) => { o.y += 3; });
      items = items.filter((o) => {
        const hit = o.y > 285 && Math.abs(o.x - (x * 4.2)) < 45;
        if (hit) setScore(score + 1);
        return o.y < 330 && !hit;
      });
      ctx.fillStyle = '#111827'; ctx.fillRect(0, 0, 420, 320);
      ctx.fillStyle = '#f59e0b'; items.forEach((o) => ctx.fillRect(o.x, o.y, 14, 14));
      ctx.fillStyle = '#38bdf8'; ctx.fillRect(x * 4.2 - 40, 292, 80, 12);
      frame(loop);
    }
    loop();
  }

  function avoid() {
    let x = 200;
    let items = [];
    $('#stage').innerHTML = '<canvas width="420" height="320"></canvas>';
    const c = $('canvas');
    const ctx = c.getContext('2d');
    countdown(cfg.options.seconds || 45, () => msg('SURVIVED'));
    document.onkeydown = (e) => { if (e.key === 'ArrowLeft') x -= 12; if (e.key === 'ArrowRight') x += 12; };
    c.onpointermove = (e) => { const r = c.getBoundingClientRect(); x = (e.clientX - r.left) / r.width * 420; };
    function loop() {
      if (timer <= 0) return;
      x = Math.max(14, Math.min(406, x));
      ctx.clearRect(0, 0, 420, 320);
      if (Math.random() < .06) items.push({ x: rand(400), y: 0 });
      items.forEach((o) => { o.y += 4; });
      for (const o of items) if (o.y > 270 && Math.abs(o.x - x) < 22) { timer = 0; msg('GAME OVER'); }
      ctx.fillStyle = '#111827'; ctx.fillRect(0, 0, 420, 320);
      ctx.fillStyle = '#fb7185'; items.forEach((o) => ctx.fillRect(o.x, o.y, 18, 18));
      ctx.fillStyle = '#34d399'; ctx.fillRect(x - 14, 282, 28, 28);
      frame(loop);
    }
    loop();
  }

  function lane() {
    let lane = 1;
    let obs = [];
    countdown(cfg.options.seconds || 45, () => msg('CLEAR!'));
    buttons(['左', '中', '右'], (_, i) => { lane = i; });
    function tick() {
      if (timer <= 0) return;
      if (Math.random() < .35) obs.push({ l: rand(3), y: 0 });
      obs.forEach((o) => { o.y++; });
      obs = obs.filter((o) => {
        if (o.y > 8 && o.l === lane) { timer = 0; msg('GAME OVER'); }
        return o.y < 10;
      });
      state('レーン ' + ['左', '中', '右'][lane] + ' / 障害 ' + obs.length);
      setScore(score + 1);
      later(tick, 300);
    }
    tick();
  }

  function maze() {
    const n = cfg.options.size || 7;
    let pos = 0;
    const goal = n * n - 1;
    const haz = new Set();
    while (haz.size < (cfg.options.hazards || 0)) {
      const h = rand(n * n);
      if (h !== 0 && h !== goal) haz.add(h);
    }
    function move(key) {
      let p = pos;
      if (key === 'ArrowRight' && pos % n < n - 1) p++;
      if (key === 'ArrowLeft' && pos % n > 0) p--;
      if (key === 'ArrowDown' && pos < n * n - n) p += n;
      if (key === 'ArrowUp' && pos >= n) p -= n;
      if (p === pos) return;
      if (haz.has(p)) { msg('GAME OVER'); return; }
      pos = p;
      setScore(score + 1);
      draw();
      if (pos === goal) msg('CLEAR!');
    }
    function draw() {
      const st = $('#stage');
      st.innerHTML = '';
      const grid = document.createElement('div');
      grid.style.display = 'grid';
      grid.style.gridTemplateColumns = 'repeat(' + n + ', 1fr)';
      grid.style.gap = '5px';
      Array.from({ length: n * n }, (_, i) => {
        const cell = document.createElement('div');
        cell.className = 'tile mini';
        cell.textContent = i === pos ? '人' : i === goal ? '出' : haz.has(i) ? '×' : '・';
        grid.appendChild(cell);
      });
      const controls = document.createElement('div');
      controls.style.display = 'grid';
      controls.style.gridTemplateColumns = 'repeat(3,1fr)';
      controls.style.gap = '6px';
      controls.style.marginTop = '10px';
      [' ', '↑', ' ', '←', '↓', '→'].forEach((label) => {
        const b = document.createElement('button');
        b.className = 'tile mini';
        b.textContent = label;
        if (label.trim()) b.onclick = () => move({ '↑': 'ArrowUp', '↓': 'ArrowDown', '←': 'ArrowLeft', '→': 'ArrowRight' }[label]);
        else b.disabled = true;
        controls.appendChild(b);
      });
      st.appendChild(grid);
      st.appendChild(controls);
    }
    document.onkeydown = (e) => move(e.key);
    draw();
    msg('矢印キーまたは画面ボタンで移動');
  }

  function path() {
    const n = cfg.options.nodes || 9;
    const order = shuffle(Array.from({ length: n }, (_, i) => i + 1));
    let need = 1;
    buttons(order, (x, i, b) => {
      if (x === need) {
        b.disabled = true;
        b.classList.add('good');
        need++;
        setScore(score + 1);
        if (need > n) msg('CLEAR!');
      } else msg('MISS');
    });
  }

  function lights() {
    const n = cfg.options.size || 5;
    const grid = Array.from({ length: n * n }, () => Math.random() < .5);
    function tog(i) {
      [i, i - 1, i + 1, i - n, i + n].forEach((j) => {
        if (j >= 0 && j < n * n) grid[j] = !grid[j];
      });
    }
    function draw() {
      buttons(grid.map((v) => v ? 'ON' : 'OFF'), (_, i) => {
        tog(i);
        setScore(score + 1);
        draw();
        if (grid.every((v) => !v)) msg('CLEAR!');
      }, 'mini');
    }
    draw();
  }

  function higher() {
    let cur = rand(13) + 1;
    state('現在 ' + cur);
    buttons(['HIGH', 'LOW'], (x) => {
      const next = rand(13) + 1;
      const ok = x === 'HIGH' ? next >= cur : next <= cur;
      if (ok) {
        setScore(score + 1);
        cur = next;
        state('現在 ' + cur);
        round++;
        if (round >= (cfg.options.rounds || 20)) msg('CLEAR!');
      } else msg('MISS: 次は ' + next);
    });
  }

  function dice() {
    function roll() {
      const ds = Array.from({ length: cfg.options.yacht ? 5 : 3 }, () => rand(6) + 1);
      const sum = ds.reduce((a, b) => a + b, 0);
      state(ds.join(' ') + ' = ' + sum);
      setScore(score + (sum >= 12 ? sum : 0));
      round++;
      if (round >= (cfg.options.turns || 10)) msg('終了');
    }
    buttons(['ROLL'], roll);
  }

  function timerGame() {
    const target = 3 + rand(5);
    const startT = performance.now();
    state(target + '.00秒で止める');
    buttons(['STOP'], () => {
      const t = (performance.now() - startT) / 1000;
      const d = Math.abs(t - target);
      setScore(score + Math.max(0, 100 - Math.floor(d * 100)));
      round++;
      msg(t.toFixed(2) + '秒');
      if (round < (cfg.options.rounds || 6)) later(timerGame, 650);
    });
  }

  function odd() {
    function q() {
      const n = 16;
      const odd = rand(n);
      const base = ['●', '■', '▲', '◆'][rand(4)];
      const diff = ['○', '□', '△', '◇'][rand(4)];
      const arr = Array.from({ length: n }, (_, i) => i === odd ? diff : base);
      buttons(arr, (_, i) => {
        if (i === odd) {
          setScore(score + 5);
          round++;
          if (round >= (cfg.options.rounds || 15)) msg('CLEAR!');
          else q();
        } else msg('MISS');
      });
    }
    q();
  }

  function boxes() {
    const n = cfg.options.size || 4;
    const h = {};
    const v = {};
    const owned = {};
    function key(r, c) { return r + '-' + c; }
    function complete(r, c) {
      return h[key(r, c)] && h[key(r + 1, c)] && v[key(r, c)] && v[key(r, c + 1)];
    }
    function mark(kind, r, c) {
      const map = kind === 'h' ? h : v;
      const k = key(r, c);
      if (map[k]) return;
      map[k] = true;
      let made = 0;
      for (let br = 0; br < n - 1; br++) for (let bc = 0; bc < n - 1; bc++) {
        const bk = key(br, bc);
        if (!owned[bk] && complete(br, bc)) { owned[bk] = true; made++; }
      }
      setScore(score + (made || 1));
      draw();
      if (Object.keys(owned).length === (n - 1) * (n - 1)) msg('CLEAR!');
    }
    function draw() {
      const st = $('#stage');
      st.innerHTML = '';
      const board = document.createElement('div');
      board.style.display = 'grid';
      board.style.gridTemplateColumns = 'repeat(' + (n * 2 - 1) + ', 1fr)';
      board.style.gap = '4px';
      for (let r = 0; r < n * 2 - 1; r++) for (let c = 0; c < n * 2 - 1; c++) {
        const b = document.createElement('button');
        b.className = 'tile mini';
        if (r % 2 === 0 && c % 2 === 0) { b.textContent = '•'; b.disabled = true; }
        else if (r % 2 === 0) {
          const k = key(r / 2, (c - 1) / 2);
          b.textContent = h[k] ? '━' : '─';
          if (h[k]) b.classList.add('good');
          b.onclick = () => mark('h', r / 2, (c - 1) / 2);
        } else if (c % 2 === 0) {
          const k = key((r - 1) / 2, c / 2);
          b.textContent = v[k] ? '┃' : '│';
          if (v[k]) b.classList.add('good');
          b.onclick = () => mark('v', (r - 1) / 2, c / 2);
        } else {
          b.textContent = owned[key((r - 1) / 2, (c - 1) / 2)] ? '□' : '';
          b.disabled = true;
        }
        board.appendChild(b);
      }
      st.appendChild(board);
    }
    draw();
  }

  const map = { memory, sequence, scramble, code, math, sort, make10, target, reaction, colorTap, catcher, avoid, lane, maze, path, lights, higher, dice, timer: timerGame, odd, boxes };
  function start() {
    clearRun();
    setScore(0);
    round = 0;
    msg('');
    state('Ready');
    (map[cfg.type] || target)();
  }
  shell();
  start();
})();
