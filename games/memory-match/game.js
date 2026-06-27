(function () {
  const root = document.getElementById("gameRoot");
  const EMOJIS = ["🐶", "🐱", "🐸", "🦊", "🐻", "🐼", "🐨", "🦁"];
  let cards, flipped, matched, moves, locked;

  const style = document.createElement("style");
  style.textContent = `
    .mm-wrapper{text-align:center;user-select:none}
    .mm-status{font-size:1.1rem;font-weight:600;margin-bottom:16px;min-height:28px;color:var(--text)}
    .mm-grid{display:inline-grid;grid-template-columns:repeat(4,1fr);gap:10px;max-width:420px}
    .mm-card{width:88px;height:88px;perspective:600px;cursor:pointer}
    .mm-card-inner{position:relative;width:100%;height:100%;transition:transform .4s;transform-style:preserve-3d}
    .mm-card.flipped .mm-card-inner,.mm-card.matched .mm-card-inner{transform:rotateY(180deg)}
    .mm-face{position:absolute;inset:0;backface-visibility:hidden;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:2rem;border:2px solid var(--border)}
    .mm-front{background:linear-gradient(135deg,var(--primary),var(--primary-dark));color:#fff;font-size:1.6rem}
    .mm-back{background:var(--bg-card);transform:rotateY(180deg)}
    .mm-card.matched .mm-face.mm-back{background:#D1FAE5;border-color:#22C55E}
    .mm-card.matched{cursor:default}
    @keyframes matchPop{0%,100%{transform:rotateY(180deg) scale(1)}50%{transform:rotateY(180deg) scale(1.1)}}
    .mm-card.matched .mm-card-inner{animation:matchPop .4s ease}
    @media(max-width:480px){.mm-card{width:68px;height:68px}.mm-grid{gap:6px}.mm-face{font-size:1.6rem}}
  `;
  document.head.appendChild(style);

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[arr[i], arr[j]] = [arr[j], arr[i]]; }
    return arr;
  }

  function init() {
    cards = shuffle([...EMOJIS, ...EMOJIS].map((emoji, i) => ({ id: i, emoji, flipped: false, matched: false })));
    flipped = [];
    matched = 0;
    moves = 0;
    locked = false;
    updateUI();
    render();
  }

  function render() {
    root.innerHTML = `<div class="mm-wrapper">
      <div class="mm-status" id="mmStatus">${matched === 8 ? "🎉 You matched all pairs!" : "Find all matching pairs"}</div>
      <div class="mm-grid">${cards.map((c, i) => `
        <div class="mm-card${c.flipped || c.matched ? " flipped" : ""}${c.matched ? " matched" : ""}" data-i="${i}">
          <div class="mm-card-inner">
            <div class="mm-face mm-front">?</div>
            <div class="mm-face mm-back">${c.emoji}</div>
          </div>
        </div>`).join("")}</div></div>`;

    root.querySelectorAll(".mm-card:not(.matched):not(.flipped)").forEach(el => {
      el.addEventListener("click", () => flipCard(parseInt(el.dataset.i)));
    });
  }

  function flipCard(i) {
    if (locked || cards[i].flipped || cards[i].matched || flipped.length >= 2) return;
    cards[i].flipped = true;
    flipped.push(i);
    render();

    if (flipped.length === 2) {
      moves++;
      locked = true;
      const [a, b] = flipped;
      if (cards[a].emoji === cards[b].emoji) {
        cards[a].matched = true;
        cards[b].matched = true;
        matched++;
        flipped = [];
        locked = false;
        updateUI();
        render();
        if (matched === 8) {
          const s = moves > 0 ? Math.max(1, 200 - moves * 5) : 0;
          ScoreManager.saveScore("memory-match", s);
          updateUI();
        }
      } else {
        setTimeout(() => {
          cards[a].flipped = false;
          cards[b].flipped = false;
          flipped = [];
          locked = false;
          updateUI();
          render();
        }, 800);
      }
    }
  }

  function updateUI() {
    document.getElementById("scoreDisplay").textContent = moves;
    document.getElementById("pairsDisplay").textContent = `${matched}/8`;
    const s = ScoreManager.getScore("memory-match");
    document.getElementById("bestDisplay").textContent = s.best || "—";
  }

  window.restartGame = init;
  window.toggleFullscreen = function () { document.body.classList.toggle("fullscreen-active"); };
  init();
})();
