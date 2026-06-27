(function () {
  const root = document.getElementById("gameRoot");
  const SIZE = 11;
  const CELL = 22;
  let maze, playerPos, endPos, steps, won;

  const style = document.createElement("style");
  style.textContent = `
    .maze-wrapper{text-align:center;user-select:none}
    .maze-status{font-size:1.1rem;font-weight:600;margin-bottom:12px;min-height:28px;color:var(--text)}
    .maze-canvas{border:2px solid var(--border);border-radius:8px;background:#fff;touch-action:none}
    .maze-mobile{display:none;margin-top:12px}
    .maze-dpad{display:inline-grid;grid-template-columns:56px 56px 56px;grid-template-rows:56px 56px 56px;gap:4px}
    .maze-dpad button{background:var(--bg-card);border:1px solid var(--border);border-radius:8px;font-size:1.3rem;cursor:pointer}
    .maze-dpad button:active{background:var(--primary-light)}
    @media(max-width:768px){.maze-mobile{display:block}}
  `;
  document.head.appendChild(style);

  function generate() {
    const cols = SIZE, rows = SIZE;
    const walls = Array.from({ length: rows * 2 + 1 }, (_, r) =>
      Array.from({ length: cols * 2 + 1 }, (_, c) => (r % 2 === 0 || c % 2 === 0) ? 1 : 0)
    );
    const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
    const stack = [[0, 0]];
    visited[0][0] = true;

    while (stack.length) {
      const [cr, cc] = stack[stack.length - 1];
      const neighbors = [];
      [[cr-1,cc],[cr+1,cc],[cr,cc-1],[cr,cc+1]].forEach(([nr,nc]) => {
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !visited[nr][nc]) neighbors.push([nr,nc]);
      });
      if (neighbors.length) {
        const [nr, nc] = neighbors[Math.floor(Math.random() * neighbors.length)];
        walls[cr + nr + 1][cc + nc + 1] = 0;
        visited[nr][nc] = true;
        stack.push([nr, nc]);
      } else {
        stack.pop();
      }
    }
    return walls;
  }

  function init() {
    maze = generate();
    playerPos = { r: 1, c: 1 };
    endPos = { r: SIZE * 2 - 1, c: SIZE * 2 - 1 };
    steps = 0;
    won = false;
    updateUI();
    render();
    draw();
  }

  function movePlayer(dr, dc) {
    if (won) return;
    const nr = playerPos.r + dr, nc = playerPos.c + dc;
    if (nr < 0 || nr >= maze.length || nc < 0 || nc >= maze[0].length) return;
    if (maze[nr][nc] === 1) return;
    playerPos = { r: nr, c: nc };
    steps++;
    updateUI();
    if (nr === endPos.r && nc === endPos.c) {
      won = true;
      const s = Math.max(1, 300 - steps);
      ScoreManager.saveScore("maze", s);
      updateUI();
    }
    draw();
  }

  function draw() {
    const canvas = document.getElementById("mazeCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = maze[0].length, h = maze.length;

    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, w * CELL, h * CELL);

    for (let r = 0; r < h; r++)
      for (let c = 0; c < w; c++) {
        if (maze[r][c] === 1) {
          ctx.fillStyle = "#334155";
          ctx.fillRect(c * CELL, r * CELL, CELL, CELL);
        }
      }

    ctx.fillStyle = "#22C55E";
    ctx.beginPath();
    ctx.roundRect(1 * CELL + 2, 1 * CELL + 2, CELL - 4, CELL - 4, 4);
    ctx.fill();

    ctx.fillStyle = "#EF4444";
    ctx.beginPath();
    ctx.roundRect(endPos.c * CELL + 2, endPos.r * CELL + 2, CELL - 4, CELL - 4, 4);
    ctx.fill();

    ctx.fillStyle = "#4A7CFF";
    ctx.beginPath();
    ctx.arc(playerPos.c * CELL + CELL / 2, playerPos.r * CELL + CELL / 2, CELL / 2 - 3, 0, Math.PI * 2);
    ctx.fill();

    if (won) {
      ctx.fillStyle = "rgba(34,197,94,0.3)";
      ctx.fillRect(0, 0, w * CELL, h * CELL);
      ctx.fillStyle = "#065f46";
      ctx.font = "bold 24px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Maze Complete!", (w * CELL) / 2, (h * CELL) / 2);
    }
  }

  function render() {
    const w = maze[0].length * CELL, h = maze.length * CELL;
    root.innerHTML = `<div class="maze-wrapper">
      <div class="maze-status">${won ? "🎉 You found the exit!" : "Navigate from green to red"}</div>
      <canvas class="maze-canvas" id="mazeCanvas" width="${w}" height="${h}"></canvas>
      <div class="maze-mobile">
        <div class="maze-dpad">
          <div></div><button onclick="mazeMove(-1,0)">▲</button><div></div>
          <button onclick="mazeMove(0,-1)">◀</button><div></div><button onclick="mazeMove(0,1)">▶</button>
          <div></div><button onclick="mazeMove(1,0)">▼</button><div></div>
        </div>
      </div>
    </div>`;
  }

  function updateUI() {
    document.getElementById("scoreDisplay").textContent = steps;
    const s = ScoreManager.getScore("maze");
    document.getElementById("bestDisplay").textContent = s.best || "—";
  }

  document.addEventListener("keydown", e => {
    if (e.key === "ArrowUp" || e.key === "w") { e.preventDefault(); movePlayer(-1, 0); }
    else if (e.key === "ArrowDown" || e.key === "s") { e.preventDefault(); movePlayer(1, 0); }
    else if (e.key === "ArrowLeft" || e.key === "a") { e.preventDefault(); movePlayer(0, -1); }
    else if (e.key === "ArrowRight" || e.key === "d") { e.preventDefault(); movePlayer(0, 1); }
  });

  let tx, ty;
  document.addEventListener("touchstart", e => {
    if (!e.target.closest(".maze-wrapper")) return;
    tx = e.touches[0].clientX; ty = e.touches[0].clientY;
  }, { passive: true });
  document.addEventListener("touchend", e => {
    if (tx === undefined) return;
    const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
    tx = undefined;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return;
    if (Math.abs(dx) > Math.abs(dy)) movePlayer(0, dx > 0 ? 1 : -1);
    else movePlayer(dy > 0 ? 1 : -1, 0);
  }, { passive: true });

  window.mazeMove = function (dr, dc) { movePlayer(dr, dc); };
  window.restartGame = init;
  window.toggleFullscreen = function () { document.body.classList.toggle("fullscreen-active"); };
  init();
})();
