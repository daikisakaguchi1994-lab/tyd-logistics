'use client';

import { useState, useEffect, useCallback } from 'react';

interface Outsource {
  index: number;
  company: string;
  contactPerson: string;
  phone: string;
  area: string;
  rate: number;
  status: string;
  notes: string;
}

const inputClass = 'bg-elevated text-primary border border-border-default rounded-sm outline-none';

export default function OutsourcePage() {
  const [items, setItems] = useState<Outsource[]>([]);
  const [loading, setLoading] = useState(true);
  const [formMode, setFormMode] = useState<'closed' | 'add' | 'edit'>('closed');
  const [editTarget, setEditTarget] = useState<Outsource | undefined>();

  // Form
  const [form, setForm] = useState({ company: '', contactPerson: '', phone: '', area: '', rate: 150, notes: '' });
  const set = (key: string, value: string | number) => setForm(prev => ({ ...prev, [key]: value }));

  const resetForm = () => setForm({ company: '', contactPerson: '', phone: '', area: '', rate: 150, notes: '' });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/outsource');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setItems(data.data.outsources);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openEdit = (item: Outsource) => {
    setEditTarget(item);
    setForm({ company: item.company, contactPerson: item.contactPerson, phone: item.phone, area: item.area, rate: item.rate, notes: item.notes });
    setFormMode('edit');
  };

  const handleSave = async () => {
    if (!form.company.trim()) return;
    try {
      if (formMode === 'edit' && editTarget) {
        await fetch('/api/outsource', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ index: editTarget.index, ...form }),
        });
      } else {
        await fetch('/api/outsource', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      }
      setFormMode('closed');
      setEditTarget(undefined);
      resetForm();
      fetchData();
    } catch { /* ignore */ }
  };

  const toggleStatus = async (item: Outsource) => {
    await fetch('/api/outsource', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ index: item.index, status: item.status === '取引中' ? '停止' : '取引中' }),
    });
    fetchData();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-bold text-primary">外注管理</h1>
          <p className="text-xs mt-1 text-muted">外注先の登録・管理</p>
        </div>
        {formMode === 'closed' && (
          <button onClick={() => { resetForm(); setFormMode('add'); }}
            className="text-xs px-3 py-1.5 font-medium cursor-pointer bg-crimson text-primary border-0 rounded-sm">
            + 追加
          </button>
        )}
      </div>

      {formMode !== 'closed' && (
        <div className="card p-4 space-y-3">
          <h3 className="text-sm font-bold text-primary">
            {formMode === 'edit' ? '外注先編集' : '新規外注先'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="label block mb-1">会社名 *</label>
              <input value={form.company} onChange={e => set('company', e.target.value)}
                className={`w-full text-sm py-1.5 px-2 ${inputClass}`} />
            </div>
            <div>
              <label className="label block mb-1">担当者</label>
              <input value={form.contactPerson} onChange={e => set('contactPerson', e.target.value)}
                className={`w-full text-sm py-1.5 px-2 ${inputClass}`} />
            </div>
            <div>
              <label className="label block mb-1">電話</label>
              <input value={form.phone} onChange={e => set('phone', e.target.value)}
                className={`w-full text-sm py-1.5 px-2 ${inputClass}`} />
            </div>
            <div>
              <label className="label block mb-1">対応エリア</label>
              <input value={form.area} onChange={e => set('area', e.target.value)}
                className={`w-full text-sm py-1.5 px-2 ${inputClass}`} placeholder="博多区, 東区" />
            </div>
            <div>
              <label className="label block mb-1">単価 (円/件)</label>
              <input type="number" min={1} value={form.rate}
                onChange={e => set('rate', parseInt(e.target.value, 10) || 0)}
                className={`w-full text-sm py-1.5 px-2 num ${inputClass}`} />
            </div>
            <div>
              <label className="label block mb-1">メモ</label>
              <input value={form.notes} onChange={e => set('notes', e.target.value)}
                className={`w-full text-sm py-1.5 px-2 ${inputClass}`} />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave}
              className="text-xs px-4 py-2 font-medium cursor-pointer bg-crimson text-primary border-0 rounded-sm">
              {formMode === 'edit' ? '更新' : '追加'}
            </button>
            <button onClick={() => { setFormMode('closed'); setEditTarget(undefined); resetForm(); }}
              className="text-xs px-4 py-2 font-medium cursor-pointer bg-surface text-secondary border border-border-default rounded-sm">
              キャンセル
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <span className="text-xs text-muted">読み込み中...</span>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm text-muted">外注先が登録されていません</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map(item => {
            const isActive = item.status === '取引中';
            return (
              <div key={item.index} className="card p-3 flex items-center gap-3">
                <div className="w-9 h-9 flex items-center justify-center text-sm font-bold flex-shrink-0 rounded-md bg-elevated text-primary">
                  {item.company.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-primary">{item.company}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 font-medium ${isActive ? 'text-positive' : 'text-disabled'}`}
                      style={{
                        borderRadius: '4px',
                        background: isActive ? 'rgba(16,185,129,0.1)' : 'rgba(107,114,128,0.1)',
                      }}>
                      {item.status}
                    </span>
                    {item.area && <span className="text-[10px] text-muted">{item.area}</span>}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    {item.contactPerson && <span className="text-[10px] text-secondary">{item.contactPerson}</span>}
                    {item.phone && <span className="text-[10px] text-secondary">{item.phone}</span>}
                    {item.rate > 0 && <span className="text-[10px] num font-semibold text-gold">¥{item.rate}/件</span>}
                  </div>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <button onClick={() => openEdit(item)}
                    className="text-[10px] px-2 py-1.5 cursor-pointer bg-elevated text-secondary border border-border-default rounded-sm">
                    編集
                  </button>
                  <button onClick={() => toggleStatus(item)}
                    className={`text-[10px] px-2 py-1.5 cursor-pointer border-0 rounded-sm ${isActive ? 'text-negative' : 'text-positive'}`}
                    style={{
                      background: isActive ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                    }}>
                    {isActive ? '停止' : '復帰'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
