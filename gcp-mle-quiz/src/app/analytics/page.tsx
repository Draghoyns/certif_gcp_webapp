import Analytics from "@/components/Analytics";

export default function AnalyticsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "#202124" }}>
          Analytics
        </h1>
        <p className="text-sm mt-1" style={{ color: "#5F6368" }}>
          Track your progress and identify weak spots across all topics
        </p>
      </div>
      <Analytics />
    </div>
  );
}
