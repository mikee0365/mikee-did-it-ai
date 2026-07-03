# Deploy Mikee Did It AI on Render

## What I can and cannot do
I cannot log in to your GitHub, Render, or OpenAI account for you. Do not share your OpenAI API key with anyone. This folder is already prepared for Render with `render.yaml`.

## Fast deploy steps

1. Create a GitHub repository named `mikee-did-it-ai`.
2. Upload the files from this folder to the repository. Make sure `package.json`, `server.js`, and `render.yaml` are at the top/root of the repo.
3. Go to Render.
4. Click **New** > **Web Service**.
5. Connect your GitHub account.
6. Choose the `mikee-did-it-ai` repository.
7. Render should detect the `render.yaml` settings.
8. In Environment Variables, add:

```text
OPENAI_API_KEY = your OpenAI API key
OPENAI_MODEL = gpt-5.5
```

9. Click **Deploy Web Service**.
10. When it finishes, open the Render link that looks like:

```text
https://mikee-did-it-ai.onrender.com
```

## Manual Render settings

If Render asks you to enter settings manually, use:

```text
Name: mikee-did-it-ai
Language/Runtime: Node
Build Command: npm install
Start Command: npm start
Plan: Free
```

Do not put your API key in `index.html`, `script.js`, or GitHub. Put it only in Render Environment Variables.

## Common errors

### OPENAI_API_KEY is missing
Go to Render > your service > Environment > add `OPENAI_API_KEY` > Save > redeploy.

### AI buttons fail but the website opens
Check Render Logs. Common causes are missing API key, wrong model name, or no OpenAI billing/credits.

### package.json not found
You uploaded the outer folder or zip incorrectly. The files `package.json`, `server.js`, and `render.yaml` must be at the root of the GitHub repo.
