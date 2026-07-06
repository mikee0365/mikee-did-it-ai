# Mikee Did It AI — Instructor Check Upgrade

This version adds an **Instructor Check** block to the existing Mikee Did It app.

## What it does

1. Humanize or rephrase text.
2. Keep the chosen result in the output box.
3. Select assignment type and course level.
4. Optionally paste the instructor's directions or grading rubric.
5. Click **Check This Result**.

The app returns:

- Estimated percentage grade
- Estimated letter grade
- Confidence level
- Overall instructor-style feedback
- Five-part rubric breakdown
- Three strengths
- Three top improvements

## Important

The estimated grade is AI-generated feedback only. It is not an official grade and may differ from the actual instructor's evaluation.

## Environment variables

Set these on Railway:

```text
OPENAI_API_KEY=your_secret_key
OPENAI_MODEL=your_supported_model_name
PORT=3000
```

## Start locally

```bash
npm install
npm start
```
