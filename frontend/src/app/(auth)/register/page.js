'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const u = (f, v) => setForm({ ...form, [f]: v });

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-4"><div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center"><svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg></div><span className="text-2xl font-bold gradient-text">Algo Trading</span></div>
          <p className="text-text-muted text-sm">Create your trading account</p>
        </div>
        <div className="glass-card p-8">
          <div className="space-y-4">
            <div><label className="text-xs font-medium text-text-muted mb-1.5 block">Full Name</label><input type="text" value={form.name} onChange={e => u('name', e.target.value)} placeholder="Alex Trading" className="input-field" /></div>
            <div><label className="text-xs font-medium text-text-muted mb-1.5 block">Email</label><input type="email" value={form.email} onChange={e => u('email', e.target.value)} placeholder="you@example.com" className="input-field" /></div>
            <div><label className="text-xs font-medium text-text-muted mb-1.5 block">Password</label><input type="password" value={form.password} onChange={e => u('password', e.target.value)} placeholder="Min 8 characters" className="input-field" /></div>
            <div><label className="text-xs font-medium text-text-muted mb-1.5 block">Confirm Password</label><input type="password" value={form.confirm} onChange={e => u('confirm', e.target.value)} placeholder="Re-enter password" className="input-field" /></div>
            <Link href="/dashboard/markets" className="btn-primary w-full text-center block">Create Account</Link>
          </div>
        </div>
        <p className="text-center text-xs text-text-muted mt-6">Already have an account? <Link href="/login" className="text-accent hover:underline">Sign in</Link></p>
      </div>
    </div>
  );
}
