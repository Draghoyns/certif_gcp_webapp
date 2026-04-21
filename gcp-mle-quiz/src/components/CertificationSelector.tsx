"use client";

import { useState } from "react";
import { useCertification } from "./CertificationContext";

export default function CertificationSelector() {
  const { certificationType, setCertificationType } = useCertification();
  const [showComingSoon, setShowComingSoon] = useState(false);

  return (
    <section
      className="rounded-2xl p-6 shadow-sm"
      style={{ backgroundColor: "var(--surface-bg)", border: "1px solid var(--border-color)" }}
    >
      <h2 className="text-lg font-bold mb-4" style={{ color: "var(--text-primary)" }}>
        Choose Your Certification Type
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => {
            setCertificationType("MLE");
            setShowComingSoon(false);
          }}
          className="rounded-xl px-4 py-4 text-sm font-semibold text-center transition-all"
          style={{
            backgroundColor: certificationType === "MLE" ? "#4285F4" : "rgba(66, 133, 244, 0.16)",
            color: certificationType === "MLE" ? "#fff" : "#1A73E8",
            border: certificationType === "MLE" ? "2px solid #4285F4" : "1px solid rgba(66, 133, 244, 0.3)",
          }}
        >
          Machine Learning Engineer (MLE)
        </button>
        <button
          onClick={() => {
            setCertificationType("DE");
            setShowComingSoon(false);
          }}
          className="rounded-xl px-4 py-4 text-sm font-semibold text-center transition-all"
          style={{
            backgroundColor: certificationType === "DE" ? "#0F9D58" : "rgba(15, 157, 88, 0.16)",
            color: certificationType === "DE" ? "#fff" : "#0F9D58",
            border: certificationType === "DE" ? "2px solid #0F9D58" : "1px solid rgba(15, 157, 88, 0.3)",
          }}
        >
          Data Engineer (DE)
        </button>
        <button
          onClick={() => setShowComingSoon(!showComingSoon)}
          className="rounded-xl px-4 py-4 text-sm font-semibold text-center transition-all"
          style={{
            backgroundColor: "rgba(156, 39, 176, 0.16)",
            color: "#9C27B0",
            border: "1px solid rgba(156, 39, 176, 0.3)",
          }}
        >
          +
        </button>
      </div>
      {showComingSoon && (
        <p
          className="text-sm mt-4 p-3 rounded-lg"
          style={{
            backgroundColor: "rgba(251, 188, 4, 0.15)",
            color: "#F57F17",
            border: "1px solid rgba(251, 188, 4, 0.3)",
          }}
        >
          Not implemented, coming soon
        </p>
      )}
      {certificationType && (
        <p
          className="text-sm mt-4 p-3 rounded-lg"
          style={{
            backgroundColor: "rgba(66, 133, 244, 0.14)",
            color: "#8AB4F8",
            border: "1px solid rgba(66, 133, 244, 0.3)",
          }}
        >
          Selected: <span className="font-semibold">{certificationType === "MLE" ? "Machine Learning Engineer" : "Data Engineer"}</span>
        </p>
      )}
    </section>
  );
}
