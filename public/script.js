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

const instructorBtn = document.getElementById('instructorBtn');
const instructorStatus = document.getElementById('instructorStatus');
const assignmentType = document.getElementById('assignmentType');
const courseLevel = document.getElementById('courseLevel');
const assignmentDirections = document.getElementById('assignmentDirections');
const gradeResult = document.getElementById('gradeResult');
const letterGrade = document.getElementById('letterGrade');
const percentGrade = document.getElementById('percentGrade');
const gradeConfidence = document.getElementById('gradeConfidence');
const overallFeedback = document.getElementById('overallFeedback');
const rubricBreakdown = document.getElementById('rubricBreakdown');
const gradeStrengths = document.getElementById('gradeStrengths');
const gradeImprovements = document.getElementById('gradeImprovements');
const gradeWarning = document.getElementById('gradeWarning');

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

  tabs.forEach((tab) => tab.classList.toggle('active', tab.dataset.mode === mode));
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
      renderSimpleList(signals, data.signals);
      checkerResult.classList.remove('hidden');
    } else {
      outputText.value = data.output || '';
      gradeResult.classList.add('hidden');
      instructorStatus.textContent = '';
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
    statusText.textContent = 'There is no result to copy yet.';
    return;
  }

  await navigator.clipboard.writeText(outputText.value);
  statusText.textContent = 'Copied.';
}

function renderSimpleList(element, items) {
  element.innerHTML = '';
  const list = Array.isArray(items) ? items : [];

  list.forEach((item) => {
    const li = document.createElement('li');
    li.textContent = item;
    element.appendChild(li);
  });
}

function renderRubric(items) {
  rubricBreakdown.innerHTML = '';
  const list = Array.isArray(items) ? items : [];

  list.forEach((item) => {
    const card = document.createElement('article');
    card.className = 'rubric-card';

    const header = document.createElement('div');
    header.className = 'rubric-card-header';

    const category = document.createElement('strong');
    category.textContent = item.category || 'Category';

    const score = document.createElement('span');
    score.textContent = `${item.score ?? '--'} / ${item.max_score ?? '--'}`;

    const feedback = document.createElement('p');
    feedback.textContent = item.feedback || '';

    header.append(category, score);
    card.append(header, feedback);
    rubricBreakdown.appendChild(card);
  });
}

async function runInstructorCheck() {
  const selectedText = outputText.value.trim() || inputText.value.trim();

  if (!selectedText) {
    instructorStatus.textContent = 'Create or paste a result first.';
    return;
  }

  instructorBtn.disabled = true;
  instructorStatus.textContent = outputText.value.trim()
    ? 'Reviewing your chosen result like an instructor...'
    : 'Reviewing your pasted text like an instructor...';
  gradeResult.classList.add('hidden');

  try {
    const response = await fetch('/api/instructor-check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: selectedText,
        assignmentType: assignmentType.value,
        courseLevel: courseLevel.value,
        assignmentDirections: assignmentDirections.value.trim()
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'The instructor check failed.');
    }

    letterGrade.textContent = data.estimated_letter_grade || '--';
    percentGrade.textContent = data.estimated_percentage !== null && data.estimated_percentage !== undefined
      ? `${data.estimated_percentage}%`
      : '--%';
    gradeConfidence.textContent = data.confidence || '--';
    overallFeedback.textContent = data.overall_feedback || 'No overall feedback returned.';
    gradeWarning.textContent = data.warning || 'This is an AI estimate only. Your actual instructor grade may differ.';

    renderRubric(data.rubric_breakdown);
    renderSimpleList(gradeStrengths, data.strengths);
    renderSimpleList(gradeImprovements, data.top_improvements);

    gradeResult.classList.remove('hidden');
    instructorStatus.textContent = 'Instructor check complete.';
  } catch (error) {
    instructorStatus.textContent = error.message;
  } finally {
    instructorBtn.disabled = false;
  }
}

tabs.forEach((tab) => tab.addEventListener('click', () => setMode(tab.dataset.mode)));
runBtn.addEventListener('click', runTool);
copyBtn.addEventListener('click', copyOutput);
instructorBtn.addEventListener('click', runInstructorCheck);

setMode('humanize');
