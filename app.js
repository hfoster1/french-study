// ===== State =====
const STORAGE_KEY = 'frenchStudyProgress';
const THEME_KEY = 'frenchStudyTheme';

let state = {
  currentView: 'home',
  currentLessonId: null,
  quizState: {
    currentQ: 0,
    score: 0,
    answered: false,
    shuffledOptions: [],
  },
};

function getProgress() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch { return {}; }
}

function saveProgress(lessonId, score, total) {
  const progress = getProgress();
  const prev = progress[lessonId] || {};
  progress[lessonId] = {
    attempted: true,
    completed: score / total >= 0.6,
    lastScore: score,
    lastTotal: total,
    bestScore: Math.max(score, prev.bestScore || 0),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

// ===== Dark Mode =====
function applyTheme(dark) {
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  const btn = document.getElementById('theme-toggle-btn');
  if (btn) btn.textContent = dark ? '☀️ Light Mode' : '🌙 Dark Mode';
}

function toggleTheme() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  applyTheme(!isDark);
  localStorage.setItem(THEME_KEY, !isDark ? 'dark' : 'light');
}

function loadSavedTheme() {
  applyTheme(localStorage.getItem(THEME_KEY) === 'dark');
}

// ===== Utilities =====
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ===== Navigation =====
function showView(viewId) {
  document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
  document.getElementById(viewId).classList.remove('hidden');
  state.currentView = viewId.replace('-view', '');
  document.getElementById('content').scrollTop = 0;
  window.scrollTo(0, 0);
  updateSidebar();
}

function navigateHome() {
  state.currentLessonId = null;
  renderHome();
  showView('home-view');
  closeMobileMenu();
}

function navigateLesson(lessonId) {
  state.currentLessonId = lessonId;
  renderLesson(lessonId);
  showView('lesson-view');
  closeMobileMenu();
}

function navigateQuiz(lessonId) {
  state.currentLessonId = lessonId;
  state.quizState = { currentQ: 0, score: 0, answered: false, shuffledOptions: [] };
  renderQuiz();
  showView('quiz-view');
}

function navigateResult(score) {
  renderResult(score);
  showView('result-view');
}

// ===== Sidebar =====
function updateSidebar() {
  const progress = getProgress();
  const completed = LESSONS.filter(l => progress[l.id]?.completed).length;
  document.getElementById('sidebar-completed').textContent = completed;
  document.getElementById('sidebar-total').textContent = LESSONS.length;
  document.getElementById('sidebar-progress-bar').style.width =
    `${(completed / LESSONS.length) * 100}%`;

  const list = document.getElementById('lesson-list');
  list.innerHTML = '';
  LESSONS.forEach(lesson => {
    const p = progress[lesson.id];
    const li = document.createElement('li');
    li.className = 'lesson-list-item' +
      (state.currentLessonId === lesson.id ? ' active' : '');
    li.innerHTML = `
      <span class="lesson-list-icon">${lesson.icon}</span>
      <div class="lesson-list-text">
        <div class="lesson-list-title">${lesson.title}</div>
      </div>
      <div class="lesson-list-status">
        ${p?.completed ? '<span class="status-check">✔</span>' :
          p?.attempted ? `<span class="score-pill">${p.lastScore}/${p.lastTotal || lesson.quiz.length}</span>` : ''}
      </div>
    `;
    li.addEventListener('click', () => navigateLesson(lesson.id));
    list.appendChild(li);
  });
}

// ===== Home View =====
function renderHome() {
  const progress = getProgress();
  const grid = document.getElementById('home-lesson-grid');
  grid.innerHTML = '';

  const completed = LESSONS.filter(l => progress[l.id]?.completed).length;
  document.getElementById('sidebar-completed').textContent = completed;
  document.getElementById('sidebar-total').textContent = LESSONS.length;
  document.getElementById('sidebar-progress-bar').style.width =
    `${(completed / LESSONS.length) * 100}%`;

  LESSONS.forEach(lesson => {
    const p = progress[lesson.id];
    const isCompleted = p?.completed;
    const isAttempted = p?.attempted;
    const total = lesson.quiz.length;

    const card = document.createElement('div');
    card.className = `lesson-card ${isCompleted ? 'completed' : ''}`;

    let statusHtml = '';
    let scoreHtml = '';
    if (isCompleted) {
      statusHtml = '<span class="card-status-badge completed">✔ Completed</span>';
      scoreHtml = `<span class="card-score">Best: ${p.bestScore}/${total}</span>`;
    } else if (isAttempted) {
      statusHtml = '<span class="card-status-badge in-progress">In Progress</span>';
      scoreHtml = `<span class="card-score">Last: ${p.lastScore}/${p.lastTotal || total}</span>`;
    } else {
      statusHtml = '<span class="card-status-badge not-started">Not started</span>';
    }

    card.innerHTML = `
      <div class="card-icon">${lesson.icon}</div>
      <div class="card-title">${lesson.title}</div>
      <div class="card-subtitle">${lesson.subtitle}</div>
      <div class="card-meta">
        ${scoreHtml}
        ${statusHtml}
      </div>
    `;
    card.addEventListener('click', () => navigateLesson(lesson.id));
    grid.appendChild(card);
  });
}

// ===== Lesson View =====
function renderLesson(lessonId) {
  const lesson = LESSONS.find(l => l.id === lessonId);
  if (!lesson) return;

  document.getElementById('lesson-icon').textContent = lesson.icon;
  document.getElementById('lesson-title').textContent = lesson.title;
  document.getElementById('lesson-subtitle').textContent = lesson.subtitle;

  const tbody = document.getElementById('vocab-body');
  tbody.innerHTML = lesson.vocabulary.map(v => `
    <tr>
      <td class="vocab-french">${v.french}</td>
      <td class="vocab-pron">${v.pronunciation}</td>
      <td>${v.english}</td>
    </tr>
  `).join('');

  const dialogueBox = document.getElementById('dialogue-box');
  dialogueBox.innerHTML = lesson.dialogue.map(line => `
    <div class="dialogue-line">
      <span class="dialogue-speaker">${line.speaker}</span>
      <div class="dialogue-text">
        <div class="dialogue-french">${line.french}</div>
        <div class="dialogue-english">${line.english}</div>
      </div>
    </div>
  `).join('');

  const grammarBox = document.getElementById('grammar-box');
  grammarBox.innerHTML = `
    <div class="grammar-title">${lesson.grammar.title}</div>
    <div class="grammar-explanation">${lesson.grammar.explanation}</div>
    <div class="grammar-examples">
      ${lesson.grammar.examples.map(ex => `
        <div class="grammar-example">
          <div class="example-french">${ex.french}</div>
          <div class="example-english">${ex.english}</div>
        </div>
      `).join('')}
    </div>
  `;

  document.getElementById('start-quiz-btn').onclick = () => navigateQuiz(lessonId);
  updateSidebar();
}

// ===== Quiz View =====
function renderQuiz() {
  const lesson = LESSONS.find(l => l.id === state.currentLessonId);
  if (!lesson) return;

  const { currentQ } = state.quizState;
  const total = lesson.quiz.length;
  const q = lesson.quiz[currentQ];

  document.getElementById('quiz-lesson-title').textContent = `${lesson.icon} ${lesson.title}`;
  document.getElementById('quiz-progress-label').textContent = `Question ${currentQ + 1} of ${total}`;
  document.getElementById('quiz-progress-fill').style.width = `${(currentQ / total) * 100}%`;
  document.getElementById('quiz-question').textContent = q.question;

  const feedbackEl = document.getElementById('quiz-feedback');
  feedbackEl.className = 'quiz-feedback hidden';

  // Shuffle options and store so handleAnswer can reference the correct positions
  const shuffledOptions = shuffleArray(q.options);
  state.quizState.shuffledOptions = shuffledOptions;

  const optionsEl = document.getElementById('quiz-options');
  const letters = ['A', 'B', 'C', 'D'];
  optionsEl.innerHTML = '';
  shuffledOptions.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'quiz-option';
    btn.innerHTML = `<span class="option-letter">${letters[i]}</span><span>${opt.text}</span>`;
    btn.addEventListener('click', () => handleAnswer(opt.correct, i, q));
    optionsEl.appendChild(btn);
  });

  state.quizState.answered = false;
}

function handleAnswer(isCorrect, selectedIdx, q) {
  if (state.quizState.answered) return;
  state.quizState.answered = true;

  if (isCorrect) state.quizState.score++;

  const buttons = document.querySelectorAll('.quiz-option');
  buttons.forEach((btn, i) => {
    btn.disabled = true;
    const opt = state.quizState.shuffledOptions[i];
    if (opt.correct) btn.classList.add('correct');
    else if (i === selectedIdx && !isCorrect) btn.classList.add('incorrect');
  });

  const feedbackEl = document.getElementById('quiz-feedback');
  feedbackEl.className = `quiz-feedback ${isCorrect ? 'correct-fb' : 'incorrect-fb'}`;
  document.getElementById('feedback-icon').textContent = isCorrect ? '✅' : '❌';
  document.getElementById('feedback-verdict').textContent = isCorrect ? 'Correct!' : 'Not quite.';
  document.getElementById('feedback-explanation').textContent = q.explanation;

  const lesson = LESSONS.find(l => l.id === state.currentLessonId);
  setTimeout(() => {
    const total = lesson.quiz.length;
    if (state.quizState.currentQ + 1 < total) {
      state.quizState.currentQ++;
      renderQuiz();
    } else {
      const finalScore = state.quizState.score;
      saveProgress(state.currentLessonId, finalScore, total);
      navigateResult(finalScore);
    }
  }, 1800);
}

// ===== Results View =====
function renderResult(score) {
  const lesson = LESSONS.find(l => l.id === state.currentLessonId);
  const total = lesson.quiz.length;
  const passed = score / total >= 0.6;
  const perfect = score === total;

  let emoji, heading, message;
  if (perfect) {
    emoji = '🏆'; heading = 'Parfait !';
    message = 'A perfect score! You\'ve mastered this lesson. Félicitations !';
  } else if (passed) {
    emoji = '🎉'; heading = 'Bien joué !';
    message = `You passed with ${score} out of ${total}. Keep practising to reach a perfect score!`;
  } else {
    emoji = '📚'; heading = 'Keep Practising';
    message = `You scored ${score} out of ${total}. Review the lesson and try again — you've got this!`;
  }

  document.getElementById('result-emoji').textContent = emoji;
  document.getElementById('result-heading').textContent = heading;
  document.getElementById('result-score').innerHTML = `${score}<span>/${total}</span>`;
  document.getElementById('result-message').textContent = message;

  document.getElementById('retry-btn').onclick = () => navigateQuiz(state.currentLessonId);

  const currentIdx = LESSONS.findIndex(l => l.id === state.currentLessonId);
  const nextLesson = LESSONS[currentIdx + 1];
  const nextBtn = document.getElementById('next-lesson-btn');
  if (nextLesson) {
    nextBtn.textContent = `Next: ${nextLesson.title} →`;
    nextBtn.style.display = '';
    nextBtn.onclick = () => navigateLesson(nextLesson.id);
  } else {
    nextBtn.textContent = '🏠 Back to Home';
    nextBtn.onclick = navigateHome;
  }
}

// ===== Mobile Menu =====
function openMobileMenu() {
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('sidebar-overlay').classList.add('visible');
}

function closeMobileMenu() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-overlay').classList.remove('visible');
}

// ===== Init =====
function init() {
  loadSavedTheme();

  document.getElementById('sidebar-home-btn').addEventListener('click', navigateHome);
  document.getElementById('mobile-menu-btn').addEventListener('click', openMobileMenu);
  document.getElementById('mobile-home-btn').addEventListener('click', navigateHome);
  document.getElementById('sidebar-overlay').addEventListener('click', closeMobileMenu);
  document.getElementById('theme-toggle-btn').addEventListener('click', toggleTheme);

  renderHome();
  updateSidebar();
  showView('home-view');
}

document.addEventListener('DOMContentLoaded', init);
