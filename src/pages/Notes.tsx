import { useState, useEffect, useMemo } from "react";
import { useSearch } from "wouter";
import subjectsRaw from "@/data/subjects.json";
import chaptersRaw from "@/data/chapters.json";
import { SubjectSidebar } from "@/components/notes/SubjectSidebar";
import { ChapterCard, type Chapter } from "@/components/notes/ChapterCard";
import { NotesSearch } from "@/components/notes/NotesSearch";
import { EmptyState } from "@/components/notes/EmptyState";
import { ChapterSkeleton } from "@/components/notes/ChapterSkeleton";
import { BookOpen } from "lucide-react";
import { PdfViewerModal } from "@/components/PdfViewerModal";

const subjects = subjectsRaw;
const chapters = chaptersRaw as Chapter[];

const chapterCounts: Record<string, number> = {};
for (const ch of chapters) {
  chapterCounts[ch.subjectId] = (chapterCounts[ch.subjectId] ?? 0) + 1;
}

export function Notes() {
  const search = useSearch();
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(() => {
    const param = new URLSearchParams(search).get("subject");
    return subjects.find((s) => s.id === param)?.id ?? subjects[0].id;
  });
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activePdfChapter, setActivePdfChapter] = useState<Chapter | null>(null);

  const handleSelectSubject = (id: string) => {
    if (id === selectedSubjectId) return;
    setIsLoading(true);
    setQuery("");
    setSelectedSubjectId(id);
  };

  useEffect(() => {
    if (!isLoading) return;
    const t = setTimeout(() => setIsLoading(false), 350);
    return () => clearTimeout(t);
  }, [isLoading]);

  const currentSubject = useMemo(
    () => subjects.find((s) => s.id === selectedSubjectId) ?? subjects[0],
    [selectedSubjectId]
  );

  const filteredChapters = useMemo(() => {
    const forSubject = chapters.filter((ch) => ch.subjectId === selectedSubjectId);
    if (!query.trim()) return forSubject;
    const q = query.toLowerCase();
    return forSubject.filter(
      (ch) =>
        ch.title.toLowerCase().includes(q) ||
        ch.description.toLowerCase().includes(q) ||
        String(ch.chapterNumber).includes(q)
    );
  }, [selectedSubjectId, query]);

  return (
    <div className="container mx-auto px-4 py-12 md:py-20 animate-fade-in-up">
      {/* Page header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs mb-5">
          <BookOpen size={13} />
          Bihar Board Class 10 — Study Material
        </div>
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 text-glow mb-4">
          Chapter Library
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">
          Select a subject, search any chapter, and access premium PDF notes — free for every Bihar Board student.
        </p>
      </div>

      {/* Main layout */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <SubjectSidebar
          subjects={subjects}
          chapterCounts={chapterCounts}
          selectedId={selectedSubjectId}
          onSelect={handleSelectSubject}
        />

        {/* Content panel */}
        <div className="flex-1 min-w-0">
          <div className="bg-card border border-white/10 rounded-2xl overflow-hidden">
            {/* Subject banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 border-b border-white/8">
              <div className="flex items-center gap-4">
                <span className="text-4xl leading-none">{currentSubject.icon}</span>
                <div>
                  <h2 className="text-xl font-bold text-white">{currentSubject.name}</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">{currentSubject.description}</p>
                </div>
              </div>

              {/* Chapter counter chip */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold">
                  {isLoading ? "…" : filteredChapters.length} / {chapterCounts[selectedSubjectId] ?? 0} chapters
                  {query && !isLoading ? " found" : ""}
                </span>
              </div>
            </div>

            {/* Search bar */}
            <div className="px-6 py-4 border-b border-white/5">
              <NotesSearch
                value={query}
                onChange={setQuery}
                placeholder={`Search in ${currentSubject.name}…`}
              />
            </div>

            {/* Chapter list */}
            <div className="p-6 space-y-3 min-h-[400px]">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <ChapterSkeleton key={i} />
                ))
              ) : filteredChapters.length === 0 ? (
                <EmptyState query={query} subjectName={currentSubject.name} />
              ) : (
                filteredChapters.map((chapter) => (
                  <ChapterCard
                    key={chapter.id}
                    chapter={chapter}
                    accentColor={currentSubject.accentColor}
                    subjectName={currentSubject.name}
                    onViewPdf={(ch) => setActivePdfChapter(ch)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* In-App PDF Viewer Modal */}
      {activePdfChapter && (
        <PdfViewerModal
          isOpen={!!activePdfChapter}
          onClose={() => setActivePdfChapter(null)}
          title={activePdfChapter.title}
          pdfUrl={activePdfChapter.pdfUrl}
          subjectName={currentSubject.name}
          chapterNumber={activePdfChapter.chapterNumber}
          chapterId={activePdfChapter.id}
          fileName={`${activePdfChapter.title}.pdf`}
        />
      )}
    </div>
  );
}
