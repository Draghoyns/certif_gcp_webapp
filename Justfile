set shell := ["bash", "-eu", "-o", "pipefail", "-c"]

default:
  @just --list

# Python/DVC
sync:
  uv sync

dvc-status:
  uv run dvc status

dvc-repro:
  uv run dvc repro

dvc-force:
  uv run dvc repro --force

# Regenerate questions.json from gcp-mle-quiz/public/raw_data/, preserving existing timesAnswered/timesCorrect progress.
# If questions.json does not exist yet, creates it from scratch.
preprocess:
  uv run dvc repro --force

# Regenerate questions.json from scratch, resetting all progress counters to 0.
# Use this when switching to a new source file or after major schema changes.
preprocess-new:
  uv run scripts/parsers/parse.py --fresh

# Frontend
web-install:
  cd gcp-mle-quiz && npm install

dev:
  cd gcp-mle-quiz && npm run dev

build:
  cd gcp-mle-quiz && npm run build

start:
  cd gcp-mle-quiz && npm run start

# Quick checks
check:
  uv run dvc status
  cd gcp-mle-quiz && npm run build

reset:
  uv run scripts/reset_progress.py

save:
  uv run scripts/save_questions_snapshot.py
