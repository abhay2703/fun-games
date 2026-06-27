document.addEventListener("DOMContentLoaded", () => {
  initSearch();
  initMobileMenu();
  initFAQ();
});

function initSearch() {
  const input = document.getElementById("searchInput");
  const dropdown = document.getElementById("searchDropdown");
  if (!input || !dropdown) return;

  let highlighted = -1;

  input.addEventListener("input", () => {
    const q = input.value.trim();
    if (q.length < 1) { dropdown.classList.remove("active"); return; }
    const results = searchGames(q);
    renderSearchResults(results, dropdown);
    dropdown.classList.add("active");
    highlighted = -1;
  });

  input.addEventListener("keydown", (e) => {
    const items = dropdown.querySelectorAll(".search-result-item");
    if (e.key === "ArrowDown") { e.preventDefault(); highlighted = Math.min(highlighted + 1, items.length - 1); updateHighlight(items, highlighted); }
    else if (e.key === "ArrowUp") { e.preventDefault(); highlighted = Math.max(highlighted - 1, 0); updateHighlight(items, highlighted); }
    else if (e.key === "Enter" && highlighted >= 0 && items[highlighted]) { items[highlighted].click(); }
    else if (e.key === "Escape") { dropdown.classList.remove("active"); input.blur(); }
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".header-search")) dropdown.classList.remove("active");
  });
}

function updateHighlight(items, idx) {
  items.forEach((el, i) => el.classList.toggle("highlighted", i === idx));
}

function renderSearchResults(results, container) {
  if (!results.length) {
    container.innerHTML = '<div class="no-results">No games found</div>';
    return;
  }
  container.innerHTML = results.slice(0, 8).map(g => `
    <a href="games/${g.id}/index.html" class="search-result-item">
      <div class="sr-icon">${g.icon}</div>
      <div class="sr-info">
        <h4>${g.name}</h4>
        <p>${g.category} · ${g.difficulty} · ${g.playTime}</p>
      </div>
    </a>
  `).join("");
}

function initMobileMenu() {
  const btn = document.querySelector(".mobile-menu-btn");
  const nav = document.querySelector(".header-nav");
  if (!btn || !nav) return;
  btn.addEventListener("click", () => nav.classList.toggle("open"));
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".header-nav") && !e.target.closest(".mobile-menu-btn")) {
      nav.classList.remove("open");
    }
  });
}

function initFAQ() {
  document.querySelectorAll(".faq-q").forEach(q => {
    q.addEventListener("click", () => {
      q.closest(".faq-item").classList.toggle("open");
    });
  });
}

function renderGameCard(game, basePath) {
  const prefix = basePath || "";
  return `
    <a href="${prefix}games/${game.id}/index.html" class="game-card" aria-label="Play ${game.name}">
      <div class="card-thumb ${game.bg}"><span>${game.icon}</span></div>
      <div class="card-body">
        <h3>${game.name}</h3>
        <div class="card-meta">
          <span>${game.category}</span>
          <span>⏱ ${game.playTime}</span>
          <span class="difficulty-badge ${game.difficulty}">${game.difficulty.charAt(0).toUpperCase() + game.difficulty.slice(1)}</span>
        </div>
        <div class="card-tags">
          ${game.skills.map(s => `<span class="skill-tag ${s}">${s.charAt(0).toUpperCase() + s.slice(1)}</span>`).join("")}
        </div>
      </div>
    </a>`;
}

function renderGamesGrid(games, containerId, basePath) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = games.map(g => renderGameCard(g, basePath)).join("");
}

function initFilters() {
  const categoryFilter = document.getElementById("filterCategory");
  const difficultyFilter = document.getElementById("filterDifficulty");
  const skillChips = document.querySelectorAll(".skill-chip");
  const grid = document.getElementById("allGamesGrid");
  const countEl = document.getElementById("resultsCount");

  let activeSkill = null;

  function applyFilters() {
    const filters = {
      category: categoryFilter ? categoryFilter.value : "all",
      difficulty: difficultyFilter ? difficultyFilter.value : "",
      skill: activeSkill,
      search: ""
    };
    const results = filterGames(filters);
    if (grid) grid.innerHTML = results.map(g => renderGameCard(g)).join("");
    if (countEl) countEl.textContent = `${results.length} game${results.length !== 1 ? "s" : ""} found`;
  }

  if (categoryFilter) categoryFilter.addEventListener("change", applyFilters);
  if (difficultyFilter) difficultyFilter.addEventListener("change", applyFilters);
  skillChips.forEach(chip => {
    chip.addEventListener("click", () => {
      const skill = chip.dataset.skill;
      if (activeSkill === skill) {
        activeSkill = null;
        chip.classList.remove("active");
      } else {
        skillChips.forEach(c => c.classList.remove("active"));
        activeSkill = skill;
        chip.classList.add("active");
      }
      applyFilters();
    });
  });
}

function initHomepage() {
  renderGamesGrid(getFeaturedGames(), "featuredGames");
  renderGamesGrid(getPopularGames(), "popularGames");
  renderGamesGrid(GAMES.slice().reverse().slice(0, 4), "recentGames");

  const catGrid = document.getElementById("categoriesGrid");
  if (catGrid) {
    catGrid.innerHTML = CATEGORIES.filter(c => c.id !== "all").map(c => `
      <a href="games.html?category=${c.id}" class="category-card">
        <div class="category-icon">${c.icon}</div>
        <div class="category-info">
          <h4>${c.name}</h4>
          <span>${c.count} game${c.count !== 1 ? "s" : ""}</span>
        </div>
      </a>
    `).join("");
  }

  const daily = DailyChallenge.getTodaysChallenge();
  const dcDate = document.getElementById("dcDate");
  if (dcDate) dcDate.textContent = daily.date;
  const dcGames = document.getElementById("dcGames");
  if (dcGames) {
    dcGames.innerHTML = daily.challenges.map(c => `
      <a href="games/${c.game.id}/index.html" class="challenge-game">
        <div class="ch-icon">${c.game.icon}</div>
        <div class="ch-name">${c.game.name}</div>
        <div class="ch-skill">${c.skill.charAt(0).toUpperCase() + c.skill.slice(1)}</div>
      </a>
    `).join("");
  }

  const stats = ScoreManager.getSessionStats();
  const lastGame = ScoreManager.getLastGame();
  const continueEl = document.getElementById("continuePlaying");
  if (continueEl && lastGame) {
    const game = getGameById(lastGame.id);
    if (game) {
      continueEl.classList.remove("hidden");
      continueEl.innerHTML = `
        <div>
          <h3>⏩ Continue Playing — ${game.name}</h3>
          <p>Last score: ${lastGame.score} · Pick up where you left off!</p>
        </div>
        <a href="games/${game.id}/index.html" class="btn btn-white">Continue</a>`;
    }
  }

  if (stats.gamesPlayed > 0) {
    const statsEl = document.getElementById("sessionStats");
    if (statsEl) {
      statsEl.classList.remove("hidden");
      statsEl.innerHTML = `
        <div class="stat-item"><div class="stat-value">${stats.gamesPlayed}</div><div class="stat-label">Games Played</div></div>
        <div class="stat-item"><div class="stat-value">${stats.uniqueGames}</div><div class="stat-label">Unique Games</div></div>
        <div class="stat-item"><div class="stat-value">${stats.totalScore}</div><div class="stat-label">Total Score</div></div>
        <div class="stat-item"><div class="stat-value">${stats.bestScore}</div><div class="stat-label">Best Score</div></div>`;
    }
  }
}
