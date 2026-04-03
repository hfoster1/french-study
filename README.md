# French Study

A personalised A1–A2 conversational French study webapp. No build step — just open `index.html` in a browser.

## Features

- **6 lessons** covering practical, conversational French
- **Vocabulary** with pronunciation guides
- **Sample dialogues** for each topic
- **Grammar tips** explaining key concepts
- **Multiple choice quizzes** (5 questions per lesson) with instant feedback
- **Progress tracking** saved in your browser (localStorage)
- Mobile-responsive, French-inspired design

## Lessons

| # | Lesson | Topics |
|---|--------|--------|
| 1 | Greetings & Introductions | bonjour, enchanté, au revoir, je m'appelle |
| 2 | Numbers & Telling Time | 1–20, quelle heure est-il, et demie/quart |
| 3 | At the Café | je voudrais, l'addition, c'est combien |
| 4 | Getting Around | où est, gauche/droite, tout droit, la gare |
| 5 | My Daily Routine | days of week, -ER verb conjugation |
| 6 | Shopping | combien ça coûte, adjective agreement |

## Usage

Clone the repo and open `index.html`:

```bash
git clone https://github.com/hfoster1/french-study.git
cd french-study
open index.html   # macOS
# or just double-click index.html in your file browser
```

Or visit the live site on **[GitHub Pages](https://hfoster1.github.io/french-study/)** (enable under Settings → Pages, branch: `main`, root `/`).

## Structure

```
index.html   # App shell and layout
style.css    # French-themed styles (navy, gold, cream)
data.js      # All lesson content and quiz questions
app.js       # App logic and state management
```
