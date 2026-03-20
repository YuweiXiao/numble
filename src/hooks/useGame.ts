import { useState, useCallback } from 'react';
import type { Difficulty, GuessResult, GameStatus, GameRecord } from '../types';
import { DIFFICULTIES } from '../types';

const HISTORY_KEY = 'numble-history';

function generateSecret(digits: number): number[] {
  const available = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  const secret: number[] = [];
  for (let i = 0; i < digits; i++) {
    const idx = Math.floor(Math.random() * available.length);
    secret.push(available[idx]);
    available.splice(idx, 1);
  }
  return secret;
}

function evaluate(guess: number[], secret: number[]): { bulls: number; cows: number } {
  let bulls = 0;
  let cows = 0;
  for (let i = 0; i < guess.length; i++) {
    if (guess[i] === secret[i]) {
      bulls++;
    } else if (secret.includes(guess[i])) {
      cows++;
    }
  }
  return { bulls, cows };
}

function loadHistory(): GameRecord[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRecord(record: GameRecord) {
  const records = loadHistory();
  records.push(record);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(records));
}

export function useGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [secret, setSecret] = useState<number[]>(() => {
    const s = generateSecret(DIFFICULTIES.normal.digits);
    console.log('[Numble] Answer:', s.join(' '));
    return s;
  });
  const [history, setHistory] = useState<GuessResult[]>([]);
  const [status, setStatus] = useState<GameStatus>('playing');
  const [playHistory, setPlayHistory] = useState<GameRecord[]>(loadHistory);

  const config = DIFFICULTIES[difficulty];

  const submitGuess = useCallback((guess: number[]) => {
    if (status !== 'playing') return;

    const { bulls, cows } = evaluate(guess, secret);
    const result: GuessResult = { guess, bulls, cows };
    const next = [...history, result];

    setHistory(next);

    if (bulls === config.digits) {
      setStatus('won');
      const record: GameRecord = { difficulty, won: true, guesses: next.length, timestamp: Date.now() };
      saveRecord(record);
      setPlayHistory(loadHistory());
    } else if (next.length >= config.maxGuesses) {
      setStatus('lost');
      const record: GameRecord = { difficulty, won: false, guesses: next.length, timestamp: Date.now() };
      saveRecord(record);
      setPlayHistory(loadHistory());
    }
  }, [status, secret, config, difficulty, history]);

  const newGame = useCallback((diff?: Difficulty) => {
    const d = diff ?? difficulty;
    if (diff) setDifficulty(d);
    const s = generateSecret(DIFFICULTIES[d].digits);
    console.log('[Numble] Answer:', s.join(' '));
    setSecret(s);
    setHistory([]);
    setStatus('playing');
  }, [difficulty]);

  const clearHistory = useCallback(() => {
    localStorage.removeItem(HISTORY_KEY);
    setPlayHistory([]);
  }, []);

  return { difficulty, config, history, status, secret, submitGuess, newGame, playHistory, clearHistory };
}
