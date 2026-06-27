const DailyChallenge = {
  _skillMap: {
    memory: ["memory-match", "flash-memory"],
    logic: ["minesweeper", "sudoku", "logic-puzzle"],
    focus: ["word-search", "color-match"],
    reflex: ["reflex-test", "snake", "pac-man"],
    strategy: ["2048", "tic-tac-toe", "tetris"]
  },

  _getDaySeed() {
    const now = new Date();
    return now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
  },

  _seededRandom(seed) {
    let s = seed;
    return function () {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
  },

  getTodaysChallenge() {
    const seed = this._getDaySeed();
    const rng = this._seededRandom(seed);
    const skills = Object.keys(this._skillMap);
    const selectedSkills = [];
    const shuffled = [...skills].sort(() => rng() - 0.5);
    for (let i = 0; i < Math.min(5, shuffled.length); i++) {
      selectedSkills.push(shuffled[i]);
    }

    const challenges = selectedSkills.map(skill => {
      const pool = this._skillMap[skill];
      const idx = Math.floor(rng() * pool.length);
      const gameId = pool[idx];
      const game = getGameById(gameId);
      return { skill, game };
    }).filter(c => c.game);

    return {
      date: new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }),
      challenges
    };
  },

  getDateString() {
    return new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  }
};
