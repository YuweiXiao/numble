export type Difficulty = 'easy' | 'normal' | 'hard';

// full: show both correct position (A) and wrong position (B)
// count: show only total matching digits count, no position info
export type HintMode = 'full' | 'count';

export interface DifficultyConfig {
  digits: number;
  maxGuesses: number;
  hintMode: HintMode;
}

export const DIFFICULTIES: Record<Difficulty, DifficultyConfig> = {
  easy: {
    digits: 3,
    maxGuesses: 15,
    hintMode: 'full',
  },
  normal: {
    digits: 4,
    maxGuesses: 10,
    hintMode: 'full',
  },
  hard: {
    digits: 4,
    maxGuesses: Infinity,
    hintMode: 'count',
  },
};

export interface GuessResult {
  guess: number[];
  bulls: number; // correct digit in correct position
  cows: number;  // correct digit in wrong position
}

export type GameStatus = 'playing' | 'won' | 'lost';

export interface GameRecord {
  difficulty: Difficulty;
  won: boolean;
  guesses: number;
  timestamp: number;
}
