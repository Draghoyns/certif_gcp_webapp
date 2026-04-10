# ☁️ GCP MLE Quiz

A personal study app to practice for the **Google Cloud Professional Machine Learning Engineer** certification exam.

Questions are sourced from a real exam-prep PDF, tagged by topic, and served through a clean web interface. The more you practice, the smarter the question selection gets — weak areas surface more often.

---

## Features

- **10-question sessions** sampled from 276 exam-style questions
- **Topic filters** — focus on six fixed certification-oriented categories
- **Adaptive weighting** — questions you struggle with appear more frequently
- **Confirm before reveal** — choose your answer, then confirm to see if you were right
- **AI-powered explanations + curation** — pre-generate explanations with AI and refine them directly from the quiz UI
- **Analytics dashboard** — see your accuracy per topic, identify weak areas, reset progress counters, and save timestamped progress snapshots
- **Progress persisted** — your history is saved across sessions

---

## Recent Updates

- **In-app explanation editing workflow** — explanation text can be edited and saved from the answer panel, then persisted back to `public/data/questions.json`.
- **Analytics progress controls** — the analytics dashboard now includes Reset Progress and Save Progress actions for managing `timesAnswered` / `timesCorrect` and saving timestamped dataset snapshots.
- **New Copilot specialist agent** — added **Emo - GCP MLE Field Formatter** to `.github/agents/` for precise per-field formatting of question JSON content.

---

## Getting Started

### 1. Clone & set up Python (PDF parser)

```bash
# Install uv if you don't have it
curl -LsSf https://astral.sh/uv/install.sh | sh

# Install dependencies
uv sync
```

### 2. Build the question dataset (DVC pipeline)

```bash
uv run dvc repro
```

This reads `ExamTopic_ML_GCP.pdf` and generates `gcp-mle-quiz/public/data/questions.json`.

Notes:
- The stage only reruns when tracked dependencies change (PDF or parser script).
- Use `uv run dvc repro --force` to force a full regeneration.
- Do not run `uv run parse_pdf.py` directly; use DVC so `dvc.lock` stays in sync.

### 3. Set up the web app

```bash
cd gcp-mle-quiz
npm install
```

### 4. Run the app

```bash
cd gcp-mle-quiz
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Utility Commands

```bash
just reset-progress
just save-progress
```

- `just reset-progress` resets every question's `timesAnswered` and `timesCorrect` counters to `0`.
- `just save-progress` writes a timestamped copy of `gcp-mle-quiz/public/data/questions.json` into `gcp-mle-quiz/public/data/snapshots/`.

From the analytics page, you can also trigger both actions directly from the dashboard UI.

---

## Topics Covered

| Topic | Questions |
|-------|-----------|
| Experimental protocol | 118 |
| Data Ingestion & Preparation | 85 |
| Serving & Deployment | 77 |
| Data exploration & Baseline | 72 |
| Operationalization & Iterations | 56 |
| Monitor | 23 |

---

## Stack

| Layer | Technology |
|-------|-----------|
| Web app | Next.js 15, React 19, Tailwind CSS v4 |
| AI explanations | Google Gemini 2.0 Flash |
| PDF parsing | Python + pdfplumber |
| Python env | uv |
| Pipeline tracking | DVC |

## Copilot Agents

This repo includes reusable Copilot agents under `.github/agents/` for question-authoring workflows:

- **Pascal - GCP MLE Choice Explainer**
- **Eya - GCP MLE Concept Prereqs**
- **Lucas - GCP MLE Question Normalizer**
- **Emo - GCP MLE Field Formatter**

## Roadmap / TODO

- [ ] Support other GCP certifications (Cloud Architect, Data Engineer, DevOps Engineer…) by swapping the source PDF and re-running `uv run dvc repro`
