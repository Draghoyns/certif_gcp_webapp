from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
QUESTIONS_PATH = ROOT / "gcp-mle-quiz" / "public" / "data" / "questions.json"


def main() -> None:
    with QUESTIONS_PATH.open("r", encoding="utf-8") as file:
        questions = json.load(file)

    for question in questions:
        question["timesAnswered"] = 0
        question["timesCorrect"] = 0

    with QUESTIONS_PATH.open("w", encoding="utf-8") as file:
        json.dump(questions, file, indent=2)
        file.write("\n")

    print(f"Reset progress for {len(questions)} questions in {QUESTIONS_PATH}")


if __name__ == "__main__":
    main()