import React, { useEffect, useRef, useState, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.js?url";
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  Share2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  FileText,
  AlertCircle,
  CheckCircle2,
  Eye,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { addPdfToDownloads, getOfflinePdfBlob, isPdfDownloaded } from "@/lib/downloadManager";

// Set worker URL using Vite bundled asset
try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
} catch (e) {
  console.warn("Could not set PDF worker URL", e);
}

interface PdfViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  pdfUrl: string;
  subjectName?: string;
  chapterNumber?: number;
  chapterId?: string;
  fileName?: string;
}

export function PdfViewerModal({
  isOpen,
  onClose,
  title,
  pdfUrl,
  subjectName = "Class 10 Study Material",
  chapterNumber,
  chapterId = "ch-pdf",
  fileName = "document.pdf",
}: PdfViewerModalProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoom, setZoom] = useState<number>(1.0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [downloaded, setDownloaded] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [pdfDocProxy, setPdfDocProxy] = useState<pdfjsLib.PDFDocumentProxy | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const touchStartDist = useRef<number | null>(null);

  // Check downloaded status
  useEffect(() => {
    if (chapterId) {
      setDownloaded(isPdfDownloaded(chapterId));
    }
  }, [chapterId, isOpen]);

  // Load PDF Document
  useEffect(() => {
    if (!isOpen || !pdfUrl) return;

    let isMounted = true;
    setLoading(true);
    setError(null);
    setNumPages(0);
    setCurrentPage(1);
    setZoom(1.0);
    setPdfDocProxy(null);

    async function loadPdf() {
      try {
        let activeUrl = pdfUrl.startsWith("http") || pdfUrl.startsWith("blob:") ? pdfUrl : encodeURI(pdfUrl);

        let pdfData: ArrayBuffer | null = null;

        // 1. Try offline stored PDF from IndexedDB first
        if (chapterId) {
          const cachedBlob = await getOfflinePdfBlob(chapterId);
          if (cachedBlob && isMounted) {
            pdfData = await cachedBlob.arrayBuffer();
          }
        }

        // 2. Fetch network PDF if not in offline cache
        if (!pdfData) {
          const response = await fetch(activeUrl);
          if (!response.ok) {
            if (response.status === 404) {
              throw new Error("This chapter PDF notes are currently being updated and will be available soon.");
            }
            throw new Error(`HTTP Error ${response.status}: Unable to load PDF notes.`);
          }

          const contentType = response.headers.get("content-type");
          if (contentType && contentType.toLowerCase().includes("text/html")) {
            throw new Error("PDF file not found on server.");
          }

          pdfData = await response.arrayBuffer();
        }

        if (!isMounted || !pdfData) return;

        // 3. Load PDF directly from binary ArrayBuffer
        const loadingTask = pdfjsLib.getDocument({ data: pdfData });
        const pdf = await loadingTask.promise;

        if (!isMounted) return;

        setPdfDocProxy(pdf);
        setNumPages(pdf.numPages);
        setLoading(false);
        setError(null);
      } catch (err: any) {
        console.error("PDF.js loading failed:", err);
        if (isMounted) {
          setLoading(false);
          setNumPages(0);
          setError(err?.message || "Failed to render PDF canvas.");
        }
      }
    }

    loadPdf();

    return () => {
      isMounted = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [isOpen, pdfUrl, chapterId]);

  // Render canvas pages whenever pdfDocProxy, loading, numPages or zoom changes
  const renderPages = useCallback(async (pdfDoc: pdfjsLib.PDFDocumentProxy, currentZoom: number) => {
    for (let i = 1; i <= pdfDoc.numPages; i++) {
      try {
        const page = await pdfDoc.getPage(i);
        const canvas = document.getElementById(`pdf-canvas-${i}`) as HTMLCanvasElement;
        if (!canvas) continue;

        const viewport = page.getViewport({ scale: 1.5 * currentZoom });
        const context = canvas.getContext("2d");
        if (!context) continue;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        await page.render(renderContext).promise;
      } catch (err) {
        console.warn(`Error rendering page ${i}:`, err);
      }
    }
  }, []);

  // Trigger page rendering as soon as canvases mount into the DOM
  useEffect(() => {
    if (!loading && pdfDocProxy && numPages > 0) {
      const timer = setTimeout(() => {
        renderPages(pdfDocProxy, zoom);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [loading, pdfDocProxy, numPages, zoom, renderPages]);

  // Setup Intersection Observer for current page indicator
  useEffect(() => {
    if (loading || numPages <= 0 || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const pageAttr = entry.target.getAttribute("data-page");
            if (pageAttr) {
              setCurrentPage(parseInt(pageAttr, 10));
            }
          }
        });
      },
      {
        root: containerRef.current,
        threshold: 0.4,
      }
    );

    pageRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [loading, numPages]);

  // Pinch-to-zoom touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartDist.current = dist;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchStartDist.current !== null) {
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const delta = currentDist - touchStartDist.current;
      if (Math.abs(delta) > 10) {
        if (delta > 0) {
          setZoom((prev) => Math.min(prev + 0.1, 2.5));
        } else {
          setZoom((prev) => Math.max(prev - 0.1, 0.6));
        }
        touchStartDist.current = currentDist;
      }
    }
  };

  const handleTouchEnd = () => {
    touchStartDist.current = null;
  };

  // Zoom handlers
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.6));
  const handleZoomReset = () => setZoom(1.0);

  // Scroll to page
  const scrollToPage = (p: number) => {
    if (p < 1 || p > numPages) return;
    const targetEl = pageRefs.current[p - 1];
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: "smooth" });
      setCurrentPage(p);
    }
  };

  // Download Handler
  const handleDownload = async () => {
    try {
      setDownloading(true);
      const response = await fetch(pdfUrl);
      if (!response.ok) throw new Error("Failed to fetch PDF file");

      const blob = await response.blob();

      // Trigger native browser file download
      const downloadLink = document.createElement("a");
      const url = URL.createObjectURL(blob);
      downloadLink.href = url;
      downloadLink.download = fileName || `${title}.pdf`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(url);

      // Save to local offline database
      await addPdfToDownloads(
        {
          chapterId: chapterId || `ch-${Date.now()}`,
          chapterTitle: title,
          subjectName: subjectName,
          subjectId: subjectName.toLowerCase().includes("science") ? "science" : "general",
          chapterNumber: chapterNumber || 1,
          fileName: fileName || `${title}.pdf`,
          fileUrl: pdfUrl,
          fileSize: `${(blob.size / (1024 * 1024)).toFixed(1)} MB`,
        },
        blob
      );

      setDownloaded(true);
      toast.success("PDF Downloaded Successfully!", {
        description: "Available offline in the Downloads section.",
      });
    } catch (err) {
      console.error("Download failed:", err);
      toast.error("Download Failed", {
        description: "Could not save PDF file locally. Please try again.",
      });
    } finally {
      setDownloading(false);
    }
  };

  // Share Handler
  const handleShare = async () => {
    const fullUrl = window.location.origin + pdfUrl;
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Study ${title} - ${subjectName} on SK MISSION BOARD`,
          url: fullUrl,
        });
        toast.success("Shared successfully!");
      } catch (err) {
        // User cancelled share
      }
    } else {
      try {
        await navigator.clipboard.writeText(fullUrl);
        toast.success("PDF Link Copied!", {
          description: "URL copied to clipboard to share with classmates.",
        });
      } catch (err) {
        toast.error("Could not copy link");
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col overflow-hidden animate-in fade-in duration-200">
      {/* Viewer Header */}
      <div className="h-16 px-4 border-b border-purple-500/30 bg-background/90 backdrop-blur-md flex items-center justify-between gap-2 z-10 shrink-0">
        {/* Left: Title & Subject */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"
            title="Close Viewer"
          >
            <X size={20} />
          </button>
          <div className="min-w-0">
            <h2 className="text-sm md:text-base font-semibold text-white truncate max-w-[200px] sm:max-w-[320px] md:max-w-[480px]">
              {title}
            </h2>
            <p className="text-xs text-purple-400 font-medium truncate">
              {subjectName} {chapterNumber ? `• Chapter ${chapterNumber}` : ""}
            </p>
          </div>
        </div>

        {/* Center: Page Navigation Indicator */}
        <div className="hidden sm:flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 text-xs text-muted-foreground">
          <button
            onClick={() => scrollToPage(currentPage - 1)}
            disabled={currentPage <= 1}
            className="hover:text-white disabled:opacity-30 transition-opacity"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="font-medium text-white">
            Page {currentPage} {numPages > 0 ? `of ${numPages}` : ""}
          </span>
          <button
            onClick={() => scrollToPage(currentPage + 1)}
            disabled={currentPage >= numPages}
            className="hover:text-white disabled:opacity-30 transition-opacity"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Right: Controls (Zoom, Download, Share, Close) */}
        <div className="flex items-center gap-1.5 md:gap-2">
          {/* Zoom Controls */}
          <div className="flex items-center bg-white/5 rounded-lg border border-white/10 p-1">
            <button
              onClick={handleZoomOut}
              className="p-1.5 text-gray-300 hover:text-white hover:bg-white/10 rounded transition-colors"
              title="Zoom Out"
            >
              <ZoomOut size={16} />
            </button>
            <button
              onClick={handleZoomReset}
              className="px-2 py-1 text-xs font-mono font-medium text-purple-300 hover:text-white hover:bg-white/10 rounded transition-colors"
              title="Reset Zoom"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              onClick={handleZoomIn}
              className="p-1.5 text-gray-300 hover:text-white hover:bg-white/10 rounded transition-colors"
              title="Zoom In"
            >
              <ZoomIn size={16} />
            </button>
          </div>

          {/* Open PDF Button — Always visible on all screens in header toolbar */}
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1.5 rounded-lg bg-purple-600/30 border border-purple-500/50 hover:bg-purple-600 text-white transition-all flex items-center gap-1.5 shrink-0 shadow-sm"
            title="Open PDF in New Tab"
          >
            <ExternalLink size={15} className="text-purple-300" />
            <span className="text-xs font-semibold text-purple-200">Open PDF</span>
          </a>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            disabled={downloading}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs md:text-sm transition-all ${
              downloaded
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                : "bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30"
            }`}
            title={downloaded ? "Downloaded Offline" : "Download PDF"}
          >
            {downloading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : downloaded ? (
              <CheckCircle2 size={16} className="text-emerald-400" />
            ) : (
              <Download size={16} />
            )}
            <span className="hidden xs:inline">
              {downloading ? "Saving..." : downloaded ? "Saved" : "Download"}
            </span>
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
            title="Share PDF"
          >
            <Share2 size={18} />
          </button>
        </div>
      </div>

      {/* Main PDF Scroll Canvas Area */}
      <div
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="flex-1 overflow-y-auto overflow-x-auto p-4 md:p-8 flex flex-col items-center justify-start gap-6 scrollbar-thin scrollbar-thumb-purple-500/30 select-none"
      >
        {loading && (
          <div className="my-auto flex flex-col items-center justify-center gap-4 py-20 text-center">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin" />
              <FileText className="absolute inset-0 m-auto text-purple-400" size={24} />
            </div>
            <div>
              <p className="text-lg font-medium text-white">Loading Chapter PDF...</p>
              <p className="text-xs text-muted-foreground mt-1">Preparing high quality notes canvas</p>
            </div>
          </div>
        )}

        {/* Render Canvas Pages */}
        {!loading && numPages > 0 && (
          <div
            className="flex flex-col items-center gap-8 transition-transform duration-100 ease-out origin-top"
            style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}
          >
            {Array.from({ length: numPages }, (_, index) => {
              const pageNum = index + 1;
              return (
                <div
                  key={pageNum}
                  ref={(el) => (pageRefs.current[index] = el)}
                  data-page={pageNum}
                  className="relative group bg-slate-900/90 rounded-xl overflow-hidden shadow-2xl border border-white/10 flex flex-col items-center"
                >
                  <canvas
                    id={`pdf-canvas-${pageNum}`}
                    className="max-w-full h-auto block rounded-t-xl"
                  />
                  <div className="w-full bg-slate-950/80 px-4 py-2 text-center text-xs font-mono text-gray-400 border-t border-white/5">
                    Page {pageNum} of {numPages}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Direct Action Card Fallback if canvas rendering is not supported or failed */}
        {!loading && numPages === 0 && (
          <div className="my-auto w-full max-w-md bg-slate-900/90 border border-purple-500/30 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center gap-5 shadow-2xl animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shadow-inner">
              <FileText size={32} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{title}</h3>
              <p className="text-xs text-gray-300 mt-1 max-w-xs mx-auto leading-relaxed">
                {error || "PDF loaded. Click below to view or download the chapter notes."}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full mt-1">
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.02]"
              >
                <ExternalLink size={16} /> Open PDF in New Tab
              </a>
              <button
                onClick={handleDownload}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/10 transition-all hover:scale-[1.02]"
              >
                <Download size={16} /> Download PDF
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Footer Page Counter */}
      <div className="sm:hidden h-10 bg-background/90 border-t border-white/10 flex items-center justify-between px-4 text-xs text-muted-foreground">
        <button
          onClick={() => scrollToPage(currentPage - 1)}
          disabled={currentPage <= 1}
          className="flex items-center gap-1 text-purple-400 disabled:opacity-30"
        >
          <ChevronLeft size={16} /> Prev
        </button>
        <span className="font-medium text-white">
          Page {currentPage} of {numPages || 10}
        </span>
        <button
          onClick={() => scrollToPage(currentPage + 1)}
          disabled={currentPage >= (numPages || 10)}
          className="flex items-center gap-1 text-purple-400 disabled:opacity-30"
        >
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
