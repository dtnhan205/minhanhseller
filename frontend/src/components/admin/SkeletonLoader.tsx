export default function SkeletonLoader() {
  return (
    <div className="animate-pulse space-y-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-20 bg-gray-900/50 rounded-lg border border-gray-800"
        />
      ))}
    </div>
  );
}

