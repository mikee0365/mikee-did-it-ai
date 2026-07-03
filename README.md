# Mikee Did It AI

This is a simple AI writing web app with:

- AI Humanizer
- Rephraser
- AI-likeness checker
- OpenAI API backend using Node.js and Express

## Important AI Checker Note

The AI checker gives an estimate only. It is not proof that text was written by AI. AI detectors can be wrong and should not be used to accuse students, employees, or writers.

## Setup

1. Install Node.js from https://nodejs.org
2. Open this folder in VS Code or your terminal.
3. Install dependencies:

```bash
npm install
```

4. Rename `.env.example` to `.env`.
5. Add your OpenAI API key inside `.env`:

```bash
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_MODEL=gpt-5.5
PORT=3000
```

6. Start the app:

```bash
npm start
```

7. Open this in your browser:

```text
http://localhost:3000
```

## Deploying Online

Do not host this as only static HTML because your API key must stay secret. Use a backend host such as Render, Railway, Fly.io, or another Node.js server host. Add your `OPENAI_API_KEY` as an environment variable in the host dashboard.
