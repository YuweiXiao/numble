import { useState, useRef, useEffect } from 'react';
import { useGame } from './hooks/useGame';
import type { Difficulty } from './types';
import { DIFFICULTIES } from './types';
import { useLang } from './i18n-context';
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

function useKeyboardState(appRef: React.RefObject<HTMLDivElement | null>) {
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const threshold = 150;
    let wasOpen = false;

    const onResize = () => {
      const isOpen = window.innerHeight - vv.height > threshold;

      // Only act on keyboard open/close transitions — ignore fluctuations during typing
      if (isOpen !== wasOpen) {
        wasOpen = isOpen;
        const el = appRef.current;
        if (el) {
          if (isOpen) {
            el.style.height = `${vv.height}px`;
            el.style.maxHeight = `${vv.height}px`;
          } else {
            el.style.height = '';
            el.style.maxHeight = '';
          }
        }
        setKeyboardOpen(isOpen);
      }
    };

    vv.addEventListener('resize', onResize);
    return () => vv.removeEventListener('resize', onResize);
  }, [appRef]);

  return keyboardOpen;
}

const DIFF_LABELS: Record<Difficulty, { label: 'easyLabel' | 'normalLabel' | 'hardLabel'; desc: 'easyDesc' | 'normalDesc' | 'hardDesc' }> = {
  easy: { label: 'easyLabel', desc: 'easyDesc' },
  normal: { label: 'normalLabel', desc: 'normalDesc' },
  hard: { label: 'hardLabel', desc: 'hardDesc' },
};

type Tab = 'play' | 'info';

function App() {
  const { difficulty, config, history, status, secret, submitGuess, newGame, playHistory, clearHistory } = useGame();
  const [inputs, setInputs] = useState<string[]>(Array(config.digits).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const historyRef = useRef<HTMLDivElement | null>(null);
  const appRef = useRef<HTMLDivElement | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('play');
  const { t, lang, toggleLang } = useLang();
  const keyboardOpen = useKeyboardState(appRef);

  useEffect(() => {
    if (history.length === 0) {
      setInputs(Array(config.digits).fill(''));
    }
  }, [config.digits, history.length]);

  useEffect(() => {
    const el = historyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
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

  const allFilled = inputs.every(v => v !== '');
  const hasDuplicates = allFilled && new Set(inputs).size !== inputs.length;
  const guessIsValid = allFilled && !hasDuplicates;
  const remaining = config.maxGuesses - history.length;

  return (
    <div
      ref={appRef}
      className={`app ${keyboardOpen ? 'keyboard-open' : ''}`}
    >
      <header className="header hide-on-keyboard">
        <div className="header-top">
          <h1>{t.title}</h1>
          <button className="lang-toggle" onClick={toggleLang}>
            {lang === 'en' ? '中文' : 'EN'}
          </button>
        </div>
        <p className="subtitle">{t.subtitle(config.digits)}</p>
      </header>

      <div className="tab-bar hide-on-keyboard">
        <button
          className={`tab-btn ${activeTab === 'play' ? 'active' : ''}`}
          onClick={() => setActiveTab('play')}
        >
          {t.tabPlay}
        </button>
        <button
          className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`}
          onClick={() => setActiveTab('info')}
        >
          {t.tabInfo}
        </button>
      </div>

      {activeTab === 'play' && (
        <>
          <div className="legend hide-on-keyboard">
            {config.hintMode === 'full' ? (
              <>
                <span className="legend-item">
                  <span className="dot bull-dot" /> {t.correctPosition}
                </span>
                <span className="legend-item">
                  <span className="dot cow-dot" /> {t.wrongPosition}
                </span>
                <span className="legend-item">
                  <span className="dot miss-dot" /> {t.notInNumber}
                </span>
              </>
            ) : (
              <span className="legend-item">{t.countHint}</span>
            )}
          </div>

          <div className="game-area">
            <div className="history" ref={historyRef}>
              {history.length === 0 && status === 'playing' && (
                <div className="empty-state">
                  <p>{t.emptyState(config.digits)}</p>
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
                      {t.match(result.bulls, config.digits)}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {status !== 'playing' && (
              <div className={`status-banner ${status}`}>
                {status === 'won' ? (
                  <>
                    <div className="status-emoji">&#127881;</div>
                    <div className="status-msg" dangerouslySetInnerHTML={{ __html: t.wonMsg(history.length) }} />
                  </>
                ) : (
                  <>
                    <div className="status-emoji">&#128064;</div>
                    <div className="status-msg" dangerouslySetInnerHTML={{ __html: t.lostMsg(secret.join(' ')) }} />
                  </>
                )}
                <button className="play-again-btn" onClick={() => handleNewGame()}>
                  {t.playAgain}
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
                      type="tel"
                      maxLength={1}
                      value={v}
                      onChange={e => handleInput(i, e.target.value)}
                      onKeyDown={e => handleKeyDown(i, e)}
                      className="digit-input"
                      autoFocus={i === 0}
                      autoComplete="one-time-code"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck={false}
                      enterKeyHint="done"
                      placeholder="?"
                    />
                  ))}
                </div>
                {hasDuplicates && (
                  <p className="duplicate-warning">{t.duplicateWarning}</p>
                )}
                <div className="input-actions">
                  <button
                    className="submit-btn"
                    onPointerDown={e => { e.preventDefault(); handleSubmit(); }}
                    disabled={!guessIsValid}
                  >
                    {t.guessBtn}
                  </button>
                  {config.maxGuesses !== Infinity && (
                    <span className="remaining">
                      {t.triesLeft(remaining)}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="difficulty-bar hide-on-keyboard">
            {(Object.keys(DIFFICULTIES) as Difficulty[]).map(d => (
              <button
                key={d}
                className={`diff-btn ${d === difficulty ? 'active' : ''}`}
                onClick={() => handleNewGame(d)}
              >
                <span className="diff-label">{t[DIFF_LABELS[d].label]}</span>
                <span className="diff-desc">{t[DIFF_LABELS[d].desc]}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {activeTab === 'info' && (
        <div className="info-tab">
          <div className="info-section">
            <h2 className="info-heading">{t.howToPlay}</h2>
            <div className="instructions-panel">
              {t.instructions.map((line, i) => (
                <p key={i}>{line}</p>
              ))}
              <div className="instructions-group">
                {t.instructionsFull.map((line, i) => (
                  <p key={i} className={i === 0 ? 'instructions-heading' : 'instructions-detail'}>
                    {i === 1 && <span className="dot bull-dot" />}
                    {i === 2 && <span className="dot cow-dot" />}
                    {i === 3 && <span className="dot miss-dot" />}
                    {line}
                  </p>
                ))}
              </div>
              <div className="instructions-group">
                {t.instructionsCount.map((line, i) => (
                  <p key={i} className={i === 0 ? 'instructions-heading' : 'instructions-detail'}>{line}</p>
                ))}
              </div>
              <div className="instructions-group">
                {t.instructionsDifficulty.map((line, i) => (
                  <p key={i} className={i === 0 ? 'instructions-heading' : 'instructions-detail'}>{line}</p>
                ))}
              </div>
            </div>
          </div>

          <div className="info-section">
            <h2 className="info-heading">{t.history(playHistory.length)}</h2>
            {playHistory.length === 0 ? (
              <p className="history-empty">{t.noGames}</p>
            ) : (
              <>
                <div className="history-records">
                  {[...playHistory].reverse().map((rec, i) => (
                    <div key={i} className="history-record">
                      <span className={`history-diff diff-${rec.difficulty}`}>
                        {t[DIFF_LABELS[rec.difficulty].label]}
                      </span>
                      <span className={`history-outcome ${rec.won ? 'win' : 'loss'}`}>
                        {rec.won ? '\u2713' : '\u2717'}
                      </span>
                      <span className="history-guesses">
                        {t.guess(rec.guesses)}
                      </span>
                      <span className="history-time">{relativeTime(rec.timestamp)}</span>
                    </div>
                  ))}
                </div>
                <button className="history-clear" onClick={clearHistory}>{t.clearHistory}</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
