import React, { useEffect, useState } from "react";
import { Link } from "wouter";
import {
  Download,
  Search,
  Trash2,
  FileText,
  Eye,
  Share2,
  HardDrive,
  FolderOpen,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  ArrowRight
} from "lucide-react";
import {
  getDownloadedPdfs,
  removePdfFromDownloads,
  clearAllDownloads,
  DownloadedPdf
} from "@/lib/downloadManager";
import { PdfViewerModal } from "@/components/PdfViewerModal";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function Downloads() {
  const [downloads, setDownloads] = useState<DownloadedPdf[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [activeViewer, setActiveViewer] = useState<DownloadedPdf | null>(null);
  const [itemToDelete, setItemToDelete] = useState<DownloadedPdf | null>(null);
  const [showClearAllDialog, setShowClearAllDialog] = useState(false);

  const loadDownloads = () => {
    const items = getDownloadedPdfs();
    setDownloads(items);
  };

  useEffect(() => {
    loadDownloads();
  }, []);

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;
    try {
      await removePdfFromDownloads(itemToDelete.id);
      loadDownloads();
      toast.success("PDF deleted from downloads");
    } catch (err) {
      toast.error("Failed to delete PDF");
    } finally {
      setItemToDelete(null);
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAllDownloads();
      loadDownloads();
      toast.success("All downloads cleared");
    } catch (err) {
      toast.error("Failed to clear downloads");
    } finally {
      setShowClearAllDialog(false);
    }
  };

  const handleShare = async (item: DownloadedPdf) => {
    const fullUrl = window.location.origin + item.fileUrl;
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.chapterTitle,
          text: `Download ${item.chapterTitle} notes for Class 10 ${item.subjectName}`,
          url: fullUrl,
        });
      } catch (err) {
        // user cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(fullUrl);
        toast.success("Link copied to clipboard!");
      } catch (err) {
        toast.error("Could not copy link");
      }
    }
  };

  const filteredDownloads = downloads.filter((item) => {
    const matchesSearch =
      item.chapterTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.fileName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSubject =
      selectedSubject === "all" ||
      item.subjectId.toLowerCase() === selectedSubject.toLowerCase();

    return matchesSearch && matchesSubject;
  });

  const subjectsList = Array.from(
    new Set(downloads.map((d) => d.subjectName))
  );

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Title Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-purple-500/20 pb-6">
          <div>
            <div className="flex items-center gap-2 text-purple-400 font-semibold text-sm mb-1">
              <HardDrive size={18} />
              <span>OFFLINE STORAGE MANAGER</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
              Downloads
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Access your saved chapter PDFs anytime, anywhere — 100% offline.
            </p>
          </div>

          {downloads.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-purple-300 bg-purple-500/10 border border-purple-500/20 px-3 py-1.5 rounded-full">
                {downloads.length} {downloads.length === 1 ? "PDF" : "PDFs"} Saved
              </span>
              <button
                onClick={() => setShowClearAllDialog(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors"
              >
                <Trash2 size={14} /> Clear All
              </button>
            </div>
          )}
        </div>

        {/* Search and Subject Filters */}
        {downloads.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-900/50 p-4 rounded-xl border border-white/10">
            {/* Search input */}
            <div className="relative w-full sm:max-w-md">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="text"
                placeholder="Search downloaded notes by title or subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-950/80 border border-white/10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            {/* Subject Dropdown Filter */}
            {subjectsList.length > 0 && (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs text-muted-foreground shrink-0">Filter:</span>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full sm:w-auto px-3 py-2 rounded-lg bg-slate-950/80 border border-white/10 text-xs text-foreground focus:outline-none focus:border-purple-500"
                >
                  <option value="all">All Subjects ({downloads.length})</option>
                  {subjectsList.map((subj) => (
                    <option key={subj} value={subj.toLowerCase()}>
                      {subj}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* Downloads List */}
        {filteredDownloads.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDownloads.map((item) => (
              <div
                key={item.id}
                className="group relative bg-slate-900/60 hover:bg-slate-900/90 rounded-2xl border border-white/10 hover:border-purple-500/40 p-5 transition-all shadow-lg flex flex-col justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 shrink-0">
                    <FileText size={24} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {item.subjectName}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        Ch {item.chapterNumber}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-foreground line-clamp-1 group-hover:text-purple-300 transition-colors">
                      {item.chapterTitle}
                    </h3>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span>{item.fileSize}</span>
                      <span>•</span>
                      <span>
                        Downloaded{" "}
                        {new Date(item.downloadedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                  <button
                    onClick={() => setActiveViewer(item)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-600/20 transition-all"
                  >
                    <Eye size={14} /> Read PDF
                  </button>
                  <button
                    onClick={() => handleShare(item)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
                    title="Share PDF"
                  >
                    <Share2 size={16} />
                  </button>
                  <button
                    onClick={() => setItemToDelete(item)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-muted-foreground hover:text-red-400 transition-colors"
                    title="Delete Download"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : downloads.length > 0 ? (
          /* Filtered empty state */
          <div className="text-center py-16 bg-slate-900/30 rounded-2xl border border-white/10">
            <Search className="mx-auto text-muted-foreground mb-3" size={32} />
            <p className="text-lg font-medium text-foreground">No matching downloads</p>
            <p className="text-xs text-muted-foreground mt-1">
              Try adjusting your search query or subject filter.
            </p>
          </div>
        ) : (
          /* Zero downloads empty state */
          <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-white/10 p-6 flex flex-col items-center max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4 shadow-xl">
              <FolderOpen size={32} />
            </div>
            <h3 className="text-xl font-bold text-foreground">No Downloads Yet</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm leading-relaxed">
              When you download chapter notes from the Notes section, they will be saved here for instant offline study.
            </p>
            <Link
              href="/notes"
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold shadow-lg shadow-purple-600/30 transition-all hover:scale-105"
            >
              Browse Chapter Notes <ArrowRight size={16} />
            </Link>
          </div>
        )}

        {/* Active PDF Viewer Modal */}
        {activeViewer && (
          <PdfViewerModal
            isOpen={!!activeViewer}
            onClose={() => setActiveViewer(null)}
            title={activeViewer.chapterTitle}
            pdfUrl={activeViewer.fileUrl}
            subjectName={activeViewer.subjectName}
            chapterNumber={activeViewer.chapterNumber}
            chapterId={activeViewer.chapterId}
            fileName={activeViewer.fileName}
          />
        )}

        {/* Delete Item Confirmation Dialog */}
        <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
          <AlertDialogContent className="bg-slate-900 border border-white/10 text-foreground">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-red-400">
                <AlertTriangle size={20} /> Delete Downloaded PDF?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground text-sm">
                Are you sure you want to remove &quot;{itemToDelete?.chapterTitle}&quot; from your local downloads? You can download it again anytime from the Notes section.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-white/5 hover:bg-white/10 border-white/10 text-white">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteItem}
                className="bg-red-600 hover:bg-red-500 text-white"
              >
                Delete PDF
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Clear All Confirmation Dialog */}
        <AlertDialog open={showClearAllDialog} onOpenChange={setShowClearAllDialog}>
          <AlertDialogContent className="bg-slate-900 border border-white/10 text-foreground">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-red-400">
                <AlertTriangle size={20} /> Clear All Downloads?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground text-sm">
                This will permanently delete all saved offline PDFs from your browser storage. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-white/5 hover:bg-white/10 border-white/10 text-white">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleClearAll}
                className="bg-red-600 hover:bg-red-500 text-white"
              >
                Clear All
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
