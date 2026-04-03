export type Language = 'en' | 'zh';

const en = {
  // Header
  title: 'Numble',
  subtitle: (digits: number) => `Crack the ${digits}-digit code`,

  // Difficulty
  easyLabel: 'Easy',
  easyDesc: '3 digits, full hints',
  normalLabel: 'Normal',
  normalDesc: '4 digits, full hints',
  hardLabel: 'Hard',
  hardDesc: '4 digits, count only',

  // Legend
  correctPosition: 'Correct position',
  wrongPosition: 'Wrong position',
  notInNumber: 'Not in number',
  countHint: 'Only shows how many digits are in the answer',

  // Game
  emptyState: (digits: number) => `Enter ${digits} unique digits (0-9) to start guessing`,
  guessBtn: 'Guess',
  duplicateWarning: 'Each digit must be different',
  triesLeft: (n: number) => `${n} ${n === 1 ? 'try' : 'tries'} left`,
  match: (bulls: number, digits: number) => `${bulls} / ${digits} match`,

  // Status
  wonMsg: (n: number) => `You cracked it in <strong>${n}</strong> ${n === 1 ? 'guess' : 'guesses'}!`,
  lostMsg: (answer: string) => `The answer was <strong>${answer}</strong>`,
  playAgain: 'Play Again',

  // History panel
  history: (count: number) => `History (${count})`,
  noGames: 'No games played yet',
  guess: (n: number) => `${n} ${n === 1 ? 'guess' : 'guesses'}`,
  clearHistory: 'Clear History',

  // Instructions
  howToPlay: 'How to Play',
  instructions: [
    'Numble is a number-guessing game inspired by Mastermind / Bulls & Cows.',
    'Goal: guess the secret code made of unique digits (0-9). Each digit appears at most once.',
    'After each guess you get feedback:',
  ],
  instructionsFull: [
    'Full hint mode:',
    'Green (A) = correct digit in correct position',
    'Yellow (B) = correct digit in wrong position',
    'Gray = digit not in the code',
  ],
  instructionsCount: [
    'Count hint mode:',
    'Only tells you how many of your digits appear in the answer, without position info.',
  ],
  instructionsDifficulty: [
    'Difficulty levels:',
    'Easy — 3-digit code, 15 tries, full hints',
    'Normal — 4-digit code, 10 tries, full hints',
    'Hard — 4-digit code, unlimited tries, count-only hints',
  ],

  // Tabs
  tabPlay: 'Play',
  tabInfo: 'Info',

  // Language toggle
  langLabel: 'EN',
};

const zh: typeof en = {
  title: 'Numble',
  subtitle: (digits: number) => `破解 ${digits} 位数字密码`,

  easyLabel: '简单',
  easyDesc: '3位数，完整提示',
  normalLabel: '普通',
  normalDesc: '4位数，完整提示',
  hardLabel: '困难',
  hardDesc: '4位数，仅计数',

  correctPosition: '位置正确',
  wrongPosition: '位置错误',
  notInNumber: '不在密码中',
  countHint: '仅显示有多少个数字在答案中',

  emptyState: (digits: number) => `输入 ${digits} 个不重复数字（0-9）开始猜测`,
  guessBtn: '猜',
  duplicateWarning: '每个数字不能重复',
  triesLeft: (n: number) => `剩余 ${n} 次机会`,
  match: (bulls: number, digits: number) => `${bulls} / ${digits} 匹配`,

  wonMsg: (n: number) => `你用了 <strong>${n}</strong> 次猜中了！`,
  lostMsg: (answer: string) => `答案是 <strong>${answer}</strong>`,
  playAgain: '再来一局',

  history: (count: number) => `历史记录 (${count})`,
  noGames: '还没有游戏记录',
  guess: (n: number) => `${n} 次猜测`,
  clearHistory: '清除记录',

  howToPlay: '游戏说明',
  instructions: [
    'Numble 是一款数字猜谜游戏，灵感来自 Mastermind / 猜数字。',
    '目标：猜出由不重复数字（0-9）组成的密码，每个数字最多出现一次。',
    '每次猜测后会获得提示：',
  ],
  instructionsFull: [
    '完整提示模式：',
    '绿色（A）= 数字和位置都正确',
    '黄色（B）= 数字正确但位置错误',
    '灰色 = 数字不在密码中',
  ],
  instructionsCount: [
    '计数提示模式：',
    '仅显示你猜的数字中有多少个出现在答案里，不提供位置信息。',
  ],
  instructionsDifficulty: [
    '难度等级：',
    '简单 — 3位密码，15次机会，完整提示',
    '普通 — 4位密码，10次机会，完整提示',
    '困难 — 4位密码，无限次机会，仅计数提示',
  ],

  tabPlay: '游戏',
  tabInfo: '信息',

  langLabel: '中',
};

export const translations = { en, zh } as const;
