"use client";

import { useState } from "react";

export default function Tutorial() {
  const [openSection, setOpenSection] = useState<"prep" | "features" | "tags" | null>("prep");

  const toggle = (section: "prep" | "features" | "tags") => {
    setOpenSection((current) => (current === section ? null : section));
  };

  return (
    <section
      className="rounded-2xl p-6 shadow-sm"
      style={{ backgroundColor: "var(--surface-bg)", border: "1px solid var(--border-color)" }}
    >
      <h2 className="text-lg font-bold mb-2" style={{ color: "var(--text-primary)" }}>
        Quick Start Tutorial
      </h2>
      <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
        Follow these steps to prepare data, run preprocessing scripts, customize category tags, and start using the app.
      </p>

      <div className="space-y-3">
        <button
          onClick={() => toggle("prep")}
          className="w-full text-left rounded-xl p-4"
          style={{
            backgroundColor: openSection === "prep" ? "rgba(66, 133, 244, 0.14)" : "var(--surface-muted)",
            border: openSection === "prep" ? "1px solid rgba(66, 133, 244, 0.3)" : "1px solid var(--border-color)",
          }}
        >
          <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
            1. Preprocess Your Dataset
          </span>
        </button>

        {openSection === "prep" && (
          <div
            className="rounded-xl p-4 text-sm"
            style={{ backgroundColor: "rgba(66, 133, 244, 0.08)", color: "var(--text-secondary)" }}
          >
            <p>Choose source mode in <strong>params.yaml</strong>:</p>
            <pre className="mt-2 p-3 rounded-lg overflow-x-auto" style={{ backgroundColor: "var(--surface-muted)" }}>
source: pdf   # or csv
csv_path: "gcp-mle-quiz/public/data/GCP Certif Pro MLE Exam topics_new.csv"
            </pre>
            <p className="mt-3">Run preprocessing:</p>
            <pre className="mt-2 p-3 rounded-lg overflow-x-auto" style={{ backgroundColor: "var(--surface-muted)" }}>
just use-pdf      # switch to PDF mode + rebuild questions.json
just use-csv      # switch to CSV mode + rebuild questions.json
uv run dvc repro  # rerun without switching mode
            </pre>
            <p className="mt-3">
              Output file must be located at <strong>gcp-mle-quiz/public/data/questions.json</strong>.
            </p>
          </div>
        )}

        <button
          onClick={() => toggle("tags")}
          className="w-full text-left rounded-xl p-4"
          style={{
            backgroundColor: openSection === "tags" ? "rgba(52, 168, 83, 0.14)" : "var(--surface-muted)",
            border: openSection === "tags" ? "1px solid rgba(52, 168, 83, 0.3)" : "1px solid var(--border-color)",
          }}
        >
          <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
            2. Choose Category Tags
          </span>
        </button>

        {openSection === "tags" && (
          <div
            className="rounded-xl p-4 text-sm"
            style={{ backgroundColor: "rgba(52, 168, 83, 0.08)", color: "var(--text-secondary)" }}
          >
            <p>Tags are controlled from <strong>params.yaml</strong> using <strong>category_tags</strong>:</p>
            <pre className="mt-2 p-3 rounded-lg overflow-x-auto" style={{ backgroundColor: "var(--surface-muted)" }}>
category_tags:
  - "Data Ingestion & Preparation"
  - "Experimental protocol"
  - "Serving & Deployment"
            </pre>
            <p className="mt-3">
              After updating tags, run <strong>uv run dvc repro --force</strong> to regenerate question tags.
            </p>
            <p className="mt-2">
              PDF mode assigns tags via keyword rules. CSV mode maps Tech values and falls back to a selected tag when needed.
            </p>
          </div>
        )}

        <button
          onClick={() => toggle("features")}
          className="w-full text-left rounded-xl p-4"
          style={{
            backgroundColor: openSection === "features" ? "rgba(251, 188, 4, 0.16)" : "var(--surface-muted)",
            border: openSection === "features" ? "1px solid rgba(251, 188, 4, 0.32)" : "1px solid var(--border-color)",
          }}
        >
          <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
            3. Use Core App Features
          </span>
        </button>

        {openSection === "features" && (
          <div
            className="rounded-xl p-4 text-sm"
            style={{ backgroundColor: "rgba(251, 188, 4, 0.10)", color: "var(--text-secondary)" }}
          >
            <ul className="list-disc pl-5 space-y-1">
              <li>Pick certification type from the selector above (MLE, DE, +).</li>
              <li>Start a short (10) or long (50) quiz session.</li>
              <li>Use sidebar topic filters to focus practice sessions.</li>
              <li>Review explanations after confirming answers.</li>
              <li>Open Analytics to review weak topics, reset progress, and save snapshots.</li>
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
