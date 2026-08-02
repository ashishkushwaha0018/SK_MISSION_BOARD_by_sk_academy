import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

export interface Subject {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  accentColor: string;
}

interface SubjectSidebarProps {
  subjects: Subject[];
  chapterCounts: Record<string, number>;
  selectedId: string;
  onSelect: (id: string) => void;
}

export function SubjectSidebar({
  subjects,
  chapterCounts,
  selectedId,
  onSelect,
}: SubjectSidebarProps) {
  return (
    <aside className="lg:w-72 shrink-0">
      <div className="sticky top-24">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 px-1">
          Class 10 — All Subjects
        </p>
        <div className="flex flex-row flex-wrap lg:flex-col gap-2">
          {subjects.map((subject) => {
            const isActive = selectedId === subject.id;
            const count = chapterCounts[subject.id] ?? 0;
            return (
              <button
                key={subject.id}
                onClick={() => onSelect(subject.id)}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-200 w-full",
                  isActive
                    ? "bg-purple-500/10 border-purple-500/40 shadow-[0_0_16px_rgba(124,58,237,0.2)]"
                    : "bg-card border-white/8 hover:border-white/20 hover:bg-white/3"
                )}
              >
                <span className="text-xl shrink-0 leading-none">{subject.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm font-semibold truncate", isActive ? "text-purple-300" : "text-white")}>
                    {subject.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {count} chapter{count !== 1 ? "s" : ""}
                  </p>
                </div>
                {isActive && (
                  <ChevronRight size={16} className="text-purple-400 shrink-0 hidden lg:block" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
