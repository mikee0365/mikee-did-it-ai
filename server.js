import 'dotenv/config';
import express from 'express';
import OpenAI from 'openai';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;
const model = process.env.OPENAI_MODEL || 'gpt-5.5';

if (!process.env.OPENAI_API_KEY) {
  console.warn('WARNING: OPENAI_API_KEY is missing. Add it to your environment variables.');
}

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

function cleanText(value) {
  return String(value || '').trim();
}

function validateInput(req, res) {
  const text = cleanText(req.body.text);

  if (!text) {
    res.status(400).json({ error: 'Please enter text first.' });
    return null;
  }

  if (text.length > 6000) {
    res.status(400).json({ error: 'Text is too long. Please keep it under 6,000 characters.' });
    return null;
  }

  return text;
}

async function generateText({ instructions, input }) {
  const response = await client.responses.create({
    model,
    instructions,
    input
  });

  return response.output_text?.trim() || 'No response generated.';
}

function parseJsonResponse(raw, fallback) {
  try {
    const match = raw.match(/\{[\s\S]*\}/);
    return JSON.parse(match ? match[0] : raw);
  } catch {
    return { ...fallback, raw_output: raw };
  }
}

app.post('/api/humanize', async (req, res) => {
  try {
    const text = validateInput(req, res);
    if (!text) return;

    const tone = cleanText(req.body.tone) || 'simple and natural';
    const output = await generateText({
      instructions: `You rewrite text so it sounds natural, clear, and human-written. Keep the original meaning. Use a ${tone} tone. Do not add fake facts. Avoid over-polishing.`,
      input: `Humanize this text:\n\n${text}`
    });

    res.json({ output });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'The AI humanizer failed. Check your API key, billing, model name, or server logs.' });
  }
});

app.post('/api/rephrase', async (req, res) => {
  try {
    const text = validateInput(req, res);
    if (!text) return;

    const style = cleanText(req.body.style) || 'clear and original';
    const output = await generateText({
      instructions: `You are a rephraser. Rewrite the text in a ${style} style while keeping the same meaning. Improve clarity, grammar, and flow. Do not add unsupported information.`,
      input: `Rephrase this text:\n\n${text}`
    });

    res.json({ output });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'The rephraser failed. Check your API key, billing, model name, or server logs.' });
  }
});

app.post('/api/check-ai', async (req, res) => {
  try {
    const text = validateInput(req, res);
    if (!text) return;

    const raw = await generateText({
      instructions: `You estimate how AI-like a passage appears. This is only a heuristic estimate, not proof. Return only valid JSON with these exact keys: ai_percentage, human_percentage, verdict, signals, warning. The signals value must be an array of 3 short strings. The warning must say the result is not definitive and should not be used to accuse someone of using AI.`,
      input: `Analyze this text for AI-likeness. Return a percentage from 0 to 100.\n\n${text}`
    });

    const result = parseJsonResponse(raw, {
      ai_percentage: null,
      human_percentage: null,
      verdict: 'Unable to calculate a clean score.',
      signals: ['The AI returned an unexpected format.', 'Try a longer passage.', 'Use this only as an estimate.'],
      warning: 'This result is not definitive and should not be used to accuse someone of using AI.'
    });

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'The AI checker failed. Check your API key, billing, model name, or server logs.' });
  }
});

app.post('/api/instructor-check', async (req, res) => {
  try {
    const text = validateInput(req, res);
    if (!text) return;

    const assignmentType = cleanText(req.body.assignmentType) || 'college assignment';
    const courseLevel = cleanText(req.body.courseLevel) || 'college freshman';
    const assignmentDirections = cleanText(req.body.assignmentDirections);

    if (assignmentDirections.length > 4000) {
      return res.status(400).json({ error: 'Assignment directions are too long. Please keep them under 4,000 characters.' });
    }

    const raw = await generateText({
      instructions: `Act as a careful but fair instructor evaluating student writing. Estimate how the submitted writing might be graded for the stated assignment type and course level. This is feedback only, not an official grade.

Return ONLY valid JSON with these exact keys:
estimated_percentage, estimated_letter_grade, confidence, overall_feedback, rubric_breakdown, strengths, top_improvements, warning.

Requirements:
- estimated_percentage: integer from 0 to 100.
- estimated_letter_grade: A, A-, B+, B, B-, C+, C, C-, D, or F.
- confidence: Low, Medium, or High.
- overall_feedback: 2-4 concise sentences in an instructor-like tone.
- rubric_breakdown: array of exactly 5 objects. Each object must have category, score, max_score, and feedback. Use these categories and maximums unless the supplied assignment directions clearly require something else: Content & Understanding (30), Organization & Coherence (20), Evidence & Support (20), Clarity & Style (15), Grammar & Mechanics (15). Scores must add up to estimated_percentage.
- strengths: array of exactly 3 short strings.
- top_improvements: array of exactly 3 specific, actionable short strings.
- warning: clearly state that this is an AI estimate and the actual instructor grade may differ.

Judge only the writing provided. Do not invent missing sources, requirements, or facts. If no assignment directions are provided, explain uncertainty through the confidence field and warning.`,
      input: `Assignment type: ${assignmentType}\nCourse level: ${courseLevel}\nAssignment directions or rubric: ${assignmentDirections || 'Not provided'}\n\nWriting to evaluate:\n${text}`
    });

    const result = parseJsonResponse(raw, {
      estimated_percentage: null,
      estimated_letter_grade: '--',
      confidence: 'Low',
      overall_feedback: 'The instructor check could not return a clean score.',
      rubric_breakdown: [],
      strengths: [],
      top_improvements: ['Try the check again.', 'Add assignment directions for a better estimate.', 'Review the writing manually before submitting.'],
      warning: 'This is an AI estimate only. Your actual instructor grade may differ.'
    });

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'The instructor check failed. Check your API key, billing, model name, or server logs.' });
  }
});

app.listen(port, () => {
  console.log(`Mikee Did It is running at http://localhost:${port}`);
});
