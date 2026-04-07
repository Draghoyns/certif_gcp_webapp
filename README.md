# ☁️ GCP MLE Quiz

A personal study app to practice for the **Google Cloud Professional Machine Learning Engineer** certification exam.

Questions are sourced from a real exam-prep PDF, tagged by topic, and served through a clean web interface. The more you practice, the smarter the question selection gets — weak areas surface more often.

---

## Features

- **10-question sessions** sampled from 276 exam-style questions
- **Topic filters** — focus on six fixed certification-oriented categories
- **Adaptive weighting** — questions you struggle with appear more frequently
- **Confirm before reveal** — choose your answer, then confirm to see if you were right
- **AI-powered explanations** — after each answer, Gemini explains why the correct option is right (and why yours was wrong)
- **Analytics dashboard** — see your accuracy per topic and identify where you need more practice
- **Progress persisted** — your history is saved across sessions

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

## Roadmap / TODO

- [ ] Support other GCP certifications (Cloud Architect, Data Engineer, DevOps Engineer…) by swapping the source PDF and re-running `uv run dvc repro`
