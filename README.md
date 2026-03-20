# Numble

A number guessing game. Crack the secret code in as few guesses as possible.

## How to Play

The system picks a secret number with unique digits (0-9). Each round, you guess a number and get feedback:

- **Easy** (3 digits) — shows which digits are correct and in the right position, which exist but in the wrong position, and which aren't in the answer at all
- **Normal** (4 digits) — same hints as Easy
- **Hard** (4 digits) — only tells you how many of your digits are in the answer, nothing about position

Win by guessing the exact number before you run out of tries.

## Run Locally

```bash
npm install
npm run dev
```

## Deploy

```bash
npm run build
```

Output goes to `dist/`. Works with Vercel (Vite preset), Netlify, or any static hosting.
