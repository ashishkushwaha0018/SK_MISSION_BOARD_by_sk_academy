import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface NotesSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function NotesSearch({ value, onChange, placeholder = "Search chapters...", className }: NotesSearchProps) {
  return (
    <div className={cn("relative", className)}>
      <Search
        size={15}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-card border border-white/10 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/30 text-sm text-white placeholder:text-muted-foreground transition-colors"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
