'use client';

import { useState, useEffect, useCallback } from 'react';
import { PLAYERS } from '@/src/mockData';

interface Job {
  index: number;
  datetime: string;
  title: string;
  area: string;
  date: string;
  count: number;
  rate: number;
  details: string;
  sentTo: { name: string; userId: string }[];
  status: string;
}

const STATUS_OPTIONS = ['募集中', '確定', '完了', '取消'] as const;

const statusStyle = (s: string) => {
  switch (s) {
    case '募集中': return { bg: 'rgba(59,130,246,0.1)', color: '#3B82F6' };
    case '確定': return { bg: 'rgba(16,185,129,0.1)', color: '#10B981' };
    case '完了': return { bg: 'rgba(107,114,128,0.1)', color: '#6B7280' };
    case '取消': return { bg: 'rgba(239,68,68,0.1)', color: '#EF4444' };
    default: return { bg: 'var(--bg-elevated)', color: 'var(--text-muted)' };
  }
};

const inputClass = 'bg-elevated text-primary border border-border-default rounded-sm outline-none';

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ sentCount: number; errors?: string[] } | null>(null);

  // Form
  const [title, setTitle] = useState('');
  const [area, setArea] = useState('');
  const [date, setDate] = useState(today());
  const [count, setCount] = useState(100);
  const [rate, setRate] = useState(160);
  const [details, setDetails] = useState('');
  const [selectedDrivers, setSelectedDrivers] = useState<Set<string>>(new Set());

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/jobs');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setJobs(data.jobs);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const toggleDriver = (name: string) => {
    setSelectedDrivers(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name); else next.add(name);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedDrivers.size === PLAYERS.length) {
      setSelectedDrivers(new Set());
    } else {
      setSelectedDrivers(new Set(PLAYERS.map(p => p.name)));
    }
  };

  const handleSend = async () => {
    if (!title.trim() || selectedDrivers.size === 0) return;
    setSending(true);
    setResult(null);
    try {
      const drivers = PLAYERS.filter(p => selectedDrivers.has(p.name)).map(p => ({
        name: p.name,
        userId: p.userId,
      }));
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, area, date, count, rate, details, drivers }),
      });
      const data = await res.json();
      setResult(data.data);
      setShowForm(false);
      setTitle('');
      setArea('');
      setDetails('');
      setSelectedDrivers(new Set());
      fetchJobs();
    } catch {
      setResult({ sentCount: 0, errors: ['送信に失敗しました'] });
    } finally {
      setSending(false);
    }
  };

  const updateStatus = async (index: number, status: string) => {
    await fetch('/api/jobs', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ index, status }),
    });
    fetchJobs();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-bold text-primary">案件配信</h1>
          <p className="text-xs mt-1 text-muted">単発案件をドライバーのLINEに配信</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)}
            className="text-xs px-3 py-1.5 font-medium cursor-pointer bg-crimson text-primary border-0 rounded-sm">
            + 案件配信
          </button>
        )}
      </div>

      {/* 送信結果 */}
      {result && (
        <div className={`p-3 rounded-md ${result.errors ? 'text-negative' : 'text-positive'}`} style={{
          background: result.errors ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
        }}>
          <p className="text-xs font-medium">
            {result.sentCount}名に送信しました
            {result.errors && ` / 失敗: ${result.errors.join(', ')}`}
          </p>
        </div>
      )}

      {/* 配信フォーム */}
      {showForm && (
        <div className="card p-4 space-y-4">
          <h3 className="text-sm font-bold text-primary">案件情報</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="label block mb-1">案件名 *</label>
              <input value={title} onChange={e => setTitle(e.target.value)}
                className={`w-full text-sm py-1.5 px-2 ${inputClass}`}
                placeholder="例: 博多区 Amazon配送 急募" />
            </div>
            <div>
              <label className="label block mb-1">エリア</label>
              <input value={area} onChange={e => setArea(e.target.value)}
                className={`w-full text-sm py-1.5 px-2 ${inputClass}`}
                placeholder="博多区・東区" />
            </div>
            <div>
              <label className="label block mb-1">日程</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className={`w-full text-sm py-1.5 px-2 ${inputClass}`} />
            </div>
            <div>
              <label className="label block mb-1">予定件数</label>
              <input type="number" min={0} value={count}
                onChange={e => setCount(parseInt(e.target.value, 10) || 0)}
                className={`w-full text-sm py-1.5 px-2 num ${inputClass}`} />
            </div>
            <div>
              <label className="label block mb-1">単価 (円/件)</label>
              <input type="number" min={1} value={rate}
                onChange={e => setRate(parseInt(e.target.value, 10) || 0)}
                className={`w-full text-sm py-1.5 px-2 num ${inputClass}`} />
            </div>
            <div className="sm:col-span-2">
              <label className="label block mb-1">詳細・備考</label>
              <textarea value={details} onChange={e => setDetails(e.target.value)} rows={2}
                className={`w-full text-sm py-1.5 px-2 resize-none ${inputClass}`}
                placeholder="時間帯、集荷場所、注意事項など..." />
            </div>
          </div>

          {/* ドライバー選択 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label">送信先ドライバー *</label>
              <button onClick={selectAll} className="text-[10px] px-2 py-0.5 cursor-pointer bg-elevated text-secondary border border-border-default rounded-sm">
                {selectedDrivers.size === PLAYERS.length ? '全解除' : '全選択'}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {PLAYERS.map(p => {
                const selected = selectedDrivers.has(p.name);
                return (
                  <button key={p.name} onClick={() => toggleDriver(p.name)}
                    className={`text-xs px-3 py-1.5 cursor-pointer transition-colors rounded-sm ${selected ? 'bg-crimson-soft text-crimson font-semibold' : 'bg-elevated text-secondary font-normal'}`}
                    style={{
                      border: selected ? '2px solid var(--brand-crimson)' : '1px solid var(--border-default)',
                    }}>
                    {p.name}
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] mt-1 text-muted">
              {selectedDrivers.size}名 選択中
            </p>
          </div>

          {/* プレビュー */}
          {title && selectedDrivers.size > 0 && (
            <div>
              <label className="label block mb-1">LINE送信プレビュー</label>
              <pre className="text-[11px] p-3 whitespace-pre-wrap leading-relaxed bg-elevated rounded-md text-secondary">
{`【案件のご案内】

${title}${area ? `\nエリア: ${area}` : ''}${date ? `\n日程: ${date}` : ''}${count ? `\n予定件数: ${count}件` : ''}${rate ? `\n単価: ¥${rate}/件` : ''}${details ? `\n\n${details}` : ''}

対応可能な方はこのメッセージに返信してください。`}
              </pre>
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={handleSend} disabled={sending || !title.trim() || selectedDrivers.size === 0}
              className={`text-xs px-4 py-2 font-medium cursor-pointer text-primary border-0 rounded-sm ${sending ? 'bg-elevated' : 'bg-crimson'}`}
              style={{
                opacity: (!title.trim() || selectedDrivers.size === 0) ? 0.5 : 1,
              }}>
              {sending ? '送信中...' : `${selectedDrivers.size}名に LINE 配信`}
            </button>
            <button onClick={() => { setShowForm(false); setResult(null); }}
              className="text-xs px-4 py-2 font-medium cursor-pointer bg-surface text-secondary border border-border-default rounded-sm">
              キャンセル
            </button>
          </div>
        </div>
      )}

      {/* 配信履歴 */}
      <h3 className="text-sm font-bold text-primary">配信履歴</h3>
      {loading ? (
        <div className="text-center py-8">
          <span className="text-xs text-muted">読み込み中...</span>
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm text-muted">まだ案件を配信していません</p>
        </div>
      ) : (
        <div className="space-y-2">
          {[...jobs].reverse().map(job => {
            const st = statusStyle(job.status);
            return (
              <div key={job.index} className="card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-primary">{job.title}</span>
                      <span className="text-[10px] px-1.5 py-0.5 font-medium"
                        style={{ borderRadius: '4px', background: st.bg, color: st.color }}>
                        {job.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      {job.area && <span className="text-[10px] text-muted">{job.area}</span>}
                      {job.date && <span className="text-[10px] num text-muted">{job.date}</span>}
                      {job.count > 0 && <span className="text-[10px] num text-secondary">{job.count}件</span>}
                      {job.rate > 0 && <span className="text-[10px] num font-semibold text-gold">¥{job.rate}/件</span>}
                    </div>
                    <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                      <span className="text-[10px] text-disabled">送信先:</span>
                      {job.sentTo.map(d => (
                        <span key={d.name} className="text-[10px] px-1.5 py-0.5 bg-elevated text-secondary"
                          style={{ borderRadius: '4px' }}>
                          {d.name}
                        </span>
                      ))}
                    </div>
                    <span className="text-[10px] num text-disabled">{job.datetime}</span>
                  </div>
                  <select value={job.status} onChange={e => updateStatus(job.index, e.target.value)}
                    className={`text-[10px] py-1 px-1.5 cursor-pointer flex-shrink-0 ${inputClass}`}>
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
