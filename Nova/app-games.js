/* NovaDesk Games Pack v1.2
   Registers retro and modern offline games as NovaDesk apps. No external assets or network calls. */
(function () {
  if (!window.NovaApps) return;

  const GAMES = [
    ["game-snake", "Snake", "🐍", "Arrow keys or WASD. Eat gems, avoid yourself."],
    ["game-pong", "Pong", "🏓", "Mouse or touch to move the paddle."],
    ["game-breakout", "Breakout", "🧱", "Clear bricks with the ball and paddle."],
    ["game-blocks", "Falling Blocks", "🟦", "Mini block stacker inspired by classic falling block games."],
    ["game-space", "Space Defender", "🚀", "Move, shoot and dodge falling asteroids."],
    ["game-flappy", "Flappy Orb", "🪽", "Click or press Space to flap through gates."],
    ["game-mines", "Minesweeper", "💣", "Find all safe cells. Right-click to flag."],
    ["game-memory", "Memory Match", "🧠", "Match all card pairs."],
    ["game-2048", "2048", "🔢", "Use arrow keys to merge tiles."],
    ["game-tictactoe", "Tic Tac Toe", "⭕", "Play against a simple local CPU."],
    ["game-simon", "Simon Says", "🎵", "Repeat the colour sequence."],
    ["game-whack", "Whack-a-Mole", "🔨", "Hit targets before time runs out."],
    ["game-maze", "Maze Runner", "🧩", "Reach the green exit with arrow keys."],
    ["game-reaction", "Reaction Test", "⚡", "Click as soon as the panel turns green."],
    ["game-guess", "Number Guess", "🎯", "Guess the secret number."],
    ["game-word", "Word Scramble", "🔤", "Unscramble the word."],
    ["game-slide", "Slide Puzzle", "🧊", "Arrange the numbered tiles."],
  ];

  const css = `
    .game-shell{height:100%;display:flex;flex-direction:column;background:linear-gradient(135deg,rgba(15,23,42,.08),rgba(96,165,250,.08));}
    .game-top{display:flex;gap:8px;align-items:center;justify-content:space-between;padding:10px;border-bottom:1px solid var(--border,rgba(148,163,184,.35));}
    .game-top strong{font-size:15px}.game-score{color:var(--muted,#64748b);font-size:13px}.game-area{flex:1;min-height:0;display:grid;place-items:center;padding:12px;overflow:auto}.game-row{display:flex;gap:8px;align-items:center;justify-content:center;flex-wrap:wrap}.game-btn{border:1px solid var(--border,rgba(148,163,184,.35));border-radius:12px;padding:8px 11px;background:rgba(255,255,255,.18);color:var(--text,#111827);cursor:pointer}.game-btn:hover{background:rgba(148,163,184,.2)}.game-canvas{width:min(100%,640px);height:auto;max-height:100%;border-radius:18px;border:1px solid var(--border,rgba(148,163,184,.35));background:#020617;box-shadow:0 18px 45px rgba(15,23,42,.25);touch-action:none}.games-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px;width:100%;align-self:stretch}.game-card{border:1px solid var(--border,rgba(148,163,184,.35));border-radius:18px;padding:14px;background:rgba(255,255,255,.16);color:var(--text,#111827);text-align:left;cursor:pointer;min-height:118px}.game-card:hover{transform:translateY(-2px);background:rgba(148,163,184,.18)}.game-card .big{font-size:34px;display:block;margin-bottom:8px}.game-card small{display:block;color:var(--muted,#64748b);margin-top:4px;line-height:1.35}.grid-board{display:grid;gap:8px}.tile,.cell{display:grid;place-items:center;border-radius:12px;border:1px solid var(--border,rgba(148,163,184,.35));background:rgba(255,255,255,.18);color:var(--text,#111827);font-weight:700;cursor:pointer;user-select:none}.tile:hover,.cell:hover{background:rgba(148,163,184,.18)}.board-4{grid-template-columns:repeat(4,72px)}.board-3{grid-template-columns:repeat(3,86px)}.board-mines{grid-template-columns:repeat(10,34px);gap:4px}.board-maze{grid-template-columns:repeat(12,28px);gap:3px}.cell{width:34px;height:34px}.maze-cell{width:28px;height:28px;border-radius:7px}.wall{background:#334155}.player{background:#60a5fa}.exit{background:#22c55e}.mine-open{background:rgba(148,163,184,.25)}.danger{background:#ef4444!important;color:white}.good{background:#22c55e!important;color:white}.tile2048{width:76px;height:76px;font-size:24px}.reaction-box{width:min(420px,90%);min-height:220px;border-radius:26px;display:grid;place-items:center;text-align:center;padding:22px;background:#334155;color:white;cursor:pointer}.simon-pad{width:110px;height:110px;border-radius:28px;border:0;opacity:.72;cursor:pointer}.simon-pad.on{opacity:1;filter:brightness(1.35);transform:scale(1.04)}@media(max-width:650px){.board-4{grid-template-columns:repeat(4,58px)}.tile2048{width:58px;height:58px}.board-3{grid-template-columns:repeat(3,72px)}}`;
  const style = document.createElement("style"); style.textContent = css; document.head.appendChild(style);

  const rand = n => Math.floor(Math.random() * n);
  const shuffle = a => a.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(x => x[1]);
  function alive(container) { return document.body.contains(container); }
  function shell(container, title, icon, subtitle = "") {
    container.innerHTML = `<div class="game-shell"><div class="game-top"><div><strong>${icon} ${title}</strong><div class="game-score">${subtitle}</div></div><div class="game-row"><button class="game-btn" data-restart>Restart</button><button class="game-btn" data-hub>Games Hub</button></div></div><div class="game-area"></div></div>`;
    container.querySelector("[data-hub]").onclick = () => NovaWindows.openApp("games");
    return container.querySelector(".game-area");
  }
  function canvasGame(container, title, icon, subtitle, setup) {
    const area = shell(container, title, icon, subtitle);
    area.innerHTML = `<canvas class="game-canvas" width="640" height="420" tabindex="0"></canvas>`;
    const canvas = area.querySelector("canvas");
    const cleanup = setup(canvas, container) || (() => {});
    container.querySelector("[data-restart]").onclick = () => { cleanup(); canvasGame(container, title, icon, subtitle, setup); };
    setTimeout(() => canvas.focus(), 40);
  }

  function hub(container) {
    const area = shell(container, "Games Hub", "🎮", `${GAMES.length} offline games installed`);
    container.querySelector("[data-restart]").textContent = "Refresh";
    container.querySelector("[data-restart]").onclick = () => hub(container);
    area.innerHTML = `<div class="games-grid"></div>`;
    const grid = area.querySelector(".games-grid");
    GAMES.forEach(([id, name, icon, desc]) => {
      const b = document.createElement("button");
      b.className = "game-card";
      b.innerHTML = `<span class="big">${icon}</span><strong>${name}</strong><small>${desc}</small>`;
      b.onclick = () => NovaWindows.openApp(id);
      grid.appendChild(b);
    });
  }

  function snake(container) {
    canvasGame(container, "Snake", "🐍", "Arrow keys or WASD", (cv, host) => {
      const ctx = cv.getContext("2d"), size = 20, cols = 32, rows = 21;
      let snake = [{x: 8, y: 10}], dir = {x: 1, y: 0}, next = dir, food = {x: 18, y: 10}, score = 0, over = false, timer;
      function placeFood(){ do { food = {x: rand(cols), y: rand(rows)}; } while (snake.some(s => s.x === food.x && s.y === food.y)); }
      function key(e){ const k=e.key.toLowerCase(); const map={arrowup:[0,-1],w:[0,-1],arrowdown:[0,1],s:[0,1],arrowleft:[-1,0],a:[-1,0],arrowright:[1,0],d:[1,0]}; if(map[k]){e.preventDefault(); const [x,y]=map[k]; if(x!==-dir.x||y!==-dir.y) next={x,y};}}
      cv.addEventListener("keydown", key);
      function draw(){ ctx.fillStyle="#020617";ctx.fillRect(0,0,640,420); ctx.fillStyle="#22c55e"; snake.forEach(p=>ctx.fillRect(p.x*size+2,p.y*size+2,16,16)); ctx.fillStyle="#f43f5e"; ctx.beginPath(); ctx.arc(food.x*size+10,food.y*size+10,8,0,7); ctx.fill(); ctx.fillStyle="#e5e7eb"; ctx.font="18px Segoe UI"; ctx.fillText(`Score ${score}`,14,24); if(over){ctx.font="34px Segoe UI";ctx.fillText("Game Over",235,205);}}
      function step(){ if(!alive(host)){clearInterval(timer);return} if(over){draw();return} dir=next; const h={x:(snake[0].x+dir.x+cols)%cols,y:(snake[0].y+dir.y+rows)%rows}; if(snake.some(s=>s.x===h.x&&s.y===h.y)){over=true;draw();return} snake.unshift(h); if(h.x===food.x&&h.y===food.y){score++;placeFood()} else snake.pop(); draw(); }
      timer=setInterval(step,105); draw(); return ()=>{clearInterval(timer); cv.removeEventListener("keydown",key)};
    });
  }

  function pong(container) {
    canvasGame(container, "Pong", "🏓", "Move mouse or touch to control paddle", (cv, host) => {
      const ctx=cv.getContext("2d"); let px=280, bx=320, by=210, vx=4, vy=3, cpu=280, score=0, raf;
      function move(e){ const r=cv.getBoundingClientRect(); px=((e.touches?e.touches[0].clientX:e.clientX)-r.left)*(cv.width/r.width)-50; }
      cv.addEventListener("mousemove",move); cv.addEventListener("touchmove",move,{passive:true});
      function loop(){ if(!alive(host))return; ctx.fillStyle="#020617";ctx.fillRect(0,0,640,420); cpu+=(bx-cpu-50)*.06; bx+=vx; by+=vy; if(bx<8||bx>632)vx*=-1; if(by<20&&bx>cpu&&bx<cpu+100)vy=Math.abs(vy); if(by>386&&bx>px&&bx<px+100){vy=-Math.abs(vy);score++;vx*=1.02;vy*=1.02} if(by>430||by<-20){bx=320;by=210;vx=4*(Math.random()>.5?1:-1);vy=3;score=0} ctx.fillStyle="#60a5fa";ctx.fillRect(cpu,10,100,12);ctx.fillStyle="#22c55e";ctx.fillRect(px,398,100,12);ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(bx,by,9,0,7);ctx.fill();ctx.font="18px Segoe UI";ctx.fillText(`Rally ${score}`,14,26);raf=requestAnimationFrame(loop)} loop(); return()=>cancelAnimationFrame(raf);
    });
  }

  function breakout(container) {
    canvasGame(container, "Breakout", "🧱", "Clear all bricks", (cv, host) => {
      const ctx=cv.getContext("2d"); let px=270,bx=320,by=320,vx=4,vy=-4,score=0,raf; let bricks=[]; for(let y=0;y<5;y++)for(let x=0;x<10;x++)bricks.push({x:20+x*60,y:40+y*24,w:52,h:16,on:true});
      function move(e){const r=cv.getBoundingClientRect();px=((e.touches?e.touches[0].clientX:e.clientX)-r.left)*(cv.width/r.width)-50} cv.addEventListener("mousemove",move); cv.addEventListener("touchmove",move,{passive:true});
      function loop(){ if(!alive(host))return; bx+=vx;by+=vy;if(bx<8||bx>632)vx*=-1;if(by<8)vy*=-1;if(by>386&&bx>px&&bx<px+100)vy=-Math.abs(vy);if(by>430){bx=320;by=320;score=0} bricks.forEach(b=>{if(b.on&&bx>b.x&&bx<b.x+b.w&&by>b.y&&by<b.y+b.h){b.on=false;vy*=-1;score++}});ctx.fillStyle="#020617";ctx.fillRect(0,0,640,420);bricks.forEach(b=>{if(b.on){ctx.fillStyle=`hsl(${b.y},80%,60%)`;ctx.fillRect(b.x,b.y,b.w,b.h)}});ctx.fillStyle="#22c55e";ctx.fillRect(px,398,100,12);ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(bx,by,8,0,7);ctx.fill();ctx.font="18px Segoe UI";ctx.fillText(`Bricks ${score}/50`,14,26);if(score===50){ctx.font="32px Segoe UI";ctx.fillText("You cleared it!",220,220)}raf=requestAnimationFrame(loop)}loop();return()=>cancelAnimationFrame(raf);
    });
  }

  function blocks(container) {
    canvasGame(container, "Falling Blocks", "🟦", "Arrow keys move, Space drops", (cv, host) => {
      const ctx=cv.getContext("2d"), W=10,H=18,S=22,ox=210,oy=12; let grid=Array.from({length:H},()=>Array(W).fill(0)), p, score=0, over=false, timer;
      const shapes=[[[1,1,1,1]],[[1,1],[1,1]],[[0,1,0],[1,1,1]],[[1,0,0],[1,1,1]],[[0,0,1],[1,1,1]],[[1,1,0],[0,1,1]],[[0,1,1],[1,1,0]]];
      function spawn(){p={x:3,y:0,s:JSON.parse(JSON.stringify(shapes[rand(shapes.length)])),c:1+rand(6)}; if(hit(0,0,p.s))over=true}
      function hit(dx,dy,s){return s.some((r,y)=>r.some((v,x)=>v&&(p.x+x+dx<0||p.x+x+dx>=W||p.y+y+dy>=H||grid[p.y+y+dy]?.[p.x+x+dx]))) }
      function merge(){p.s.forEach((r,y)=>r.forEach((v,x)=>{if(v&&p.y+y>=0)grid[p.y+y][p.x+x]=p.c})); grid=grid.filter(r=>r.some(v=>!v)); const cleared=H-grid.length; while(grid.length<H)grid.unshift(Array(W).fill(0)); score+=cleared*100; spawn()}
      function rot(){const s=p.s[0].map((_,i)=>p.s.map(r=>r[i]).reverse()); if(!hit(0,0,s))p.s=s}
      function key(e){if(over)return; if(e.key==="ArrowLeft"&&!hit(-1,0,p.s))p.x--; if(e.key==="ArrowRight"&&!hit(1,0,p.s))p.x++; if(e.key==="ArrowUp")rot(); if(e.key==="ArrowDown"&&!hit(0,1,p.s))p.y++; if(e.key===" "){while(!hit(0,1,p.s))p.y++; merge()} draw(); e.preventDefault()}
      cv.addEventListener("keydown",key); function step(){if(!alive(host)){clearInterval(timer);return} if(over){draw();return} if(hit(0,1,p.s))merge(); else p.y++; draw()}
      function draw(){ctx.fillStyle="#020617";ctx.fillRect(0,0,640,420); const block=(x,y,c)=>{ctx.fillStyle=`hsl(${c*48},80%,58%)`;ctx.fillRect(ox+x*S+1,oy+y*S+1,S-2,S-2)}; grid.forEach((r,y)=>r.forEach((v,x)=>v&&block(x,y,v))); if(p)p.s.forEach((r,y)=>r.forEach((v,x)=>v&&block(p.x+x,p.y+y,p.c))); ctx.strokeStyle="#334155";ctx.strokeRect(ox,oy,W*S,H*S);ctx.fillStyle="#e5e7eb";ctx.font="18px Segoe UI";ctx.fillText(`Score ${score}`,14,26); if(over){ctx.font="32px Segoe UI";ctx.fillText("Game Over",240,210)}} spawn(); timer=setInterval(step,430); draw(); return()=>{clearInterval(timer);cv.removeEventListener("keydown",key)};
    });
  }

  function space(container) {
    canvasGame(container, "Space Defender", "🚀", "Arrow keys move, Space shoots", (cv, host) => {
      const ctx=cv.getContext("2d"); let ship={x:310,y:370}, keys={}, shots=[], rocks=[], score=0, hp=3, raf, tick=0;
      function key(e,v){keys[e.key]=v;if(["ArrowLeft","ArrowRight"," "].includes(e.key))e.preventDefault()} cv.addEventListener("keydown",e=>key(e,true)); cv.addEventListener("keyup",e=>key(e,false));
      function loop(){if(!alive(host))return;tick++;if(keys.ArrowLeft)ship.x-=6;if(keys.ArrowRight)ship.x+=6;ship.x=Math.max(10,Math.min(610,ship.x));if(keys[" "]&&tick%8===0)shots.push({x:ship.x+10,y:ship.y});if(tick%28===0)rocks.push({x:rand(620),y:-20,s:14+rand(18)});shots.forEach(s=>s.y-=8);rocks.forEach(r=>r.y+=2.3);shots=shots.filter(s=>s.y>-10);rocks=rocks.filter(r=>r.y<450);rocks.forEach(r=>{shots.forEach(s=>{if(Math.hypot(s.x-r.x,s.y-r.y)<r.s){r.dead=true;s.y=-99;score++}});if(Math.hypot(ship.x+10-r.x,ship.y-r.y)<r.s+10){r.dead=true;hp--}});rocks=rocks.filter(r=>!r.dead);ctx.fillStyle="#020617";ctx.fillRect(0,0,640,420);ctx.fillStyle="#60a5fa";ctx.beginPath();ctx.moveTo(ship.x+10,ship.y-18);ctx.lineTo(ship.x,ship.y+18);ctx.lineTo(ship.x+20,ship.y+18);ctx.fill();ctx.fillStyle="#f8fafc";shots.forEach(s=>ctx.fillRect(s.x-2,s.y,4,12));ctx.fillStyle="#f97316";rocks.forEach(r=>{ctx.beginPath();ctx.arc(r.x,r.y,r.s,0,7);ctx.fill()});ctx.fillStyle="#e5e7eb";ctx.font="18px Segoe UI";ctx.fillText(`Score ${score}  HP ${hp}`,14,26);if(hp<=0){ctx.font="34px Segoe UI";ctx.fillText("Game Over",235,210);return}raf=requestAnimationFrame(loop)}loop();return()=>cancelAnimationFrame(raf);
    });
  }

  function flappy(container) {
    canvasGame(container, "Flappy Orb", "🪽", "Click or Space to flap", (cv, host) => {
      const ctx=cv.getContext("2d"); let y=200,vy=0,pipes=[],score=0,over=false,raf,t=0;
      function flap(e){vy=-7;if(e)e.preventDefault()} cv.addEventListener("pointerdown",flap); cv.addEventListener("keydown",e=>{if(e.key===" ")flap(e)});
      function loop(){if(!alive(host))return;t++;vy+=.38;y+=vy;if(t%92===0){const gap=105,top=50+rand(220);pipes.push({x:660,top,gap,pass:false})}pipes.forEach(p=>p.x-=3);pipes=pipes.filter(p=>p.x>-70);pipes.forEach(p=>{if(!p.pass&&p.x<90){score++;p.pass=true} if(90>p.x&&90<p.x+54&&(y<p.top||y>p.top+p.gap))over=true}); if(y<0||y>420)over=true;ctx.fillStyle="#0f172a";ctx.fillRect(0,0,640,420);ctx.fillStyle="#38bdf8";pipes.forEach(p=>{ctx.fillRect(p.x,0,54,p.top);ctx.fillRect(p.x,p.top+p.gap,54,420)});ctx.fillStyle="#facc15";ctx.beginPath();ctx.arc(90,y,16,0,7);ctx.fill();ctx.fillStyle="#e5e7eb";ctx.font="18px Segoe UI";ctx.fillText(`Score ${score}`,14,26);if(over){ctx.font="34px Segoe UI";ctx.fillText("Game Over",235,210);return}raf=requestAnimationFrame(loop)}loop();return()=>cancelAnimationFrame(raf);
    });
  }

  function mines(container) {
    const area=shell(container,"Minesweeper","💣","10 x 10 board, 14 mines. Right-click flags."); let minesSet,open,flags,over;
    container.querySelector("[data-restart]").onclick=()=>mines(container);
    function init(){minesSet=new Set();while(minesSet.size<14)minesSet.add(rand(100));open=new Set();flags=new Set();over=false;draw()}
    function count(i){let c=0,x=i%10,y=Math.floor(i/10);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){let nx=x+dx,ny=y+dy;if(nx>=0&&nx<10&&ny>=0&&ny<10&&minesSet.has(ny*10+nx))c++}return c}
    function reveal(i){if(flags.has(i)||open.has(i)||over)return;if(minesSet.has(i)){over=true;open=new Set([...Array(100).keys()]);draw();return}open.add(i);if(count(i)===0){let x=i%10,y=Math.floor(i/10);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){let nx=x+dx,ny=y+dy;if(nx>=0&&nx<10&&ny>=0&&ny<10)reveal(ny*10+nx)}}draw()}
    function draw(){area.innerHTML=`<div><div class="game-row" style="margin-bottom:10px"><span class="game-score">Safe opened: ${[...open].filter(i=>!minesSet.has(i)).length}/86</span></div><div class="grid-board board-mines"></div></div>`;const b=area.querySelector(".board-mines");for(let i=0;i<100;i++){const cell=document.createElement("button");cell.className="cell"+(open.has(i)?" mine-open":"")+(over&&minesSet.has(i)?" danger":"");cell.textContent=flags.has(i)?"🚩":open.has(i)?(minesSet.has(i)?"💣":(count(i)||"")):"";cell.onclick=()=>reveal(i);cell.oncontextmenu=e=>{e.preventDefault();flags.has(i)?flags.delete(i):flags.add(i);draw()};b.appendChild(cell)}}init();
  }

  function memory(container) { const area=shell(container,"Memory Match","🧠","Single-click two cards to match pairs."); container.querySelector("[data-restart]").onclick=()=>memory(container); let vals=shuffle(["🚀","🚀","🌙","🌙","⭐","⭐","🍄","🍄","🎲","🎲","🎧","🎧","⚡","⚡","💎","💎"]),show=[],done=[]; function draw(){area.innerHTML='<div class="grid-board board-4"></div>'; const b=area.firstChild; vals.forEach((v,i)=>{const c=document.createElement("button");c.className="tile tile2048";c.textContent=done.includes(i)||show.includes(i)?v:"?";c.onclick=()=>{if(show.length<2&&!show.includes(i)&&!done.includes(i)){show.push(i); if(show.length===2){if(vals[show[0]]===vals[show[1]])done.push(...show); setTimeout(()=>{show=[];draw()},600)} draw()}};b.appendChild(c)})} draw(); }

  function two048(container) { const area=shell(container,"2048","🔢","Use arrow keys. Click board first if needed."); container.querySelector("[data-restart]").onclick=()=>two048(container); let g; function add(){let e=[];g.forEach((r,y)=>r.forEach((v,x)=>!v&&e.push([x,y]))); if(e.length){let [x,y]=e[rand(e.length)];g[y][x]=Math.random()<.9?2:4}} function init(){g=Array.from({length:4},()=>Array(4).fill(0));add();add();draw()} function slide(row){let a=row.filter(Boolean);for(let i=0;i<a.length-1;i++)if(a[i]===a[i+1]){a[i]*=2;a.splice(i+1,1)}while(a.length<4)a.push(0);return a} function move(d){let old=JSON.stringify(g); if(d==="left")g=g.map(slide); if(d==="right")g=g.map(r=>slide(r.reverse()).reverse()); if(d==="up")for(let x=0;x<4;x++){let col=slide(g.map(r=>r[x]));for(let y=0;y<4;y++)g[y][x]=col[y]} if(d==="down")for(let x=0;x<4;x++){let col=slide(g.map(r=>r[x]).reverse()).reverse();for(let y=0;y<4;y++)g[y][x]=col[y]} if(JSON.stringify(g)!==old)add();draw()} function draw(){area.innerHTML='<div class="grid-board board-4" tabindex="0"></div>';const b=area.firstChild;b.onkeydown=e=>{const m={ArrowLeft:"left",ArrowRight:"right",ArrowUp:"up",ArrowDown:"down"}[e.key];if(m){e.preventDefault();move(m)}};g.forEach(r=>r.forEach(v=>{const t=document.createElement("div");t.className="tile tile2048";t.style.background=v?`hsl(${Math.log2(v)*28},78%,62%)`:"rgba(255,255,255,.12)";t.textContent=v||"";b.appendChild(t)}));setTimeout(()=>b.focus(),20)} init(); }

  function tictactoe(container){const area=shell(container,"Tic Tac Toe","⭕","You are X. CPU is O.");container.querySelector("[data-restart]").onclick=()=>tictactoe(container);let b=Array(9).fill(""),msg="Your move";function win(s){return[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]].some(l=>l.every(i=>b[i]===s))}function cpu(){let e=b.map((v,i)=>v?null:i).filter(v=>v!==null);if(e.length&&!win("X")){b[e[rand(e.length)]]="O"}msg=win("O")?"CPU wins":b.every(Boolean)?"Draw":"Your move";draw()}function click(i){if(b[i]||win("X")||win("O"))return;b[i]="X";msg=win("X")?"You win":b.every(Boolean)?"Draw":"CPU thinking";draw();if(!win("X")&&!b.every(Boolean))setTimeout(cpu,250)}function draw(){area.innerHTML=`<div><div class="game-score" style="text-align:center;margin-bottom:10px">${msg}</div><div class="grid-board board-3"></div></div>`;const g=area.querySelector(".board-3");b.forEach((v,i)=>{const c=document.createElement("button");c.className="tile";c.style.width="86px";c.style.height="86px";c.style.fontSize="34px";c.textContent=v;c.onclick=()=>click(i);g.appendChild(c)})}draw()}

  function simon(container){const area=shell(container,"Simon Says","🎵","Repeat the sequence.");container.querySelector("[data-restart]").onclick=()=>simon(container);let seq=[],input=[],busy=false,level=0;const colors=["#ef4444","#22c55e","#3b82f6","#eab308"];function draw(){area.innerHTML=`<div><div class="game-score" style="text-align:center;margin-bottom:10px">Level ${level}</div><div class="game-row" style="width:240px"></div><div class="game-row" style="margin-top:12px"><button class="game-btn" data-start>Start next</button></div></div>`;const row=area.querySelector(".game-row");colors.forEach((c,i)=>{const b=document.createElement("button");b.className="simon-pad";b.style.background=c;b.onclick=()=>press(i,b);row.appendChild(b)});area.querySelector("[data-start]").onclick=next}function flash(i){const b=area.querySelectorAll(".simon-pad")[i];b.classList.add("on");setTimeout(()=>b.classList.remove("on"),260)}function next(){if(busy)return;seq.push(rand(4));input=[];level=seq.length;draw();busy=true;seq.forEach((n,i)=>setTimeout(()=>flash(n),450*i+250));setTimeout(()=>busy=false,seq.length*450+250)}function press(i,b){if(busy||!seq.length)return;flash(i);input.push(i);let j=input.length-1;if(input[j]!==seq[j]){seq=[];level=0;alert("Wrong sequence. Restarting.");draw();return}if(input.length===seq.length)setTimeout(next,450)}draw()}

  function whack(container){const area=shell(container,"Whack-a-Mole","🔨","30 seconds. Click targets.");container.querySelector("[data-restart]").onclick=()=>whack(container);let score=0,time=30,pos=rand(9),timer;function draw(){area.innerHTML=`<div><div class="game-score" style="text-align:center;margin-bottom:10px">Score ${score} | Time ${time}</div><div class="grid-board board-3"></div></div>`;const g=area.querySelector(".board-3");for(let i=0;i<9;i++){const b=document.createElement("button");b.className="tile";b.style.width="86px";b.style.height="86px";b.style.fontSize="30px";b.textContent=i===pos?"🐹":"";b.onclick=()=>{if(i===pos&&time>0){score++;pos=rand(9);draw()}};g.appendChild(b)}}timer=setInterval(()=>{if(!alive(container)){clearInterval(timer);return}time--;pos=rand(9);draw();if(time<=0)clearInterval(timer)},1000);draw()}

  function maze(container){const area=shell(container,"Maze Runner","🧩","Arrow keys to reach the green exit.");container.querySelector("[data-restart]").onclick=()=>maze(container);const map=["############","#S#        #","# # ###### #","# #      # #","# ###### # #","#      # # #","###### # # #","#      #   #","# ####### ##","#          E","############"];let x=1,y=1,msg="Find the exit";function draw(){area.innerHTML=`<div><div class="game-score" style="text-align:center;margin-bottom:10px">${msg}</div><div class="grid-board board-maze" tabindex="0"></div></div>`;const g=area.querySelector(".board-maze");map.forEach((r,yy)=>[...r].forEach((ch,xx)=>{const c=document.createElement("div");c.className="maze-cell "+(ch==="#"?"wall":ch==="E"?"exit":"")+(x===xx&&y===yy?" player":"");g.appendChild(c)}));g.onkeydown=e=>{const m={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[e.key];if(m){e.preventDefault();let nx=x+m[0],ny=y+m[1];if(map[ny]?.[nx]!=="#"){x=nx;y=ny;if(map[y][x]==="E")msg="You escaped!";draw()}}};setTimeout(()=>g.focus(),20)}draw()}

  function reaction(container){const area=shell(container,"Reaction Test","⚡","Click only when it turns green.");container.querySelector("[data-restart]").onclick=()=>reaction(container);let ready=false,start=0,timer;area.innerHTML='<div class="reaction-box">Wait for green...</div>';const box=area.firstChild;timer=setTimeout(()=>{ready=true;start=performance.now();box.classList.add("good");box.textContent="Click now!"},900+rand(2500));box.onclick=()=>{if(!ready){clearTimeout(timer);box.classList.add("danger");box.textContent="Too soon. Press Restart."}else{box.textContent=`${Math.round(performance.now()-start)} ms`;ready=false}}}

  function guess(container){const area=shell(container,"Number Guess","🎯","Guess a number from 1 to 100.");container.querySelector("[data-restart]").onclick=()=>guess(container);let secret=1+rand(100),tries=0;area.innerHTML='<div class="card"><h3>Enter your guess</h3><div class="game-row"><input class="setting-input" type="number" min="1" max="100" style="max-width:150px"><button class="game-btn">Guess</button></div><p class="game-score"></p></div>';const input=area.querySelector("input"),out=area.querySelector("p");area.querySelector("button").onclick=()=>{tries++;let v=+input.value;out.textContent=v===secret?`Correct in ${tries} tries!`:v<secret?"Higher":"Lower";input.select()};input.onkeydown=e=>{if(e.key==="Enter")area.querySelector("button").click()};input.focus()}

  function word(container){const words=["desktop","browser","window","galaxy","puzzle","keyboard","network","storage","terminal","animation"];const area=shell(container,"Word Scramble","🔤","Unscramble the word.");container.querySelector("[data-restart]").onclick=()=>word(container);let word=words[rand(words.length)],scr=shuffle([...word]).join("");area.innerHTML=`<div class="card"><h2 style="letter-spacing:4px">${scr}</h2><div class="game-row"><input class="setting-input" style="max-width:220px"><button class="game-btn">Check</button></div><p class="game-score"></p></div>`;const input=area.querySelector("input"),out=area.querySelector("p");area.querySelector("button").onclick=()=>{out.textContent=input.value.toLowerCase()===word?"Correct!":"Try again"};input.onkeydown=e=>{if(e.key==="Enter")area.querySelector("button").click()};input.focus()}

  function slide(container){const area=shell(container,"Slide Puzzle","🧊","Arrange 1 to 15.");container.querySelector("[data-restart]").onclick=()=>slide(container);let arr=shuffle([...Array(15).keys()].map(i=>i+1).concat(0));function draw(){area.innerHTML='<div class="grid-board board-4"></div>';const g=area.firstChild;arr.forEach((v,i)=>{const b=document.createElement("button");b.className="tile tile2048";b.textContent=v||"";b.style.visibility=v?"visible":"hidden";b.onclick=()=>move(i);g.appendChild(b)})}function move(i){let z=arr.indexOf(0),x=i%4,y=Math.floor(i/4),zx=z%4,zy=Math.floor(z/4);if(Math.abs(x-zx)+Math.abs(y-zy)===1){[arr[i],arr[z]]=[arr[z],arr[i]];draw();if(arr.slice(0,15).every((v,i)=>v===i+1))setTimeout(()=>alert("Solved!"),80)}}draw()}

  const renderers = {"game-snake":snake,"game-pong":pong,"game-breakout":breakout,"game-blocks":blocks,"game-space":space,"game-flappy":flappy,"game-mines":mines,"game-memory":memory,"game-2048":two048,"game-tictactoe":tictactoe,"game-simon":simon,"game-whack":whack,"game-maze":maze,"game-reaction":reaction,"game-guess":guess,"game-word":word,"game-slide":slide};
  NovaApps.register({ id: "games", name: "Games Hub", icon: "🎮", description: `${GAMES.length} retro and modern offline games`, render: hub });
  GAMES.forEach(([id, name, icon, description]) => NovaApps.register({ id, name, icon, description, render: renderers[id] }));
})();
