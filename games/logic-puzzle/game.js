(function () {
  const root = document.getElementById("gameRoot");
  let score, level, currentPuzzle, answered;

  const SHAPES = ["●", "■", "▲", "◆", "★", "⬟", "▼", "◀"];
  const COLORS = ["#EF4444", "#3B82F6", "#22C55E", "#F59E0B", "#8B5CF6", "#EC4899", "#06B6D4", "#F97316"];

  const style = document.createElement("style");
  style.textContent = `
    .lp-wrapper{text-align:center;user-select:none;max-width:560px;margin:0 auto}
    .lp-title{font-size:1rem;color:var(--text-secondary);margin-bottom:16px}
    .lp-sequence{display:flex;align-items:center;justify-content:center;gap:8px;flex-wrap:wrap;margin-bottom:8px}
    .lp-item{width:60px;height:60px;border-radius:var(--radius-sm);display:flex;align-items:center;justify-content:center;font-size:2rem;border:2px solid var(--border);background:var(--bg-card);transition:all .2s}
    .lp-item.question{font-size:1.5rem;background:var(--primary-light);border-color:var(--primary);border-style:dashed;color:var(--primary);font-weight:700}
    .lp-arrow{font-size:1.2rem;color:var(--text-muted)}
    .lp-label{font-size:.9rem;color:var(--text-muted);margin:16px 0 8px}
    .lp-options{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-bottom:16px}
    .lp-option{width:66px;height:66px;border-radius:var(--radius-sm);display:flex;align-items:center;justify-content:center;font-size:2rem;border:2px solid var(--border);background:var(--bg-card);cursor:pointer;transition:all .15s}
    .lp-option:hover{border-color:var(--primary);transform:scale(1.08)}
    .lp-option.correct{border-color:#22C55E;background:#D1FAE5;animation:correctPop .4s}
    .lp-option.wrong{border-color:#EF4444;background:#FEE2E2;animation:shake .4s}
    @keyframes correctPop{50%{transform:scale(1.15)}}
    @keyframes shake{25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}
    .lp-feedback{font-size:1.2rem;font-weight:700;min-height:36px;margin-top:12px}
    .lp-hint{font-size:.85rem;color:var(--text-muted);margin-top:8px;font-style:italic}
  `;
  document.head.appendChild(style);

  const generators = [
    function colorCycle() {
      const n = 2 + Math.floor(Math.random() * 3);
      const palette = COLORS.slice(0, n);
      const seq = [];
      for (let i = 0; i < 5; i++) seq.push({ shape: "●", color: palette[i % n] });
      const answer = { shape: "●", color: palette[5 % n] };
      const wrong = palette.filter(c => c !== answer.color).slice(0, 3).map(c => ({ shape: "●", color: c }));
      return { seq, answer, wrong, hint: "Look at the color pattern" };
    },
    function shapeCycle() {
      const n = 2 + Math.floor(Math.random() * 2);
      const shapes = SHAPES.slice(0, n);
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const seq = [];
      for (let i = 0; i < 5; i++) seq.push({ shape: shapes[i % n], color });
      const answer = { shape: shapes[5 % n], color };
      const wrong = shapes.filter(s => s !== answer.shape).concat(SHAPES.slice(n, n + 2)).slice(0, 3).map(s => ({ shape: s, color }));
      return { seq, answer, wrong, hint: "Look at the shape pattern" };
    },
    function numberSeq() {
      const start = Math.floor(Math.random() * 5) + 1;
      const step = Math.floor(Math.random() * 4) + 2;
      const seq = [];
      for (let i = 0; i < 5; i++) seq.push({ shape: String(start + step * i), color: COLORS[0] });
      const answer = { shape: String(start + step * 5), color: COLORS[0] };
      const wrong = [start + step * 5 + 1, start + step * 5 - 1, start + step * 4].map(n => ({ shape: String(n), color: COLORS[0] }));
      return { seq, answer, wrong, hint: "Find the number pattern" };
    },
    function alternating() {
      const s1 = SHAPES[Math.floor(Math.random() * 4)];
      const s2 = SHAPES[4 + Math.floor(Math.random() * 4)];
      const c1 = COLORS[Math.floor(Math.random() * 4)];
      const c2 = COLORS[4 + Math.floor(Math.random() * 4)];
      const seq = [];
      for (let i = 0; i < 5; i++) seq.push(i % 2 === 0 ? { shape: s1, color: c1 } : { shape: s2, color: c2 });
      const answer = 5 % 2 === 0 ? { shape: s1, color: c1 } : { shape: s2, color: c2 };
      const wrong = [
        { shape: s2, color: c1 }, { shape: s1, color: c2 }, { shape: SHAPES[2], color: c1 }
      ];
      return { seq, answer, wrong, hint: "Two elements alternate" };
    },
    function growing() {
      const sizes = ["1rem", "1.4rem", "1.8rem", "2.2rem", "2.6rem"];
      const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const seq = sizes.map(s => ({ shape, color, size: s }));
      const answer = { shape, color, size: "3rem" };
      const wrong = [
        { shape, color, size: "1rem" },
        { shape, color, size: "2rem" },
        { shape: SHAPES[(SHAPES.indexOf(shape) + 1) % SHAPES.length], color, size: "3rem" }
      ];
      return { seq, answer, wrong, hint: "Watch the size" };
    }
  ];

  function init() {
    score = 0; level = 1; answered = false;
    updateUI();
    nextPuzzle();
  }

  function nextPuzzle() {
    answered = false;
    const gen = generators[Math.floor(Math.random() * generators.length)];
    currentPuzzle = gen();
    render();
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[arr[i], arr[j]] = [arr[j], arr[i]]; }
    return arr;
  }

  function render() {
    const p = currentPuzzle;
    const options = shuffle([p.answer, ...p.wrong.slice(0, 3)]);

    root.innerHTML = `<div class="lp-wrapper">
      <div class="lp-title">What comes next in the sequence?</div>
      <div class="lp-sequence">
        ${p.seq.map(item => `<div class="lp-item" style="color:${item.color};${item.size ? "font-size:" + item.size : ""}">${item.shape}</div>`).join('<span class="lp-arrow">→</span>')}
        <span class="lp-arrow">→</span>
        <div class="lp-item question">?</div>
      </div>
      <div class="lp-label">Choose the correct answer:</div>
      <div class="lp-options">${options.map((opt, i) =>
        `<button class="lp-option" data-i="${i}" style="color:${opt.color};${opt.size ? "font-size:" + opt.size : ""}" onclick="lpAnswer(${i})">${opt.shape}</button>`
      ).join("")}</div>
      <div class="lp-feedback" id="lpFeedback"></div>
      <div class="lp-hint">${p.hint}</div>
    </div>`;

    window._lpOptions = options;
  }

  window.lpAnswer = function (i) {
    if (answered) return;
    answered = true;
    const chosen = window._lpOptions[i];
    const correct = chosen.shape === currentPuzzle.answer.shape && chosen.color === currentPuzzle.answer.color;
    const btns = root.querySelectorAll(".lp-option");
    btns[i].classList.add(correct ? "correct" : "wrong");

    if (!correct) {
      window._lpOptions.forEach((opt, j) => {
        if (opt.shape === currentPuzzle.answer.shape && opt.color === currentPuzzle.answer.color) btns[j].classList.add("correct");
      });
    }

    const fb = document.getElementById("lpFeedback");
    if (correct) {
      score += 10 * level;
      level++;
      fb.textContent = "✓ Correct!";
      fb.style.color = "#22C55E";
    } else {
      fb.textContent = "✗ Not quite!";
      fb.style.color = "#EF4444";
    }
    ScoreManager.saveScore("logic-puzzle", score);
    updateUI();
    setTimeout(nextPuzzle, 1200);
  };

  function updateUI() {
    document.getElementById("scoreDisplay").textContent = score;
    document.getElementById("levelDisplay").textContent = level;
    const s = ScoreManager.getScore("logic-puzzle");
    document.getElementById("bestDisplay").textContent = s.best;
  }

  window.restartGame = init;
  window.toggleFullscreen = function () { document.body.classList.toggle("fullscreen-active"); };
  init();
})();
