import { FileText, Download } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Chapter {
  id: string;
  subjectId: string;
  chapterNumber: number;
  title: string;
  description: string;
  pdfUrl: string;
  downloadUrl: string;
}

interface ChapterCardProps {
  chapter: Chapter;
  accentColor?: string;
}

const accentMap: Record<string, { badge: string; view: string; num: string }> = {
  blue: {
    badge: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    view: "border-blue-500/40 text-blue-400 hover:bg-blue-500/10",
    num: "text-blue-400",
  },
  green: {
    badge: "bg-green-500/10 text-green-400 border-green-500/30",
    view: "border-green-500/40 text-green-400 hover:bg-green-500/10",
    num: "text-green-400",
  },
  orange: {
    badge: "bg-orange-500/10 text-orange-400 border-orange-500/30",
    view: "border-orange-500/40 text-orange-400 hover:bg-orange-500/10",
    num: "text-orange-400",
  },
  red: {
    badge: "bg-red-500/10 text-red-400 border-red-500/30",
    view: "border-red-500/40 text-red-400 hover:bg-red-500/10",
    num: "text-red-400",
  },
  indigo: {
    badge: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
    view: "border-indigo-500/40 text-indigo-400 hover:bg-indigo-500/10",
    num: "text-indigo-400",
  },
  yellow: {
    badge: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
    view: "border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/10",
    num: "text-yellow-400",
  },
};

const defaultAccent = {
  badge: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  view: "border-purple-500/40 text-purple-400 hover:bg-purple-500/10",
  num: "text-purple-400",
};

export function ChapterCard({ chapter, accentColor = "blue" }: ChapterCardProps) {
  const accent = accentMap[accentColor] ?? defaultAccent;
  const numPadded = String(chapter.chapterNumber).padStart(2, "0");

  return (
    <div className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-background border border-white/5 hover:border-white/20 transition-all duration-200">
      {/* Left: number + text */}
      <div className="flex items-start sm:items-center gap-4 min-w-0">
        {/* Chapter number badge */}
        <div className={cn("shrink-0 w-10 h-10 rounded-lg border flex items-center justify-center text-xs font-bold", accent.badge)}>
          {numPadded}
        </div>

        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-white group-hover:text-purple-200 transition-colors leading-snug">
            {chapter.title}
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
            {chapter.description}
          </p>
        </div>
      </div>

      {/* Right: action buttons */}
      <div className="flex items-center gap-2 shrink-0 ml-14 sm:ml-0">
        <a
          href={chapter.pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors whitespace-nowrap",
            accent.view
          )}
        >
          <FileText size={13} />
          View Notes
        </a>
        <a
          href={chapter.downloadUrl}
          download
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition-colors whitespace-nowrap shadow-[0_0_12px_rgba(124,58,237,0.3)] hover:shadow-[0_0_18px_rgba(124,58,237,0.5)]"
        >
          <Download size={13} />
          Download PDF
        </a>
      </div>
    </div>
  );
}
