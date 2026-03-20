import { useState, useCallback } from 'react';
import type { Difficulty, GuessResult, GameStatus } from '../types';
import { DIFFICULTIES } from '../types';

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

export function useGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [secret, setSecret] = useState<number[]>(() => {
    const s = generateSecret(DIFFICULTIES.normal.digits);
    console.log('[Numble] Answer:', s.join(' '));
    return s;
  });
  const [history, setHistory] = useState<GuessResult[]>([]);
  const [status, setStatus] = useState<GameStatus>('playing');

  const config = DIFFICULTIES[difficulty];

  const submitGuess = useCallback((guess: number[]) => {
    if (status !== 'playing') return;

    const { bulls, cows } = evaluate(guess, secret);
    const result: GuessResult = { guess, bulls, cows };

    setHistory(prev => {
      const next = [...prev, result];
      if (bulls === config.digits) {
        setStatus('won');
      } else if (next.length >= config.maxGuesses) {
        setStatus('lost');
      }
      return next;
    });
  }, [status, secret, config]);

  const newGame = useCallback((diff?: Difficulty) => {
    const d = diff ?? difficulty;
    if (diff) setDifficulty(d);
    const s = generateSecret(DIFFICULTIES[d].digits);
    console.log('[Numble] Answer:', s.join(' '));
    setSecret(s);
    setHistory([]);
    setStatus('playing');
  }, [difficulty]);

  return { difficulty, config, history, status, secret, submitGuess, newGame };
}
