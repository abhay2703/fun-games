(function () {
  const root = document.getElementById("gameRoot");
  let grid, score, won, over;

  const COLORS = {
    0: "#cdc1b4", 2: "#eee4da", 4: "#ede0c8", 8: "#f2b179", 16: "#f59563",
    32: "#f67c5f", 64: "#f65e3b", 128: "#edcf72", 256: "#edcc61",
    512: "#edc850", 1024: "#edc53f", 2048: "#edc22e"
  };
  const TEXT_COLORS = { 0: "transparent", 2: "#776e65", 4: "#776e65" };

  const style = document.createElement("style");
  style.textContent = `
    .g2048-wrapper{text-align:center;user-select:none}
    .g2048-status{font-size:1.1rem;font-weight:600;margin-bottom:12px;min-height:28px;color:var(--text)}
    .g2048-board{display:inline-grid;grid-template-columns:repeat(4,1fr);gap:8px;background:#bbada0;padding:8px;border-radius:8px}
    .g2048-tile{width:72px;height:72px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:1.6rem;transition:all .1s}
    @media(max-width:480px){.g2048-tile{width:64px;height:64px;font-size:1.2rem}.g2048-board{gap:6px;padding:6px}}
  `;
  document.head.appendChild(style);

  function init() {
    grid = Array.from({ length: 4 }, () => Array(4).fill(0));
    score = 0; won = false; over = false;
    addRandom(); addRandom();
    updateUI(); render();
  }

  function addRandom() {
    const empty = [];
    grid.forEach((r, ri) => r.forEach((v, ci) => { if (!v) empty.push([ri, ci]); }));
    if (!empty.length) return;
    const [r, c] = empty[Math.floor(Math.random() * empty.length)];
    grid[r][c] = Math.random() < 0.9 ? 2 : 4;
  }

  function slide(row) {
    let arr = row.filter(v => v);
    let merged = [];
    for (let i = 0; i < arr.length; i++) {
      if (i + 1 < arr.length && arr[i] === arr[i + 1]) {
        merged.push(arr[i] * 2);
        score += arr[i] * 2;
        if (arr[i] * 2 === 2048) won = true;
        i++;
      } else merged.push(arr[i]);
    }
    while (merged.length < 4) merged.push(0);
    return merged;
  }

  function move(dir) {
    if (over) return;
    const prev = JSON.stringify(grid);
    if (dir === "left") grid = grid.map(r => slide(r));
    else if (dir === "right") grid = grid.map(r => slide([...r].reverse()).reverse());
    else if (dir === "up") { transpose(); grid = grid.map(r => slide(r)); transpose(); }
    else if (dir === "down") { transpose(); grid = grid.map(r => slide([...r].reverse()).reverse()); transpose(); }

    if (JSON.stringify(grid) !== prev) {
      addRandom();
      ScoreManager.updateCurrentScore("2048", score);
      if (!canMove()) { over = true; ScoreManager.saveScore("2048", score); }
      updateUI(); render();
    }
  }

  function transpose() {
    grid = grid[0].map((_, i) => grid.map(r => r[i]));
  }

  function canMove() {
    for (let r = 0; r < 4; r++)
      for (let c = 0; c < 4; c++) {
        if (!grid[r][c]) return true;
        if (c < 3 && grid[r][c] === grid[r][c + 1]) return true;
        if (r < 3 && grid[r][c] === grid[r + 1][c]) return true;
      }
    return false;
  }

  function render() {
    const status = over ? "Game Over!" : won ? "You reached 2048! Keep going!" : "Use arrow keys or swipe";
    root.innerHTML = `<div class="g2048-wrapper">
      <div class="g2048-status" id="g2048Status">${status}</div>
      <div class="g2048-board">${grid.flat().map(v => {
        const bg = COLORS[v] || "#3c3a32";
        const tc = TEXT_COLORS[v] || "#f9f6f2";
        const fs = v >= 1024 ? "1.1rem" : v >= 128 ? "1.3rem" : "1.6rem";
        return `<div class="g2048-tile" style="background:${bg};color:${tc};font-size:${fs}">${v || ""}</div>`;
      }).join("")}</div></div>`;
  }

  function updateUI() {
    document.getElementById("scoreDisplay").textContent = score;
    const s = ScoreManager.getScore("2048");
    document.getElementById("bestDisplay").textContent = s.best;
  }

  document.addEventListener("keydown", e => {
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
      e.preventDefault();
      move(e.key.replace("Arrow", "").toLowerCase());
    }
  });

  let tx, ty;
  document.addEventListener("touchstart", e => {
    if (!e.target.closest(".g2048-wrapper")) return;
    tx = e.touches[0].clientX; ty = e.touches[0].clientY;
  }, { passive: true });
  document.addEventListener("touchend", e => {
    if (tx === undefined) return;
    const dx = e.changedTouches[0].clientX - tx;
    const dy = e.changedTouches[0].clientY - ty;
    tx = undefined;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 30) return;
    if (Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? "right" : "left");
    else move(dy > 0 ? "down" : "up");
  }, { passive: true });

  window.restartGame = init;
  window.toggleFullscreen = function () { document.body.classList.toggle("fullscreen-active"); };
  init();
})();
