import { useState, useRef, useEffect } from 'react';
import { useGame } from './hooks/useGame';
import type { Difficulty } from './types';
import { DIFFICULTIES } from './types';
import './App.css';

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function App() {
  const { difficulty, config, history, status, secret, submitGuess, newGame, playHistory, clearHistory } = useGame();
  const [inputs, setInputs] = useState<string[]>(Array(config.digits).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const historyEndRef = useRef<HTMLDivElement | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  // Reset inputs on new game
  useEffect(() => {
    if (history.length === 0) {
      setInputs(Array(config.digits).fill(''));
    }
  }, [config.digits, history.length]);

  // Auto-scroll to latest guess
  useEffect(() => {
    historyEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history.length]);

  const handleInput = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...inputs];
    next[index] = value;
    setInputs(next);
    if (value && index < config.digits - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !inputs[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (inputs.some(v => v === '')) return;
    const guess = inputs.map(Number);
    if (new Set(guess).size !== guess.length) return;
    submitGuess(guess);
    setInputs(Array(config.digits).fill(''));
    inputRefs.current[0]?.focus();
  };

  const handleNewGame = (diff?: Difficulty) => {
    newGame(diff);
    setInputs(Array(DIFFICULTIES[diff ?? difficulty].digits).fill(''));
    setTimeout(() => inputRefs.current[0]?.focus(), 50);
  };

  const guessIsValid = inputs.every(v => v !== '') && new Set(inputs).size === inputs.length;
  const remaining = config.maxGuesses - history.length;

  return (
    <div className="app">
      <header className="header">
        <h1>Numble</h1>
        <p className="subtitle">Crack the {config.digits}-digit code</p>
      </header>

      <div className="difficulty-bar">
        {(Object.keys(DIFFICULTIES) as Difficulty[]).map(d => (
          <button
            key={d}
            className={`diff-btn ${d === difficulty ? 'active' : ''}`}
            onClick={() => handleNewGame(d)}
          >
            <span className="diff-label">{DIFFICULTIES[d].label}</span>
            <span className="diff-desc">{DIFFICULTIES[d].description}</span>
          </button>
        ))}
      </div>

      <div className="legend">
        {config.hintMode === 'full' ? (
          <>
            <span className="legend-item">
              <span className="dot bull-dot" /> Correct position
            </span>
            <span className="legend-item">
              <span className="dot cow-dot" /> Wrong position
            </span>
            <span className="legend-item">
              <span className="dot miss-dot" /> Not in number
            </span>
          </>
        ) : (
          <span className="legend-item">Only shows how many digits are in the answer</span>
        )}
      </div>

      <div className="game-area">
        <div className="history">
          {history.length === 0 && status === 'playing' && (
            <div className="empty-state">
              <p>Enter {config.digits} unique digits (0-9) to start guessing</p>
            </div>
          )}
          {history.map((result, i) => (
            <div key={i} className="guess-row" style={{ animationDelay: `${0}ms` }}>
              <span className="guess-number">#{i + 1}</span>
              <div className="guess-digits">
                {result.guess.map((d, j) => {
                  let cls = 'digit';
                  if (config.hintMode === 'full') {
                    if (d === secret[j]) cls += ' bull';
                    else if (secret.includes(d)) cls += ' cow';
                    else cls += ' miss';
                  } else {
                    cls += (result.bulls === config.digits) ? ' bull' : ' neutral';
                  }
                  return <span key={j} className={cls}>{d}</span>;
                })}
              </div>
              {config.hintMode === 'full' ? (
                <>
                  <div className="result-dots">
                    {Array.from({ length: result.bulls }, (_, k) => (
                      <span key={`b${k}`} className="dot bull-dot" />
                    ))}
                    {Array.from({ length: result.cows }, (_, k) => (
                      <span key={`c${k}`} className="dot cow-dot" />
                    ))}
                    {Array.from({ length: config.digits - result.bulls - result.cows }, (_, k) => (
                      <span key={`m${k}`} className="dot miss-dot" />
                    ))}
                  </div>
                  <span className="result-text">
                    {result.bulls}A {result.cows}B
                  </span>
                </>
              ) : (
                <span className="result-text count-hint">
                  {result.bulls} / {config.digits} match
                </span>
              )}
            </div>
          ))}
          <div ref={historyEndRef} />
        </div>

        {status !== 'playing' && (
          <div className={`status-banner ${status}`}>
            {status === 'won' ? (
              <>
                <div className="status-emoji">&#127881;</div>
                <div className="status-msg">
                  You cracked it in <strong>{history.length}</strong> {history.length === 1 ? 'guess' : 'guesses'}!
                </div>
              </>
            ) : (
              <>
                <div className="status-emoji">&#128064;</div>
                <div className="status-msg">
                  The answer was <strong>{secret.join(' ')}</strong>
                </div>
              </>
            )}
            <button className="play-again-btn" onClick={() => handleNewGame()}>
              Play Again
            </button>
          </div>
        )}

        {status === 'playing' && (
          <div className="input-area">
            <div className="input-row">
              {inputs.map((v, i) => (
                <input
                  key={`${config.digits}-${i}`}
                  ref={el => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={v}
                  onChange={e => handleInput(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  className="digit-input"
                  autoFocus={i === 0}
                  placeholder="?"
                />
              ))}
            </div>
            <div className="input-actions">
              <button
                className="submit-btn"
                onClick={handleSubmit}
                disabled={!guessIsValid}
              >
                Guess
              </button>
              {config.maxGuesses !== Infinity && (
                <span className="remaining">
                  {remaining} {remaining === 1 ? 'try' : 'tries'} left
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="history-section">
        <button className="history-toggle" onClick={() => setHistoryOpen(o => !o)}>
          <span>History ({playHistory.length})</span>
          <span className={`toggle-arrow ${historyOpen ? 'open' : ''}`}>&#9662;</span>
        </button>
        {historyOpen && (
          <div className="history-panel">
            {playHistory.length === 0 ? (
              <p className="history-empty">No games played yet</p>
            ) : (
              <>
                <div className="history-records">
                  {[...playHistory].reverse().map((rec, i) => (
                    <div key={i} className="history-record">
                      <span className={`history-diff diff-${rec.difficulty}`}>
                        {DIFFICULTIES[rec.difficulty].label}
                      </span>
                      <span className={`history-outcome ${rec.won ? 'win' : 'loss'}`}>
                        {rec.won ? '✓' : '✗'}
                      </span>
                      <span className="history-guesses">
                        {rec.guesses} {rec.guesses === 1 ? 'guess' : 'guesses'}
                      </span>
                      <span className="history-time">{relativeTime(rec.timestamp)}</span>
                    </div>
                  ))}
                </div>
                <button className="history-clear" onClick={clearHistory}>Clear History</button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
