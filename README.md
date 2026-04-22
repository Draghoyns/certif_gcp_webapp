# ☁️ GCP Quiz

A personal study app to practice for the **Google Cloud Professional Machine Learning Engineer** certification exam.

Questions are sourced from a real exam-prep PDF, tagged by topic, and served through a clean web interface. The more you practice, the smarter the question selection gets — weak areas surface more often.

---

## Features

- **10-question sessions** sampled from 276 exam-style questions
- **Topic filters** — focus on certification-specific tag sets (MLE or DE)
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

Place exactly one source file in `gcp-mle-quiz/public/raw_data/`.
Supported formats:
- PDF (`.pdf`)
- CSV (`.csv`)

Ideal CSV schema:
- `question` - question ID, for example `q1015`
- `Answer` - correct option letters, for example `C` or `A, B`
- `Question prompt` - full question text with embedded `A./B./C./D.` options
- `Tech` - optional, mapped to category tags
- `What I learnt` - explanation text

Example CSV row:

```csv
question,Answer,Question prompt,Tech,What I learnt
q1001,C,"Which service...\nA. Option 1\nB. Option 2\nC. Correct answer",bigquery,"Explanation text here"
```

Before preprocessing, configure certification and tags in `params.yaml`.

Required setting:

```yaml
certification_type: "MLE"  # or "DE"
```

MLE tag list (used when `certification_type: "MLE"`):

```yaml
mle_tags:
	- "Data Ingestion & Preparation"
	- "Data exploration & Baseline"
	- "Experimental protocol"
	- "Operationalization & Iterations"
	- "Serving & Deployment"
	- "Monitor"
```

DE tag list (used when `certification_type: "DE"`):

```yaml
de_tags:
	- "Data Ingestion & Pipelines"
	- "Storage & Databases"
	- "Analytics & Query Optimization"
	- "Architecture & Cost Management"
```

Important:
- Keep `certification_type` aligned with your source dataset.
- For PDF parsing, only `MLE` is supported.
- If you change `certification_type` or either tag list, rerun preprocessing to regenerate tags.

```bash
just preprocess
```

`just preprocess` behavior:
- Updates `gcp-mle-quiz/public/data/questions.json`.
- Preserves `timesAnswered` and `timesCorrect` counters by question `id`.
- If `questions.json` does not exist, creates a new file.

Create a fresh dataset and reset progress counters:

```bash
just preprocess-new
```

`just preprocess-new` behavior:
- Overwrites `gcp-mle-quiz/public/data/questions.json` from scratch.
- Resets all `timesAnswered` and `timesCorrect` counters to `0`.

If you only change tag lists in `params.yaml` (without changing the source file), run:

```bash
just set-tags
```

`just set-tags` forces a full re-tag of questions using the current `mle_tags` / `de_tags` from `params.yaml`, without needing to modify the source file.

Notes:
- The stage only reruns when tracked dependencies change (PDF or parser script).
- Do not run `uv run scripts/parsers/parse_pdf.py` directly; use DVC so `dvc.lock` stays in sync.
- The parser expects exactly one source file in `gcp-mle-quiz/public/raw_data/`.
- Home-page certification selection controls which tags are shown in the sidebar and analytics during practice.

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
just reset
just save
```

- `just reset` resets every question's `timesAnswered` and `timesCorrect` counters to `0`.
- `just save` writes a timestamped copy of `gcp-mle-quiz/public/data/questions.json` into `gcp-mle-quiz/public/data/snapshots/`.

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

## Contributing

### AI-driven modifications

- Read `.github/copilot-instructions.md` before making changes.
- Keep source exam files local and git-ignored; use DVC for generated datasets.
- Regenerate data with `uv run dvc repro` (not `uv run scripts/parsers/parse_pdf.py`).
- Preserve quiz JSON schema: `id`, `question`, `options`, `correct`, `tags`, `timesAnswered`, `timesCorrect`, `explanation`.
- Keep progress continuity behavior when re-parsing (merge counters by question `id`).

### Available agents

- **Pascal - GCP MLE Choice Explainer**: explains why each option is right or wrong.
- **Eya - GCP MLE Concept Prereqs**: lists non-spoiler prerequisite concepts for a question.
- **Lucas - GCP MLE Question Normalizer**: cleans and normalizes question JSON while preserving meaning.
- **Emo - GCP MLE Field Formatter**: reformats one JSON field to match a target example style.

### Where features live

- Data pipeline: `scripts/parsers/parse_pdf.py`, `dvc.yaml`, and `gcp-mle-quiz/public/data/questions.json`.
- Dataset logic (read/write, weighting, sampling, progress): `gcp-mle-quiz/src/lib/questions.ts`.
- Quiz API routes: `gcp-mle-quiz/src/app/api/questions/route.ts` and `gcp-mle-quiz/src/app/api/progress/route.ts`.
- Quiz flow UI: `gcp-mle-quiz/src/components/QuizSession.tsx` and `gcp-mle-quiz/src/components/QuestionCard.tsx`.
- Analytics UI: `gcp-mle-quiz/src/components/Analytics.tsx` and `gcp-mle-quiz/src/app/analytics/page.tsx`.
- Global tag filters: `gcp-mle-quiz/src/components/TagContext.tsx`.

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

- [ ] Render question text as Markdown.