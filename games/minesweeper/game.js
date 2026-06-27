(function () {
  const root = document.getElementById("gameRoot");
  const ROWS = 9, COLS = 9, MINES = 10;
  let board, revealed, flagged, gameOver, won, firstClick, flagMode, timer, seconds;

  const NUM_COLORS = ["", "#2563EB", "#059669", "#DC2626", "#7C3AED", "#D97706", "#0D9488", "#1A1D2E", "#6B7280"];

  const style = document.createElement("style");
  style.textContent = `
    .ms-wrapper{text-align:center;user-select:none}
    .ms-status{font-size:1.1rem;font-weight:600;margin-bottom:12px;min-height:28px;color:var(--text)}
    .ms-grid{display:inline-grid;grid-template-columns:repeat(${COLS},1fr);gap:2px;background:var(--border);padding:4px;border-radius:8px}
    .ms-cell{width:36px;height:36px;border:none;border-radius:4px;font-size:.9rem;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .1s}
    .ms-cell.hidden{background:#c8d6e5}
    .ms-cell.hidden:hover{background:#b8c9df}
    .ms-cell.revealed{background:var(--bg-card);cursor:default}
    .ms-cell.mine{background:#FEE2E2}
    .ms-cell.flagged{background:#FEF3C7}
    .ms-cell.exploded{background:#EF4444;color:#fff}
    @media(max-width:480px){.ms-cell{width:32px;height:32px;font-size:.8rem}}
  `;
  document.head.appendChild(style);

  function init() {
    board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    revealed = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
    flagged = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
    gameOver = false; won = false; firstClick = true; flagMode = false;
    seconds = 0;
    if (timer) clearInterval(timer);
    document.getElementById("timeDisplay").textContent = "0";
    document.getElementById("minesDisplay").textContent = MINES;
    updateFlagBtn();
    render();
  }

  function placeMines(safeR, safeC) {
    let placed = 0;
    while (placed < MINES) {
      const r = Math.floor(Math.random() * ROWS);
      const c = Math.floor(Math.random() * COLS);
      if (board[r][c] === -1) continue;
      if (Math.abs(r - safeR) <= 1 && Math.abs(c - safeC) <= 1) continue;
      board[r][c] = -1;
      placed++;
    }
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++)
        if (board[r][c] !== -1) board[r][c] = countAdj(r, c);
  }

  function countAdj(r, c) {
    let count = 0;
    for (let dr = -1; dr <= 1; dr++)
      for (let dc = -1; dc <= 1; dc++) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board[nr][nc] === -1) count++;
      }
    return count;
  }

  function reveal(r, c) {
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS || revealed[r][c] || flagged[r][c]) return;
    revealed[r][c] = true;
    if (board[r][c] === 0) {
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++) reveal(r + dr, c + dc);
    }
  }

  function cellClick(r, c) {
    if (gameOver) return;
    if (flagMode) { toggleFlag(r, c); return; }
    if (flagged[r][c] || revealed[r][c]) return;
    if (firstClick) {
      firstClick = false;
      placeMines(r, c);
      timer = setInterval(() => {
        seconds++;
        document.getElementById("timeDisplay").textContent = seconds;
      }, 1000);
    }
    if (board[r][c] === -1) {
      gameOver = true;
      revealed[r][c] = true;
      clearInterval(timer);
      revealAll();
      render();
      document.querySelector(`[data-r="${r}"][data-c="${c}"]`).classList.add("exploded");
      document.getElementById("ms-status").textContent = "💥 Game Over!";
      return;
    }
    reveal(r, c);
    checkWin();
    render();
  }

  function toggleFlag(r, c) {
    if (revealed[r][c] || gameOver) return;
    flagged[r][c] = !flagged[r][c];
    const flagCount = flagged.flat().filter(Boolean).length;
    document.getElementById("minesDisplay").textContent = MINES - flagCount;
    render();
  }

  function cellRightClick(e, r, c) {
    e.preventDefault();
    toggleFlag(r, c);
  }

  function revealAll() {
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++) revealed[r][c] = true;
  }

  function checkWin() {
    let safeRevealed = 0;
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++)
        if (revealed[r][c] && board[r][c] !== -1) safeRevealed++;
    if (safeRevealed === ROWS * COLS - MINES) {
      won = true; gameOver = true;
      clearInterval(timer);
      const s = Math.max(1, 500 - seconds * 2);
      ScoreManager.saveScore("minesweeper", s);
      render();
    }
  }

  function render() {
    let cells = "";
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++) {
        let cls = "ms-cell", content = "";
        if (!revealed[r][c]) {
          cls += " hidden";
          if (flagged[r][c]) { cls += " flagged"; content = "🚩"; }
        } else {
          cls += " revealed";
          if (board[r][c] === -1) { cls += " mine"; content = "💣"; }
          else if (board[r][c] > 0) content = `<span style="color:${NUM_COLORS[board[r][c]]}">${board[r][c]}</span>`;
        }
        cells += `<button class="${cls}" data-r="${r}" data-c="${c}">${content}</button>`;
      }
    const status = won ? "🎉 You Win!" : gameOver ? "💥 Game Over!" : "Left-click to reveal, right-click to flag";
    root.innerHTML = `<div class="ms-wrapper">
      <div class="ms-status" id="ms-status">${status}</div>
      <div class="ms-grid">${cells}</div></div>`;

    root.querySelectorAll(".ms-cell.hidden").forEach(el => {
      const r = parseInt(el.dataset.r), c = parseInt(el.dataset.c);
      el.addEventListener("click", () => cellClick(r, c));
      el.addEventListener("contextmenu", (e) => cellRightClick(e, r, c));
    });
  }

  function updateFlagBtn() {
    const btn = document.getElementById("flagToggle");
    if (btn) btn.classList.toggle("active", flagMode);
  }

  window.restartGame = init;
  window.toggleFlagMode = function () {
    flagMode = !flagMode;
    updateFlagBtn();
  };
  window.toggleFullscreen = function () { document.body.classList.toggle("fullscreen-active"); };
  init();
})();
