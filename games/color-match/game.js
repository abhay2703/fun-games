(function () {
  const root = document.getElementById("gameRoot");
  const COLORS = [
    { name: "RED", hex: "#EF4444" }, { name: "BLUE", hex: "#3B82F6" },
    { name: "GREEN", hex: "#22C55E" }, { name: "YELLOW", hex: "#F59E0B" },
    { name: "PURPLE", hex: "#8B5CF6" }, { name: "ORANGE", hex: "#F97316" }
  ];
  let score, timeLeft, currentWord, currentColor, isMatch, gameActive, timer, streak;

  const style = document.createElement("style");
  style.textContent = `
    .cm-wrapper{text-align:center;user-select:none;max-width:400px;margin:0 auto}
    .cm-status{font-size:1rem;font-weight:600;margin-bottom:16px;color:var(--text-secondary)}
    .cm-word{font-size:4rem;font-weight:900;margin:32px 0;min-height:80px;letter-spacing:2px;transition:all .2s}
    .cm-question{font-size:1.1rem;color:var(--text-secondary);margin-bottom:24px}
    .cm-buttons{display:flex;gap:16px;justify-content:center}
    .cm-btn{padding:16px 48px;border-radius:var(--radius);font-size:1.2rem;font-weight:700;border:2px solid;cursor:pointer;transition:all .15s}
    .cm-btn.yes{background:#D1FAE5;border-color:#22C55E;color:#059669}
    .cm-btn.yes:hover{background:#22C55E;color:#fff}
    .cm-btn.no{background:#FEE2E2;border-color:#EF4444;color:#DC2626}
    .cm-btn.no:hover{background:#EF4444;color:#fff}
    .cm-feedback{font-size:1.4rem;font-weight:700;margin-top:16px;min-height:36px}
    .cm-streak{font-size:.9rem;color:var(--text-muted);margin-top:8px}
    .cm-start{padding:16px 40px;border-radius:var(--radius);font-size:1.1rem;font-weight:700;background:var(--primary);color:#fff;border:none;cursor:pointer}
    .cm-start:hover{background:var(--primary-dark)}
    .cm-timer-bar{height:6px;background:var(--border);border-radius:3px;margin-bottom:16px;overflow:hidden}
    .cm-timer-fill{height:100%;background:var(--primary);transition:width 1s linear;border-radius:3px}
  `;
  document.head.appendChild(style);

  function init() {
    score = 0; timeLeft = 30; gameActive = false; streak = 0;
    updateUI();
    root.innerHTML = `<div class="cm-wrapper">
      <div class="cm-status">Test your color perception speed!</div>
      <div class="cm-word" style="color:var(--text-muted)">🎯</div>
      <p class="cm-question">Does the font color match the word?</p>
      <button class="cm-start" onclick="startGame()">Start Game</button>
    </div>`;
  }

  function startGame() {
    score = 0; timeLeft = 30; gameActive = true; streak = 0;
    updateUI();
    nextRound();
    timer = setInterval(() => {
      timeLeft--;
      document.getElementById("timeDisplay").textContent = timeLeft;
      const bar = document.getElementById("timerFill");
      if (bar) bar.style.width = (timeLeft / 30 * 100) + "%";
      if (timeLeft <= 0) {
        clearInterval(timer);
        gameActive = false;
        ScoreManager.saveScore("color-match", score);
        updateUI();
        root.innerHTML = `<div class="cm-wrapper">
          <div class="cm-status">Time's up!</div>
          <div class="cm-word" style="color:var(--primary)">${score}</div>
          <p class="cm-question">Final Score — Best streak: ${streak}</p>
          <button class="cm-start" onclick="startGame()">Play Again</button>
        </div>`;
      }
    }, 1000);
  }

  function nextRound() {
    if (!gameActive) return;
    const wordIdx = Math.floor(Math.random() * COLORS.length);
    let colorIdx = Math.floor(Math.random() * COLORS.length);
    isMatch = Math.random() < 0.4;
    if (isMatch) colorIdx = wordIdx;
    else while (colorIdx === wordIdx) colorIdx = Math.floor(Math.random() * COLORS.length);

    currentWord = COLORS[wordIdx].name;
    currentColor = COLORS[colorIdx].hex;

    root.innerHTML = `<div class="cm-wrapper">
      <div class="cm-timer-bar"><div class="cm-timer-fill" id="timerFill" style="width:${timeLeft/30*100}%"></div></div>
      <div class="cm-status">Does the COLOR match the WORD?</div>
      <div class="cm-word" style="color:${currentColor}">${currentWord}</div>
      <div class="cm-buttons">
        <button class="cm-btn yes" onclick="answer(true)">YES ✓</button>
        <button class="cm-btn no" onclick="answer(false)">NO ✗</button>
      </div>
      <div class="cm-feedback" id="cmFeedback"></div>
      <div class="cm-streak">Streak: ${streak}</div>
    </div>`;
  }

  window.answer = function (yes) {
    if (!gameActive) return;
    const correct = (yes === isMatch);
    const fb = document.getElementById("cmFeedback");
    if (correct) {
      score += 10 + Math.min(streak * 2, 10);
      streak++;
      if (fb) { fb.textContent = "✓ Correct!"; fb.style.color = "#22C55E"; }
    } else {
      streak = 0;
      if (fb) { fb.textContent = "✗ Wrong!"; fb.style.color = "#EF4444"; }
    }
    updateUI();
    setTimeout(nextRound, 400);
  };

  document.addEventListener("keydown", e => {
    if (!gameActive) return;
    if (e.key === "ArrowLeft" || e.key === "y" || e.key === "Y") answer(true);
    else if (e.key === "ArrowRight" || e.key === "n" || e.key === "N") answer(false);
  });

  function updateUI() {
    document.getElementById("scoreDisplay").textContent = score;
    document.getElementById("timeDisplay").textContent = timeLeft;
    const s = ScoreManager.getScore("color-match");
    document.getElementById("bestDisplay").textContent = s.best;
  }

  window.startGame = startGame;
  window.restartGame = function () { if (timer) clearInterval(timer); init(); };
  window.toggleFullscreen = function () { document.body.classList.toggle("fullscreen-active"); };
  init();
})();
