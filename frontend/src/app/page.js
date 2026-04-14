import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-8 animate-fade-in">
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            </div>
            <h1 className="text-4xl font-bold gradient-text">Algo Trading</h1>
          </div>
          <p className="text-text-muted text-lg max-w-md mx-auto">Professional algorithmic trading platform with live data, strategy management, and multi-broker integration.</p>
        </div>
        <div className="flex gap-4 justify-center">
          <Link href="/login" className="btn-primary text-lg px-8 py-3">Get Started</Link>
          <Link href="/dashboard/markets" className="btn-secondary text-lg px-8 py-3">View Demo</Link>
        </div>
      </div>
    </div>
  );
}
