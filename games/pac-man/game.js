(function () {
  const root = document.getElementById("gameRoot");
  const CELL = 24;
  const MAP = [
    "1111111111111111111",
    "1........1........1",
    "1.11.111.1.111.11.1",
    "1O11.111.1.111.11O1",
    "1.................1",
    "1.11.1.11111.1.11.1",
    "1....1...1...1....1",
    "1111.111.1.111.1111",
    "0001.1.......1.1000",
    "1111.1.11011.1.1111",
    "0000...10001...0000",
    "1111.1.11111.1.1111",
    "0001.1.......1.1000",
    "1111.1.11111.1.1111",
    "1........1........1",
    "1.11.111.1.111.11.1",
    "1O.1.....P.....1.O1",
    "11.1.1.11111.1.1.11",
    "1....1...1...1....1",
    "1.111111.1.111111.1",
    "1.................1",
    "1111111111111111111"
  ];
  const ROWS = MAP.length, COLS = MAP[0].length;
  const GHOST_COLORS = ["#EF4444", "#F472B6", "#06B6D4", "#F97316"];

  let grid, dots, totalDots, pacman, ghosts, score, lives, dir, nextDir, gameOver, paused, powerMode, powerTimer, loop;

  const style = document.createElement("style");
  style.textContent = `
    .pac-wrapper{text-align:center;user-select:none}
    .pac-canvas{border-radius:8px;background:#0f0f23;touch-action:none}
    .pac-status{font-size:1rem;font-weight:600;margin-bottom:8px;min-height:24px;color:var(--text)}
    .pac-mobile{display:none;margin-top:10px}
    .pac-dpad{display:inline-grid;grid-template-columns:54px 54px 54px;grid-template-rows:54px 54px 54px;gap:3px}
    .pac-dpad button{background:var(--bg-card);border:1px solid var(--border);border-radius:8px;font-size:1.2rem;cursor:pointer}
    .pac-dpad button:active{background:var(--primary-light)}
    @media(max-width:768px){.pac-mobile{display:block}}
  `;
  document.head.appendChild(style);

  function init() {
    grid = MAP.map(r => r.split(""));
    dots = 0; totalDots = 0;
    score = 0; lives = 3; gameOver = false; paused = false; powerMode = false;
    dir = { r: 0, c: -1 }; nextDir = { ...dir };
    if (powerTimer) clearTimeout(powerTimer);

    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++) {
        if (grid[r][c] === "." || grid[r][c] === "O") totalDots++;
        if (grid[r][c] === "P") { pacman = { r, c }; grid[r][c] = "."; totalDots++; }
      }

    ghosts = [
      { r: 10, c: 8, color: GHOST_COLORS[0], dir: { r: 0, c: 1 } },
      { r: 10, c: 9, color: GHOST_COLORS[1], dir: { r: -1, c: 0 } },
      { r: 10, c: 10, color: GHOST_COLORS[2], dir: { r: 0, c: -1 } },
      { r: 8, c: 9, color: GHOST_COLORS[3], dir: { r: 1, c: 0 } }
    ];
    updateUI();
    render();
    startLoop();
  }

  function startLoop() {
    if (loop) clearInterval(loop);
    loop = setInterval(tick, 180);
  }

  function tick() {
    if (paused || gameOver) return;
    movePacman();
    moveGhosts();
    checkCollisions();
    draw();
  }

  function isWall(r, c) {
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return true;
    return grid[r][c] === "1";
  }

  function movePacman() {
    let nr = pacman.r + nextDir.r, nc = pacman.c + nextDir.c;
    if (!isWall(nr, nc)) { dir = { ...nextDir }; }
    nr = pacman.r + dir.r;
    nc = pacman.c + dir.c;
    if (nc < 0) nc = COLS - 1;
    if (nc >= COLS) nc = 0;
    if (!isWall(nr, nc)) {
      pacman.r = nr;
      pacman.c = nc;
      if (grid[nr][nc] === ".") { grid[nr][nc] = " "; dots++; score += 10; }
      else if (grid[nr][nc] === "O") {
        grid[nr][nc] = " "; dots++; score += 50;
        powerMode = true;
        if (powerTimer) clearTimeout(powerTimer);
        powerTimer = setTimeout(() => { powerMode = false; }, 5000);
      }
      ScoreManager.updateCurrentScore("pac-man", score);
      updateUI();
      if (dots >= totalDots) {
        gameOver = true;
        clearInterval(loop);
        score += 500;
        ScoreManager.saveScore("pac-man", score);
        updateUI();
      }
    }
  }

  function moveGhosts() {
    ghosts.forEach(g => {
      const dirs = [{ r: 0, c: 1 }, { r: 0, c: -1 }, { r: 1, c: 0 }, { r: -1, c: 0 }];
      const valid = dirs.filter(d => {
        if (d.r === -g.dir.r && d.c === -g.dir.c) return false;
        return !isWall(g.r + d.r, g.c + d.c);
      });
      if (valid.length) {
        if (Math.random() < 0.4) {
          valid.sort((a, b) => {
            const da = Math.abs(pacman.r - (g.r + a.r)) + Math.abs(pacman.c - (g.c + a.c));
            const db = Math.abs(pacman.r - (g.r + b.r)) + Math.abs(pacman.c - (g.c + b.c));
            return powerMode ? db - da : da - db;
          });
        }
        g.dir = valid[0];
      }
      const nr = g.r + g.dir.r, nc = g.c + g.dir.c;
      if (!isWall(nr, nc)) { g.r = nr; g.c = nc; }
    });
  }

  function checkCollisions() {
    ghosts.forEach((g, i) => {
      if (g.r === pacman.r && g.c === pacman.c) {
        if (powerMode) {
          score += 200;
          g.r = 10; g.c = 9;
          updateUI();
        } else {
          lives--;
          document.getElementById("livesDisplay").textContent = lives;
          if (lives <= 0) {
            gameOver = true;
            clearInterval(loop);
            ScoreManager.saveScore("pac-man", score);
            updateUI();
          } else {
            pacman = { r: 16, c: 9 };
            dir = { r: 0, c: -1 }; nextDir = { ...dir };
          }
        }
      }
    });
  }

  function draw() {
    const canvas = document.getElementById("pacCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#0f0f23";
    ctx.fillRect(0, 0, COLS * CELL, ROWS * CELL);

    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++) {
        const ch = grid[r][c];
        if (ch === "1") {
          ctx.fillStyle = "#1e3a5f";
          ctx.fillRect(c * CELL, r * CELL, CELL, CELL);
          ctx.strokeStyle = "#3b82f6";
          ctx.lineWidth = 1;
          ctx.strokeRect(c * CELL + 0.5, r * CELL + 0.5, CELL - 1, CELL - 1);
        } else if (ch === ".") {
          ctx.fillStyle = "#fde68a";
          ctx.beginPath();
          ctx.arc(c * CELL + CELL / 2, r * CELL + CELL / 2, 2.5, 0, Math.PI * 2);
          ctx.fill();
        } else if (ch === "O") {
          ctx.fillStyle = "#fde68a";
          ctx.beginPath();
          ctx.arc(c * CELL + CELL / 2, r * CELL + CELL / 2, 6, 0, Math.PI * 2);
          ctx.fill();
        }
      }

    const mouthAngle = 0.25 * Math.PI * (1 + Math.sin(Date.now() / 100));
    const angle = dir.c === 1 ? 0 : dir.c === -1 ? Math.PI : dir.r === 1 ? Math.PI / 2 : -Math.PI / 2;
    ctx.fillStyle = "#FACC15";
    ctx.beginPath();
    ctx.arc(pacman.c * CELL + CELL / 2, pacman.r * CELL + CELL / 2, CELL / 2 - 2, angle + mouthAngle / 2, angle + Math.PI * 2 - mouthAngle / 2);
    ctx.lineTo(pacman.c * CELL + CELL / 2, pacman.r * CELL + CELL / 2);
    ctx.fill();

    ghosts.forEach(g => {
      ctx.fillStyle = powerMode ? "#3B82F6" : g.color;
      ctx.beginPath();
      const gx = g.c * CELL + CELL / 2, gy = g.r * CELL + CELL / 2, gr = CELL / 2 - 2;
      ctx.arc(gx, gy - 2, gr, Math.PI, 0);
      ctx.lineTo(gx + gr, gy + gr);
      for (let i = 0; i < 3; i++) {
        const w = (gr * 2) / 3;
        ctx.lineTo(gx + gr - w * i - w / 2, gy + gr - 4);
        ctx.lineTo(gx + gr - w * (i + 1), gy + gr);
      }
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.beginPath(); ctx.arc(gx - 3, gy - 4, 3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(gx + 3, gy - 4, 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = powerMode ? "#fff" : "#111";
      ctx.beginPath(); ctx.arc(gx - 3, gy - 3, 1.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(gx + 3, gy - 3, 1.5, 0, Math.PI * 2); ctx.fill();
    });

    if (gameOver) {
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(0, 0, COLS * CELL, ROWS * CELL);
      ctx.fillStyle = "#fff";
      ctx.font = "bold 20px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(dots >= totalDots ? "Level Complete!" : "Game Over!", (COLS * CELL) / 2, (ROWS * CELL) / 2);
    }
  }

  function render() {
    root.innerHTML = `<div class="pac-wrapper">
      <div class="pac-status" id="pacStatus">${gameOver ? (dots >= totalDots ? "🎉 Level Complete!" : "Game Over!") : "Arrow keys or WASD to move"}</div>
      <canvas class="pac-canvas" id="pacCanvas" width="${COLS * CELL}" height="${ROWS * CELL}"></canvas>
      <div class="pac-mobile"><div class="pac-dpad">
        <div></div><button onclick="pacDir(-1,0)">▲</button><div></div>
        <button onclick="pacDir(0,-1)">◀</button><div></div><button onclick="pacDir(0,1)">▶</button>
        <div></div><button onclick="pacDir(1,0)">▼</button><div></div>
      </div></div>
    </div>`;
    draw();
  }

  function updateUI() {
    document.getElementById("scoreDisplay").textContent = score;
    document.getElementById("livesDisplay").textContent = lives;
    const s = ScoreManager.getScore("pac-man");
    document.getElementById("bestDisplay").textContent = s.best;
  }

  document.addEventListener("keydown", e => {
    if (e.key === "ArrowUp" || e.key === "w") { e.preventDefault(); nextDir = { r: -1, c: 0 }; }
    else if (e.key === "ArrowDown" || e.key === "s") { e.preventDefault(); nextDir = { r: 1, c: 0 }; }
    else if (e.key === "ArrowLeft" || e.key === "a") { e.preventDefault(); nextDir = { r: 0, c: -1 }; }
    else if (e.key === "ArrowRight" || e.key === "d") { e.preventDefault(); nextDir = { r: 0, c: 1 }; }
  });

  window.pacDir = function (r, c) { nextDir = { r, c }; };
  window.restartGame = function () { clearInterval(loop); if (powerTimer) clearTimeout(powerTimer); init(); };
  window.togglePause = function () { if (!gameOver) paused = !paused; };
  window.toggleFullscreen = function () { document.body.classList.toggle("fullscreen-active"); };
  init();
})();
