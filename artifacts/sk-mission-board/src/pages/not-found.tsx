import { AlertCircle } from 'lucide-react';
import { Link } from 'wouter';

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background px-4 text-center">
      <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
        <AlertCircle className="h-10 w-10 text-red-500" />
      </div>
      <h1 className="text-4xl font-bold text-white mb-3">404</h1>
      <p className="text-xl text-muted-foreground mb-2">Page Not Found</p>
      <p className="text-sm text-muted-foreground mb-8 max-w-xs">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        href="/"
        className="px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );
}
