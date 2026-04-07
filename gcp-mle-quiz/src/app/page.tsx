import QuizSession from "@/components/QuizSession";

export default function HomePage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "#202124" }}>
          Practice Session
        </h1>
        <p className="text-sm mt-1" style={{ color: "#5F6368" }}>
          10 questions · weighted by your past performance · select topics in the sidebar
        </p>
      </div>
      <QuizSession />
    </div>
  );
}
