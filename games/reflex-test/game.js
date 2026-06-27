(function () {
  const root = document.getElementById("gameRoot");
  let state, round, times, startTime, timeout;

  const style = document.createElement("style");
  style.textContent = `
    .rx-wrapper{text-align:center;user-select:none}
    .rx-zone{width:100%;max-width:500px;height:300px;margin:0 auto;border-radius:16px;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;transition:background .2s;padding:24px}
    .rx-zone.waiting{background:#EF4444}
    .rx-zone.ready{background:#22C55E}
    .rx-zone.early{background:#F59E0B}
    .rx-zone.result{background:var(--primary-light)}
    .rx-zone h2{font-size:1.8rem;font-weight:800;margin-bottom:8px}
    .rx-zone p{font-size:1rem;opacity:.9}
    .rx-zone .rx-time{font-size:3rem;font-weight:900}
    .rx-zone.waiting h2,.rx-zone.waiting p{color:#fff}
    .rx-zone.ready h2,.rx-zone.ready p{color:#fff}
    .rx-zone.early h2,.rx-zone.early p{color:#fff}
    .rx-results{margin-top:20px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap}
    .rx-round{padding:8px 14px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-sm);font-size:.85rem;font-weight:600}
    .rx-round.fast{border-color:#22C55E;color:#059669}
    .rx-round.medium{border-color:#F59E0B;color:#D97706}
    .rx-round.slow{border-color:#EF4444;color:#DC2626}
    .rx-avg{margin-top:16px;font-size:1.2rem;font-weight:700;color:var(--text)}
  `;
  document.head.appendChild(style);

  function init() {
    state = "idle";
    round = 0;
    times = [];
    updateUI();
    showIdle();
  }

  function showIdle() {
    state = "idle";
    root.innerHTML = `<div class="rx-wrapper">
      <div class="rx-zone result" id="rxZone">
        <h2>⚡ Reflex Test</h2>
        <p>Click to start — 5 rounds</p>
      </div>
      ${renderResults()}
    </div>`;
    document.getElementById("rxZone").addEventListener("click", startRound);
  }

  function startRound() {
    state = "waiting";
    root.innerHTML = `<div class="rx-wrapper">
      <div class="rx-zone waiting" id="rxZone">
        <h2>Wait...</h2>
        <p>Click when it turns GREEN</p>
      </div>
      ${renderResults()}
    </div>`;
    document.getElementById("rxZone").addEventListener("click", earlyClick);

    const delay = 1500 + Math.random() * 3000;
    timeout = setTimeout(() => {
      state = "ready";
      startTime = performance.now();
      const zone = document.getElementById("rxZone");
      if (!zone) return;
      zone.className = "rx-zone ready";
      zone.innerHTML = "<h2>GO!</h2><p>Click NOW!</p>";
      zone.removeEventListener("click", earlyClick);
      zone.addEventListener("click", recordClick);
    }, delay);
  }

  function earlyClick() {
    if (state !== "waiting") return;
    clearTimeout(timeout);
    state = "early";
    root.innerHTML = `<div class="rx-wrapper">
      <div class="rx-zone early" id="rxZone">
        <h2>Too early!</h2>
        <p>Click to try this round again</p>
      </div>
      ${renderResults()}
    </div>`;
    document.getElementById("rxZone").addEventListener("click", startRound);
  }

  function recordClick() {
    if (state !== "ready") return;
    const time = Math.round(performance.now() - startTime);
    times.push(time);
    round++;
    document.getElementById("scoreDisplay").textContent = `${round}`;

    if (round >= 5) {
      const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
      const s = Math.max(1, 500 - avg);
      ScoreManager.saveScore("reflex-test", s);
      updateUI();
      root.innerHTML = `<div class="rx-wrapper">
        <div class="rx-zone result" id="rxZone">
          <div class="rx-time">${avg}ms</div>
          <h2>Average Reaction Time</h2>
          <p>${avg < 200 ? "Incredible! 🏆" : avg < 250 ? "Excellent! ⚡" : avg < 300 ? "Good! 👍" : "Keep practicing! 💪"}</p>
        </div>
        ${renderResults()}
        <div class="rx-avg"><button class="toolbar-btn" onclick="restartGame()" style="margin-top:12px">Play Again</button></div>
      </div>`;
      return;
    }

    root.innerHTML = `<div class="rx-wrapper">
      <div class="rx-zone result" id="rxZone">
        <div class="rx-time">${time}ms</div>
        <h2>Round ${round} of 5</h2>
        <p>Click for next round</p>
      </div>
      ${renderResults()}
    </div>`;
    document.getElementById("rxZone").addEventListener("click", startRound);
  }

  function renderResults() {
    if (!times.length) return "";
    return `<div class="rx-results">${times.map((t, i) => {
      const cls = t < 200 ? "fast" : t < 300 ? "medium" : "slow";
      return `<div class="rx-round ${cls}">R${i + 1}: ${t}ms</div>`;
    }).join("")}</div>`;
  }

  function updateUI() {
    document.getElementById("scoreDisplay").textContent = round;
    const s = ScoreManager.getScore("reflex-test");
    document.getElementById("bestDisplay").textContent = s.best || "—";
  }

  window.restartGame = function () { clearTimeout(timeout); init(); };
  window.toggleFullscreen = function () { document.body.classList.toggle("fullscreen-active"); };
  init();
})();
