export type Difficulty = 'easy' | 'normal' | 'hard';

// full: show both correct position (A) and wrong position (B)
// count: show only total matching digits count, no position info
export type HintMode = 'full' | 'count';

export interface DifficultyConfig {
  label: string;
  digits: number;
  maxGuesses: number;
  hintMode: HintMode;
  description: string;
}

export const DIFFICULTIES: Record<Difficulty, DifficultyConfig> = {
  easy: {
    label: 'Easy',
    digits: 3,
    maxGuesses: 15,
    hintMode: 'full',
    description: '3 digits, full hints',
  },
  normal: {
    label: 'Normal',
    digits: 4,
    maxGuesses: 10,
    hintMode: 'full',
    description: '4 digits, full hints',
  },
  hard: {
    label: 'Hard',
    digits: 4,
    maxGuesses: Infinity,
    hintMode: 'count',
    description: '4 digits, count only',
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
