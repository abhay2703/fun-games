const GAMES = [
  {
    id: "tic-tac-toe",
    name: "Tic Tac Toe",
    category: "Strategy",
    difficulty: "easy",
    playTime: "2-5 min",
    skills: ["strategy", "logic"],
    icon: "⭕",
    bg: "bg-blue",
    description: "The classic two-player strategy game. Take turns placing X and O on a 3×3 grid. Get three in a row to win!",
    instructions: "Click on any empty cell to place your mark. You play as X against the computer (O). Get three marks in a row — horizontally, vertically, or diagonally — to win.",
    benefits: "Develops strategic thinking, pattern recognition, and anticipation of opponent moves.",
    ageGroup: "All ages (5+)",
    faq: [
      { q: "Can I play against another person?", a: "Currently the game is player vs computer. The AI provides a moderate challenge." },
      { q: "Is there a strategy to always win?", a: "The first player can guarantee at least a draw with perfect play by starting in the center or a corner." },
      { q: "What happens when the board is full?", a: "If neither player gets three in a row, the game ends in a draw." }
    ],
    popular: true, featured: true
  },
  {
    id: "snake",
    name: "Snake",
    category: "Arcade",
    difficulty: "medium",
    playTime: "5-15 min",
    skills: ["reflex", "focus"],
    icon: "🐍",
    bg: "bg-green",
    description: "Guide the snake to eat food and grow longer. Avoid hitting the walls or your own tail in this classic arcade game.",
    instructions: "Use arrow keys or swipe to change direction. Eat the red food to grow and earn points. Don't hit the walls or yourself!",
    benefits: "Improves reaction time, spatial awareness, and hand-eye coordination.",
    ageGroup: "All ages (6+)",
    faq: [
      { q: "How do I control the snake on mobile?", a: "Swipe in the direction you want the snake to move." },
      { q: "Does the snake speed up?", a: "Yes, the snake gets faster as you eat more food, increasing the challenge." },
      { q: "What's a good score?", a: "Getting above 100 points shows solid skill. Expert players can reach 200+." }
    ],
    popular: true, featured: true
  },
  {
    id: "memory-match",
    name: "Memory Match",
    category: "Memory",
    difficulty: "easy",
    playTime: "3-8 min",
    skills: ["memory", "focus"],
    icon: "🃏",
    bg: "bg-purple",
    description: "Flip cards to find matching pairs. Test and train your visual memory with this classic concentration game.",
    instructions: "Click on cards to flip them over. Find all matching pairs with the fewest moves. Remember what you've seen!",
    benefits: "Strengthens short-term memory, concentration, and visual recognition skills.",
    ageGroup: "All ages (4+)",
    faq: [
      { q: "How many pairs are there?", a: "The standard game has 8 pairs (16 cards). Try to match them all!" },
      { q: "Is there a time limit?", a: "No time limit — focus on minimizing the number of moves." },
      { q: "Does the game track my best score?", a: "Yes, your best (lowest) number of moves is tracked during the current session." }
    ],
    popular: true, featured: true
  },
  {
    id: "2048",
    name: "2048",
    category: "Puzzle",
    difficulty: "medium",
    playTime: "10-30 min",
    skills: ["strategy", "math", "logic"],
    icon: "🔢",
    bg: "bg-yellow",
    description: "Slide numbered tiles on a grid to combine them and reach the 2048 tile. A addictive number puzzle that tests strategy.",
    instructions: "Use arrow keys or swipe to slide all tiles. When two tiles with the same number collide, they merge into one. Reach 2048 to win!",
    benefits: "Enhances mathematical thinking, strategic planning, and spatial reasoning.",
    ageGroup: "Ages 8+",
    faq: [
      { q: "What happens after I reach 2048?", a: "You can keep playing to achieve higher tiles and scores!" },
      { q: "Is there a strategy?", a: "Keep your highest tile in a corner and build a chain of decreasing values." },
      { q: "Can I undo a move?", a: "No undo is available — think carefully before each move!" }
    ],
    popular: true, featured: true
  },
  {
    id: "minesweeper",
    name: "Minesweeper",
    category: "Logic",
    difficulty: "medium",
    playTime: "5-15 min",
    skills: ["logic", "strategy"],
    icon: "💣",
    bg: "bg-red",
    description: "Clear the minefield without detonating any mines. Use number clues to determine where mines are hidden.",
    instructions: "Left-click to reveal a cell. Numbers show how many adjacent cells contain mines. Right-click to flag suspected mines. Reveal all safe cells to win.",
    benefits: "Develops logical deduction, probability assessment, and systematic problem-solving.",
    ageGroup: "Ages 8+",
    faq: [
      { q: "How many mines are there?", a: "The beginner board has 10 mines on a 9×9 grid." },
      { q: "What does the number mean?", a: "Each number tells you how many of the 8 surrounding cells contain mines." },
      { q: "Can the first click be a mine?", a: "No! The first click is always safe." }
    ],
    popular: true
  },
  {
    id: "sudoku",
    name: "Sudoku",
    category: "Number Puzzle",
    difficulty: "hard",
    playTime: "15-45 min",
    skills: ["logic", "math", "focus"],
    icon: "🔷",
    bg: "bg-indigo",
    description: "Fill a 9×9 grid so that each row, column, and 3×3 box contains all digits from 1 to 9. The ultimate logic puzzle.",
    instructions: "Click a cell and enter a number 1-9. Each number must appear exactly once in each row, column, and 3×3 box. Pre-filled numbers cannot be changed.",
    benefits: "Strengthens logical reasoning, pattern recognition, concentration, and patience.",
    ageGroup: "Ages 10+",
    faq: [
      { q: "Is there always one solution?", a: "Yes, every puzzle generated has exactly one valid solution." },
      { q: "Can I get a hint?", a: "Use the Hint button to reveal one correct cell." },
      { q: "How is difficulty determined?", a: "Harder puzzles have fewer starting numbers and require more advanced solving techniques." }
    ],
    popular: true
  },
  {
    id: "sliding-puzzle",
    name: "Sliding Puzzle",
    category: "Puzzle",
    difficulty: "medium",
    playTime: "5-15 min",
    skills: ["spatial", "logic", "strategy"],
    icon: "🧩",
    bg: "bg-teal",
    description: "Slide tiles into the correct order by moving them into the empty space. A classic spatial reasoning challenge.",
    instructions: "Click a tile adjacent to the empty space to slide it. Arrange all numbers in order from 1 to 15 to solve the puzzle.",
    benefits: "Improves spatial reasoning, sequential thinking, and problem-solving skills.",
    ageGroup: "Ages 6+",
    faq: [
      { q: "Is every puzzle solvable?", a: "Yes, the game only generates solvable configurations." },
      { q: "What's a good move count?", a: "Solving the 15-puzzle in under 80 moves is excellent." },
      { q: "How do I get faster?", a: "Learn to solve the top row first, then the second row, then the remaining 2×3 section." }
    ]
  },
  {
    id: "maze",
    name: "Maze Runner",
    category: "Puzzle",
    difficulty: "medium",
    playTime: "3-10 min",
    skills: ["spatial", "focus", "strategy"],
    icon: "🏁",
    bg: "bg-orange",
    description: "Navigate through a randomly generated maze from start to finish. Test your spatial awareness and pathfinding skills.",
    instructions: "Use arrow keys or WASD to move through the maze. Find the path from the green start to the red finish.",
    benefits: "Enhances spatial navigation, planning ahead, and visual-spatial processing.",
    ageGroup: "All ages (5+)",
    faq: [
      { q: "Is every maze solvable?", a: "Yes, every generated maze has at least one path from start to finish." },
      { q: "Can I get a new maze?", a: "Click the Restart button to generate a fresh maze." },
      { q: "Does it get harder?", a: "Each new maze is randomly generated with varying complexity." }
    ]
  },
  {
    id: "paint",
    name: "Paint & Draw",
    category: "Creative",
    difficulty: "easy",
    playTime: "5-30 min",
    skills: ["creativity"],
    icon: "🎨",
    bg: "bg-pink",
    description: "Express your creativity with this simple drawing tool. Choose colors, brush sizes, and create digital artwork.",
    instructions: "Click and drag to draw. Use the color picker and brush size controls. Save your artwork or clear the canvas to start fresh.",
    benefits: "Encourages creative expression, fine motor skills, and relaxation.",
    ageGroup: "All ages (3+)",
    faq: [
      { q: "Can I save my drawing?", a: "Yes, click the Save button to download your artwork as an image." },
      { q: "Can I undo mistakes?", a: "Use the Undo button to remove your last stroke." },
      { q: "What tools are available?", a: "Brush, eraser, color picker, and brush size adjustment." }
    ]
  },
  {
    id: "color-match",
    name: "Color Match",
    category: "Reflex",
    difficulty: "easy",
    playTime: "2-5 min",
    skills: ["reflex", "focus"],
    icon: "🎯",
    bg: "bg-cyan",
    description: "Test your visual processing speed! Quickly determine if the displayed color matches the word shown. Fast-paced and fun.",
    instructions: "A color name is shown in a colored font. Press YES if the font color matches the word, or NO if it doesn't. Be fast — you're on the clock!",
    benefits: "Improves cognitive flexibility, processing speed, and the ability to handle conflicting information (Stroop effect).",
    ageGroup: "Ages 7+",
    faq: [
      { q: "Why is this game challenging?", a: "It exploits the Stroop effect — your brain automatically reads the word, making it harder to identify the font color." },
      { q: "How is the score calculated?", a: "You earn points for correct answers. Speed bonuses are awarded for quick responses." },
      { q: "Is there a time limit?", a: "Yes, each round lasts 30 seconds. Score as many points as you can!" }
    ]
  },
  {
    id: "reflex-test",
    name: "Reflex Test",
    category: "Reflex",
    difficulty: "easy",
    playTime: "1-3 min",
    skills: ["reflex"],
    icon: "⚡",
    bg: "bg-yellow",
    description: "Measure your reaction time! Wait for the signal and click as fast as you can. Compare your results across attempts.",
    instructions: "Wait for the screen to turn green, then click as fast as possible. Your reaction time is measured in milliseconds. Try 5 rounds to get your average.",
    benefits: "Tests and improves reaction speed, alertness, and hand-eye coordination.",
    ageGroup: "All ages (6+)",
    faq: [
      { q: "What's a good reaction time?", a: "Average is 200-300ms. Under 200ms is excellent. Athletes often score below 180ms." },
      { q: "How many rounds do I play?", a: "Five rounds are played and your average reaction time is calculated." },
      { q: "What if I click too early?", a: "Clicking before the signal counts as a false start and that round is reset." }
    ]
  },
  {
    id: "word-search",
    name: "Word Search",
    category: "Word",
    difficulty: "medium",
    playTime: "5-15 min",
    skills: ["focus", "memory"],
    icon: "🔤",
    bg: "bg-blue",
    description: "Find hidden words in a grid of letters. Words can be placed horizontally, vertically, or diagonally.",
    instructions: "Click and drag across letters to select a word. Find all the hidden words listed beside the grid to complete the puzzle.",
    benefits: "Enhances vocabulary, pattern recognition, and visual scanning abilities.",
    ageGroup: "Ages 8+",
    faq: [
      { q: "In which directions can words go?", a: "Words can be placed horizontally (left/right), vertically (up/down), and diagonally." },
      { q: "Is there a timer?", a: "A timer tracks how quickly you find all words, but there's no time limit." },
      { q: "Are the word lists random?", a: "The game features themed word lists that change each time you play." }
    ]
  },
  {
    id: "tetris",
    name: "Block Stack",
    category: "Arcade",
    difficulty: "medium",
    playTime: "5-20 min",
    skills: ["spatial", "reflex", "strategy"],
    icon: "🟦",
    bg: "bg-indigo",
    description: "Stack falling blocks to complete full horizontal lines. Lines disappear when completed. How long can you last?",
    instructions: "Use arrow keys to move and rotate falling pieces. Down arrow speeds up the drop. Complete horizontal lines to clear them and score points.",
    benefits: "Develops spatial reasoning, quick decision-making, and pattern recognition.",
    ageGroup: "All ages (6+)",
    faq: [
      { q: "What are the controls?", a: "Left/Right arrows move the piece, Up arrow rotates, Down arrow soft-drops, Space bar hard-drops." },
      { q: "How does scoring work?", a: "Clearing multiple lines at once gives bonus points. Four lines at once (a Tetris) gives the highest bonus." },
      { q: "Does it speed up?", a: "Yes, pieces fall faster as you clear more lines, increasing the challenge." }
    ],
    popular: true
  },
  {
    id: "pac-man",
    name: "Pac-Man",
    category: "Arcade",
    difficulty: "medium",
    playTime: "5-15 min",
    skills: ["reflex", "strategy", "spatial"],
    icon: "👾",
    bg: "bg-yellow",
    description: "Navigate the maze, eat all the dots, and avoid the ghosts! Eat power pellets to turn the tables and chase the ghosts.",
    instructions: "Use arrow keys or WASD to move. Eat all dots to complete the level. Avoid ghosts — or eat a power pellet to chase them for bonus points!",
    benefits: "Improves reaction time, strategic planning, and spatial navigation under pressure.",
    ageGroup: "All ages (6+)",
    faq: [
      { q: "How do power pellets work?", a: "Eating a large flashing dot makes ghosts vulnerable (blue) for a short time. Eat them for bonus points!" },
      { q: "How many ghosts are there?", a: "There are 4 ghosts, each with slightly different behavior patterns." },
      { q: "What happens when I eat all dots?", a: "The level resets with all dots restored, and the game continues with increasing difficulty." }
    ],
    popular: true
  },
  {
    id: "number-puzzle",
    name: "Number Crunch",
    category: "Number Puzzle",
    difficulty: "medium",
    playTime: "3-10 min",
    skills: ["math", "logic"],
    icon: "🧮",
    bg: "bg-green",
    description: "Solve arithmetic puzzles by finding the right combination of numbers and operations to reach the target number.",
    instructions: "Use the given numbers and basic operations (+, -, ×, ÷) to reach the target number. Each number can only be used once.",
    benefits: "Strengthens mental arithmetic, number sense, and mathematical problem-solving.",
    ageGroup: "Ages 8+",
    faq: [
      { q: "Do I have to use all numbers?", a: "No, you can use any subset of the given numbers." },
      { q: "Is there always a solution?", a: "Yes, every puzzle has at least one valid solution." },
      { q: "Can I use a number more than once?", a: "No, each number card can only be used once in your calculation." }
    ]
  },
  {
    id: "logic-puzzle",
    name: "Pattern Quest",
    category: "Logic",
    difficulty: "medium",
    playTime: "3-8 min",
    skills: ["logic", "memory"],
    icon: "🧠",
    bg: "bg-purple",
    description: "Identify the pattern in a sequence of shapes, colors, or numbers and select what comes next. Train your analytical mind!",
    instructions: "Look at the sequence and determine the pattern. Select the correct next element from the options. Patterns can involve shape, color, rotation, or number sequences.",
    benefits: "Develops pattern recognition, analytical thinking, and inductive reasoning.",
    ageGroup: "Ages 7+",
    faq: [
      { q: "What kinds of patterns are used?", a: "Patterns include shape sequences, color cycles, number progressions, and rotation patterns." },
      { q: "How many levels are there?", a: "The game generates new patterns each time, with increasing complexity." },
      { q: "Is there a time bonus?", a: "Yes, answering quickly earns bonus points." }
    ]
  },
  {
    id: "flash-memory",
    name: "Flash Memory",
    category: "Memory",
    difficulty: "medium",
    playTime: "3-8 min",
    skills: ["memory", "focus"],
    icon: "💡",
    bg: "bg-orange",
    description: "Watch the sequence of flashing lights and repeat it back. Each round adds one more step. How far can you go?",
    instructions: "Watch the colored buttons flash in sequence, then repeat the pattern by clicking them in the same order. The sequence grows longer each round.",
    benefits: "Trains working memory, attention span, and sequential recall.",
    ageGroup: "Ages 5+",
    faq: [
      { q: "How long do sequences get?", a: "Sequences start at length 3 and grow by one each round. Expert players can reach 15+!" },
      { q: "What happens if I make a mistake?", a: "The game ends and your score is the last completed sequence length." },
      { q: "Is this like Simon Says?", a: "Yes! It's inspired by the classic Simon electronic memory game." }
    ],
    popular: true
  }
];

const CATEGORIES = [
  { id: "all", name: "All Games", icon: "🎮", count: GAMES.length },
  { id: "arcade", name: "Arcade", icon: "👾", match: "Arcade" },
  { id: "puzzle", name: "Puzzle", icon: "🧩", match: "Puzzle" },
  { id: "strategy", name: "Strategy", icon: "♟️", match: "Strategy" },
  { id: "memory", name: "Memory", icon: "🧠", match: "Memory" },
  { id: "logic", name: "Logic", icon: "🔍", match: "Logic" },
  { id: "number", name: "Number", icon: "🔢", match: "Number Puzzle" },
  { id: "word", name: "Word", icon: "🔤", match: "Word" },
  { id: "reflex", name: "Reflex", icon: "⚡", match: "Reflex" },
  { id: "creative", name: "Creative", icon: "🎨", match: "Creative" }
];

CATEGORIES.forEach(c => {
  if (c.match) c.count = GAMES.filter(g => g.category === c.match).length;
});

const SKILLS = ["memory", "logic", "focus", "reflex", "strategy", "creativity", "math", "spatial"];

function getGameById(id) {
  return GAMES.find(g => g.id === id);
}

function getGamesByCategory(cat) {
  if (cat === "all") return [...GAMES];
  const category = CATEGORIES.find(c => c.id === cat);
  return category ? GAMES.filter(g => g.category === category.match) : [];
}

function getPopularGames() {
  return GAMES.filter(g => g.popular);
}

function getFeaturedGames() {
  return GAMES.filter(g => g.featured);
}

function searchGames(query) {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return GAMES.filter(g =>
    g.name.toLowerCase().includes(q) ||
    g.category.toLowerCase().includes(q) ||
    g.skills.some(s => s.includes(q)) ||
    g.description.toLowerCase().includes(q)
  );
}

function filterGames({ category, difficulty, skill, search }) {
  let results = [...GAMES];
  if (category && category !== "all") {
    const cat = CATEGORIES.find(c => c.id === category);
    if (cat) results = results.filter(g => g.category === cat.match);
  }
  if (difficulty) results = results.filter(g => g.difficulty === difficulty);
  if (skill) results = results.filter(g => g.skills.includes(skill));
  if (search) {
    const q = search.toLowerCase();
    results = results.filter(g =>
      g.name.toLowerCase().includes(q) ||
      g.category.toLowerCase().includes(q) ||
      g.description.toLowerCase().includes(q)
    );
  }
  return results;
}
