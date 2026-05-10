'use client';

import { useState, useMemo } from 'react';
import { PLAYERS } from '@/src/mockData';
import { DRIVER_RECORDS, getAllAlerts } from '@/src/mockDriverInfo';
import { severityColor } from '@/lib/utils';
import { SeverityBadge } from '@/components/ui';
import { AlertDashboard } from './AlertDashboard';
import { QualificationsOverview } from './QualificationsTable';
import { DriverDetailPanel } from './DriverDetailPanel';

type PageView = 'dashboard' | 'list' | 'detail';

export default function DriverInfoPage() {
  const [view, setView] = useState<PageView>('dashboard');
  const [selected, setSelected] = useState<string | null>(null);

  const alerts = useMemo(() => getAllAlerts(), []);

  const expiredCount = alerts.filter(a => a.severity === 'expired').length;
  const urgentCount = alerts.filter(a => a.severity === 'urgent').length;
  const warningCount = alerts.filter(a => a.severity === 'warning').length;

  const selectDriver = (name: string) => {
    setSelected(name);
    setView('detail');
  };

  const selectedRecord = selected ? DRIVER_RECORDS[selected] : null;
  const totalDrivers = PLAYERS.length;
  const driversWithAlerts = new Set(alerts.map(a => a.driverName)).size;

  return (
    <div className="space-y-5">
      {/* ヘッダー */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>ドライバー情報管理</h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            ドライバー・車両・資格情報の一元管理 / 期限アラート / LINE更新通知
          </p>
        </div>
        {view !== 'dashboard' && (
          <button onClick={() => { setView('dashboard'); setSelected(null); }}
            className="text-xs px-3 py-1.5 cursor-pointer"
            style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)', borderRadius: 'var(--r-sm)' }}>
            ダッシュボードに戻る
          </button>
        )}
      </div>

      {/* ダッシュボードビュー */}
      {view === 'dashboard' && (
        <>
          {/* サマリーカード */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="card p-4 text-center">
              <p className="text-2xl num font-bold" style={{ color: 'var(--text-primary)' }}>{totalDrivers}</p>
              <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>登録ドライバー</p>
            </div>
            <div className="card p-4 text-center cursor-pointer" onClick={() => setView('list')}>
              <p className="text-2xl num font-bold" style={{ color: driversWithAlerts > 0 ? 'var(--negative)' : 'var(--positive)' }}>
                {driversWithAlerts}
              </p>
              <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>要対応ドライバー</p>
            </div>
            <div className="card p-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <span className="text-lg num font-bold" style={{ color: '#EF4444' }}>{expiredCount}</span>
                <span className="text-lg num font-bold" style={{ color: '#F97316' }}>{urgentCount}</span>
                <span className="text-lg num font-bold" style={{ color: '#EAB308' }}>{warningCount}</span>
              </div>
              <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                <span style={{ color: '#EF4444' }}>切れ</span> /
                <span style={{ color: '#F97316' }}> 緊急</span> /
                <span style={{ color: '#EAB308' }}> 注意</span>
              </p>
            </div>
            <div className="card p-4 text-center cursor-pointer" onClick={() => setView('list')}>
              <p className="text-2xl num font-bold" style={{ color: 'var(--text-primary)' }}>{totalDrivers - driversWithAlerts}</p>
              <p className="text-[10px] mt-1" style={{ color: 'var(--positive)' }}>問題なし</p>
            </div>
          </div>

          {/* フロー図 */}
          <div className="card p-5">
            <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--text-primary)' }}>運用フロー</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { step: '1', title: '情報の登録・更新', desc: 'ドライバー・車両・資格情報をダッシュボードで一元管理', color: '#2563eb' },
                { step: '2', title: '期限アラート通知', desc: '期限到来時にシステムアラート＋LINEで更新依頼を自動通知', color: '#F97316' },
                { step: '3', title: '更新資料の提出', desc: 'ドライバーが更新した資格・書類をシステムに反映', color: '#10B981' },
              ].map(s => (
                <div key={s.step} className="p-4 relative" style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--r-md)', borderTop: `3px solid ${s.color}` }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 flex items-center justify-center text-[10px] font-bold rounded-full"
                      style={{ background: s.color, color: '#fff' }}>
                      {s.step}
                    </span>
                    <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{s.title}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* アラートダッシュボード */}
          <div>
            <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>期限アラート</h3>
            <AlertDashboard alerts={alerts} onSelectDriver={selectDriver} />
          </div>

          {/* 資格一覧テーブル */}
          <QualificationsOverview onSelectDriver={selectDriver} />

          {/* 全ドライバーリストへ */}
          <button onClick={() => setView('list')}
            className="w-full text-sm py-3 font-medium cursor-pointer"
            style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)', borderRadius: 'var(--r-md)' }}>
            全ドライバー一覧を表示
          </button>
        </>
      )}

      {/* リストビュー */}
      {view === 'list' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-1 space-y-2">
            {PLAYERS.map(p => {
              const rec = DRIVER_RECORDS[p.name];
              const isActive = selected === p.name;
              const driverAlerts = alerts.filter(a => a.driverName === p.name);
              const worstSeverity = driverAlerts.length > 0 ? driverAlerts[0].severity : 'ok';

              return (
                <button
                  key={p.name}
                  onClick={() => selectDriver(p.name)}
                  className="w-full text-left p-3 cursor-pointer transition-colors"
                  style={{
                    background: isActive ? 'var(--brand-crimson-soft)' : 'var(--bg-surface)',
                    border: `1px solid ${isActive ? 'var(--brand-crimson)' : 'var(--border-subtle)'}`,
                    borderRadius: 'var(--r-md)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 flex items-center justify-center text-sm font-bold flex-shrink-0"
                      style={{ borderRadius: 'var(--r-sm)', background: p.color, color: '#fff' }}>
                      {p.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{p.name}</span>
                        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{p.character}</span>
                        {worstSeverity !== 'ok' && (
                          <span className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ background: severityColor(worstSeverity).text }} />
                        )}
                      </div>
                      {rec && (
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{rec.vehicle.model}</span>
                          <span className="text-[10px] num" style={{ color: 'var(--text-disabled)' }}>{rec.vehicle.plateNumber}</span>
                        </div>
                      )}
                      {driverAlerts.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {driverAlerts.slice(0, 2).map((a, i) => (
                            <SeverityBadge key={i} severity={a.severity} />
                          ))}
                          {driverAlerts.length > 2 && (
                            <span className="text-[9px] px-1 py-0.5" style={{ color: 'var(--text-muted)' }}>+{driverAlerts.length - 2}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="lg:col-span-2">
            {selectedRecord ? (
              <DriverDetailPanel record={selectedRecord} onClose={() => { setSelected(null); setView('list'); }} />
            ) : (
              <div className="card p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full"
                  style={{ background: 'var(--bg-elevated)' }}>
                  <svg width="28" height="28" viewBox="0 0 18 18" fill="none">
                    <circle cx="7" cy="5" r="2.5" stroke="var(--text-disabled)" strokeWidth="1.5"/>
                    <path d="M2 15c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="var(--text-disabled)" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>左のリストからドライバーを選択してください</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 詳細ビュー（ダッシュボードから直接遷移） */}
      {view === 'detail' && selectedRecord && (
        <DriverDetailPanel record={selectedRecord} onClose={() => { setSelected(null); setView('dashboard'); }} />
      )}
    </div>
  );
}
