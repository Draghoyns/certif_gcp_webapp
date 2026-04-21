"""
Dispatcher: reads params.yaml → source key and delegates to the right parser.

Run via DVC:
    uv run dvc repro

To switch sources, update params.yaml and force a repro:
    source: pdf   # ExamTopic_ML_GCP.pdf  →  questions.json
    source: csv   # CSV file              →  questions.json
then:
    uv run dvc repro --force
    (or use: just use-pdf / just use-csv)
"""

import sys

import yaml


def load_params(path: str = "params.yaml") -> dict:
    with open(path, encoding="utf-8") as f:
        return yaml.safe_load(f) or {}


def main() -> None:
    params = load_params()
    source = params.get("source", "pdf").lower().strip()
    category_tags = params.get("category_tags")

    if category_tags is not None and not isinstance(category_tags, list):
        print("ERROR: params.yaml 'category_tags' must be a list of strings.")
        sys.exit(1)

    selected_tags = [str(t) for t in (category_tags or [])]

    if source == "pdf":
        import parse_pdf

        parse_pdf.main(selected_tags=selected_tags)
    elif source == "csv":
        import parse_csv

        csv_path = params.get("csv_path", parse_csv.DEFAULT_CSV_PATH)
        parse_csv.main(csv_path=csv_path, selected_tags=selected_tags)
    else:
        print(
            f"ERROR: Unknown source '{source}' in params.yaml. Valid values: 'pdf', 'csv'."
        )
        sys.exit(1)


if __name__ == "__main__":
    main()
