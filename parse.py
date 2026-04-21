"""
Dispatcher: auto-detect raw dataset file in raw_data/ and run the right parser.

Supported source files in raw_data/:
  - *.pdf
  - *.csv

Run via DVC:
    uv run dvc repro
"""

import os
import sys

import yaml

RAW_DATA_DIR = "raw_data"
SUPPORTED_EXTENSIONS = {".pdf", ".csv"}


def load_params(path: str = "params.yaml") -> dict:
    with open(path, encoding="utf-8") as f:
        return yaml.safe_load(f) or {}


def find_raw_data_source() -> tuple[str, str]:
    """Return (source_kind, file_path) from raw_data directory."""
    if not os.path.isdir(RAW_DATA_DIR):
        print(f"ERROR: '{RAW_DATA_DIR}/' folder not found.")
        sys.exit(1)

    candidates: list[str] = []
    for name in os.listdir(RAW_DATA_DIR):
        path = os.path.join(RAW_DATA_DIR, name)
        if not os.path.isfile(path):
            continue
        _, ext = os.path.splitext(name)
        if ext.lower() in SUPPORTED_EXTENSIONS:
            candidates.append(path)

    if not candidates:
        print(
            "ERROR: No supported source file found in raw_data/. "
            "Add exactly one .pdf or .csv file."
        )
        sys.exit(1)

    if len(candidates) > 1:
        listed = "\n".join(f"  - {c}" for c in sorted(candidates))
        print(
            "ERROR: Multiple source files found in raw_data/. "
            "Keep exactly one source file:\n"
            f"{listed}"
        )
        sys.exit(1)

    source_path = candidates[0]
    source_kind = "pdf" if source_path.lower().endswith(".pdf") else "csv"
    return source_kind, source_path


def main() -> None:
    params = load_params()
    category_tags = params.get("category_tags")

    if category_tags is not None and not isinstance(category_tags, list):
        print("ERROR: params.yaml 'category_tags' must be a list of strings.")
        sys.exit(1)

    selected_tags = [str(t) for t in (category_tags or [])]
    source, source_path = find_raw_data_source()
    print(f"Detected {source.upper()} source: {source_path}")

    if source == "pdf":
        import parse_pdf

        parse_pdf.main(pdf_path=source_path, selected_tags=selected_tags)
    elif source == "csv":
        import parse_csv

        parse_csv.main(csv_path=source_path, selected_tags=selected_tags)
    else:
        print(f"ERROR: Unsupported source type '{source}'.")
        sys.exit(1)


if __name__ == "__main__":
    main()
