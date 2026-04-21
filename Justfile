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

# Switch dataset source to PDF and regenerate questions.json
use-pdf:
  sed -i '' 's/^source:.*/source: pdf/' params.yaml
  uv run dvc repro --force

# Switch dataset source to CSV and regenerate questions.json
use-csv:
  sed -i '' 's/^source:.*/source: csv/' params.yaml
  uv run dvc repro --force

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
