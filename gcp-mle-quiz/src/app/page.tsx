import Image from "next/image";
import Link from "next/link";
import { getHomeDataStatus } from "@/lib/questions";
import CertificationSelector from "@/components/CertificationSelector";

export default function HomePage() {
  const dataStatus = getHomeDataStatus();

  return (
    <div className="flex flex-col gap-6 pt-10 sm:pt-6">
      <section
        className="relative overflow-hidden rounded-2xl p-7 pr-20 sm:pr-24 shadow-sm"
        style={{
          border: "1px solid rgba(66, 133, 244, 0.28)",
          background:
            "linear-gradient(125deg, rgba(66,133,244,0.22) 0%, rgba(52,168,83,0.20) 28%, rgba(251,188,4,0.20) 62%, rgba(234,67,53,0.22) 100%)",
        }}
      >
        <div
          className="mb-5 inline-flex items-center gap-4 rounded-2xl px-4 py-2"
          style={{ backgroundColor: "rgba(255,255,255,0.28)" }}
        >
          <Image src="/google-cloud-icon.svg" alt="Google Cloud logo" width={72} height={72} priority />
          <span className="text-sm font-semibold tracking-wide" style={{ color: "var(--text-primary)" }}>
            Google Cloud Learning Hub
          </span>
        </div>
        <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
          Welcome to GCP Quiz
        </h1>
        <p className="text-sm max-w-2xl" style={{ color: "var(--text-secondary)" }}>
          Train smarter with adaptive certification questions and choose the session format that fits your study pace.
        </p>
      </section>

      <CertificationSelector />

      <section
        className="rounded-2xl p-5 shadow-sm"
        style={{
          backgroundColor: dataStatus.hasQuestionsFile ? "rgba(66, 133, 244, 0.14)" : "rgba(251, 188, 4, 0.15)",
          border: dataStatus.hasQuestionsFile
            ? "1px solid rgba(66, 133, 244, 0.3)"
            : "1px solid rgba(251, 188, 4, 0.32)",
        }}
      >
        <p
          className="text-sm font-semibold"
          style={{ color: dataStatus.hasQuestionsFile ? "#8AB4F8" : "#FDD663" }}
        >
          {dataStatus.message}
        </p>
      </section>

      <section
        className="rounded-2xl p-6 shadow-sm"
        style={{ backgroundColor: "var(--surface-bg)", border: "1px solid var(--border-color)" }}
      >
        <h2 className="text-lg font-bold mb-4" style={{ color: "var(--text-primary)" }}>
          Start a Session
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href="/quiz?count=10"
            aria-disabled={!dataStatus.hasQuestionsFile}
            className="rounded-xl px-4 py-4 text-sm font-semibold text-center transition-opacity"
            style={{
              backgroundColor: dataStatus.hasQuestionsFile ? "#4285F4" : "var(--surface-muted)",
              color: dataStatus.hasQuestionsFile ? "#fff" : "var(--text-muted)",
              pointerEvents: dataStatus.hasQuestionsFile ? "auto" : "none",
              opacity: dataStatus.hasQuestionsFile ? 1 : 0.8,
            }}
          >
            Short Quiz · 10 Questions
          </Link>
          <Link
            href="/quiz?count=50"
            aria-disabled={!dataStatus.hasQuestionsFile}
            className="rounded-xl px-4 py-4 text-sm font-semibold text-center transition-opacity"
            style={{
              backgroundColor: dataStatus.hasQuestionsFile ? "rgba(66, 133, 244, 0.16)" : "var(--surface-muted)",
              color: dataStatus.hasQuestionsFile ? "#1A73E8" : "var(--text-muted)",
              border: dataStatus.hasQuestionsFile ? "1px solid rgba(66, 133, 244, 0.3)" : "1px solid var(--border-color)",
              pointerEvents: dataStatus.hasQuestionsFile ? "auto" : "none",
              opacity: dataStatus.hasQuestionsFile ? 1 : 0.8,
            }}
          >
            Long Quiz · 50 Questions
          </Link>
        </div>
      </section>

      <section
        className="rounded-2xl p-6 shadow-sm"
        style={{ backgroundColor: "var(--surface-bg)", border: "1px solid var(--border-color)" }}
      >
        <h2 className="text-lg font-bold mb-2" style={{ color: "var(--text-primary)" }}>
          Track Performance in Analytics
        </h2>
        <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
          Review weak topics, monitor your accuracy trends, reset counters, and save snapshots of your progress.
        </p>
        <Link
          href="/analytics"
          className="inline-flex items-center rounded-lg px-4 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
          style={{
            backgroundColor: "rgba(66, 133, 244, 0.16)",
            color: "#1A73E8",
            border: "1px solid rgba(66, 133, 244, 0.3)",
          }}
        >
          Go to Analytics
        </Link>
      </section>
    </div>
  );
}
