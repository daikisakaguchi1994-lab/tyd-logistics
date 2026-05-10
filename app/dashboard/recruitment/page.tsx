'use client';

import { useState, useEffect, useCallback } from 'react';

interface Lead {
  index: number;
  datetime: string;
  displayName: string;
  userId: string;
  message: string;
  status: string;
  source: string;
}

const STATUS_OPTIONS = ['新規', '連絡済み', '面談予定', '採用', '不採用', '辞退'] as const;

const statusStyle = (status: string) => {
  switch (status) {
    case '新規': return { bg: 'rgba(59,130,246,0.1)', color: '#3B82F6' };
    case '連絡済み': return { bg: 'rgba(234,179,8,0.1)', color: '#EAB308' };
    case '面談予定': return { bg: 'rgba(168,85,247,0.1)', color: '#A855F7' };
    case '採用': return { bg: 'rgba(16,185,129,0.1)', color: '#10B981' };
    case '不採用': return { bg: 'rgba(107,114,128,0.1)', color: '#6B7280' };
    case '辞退': return { bg: 'rgba(239,68,68,0.1)', color: '#EF4444' };
    default: return { bg: 'var(--bg-elevated)', color: 'var(--text-muted)' };
  }
};

export default function RecruitmentPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/recruitment');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setLeads(data.data.leads);
    } catch {
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const updateStatus = async (index: number, status: string) => {
    try {
      await fetch('/api/recruitment', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ index, status }),
      });
      fetchLeads();
    } catch { /* error silently */ }
  };

  const filtered = filter === 'all' ? leads : leads.filter(l => l.status === filter);

  // Pipeline counts
  const counts = STATUS_OPTIONS.reduce((acc, s) => {
    acc[s] = leads.filter(l => l.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-bold text-primary">採用管理</h1>
        <p className="text-xs mt-1 text-muted">
          LINE経由の応募者パイプライン管理
        </p>
      </div>

      {/* ファネル概要 */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {STATUS_OPTIONS.map(s => {
          const st = statusStyle(s);
          return (
            <button key={s} onClick={() => setFilter(filter === s ? 'all' : s)}
              className="card p-3 text-center cursor-pointer transition-all rounded-md"
              style={{
                border: filter === s ? `2px solid ${st.color}` : '1px solid var(--border-subtle)',
              }}>
              <p className="text-xl num font-bold" style={{ color: st.color }}>{counts[s] || 0}</p>
              <p className="text-[10px] mt-0.5 text-muted">{s}</p>
            </button>
          );
        })}
      </div>

      {/* リスト */}
      {loading ? (
        <div className="text-center py-8">
          <span className="text-xs text-muted">読み込み中...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-elevated">

            <svg width="28" height="28" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="6" r="3" stroke="var(--text-disabled)" strokeWidth="1.5"/>
              <path d="M3 16c0-3.31 2.69-6 6-6s6 2.69 6 6" stroke="var(--text-disabled)" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <p className="text-sm text-muted">
            {filter === 'all' ? '応募者はまだいません' : `「${filter}」の応募者はいません`}
          </p>
          <p className="text-xs mt-1 text-disabled">
            LINEで「応募」「働きたい」等のメッセージが届くと自動登録されます
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(lead => {
            const st = statusStyle(lead.status);
            return (
              <div key={lead.index} className="card p-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 flex items-center justify-center text-sm font-bold flex-shrink-0 rounded-md bg-crimson-soft text-crimson">
                    {lead.displayName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-primary">
                        {lead.displayName}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 font-medium"
                        style={{ borderRadius: '4px', background: st.bg, color: st.color }}>
                        {lead.status}
                      </span>
                      <span className="text-[10px] text-disabled">
                        {lead.source}
                      </span>
                    </div>
                    <p className="text-xs mt-1 text-secondary">
                      {lead.message}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] num text-disabled">
                        {lead.datetime}
                      </span>
                      {lead.userId && (
                        <span className="text-[10px] num text-disabled">
                          ID: {lead.userId.slice(0, 8)}...
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <select
                      value={lead.status}
                      onChange={e => updateStatus(lead.index, e.target.value)}
                      className="text-[10px] py-1 px-1.5 cursor-pointer bg-elevated text-primary border border-border-default rounded-sm outline-none">
                      {STATUS_OPTIONS.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* フィルタークリア */}
      {filter !== 'all' && (
        <button onClick={() => setFilter('all')}
          className="text-xs px-3 py-1.5 cursor-pointer bg-surface text-secondary border border-border-default rounded-sm">
          フィルター解除
        </button>
      )}
    </div>
  );
}
