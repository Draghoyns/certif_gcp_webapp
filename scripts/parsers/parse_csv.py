"""
Parse a GCP certification quiz CSV into the full questions dataset.

Outputs:
  gcp-mle-quiz/public/data/questions.json
  gcp-mle-quiz/public/data/parse_csv_report.json  (skipped-row report)

Run via DVC only — never call directly:
    uv run dvc repro

The dispatcher in parse.py auto-detects a .csv source file in raw_data/
and passes its path to this parser.

Expected CSV columns:
    question         — row ID, e.g. "q1015 (sample questions)"
    Answer           — correct option letter(s), may be empty
    Challenge        — ignored
    Confidence level — ignored
    Créée par        — ignored
    Question prompt  — full question text with embedded A./B./C./D. options
    Tech             — optional tech tag; mapped via TECH_TAG_MAP
    What I learnt    — explanation text; used as the explanation field
"""

import csv
import json
import os
import re
from collections import Counter

import sys

if __package__ in (None, ""):
    sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from scripts.parsers.constants import DE_TAGS, MLE_TAGS

OUT_PATH = "gcp-mle-quiz/public/data/questions.json"
REPORT_PATH = "gcp-mle-quiz/public/data/parse_csv_report.json"
DEFAULT_CSV_PATH = "gcp-mle-quiz/public/raw_data/GCP Certif Pro MLE Exam topics_new.csv"

# Map lowercased Tech column values to MLE_TAGS.
# Extend this dict as new Tech values appear in the CSV.
TECH_TAG_MAP: dict[str, str] = {
    "dataflow": "Data Ingestion & Preparation",
    "bigquery": "Data Ingestion & Preparation",
    "bigquery ml": "Data exploration & Baseline",
    "bqml": "Data exploration & Baseline",
    "pubsub": "Data Ingestion & Preparation",
    "pub/sub": "Data Ingestion & Preparation",
    "dataproc": "Data Ingestion & Preparation",
    "cloud storage": "Data Ingestion & Preparation",
    "tfrecords": "Data Ingestion & Preparation",
    "tf.transform": "Data Ingestion & Preparation",
    "automl": "Data exploration & Baseline",
    "vertex ai workbench": "Data exploration & Baseline",
    "workbench": "Data exploration & Baseline",
    "vertex ai pipelines": "Operationalization & Iterations",
    "kubeflow": "Operationalization & Iterations",
    "mlops": "Operationalization & Iterations",
    "cloud build": "Operationalization & Iterations",
    "vertex ai prediction": "Serving & Deployment",
    "tensorflow serving": "Serving & Deployment",
    "tf serving": "Serving & Deployment",
    "endpoint": "Serving & Deployment",
    "model monitoring": "Monitor",
    "monitoring": "Monitor",
    "drift": "Monitor",
}

# First matching DE keyword rule wins.
DE_KEYWORD_TAG_RULES: list[tuple[list[str], str]] = [
    (
        ["spanner", "alloydb", "bigtable", "cloud sql", "firestore", "htap", "acid"],
        "Storage & Databases",
    ),
    (
        [
            "slot",
            "reservation",
            "on-demand pricing",
            "autoscal",
            "flex slot",
            "commitment",
            "enterprise edition",
            "enterprise plus",
        ],
        "Architecture & Cost Management",
    ),
    (
        [
            "bigquery",
            "materialized view",
            "scheduled query",
            "partitioning",
            "clustering",
            "long-term storage",
            "bi engine",
        ],
        "Analytics & Query Optimization",
    ),
    (
        [
            "dataflow",
            "pub/sub",
            "pubsub",
            "apache beam",
            "dataproc",
            "spark",
            "kafka",
            "tfrecords",
        ],
        "Data Ingestion & Pipelines",
    ),
]


def normalize_columns(row: dict[str, str]) -> dict[str, str]:
    """Normalize CSV header names (trim + remove BOM)."""
    normalized: dict[str, str] = {}
    for key, value in row.items():
        clean_key = key.strip().lstrip("\ufeff") if key else ""
        normalized[clean_key] = value
    return normalized


def detect_csv_kind(first_row: dict[str, str]) -> str:
    """Detect CSV flavor from column names: 'mle' or 'de'."""
    columns = set(first_row.keys())
    if {"Question", "Q_id", "Session"}.issubset(columns):
        return "de"
    if {"question", "Question prompt"}.issubset(columns):
        return "mle"
    return "mle"


def certification_type_for_csv_kind(csv_kind: str) -> str:
    return "DE" if csv_kind == "de" else "MLE"


# ---------------------------------------------------------------------------
# Parsing helpers
# ---------------------------------------------------------------------------


def extract_id(raw_id: str) -> int | None:
    """Extract integer from strings like 'q1015 (sample questions)'."""
    m = re.search(r"q(\d+)", raw_id, re.IGNORECASE)
    return int(m.group(1)) if m else None


def preprocess_options(prompt: str) -> str:
    """Fix run-on option blocks like '...C. text.D. next' before parsing."""
    return re.sub(r"(?<=\S)([A-E])[.]\s+", lambda m: f"\n{m.group(1)}. ", prompt)


def parse_question_prompt(prompt: str) -> tuple[str | None, dict[str, str]]:
    """
    Split a prompt block into (question_text, options_dict).

    Options are delimited by lines starting with a letter followed by '.' or ')':
        A. Some option text
        A) Some option text

    Returns (None, {}) if the block cannot be parsed into at least 2 options.
    """
    prompt = preprocess_options(prompt)
    lines = prompt.strip().splitlines()
    option_start = re.compile(r"^[•\-]?\s*([A-E])[.)]\s*(.*)$")

    # Find the index of the first option line
    split_idx: int | None = None
    for i, line in enumerate(lines):
        if option_start.match(line.strip()):
            split_idx = i
            break

    if split_idx is None:
        return None, {}

    # Everything before the first option line is question text
    question_text = " ".join(
        line.strip() for line in lines[:split_idx] if line.strip()
    ).strip()
    if not question_text:
        return None, {}

    # Parse options — each option may span multiple lines until the next letter
    options: dict[str, str] = {}
    current_letter: str | None = None
    current_parts: list[str] = []

    for line in lines[split_idx:]:
        m = option_start.match(line.strip())
        if m:
            if current_letter is not None:
                merged = " ".join(current_parts).strip()
                if merged:
                    options[current_letter] = merged
            current_letter = m.group(1).upper()
            option_text = m.group(2).strip()
            current_parts = [option_text] if option_text else []
        elif current_letter is not None and line.strip():
            current_parts.append(line.strip())

    if current_letter is not None:
        merged = " ".join(current_parts).strip()
        if merged:
            options[current_letter] = merged

    return question_text, options


def normalize_answer(raw: str, options: dict[str, str]) -> list[str] | None:
    """
    Normalize an answer string into a list of valid option letters.
    Handles: "C", "c", "C.", "C, D", "CD", "C and D".
    Returns None if no valid letters found in options.
    """
    if not raw.strip():
        return None
    letters = list(dict.fromkeys(re.findall(r"[A-Ea-e]", raw)))
    valid = [l.upper() for l in letters if l.upper() in options]
    return valid if valid else None


def extract_answer_from_explanation(
    explanation: str, options: dict[str, str]
) -> list[str] | None:
    """
    Fallback: extract correct letter(s) from explanation text.
    Looks for patterns like 'C is correct because', 'C is the correct answer'.
    """
    if not explanation:
        return None
    matches = re.findall(
        r"\b([A-E])\s+is\s+(?:the\s+)?correct\b", explanation, re.IGNORECASE
    )
    if not matches:
        return None
    valid = list(dict.fromkeys(m.upper() for m in matches if m.upper() in options))
    return valid if valid else None


def map_tech_to_tags(
    tech: str,
    selected_tags: list[str] | None = None,
    fallback_tag: str = "Experimental protocol",
) -> list[str]:
    """Map a Tech column value to one tag and enforce selected-tags constraints."""
    selected = set(selected_tags or MLE_TAGS)
    default_tag = fallback_tag if fallback_tag in selected else next(iter(selected))

    if not tech.strip():
        return [default_tag]
    tag = TECH_TAG_MAP.get(tech.strip().lower())
    if not tag:
        return [default_tag]
    if tag not in selected:
        return [default_tag]
    return [tag]


def map_de_keywords_to_tags(
    question_text: str,
    options: dict[str, str],
    selected_tags: list[str] | None = None,
) -> list[str]:
    """Assign one DE tag by keyword matching on question + options."""
    selected = set(selected_tags or DE_TAGS)
    default_tag = "Analytics & Query Optimization"
    if default_tag not in selected:
        default_tag = next(iter(selected))

    searchable = (question_text + " " + " ".join(options.values())).lower()
    for keywords, tag in DE_KEYWORD_TAG_RULES:
        if tag in selected and any(keyword in searchable for keyword in keywords):
            return [tag]
    return [default_tag]


def deduplicate_id(
    qid: int, seen_ids: set[int], next_available_id: int
) -> tuple[int, int, bool]:
    """Return unique id, updated next id cursor, and whether a reassignment occurred."""
    if qid not in seen_ids:
        seen_ids.add(qid)
        return qid, next_available_id, False

    while next_available_id in seen_ids:
        next_available_id += 1
    new_id = next_available_id
    seen_ids.add(new_id)
    return new_id, next_available_id + 1, True


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


def main(
    csv_path: str = DEFAULT_CSV_PATH,
    selected_tags: list[str] | None = None,
    preserve_progress: bool = True,
    certification_type: str | None = None,
    de_tags: list[str] | None = None,
    mle_tags: list[str] | None = None,
) -> None:
    print(f"Reading {csv_path} ...")

    questions: list[dict] = []
    skipped: list[dict] = []
    reassigned_ids: list[dict] = []

    with open(csv_path, encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        rows = [normalize_columns(row) for row in reader]

    if not rows:
        raise ValueError(f"No rows found in {csv_path}")

    csv_kind = detect_csv_kind(rows[0])
    expected_certification_type = certification_type_for_csv_kind(csv_kind)
    if (
        certification_type is not None
        and certification_type.upper() != expected_certification_type
    ):
        raise ValueError(
            f"CSV schema '{csv_kind}' does not match certification_type={certification_type.upper()}"
        )

    mle_active_tags = mle_tags or MLE_TAGS
    de_active_tags = de_tags or DE_TAGS
    if selected_tags:
        if expected_certification_type == "DE":
            de_active_tags = selected_tags
        else:
            mle_active_tags = selected_tags

    numeric_ids: list[int] = []
    if csv_kind == "de":
        numeric_ids = [
            int((row.get("Q_id") or "").strip())
            for row in rows
            if (row.get("Q_id") or "").strip().isdigit()
        ]
    next_available_id = (max(numeric_ids) + 1) if numeric_ids else 1
    seen_ids: set[int] = set()

    for row_idx, row in enumerate(rows, start=2):  # row 1 = header
        if csv_kind == "de":
            raw_prompt = (row.get("Question") or "").strip()
            raw_answer = (row.get("Answer") or "").strip()
            explanation_raw = (row.get("Explanation") or "").strip()
            raw_qid = (row.get("Q_id") or "").strip()

            if not raw_qid.isdigit():
                skipped.append(
                    {
                        "row": row_idx,
                        "id": raw_qid or "(empty)",
                        "reason": "non-numeric Q_id",
                    }
                )
                continue
            original_qid = int(raw_qid)
            qid, next_available_id, reassigned = deduplicate_id(
                original_qid, seen_ids, next_available_id
            )
            if reassigned:
                reassigned_ids.append({"row": row_idx, "from": original_qid, "to": qid})

            if not raw_prompt:
                skipped.append(
                    {"row": row_idx, "id": qid, "reason": "missing question text"}
                )
                continue

            question_text, options = parse_question_prompt(raw_prompt)
            if question_text is None or len(options) < 2:
                skipped.append(
                    {
                        "row": row_idx,
                        "id": qid,
                        "reason": "question/options not parseable",
                    }
                )
                continue

            correct = normalize_answer(raw_answer, options)
            if correct is None:
                skipped.append(
                    {"row": row_idx, "id": qid, "reason": "answer format unrecognized"}
                )
                continue

            questions.append(
                {
                    "id": qid,
                    "question": question_text,
                    "options": options,
                    "correct": correct,
                    "tags": map_de_keywords_to_tags(
                        question_text, options, selected_tags=de_active_tags
                    ),
                    "timesAnswered": 0,
                    "timesCorrect": 0,
                    "explanation": explanation_raw,
                }
            )
            continue

        raw_id = (row.get("question") or "").strip()
        prompt = (row.get("Question prompt") or "").strip()
        raw_answer = (row.get("Answer") or "").strip()
        tech = (row.get("Tech") or "").strip()
        explanation_raw = (row.get("What I learnt") or "").strip()

        # 1. Extract ID
        qid = extract_id(raw_id)
        if qid is None:
            skipped.append(
                {
                    "row": row_idx,
                    "id": raw_id or "(empty)",
                    "reason": "id not extractable",
                }
            )
            continue

        # 2. Require question prompt
        if not prompt:
            skipped.append(
                {"row": row_idx, "id": raw_id, "reason": "missing question text"}
            )
            continue

        # 3. Parse question text + options
        question_text, options = parse_question_prompt(prompt)
        if question_text is None:
            skipped.append(
                {
                    "row": row_idx,
                    "id": raw_id,
                    "reason": "question text not parseable",
                }
            )
            continue
        if len(options) < 2:
            skipped.append(
                {
                    "row": row_idx,
                    "id": raw_id,
                    "reason": "options not parseable (fewer than 2 found)",
                }
            )
            continue

        # 4. Resolve correct answer — Answer col first, then explanation fallback
        correct = normalize_answer(raw_answer, options)
        if correct is None:
            correct = extract_answer_from_explanation(explanation_raw, options)
        if correct is None:
            skipped.append(
                {
                    "row": row_idx,
                    "id": raw_id,
                    "reason": "answer format unrecognized",
                }
            )
            continue

        questions.append(
            {
                "id": qid,
                "question": question_text,
                "options": options,
                "correct": correct,
                "tags": map_tech_to_tags(tech, selected_tags=mle_active_tags),
                "timesAnswered": 0,
                "timesCorrect": 0,
                "explanation": explanation_raw,
            }
        )

    print(f"  -> {len(questions)} questions parsed, {len(skipped)} skipped")

    # Preserve existing progress (timesAnswered / timesCorrect) by question id
    if preserve_progress and os.path.exists(OUT_PATH):
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
        print(
            f"  -> progress preserved for {len([q for q in questions if q['id'] in progress])} questions"
        )

    questions.sort(key=lambda q: q["id"])

    tag_counts: Counter = Counter(t for q in questions for t in q["tags"])
    print("\nTag distribution:")
    if tag_counts:
        for tag, count in sorted(tag_counts.items(), key=lambda x: -x[1]):
            print(f"  {tag:<40} {count}")
    else:
        print("  (no tags assigned — add Tech values to TECH_TAG_MAP in parse_csv.py)")

    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(questions, f, indent=2, ensure_ascii=False)
    print(f"\nWritten to {OUT_PATH}")

    with open(REPORT_PATH, "w", encoding="utf-8") as f:
        json.dump(skipped, f, indent=2, ensure_ascii=False)
    if reassigned_ids:
        print("\nReassigned duplicate IDs:")
        for item in reassigned_ids:
            print(f"  row {item['row']:>3}  id {item['from']} -> {item['to']}")
    if skipped:
        print(f"WARNING: {len(skipped)} rows skipped — see {REPORT_PATH}")
    else:
        print(f"No rows skipped — report written to {REPORT_PATH}")


if __name__ == "__main__":
    main()
