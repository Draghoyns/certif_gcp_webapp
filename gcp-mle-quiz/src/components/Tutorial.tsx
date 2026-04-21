"use client";

export default function Tutorial() {
  return (
    <section
      className="rounded-2xl p-6 shadow-sm"
      style={{ backgroundColor: "var(--surface-bg)", border: "1px solid var(--border-color)" }}
    >
      <h2 className="text-lg font-bold mb-2" style={{ color: "var(--text-primary)" }}>
        Getting Started (Step by Step)
      </h2>
      <p className="text-sm mb-5" style={{ color: "var(--text-secondary)" }}>
        Use this checklist in order. Each step tells you exactly what to do and what result you should see.
      </p>

      <div className="space-y-4 text-sm" style={{ color: "var(--text-secondary)" }}>
        <div className="rounded-xl p-4" style={{ backgroundColor: "rgba(66, 133, 244, 0.08)" }}>
          <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
            Step 1: Put your source file in raw_data/
          </p>
          <p className="mt-2">Place exactly one source file in <strong>raw_data/</strong>:</p>
          <pre className="mt-2 p-3 rounded-lg overflow-x-auto" style={{ backgroundColor: "var(--surface-muted)" }}>
raw_data/ExamTopic_ML_GCP.pdf
# or
raw_data/your_questions.csv
          </pre>
          <p className="mt-2">The preprocessing step auto-detects whether the file is PDF or CSV.</p>
        </div>

        <div className="rounded-xl p-4" style={{ backgroundColor: "rgba(52, 168, 83, 0.08)" }}>
          <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
            Step 2: Run preprocessing scripts
          </p>
          <p className="mt-2">Run preprocessing:</p>
          <pre className="mt-2 p-3 rounded-lg overflow-x-auto" style={{ backgroundColor: "var(--surface-muted)" }}>
just preprocess
# or
uv run dvc repro --force
          </pre>
          <p className="mt-2">
            Expected result: <strong>gcp-mle-quiz/public/data/questions.json</strong> is generated/updated.
          </p>
        </div>

        <div className="rounded-xl p-4" style={{ backgroundColor: "rgba(251, 188, 4, 0.10)" }}>
          <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
            Step 3: Choose category tags (optional)
          </p>
          <p className="mt-2">In <strong>params.yaml</strong>, edit <strong>category_tags</strong>:</p>
          <pre className="mt-2 p-3 rounded-lg overflow-x-auto" style={{ backgroundColor: "var(--surface-muted)" }}>
category_tags:
  - "Data Ingestion & Preparation"
  - "Experimental protocol"
  - "Serving & Deployment"
          </pre>
          <p className="mt-2">
            Then run <strong>uv run dvc repro --force</strong> to reassign tags using your selected set.
          </p>
        </div>

        <div className="rounded-xl p-4" style={{ backgroundColor: "rgba(234, 67, 53, 0.10)" }}>
          <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
            Step 4: Start using the app
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Select certification type (MLE, DE, or +).</li>
            <li>Start a Short Quiz (10) or Long Quiz (50).</li>
            <li>Use topic filters in the sidebar to focus practice.</li>
            <li>Open Analytics to check weak topics and accuracy.</li>
            <li>Use Reset Progress and Save Progress when needed.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
