'use client';

import { useState, useEffect, useCallback } from 'react';
import { PLAYERS } from '@/src/mockData';

interface Incident {
  index: number;
  datetime: string;
  driverName: string;
  type: string;
  severity: string;
  description: string;
  status: string;
  resolution: string;
  reportedBy: string;
}

const TYPES = ['物損事故', '人身事故', '荷物破損', '遅延', '顧客クレーム', 'その他'] as const;
const SEVERITIES = ['軽微', '中程度', '重大'] as const;
const STATUSES = ['未対応', '対応中', '解決済み'] as const;

const severityStyle = (s: string) => {
  switch (s) {
    case '重大': return { bg: 'rgba(239,68,68,0.1)', color: '#EF4444' };
    case '中程度': return { bg: 'rgba(234,179,8,0.1)', color: '#EAB308' };
    default: return { bg: 'rgba(59,130,246,0.1)', color: '#3B82F6' };
  }
};

const statusStyle = (s: string) => {
  switch (s) {
    case '解決済み': return { bg: 'rgba(16,185,129,0.1)', color: '#10B981' };
    case '対応中': return { bg: 'rgba(234,179,8,0.1)', color: '#EAB308' };
    default: return { bg: 'rgba(239,68,68,0.1)', color: '#EF4444' };
  }
};

const inputClass = 'bg-elevated text-primary border border-border-default rounded-sm outline-none';

export default function IncidentsPage() {
  const [items, setItems] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [resolveTarget, setResolveTarget] = useState<Incident | null>(null);
  const [resolution, setResolution] = useState('');

  // Form
  const [formDriver, setFormDriver] = useState(PLAYERS[0]?.name ?? '');
  const [formType, setFormType] = useState<string>(TYPES[0]);
  const [formSeverity, setFormSeverity] = useState<string>(SEVERITIES[0]);
  const [formDesc, setFormDesc] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/incidents');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setItems(data.incidents);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleReport = async () => {
    try {
      await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driverName: formDriver,
          type: formType,
          severity: formSeverity,
          description: formDesc,
        }),
      });
      setShowForm(false);
      setFormDesc('');
      fetchData();
    } catch { /* ignore */ }
  };

  const updateStatus = async (index: number, status: string, res?: string) => {
    await fetch('/api/incidents', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ index, status, ...(res ? { resolution: res } : {}) }),
    });
    setResolveTarget(null);
    setResolution('');
    fetchData();
  };

  const openCount = items.filter(i => i.status !== '解決済み').length;
  const severeCount = items.filter(i => i.severity === '重大' && i.status !== '解決済み').length;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-bold text-primary">事故・トラブル管理</h1>
          <p className="text-xs mt-1 text-muted">事故報告・対応状況の追跡</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)}
            className="text-xs px-3 py-1.5 font-medium cursor-pointer bg-crimson text-primary border-0 rounded-sm">
            + 報告
          </button>
        )}
      </div>

      {/* サマリー */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card p-3 text-center">
          <p className={`text-xl num font-bold ${openCount > 0 ? 'text-negative' : 'text-positive'}`}>{openCount}</p>
          <p className="text-[10px] text-muted">未解決</p>
        </div>
        <div className="card p-3 text-center">
          <p className="text-xl num font-bold" style={{ color: severeCount > 0 ? '#EF4444' : 'var(--positive)' }}>{severeCount}</p>
          <p className="text-[10px] text-muted">重大（未解決）</p>
        </div>
        <div className="card p-3 text-center">
          <p className="text-xl num font-bold text-primary">{items.length}</p>
          <p className="text-[10px] text-muted">累計件数</p>
        </div>
      </div>

      {/* 報告フォーム */}
      {showForm && (
        <div className="card p-4 space-y-3">
          <h3 className="text-sm font-bold text-primary">事故・トラブル報告</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="label block mb-1">ドライバー</label>
              <select value={formDriver} onChange={e => setFormDriver(e.target.value)}
                className={`w-full text-sm py-1.5 px-2 ${inputClass}`}>
                {PLAYERS.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label block mb-1">種別</label>
              <select value={formType} onChange={e => setFormType(e.target.value)}
                className={`w-full text-sm py-1.5 px-2 ${inputClass}`}>
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label block mb-1">深刻度</label>
              <select value={formSeverity} onChange={e => setFormSeverity(e.target.value)}
                className={`w-full text-sm py-1.5 px-2 ${inputClass}`}>
                {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="sm:col-span-3">
              <label className="label block mb-1">詳細</label>
              <textarea value={formDesc} onChange={e => setFormDesc(e.target.value)} rows={3}
                className={`w-full text-sm py-1.5 px-2 resize-none ${inputClass}`}
                placeholder="事故の状況、場所、時間など..." />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleReport}
              className="text-xs px-4 py-2 font-medium cursor-pointer bg-crimson text-primary border-0 rounded-sm">
              報告する
            </button>
            <button onClick={() => setShowForm(false)}
              className="text-xs px-4 py-2 font-medium cursor-pointer bg-surface text-secondary border border-border-default rounded-sm">
              キャンセル
            </button>
          </div>
        </div>
      )}

      {/* 解決入力 */}
      {resolveTarget && (
        <div className="card p-4 space-y-3">
          <h3 className="text-sm font-bold text-primary">
            解決内容を入力 — {resolveTarget.driverName} / {resolveTarget.type}
          </h3>
          <textarea value={resolution} onChange={e => setResolution(e.target.value)} rows={2}
            className={`w-full text-sm py-1.5 px-2 resize-none ${inputClass}`}
            placeholder="対応内容、再発防止策など..." />
          <div className="flex gap-2">
            <button onClick={() => updateStatus(resolveTarget.index, '解決済み', resolution)}
              className="text-xs px-4 py-2 font-medium cursor-pointer bg-positive border-0 rounded-sm"
              style={{ color: '#fff' }}>
              解決済みにする
            </button>
            <button onClick={() => { setResolveTarget(null); setResolution(''); }}
              className="text-xs px-4 py-2 font-medium cursor-pointer bg-surface text-secondary border border-border-default rounded-sm">
              キャンセル
            </button>
          </div>
        </div>
      )}

      {/* リスト */}
      {loading ? (
        <div className="text-center py-8">
          <span className="text-xs text-muted">読み込み中...</span>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm text-muted">事故・トラブルの記録はありません</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map(item => {
            const sev = severityStyle(item.severity);
            const stat = statusStyle(item.status);
            return (
              <div key={item.index} className="card p-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 flex items-center justify-center text-sm font-bold flex-shrink-0 rounded-md"
                    style={{ background: sev.bg, color: sev.color }}>
                    !
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-primary">{item.driverName}</span>
                      <span className="text-[10px] px-1.5 py-0.5 font-medium" style={{ borderRadius: '4px', background: sev.bg, color: sev.color }}>{item.severity}</span>
                      <span className="text-[10px] px-1.5 py-0.5 font-medium" style={{ borderRadius: '4px', background: stat.bg, color: stat.color }}>{item.status}</span>
                      <span className="text-[10px] text-muted">{item.type}</span>
                    </div>
                    {item.description && (
                      <p className="text-xs mt-1 text-secondary">{item.description}</p>
                    )}
                    {item.resolution && (
                      <p className="text-[10px] mt-1 p-1.5 bg-elevated rounded-sm text-positive">
                        対応: {item.resolution}
                      </p>
                    )}
                    <span className="text-[10px] num text-disabled">{item.datetime}</span>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    {item.status === '未対応' && (
                      <button onClick={() => updateStatus(item.index, '対応中')}
                        className="text-[10px] px-2 py-1.5 cursor-pointer border-0 rounded-sm"
                        style={{ background: 'rgba(234,179,8,0.1)', color: '#EAB308' }}>
                        対応開始
                      </button>
                    )}
                    {item.status !== '解決済み' && (
                      <button onClick={() => setResolveTarget(item)}
                        className="text-[10px] px-2 py-1.5 cursor-pointer border-0 rounded-sm"
                        style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981' }}>
                        解決
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
