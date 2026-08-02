export function ChapterSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-background border border-white/5 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-white/5 shrink-0" />
        <div className="space-y-2">
          <div className="h-3.5 w-40 rounded-md bg-white/5" />
          <div className="h-2.5 w-64 rounded-md bg-white/5" />
        </div>
      </div>
      <div className="flex gap-2 ml-14 sm:ml-0">
        <div className="h-8 w-24 rounded-lg bg-white/5" />
        <div className="h-8 w-28 rounded-lg bg-white/5" />
      </div>
    </div>
  );
}
