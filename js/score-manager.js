const ScoreManager = {
  _key: "funGamesSession",

  _getData() {
    try {
      const d = sessionStorage.getItem(this._key);
      return d ? JSON.parse(d) : { scores: {}, gamesPlayed: 0, lastGame: null, totalScore: 0 };
    } catch (e) { return { scores: {}, gamesPlayed: 0, lastGame: null, totalScore: 0 }; }
  },

  _save(data) {
    try { sessionStorage.setItem(this._key, JSON.stringify(data)); } catch (e) {}
  },

  saveScore(gameId, score) {
    const data = this._getData();
    if (!data.scores[gameId]) {
      data.scores[gameId] = { current: 0, best: 0, plays: 0 };
    }
    const gs = data.scores[gameId];
    gs.current = score;
    if (score > gs.best) gs.best = score;
    gs.plays++;
    data.gamesPlayed++;
    data.totalScore += score;
    data.lastGame = { id: gameId, time: Date.now(), score };
    this._save(data);
    return gs;
  },

  getScore(gameId) {
    const data = this._getData();
    return data.scores[gameId] || { current: 0, best: 0, plays: 0 };
  },

  getLastGame() {
    return this._getData().lastGame;
  },

  getSessionStats() {
    const data = this._getData();
    const gameIds = Object.keys(data.scores);
    let bestOverall = 0;
    gameIds.forEach(id => {
      if (data.scores[id].best > bestOverall) bestOverall = data.scores[id].best;
    });
    return {
      gamesPlayed: data.gamesPlayed,
      uniqueGames: gameIds.length,
      totalScore: data.totalScore,
      bestScore: bestOverall,
      lastGame: data.lastGame
    };
  },

  updateCurrentScore(gameId, score) {
    const data = this._getData();
    if (!data.scores[gameId]) {
      data.scores[gameId] = { current: 0, best: 0, plays: 0 };
    }
    data.scores[gameId].current = score;
    this._save(data);
  }
};
