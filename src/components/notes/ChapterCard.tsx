import { useState, useEffect } from "react";
import { FileText, Download, CheckCircle2, Loader2, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { addPdfToDownloads, isPdfDownloaded } from "@/lib/downloadManager";
import { toast } from "sonner";

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
  subjectName?: string;
  onViewPdf?: (chapter: Chapter) => void;
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

export function ChapterCard({
  chapter,
  accentColor = "blue",
  subjectName = "Science",
  onViewPdf,
}: ChapterCardProps) {
  const [downloaded, setDownloaded] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);

  useEffect(() => {
    setDownloaded(isPdfDownloaded(chapter.id));
  }, [chapter.id]);

  const accent = accentMap[accentColor] ?? defaultAccent;
  const numPadded = String(chapter.chapterNumber).padStart(2, "0");

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setDownloading(true);
      const res = await fetch(chapter.downloadUrl || chapter.pdfUrl);
      if (!res.ok) throw new Error("Failed to fetch PDF");
      const blob = await res.blob();

      // Trigger browser download dialog
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.download = `${chapter.title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Save to local offline database
      await addPdfToDownloads(
        {
          chapterId: chapter.id,
          chapterTitle: chapter.title,
          subjectName: subjectName,
          subjectId: chapter.subjectId,
          chapterNumber: chapter.chapterNumber,
          fileName: `${chapter.title}.pdf`,
          fileUrl: chapter.pdfUrl,
          fileSize: `${(blob.size / (1024 * 1024)).toFixed(1)} MB`,
        },
        blob
      );

      setDownloaded(true);
      toast.success("Downloaded Successfully!", {
        description: `"${chapter.title}" is now available in your Downloads section offline.`,
      });
    } catch (err) {
      console.error("Download failed:", err);
      toast.error("Download Failed", {
        description: "Unable to save PDF file. Please try again.",
      });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-background border border-white/5 hover:border-white/20 transition-all duration-200 shadow-md">
      {/* Left: number + text */}
      <div className="flex items-start sm:items-center gap-4 min-w-0">
        {/* Chapter number badge */}
        <div
          className={cn(
            "shrink-0 w-10 h-10 rounded-lg border flex items-center justify-center text-xs font-bold",
            accent.badge
          )}
        >
          {numPadded}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-white group-hover:text-purple-200 transition-colors leading-snug">
              {chapter.title}
            </h4>
            {downloaded && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full shrink-0">
                <CheckCircle2 size={10} /> Saved
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
            {chapter.description}
          </p>
        </div>
      </div>

      {/* Right: action buttons */}
      <div className="flex items-center gap-2 shrink-0 ml-14 sm:ml-0">
        {/* View Notes Button */}
        <button
          onClick={() => onViewPdf && onViewPdf(chapter)}
          className={cn(
            "flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors whitespace-nowrap",
            accent.view
          )}
        >
          <Eye size={14} />
          View Notes
        </button>

        {/* Download PDF Button */}
        <button
          onClick={handleDownload}
          disabled={downloading}
          className={cn(
            "flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shadow-[0_0_12px_rgba(124,58,237,0.3)] hover:shadow-[0_0_18px_rgba(124,58,237,0.5)]",
            downloaded
              ? "bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30"
              : "bg-purple-600 hover:bg-purple-500 text-white"
          )}
        >
          {downloading ? (
            <Loader2 size={13} className="animate-spin" />
          ) : downloaded ? (
            <CheckCircle2 size={13} className="text-emerald-400" />
          ) : (
            <Download size={13} />
          )}
          {downloading ? "Saving..." : downloaded ? "Downloaded" : "Download PDF"}
        </button>
      </div>
    </div>
  );
}
