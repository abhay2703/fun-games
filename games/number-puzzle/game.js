(function () {
  const root = document.getElementById("gameRoot");
  let numbers, target, selectedNum, selectedOp, solved, solvedCount, history;

  const style = document.createElement("style");
  style.textContent = `
    .np-wrapper{text-align:center;user-select:none;max-width:460px;margin:0 auto}
    .np-target{font-size:1rem;color:var(--text-secondary);margin-bottom:8px}
    .np-target-num{font-size:3.5rem;font-weight:900;color:var(--primary);margin-bottom:20px}
    .np-numbers{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-bottom:20px}
    .np-num{width:64px;height:56px;border-radius:var(--radius-sm);font-size:1.3rem;font-weight:700;border:2px solid var(--border);background:var(--bg-card);cursor:pointer;transition:all .15s;color:var(--text);display:flex;align-items:center;justify-content:center}
    .np-num:hover{border-color:var(--primary);background:var(--primary-light)}
    .np-num.selected{background:var(--primary);color:#fff;border-color:var(--primary)}
    .np-num.used{opacity:.3;cursor:default;pointer-events:none}
    .np-ops{display:flex;gap:8px;justify-content:center;margin-bottom:20px}
    .np-op{width:50px;height:50px;border-radius:50%;font-size:1.4rem;font-weight:700;border:2px solid var(--border);background:var(--bg-card);cursor:pointer;transition:all .15s;color:var(--text)}
    .np-op:hover{border-color:var(--accent);background:var(--accent-light)}
    .np-op.selected{background:var(--accent);color:#fff;border-color:var(--accent)}
    .np-expr{min-height:40px;font-size:1.1rem;font-weight:600;color:var(--text-secondary);margin-bottom:12px;padding:8px;background:var(--bg);border-radius:var(--radius-sm)}
    .np-actions{display:flex;gap:8px;justify-content:center}
    .np-result{font-size:1.4rem;font-weight:700;margin-top:16px;min-height:36px}
    .np-history{margin-top:16px;font-size:.85rem;color:var(--text-muted);text-align:left;max-width:300px;margin-left:auto;margin-right:auto}
    .np-history div{padding:4px 0;border-bottom:1px solid var(--border-light)}
  `;
  document.head.appendChild(style);

  function generatePuzzle() {
    const small = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const large = [25, 50, 75, 100];
    const nums = [];
    for (let i = 0; i < 4; i++) nums.push(small[Math.floor(Math.random() * small.length)]);
    nums.push(large[Math.floor(Math.random() * large.length)]);
    nums.push(small[Math.floor(Math.random() * small.length)]);

    let t = 0;
    for (let attempt = 0; attempt < 50; attempt++) {
      t = Math.floor(Math.random() * 900) + 100;
      if (canSolve(nums, t)) break;
    }
    return { nums, target: t };
  }

  function canSolve(nums, target) {
    if (nums.includes(target)) return true;
    for (let i = 0; i < nums.length; i++)
      for (let j = 0; j < nums.length; j++) {
        if (i === j) continue;
        const remaining = nums.filter((_, k) => k !== i && k !== j);
        const results = [nums[i] + nums[j], nums[i] * nums[j]];
        if (nums[i] > nums[j]) results.push(nums[i] - nums[j]);
        if (nums[j] !== 0 && nums[i] % nums[j] === 0) results.push(nums[i] / nums[j]);
        for (const r of results) {
          if (r === target) return true;
          if (remaining.length > 0 && canSolve([r, ...remaining], target)) return true;
        }
      }
    return false;
  }

  function init() {
    const puzzle = generatePuzzle();
    numbers = puzzle.nums.map((v, i) => ({ value: v, id: i, used: false }));
    target = puzzle.target;
    selectedNum = null;
    selectedOp = null;
    solved = false;
    history = [];
    render();
  }

  function selectNumber(idx) {
    if (solved || numbers[idx].used) return;
    if (selectedNum === null) {
      selectedNum = idx;
      render();
    } else if (selectedOp !== null) {
      const a = numbers[selectedNum].value;
      const b = numbers[idx].value;
      let result;
      if (selectedOp === "+") result = a + b;
      else if (selectedOp === "−") result = a - b;
      else if (selectedOp === "×") result = a * b;
      else if (selectedOp === "÷") {
        if (b === 0 || a % b !== 0) {
          selectedOp = null; selectedNum = null;
          render();
          return;
        }
        result = a / b;
      }
      if (result < 0) {
        selectedOp = null; selectedNum = null;
        render();
        return;
      }
      history.push(`${a} ${selectedOp} ${b} = ${result}`);
      numbers[selectedNum].used = true;
      numbers[idx].used = true;
      numbers.push({ value: result, id: numbers.length, used: false });
      selectedNum = null; selectedOp = null;

      if (result === target) {
        solved = true;
        solvedCount = (parseInt(sessionStorage.getItem("np-solved") || "0")) + 1;
        sessionStorage.setItem("np-solved", solvedCount);
        ScoreManager.saveScore("number-puzzle", solvedCount * 100);
        document.getElementById("scoreDisplay").textContent = solvedCount;
        const s = ScoreManager.getScore("number-puzzle");
        document.getElementById("bestDisplay").textContent = s.best;
      }
      render();
    }
  }

  function selectOp(op) {
    if (solved || selectedNum === null) return;
    selectedOp = op;
    render();
  }

  function undoLast() {
    if (!history.length || solved) return;
    history.pop();
    const last2 = numbers.splice(numbers.length - 1, 1);
    const usedIds = numbers.filter(n => n.used).slice(-2);
    usedIds.forEach(n => n.used = false);
    selectedNum = null; selectedOp = null;
    render();
  }

  function render() {
    const expr = selectedNum !== null ? `${numbers[selectedNum].value} ${selectedOp || "?"}` : "Select a number";
    root.innerHTML = `<div class="np-wrapper">
      <div class="np-target">Reach the target:</div>
      <div class="np-target-num">${target}</div>
      <div class="np-expr">${expr}</div>
      <div class="np-numbers">${numbers.filter(n => !n.used).map((n, i) =>
        `<button class="np-num${selectedNum === numbers.indexOf(n) ? " selected" : ""}" onclick="npSelectNum(${numbers.indexOf(n)})">${n.value}</button>`
      ).join("")}</div>
      <div class="np-ops">
        ${["+","−","×","÷"].map(op => `<button class="np-op${selectedOp === op ? " selected" : ""}" onclick="npSelectOp('${op}')">${op}</button>`).join("")}
      </div>
      <div class="np-actions">
        <button class="toolbar-btn" onclick="npUndo()">↩ Undo</button>
        <button class="toolbar-btn" onclick="restartGame()">🔄 New Puzzle</button>
      </div>
      <div class="np-result" style="color:${solved ? "#22C55E" : "transparent"}">${solved ? "🎉 You reached the target!" : "."}</div>
      ${history.length ? `<div class="np-history">${history.map(h => `<div>${h}</div>`).join("")}</div>` : ""}
    </div>`;
  }

  window.npSelectNum = selectNumber;
  window.npSelectOp = selectOp;
  window.npUndo = undoLast;
  window.restartGame = init;
  window.toggleFullscreen = function () { document.body.classList.toggle("fullscreen-active"); };

  solvedCount = parseInt(sessionStorage.getItem("np-solved") || "0");
  document.getElementById("scoreDisplay").textContent = solvedCount;
  const s = ScoreManager.getScore("number-puzzle");
  document.getElementById("bestDisplay").textContent = s.best;
  init();
})();
