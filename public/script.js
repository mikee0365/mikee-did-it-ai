const tabs = document.querySelectorAll('.tab');
const inputText = document.getElementById('inputText');
const outputText = document.getElementById('outputText');
const runBtn = document.getElementById('runBtn');
const copyBtn = document.getElementById('copyBtn');
const statusText = document.getElementById('status');
const toneSelect = document.getElementById('toneSelect');
const selectLabel = document.getElementById('selectLabel');
const checkerResult = document.getElementById('checkerResult');
const outputWrap = document.getElementById('outputWrap');
const aiScore = document.getElementById('aiScore');
const humanScore = document.getElementById('humanScore');
const verdict = document.getElementById('verdict');
const signals = document.getElementById('signals');
const warning = document.getElementById('warning');

let currentMode = 'humanize';

const modeSettings = {
  humanize: {
    button: 'Humanize Text',
    label: 'Tone',
    endpoint: '/api/humanize',
    options: [
      ['simple and natural', 'Simple & Natural'],
      ['college freshman', 'College Freshman'],
      ['professional', 'Professional'],
      ['friendly', 'Friendly'],
      ['clear and concise', 'Clear & Concise']
    ]
  },
  rephrase: {
    button: 'Rephrase Text',
    label: 'Style',
    endpoint: '/api/rephrase',
    options: [
      ['clear and original', 'Clear & Original'],
      ['shorter and smoother', 'Shorter & Smoother'],
      ['more professional', 'More Professional'],
      ['college freshman', 'College Freshman'],
      ['simple and easy to understand', 'Simple & Easy']
    ]
  },
  'check-ai': {
    button: 'Check AI Percentage',
    label: 'Checker Type',
    endpoint: '/api/check-ai',
    options: [
      ['standard estimate', 'Standard Estimate']
    ]
  }
};

function setMode(mode) {
  currentMode = mode;
  const settings = modeSettings[mode];

  tabs.forEach(tab => tab.classList.toggle('active', tab.dataset.mode === mode));
  runBtn.textContent = settings.button;
  selectLabel.textContent = settings.label;

  toneSelect.innerHTML = '';
  settings.options.forEach(([value, label]) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = label;
    toneSelect.appendChild(option);
  });

  checkerResult.classList.add('hidden');
  outputWrap.classList.toggle('hidden', mode === 'check-ai');
  statusText.textContent = '';
}

async function runTool() {
  const text = inputText.value.trim();

  if (!text) {
    statusText.textContent = 'Please paste text first.';
    return;
  }

  const settings = modeSettings[currentMode];
  runBtn.disabled = true;
  statusText.textContent = 'Working...';
  checkerResult.classList.add('hidden');

  try {
    const payload = {
      text,
      tone: toneSelect.value,
      style: toneSelect.value
    };

    const response = await fetch(settings.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Something went wrong.');
    }

    if (currentMode === 'check-ai') {
      aiScore.textContent = data.ai_percentage !== null && data.ai_percentage !== undefined ? `${data.ai_percentage}%` : '--%';
      humanScore.textContent = data.human_percentage !== null && data.human_percentage !== undefined ? `${data.human_percentage}%` : '--%';
      verdict.textContent = data.verdict || 'No verdict returned.';
      warning.textContent = data.warning || 'This result is only an estimate.';
      signals.innerHTML = '';

      const signalList = Array.isArray(data.signals) ? data.signals : [];
      signalList.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        signals.appendChild(li);
      });

      checkerResult.classList.remove('hidden');
    } else {
      outputText.value = data.output || '';
    }

    statusText.textContent = 'Done.';
  } catch (error) {
    statusText.textContent = error.message;
  } finally {
    runBtn.disabled = false;
  }
}

async function copyOutput() {
  if (!outputText.value.trim()) {
    statusText.textContent = 'There is no output to copy yet.';
    return;
  }

  await navigator.clipboard.writeText(outputText.value);
  statusText.textContent = 'Copied.';
}

tabs.forEach(tab => tab.addEventListener('click', () => setMode(tab.dataset.mode)));
runBtn.addEventListener('click', runTool);
copyBtn.addEventListener('click', copyOutput);

setMode('humanize');
