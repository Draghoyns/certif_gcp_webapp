from __future__ import annotations

from datetime import datetime
from pathlib import Path
import shutil


ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "gcp-mle-quiz" / "public" / "data"
QUESTIONS_PATH = DATA_DIR / "questions.json"
SNAPSHOTS_DIR = DATA_DIR / "snapshots"


def main() -> None:
    SNAPSHOTS_DIR.mkdir(parents=True, exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    snapshot_path = SNAPSHOTS_DIR / f"questions_{timestamp}.json"

    shutil.copy2(QUESTIONS_PATH, snapshot_path)

    print(f"Saved snapshot to {snapshot_path}")


if __name__ == "__main__":
    main()