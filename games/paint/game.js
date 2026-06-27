(function () {
  const root = document.getElementById("gameRoot");
  let canvas, ctx, drawing, color, brushSize, eraser, history;
  const COLORS = ["#1A1D2E","#EF4444","#F97316","#F59E0B","#22C55E","#3B82F6","#8B5CF6","#EC4899","#6B7280","#FFFFFF"];

  const style = document.createElement("style");
  style.textContent = `
    .paint-wrapper{text-align:center;user-select:none}
    .paint-canvas{border:2px solid var(--border);border-radius:8px;background:#fff;cursor:crosshair;touch-action:none;max-width:100%}
    .paint-tools{display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:center;margin-top:16px;padding:12px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-sm)}
    .color-palette{display:flex;gap:4px}
    .color-swatch{width:30px;height:30px;border-radius:50%;border:2px solid transparent;cursor:pointer;transition:all .15s}
    .color-swatch:hover,.color-swatch.active{border-color:var(--text);transform:scale(1.15)}
    .brush-control{display:flex;align-items:center;gap:6px;font-size:.85rem;color:var(--text-secondary)}
    .brush-control input[type=range]{width:80px;accent-color:var(--primary)}
    .tool-btn{padding:6px 14px;border-radius:var(--radius-sm);font-size:.82rem;font-weight:600;background:var(--bg);border:1px solid var(--border);color:var(--text-secondary);cursor:pointer;transition:all .15s}
    .tool-btn:hover{border-color:var(--primary);color:var(--primary)}
    .tool-btn.active{background:var(--primary);color:#fff;border-color:var(--primary)}
    .custom-color{width:30px;height:30px;border:none;padding:0;border-radius:50%;cursor:pointer;background:none}
  `;
  document.head.appendChild(style);

  function init() {
    color = "#1A1D2E";
    brushSize = 4;
    eraser = false;
    drawing = false;
    history = [];
    render();
    canvas = document.getElementById("paintCanvas");
    ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveState();
    setupEvents();
  }

  function render() {
    root.innerHTML = `<div class="paint-wrapper">
      <canvas class="paint-canvas" id="paintCanvas" width="600" height="400"></canvas>
      <div class="paint-tools">
        <div class="color-palette">
          ${COLORS.map(c => `<div class="color-swatch${color === c ? " active" : ""}" style="background:${c};${c==="#FFFFFF"?"box-shadow:inset 0 0 0 1px #ccc;":""}" data-color="${c}"></div>`).join("")}
          <input type="color" class="custom-color" id="customColor" value="${color}" title="Custom color">
        </div>
        <div class="brush-control">
          <span>Size:</span>
          <input type="range" min="1" max="30" value="${brushSize}" id="brushRange">
          <span id="brushVal">${brushSize}</span>
        </div>
        <button class="tool-btn${eraser ? " active" : ""}" id="eraserBtn">Eraser</button>
      </div>
    </div>`;
  }

  function setupEvents() {
    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
    };

    const startDraw = (e) => {
      drawing = true;
      const pos = getPos(e);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      ctx.strokeStyle = eraser ? "#FFFFFF" : color;
      ctx.lineWidth = brushSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    };

    const doDraw = (e) => {
      if (!drawing) return;
      e.preventDefault();
      const pos = getPos(e);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    };

    const endDraw = () => {
      if (drawing) { drawing = false; saveState(); }
    };

    canvas.addEventListener("mousedown", startDraw);
    canvas.addEventListener("mousemove", doDraw);
    canvas.addEventListener("mouseup", endDraw);
    canvas.addEventListener("mouseleave", endDraw);
    canvas.addEventListener("touchstart", (e) => { e.preventDefault(); startDraw(e); }, { passive: false });
    canvas.addEventListener("touchmove", (e) => { doDraw(e); }, { passive: false });
    canvas.addEventListener("touchend", endDraw);

    root.querySelectorAll(".color-swatch").forEach(s => {
      s.addEventListener("click", () => {
        color = s.dataset.color;
        eraser = false;
        root.querySelectorAll(".color-swatch").forEach(x => x.classList.remove("active"));
        s.classList.add("active");
        document.getElementById("eraserBtn").classList.remove("active");
      });
    });

    document.getElementById("customColor").addEventListener("input", (e) => {
      color = e.target.value;
      eraser = false;
      root.querySelectorAll(".color-swatch").forEach(x => x.classList.remove("active"));
      document.getElementById("eraserBtn").classList.remove("active");
    });

    document.getElementById("brushRange").addEventListener("input", (e) => {
      brushSize = parseInt(e.target.value);
      document.getElementById("brushVal").textContent = brushSize;
    });

    document.getElementById("eraserBtn").addEventListener("click", () => {
      eraser = !eraser;
      document.getElementById("eraserBtn").classList.toggle("active", eraser);
      if (eraser) root.querySelectorAll(".color-swatch").forEach(x => x.classList.remove("active"));
    });
  }

  function saveState() {
    history.push(canvas.toDataURL());
    if (history.length > 30) history.shift();
  }

  window.clearCanvas = function () {
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveState();
  };

  window.undoStroke = function () {
    if (history.length < 2) return;
    history.pop();
    const img = new Image();
    img.onload = () => { ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.drawImage(img, 0, 0); };
    img.src = history[history.length - 1];
  };

  window.saveDrawing = function () {
    const link = document.createElement("a");
    link.download = "my-drawing.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  window.restartGame = function () { init(); };
  window.toggleFullscreen = function () { document.body.classList.toggle("fullscreen-active"); };
  ScoreManager.saveScore("paint", 1);
  init();
})();
