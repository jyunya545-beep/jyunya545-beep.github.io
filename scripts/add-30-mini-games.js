const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const gamesDir = path.join(root, 'games');

const games = [
  ['line-boxes','ラインボックス','□','線を選んで小箱を完成させる、紙と鉛筆風の陣取りパズル。','boxes',{size:4}],
  ['sprout-links','スプラウトリンク','◇','点をつなぎながら手を伸ばす、短時間の線引き思考ゲーム。','path',{nodes:9}],
  ['word-bridge','ワードブリッジ','Aa','文字を並べ替えてお題の単語を作る、軽い語彙パズル。','scramble',{words:['BRIDGE','CONTROL','PUZZLE','ARCADE','NUMBER']}],
  ['pair-flip','ペアフリップ','◆','裏向きカードから同じ記号を探す、定番の記憶ゲーム。','memory',{pairs:8}],
  ['tone-trace','トーントレース','♪','光る順番を覚えて押し返す、音なしでも遊べる記憶チャレンジ。','sequence',{buttons:4}],
  ['shape-recall','シェイプリコール','△','一瞬表示される形の位置を覚える、視覚記憶トレーニング。','memory',{pairs:10}],
  ['code-4','コード4','●','4つの色コードを推理する、古典的な数当て風ロジック。','code',{slots:4,colors:6}],
  ['safe-cracker','セーフクラッカー','鍵','ヒントを頼りに3桁コードを絞り込む、短めの推理ゲーム。','code',{slots:3,colors:8}],
  ['hidden-order','ヒドゥンオーダー','123','数字の並びを少ない手数で当てる、順序推理パズル。','code',{slots:4,colors:5}],
  ['math-rush','マスラッシュ','+','制限時間内に計算問題を解き続ける、暗算スコアアタック。','math',{seconds:45,max:12}],
  ['number-chain','ナンバーチェーン','#','小さい数字から順に押していく、集中力重視の数字探し。','sort',{count:16}],
  ['ten-maker','テンメーカー','10','数字を組み合わせて10を作る、ワンタップ計算パズル。','make10',{rounds:10}],
  ['target-pop','ターゲットポップ','◎','動く的を素早く押してスコアを伸ばす、反射神経ゲーム。','target',{seconds:30}],
  ['reaction-stop','リアクションストップ','!','合図が出た瞬間に止める、反応速度測定ゲーム。','reaction',{rounds:5}],
  ['quick-tap','クイックタップ','×','指定された色だけを押す、判断速度チャレンジ。','colorTap',{seconds:30}],
  ['star-catcher','スターキャッチャー','★','落ちてくる星をバーで受け止める、軽量アクション。','catcher',{seconds:45}],
  ['rain-dodge','レインドッジ','☂','降ってくる障害物を避け続ける、シンプル回避ゲーム。','avoid',{seconds:45}],
  ['lane-dash','レーンダッシュ','⇆','3レーンを切り替えて障害物を避ける、テンポ型ランゲーム。','lane',{seconds:45}],
  ['mini-maze','ミニメイズ','迷','小さな迷路を矢印キーで抜ける、短時間ルート探索。','maze',{size:9}],
  ['path-light','パスライト','↗','光ったマスを順番につないでゴールへ進む、経路記憶ゲーム。','path',{nodes:12}],
  ['grid-escape','グリッドエスケープ','◇','危険マスを避けて出口へ向かう、盤面読みのミニゲーム。','maze',{size:7,hazards:8}],
  ['lights-grid','ライトグリッド','☼','押したマスと周囲が反転する、全消しロジックパズル。','lights',{size:5}],
  ['color-match','カラーマッチ','色','文字と色の一致を見抜く、認知スピードゲーム。','colorTap',{seconds:40,stroop:true}],
  ['pattern-tiles','パターンタイル','▣','提示された模様と同じタイルを選ぶ、観察力ゲーム。','target',{seconds:35,pattern:true}],
  ['high-low','ハイロー','A','次の数字が上か下かを読む、シンプルなカード風ゲーム。','higher',{rounds:20}],
  ['dice-target','ダイスターゲット','⚂','サイコロを振って目標点を狙う、運と判断のゲーム。','dice',{turns:10}],
  ['yacht-lite','ヨットライト','⚄','5個のサイコロで役を狙う、商標名を避けた軽量ダイスゲーム。','dice',{turns:13,yacht:true}],
  ['countdown-tap','カウントタップ','秒','ゼロに近いタイミングで止める、体内時計チャレンジ。','timer',{rounds:6}],
  ['balance-scale','バランススケール','＝','左右の数が釣り合う選択肢を選ぶ、数感覚ゲーム。','math',{seconds:50,balance:true}],
  ['odd-one','オッドワン','?','ひとつだけ違う図形を探す、短時間の観察ゲーム。','odd',{rounds:15}]
];

const engine = String.raw`
(function(){
const cfg=window.GAME||{};const $=s=>document.querySelector(s);const app=$('#app');
let score=0,round=0,timer=0,interval=0,secret=[];
function shell(){document.title=cfg.title+' | 無料ゲーム';app.innerHTML='<div class="head"><a href="../">← 無料ゲーム一覧</a><strong>'+cfg.title+'</strong></div><div class="panel"><h1>'+cfg.icon+' '+cfg.title+'</h1><p>'+cfg.desc+'</p><div class="hud"><div>Score <b id="score">0</b></div><div id="state">Ready</div><button id="reset">新規</button></div><div id="stage"></div><div class="msg" id="msg"></div></div>';$('#reset').onclick=start}
function setScore(v){score=v;$('#score').textContent=score}function msg(t){$('#msg').textContent=t}function state(t){$('#state').textContent=t}function rand(n){return Math.floor(Math.random()*n)}function shuffle(a){for(let i=a.length-1;i>0;i--){let j=rand(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
function buttons(items,fn,cls=''){const st=$('#stage');st.innerHTML='';items.forEach((x,i)=>{let b=document.createElement('button');b.className='tile '+cls;b.textContent=x;b.onclick=()=>fn(x,i,b);st.appendChild(b)})}
function countdown(sec,done){clearInterval(interval);timer=sec;state(timer+'s');interval=setInterval(()=>{timer--;state(timer+'s');if(timer<=0){clearInterval(interval);done&&done()}},1000)}
function memory(){let n=cfg.options.pairs||8, vals=shuffle([...Array(n).keys(),...Array(n).keys()]),open=[],hit=0;buttons(vals.map(_=>'?'),(_,i,b)=>{if(b.dataset.done||open.find(o=>o.i===i))return;b.textContent=['●','■','▲','◆','★','✚','◎','☀','☂','♪'][vals[i]%10];open.push({i,b,v:vals[i]});if(open.length===2){round++;if(open[0].v===open[1].v){open.forEach(o=>{o.b.dataset.done=1;o.b.classList.add('good')});hit+=2;setScore(score+10);open=[];if(hit===vals.length)msg('CLEAR!')}else setTimeout(()=>{open.forEach(o=>o.b.textContent='?');open=[]},520)}})}
function sequence(){let seq=[],pos=0,items=['青','赤','黄','緑','紫','白'].slice(0,cfg.options.buttons||4);function next(){seq.push(rand(items.length));pos=0;msg('順番を覚えてください');buttons(items,(x,i)=>{if(i===seq[pos]){pos++;if(pos===seq.length){setScore(score+seq.length);setTimeout(next,400)}}else msg('MISS: '+seq.length+'手まで成功')});let bs=[...document.querySelectorAll('.tile')];seq.forEach((v,k)=>setTimeout(()=>bs[v].classList.add('flash'),280*k));seq.forEach((v,k)=>setTimeout(()=>bs[v].classList.remove('flash'),280*k+180))}next()}
function scramble(){let words=cfg.options.words||['PUZZLE'],w=words[rand(words.length)],letters=shuffle(w.split('')),ans='';msg('お題の英単語を作成');buttons(letters,(x,i,b)=>{ans+=x;b.disabled=true;state(ans);if(ans.length===w.length){if(ans===w){setScore(score+10);start()}else{msg('答え: '+w);setTimeout(start,900)}}})}
function code(){let slots=cfg.options.slots||4, colors='12345678'.slice(0,cfg.options.colors||6).split('');secret=Array.from({length:slots},()=>colors[rand(colors.length)]);let pick=[];msg(slots+'桁のコードを推理');buttons(colors,(x)=>{pick.push(x);state(pick.join(' '));if(pick.length===slots){let hit=pick.filter((v,i)=>v===secret[i]).length, incl=pick.filter(v=>secret.includes(v)).length-hit;round++;msg('位置一致 '+hit+' / 色のみ '+incl+' / '+round+'手');if(hit===slots){setScore(Math.max(1,12-round)*10);msg('CLEAR!')}pick=[]}})}
function math(){let max=cfg.options.max||20;countdown(cfg.options.seconds||45,()=>msg('TIME UP'));function q(){let a=rand(max)+1,b=rand(max)+1,op=Math.random()<.5?'+':'-',ans=op==='+'?a+b:a-b;if(cfg.options.balance){ans=rand(10)+1;a=ans+rand(5);b=a-ans;op='-'}state(a+' '+op+' '+b+' = ?');let opts=shuffle([ans,ans+1+rand(3),ans-1-rand(3),ans+4+rand(4)]);buttons(opts,(x)=>{if(x===ans){setScore(score+5);q()}else msg('MISS')})}q()}
function sort(){let arr=shuffle(Array.from({length:cfg.options.count||16},(_,i)=>i+1)),need=1;buttons(arr,(x,i,b)=>{if(x===need){b.disabled=true;b.classList.add('good');setScore(score+1);need++;if(need>arr.length)msg('CLEAR!')}else msg('MISS')})}
function make10(){function q(){let nums=shuffle([rand(9)+1,rand(9)+1,rand(9)+1,rand(9)+1]);let pair=[rand(9)+1,0];pair[1]=10-pair[0];nums[0]=pair[0];nums[1]=pair[1];nums=shuffle(nums);let sel=[];buttons(nums,(x,i,b)=>{sel.push(x);b.disabled=true;if(sel.length===2){if(sel[0]+sel[1]===10){setScore(score+10);round++;if(round>=10)msg('CLEAR!');else q()}else{msg('MISS');setTimeout(q,500)}}})}q()}
function target(){countdown(cfg.options.seconds||30,()=>msg('TIME UP'));function pop(){let st=$('#stage');st.innerHTML='<button class="big-target">'+(cfg.options.pattern?['●','■','▲','◆'][rand(4)]:'◎')+'</button>';$('.big-target').style.marginLeft=rand(55)+'%';$('.big-target').style.marginTop=rand(120)+'px';$('.big-target').onclick=()=>{setScore(score+1);pop()}}pop()}
function reaction(){let total=0;function one(){state('待機');buttons(['まだ押さない'],()=>msg('早すぎ'));let wait=800+rand(2200);setTimeout(()=>{let t=performance.now();buttons(['今!'],()=>{let r=Math.floor(performance.now()-t);total+=r;round++;setScore(Math.max(0,1000-r));msg(r+'ms');if(round<(cfg.options.rounds||5))setTimeout(one,650);else msg('平均 '+Math.floor(total/round)+'ms')},'good')},wait)}one()}
function colorTap(){let colors=['赤','青','黄','緑'],target='';countdown(cfg.options.seconds||30,()=>msg('TIME UP'));function q(){target=colors[rand(colors.length)];state(target+' を押す');buttons(shuffle(colors.slice()),(x)=>{if(x===target){setScore(score+3);q()}else msg('MISS')})}q()}
function catcher(){let st=$('#stage'),x=45,items=[];st.innerHTML='<canvas width="420" height="320"></canvas>';let c=$('canvas'),ctx=c.getContext('2d');countdown(cfg.options.seconds||45,()=>msg('TIME UP'));document.onkeydown=e=>{if(e.key==='ArrowLeft')x-=8;if(e.key==='ArrowRight')x+=8};c.onpointermove=e=>{let r=c.getBoundingClientRect();x=(e.clientX-r.left)/r.width*100};function loop(){if(timer<=0)return;ctx.clearRect(0,0,420,320);if(Math.random()<.05)items.push({x:rand(400),y:0});items.forEach(o=>o.y+=3);items=items.filter(o=>{let hit=o.y>285&&Math.abs(o.x-(x*4.2))<45;if(hit)setScore(score+1);return o.y<330&&!hit});ctx.fillStyle='#111827';ctx.fillRect(0,0,420,320);ctx.fillStyle='#f59e0b';items.forEach(o=>ctx.fillRect(o.x,o.y,14,14));ctx.fillStyle='#38bdf8';ctx.fillRect(x*4.2-40,292,80,12);requestAnimationFrame(loop)}loop()}
function avoid(){let st=$('#stage'),x=200,items=[];st.innerHTML='<canvas width="420" height="320"></canvas>';let c=$('canvas'),ctx=c.getContext('2d');countdown(cfg.options.seconds||45,()=>msg('SURVIVED'));document.onkeydown=e=>{if(e.key==='ArrowLeft')x-=12;if(e.key==='ArrowRight')x+=12};c.onpointermove=e=>{let r=c.getBoundingClientRect();x=(e.clientX-r.left)/r.width*420};function loop(){if(timer<=0)return;ctx.clearRect(0,0,420,320);if(Math.random()<.06)items.push({x:rand(400),y:0});items.forEach(o=>o.y+=4);for(const o of items)if(o.y>270&&Math.abs(o.x-x)<22){timer=0;msg('GAME OVER')}ctx.fillStyle='#111827';ctx.fillRect(0,0,420,320);ctx.fillStyle='#fb7185';items.forEach(o=>ctx.fillRect(o.x,o.y,18,18));ctx.fillStyle='#34d399';ctx.fillRect(x-14,282,28,28);requestAnimationFrame(loop)}loop()}
function lane(){let lane=1,obs=[];countdown(cfg.options.seconds||45,()=>msg('CLEAR!'));buttons(['左','中','右'],(_,i)=>lane=i);function tick(){if(timer<=0)return;if(Math.random()<.35)obs.push({l:rand(3),y:0});obs.forEach(o=>o.y++);obs=obs.filter(o=>{if(o.y>8&&o.l===lane){timer=0;msg('GAME OVER')}return o.y<10});state('レーン '+['左','中','右'][lane]+' / 障害 '+obs.length);setScore(score+1);setTimeout(tick,300)}tick()}
function maze(){let n=cfg.options.size||7,pos=0,goal=n*n-1,haz=new Set();while(haz.size<(cfg.options.hazards||0))haz.add(rand(n*n));function draw(){let arr=Array.from({length:n*n},(_,i)=>i===pos?'人':i===goal?'出':haz.has(i)?'×':'・');buttons(arr,()=>{},'mini');[...document.querySelectorAll('.tile')].forEach(b=>b.disabled=true)}document.onkeydown=e=>{let p=pos;if(e.key==='ArrowRight'&&pos%n<n-1)p++;if(e.key==='ArrowLeft'&&pos%n>0)p--;if(e.key==='ArrowDown'&&pos<n*n-n)p+=n;if(e.key==='ArrowUp'&&pos>=n)p-=n;if(haz.has(p)){msg('GAME OVER');return}pos=p;setScore(score+1);draw();if(pos===goal)msg('CLEAR!')};draw();msg('矢印キーで移動')}
function path(){let n=cfg.options.nodes||9,order=shuffle(Array.from({length:n},(_,i)=>i+1)),need=1;buttons(order,(x,i,b)=>{if(x===need){b.disabled=true;b.classList.add('good');need++;setScore(score+1);if(need>n)msg('CLEAR!')}else msg('MISS')})}
function lights(){let n=cfg.options.size||5,grid=Array.from({length:n*n},()=>Math.random()<.5);function tog(i){[i,i-1,i+1,i-n,i+n].forEach(j=>{if(j>=0&&j<n*n)grid[j]=!grid[j]})}function draw(){buttons(grid.map(v=>v?'ON':'OFF'),(_,i)=>{tog(i);setScore(score+1);draw();if(grid.every(v=>!v))msg('CLEAR!')},'mini')}draw()}
function higher(){let cur=rand(13)+1;state('現在 '+cur);buttons(['HIGH','LOW'],x=>{let next=rand(13)+1,ok=x==='HIGH'?next>=cur:next<=cur;if(ok){setScore(score+1);cur=next;state('現在 '+cur);round++;if(round>=cfg.options.rounds)msg('CLEAR!')}else msg('MISS: 次は '+next)})}
function dice(){function roll(){let ds=Array.from({length:cfg.options.yacht?5:3},()=>rand(6)+1),sum=ds.reduce((a,b)=>a+b,0);state(ds.join(' ')+' = '+sum);setScore(score+(sum>=12?sum:0));round++;if(round>=(cfg.options.turns||10))msg('終了')}buttons(['ROLL'],roll)}
function timerGame(){let target=3+rand(5),startT=performance.now();state(target+'.00秒で止める');buttons(['STOP'],()=>{let t=(performance.now()-startT)/1000,d=Math.abs(t-target);setScore(score+Math.max(0,100-Math.floor(d*100)));round++;msg(t.toFixed(2)+'秒');if(round<(cfg.options.rounds||6))setTimeout(timerGame,650)})}
function odd(){function q(){let n=16,odd=rand(n),base=['●','■','▲','◆'][rand(4)],diff=['○','□','△','◇'][rand(4)],arr=Array.from({length:n},(_,i)=>i===odd?diff:base);buttons(arr,(_,i)=>{if(i===odd){setScore(score+5);round++;if(round>=cfg.options.rounds)msg('CLEAR!');else q()}else msg('MISS')})}q()}
function boxes(){let n=cfg.options.size||4,edges={},boxes=0;function draw(){let total=n*(n-1)*2,arr=Array.from({length:total},(_,i)=>edges[i]?'━':'線');buttons(arr,(_,i,b)=>{if(edges[i])return;edges[i]=1;b.classList.add('good');setScore(++boxes);if(Object.keys(edges).length===total)msg('終了')},'mini')}draw()}
const map={memory,sequence,scramble,code,math,sort,make10,target,reaction,colorTap,catcher,avoid,lane,maze,path,lights,higher,dice,timer:timerGame,odd,boxes};
function start(){clearInterval(interval);setScore(0);round=0;msg('');state('Ready');(map[cfg.type]||target)()}
shell();start();
})();
`;

const page = (g) => `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${g[1]} | 無料ゲーム</title>
  <meta name="description" content="${g[3]}">
  <style>
    *{box-sizing:border-box}body{margin:0;min-height:100vh;font-family:'Segoe UI','Yu Gothic UI',sans-serif;background:linear-gradient(135deg,#e0f2fe,#fae8ff,#fef3c7);color:#172554;display:grid;place-items:center;padding:16px}.game{width:min(96vw,620px)}.head{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}.head a{color:#4f46e5;text-decoration:none;font-weight:800}.panel{background:rgba(255,255,255,.86);border:1px solid white;border-radius:22px;box-shadow:0 18px 44px rgba(79,70,229,.15);padding:18px}h1{font-size:clamp(1.5rem,6vw,2.4rem);margin:.1rem 0 .4rem}.hud{display:grid;grid-template-columns:1fr 1fr auto;gap:8px;margin:12px 0}.hud div,.hud button{border:0;border-radius:14px;background:#eef2ff;padding:10px;text-align:center;font-weight:900}.hud button{background:#312e81;color:white;cursor:pointer}#stage{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;min-height:220px;align-content:center}.tile{border:0;border-radius:14px;background:linear-gradient(135deg,#38bdf8,#818cf8);color:white;min-height:58px;font-size:1.25rem;font-weight:950;cursor:pointer;box-shadow:inset 0 -4px rgba(0,0,0,.12)}.tile:disabled{opacity:.55;cursor:default}.mini{font-size:.9rem;min-height:42px}.good{background:linear-gradient(135deg,#22c55e,#14b8a6)!important}.flash{background:#f59e0b!important}.big-target{border:0;border-radius:999px;background:#fb7185;color:white;width:86px;height:86px;font-size:2rem;font-weight:950;cursor:pointer}canvas{width:100%;background:#111827;border-radius:16px;display:block;touch-action:none}.msg{text-align:center;min-height:28px;margin-top:10px;font-weight:950;color:#db2777}@media(max-width:560px){#stage{grid-template-columns:repeat(3,1fr)}.hud{grid-template-columns:1fr 1fr}.hud button{grid-column:1/-1}}
  </style>
</head>
<body>
  <div class="game" id="app"></div>
  <script>window.GAME=${JSON.stringify({title:g[1],icon:g[2],desc:g[3],type:g[4],options:g[5]})};</script>
  <script src="../mini-game.js"></script>
</body>
</html>
`;

const card = (g) => `        <a class="game-card" href="./${g[0]}/">
          <div class="game-top">
            <div class="game-icon">${g[2]}</div>
            <span class="live">公開中</span>
          </div>
          <div class="game-title">${g[1]}</div>
          <p class="game-desc">${g[3]}</p>
          <div class="game-foot">
            <span class="url">games/${g[0]}/</span>
            <span class="open">遊ぶ →</span>
          </div>
        </a>`;

fs.writeFileSync(path.join(gamesDir, 'mini-game.js'), engine.trim() + '\n', 'utf8');
for (const g of games) {
  const dir = path.join(gamesDir, g[0]);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), page(g), 'utf8');
}

const indexPath = path.join(gamesDir, 'index.html');
let index = fs.readFileSync(indexPath, 'utf8');
index = index.replace(/<span class="chip">\d+ Games<\/span>/, '<span class="chip">36 Games</span>');
index = index.replace(/<meta name="description" content="[^"]*">/, '<meta name="description" content="ブラウザで遊べる無料ゲーム一覧。パズル、反射、記憶、推理、アクションなど36本の無料ゲームを登録不要で公開しています。">');
const block = '\n        <!-- more-games-2026-05 -->\n' + games.map(card).join('\n') + '\n        <!-- /more-games-2026-05 -->';
if (!index.includes('more-games-2026-05')) {
  index = index.replace(/\n      <\/div>\r?\n    <\/section>/, block + '\n      </div>\n    </section>');
}
fs.writeFileSync(indexPath, index, 'utf8');

const homePath = path.join(root, 'index.html');
let home = fs.readFileSync(homePath, 'utf8');
home = home.replace(/<span class="sec-chip">\d+ Games<\/span>/, '<span class="sec-chip">36 Games</span>');
home = home.replace('落ち物・パズル・アクションなどを公開中。', 'パズル・反射・記憶・推理・アクションなど36本を公開中。');
fs.writeFileSync(homePath, home, 'utf8');

console.log('addedGames=' + games.length);
