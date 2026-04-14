'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-4"><div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center"><svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg></div><span className="text-2xl font-bold gradient-text">Algo Trading</span></div>
          <p className="text-text-muted text-sm">Sign in to your trading account</p>
        </div>
        <div className="glass-card p-8">
          <div className="space-y-5">
            <div><label className="text-xs font-medium text-text-muted mb-1.5 block">Email Address</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="input-field" /></div>
            <div><label className="text-xs font-medium text-text-muted mb-1.5 block">Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="input-field" /></div>
            <div className="flex items-center justify-between"><label className="flex items-center gap-2 text-xs text-text-muted cursor-pointer"><input type="checkbox" className="w-3.5 h-3.5 rounded border-border bg-surface accent-accent" />Remember me</label><a href="#" className="text-xs text-accent hover:underline">Forgot password?</a></div>
            <Link href="/dashboard/markets" className="btn-primary w-full text-center block">Sign In</Link>
          </div>
          <div className="mt-5 p-3 rounded-lg bg-background/40 border border-border/50"><p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Demo Credentials</p><p className="text-xs font-mono text-text-secondary">demo@algotradehub.com / demo123456</p></div>
        </div>
        <p className="text-center text-xs text-text-muted mt-6">Don&apos;t have an account? <Link href="/register" className="text-accent hover:underline">Create one</Link></p>
      </div>
    </div>
  );
}
