'use client';

import { useState, useEffect, useCallback } from 'react';
import { DriverCard } from '@/components/DriverCard';
import { getPlayerStats, PLAYERS } from '@/src/mockData';

interface Driver {
  index: number;
  name: string;
  userId: string;
  status: string;
  registeredDate: string;
  memo: string;
}

const inputClass = 'bg-elevated text-primary border border-border-default rounded-sm outline-none';

function DriverForm({ driver, onSave, onCancel }: {
  driver?: Driver;
  onSave: (data: Partial<Driver>) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(driver?.name ?? '');
  const [userId, setUserId] = useState(driver?.userId ?? '');
  const [memo, setMemo] = useState(driver?.memo ?? '');

  return (
    <div className="card p-4 space-y-3">
      <h3 className="text-sm font-bold text-primary">
        {driver ? 'ドライバー編集' : '新規ドライバー追加'}
      </h3>
      <div>
        <label className="label block mb-1">名前 *</label>
        <input value={name} onChange={e => setName(e.target.value)}
          className={`w-full text-sm py-1.5 px-2 ${inputClass}`} placeholder="山田太郎" />
      </div>
      <div>
        <label className="label block mb-1">LINE User ID</label>
        <input value={userId} onChange={e => setUserId(e.target.value)}
          className={`w-full text-sm py-1.5 px-2 ${inputClass}`} placeholder="U1234..." />
      </div>
      <div>
        <label className="label block mb-1">メモ</label>
        <textarea value={memo} onChange={e => setMemo(e.target.value)} rows={2}
          className={`w-full text-sm py-1.5 px-2 resize-none ${inputClass}`} placeholder="備考..." />
      </div>
      <div className="flex gap-2 pt-1">
        <button onClick={() => { if (!name.trim()) return; onSave({ ...driver, name, userId, memo }); }}
          className="text-xs px-4 py-2 font-medium cursor-pointer bg-crimson text-primary border-0 rounded-sm">
          {driver ? '更新' : '追加'}
        </button>
        <button onClick={onCancel}
          className="text-xs px-4 py-2 font-medium cursor-pointer bg-surface text-secondary border border-border-default rounded-sm">
          キャンセル
        </button>
      </div>
    </div>
  );
}

function DriverRow({ driver, onEdit, onToggleStatus }: {
  driver: Driver;
  onEdit: () => void;
  onToggleStatus: () => void;
}) {
  const isActive = driver.status === 'active';
  return (
    <div className="card p-3 flex items-center gap-3">
      <div className="w-9 h-9 flex items-center justify-center text-sm font-bold flex-shrink-0 rounded-md bg-crimson-soft text-crimson">
        {driver.name.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-primary">{driver.name}</span>
          <span className={`text-[10px] px-1.5 py-0.5 font-medium ${isActive ? 'text-positive' : 'text-negative'}`}
            style={{
              borderRadius: '4px',
              background: isActive ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
            }}>
            {isActive ? '稼働中' : '停止'}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          {driver.userId && (
            <span className="text-[10px] num text-disabled">
              {driver.userId.slice(0, 8)}...
            </span>
          )}
          {driver.registeredDate && (
            <span className="text-[10px] text-disabled">
              登録: {driver.registeredDate}
            </span>
          )}
        </div>
        {driver.memo && (
          <p className="text-[10px] mt-1 text-muted">{driver.memo}</p>
        )}
      </div>
      <div className="flex gap-1.5 flex-shrink-0">
        <button onClick={onEdit}
          className="text-[10px] px-2 py-1.5 cursor-pointer bg-elevated text-secondary border border-border-default rounded-sm">
          編集
        </button>
        <button onClick={onToggleStatus}
          className={`text-[10px] px-2 py-1.5 cursor-pointer border-0 rounded-sm ${isActive ? 'text-negative' : 'text-positive'}`}
          style={{
            background: isActive ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
          }}>
          {isActive ? '停止' : '復帰'}
        </button>
      </div>
    </div>
  );
}

export default function DriversPage() {
  const stats = getPlayerStats();
  const [tab, setTab] = useState<'performance' | 'manage'>('performance');
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formMode, setFormMode] = useState<'closed' | 'add' | 'edit'>('closed');
  const [editTarget, setEditTarget] = useState<Driver | undefined>();

  const fetchDrivers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/drivers');
      if (!res.ok) throw new Error('取得に失敗しました');
      const data = await res.json();
      setDrivers(data.data.drivers);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === 'manage') fetchDrivers();
  }, [tab, fetchDrivers]);

  const handleSave = async (data: Partial<Driver>) => {
    try {
      if (formMode === 'edit' && data.index) {
        await fetch('/api/drivers', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      } else {
        await fetch('/api/drivers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      }
      setFormMode('closed');
      setEditTarget(undefined);
      fetchDrivers();
    } catch {
      setError('保存に失敗しました');
    }
  };

  const handleToggleStatus = async (driver: Driver) => {
    try {
      await fetch('/api/drivers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          index: driver.index,
          status: driver.status === 'active' ? 'inactive' : 'active',
        }),
      });
      fetchDrivers();
    } catch {
      setError('ステータス変更に失敗しました');
    }
  };

  const tabs = [
    { key: 'performance' as const, label: 'パフォーマンス' },
    { key: 'manage' as const, label: 'ドライバー管理' },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-bold text-primary">ドライバー</h1>
          <p className="text-xs mt-1 text-muted">
            {tab === 'performance' ? '個人別のパフォーマンスと AI アドバイス' : 'ドライバーの追加・編集・ステータス管理'}
          </p>
        </div>
        {tab === 'manage' && formMode === 'closed' && (
          <button onClick={() => setFormMode('add')}
            className="text-xs px-3 py-1.5 font-medium cursor-pointer bg-crimson text-primary border-0 rounded-sm">
            + 追加
          </button>
        )}
      </div>

      {/* タブ */}
      <div className="flex gap-1 p-1 bg-surface rounded-md">
        {tabs.map(t => (
          <button key={t.key} onClick={() => { setTab(t.key); setFormMode('closed'); }}
            className={`flex-1 text-xs py-2 font-medium cursor-pointer transition-colors rounded-sm border-0 ${tab === t.key ? 'bg-elevated text-primary' : 'bg-transparent text-muted'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* パフォーマンスタブ */}
      {tab === 'performance' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {stats
            .sort((a, b) => b.currentWeek - a.currentWeek)
            .map(s => {
              const player = PLAYERS.find(p => p.name === s.name)!;
              return (
                <DriverCard
                  key={s.name}
                  player={player}
                  currentWeek={s.currentWeek}
                  change={s.change}
                  monthlyTotal={s.monthlyTotal}
                  badge={s.badge}
                />
              );
            })}
        </div>
      )}

      {/* 管理タブ */}
      {tab === 'manage' && (
        <div className="space-y-3">
          {formMode !== 'closed' && (
            <DriverForm
              driver={formMode === 'edit' ? editTarget : undefined}
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
          ) : drivers.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-xs text-muted">ドライバーが登録されていません</span>
            </div>
          ) : (
            <div className="space-y-2">
              {drivers.map(d => (
                <DriverRow key={d.index} driver={d}
                  onEdit={() => { setEditTarget(d); setFormMode('edit'); }}
                  onToggleStatus={() => handleToggleStatus(d)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
