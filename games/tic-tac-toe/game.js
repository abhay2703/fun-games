(function () {
  const root = document.getElementById("gameRoot");
  let board, currentPlayer, gameOver;

  const style = document.createElement("style");
  style.textContent = `
    .ttt-wrapper{text-align:center;user-select:none}
    .ttt-status{font-size:1.2rem;font-weight:700;margin-bottom:16px;min-height:36px;color:var(--text)}
    .ttt-board{display:inline-grid;grid-template-columns:repeat(3,1fr);gap:6px;background:var(--border);padding:6px;border-radius:12px}
    .ttt-cell{width:80px;height:80px;background:var(--bg-card);border:none;border-radius:8px;font-size:2.4rem;font-weight:800;cursor:pointer;transition:all .15s;display:flex;align-items:center;justify-content:center;color:var(--text)}
    .ttt-cell:hover:not(.taken){background:var(--primary-light)}
    .ttt-cell.taken{cursor:default}
    .ttt-cell.x{color:var(--primary)}
    .ttt-cell.o{color:var(--accent)}
    .ttt-cell.win-cell{background:#D1FAE5;animation:winPulse .5s ease}
    @keyframes winPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}
    @media(max-width:480px){.ttt-cell{width:72px;height:72px;font-size:2rem}}
  `;
  document.head.appendChild(style);

  function getRecord() {
    try {
      const d = sessionStorage.getItem("ttt-record");
      return d ? JSON.parse(d) : { w: 0, l: 0, d: 0 };
    } catch (e) { return { w: 0, l: 0, d: 0 }; }
  }

  function saveRecord(rec) {
    sessionStorage.setItem("ttt-record", JSON.stringify(rec));
  }

  function updateDisplay() {
    const rec = getRecord();
    document.getElementById("winsDisplay").textContent = rec.w;
    document.getElementById("lossDisplay").textContent = rec.l;
    document.getElementById("drawDisplay").textContent = rec.d;
  }

  function init() {
    board = Array(9).fill("");
    currentPlayer = "X";
    gameOver = false;
    updateDisplay();
    render();
  }

  function render() {
    root.innerHTML = `<div class="ttt-wrapper">
      <div class="ttt-status" id="tttStatus">${gameOver ? "" : "Your turn (X)"}</div>
      <div class="ttt-board">${board.map((v, i) =>
        `<button class="ttt-cell${v ? " taken " + v.toLowerCase() : ""}" data-i="${i}">${v}</button>`
      ).join("")}</div></div>`;
    root.querySelectorAll(".ttt-cell:not(.taken)").forEach(c =>
      c.addEventListener("click", () => playerMove(parseInt(c.dataset.i)))
    );
  }

  function playerMove(i) {
    if (gameOver || board[i]) return;
    board[i] = "X";
    if (checkEnd()) return;
    currentPlayer = "O";
    document.getElementById("tttStatus").textContent = "Computer thinking...";
    render();
    setTimeout(aiMove, 300);
  }

  function aiMove() {
    const move = getBestMove();
    if (move === -1) return;
    board[move] = "O";
    currentPlayer = "X";
    checkEnd();
  }

  function getBestMove() {
    const empty = board.map((v, i) => v === "" ? i : -1).filter(i => i !== -1);
    if (!empty.length) return -1;
    for (const i of empty) { board[i] = "O"; if (checkWin("O")) { board[i] = ""; return i; } board[i] = ""; }
    for (const i of empty) { board[i] = "X"; if (checkWin("X")) { board[i] = ""; return i; } board[i] = ""; }
    if (board[4] === "") return 4;
    const corners = [0, 2, 6, 8].filter(i => board[i] === "");
    if (corners.length) return corners[Math.floor(Math.random() * corners.length)];
    return empty[Math.floor(Math.random() * empty.length)];
  }

  const LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

  function checkWin(p) {
    return LINES.some(l => l.every(i => board[i] === p));
  }

  function getWinLine(p) {
    return LINES.find(l => l.every(i => board[i] === p));
  }

  function checkEnd() {
    const xWin = getWinLine("X");
    const oWin = getWinLine("O");
    const draw = !board.includes("");

    if (xWin) { endGame("You win! 🎉", xWin, "w"); return true; }
    if (oWin) { endGame("Computer wins!", oWin, "l"); return true; }
    if (draw) { endGame("It's a draw!", [], "d"); return true; }
    render();
    return false;
  }

  function endGame(msg, winCells, result) {
    gameOver = true;
    const rec = getRecord();
    rec[result]++;
    saveRecord(rec);
    updateDisplay();
    render();
    document.getElementById("tttStatus").textContent = msg;
    if (winCells.length) {
      winCells.forEach(i => root.querySelectorAll(".ttt-cell")[i].classList.add("win-cell"));
    }
  }

  window.restartGame = init;
  window.toggleFullscreen = function () {
    document.body.classList.toggle("fullscreen-active");
  };

  init();
})();
