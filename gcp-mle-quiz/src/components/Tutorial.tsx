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
            Step 1: Place your source file in gcp-mle-quiz/public/raw_data/
          </p>
          <p className="mt-2">
            Put exactly one <strong>PDF</strong> or <strong>CSV</strong> file in <strong>gcp-mle-quiz/public/raw_data/</strong>. The preprocessing step auto-detects the file type.
          </p>
          <p className="mt-3 font-semibold">PDF Schema:</p>
          <pre className="mt-2 p-3 rounded-lg overflow-x-auto text-xs" style={{ backgroundColor: "var(--surface-muted)" }}>
gcp-mle-quiz/public/raw_data/ExamTopic_ML_GCP.pdf
          </pre>
          <p className="mt-2 text-xs">Plain PDF with embedded question text and answer keys. Questions are parsed into the standard schema automatically.</p>

          <p className="mt-3 font-semibold">CSV Schema:</p>
          <pre className="mt-2 p-3 rounded-lg overflow-x-auto text-xs" style={{ backgroundColor: "var(--surface-muted)" }}>
Column Headers (required):
  question  — question ID (e.g. "q1015")
  Answer  — correct option letter(s) (e.g. "C", "A, B")
  Question prompt  — full text with A./B./C./D. options embedded
  Tech  — optional; maps to category tags
  What I learnt  — explanation text

Example:
  question,Answer,Question prompt,Tech,What I learnt
  q1001,C,"Which service...\nA. Option 1\nB. Option 2\nC. Correct answer",bigquery,"Explanation text here"
          </pre>
        </div>

        <div className="rounded-xl p-4" style={{ backgroundColor: "rgba(52, 168, 83, 0.08)" }}>
          <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
            Step 2: Run preprocessing
          </p>
          <p className="mt-2 mb-2">Two preprocessing modes:</p>
          <p className="font-semibold text-xs">Preserve Progress (default):</p>
          <pre className="mt-1 p-3 rounded-lg overflow-x-auto text-xs" style={{ backgroundColor: "var(--surface-muted)" }}>
just preprocess
          </pre>
          <p className="mt-2 text-xs">Merges new questions with existing <code>timesAnswered</code> / <code>timesCorrect</code> counters by question ID. Use this for ongoing practice sessions.</p>

          <p className="mt-3 font-semibold text-xs">Fresh Parse (reset progress):</p>
          <pre className="mt-1 p-3 rounded-lg overflow-x-auto text-xs" style={{ backgroundColor: "var(--surface-muted)" }}>
just preprocess-new
          </pre>
          <p className="mt-2 text-xs">Overwrites <code>questions.json</code> from scratch with all progress counters reset to 0. Use this when switching to a new source file or after major schema changes.</p>

          <p className="mt-3">Expected result: <strong>gcp-mle-quiz/public/data/questions.json</strong> is generated/updated.</p>
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
