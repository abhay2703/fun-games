(function () {
  const root = document.getElementById("gameRoot");
  const COLS = 10, ROWS = 20, CELL = 28;
  const PIECES = [
    { shape: [[1,1,1,1]], color: "#06B6D4" },
    { shape: [[1,1],[1,1]], color: "#F59E0B" },
    { shape: [[0,1,0],[1,1,1]], color: "#8B5CF6" },
    { shape: [[1,0,0],[1,1,1]], color: "#3B82F6" },
    { shape: [[0,0,1],[1,1,1]], color: "#F97316" },
    { shape: [[0,1,1],[1,1,0]], color: "#22C55E" },
    { shape: [[1,1,0],[0,1,1]], color: "#EF4444" }
  ];
  let board, current, currentPos, score, lines, gameOver, paused, interval, speed, nextPiece;

  const style = document.createElement("style");
  style.textContent = `
    .tetris-wrapper{display:flex;gap:20px;align-items:flex-start;justify-content:center;user-select:none;flex-wrap:wrap}
    .tetris-canvas{border:2px solid var(--border);border-radius:8px;background:#1a1a2e}
    .tetris-side{display:flex;flex-direction:column;gap:12px;min-width:100px}
    .tetris-next{background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-sm);padding:12px;text-align:center}
    .tetris-next h4{font-size:.8rem;color:var(--text-muted);margin-bottom:8px}
    .tetris-next canvas{display:block;margin:0 auto}
    .tetris-mobile{display:none;width:100%;text-align:center;margin-top:8px}
    .tetris-controls{display:inline-grid;grid-template-columns:60px 60px 60px;grid-template-rows:50px 50px;gap:4px}
    .tetris-controls button{background:var(--bg-card);border:1px solid var(--border);border-radius:8px;font-size:1.2rem;cursor:pointer}
    .tetris-controls button:active{background:var(--primary-light)}
    @media(max-width:768px){.tetris-mobile{display:block}}
  `;
  document.head.appendChild(style);

  function init() {
    board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    score = 0; lines = 0; gameOver = false; paused = false;
    speed = 500;
    nextPiece = randomPiece();
    spawnPiece();
    updateUI();
    render();
    startLoop();
  }

  function randomPiece() {
    const p = PIECES[Math.floor(Math.random() * PIECES.length)];
    return { shape: p.shape.map(r => [...r]), color: p.color };
  }

  function spawnPiece() {
    current = nextPiece;
    nextPiece = randomPiece();
    currentPos = { r: 0, c: Math.floor((COLS - current.shape[0].length) / 2) };
    if (!canPlace(current.shape, currentPos.r, currentPos.c)) {
      gameOver = true;
      clearInterval(interval);
      ScoreManager.saveScore("tetris", score);
      updateUI();
    }
    drawNext();
  }

  function rotate(shape) {
    const rows = shape.length, cols = shape[0].length;
    const rotated = Array.from({ length: cols }, () => Array(rows).fill(0));
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++)
        rotated[c][rows - 1 - r] = shape[r][c];
    return rotated;
  }

  function canPlace(shape, row, col) {
    for (let r = 0; r < shape.length; r++)
      for (let c = 0; c < shape[r].length; c++)
        if (shape[r][c]) {
          const nr = row + r, nc = col + c;
          if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) return false;
          if (board[nr][nc]) return false;
        }
    return true;
  }

  function lock() {
    for (let r = 0; r < current.shape.length; r++)
      for (let c = 0; c < current.shape[r].length; c++)
        if (current.shape[r][c]) board[currentPos.r + r][currentPos.c + c] = current.color;
    clearLines();
    spawnPiece();
  }

  function clearLines() {
    let cleared = 0;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (board[r].every(c => c)) {
        board.splice(r, 1);
        board.unshift(Array(COLS).fill(null));
        cleared++;
        r++;
      }
    }
    if (cleared) {
      const pts = [0, 100, 300, 500, 800][cleared] || 800;
      score += pts;
      lines += cleared;
      speed = Math.max(100, 500 - lines * 15);
      ScoreManager.updateCurrentScore("tetris", score);
      updateUI();
      startLoop();
    }
  }

  function tick() {
    if (paused || gameOver) return;
    if (canPlace(current.shape, currentPos.r + 1, currentPos.c)) {
      currentPos.r++;
    } else {
      lock();
    }
    draw();
  }

  function moveLeft() { if (!gameOver && !paused && canPlace(current.shape, currentPos.r, currentPos.c - 1)) { currentPos.c--; draw(); } }
  function moveRight() { if (!gameOver && !paused && canPlace(current.shape, currentPos.r, currentPos.c + 1)) { currentPos.c++; draw(); } }
  function moveDown() { if (!gameOver && !paused && canPlace(current.shape, currentPos.r + 1, currentPos.c)) { currentPos.r++; score++; draw(); } }
  function rotatePiece() {
    if (gameOver || paused) return;
    const rotated = rotate(current.shape);
    let newC = currentPos.c;
    if (!canPlace(rotated, currentPos.r, newC)) {
      if (canPlace(rotated, currentPos.r, newC - 1)) newC--;
      else if (canPlace(rotated, currentPos.r, newC + 1)) newC++;
      else if (canPlace(rotated, currentPos.r, newC - 2)) newC -= 2;
      else if (canPlace(rotated, currentPos.r, newC + 2)) newC += 2;
      else return;
    }
    current.shape = rotated;
    currentPos.c = newC;
    draw();
  }
  function hardDrop() {
    if (gameOver || paused) return;
    while (canPlace(current.shape, currentPos.r + 1, currentPos.c)) { currentPos.r++; score += 2; }
    lock();
    updateUI();
    draw();
  }

  function startLoop() {
    if (interval) clearInterval(interval);
    interval = setInterval(tick, speed);
  }

  function draw() {
    const canvas = document.getElementById("tetrisCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, COLS * CELL, ROWS * CELL);

    for (let c = 0; c < COLS; c++) {
      ctx.strokeStyle = "rgba(255,255,255,0.03)";
      ctx.beginPath(); ctx.moveTo(c * CELL, 0); ctx.lineTo(c * CELL, ROWS * CELL); ctx.stroke();
    }

    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++)
        if (board[r][c]) drawBlock(ctx, c, r, board[r][c]);

    if (current && !gameOver) {
      let ghostR = currentPos.r;
      while (canPlace(current.shape, ghostR + 1, currentPos.c)) ghostR++;
      for (let r = 0; r < current.shape.length; r++)
        for (let c = 0; c < current.shape[r].length; c++)
          if (current.shape[r][c]) {
            ctx.strokeStyle = current.color;
            ctx.globalAlpha = 0.3;
            ctx.strokeRect((currentPos.c + c) * CELL + 1, (ghostR + r) * CELL + 1, CELL - 2, CELL - 2);
            ctx.globalAlpha = 1;
          }

      for (let r = 0; r < current.shape.length; r++)
        for (let c = 0; c < current.shape[r].length; c++)
          if (current.shape[r][c]) drawBlock(ctx, currentPos.c + c, currentPos.r + r, current.color);
    }

    if (gameOver) {
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(0, 0, COLS * CELL, ROWS * CELL);
      ctx.fillStyle = "#fff";
      ctx.font = "bold 22px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Game Over!", (COLS * CELL) / 2, (ROWS * CELL) / 2 - 10);
      ctx.font = "14px sans-serif";
      ctx.fillText(`Score: ${score} — Lines: ${lines}`, (COLS * CELL) / 2, (ROWS * CELL) / 2 + 16);
    }
  }

  function drawBlock(ctx, x, y, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x * CELL + 1, y * CELL + 1, CELL - 2, CELL - 2, 3);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    ctx.fillRect(x * CELL + 2, y * CELL + 2, CELL - 4, 3);
  }

  function drawNext() {
    const canvas = document.getElementById("nextCanvas");
    if (!canvas || !nextPiece) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, 100, 80);
    const s = nextPiece.shape;
    const ox = (100 - s[0].length * 20) / 2, oy = (80 - s.length * 20) / 2;
    for (let r = 0; r < s.length; r++)
      for (let c = 0; c < s[r].length; c++)
        if (s[r][c]) {
          ctx.fillStyle = nextPiece.color;
          ctx.beginPath();
          ctx.roundRect(ox + c * 20, oy + r * 20, 18, 18, 3);
          ctx.fill();
        }
  }

  function render() {
    root.innerHTML = `<div class="tetris-wrapper">
      <canvas class="tetris-canvas" id="tetrisCanvas" width="${COLS * CELL}" height="${ROWS * CELL}"></canvas>
      <div class="tetris-side">
        <div class="tetris-next"><h4>NEXT</h4><canvas id="nextCanvas" width="100" height="80"></canvas></div>
      </div>
      <div class="tetris-mobile">
        <div class="tetris-controls">
          <button onclick="rotatePiece()">↻</button>
          <button onclick="hardDrop()">⤓</button>
          <div></div>
          <button onclick="moveLeft()">◀</button>
          <button onclick="moveDown()">▼</button>
          <button onclick="moveRight()">▶</button>
        </div>
      </div>
    </div>`;
    draw();
    drawNext();
  }

  function updateUI() {
    document.getElementById("scoreDisplay").textContent = score;
    document.getElementById("linesDisplay").textContent = lines;
    const s = ScoreManager.getScore("tetris");
    document.getElementById("bestDisplay").textContent = s.best;
  }

  document.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft") { e.preventDefault(); moveLeft(); }
    else if (e.key === "ArrowRight") { e.preventDefault(); moveRight(); }
    else if (e.key === "ArrowDown") { e.preventDefault(); moveDown(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); rotatePiece(); }
    else if (e.key === " ") { e.preventDefault(); hardDrop(); }
  });

  window.restartGame = function () { clearInterval(interval); init(); };
  window.moveLeft = moveLeft; window.moveRight = moveRight;
  window.moveDown = moveDown; window.rotatePiece = rotatePiece;
  window.hardDrop = hardDrop;
  window.togglePause = function () {
    if (gameOver) return;
    paused = !paused;
  };
  window.toggleFullscreen = function () { document.body.classList.toggle("fullscreen-active"); };
  init();
})();
