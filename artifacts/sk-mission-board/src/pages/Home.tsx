import { Link } from "wouter";
import { BookOpen, Video, Trophy, Target, ArrowRight } from "lucide-react";
import subjectsData from "@/data/subjects.json";
import chaptersData from "@/data/chapters.json";

// Compute chapter count per subject from the flat chapters file
const chapterCounts: Record<string, number> = {};
for (const ch of chaptersData) {
  chapterCounts[ch.subjectId] = (chapterCounts[ch.subjectId] ?? 0) + 1;
}

export function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        {/* Abstract background elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-sm mb-8 animate-fade-in-up">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            Session 2026-27 Ready
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight animate-fade-in-up delay-100">
            <span className="block text-glow bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-fuchsia-400 pb-2">
              Bihar Board Class 10
            </span>
            <span className="block text-white mt-2">ki Taiyari</span>
          </h1>
          
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in-up delay-200">
            Premium, highly structured notes and video lectures designed exclusively for ambitious Bihar Board students. Your top-tier digital coaching center.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-300">
            <Link 
              href="/notes" 
              className="w-full sm:w-auto px-8 py-4 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold transition-all glow-purple flex items-center justify-center gap-2"
            >
              <BookOpen size={20} />
              Explore Notes
            </Link>
            <Link 
              href="/videos" 
              className="w-full sm:w-auto px-8 py-4 rounded-lg bg-card border border-blue-500/50 hover:border-blue-400 text-blue-400 hover:text-blue-300 font-semibold transition-all glow-blue flex items-center justify-center gap-2"
            >
              <Video size={20} />
              Watch Videos
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background/50 relative border-y border-white/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-card border border-white/10 hover:border-purple-500/50 transition-colors group">
              <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 mb-4 group-hover:glow-purple transition-all">
                <BookOpen size={24} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Free Premium Notes</h3>
              <p className="text-muted-foreground text-sm">Chapter-wise detailed PDF notes covering every single concept.</p>
            </div>
            
            <div className="p-6 rounded-2xl bg-card border border-white/10 hover:border-blue-500/50 transition-colors group">
              <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 mb-4 group-hover:glow-blue transition-all">
                <Video size={24} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Video Lectures</h3>
              <p className="text-muted-foreground text-sm">In-depth explanations breaking down complex topics easily.</p>
            </div>
            
            <div className="p-6 rounded-2xl bg-card border border-white/10 hover:border-fuchsia-500/50 transition-colors group">
              <div className="w-12 h-12 rounded-lg bg-fuchsia-500/20 flex items-center justify-center text-fuchsia-400 mb-4 group-hover:shadow-[0_0_20px_rgba(217,70,239,0.4)] transition-all">
                <Trophy size={24} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">All Subjects</h3>
              <p className="text-muted-foreground text-sm">Maths, Science, SST, Hindi, English, and Sanskrit covered.</p>
            </div>
            
            <div className="p-6 rounded-2xl bg-card border border-white/10 hover:border-emerald-500/50 transition-colors group">
              <div className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all">
                <Target size={24} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Board Focused</h3>
              <p className="text-muted-foreground text-sm">Strictly aligned with the BSEB syllabus and previous year patterns.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Subjects Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Complete Syllabus</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Select a subject to dive into our structured chapters and download high-quality PDF notes.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {subjectsData.map((subject) => (
              <Link 
                key={subject.id} 
                href="/notes"
                className="group relative p-[1px] rounded-2xl overflow-hidden cursor-pointer"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${subject.color} opacity-50 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative h-full bg-card rounded-2xl p-8 flex flex-col items-center text-center transition-transform duration-300 group-hover:-translate-y-1">
                  <span className="text-5xl mb-6 block animate-float">{subject.icon}</span>
                  <h3 className="text-2xl font-bold text-white mb-2">{subject.name}</h3>
                  <p className="text-muted-foreground text-sm mb-6">{subject.description}</p>
                  
                  <div className="mt-auto inline-flex items-center text-sm font-medium text-purple-400">
                    {chapterCounts[subject.id] ?? 0} Chapters <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-purple-900/20" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto bg-card/80 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-10 md:p-16 text-center glow-purple">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Start Your Preparation Today</h2>
            <p className="text-lg text-purple-200 mb-10 max-w-2xl mx-auto">
              Join thousands of ambitious students studying smart. Access all premium resources for free and secure your top rank.
            </p>
            <Link 
              href="/notes" 
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold rounded-lg bg-white text-purple-900 hover:bg-gray-100 transition-colors glow-purple"
            >
              Get Started Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
