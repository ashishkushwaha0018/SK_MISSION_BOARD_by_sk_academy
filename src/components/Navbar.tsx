import { Link, useLocation } from "wouter";
import { Menu, X, Download } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home" },
  { href: "/notes", label: "Notes" },
  { href: "/downloads", label: "Downloads" },
  { href: "/videos", label: "Videos" },
  { href: "/about", label: "About" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-lg bg-background/80 border-b border-purple-500/30">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <img
            src="/logo.png"
            alt="SK MISSION BOARD"
            className="h-10 w-10 rounded-xl object-cover border border-purple-500/30 shadow-md shadow-purple-500/20"
          />
          <span className="text-lg md:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 text-glow">
            SK MISSION BOARD
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-all flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:text-purple-400 hover:bg-white/5",
                isActive(link.href)
                  ? "text-purple-400 bg-purple-500/10 border border-purple-500/20 drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]"
                  : "text-muted-foreground"
              )}
            >
              {link.href === "/downloads" && <Download size={15} />}
              {link.label}
            </Link>
          ))}
        </div>

        {/* Mobile Nav Toggle */}
        <button
          className="md:hidden text-foreground hover:text-purple-400 transition-colors p-2"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-white/10 bg-background/95 backdrop-blur-xl absolute top-16 left-0 w-full shadow-2xl">
          <div className="flex flex-col py-4 px-4 gap-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "text-base font-medium px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2",
                  isActive(link.href)
                    ? "bg-purple-500/15 text-purple-400 border border-purple-500/30"
                    : "text-muted-foreground hover:text-purple-400 hover:bg-white/5"
                )}
              >
                {link.href === "/downloads" && <Download size={18} />}
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
