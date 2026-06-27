(function () {
  const root = document.getElementById("gameRoot");
  let tiles, emptyIdx, moves, solved;

  const style = document.createElement("style");
  style.textContent = `
    .sp-wrapper{text-align:center;user-select:none}
    .sp-status{font-size:1.1rem;font-weight:600;margin-bottom:12px;min-height:28px;color:var(--text)}
    .sp-grid{display:inline-grid;grid-template-columns:repeat(4,1fr);gap:4px;background:var(--border);padding:6px;border-radius:10px}
    .sp-tile{width:76px;height:76px;border-radius:8px;font-size:1.5rem;font-weight:800;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s;background:var(--primary);color:#fff}
    .sp-tile:hover{transform:scale(1.03)}
    .sp-tile.empty{background:transparent;cursor:default;pointer-events:none}
    .sp-tile.correct{background:var(--success);color:#fff}
    .sp-tile.solved{animation:solvedBounce .4s ease}
    @keyframes solvedBounce{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}
    @media(max-width:480px){.sp-tile{width:64px;height:64px;font-size:1.2rem}}
  `;
  document.head.appendChild(style);

  function isSolvable(arr) {
    let inv = 0;
    const flat = arr.filter(v => v !== 0);
    for (let i = 0; i < flat.length; i++)
      for (let j = i + 1; j < flat.length; j++)
        if (flat[i] > flat[j]) inv++;
    const emptyRow = Math.floor(arr.indexOf(0) / 4);
    return (inv + emptyRow) % 2 === 1;
  }

  function shuffle() {
    do {
      tiles = Array.from({ length: 16 }, (_, i) => i);
      for (let i = 15; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
      }
    } while (!isSolvable(tiles) || isSolved());
    emptyIdx = tiles.indexOf(0);
  }

  function isSolved() {
    for (let i = 0; i < 15; i++) if (tiles[i] !== i + 1) return false;
    return tiles[15] === 0;
  }

  function init() {
    shuffle();
    moves = 0;
    solved = false;
    updateUI();
    render();
  }

  function canMove(idx) {
    const eR = Math.floor(emptyIdx / 4), eC = emptyIdx % 4;
    const tR = Math.floor(idx / 4), tC = idx % 4;
    return (Math.abs(eR - tR) + Math.abs(eC - tC)) === 1;
  }

  function moveTile(idx) {
    if (solved || !canMove(idx)) return;
    [tiles[emptyIdx], tiles[idx]] = [tiles[idx], tiles[emptyIdx]];
    emptyIdx = idx;
    moves++;
    updateUI();
    if (isSolved()) {
      solved = true;
      const s = Math.max(1, 500 - moves * 3);
      ScoreManager.saveScore("sliding-puzzle", s);
      updateUI();
    }
    render();
  }

  function render() {
    root.innerHTML = `<div class="sp-wrapper">
      <div class="sp-status">${solved ? "🎉 Puzzle Solved!" : "Slide tiles into order 1-15"}</div>
      <div class="sp-grid">${tiles.map((v, i) => {
        if (v === 0) return `<div class="sp-tile empty"></div>`;
        const correct = v === i + 1;
        return `<button class="sp-tile${correct ? " correct" : ""}${solved ? " solved" : ""}" data-i="${i}">${v}</button>`;
      }).join("")}</div></div>`;

    root.querySelectorAll(".sp-tile:not(.empty)").forEach(el => {
      el.addEventListener("click", () => moveTile(parseInt(el.dataset.i)));
    });
  }

  function updateUI() {
    document.getElementById("scoreDisplay").textContent = moves;
    const s = ScoreManager.getScore("sliding-puzzle");
    document.getElementById("bestDisplay").textContent = s.best || "—";
  }

  document.addEventListener("keydown", e => {
    if (solved) return;
    const eR = Math.floor(emptyIdx / 4), eC = emptyIdx % 4;
    let target = -1;
    if (e.key === "ArrowUp" && eR < 3) target = emptyIdx + 4;
    else if (e.key === "ArrowDown" && eR > 0) target = emptyIdx - 4;
    else if (e.key === "ArrowLeft" && eC < 3) target = emptyIdx + 1;
    else if (e.key === "ArrowRight" && eC > 0) target = emptyIdx - 1;
    if (target >= 0 && target < 16) { e.preventDefault(); moveTile(target); }
  });

  window.restartGame = init;
  window.toggleFullscreen = function () { document.body.classList.toggle("fullscreen-active"); };
  init();
})();
