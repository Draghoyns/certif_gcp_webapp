"""
Parse ExamTopic_ML_GCP.pdf into the full questions dataset.

Outputs: gcp-mle-quiz/public/data/questions.json

Run via DVC only — never call directly:
    uv run dvc repro

DVC re-runs this script only when ExamTopic_ML_GCP.pdf changes.
Tag rules are fixed; to change them edit CATEGORY_RULES below and
force a re-run:  uv run dvc repro --force
"""

import json
import os
import re
from collections import Counter

import pdfplumber

PDF_PATH = "ExamTopic_ML_GCP.pdf"
OUT_PATH = "gcp-mle-quiz/public/data/questions.json"

# ---------------------------------------------------------------------------
# Tag rules — 6 fixed phases of the ML lifecycle.
# Questions can match up to 2 phases. To retag: edit here + dvc repro --force.
# ---------------------------------------------------------------------------
CATEGORY_RULES: list[tuple[str, list[str]]] = [
    (
        "Data Ingestion & Preparation",
        [
            "dataflow",
            "tf records",
            "tfrecord",
            "feature store",
            "vertex ai feature store",
            "bigquery",
            "bq",
            "cloud storage",
            "gcs",
            "pub/sub",
            "pubsub",
            "dataproc",
            "apache beam",
            "spark",
            "etl",
            "ingest",
            "preprocess",
            "data pipeline",
            "tf.transform",
            "imputation",
            "one-hot",
            "normalization",
        ],
    ),
    (
        "Data exploration & Baseline",
        [
            "data labeling",
            "labeling",
            "workbench",
            "vertex ai workbench",
            "automl",
            "bqml",
            "bigquery ml",
            "exploratory",
            "eda",
            "baseline",
            "baseline model",
            "feature analysis",
            "data quality",
            "profiling",
        ],
    ),
    (
        "Experimental protocol",
        [
            "hyperparameter",
            "vizier",
            "epoch",
            "learning rate",
            "optimizer",
            "cross-validation",
            "test set",
            "confusion matrix",
            "precision",
            "recall",
            "f1",
            "roc",
            "auc",
            "loss function",
            "regularization",
            "dropout",
            "batch prediction",
            "online prediction",
        ],
    ),
    (
        "Operationalization & Iterations",
        [
            "pipeline",
            "vertex ai pipelines",
            "kubeflow",
            "experiment",
            "metadata",
            "artifact",
            "model registry",
            "model repository",
            "versioning",
            "retraining",
            "ci/cd",
            "continuous training",
            "tfx",
            "canary",
            "a/b test",
            "shadow",
        ],
    ),
    (
        "Serving & Deployment",
        [
            "endpoint",
            "deploy",
            "serving",
            "model serving",
            "latency",
            "autoscaling",
            "tensorflow serving",
            "tf serving",
            "vector search",
            "matching engine",
            "real-time prediction",
            "inference",
        ],
    ),
    (
        "Monitor",
        [
            "monitoring",
            "model monitoring",
            "drift",
            "data drift",
            "concept drift",
            "alert",
            "sli",
            "slo",
            "observability",
            "logging",
        ],
    ),
]

DEFAULT_CATEGORY = "Experimental protocol"

CATEGORY_BOOST_KEYWORDS: dict[str, list[str]] = {
    "Data Ingestion & Preparation": [
        "dataflow",
        "tfrecord",
        "tf records",
        "feature store",
        "bigquery",
        "bq",
    ],
    "Data exploration & Baseline": [
        "workbench",
        "automl",
        "bqml",
        "bigquery ml",
        "data labeling",
    ],
    "Experimental protocol": [
        "hyperparameter",
        "cross-validation",
        "confusion matrix",
        "auc",
        "roc",
    ],
    "Operationalization & Iterations": [
        "vertex ai pipelines",
        "model registry",
        "model repository",
        "metadata",
        "experiment",
    ],
    "Serving & Deployment": [
        "endpoint",
        "deploy",
        "serving",
        "vector search",
        "matching engine",
    ],
    "Monitor": [
        "monitoring",
        "drift",
        "model monitoring",
        "observability",
    ],
}


def assign_categories(text: str) -> list[str]:
    """Return up to 2 matching category tags using score-based keyword matching."""
    lower = text.lower()
    scores: dict[str, float] = {tag: 0.0 for tag, _ in CATEGORY_RULES}

    for tag, keywords in CATEGORY_RULES:
        for kw in keywords:
            if kw in lower:
                scores[tag] += 1.5 if " " in kw else 1.0

    for tag, boost_keywords in CATEGORY_BOOST_KEYWORDS.items():
        for kw in boost_keywords:
            if kw in lower:
                scores[tag] += 2.0

    strong = [item for item in scores.items() if item[1] >= 2.0]
    if not strong:
        return [DEFAULT_CATEGORY]

    category_order = {tag: idx for idx, (tag, _) in enumerate(CATEGORY_RULES)}
    strong.sort(key=lambda item: (-item[1], category_order[item[0]]))
    return [tag for tag, _ in strong[:2]]


def normalise_raw(text: str) -> str:
    """
    Normalise the raw PDF dump before parsing:
    - keep bullet • as an ASCII marker
    - strip other problematic non-ASCII
    """
    text = re.sub(r"[•◆▪▸►]", "BULLET", text)
    text = re.sub(r"[^\x00-\x7F]+", " ", text)
    return text.replace("BULLET", "•")


def apply_text_fixes(text: str) -> str:
    """Apply deterministic cleanup for common OCR/parsing artifacts."""
    fixes: list[tuple[str, str]] = [
        (r"(^|[.!?]\s+)ou\s+", r"\1You "),
        (r"(^|[.!?]\s+)our\s+team\b", r"\1Your team"),
        (r"\btram\b", "train"),
        (r"\bAIlow\b", "Allow"),
        (r"\bYou re\b", "You're"),
        (r"\bcompany s\b", "company's"),
        (r"\bsemiconductor s\b", "semiconductor's"),
        (r"\bmodel s\b", "model's"),
        (r"\bteam s\b", "team's"),
        (r"\buser s\b", "user's"),
        (r"\bfeaturestore s\b", "featurestore's"),
        (r"\bmachine s\b", "machine's"),
        (r"\breal-\s+time\b", "real-time"),
        (r"\bVertex Al\b", "Vertex AI"),
        (r"\bVertex Al SDK\b", "Vertex AI SDK"),
        (r"\bseving_default\b", "serving_default"),
        (r"\bRestNet\b", "ResNet"),
        (r"\bchum\b", "churn"),
        (r"\b224224\b", "224x224"),
        (r"\bhttp:\s*//", "http://"),
        (r"\bdata After training\b", "data. After training"),
        (r"\breads the data splits the data\b", "reads the data, splits the data"),
    ]
    result = text
    for pattern, replacement in fixes:
        result = re.sub(pattern, replacement, result, flags=re.IGNORECASE)
    return result


def extract_full_text(pdf_path: str) -> str:
    """Extract all pages and join with newlines."""
    pages = []
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                pages.append(text)
    return normalise_raw("\n".join(pages))


def parse_questions(raw: str) -> list[dict]:
    """Parse the raw PDF text into question dictionaries."""
    parts = re.split(r"(?=Question \d+:)", raw)
    questions: list[dict] = []
    seen_ids: set[int] = set()

    for part in parts:
        part = part.strip()
        if not part:
            continue

        q_match = re.match(
            r"Question (\d+):\s*(.+?)(?=\n\s*•\s*[A-Z]\.\s|\n\s*[A-Z]\.\s)",
            part,
            re.DOTALL,
        )
        if not q_match:
            continue

        q_num = int(q_match.group(1))
        if q_num in seen_ids:
            continue
        seen_ids.add(q_num)

        q_text = apply_text_fixes(re.sub(r"\s+", " ", q_match.group(2)).strip())

        options: dict[str, str] = {}
        bullet_pattern = re.finditer(
            r"^\s*•\s*([A-Z])\.\s*(.+?)(?=^\s*•\s*[A-Z]\.\s|^\s*Correct Answer:|\Z)",
            part,
            re.DOTALL | re.MULTILINE,
        )
        for m in bullet_pattern:
            letter = m.group(1)
            opt_text = re.sub(r"\s+", " ", m.group(2)).strip()
            if re.match(r"^Question \d+:", opt_text):
                continue
            options[letter] = apply_text_fixes(opt_text)

        # Fallback when bullets are not present in extracted text.
        if not options:
            fallback_pattern = re.finditer(
                r"(?:^|\n)\s*([A-Z])\.\s*(.+?)(?=(?:\n\s*[A-Z]\.\s)|\nCorrect Answer:|$)",
                part,
                re.DOTALL,
            )
            for m in fallback_pattern:
                letter = m.group(1)
                opt_text = re.sub(r"\s+", " ", m.group(2)).strip()
                if re.match(r"^Question \d+:", opt_text):
                    continue
                options[letter] = apply_text_fixes(opt_text)

        ans_match = re.search(r"Correct Answer:\s*([^\n\r]+)", part)
        if not ans_match:
            continue

        parsed_letters = re.findall(r"\b([A-Z])\b", ans_match.group(1).upper())
        correct: list[str] = []
        seen_letters: set[str] = set()
        for letter in parsed_letters:
            if letter in options and letter not in seen_letters:
                correct.append(letter)
                seen_letters.add(letter)

        if len(options) < 2 or not correct:
            continue

        full_text = q_text + " " + " ".join(options.values())
        distractors = [k for k in sorted(options.keys()) if k not in correct]
        if len(correct) == 1:
            explanation = (
                f"Correct answer: {correct[0]}. "
                "This option best matches the requirements and constraints in the scenario. "
                f"The other options ({', '.join(distractors)}) are less suitable in this specific Google Cloud ML context."
            )
        else:
            explanation = (
                f"Correct answers: {', '.join(correct)}. "
                "These options together satisfy the requirements in the scenario. "
                f"The remaining options ({', '.join(distractors)}) are less suitable for this Google Cloud ML use case."
            )

        questions.append(
            {
                "id": q_num,
                "question": q_text,
                "options": options,
                "correct": correct,
                "tags": assign_categories(full_text),
                "timesAnswered": 0,
                "timesCorrect": 0,
                "explanation": explanation,
            }
        )

    questions.sort(key=lambda q: q["id"])
    return questions


def main() -> None:
    print(f"Reading {PDF_PATH} ...")
    raw = extract_full_text(PDF_PATH)

    print("Parsing questions ...")
    questions = parse_questions(raw)
    print(f"  -> {len(questions)} questions parsed")

    # Preserve existing progress (timesAnswered / timesCorrect) by question id.
    if os.path.exists(OUT_PATH):
        with open(OUT_PATH, encoding="utf-8") as f:
            existing = json.load(f)
        progress = {
            q["id"]: {
                "timesAnswered": q.get("timesAnswered", 0),
                "timesCorrect": q.get("timesCorrect", 0),
            }
            for q in existing
        }
        for q in questions:
            if q["id"] in progress:
                q["timesAnswered"] = progress[q["id"]]["timesAnswered"]
                q["timesCorrect"] = progress[q["id"]]["timesCorrect"]
        print(f"  -> progress preserved for {len(progress)} questions")

    tag_counts: Counter = Counter(t for q in questions for t in q["tags"])
    print("\nCategory distribution:")
    for tag, count in sorted(tag_counts.items(), key=lambda x: -x[1]):
        print(f"  {tag:<40} {count}")

    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(questions, f, indent=2, ensure_ascii=False)
    print(f"\nWritten to {OUT_PATH}")


if __name__ == "__main__":
    main()
