(function () {
  const root = document.getElementById("gameRoot");
  let solution, puzzle, userGrid, selected, errors, timerInterval, seconds, solved;

  const style = document.createElement("style");
  style.textContent = `
    .sdk-wrapper{text-align:center;user-select:none}
    .sdk-status{font-size:1rem;font-weight:600;margin-bottom:12px;min-height:28px;color:var(--text)}
    .sdk-board{display:inline-grid;grid-template-columns:repeat(9,1fr);gap:0;border:2px solid #333;border-radius:4px;overflow:hidden}
    .sdk-cell{width:42px;height:42px;border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:1.2rem;font-weight:600;cursor:pointer;background:var(--bg-card);transition:background .1s;color:var(--text)}
    .sdk-cell:nth-child(3n){border-right:2px solid #555}
    .sdk-cell:nth-child(n+19):nth-child(-n+27),.sdk-cell:nth-child(n+46):nth-child(-n+54){border-bottom:2px solid #555}
    .sdk-cell.given{font-weight:800;color:var(--text);background:#f0f1f7}
    .sdk-cell.selected{background:var(--primary-light)!important;outline:2px solid var(--primary)}
    .sdk-cell.error{color:#DC2626;background:#FEE2E2}
    .sdk-cell.highlight{background:#EDE9FE}
    .sdk-numpad{display:flex;gap:6px;justify-content:center;margin-top:16px;flex-wrap:wrap}
    .sdk-numpad button{width:40px;height:40px;border-radius:8px;font-size:1.1rem;font-weight:700;background:var(--bg-card);border:1px solid var(--border);cursor:pointer;transition:all .15s;color:var(--text)}
    .sdk-numpad button:hover{background:var(--primary);color:#fff;border-color:var(--primary)}
    @media(max-width:480px){.sdk-cell{width:34px;height:34px;font-size:1rem}}
  `;
  document.head.appendChild(style);

  function generateSolution() {
    const grid = Array.from({ length: 9 }, () => Array(9).fill(0));
    fillGrid(grid);
    return grid;
  }

  function fillGrid(grid) {
    const empty = findEmpty(grid);
    if (!empty) return true;
    const [r, c] = empty;
    const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    for (const n of nums) {
      if (isValid(grid, r, c, n)) {
        grid[r][c] = n;
        if (fillGrid(grid)) return true;
        grid[r][c] = 0;
      }
    }
    return false;
  }

  function findEmpty(grid) {
    for (let r = 0; r < 9; r++)
      for (let c = 0; c < 9; c++)
        if (grid[r][c] === 0) return [r, c];
    return null;
  }

  function isValid(grid, row, col, num) {
    for (let i = 0; i < 9; i++) {
      if (grid[row][i] === num || grid[i][col] === num) return false;
    }
    const br = Math.floor(row / 3) * 3, bc = Math.floor(col / 3) * 3;
    for (let r = br; r < br + 3; r++)
      for (let c = bc; c < bc + 3; c++)
        if (grid[r][c] === num) return false;
    return true;
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[arr[i], arr[j]] = [arr[j], arr[i]]; }
    return arr;
  }

  function createPuzzle(sol, clues) {
    const puz = sol.map(r => [...r]);
    const cells = shuffle(Array.from({ length: 81 }, (_, i) => i));
    let removed = 0;
    for (const idx of cells) {
      if (removed >= 81 - clues) break;
      const r = Math.floor(idx / 9), c = idx % 9;
      puz[r][c] = 0;
      removed++;
    }
    return puz;
  }

  function init() {
    solution = generateSolution();
    puzzle = createPuzzle(solution, 35);
    userGrid = puzzle.map(r => [...r]);
    selected = null;
    errors = 0;
    solved = false;
    seconds = 0;
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      if (!solved) {
        seconds++;
        const m = Math.floor(seconds / 60), s = seconds % 60;
        document.getElementById("timeDisplay").textContent = `${m}:${s.toString().padStart(2, "0")}`;
      }
    }, 1000);
    document.getElementById("scoreDisplay").textContent = "0";
    document.getElementById("timeDisplay").textContent = "0:00";
    render();
  }

  function render() {
    let cells = "";
    for (let r = 0; r < 9; r++)
      for (let c = 0; c < 9; c++) {
        const given = puzzle[r][c] !== 0;
        const val = userGrid[r][c];
        const isSelected = selected && selected[0] === r && selected[1] === c;
        const isError = val && val !== solution[r][c];
        const isHighlight = selected && val && val === userGrid[selected[0]][selected[1]] && !isSelected;
        let cls = "sdk-cell";
        if (given) cls += " given";
        if (isSelected) cls += " selected";
        if (isError && !given) cls += " error";
        if (isHighlight) cls += " highlight";
        cells += `<div class="${cls}" data-r="${r}" data-c="${c}">${val || ""}</div>`;
      }

    const status = solved ? "🎉 Puzzle Complete!" : "Click a cell, then type a number";
    root.innerHTML = `<div class="sdk-wrapper">
      <div class="sdk-status">${status}</div>
      <div class="sdk-board">${cells}</div>
      <div class="sdk-numpad">
        ${[1,2,3,4,5,6,7,8,9].map(n=>`<button onclick="placeNumber(${n})">${n}</button>`).join("")}
        <button onclick="placeNumber(0)">✕</button>
      </div></div>`;

    root.querySelectorAll(".sdk-cell").forEach(el => {
      el.addEventListener("click", () => {
        const r = parseInt(el.dataset.r), c = parseInt(el.dataset.c);
        selected = [r, c];
        render();
      });
    });
  }

  window.placeNumber = function (n) {
    if (!selected || solved) return;
    const [r, c] = selected;
    if (puzzle[r][c] !== 0) return;
    userGrid[r][c] = n || 0;
    if (n && n !== solution[r][c]) {
      errors++;
      document.getElementById("scoreDisplay").textContent = errors;
    }
    if (!findEmpty(userGrid) && userGrid.every((row, ri) => row.every((v, ci) => v === solution[ri][ci]))) {
      solved = true;
      clearInterval(timerInterval);
      const s = Math.max(1, 1000 - errors * 50 - seconds);
      ScoreManager.saveScore("sudoku", s);
    }
    render();
  };

  document.addEventListener("keydown", e => {
    if (!selected || solved) return;
    const n = parseInt(e.key);
    if (n >= 1 && n <= 9) placeNumber(n);
    else if (e.key === "Backspace" || e.key === "Delete") placeNumber(0);
    else if (e.key === "ArrowUp" && selected[0] > 0) { selected[0]--; render(); }
    else if (e.key === "ArrowDown" && selected[0] < 8) { selected[0]++; render(); }
    else if (e.key === "ArrowLeft" && selected[1] > 0) { selected[1]--; render(); }
    else if (e.key === "ArrowRight" && selected[1] < 8) { selected[1]++; render(); }
  });

  window.getHint = function () {
    if (solved) return;
    const empty = [];
    for (let r = 0; r < 9; r++)
      for (let c = 0; c < 9; c++)
        if (userGrid[r][c] === 0 || userGrid[r][c] !== solution[r][c]) empty.push([r, c]);
    if (!empty.length) return;
    const [r, c] = empty[Math.floor(Math.random() * empty.length)];
    userGrid[r][c] = solution[r][c];
    selected = [r, c];
    if (!findEmpty(userGrid)) {
      solved = true;
      clearInterval(timerInterval);
      ScoreManager.saveScore("sudoku", Math.max(1, 500 - errors * 50 - seconds));
    }
    render();
  };

  window.restartGame = init;
  window.toggleFullscreen = function () { document.body.classList.toggle("fullscreen-active"); };
  init();
})();
