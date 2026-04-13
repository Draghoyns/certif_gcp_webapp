import QuizSession from "@/components/QuizSession";

export default function HomePage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          Practice Session
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          10 questions · weighted by your past performance · select topics in the sidebar
        </p>
      </div>
      <QuizSession />
    </div>
  );
}
