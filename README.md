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
- **Analytics dashboard** — see your accuracy per topic and identify where you need more practice
- **Progress persisted** — your history is saved across sessions

---

## Recent Updates

- **In-app explanation editing workflow** — explanation text can be edited and saved from the answer panel, then persisted back to `public/data/questions.json`.
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

### 1. Expand Beyond MLE

- [ ] Reposition the app as a multi-certification **GCP Quiz** (Cloud Architect, Data Engineer, DevOps Engineer, etc.).
- [ ] Accept question sources in `PDF`, `CSV`, and `JSON` formats.
- [ ] Create a dedicated pipeline per input format, each producing `questions.json`.
- [ ] Update setup instructions to tell users to place source data in `gcp-mle-quiz/public/data/`.
- [ ] Add a README section documenting the expected question data schema.
- [ ] Remove hard-coded source filenames across the project.

### 2. Add a Real Home Experience

- [ ] Add a startup home page as the default landing route.
- [ ] Show `data file detected: <file_name>` when a supported file is present in `gcp-mle-quiz/public/data/` (excluding `questions.json`).
- [ ] Add a welcome banner with GCP branding.
- [ ] Let users choose between a short quiz (10 questions) and a long quiz (50 questions).
- [ ] Add a Home entry in the sidebar.

### 3. Polish UX and Theming

- [ ] Make progress dots always blue (not tied to correct/incorrect outcomes).
- [ ] Switch the sidebar to a light visual style.
- [ ] Add a dark/light theme toggle in the top-right corner using a single icon.
- [ ] Define theme behavior clearly: light mode uses a white background, dark mode uses a dark-gray background, and supporting colors should be adjusted for visual quality.
- [ ] Render question text as Markdown.