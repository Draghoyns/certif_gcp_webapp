"""
Dispatcher: auto-detect raw dataset file in raw_data/ and run the right parser.

Supported source files in raw_data/:
  - *.pdf
  - *.csv

Run via DVC:
    uv run dvc repro
"""

import argparse
import os
import sys

import yaml

if __package__ in (None, ""):
    sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from scripts.parsers.constants import DE_TAGS, MLE_TAGS

RAW_DATA_DIR = "gcp-mle-quiz/public/raw_data"
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
    parser = argparse.ArgumentParser(
        description="Parse raw exam data into questions.json."
    )
    parser.add_argument(
        "--fresh",
        action="store_true",
        help="Overwrite questions.json from scratch; all progress counters reset to 0.",
    )
    args = parser.parse_args()
    preserve_progress = not args.fresh

    params = load_params()
    certification_type = params.get("certification_type")
    mle_tags = params.get("mle_tags")
    de_tags = params.get("de_tags")

    if certification_type is None:
        print("ERROR: params.yaml 'certification_type' is required.")
        sys.exit(1)
    if not isinstance(certification_type, str):
        print("ERROR: params.yaml 'certification_type' must be a string.")
        sys.exit(1)
    certification_type = certification_type.upper()
    if certification_type not in {"MLE", "DE"}:
        print("ERROR: params.yaml 'certification_type' must be 'MLE' or 'DE'.")
        sys.exit(1)
    if mle_tags is not None and not isinstance(mle_tags, list):
        print("ERROR: params.yaml 'mle_tags' must be a list of strings.")
        sys.exit(1)
    if de_tags is not None and not isinstance(de_tags, list):
        print("ERROR: params.yaml 'de_tags' must be a list of strings.")
        sys.exit(1)

    resolved_mle_tags = [str(t) for t in (mle_tags or MLE_TAGS)]
    resolved_de_tags = [str(t) for t in (de_tags or DE_TAGS)]

    source, source_path = find_raw_data_source()
    print(f"Detected {source.upper()} source: {source_path}")

    if source == "pdf":
        from scripts.parsers import parse_pdf

        if certification_type != "MLE":
            print(
                "ERROR: PDF preprocessing currently supports only certification_type=MLE."
            )
            sys.exit(1)

        parse_pdf.main(
            pdf_path=source_path,
            selected_tags=resolved_mle_tags,
            preserve_progress=preserve_progress,
        )
    elif source == "csv":
        from scripts.parsers import parse_csv

        parse_csv.main(
            csv_path=source_path,
            preserve_progress=preserve_progress,
            certification_type=certification_type,
            mle_tags=resolved_mle_tags,
            de_tags=resolved_de_tags,
        )
    else:
        print(f"ERROR: Unsupported source type '{source}'.")
        sys.exit(1)


if __name__ == "__main__":
    main()
