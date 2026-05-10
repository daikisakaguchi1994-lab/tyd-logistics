'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (data.ok) {
        router.push('/dashboard');
      } else {
        setError(data.error || '認証に失敗しました');
      }
    } catch {
      setError('通信エラーが発生しました');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-base)' }}>
      <div className="w-full max-w-sm bg-surface border border-border-subtle rounded-xl"
        style={{ boxShadow: 'var(--shadow-elevated)' }}>
        <div className="p-8">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 flex items-center justify-center text-lg font-bold bg-crimson rounded-md text-primary">
              T
            </div>
            <div>
              <p className="text-lg font-bold text-primary">TYD</p>
              <p className="text-xs text-muted">Logistics Dashboard</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label block mb-2">パスワード</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="パスワードを入力"
                autoFocus
                className="w-full text-sm py-3 px-4 bg-elevated text-primary border border-border-default rounded-md outline-none"
              />
            </div>

            {error && (
              <p className="text-xs text-center py-2 px-3 text-negative rounded-sm"
                style={{ background: 'rgba(239,68,68,0.1)' }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full text-sm font-semibold py-3 cursor-pointer transition-opacity text-primary border-0 rounded-md"
              style={{
                background: loading || !password ? 'var(--text-disabled)' : 'var(--brand-crimson)',
              }}
            >
              {loading ? 'ログイン中...' : 'ログイン'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
