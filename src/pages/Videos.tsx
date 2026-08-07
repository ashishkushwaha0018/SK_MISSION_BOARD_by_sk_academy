import { useState } from "react";
import videosData from "@/data/videos.json";
import subjectsData from "@/data/subjects.json";
import { Youtube, Clock, Book } from "lucide-react";
import { cn } from "@/lib/utils";

export function Videos() {
  const [filter, setFilter] = useState<string>("All");

  const subjects = ["All", ...subjectsData.map(s => s.name)];
  
  const filteredVideos = filter === "All" 
    ? videosData 
    : videosData.filter(v => v.subject === filter);

  return (
    <div className="container mx-auto px-4 py-12 md:py-20 animate-fade-in-up">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 text-glow mb-4">
          Video Lectures
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          High-quality, distraction-free video lessons. Understand complex concepts easily.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap justify-center gap-2 mb-12">
        {subjects.map(subject => (
          <button
            key={subject}
            onClick={() => setFilter(subject)}
            className={cn(
              "px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 border",
              filter === subject 
                ? "bg-purple-600 border-purple-500 text-white glow-purple" 
                : "bg-card border-white/10 text-muted-foreground hover:text-white hover:border-white/30"
            )}
          >
            {subject}
          </button>
        ))}
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVideos.map((video) => {
          const subjectColor = subjectsData.find(s => s.name === video.subject)?.color || "from-purple-600 to-blue-600";
          
          return (
            <div 
              key={video.id} 
              className="flex flex-col bg-card border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/30 transition-all duration-300 group"
            >
              <div className={cn("h-2 w-full bg-gradient-to-r opacity-70", subjectColor)} />
              
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white/5 border border-white/10 text-xs font-medium text-gray-300">
                    <Book size={12} />
                    {video.subject}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                    <Clock size={12} />
                    {video.duration}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-purple-300 transition-colors">
                  {video.title}
                </h3>
                
                <p className="text-sm text-muted-foreground mb-6 line-clamp-3">
                  {video.description}
                </p>
                
                <div className="mt-auto pt-4 border-t border-white/5">
                  <a 
                    href={video.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-red-600/10 border border-red-500/50 hover:bg-red-600 text-red-500 hover:text-white font-medium transition-all shadow-[0_0_15px_rgba(239,68,68,0.15)] hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                  >
                    <Youtube size={18} />
                    Watch on YouTube
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredVideos.length === 0 && (
        <div className="text-center py-20 bg-card border border-white/10 rounded-2xl">
          <Youtube size={48} className="mx-auto text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-xl font-semibold text-white mb-2">No videos found</h3>
          <p className="text-muted-foreground">Try selecting a different subject.</p>
        </div>
      )}
    </div>
  );
}
