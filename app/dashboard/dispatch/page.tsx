'use client';

import { useState, useEffect, useCallback } from 'react';
import { PLAYERS } from '@/src/mockData';

interface Dispatch {
  index: number;
  date: string;
  driverName: string;
  area: string;
  estimatedCount: number;
  status: string;
  notes: string;
  createdAt: string;
}

const STATUS_OPTIONS = ['予定', '稼働中', '完了', 'キャンセル'] as const;

const statusStyle = (status: string) => {
  switch (status) {
    case '予定': return { bg: 'rgba(59,130,246,0.1)', color: '#3B82F6' };
    case '稼働中': return { bg: 'rgba(234,179,8,0.1)', color: '#EAB308' };
    case '完了': return { bg: 'rgba(16,185,129,0.1)', color: '#10B981' };
    case 'キャンセル': return { bg: 'rgba(107,114,128,0.1)', color: '#6B7280' };
    default: return { bg: 'var(--bg-elevated)', color: 'var(--text-muted)' };
  }
};

const inputClass = 'bg-elevated text-primary border border-border-default rounded-sm outline-none';

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function DispatchPage() {
  const [dispatches, setDispatches] = useState<Dispatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterDate, setFilterDate] = useState(today());

  // Form state
  const [formDate, setFormDate] = useState(today());
  const [formDriver, setFormDriver] = useState(PLAYERS[0]?.name ?? '');
  const [formArea, setFormArea] = useState('');
  const [formCount, setFormCount] = useState(100);
  const [formNotes, setFormNotes] = useState('');

  const fetchDispatches = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/dispatch');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setDispatches(data.data.dispatches);
    } catch {
      setDispatches([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDispatches(); }, [fetchDispatches]);

  const handleAdd = async () => {
    if (!formDriver) return;
    try {
      await fetch('/api/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: formDate,
          driverName: formDriver,
          area: formArea,
          estimatedCount: formCount,
          notes: formNotes,
        }),
      });
      setShowForm(false);
      setFormArea('');
      setFormNotes('');
      fetchDispatches();
    } catch { /* ignore */ }
  };

  const updateStatus = async (index: number, status: string) => {
    try {
      await fetch('/api/dispatch', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ index, status }),
      });
      fetchDispatches();
    } catch { /* ignore */ }
  };

  const filtered = filterDate
    ? dispatches.filter(d => d.date === filterDate)
    : dispatches;

  const counts = STATUS_OPTIONS.reduce((acc, s) => {
    acc[s] = filtered.filter(d => d.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-bold text-primary">配車管理</h1>
          <p className="text-xs mt-1 text-muted">ドライバーへの配車割り当て・ステータス管理</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)}
            className="text-xs px-3 py-1.5 font-medium cursor-pointer bg-crimson text-primary border-0 rounded-sm">
            + 配車追加
          </button>
        )}
      </div>

      {/* 日付フィルター */}
      <div className="flex items-center gap-3">
        <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
          className={`text-xs py-1.5 px-2 ${inputClass}`} />
        <button onClick={() => setFilterDate('')}
          className="text-[10px] px-2 py-1 cursor-pointer bg-surface text-secondary border border-border-default rounded-sm">
          全期間
        </button>
        <div className="flex gap-2 ml-auto">
          {STATUS_OPTIONS.map(s => {
            const st = statusStyle(s);
            return (
              <span key={s} className="text-[10px] px-1.5 py-0.5" style={{ background: st.bg, color: st.color, borderRadius: '4px' }}>
                {s}: {counts[s] || 0}
              </span>
            );
          })}
        </div>
      </div>

      {/* 追加フォーム */}
      {showForm && (
        <div className="card p-4 space-y-3">
          <h3 className="text-sm font-bold text-primary">新規配車</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="label block mb-1">日付</label>
              <input type="date" value={formDate} onChange={e => setFormDate(e.target.value)}
                className={`w-full text-sm py-1.5 px-2 ${inputClass}`} />
            </div>
            <div>
              <label className="label block mb-1">ドライバー</label>
              <select value={formDriver} onChange={e => setFormDriver(e.target.value)}
                className={`w-full text-sm py-1.5 px-2 ${inputClass}`}>
                {PLAYERS.map(p => (
                  <option key={p.name} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label block mb-1">エリア</label>
              <input value={formArea} onChange={e => setFormArea(e.target.value)}
                className={`w-full text-sm py-1.5 px-2 ${inputClass}`} placeholder="博多区" />
            </div>
            <div>
              <label className="label block mb-1">予定件数</label>
              <input type="number" min={0} value={formCount} onChange={e => setFormCount(parseInt(e.target.value, 10) || 0)}
                className={`w-full text-sm py-1.5 px-2 num ${inputClass}`} />
            </div>
            <div className="sm:col-span-2">
              <label className="label block mb-1">備考</label>
              <input value={formNotes} onChange={e => setFormNotes(e.target.value)}
                className={`w-full text-sm py-1.5 px-2 ${inputClass}`} placeholder="特記事項" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd}
              className="text-xs px-4 py-2 font-medium cursor-pointer bg-crimson text-primary border-0 rounded-sm">
              追加
            </button>
            <button onClick={() => setShowForm(false)}
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
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm text-muted">
            {filterDate ? `${filterDate} の配車データはありません` : '配車データがありません'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(d => {
            const st = statusStyle(d.status);
            return (
              <div key={d.index} className="card p-3 flex items-center gap-3">
                <div className="w-9 h-9 flex items-center justify-center text-sm font-bold flex-shrink-0 rounded-md bg-crimson-soft text-crimson">
                  {d.driverName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-primary">{d.driverName}</span>
                    <span className="text-[10px] px-1.5 py-0.5 font-medium"
                      style={{ borderRadius: '4px', background: st.bg, color: st.color }}>
                      {d.status}
                    </span>
                    {d.area && <span className="text-[10px] text-muted">{d.area}</span>}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-[10px] num text-disabled">{d.date}</span>
                    <span className="text-[10px] num text-muted">予定 {d.estimatedCount}件</span>
                    {d.notes && <span className="text-[10px] text-disabled">{d.notes}</span>}
                  </div>
                </div>
                <select value={d.status} onChange={e => updateStatus(d.index, e.target.value)}
                  className={`text-[10px] py-1 px-1.5 cursor-pointer flex-shrink-0 ${inputClass}`}>
                  {STATUS_OPTIONS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
