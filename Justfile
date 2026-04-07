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
