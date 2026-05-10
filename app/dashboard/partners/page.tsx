'use client';

import { useState, useEffect, useCallback } from 'react';

interface Partner {
  index: number;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  billingRate: number;
  paymentTerms: string;
  notes: string;
}

const inputClass = 'bg-elevated text-primary border border-border-default rounded-sm outline-none';

function PartnerForm({ partner, onSave, onCancel }: {
  partner?: Partner;
  onSave: (data: Partial<Partner>) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    name: partner?.name ?? '',
    contactPerson: partner?.contactPerson ?? '',
    phone: partner?.phone ?? '',
    email: partner?.email ?? '',
    address: partner?.address ?? '',
    billingRate: partner?.billingRate ?? 180,
    paymentTerms: partner?.paymentTerms ?? '月末締め翌月末払い',
    notes: partner?.notes ?? '',
  });

  const set = (key: string, value: string | number) => setForm(prev => ({ ...prev, [key]: value }));

  return (
    <div className="card p-4 space-y-3">
      <h3 className="text-sm font-bold text-primary">
        {partner ? '取引先編集' : '新規取引先追加'}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="label block mb-1">会社名 *</label>
          <input value={form.name} onChange={e => set('name', e.target.value)}
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
          <label className="label block mb-1">メール</label>
          <input value={form.email} onChange={e => set('email', e.target.value)}
            className={`w-full text-sm py-1.5 px-2 ${inputClass}`} />
        </div>
        <div className="sm:col-span-2">
          <label className="label block mb-1">住所</label>
          <input value={form.address} onChange={e => set('address', e.target.value)}
            className={`w-full text-sm py-1.5 px-2 ${inputClass}`} />
        </div>
        <div>
          <label className="label block mb-1">請求単価 (円/件)</label>
          <input type="number" min={1} value={form.billingRate}
            onChange={e => set('billingRate', parseInt(e.target.value, 10) || 0)}
            className={`w-full text-sm py-1.5 px-2 num ${inputClass}`} />
        </div>
        <div>
          <label className="label block mb-1">支払条件</label>
          <input value={form.paymentTerms} onChange={e => set('paymentTerms', e.target.value)}
            className={`w-full text-sm py-1.5 px-2 ${inputClass}`} />
        </div>
        <div className="sm:col-span-2">
          <label className="label block mb-1">メモ</label>
          <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2}
            className={`w-full text-sm py-1.5 px-2 resize-none ${inputClass}`} />
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button onClick={() => {
          if (!form.name.trim()) return;
          onSave({ ...partner, ...form });
        }}
          className="text-xs px-4 py-2 font-medium cursor-pointer bg-crimson text-primary border-0 rounded-sm">
          {partner ? '更新' : '追加'}
        </button>
        <button onClick={onCancel}
          className="text-xs px-4 py-2 font-medium cursor-pointer bg-surface text-secondary border border-border-default rounded-sm">
          キャンセル
        </button>
      </div>
    </div>
  );
}

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formMode, setFormMode] = useState<'closed' | 'add' | 'edit'>('closed');
  const [editTarget, setEditTarget] = useState<Partner | undefined>();

  const fetchPartners = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/partners');
      if (!res.ok) throw new Error('取得に失敗しました');
      const data = await res.json();
      setPartners(data.data.partners);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPartners(); }, [fetchPartners]);

  const handleSave = async (data: Partial<Partner>) => {
    try {
      if (formMode === 'edit' && data.index) {
        await fetch('/api/partners', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      } else {
        await fetch('/api/partners', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      }
      setFormMode('closed');
      setEditTarget(undefined);
      fetchPartners();
    } catch {
      setError('保存に失敗しました');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-bold text-primary">取引先マスター</h1>
          <p className="text-xs mt-1 text-muted">取引先の登録・管理</p>
        </div>
        {formMode === 'closed' && (
          <button onClick={() => setFormMode('add')}
            className="text-xs px-3 py-1.5 font-medium cursor-pointer bg-crimson text-primary border-0 rounded-sm">
            + 追加
          </button>
        )}
      </div>

      {formMode !== 'closed' && (
        <PartnerForm
          partner={formMode === 'edit' ? editTarget : undefined}
          onSave={handleSave}
          onCancel={() => { setFormMode('closed'); setEditTarget(undefined); }}
        />
      )}

      {error && (
        <div className="text-xs p-2 text-negative rounded-sm" style={{ background: 'rgba(239,68,68,0.1)' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <span className="text-xs text-muted">読み込み中...</span>
        </div>
      ) : partners.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm text-muted">取引先が登録されていません</p>
        </div>
      ) : (
        <div className="space-y-2">
          {partners.map(p => (
            <div key={p.index} className="card p-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 flex items-center justify-center text-sm font-bold flex-shrink-0 rounded-md bg-elevated text-primary">
                  {p.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-primary">{p.name}</span>
                    {p.contactPerson && (
                      <span className="text-[10px] text-muted">担当: {p.contactPerson}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    {p.phone && (
                      <span className="text-[10px] text-secondary">{p.phone}</span>
                    )}
                    {p.email && (
                      <span className="text-[10px] text-secondary">{p.email}</span>
                    )}
                    {p.billingRate > 0 && (
                      <span className="text-[10px] num font-semibold text-gold">
                        ¥{p.billingRate.toLocaleString()}/件
                      </span>
                    )}
                  </div>
                  {p.address && (
                    <p className="text-[10px] mt-0.5 text-disabled">{p.address}</p>
                  )}
                  {p.paymentTerms && (
                    <span className="text-[10px] text-muted">{p.paymentTerms}</span>
                  )}
                  {p.notes && (
                    <p className="text-[10px] mt-0.5 text-muted">{p.notes}</p>
                  )}
                </div>
                <button onClick={() => { setEditTarget(p); setFormMode('edit'); }}
                  className="text-[10px] px-2 py-1.5 cursor-pointer flex-shrink-0 bg-elevated text-secondary border border-border-default rounded-sm">
                  編集
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
