import { Target, Lightbulb, Users, Award } from "lucide-react";

export function About() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-20 animate-fade-in-up">
      {/* Hero Section */}
      <div className="text-center mb-20">
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 text-glow mb-6">
          About SK Mission Board
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          We are dedicated to providing premium, accessible, and high-quality educational resources for Bihar Board students.
        </p>
      </div>

      {/* Mission & Vision Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
        <div className="bg-card border border-purple-500/20 rounded-3xl p-8 md:p-10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
          <Target className="w-12 h-12 text-purple-400 mb-6 relative z-10" />
          <h2 className="text-2xl font-bold text-white mb-4 relative z-10">Our Mission</h2>
          <p className="text-muted-foreground leading-relaxed relative z-10">
            To democratize quality education in Bihar by providing every Class 10 student with top-tier, highly structured notes and video lectures completely free of cost. We believe financial constraints should never stand in the way of a student's ambition to top the board exams.
          </p>
        </div>

        <div className="bg-card border border-blue-500/20 rounded-3xl p-8 md:p-10 relative overflow-hidden group">
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />
          <Lightbulb className="w-12 h-12 text-blue-400 mb-6 relative z-10" />
          <h2 className="text-2xl font-bold text-white mb-4 relative z-10">Our Vision</h2>
          <p className="text-muted-foreground leading-relaxed relative z-10">
            To become the most trusted digital educational platform in Bihar, transforming how state board students prepare for exams. We envision a future where SK Mission Board alumni lead in competitive exams nationwide, rooted in the strong foundation built here.
          </p>
        </div>
      </div>

      {/* The Story Section */}
      <div className="bg-background border border-white/10 rounded-3xl p-8 md:p-12 mb-20 relative">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-8">The SK Mission Board Story</h2>
          <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
            SK Mission Board was born out of a simple observation: while students in metropolitan cities had access to premium digital coaching, students appearing for the Bihar Board (BSEB) were largely left behind, relying on outdated materials and disorganized content.
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed">
            We built this platform to bring the "premium coaching institute" experience directly to your screens. Every PDF, every video, and every chapter structure is meticulously crafted by subject experts who understand the exact pattern and requirements of the BSEB examinations.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        <div className="p-6">
          <div className="flex justify-center mb-4"><BookIcon className="text-purple-400" /></div>
          <div className="text-4xl font-bold text-white mb-2">6</div>
          <div className="text-sm text-muted-foreground uppercase tracking-wider font-medium">Core Subjects</div>
        </div>
        <div className="p-6">
          <div className="flex justify-center mb-4"><Users className="text-blue-400 w-8 h-8" /></div>
          <div className="text-4xl font-bold text-white mb-2">10k+</div>
          <div className="text-sm text-muted-foreground uppercase tracking-wider font-medium">Students</div>
        </div>
        <div className="p-6">
          <div className="flex justify-center mb-4"><Award className="text-fuchsia-400 w-8 h-8" /></div>
          <div className="text-4xl font-bold text-white mb-2">60+</div>
          <div className="text-sm text-muted-foreground uppercase tracking-wider font-medium">Chapters</div>
        </div>
        <div className="p-6">
          <div className="flex justify-center mb-4"><VideoIcon className="text-emerald-400" /></div>
          <div className="text-4xl font-bold text-white mb-2">100+</div>
          <div className="text-sm text-muted-foreground uppercase tracking-wider font-medium">Video Hours</div>
        </div>
      </div>
    </div>
  );
}

function BookIcon(props: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
  );
}

function VideoIcon(props: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
      <path d="m22 8-6 4 6 4V8Z" />
      <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
    </svg>
  );
}
