# Copilot Instructions for this Repository

## Project layout and intent
- This repo has **two parts**:
  - `parse_pdf.py` at repo root: builds the question dataset from a local source PDF.
  - `gcp-mle-quiz/`: Next.js app that serves quiz sessions and updates progress.
- Source of truth for quiz data is `gcp-mle-quiz/public/data/questions.json`.
- Questions are extracted from PDF and enriched with tags, progress counters (`timesAnswered`, `timesCorrect`), and precomputed explanations.

## Data governance (must follow)
- **Do not track source exam-question data in git.**
- The source PDF (`ExamTopic_ML_GCP.pdf`) must remain local and git-ignored.
- Keep generated question data managed by DVC, not plain git tracking of the raw artifact.

## Data flow you must preserve
1. **DVC pipeline** (`dvc.yaml`) drives all PDF → JSON regeneration. Run `uv run dvc repro` — it only re-parses when `ExamTopic_ML_GCP.pdf` or `parse_pdf.py` changes.
2. **Progress is preserved** across re-parses: `parse_pdf.py` merges existing `timesAnswered`/`timesCorrect` from `questions.json` by question `id` before overwriting.
3. **Tags are fixed** alongside the source PDF — `CATEGORY_RULES` lives inside `parse_pdf.py` and is not meant to change independently.
4. UI calls `GET /api/questions` to fetch 10 weighted random questions.
5. On confirm, UI calls `POST /api/progress` to persist correctness per question.
6. UI renders precomputed `explanation` field from question object.
7. Analytics page calls `GET /api/progress` for per-tag weak-topic stats.

## Core implementation patterns
- All dataset reads/writes are centralized in `gcp-mle-quiz/src/lib/questions.ts`.
- Weighted sampling behavior is implemented in `getQuestionWeight()` + `weightedSample()`.
- Tag filtering is **union-based** (`filterByTags()` uses `some(...)`).
- Progress is persisted by mutating JSON on disk (`updateProgress()`). Keep this behavior for MVP.
- Shared quiz taxonomy and color system live in `gcp-mle-quiz/src/lib/types.ts`.

## UI/component conventions
- App Router structure under `gcp-mle-quiz/src/app`.
- Client state is handled in `QuizSession.tsx`; per-question rendering in `QuestionCard.tsx`.
- Global tag filter state is in `TagContext.tsx`, consumed by sidebar + quiz flow.
- Styling uses Tailwind utility classes plus inline Google-brand color hex values.
- Keep sidebar-driven navigation (`/` and `/analytics`) and fixed left layout from `layout.tsx`.

## Runtime and dependencies
- Python env/deps use **uv** (`pyproject.toml`, `uv.lock`).
- PDF parsing dependency: `pdfplumber`. Data pipeline tracking: `dvc`.
- Web app deps: Next.js 15, React 19, Tailwind v4.

## Developer workflows
- **Regenerate dataset** (only runs if PDF/parser changed): `uv run dvc repro`
- Force a full re-parse regardless of changes: `uv run dvc repro --force`
- Check pipeline status (stale vs. up-to-date): `uv run dvc status`
- Install frontend deps: `cd gcp-mle-quiz && npm install`
- Run app locally: `cd gcp-mle-quiz && npm run dev`
- Build production app: `cd gcp-mle-quiz && npm run build`
- **Do NOT run `uv run parse_pdf.py` directly** — always go through `dvc repro` so `dvc.lock` stays in sync.
- After a new feature or bugfix, use git commands to make a new branch and commit changes in relevant atomic units
- **DO NOT** push or commit directly to `main` branch.

## Agent guidance for safe edits
- Prefer editing `src/lib/questions.ts` for sampling/progress logic changes.
- Prefer editing API routes for backend behavior (`src/app/api/**/route.ts`).
- Do not rename tag keys unless you also update parser rules and UI label/color maps.
- Preserve JSON schema fields expected by UI: `id`, `question`, `options`, `correct`, `tags`, `timesAnswered`, `timesCorrect`, `explanation`.
