(function () {
  const root = document.getElementById("gameRoot");
  const GRID_SIZE = 10;
  const WORD_LISTS = [
    ["APPLE","GRAPE","MANGO","PEACH","LEMON","BERRY"],
    ["EARTH","OCEAN","RIVER","CLOUD","STORM","FLORA"],
    ["CHESS","MUSIC","DANCE","PAINT","CRAFT","SPORT"],
    ["TIGER","EAGLE","WHALE","HORSE","PANDA","SHARK"],
    ["SPACE","COMET","ORBIT","LUNAR","SOLAR","ATLAS"]
  ];
  const DIRS = [[0,1],[1,0],[1,1],[0,-1],[-1,0],[-1,-1],[1,-1],[-1,1]];
  let grid, words, found, selected, placements, seconds, timerInt, allFound;

  const style = document.createElement("style");
  style.textContent = `
    .ws-wrapper{display:flex;gap:24px;align-items:flex-start;justify-content:center;flex-wrap:wrap;user-select:none}
    .ws-grid{display:inline-grid;grid-template-columns:repeat(${GRID_SIZE},1fr);gap:2px}
    .ws-cell{width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:1rem;font-weight:700;background:var(--bg-card);border:1px solid var(--border);border-radius:4px;cursor:pointer;transition:all .15s;color:var(--text)}
    .ws-cell:hover{background:var(--primary-light)}
    .ws-cell.selected{background:var(--primary);color:#fff}
    .ws-cell.found{background:#D1FAE5;color:#059669;border-color:#22C55E}
    .ws-words{min-width:140px}
    .ws-words h4{font-size:1rem;font-weight:700;margin-bottom:12px;color:var(--text)}
    .ws-word{padding:6px 12px;margin-bottom:4px;border-radius:var(--radius-sm);font-size:.9rem;font-weight:600;background:var(--bg);border:1px solid var(--border);color:var(--text)}
    .ws-word.found{text-decoration:line-through;background:#D1FAE5;color:#059669;border-color:#22C55E}
    .ws-status{width:100%;text-align:center;font-size:1.1rem;font-weight:600;margin-bottom:12px;color:var(--text)}
    @media(max-width:480px){.ws-cell{width:30px;height:30px;font-size:.85rem}}
  `;
  document.head.appendChild(style);

  function init() {
    const listIdx = Math.floor(Math.random() * WORD_LISTS.length);
    words = [...WORD_LISTS[listIdx]];
    grid = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(""));
    found = new Set();
    selected = null;
    placements = {};
    allFound = false;
    placeWords();
    fillBlanks();
    seconds = 0;
    if (timerInt) clearInterval(timerInt);
    timerInt = setInterval(() => {
      if (!allFound) {
        seconds++;
        const m = Math.floor(seconds / 60), s = seconds % 60;
        document.getElementById("timeDisplay").textContent = `${m}:${s.toString().padStart(2, "0")}`;
      }
    }, 1000);
    updateUI();
    render();
  }

  function placeWords() {
    for (const word of words) {
      let placed = false;
      for (let attempt = 0; attempt < 200 && !placed; attempt++) {
        const dir = DIRS[Math.floor(Math.random() * DIRS.length)];
        const r = Math.floor(Math.random() * GRID_SIZE);
        const c = Math.floor(Math.random() * GRID_SIZE);
        if (canPlace(word, r, c, dir)) {
          const cells = [];
          for (let i = 0; i < word.length; i++) {
            grid[r + dir[0] * i][c + dir[1] * i] = word[i];
            cells.push([r + dir[0] * i, c + dir[1] * i]);
          }
          placements[word] = cells;
          placed = true;
        }
      }
    }
  }

  function canPlace(word, r, c, dir) {
    for (let i = 0; i < word.length; i++) {
      const nr = r + dir[0] * i, nc = c + dir[1] * i;
      if (nr < 0 || nr >= GRID_SIZE || nc < 0 || nc >= GRID_SIZE) return false;
      if (grid[nr][nc] && grid[nr][nc] !== word[i]) return false;
    }
    return true;
  }

  function fillBlanks() {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let r = 0; r < GRID_SIZE; r++)
      for (let c = 0; c < GRID_SIZE; c++)
        if (!grid[r][c]) grid[r][c] = letters[Math.floor(Math.random() * 26)];
  }

  function cellClick(r, c) {
    if (allFound) return;
    if (!selected) {
      selected = [r, c];
      render();
      return;
    }
    const [sr, sc] = selected;
    for (const word of words) {
      if (found.has(word)) continue;
      const cells = placements[word];
      if (!cells) continue;
      const first = cells[0], last = cells[cells.length - 1];
      if ((sr === first[0] && sc === first[1] && r === last[0] && c === last[1]) ||
          (sr === last[0] && sc === last[1] && r === first[0] && c === first[1])) {
        found.add(word);
        updateUI();
        if (found.size === words.length) {
          allFound = true;
          clearInterval(timerInt);
          const s = Math.max(1, 500 - seconds * 2);
          ScoreManager.saveScore("word-search", s);
        }
        break;
      }
    }
    selected = null;
    render();
  }

  function render() {
    const foundCells = new Set();
    found.forEach(w => {
      if (placements[w]) placements[w].forEach(([r, c]) => foundCells.add(`${r},${c}`));
    });

    let cells = "";
    for (let r = 0; r < GRID_SIZE; r++)
      for (let c = 0; c < GRID_SIZE; c++) {
        const isSel = selected && selected[0] === r && selected[1] === c;
        const isFound = foundCells.has(`${r},${c}`);
        let cls = "ws-cell";
        if (isSel) cls += " selected";
        if (isFound) cls += " found";
        cells += `<div class="${cls}" data-r="${r}" data-c="${c}">${grid[r][c]}</div>`;
      }

    root.innerHTML = `<div class="ws-wrapper">
      <div class="ws-status">${allFound ? "🎉 All words found!" : "Click first letter, then last letter of a word"}</div>
      <div class="ws-grid">${cells}</div>
      <div class="ws-words"><h4>Words to Find:</h4>${words.map(w =>
        `<div class="ws-word${found.has(w) ? " found" : ""}">${w}</div>`
      ).join("")}</div>
    </div>`;

    root.querySelectorAll(".ws-cell").forEach(el => {
      el.addEventListener("click", () => cellClick(parseInt(el.dataset.r), parseInt(el.dataset.c)));
    });
  }

  function updateUI() {
    document.getElementById("scoreDisplay").textContent = `${found.size}/${words.length}`;
  }

  window.restartGame = function () { clearInterval(timerInt); init(); };
  window.toggleFullscreen = function () { document.body.classList.toggle("fullscreen-active"); };
  init();
})();
