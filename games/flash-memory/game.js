(function () {
  const root = document.getElementById("gameRoot");
  const PADS = [
    { color: "#EF4444", light: "#FCA5A5", name: "Red" },
    { color: "#3B82F6", light: "#93C5FD", name: "Blue" },
    { color: "#22C55E", light: "#86EFAC", name: "Green" },
    { color: "#F59E0B", light: "#FCD34D", name: "Yellow" }
  ];
  let sequence, playerIdx, level, phase, gameOver;

  const style = document.createElement("style");
  style.textContent = `
    .fm-wrapper{text-align:center;user-select:none}
    .fm-status{font-size:1.1rem;font-weight:600;margin-bottom:20px;min-height:28px;color:var(--text)}
    .fm-board{display:inline-grid;grid-template-columns:1fr 1fr;gap:8px;border-radius:50%;padding:16px}
    .fm-pad{width:120px;height:120px;border-radius:16px;border:none;cursor:pointer;transition:all .15s;opacity:.7}
    .fm-pad:hover{opacity:.85}
    .fm-pad.active,.fm-pad.lit{opacity:1;transform:scale(1.05)}
    .fm-pad.disabled{cursor:default;pointer-events:none;opacity:.5}
    .fm-pad:nth-child(1){border-radius:50% 16px 16px 16px}
    .fm-pad:nth-child(2){border-radius:16px 50% 16px 16px}
    .fm-pad:nth-child(3){border-radius:16px 16px 16px 50%}
    .fm-pad:nth-child(4){border-radius:16px 16px 50% 16px}
    .fm-level{font-size:2.5rem;font-weight:900;margin-top:20px;color:var(--primary)}
    .fm-start{margin-top:20px;padding:14px 36px;border-radius:var(--radius);font-size:1.1rem;font-weight:700;background:var(--primary);color:#fff;border:none;cursor:pointer}
    .fm-start:hover{background:var(--primary-dark)}
    @media(max-width:480px){.fm-pad{width:90px;height:90px}}
  `;
  document.head.appendChild(style);

  function init() {
    sequence = [];
    playerIdx = 0;
    level = 0;
    phase = "idle";
    gameOver = false;
    updateUI();
    renderIdle();
  }

  function renderIdle() {
    root.innerHTML = `<div class="fm-wrapper">
      <div class="fm-status">${gameOver ? `Game Over! You reached level ${level}` : "Watch the sequence, then repeat it"}</div>
      <div class="fm-board">${PADS.map((p, i) =>
        `<button class="fm-pad disabled" style="background:${p.color}" data-i="${i}"></button>`
      ).join("")}</div>
      <button class="fm-start" onclick="startGame()">
        ${gameOver ? "Play Again" : "Start"}
      </button>
    </div>`;
  }

  function renderBoard() {
    root.innerHTML = `<div class="fm-wrapper">
      <div class="fm-status" id="fmStatus">${phase === "showing" ? "Watch..." : "Your turn — repeat the pattern"}</div>
      <div class="fm-board">${PADS.map((p, i) =>
        `<button class="fm-pad${phase === "input" ? "" : " disabled"}" style="background:${p.color}" data-i="${i}" id="pad${i}"></button>`
      ).join("")}</div>
      <div class="fm-level">Level ${level}</div>
    </div>`;

    if (phase === "input") {
      root.querySelectorAll(".fm-pad").forEach(el => {
        el.addEventListener("click", () => playerInput(parseInt(el.dataset.i)));
      });
    }
  }

  function flashPad(idx, duration) {
    return new Promise(resolve => {
      const pad = document.getElementById("pad" + idx);
      if (!pad) { resolve(); return; }
      pad.style.background = PADS[idx].light;
      pad.classList.add("lit");
      setTimeout(() => {
        pad.style.background = PADS[idx].color;
        pad.classList.remove("lit");
        setTimeout(resolve, 150);
      }, duration);
    });
  }

  async function playSequence() {
    phase = "showing";
    renderBoard();
    await sleep(500);
    const duration = Math.max(200, 500 - level * 20);
    for (let i = 0; i < sequence.length; i++) {
      await flashPad(sequence[i], duration);
    }
    phase = "input";
    playerIdx = 0;
    renderBoard();
  }

  function playerInput(idx) {
    if (phase !== "input") return;
    const pad = document.getElementById("pad" + idx);
    if (pad) {
      pad.style.background = PADS[idx].light;
      pad.classList.add("active");
      setTimeout(() => {
        pad.style.background = PADS[idx].color;
        pad.classList.remove("active");
      }, 200);
    }

    if (idx !== sequence[playerIdx]) {
      gameOver = true;
      ScoreManager.saveScore("flash-memory", level * 10);
      updateUI();
      renderIdle();
      return;
    }

    playerIdx++;
    if (playerIdx >= sequence.length) {
      nextLevel();
    }
  }

  function nextLevel() {
    level++;
    sequence.push(Math.floor(Math.random() * 4));
    ScoreManager.updateCurrentScore("flash-memory", level * 10);
    updateUI();
    setTimeout(playSequence, 600);
  }

  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  function updateUI() {
    document.getElementById("scoreDisplay").textContent = level;
    const s = ScoreManager.getScore("flash-memory");
    document.getElementById("bestDisplay").textContent = s.best;
  }

  window.startGame = function () {
    sequence = [];
    playerIdx = 0;
    level = 0;
    gameOver = false;
    nextLevel();
  };
  window.restartGame = init;
  window.toggleFullscreen = function () { document.body.classList.toggle("fullscreen-active"); };
  init();
})();
