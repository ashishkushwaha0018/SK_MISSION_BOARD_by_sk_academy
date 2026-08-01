import { SearchX, BookOpen } from "lucide-react";

interface EmptyStateProps {
  query: string;
  subjectName: string;
}

export function EmptyState({ query, subjectName }: EmptyStateProps) {
  if (query) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4">
          <SearchX size={28} className="text-purple-400" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">No chapters found</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          No chapter in <span className="text-white font-medium">{subjectName}</span> matches{" "}
          <span className="text-purple-300 font-medium">"{query}"</span>. Try a different keyword.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
        <BookOpen size={28} className="text-blue-400" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">No chapters yet</h3>
      <p className="text-sm text-muted-foreground max-w-xs">
        Chapters for <span className="text-white font-medium">{subjectName}</span> will be added soon. Check back later!
      </p>
    </div>
  );
}
