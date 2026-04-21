import QuizSession from "@/components/QuizSession";

interface QuizPageProps {
  searchParams?: Promise<{
    count?: string;
  }>;
}

export default async function QuizPage({ searchParams }: QuizPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const rawCount = Number(params?.count);
  const questionCount = rawCount === 50 ? 50 : 10;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          Practice Session
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          {questionCount} questions · weighted by your past performance · select topics in the sidebar
        </p>
      </div>
      <QuizSession questionCount={questionCount} />
    </div>
  );
}
