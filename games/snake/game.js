(function () {
  const root = document.getElementById("gameRoot");
  const CELL = 20, COLS = 20, ROWS = 20;
  const W = COLS * CELL, H = ROWS * CELL;
  let snake, dir, nextDir, food, score, gameOver, paused, interval, speed;

  const style = document.createElement("style");
  style.textContent = `
    .snake-wrapper{text-align:center;user-select:none}
    .snake-canvas{border:2px solid var(--border);border-radius:8px;background:#f0f4e8;touch-action:none;max-width:100%}
    .snake-status{font-size:1.1rem;font-weight:600;margin-bottom:12px;min-height:30px;color:var(--text)}
    .snake-mobile{display:none;margin-top:12px}
    .snake-dpad{display:inline-grid;grid-template-columns:60px 60px 60px;grid-template-rows:60px 60px 60px;gap:4px}
    .snake-dpad button{background:var(--bg-card);border:1px solid var(--border);border-radius:8px;font-size:1.4rem;cursor:pointer}
    .snake-dpad button:active{background:var(--primary-light)}
    @media(max-width:768px){.snake-mobile{display:block}}
    @media(max-width:480px){.snake-canvas{width:100%;height:auto}}
  `;
  document.head.appendChild(style);

  function init() {
    score = 0;
    speed = 120;
    snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
    dir = { x: 1, y: 0 };
    nextDir = { ...dir };
    gameOver = false;
    paused = false;
    placeFood();
    updateUI();
    root.innerHTML = `<div class="snake-wrapper">
      <div class="snake-status" id="snakeStatus">Use arrow keys to play</div>
      <canvas class="snake-canvas" id="snakeCanvas" width="${W}" height="${H}"></canvas>
      <div class="snake-mobile">
        <div class="snake-dpad">
          <div></div><button onclick="setDir(0,-1)">▲</button><div></div>
          <button onclick="setDir(-1,0)">◀</button><button onclick="setDir(0,0)"></button><button onclick="setDir(1,0)">▶</button>
          <div></div><button onclick="setDir(0,1)">▼</button><div></div>
        </div>
      </div>
    </div>`;
    setupTouch();
    startLoop();
    draw();
  }

  function placeFood() {
    do { food = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) }; }
    while (snake.some(s => s.x === food.x && s.y === food.y));
  }

  function startLoop() {
    if (interval) clearInterval(interval);
    interval = setInterval(tick, speed);
  }

  function tick() {
    if (paused || gameOver) return;
    dir = { ...nextDir };
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
    if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS || snake.some(s => s.x === head.x && s.y === head.y)) {
      gameOver = true;
      ScoreManager.saveScore("snake", score);
      updateUI();
      document.getElementById("snakeStatus").textContent = `Game Over! Score: ${score}`;
      draw();
      return;
    }
    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
      score += 10;
      ScoreManager.updateCurrentScore("snake", score);
      updateUI();
      placeFood();
      if (speed > 60) { speed -= 2; startLoop(); }
    } else {
      snake.pop();
    }
    draw();
  }

  function draw() {
    const canvas = document.getElementById("snakeCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#f0f4e8";
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = "#e8ecdf";
    for (let x = 0; x < COLS; x++)
      for (let y = 0; y < ROWS; y++)
        if ((x + y) % 2 === 0) ctx.fillRect(x * CELL, y * CELL, CELL, CELL);

    snake.forEach((s, i) => {
      ctx.fillStyle = i === 0 ? "#2d6a4f" : "#40916c";
      ctx.beginPath();
      ctx.roundRect(s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2, 4);
      ctx.fill();
    });

    ctx.fillStyle = "#e63946";
    ctx.beginPath();
    ctx.arc(food.x * CELL + CELL / 2, food.y * CELL + CELL / 2, CELL / 2 - 2, 0, Math.PI * 2);
    ctx.fill();

    if (gameOver) {
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#fff";
      ctx.font = "bold 24px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Game Over!", W / 2, H / 2 - 10);
      ctx.font = "16px sans-serif";
      ctx.fillText(`Score: ${score} — Press R to restart`, W / 2, H / 2 + 20);
    }
  }

  function updateUI() {
    document.getElementById("scoreDisplay").textContent = score;
    const s = ScoreManager.getScore("snake");
    document.getElementById("bestDisplay").textContent = s.best;
  }

  function setupTouch() {
    const canvas = document.getElementById("snakeCanvas");
    if (!canvas) return;
    let tx, ty;
    canvas.addEventListener("touchstart", e => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
    canvas.addEventListener("touchend", e => {
      const dx = e.changedTouches[0].clientX - tx;
      const dy = e.changedTouches[0].clientY - ty;
      if (Math.abs(dx) > Math.abs(dy)) { if (dx > 20 && dir.x !== -1) nextDir = { x: 1, y: 0 }; else if (dx < -20 && dir.x !== 1) nextDir = { x: -1, y: 0 }; }
      else { if (dy > 20 && dir.y !== -1) nextDir = { x: 0, y: 1 }; else if (dy < -20 && dir.y !== 1) nextDir = { x: 0, y: -1 }; }
    }, { passive: true });
  }

  document.addEventListener("keydown", e => {
    const k = e.key;
    if (k === "ArrowUp" || k === "w") { if (dir.y !== 1) nextDir = { x: 0, y: -1 }; e.preventDefault(); }
    else if (k === "ArrowDown" || k === "s") { if (dir.y !== -1) nextDir = { x: 0, y: 1 }; e.preventDefault(); }
    else if (k === "ArrowLeft" || k === "a") { if (dir.x !== 1) nextDir = { x: -1, y: 0 }; e.preventDefault(); }
    else if (k === "ArrowRight" || k === "d") { if (dir.x !== -1) nextDir = { x: 1, y: 0 }; e.preventDefault(); }
    else if (k === "r" || k === "R") { if (gameOver) init(); }
    else if (k === " ") { e.preventDefault(); togglePause(); }
  });

  window.setDir = function (x, y) {
    if (x === 0 && y === 0) return;
    if (x !== 0 && dir.x !== -x) nextDir = { x, y: 0 };
    if (y !== 0 && dir.y !== -y) nextDir = { x: 0, y };
  };
  window.restartGame = init;
  window.togglePause = function () {
    if (gameOver) return;
    paused = !paused;
    const st = document.getElementById("snakeStatus");
    if (st) st.textContent = paused ? "Paused — press Space to resume" : "";
  };
  window.toggleFullscreen = function () { document.body.classList.toggle("fullscreen-active"); };

  init();
})();
