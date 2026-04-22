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
          <p className="mt-1 text-xs">Plain PDF with embedded question text and answer keys. Questions are parsed into the standard schema automatically.</p>

          <p className="mt-3 font-semibold">CSV Schema:</p>
          <div className="mt-2 overflow-x-auto rounded-lg text-xs" style={{ backgroundColor: "var(--surface-muted)" }}>
            <table className="w-full border-collapse">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-color)" }}>
                  <th className="px-3 py-2 text-left font-semibold">question</th>
                  <th className="px-3 py-2 text-left font-semibold">Answer</th>
                  <th className="px-3 py-2 text-left font-semibold">Question prompt</th>
                  <th className="px-3 py-2 text-left font-semibold">Tech (optional)</th>
                  <th className="px-3 py-2 text-left font-semibold">What I learnt</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-3 py-2">q1001</td>
                  <td className="px-3 py-2">C</td>
                  <td className="px-3 py-2">Which service…<br />A. Option 1<br />B. Option 2<br />C. Correct answer</td>
                  <td className="px-3 py-2">bigquery</td>
                  <td className="px-3 py-2">Explanation text here</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl p-4" style={{ backgroundColor: "rgba(251, 188, 4, 0.10)" }}>
          <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
            Step 2: Configure tag lists in params.yaml
          </p>
          <p className="mt-2">
            Tags are the topic categories questions are grouped into — they drive the sidebar filters and the analytics breakdown.<br />
            Before preprocessing, open <strong>params.yaml</strong> and adjust <code>mle_tags</code> / <code>de_tags</code> to the topics you want to practice.
          </p>
          <p className="mt-2 text-xs">
            Home-page certification buttons control which tag set is active in the sidebar and analytics.
          </p>
        </div>

        <div className="rounded-xl p-4" style={{ backgroundColor: "rgba(52, 168, 83, 0.08)" }}>
          <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
            Step 3: Run preprocessing
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

        <div className="rounded-xl p-4" style={{ backgroundColor: "rgba(234, 67, 53, 0.10)" }}>
          <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
            Step 4: Start using the app
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
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
