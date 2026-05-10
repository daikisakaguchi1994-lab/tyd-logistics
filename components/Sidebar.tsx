'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useRates } from './RateContext';
import { PLAYERS } from '@/src/mockData';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

function IconGrid() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="11" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="1" y="11" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="11" y="11" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  );
}

function IconUsers() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="7" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M2 15c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="13" cy="6" r="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M14 10.5c1.66.88 2.5 2.26 2.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function IconYen() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M4 3l5 6 5-6M4 11h10M4 14h10M9 9v7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconReport() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M4 2h7l4 4v10a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M11 2v4h4M6 9h6M6 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconSettings() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M9 1.5v2M9 14.5v2M1.5 9h2M14.5 9h2M3.7 3.7l1.4 1.4M12.9 12.9l1.4 1.4M3.7 14.3l1.4-1.4M12.9 5.1l1.4-1.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function IconTruck() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M1 3h10v9H1zM11 7h3l2 3v3h-5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="4.5" cy="13.5" r="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="13.5" cy="13.5" r="1.5" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  );
}

function IconInvoice() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="2" y="1" width="14" height="16" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M5 5h8M5 8h8M5 11h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function IconOutsource() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M9 1v4M9 13v4M1 9h4M13 9h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="9" cy="9" r="3" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  );
}

function IconPartner() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="2" y="3" width="14" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M6 7h6M6 10h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function IconRecruit() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="6" r="3" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M3 16c0-3.31 2.69-6 6-6s6 2.69 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M14 3v4M12 5h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

const NAV_ITEMS = [
  { href: '/dashboard', label: '概要', icon: <IconGrid /> },
  { href: '/dashboard/drivers', label: 'ドライバー', icon: <IconUsers /> },
  { href: '/dashboard/driver-info', label: 'ドライバー情報', icon: <IconTruck /> },
  { href: '/dashboard/finance', label: '売上管理', icon: <IconYen /> },
  { href: '/dashboard/invoices', label: '請求書', icon: <IconInvoice /> },
  { href: '/dashboard/jobs', label: '案件配信', icon: <IconYen /> },
  { href: '/dashboard/dispatch', label: '配車管理', icon: <IconTruck /> },
  { href: '/dashboard/outsource', label: '外注管理', icon: <IconOutsource /> },
  { href: '/dashboard/partners', label: '取引先', icon: <IconPartner /> },
  { href: '/dashboard/incidents', label: '事故・トラブル', icon: <IconReport /> },
  { href: '/dashboard/recruitment', label: '採用管理', icon: <IconRecruit /> },
  { href: '/dashboard/report', label: '経営レポート', icon: <IconReport /> },
];

const inputClasses = 'bg-surface text-primary border border-border-default rounded-sm outline-none';

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { clientRate, setClientRate, driverRates, setDriverRate, setAllDriverRates, getMargin } = useRates();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [bulkRate, setBulkRate] = useState(160);

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-[240px] flex flex-col
          transition-transform duration-200
          lg:static lg:z-auto lg:translate-x-0
          ${open ? 'translate-x-0' : '-translate-x-full'}
          bg-surface border-r border-r-border-subtle
        `}
      >
        {/* ロゴ */}
        <div className="p-5 flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0 bg-crimson rounded-md text-primary">
            T
          </div>
          <div>
            <p className="text-sm font-bold text-primary">TYD</p>
            <p className="text-xs text-muted">Logistics</p>
          </div>
        </div>

        {/* ナビゲーション */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(item => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm transition-colors rounded-md ${isActive ? 'bg-crimson-soft text-crimson font-semibold' : 'bg-transparent text-secondary font-normal'}`}>
                {item.icon}
                {item.label}
              </Link>
            );
          })}

          {/* 設定トグル */}
          <button
            onClick={() => setSettingsOpen(!settingsOpen)}
            className={`flex items-center gap-3 px-3 py-2.5 text-sm w-full cursor-pointer transition-colors rounded-md ${settingsOpen ? 'bg-elevated text-primary' : 'bg-transparent text-secondary'}`}
          >
            <IconSettings />
            単価設定
            <svg className="ml-auto" width="12" height="12" viewBox="0 0 12 12" fill="none"
              style={{ transform: settingsOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 200ms' }}>
              <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* 設定パネル */}
          {settingsOpen && (
            <div className="px-3 py-3 mx-1 space-y-3 bg-elevated rounded-md">
              {/* 顧客請求単価 */}
              <div>
                <label className="label block mb-1.5">顧客請求単価</label>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted">¥</span>
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={clientRate}
                    onChange={e => {
                      const v = parseInt(e.target.value, 10);
                      if (!isNaN(v) && v >= 1) setClientRate(v);
                    }}
                    className={`w-full text-sm py-1.5 px-2 num ${inputClasses}`}
                  />
                  <span className="text-xs flex-shrink-0 text-muted">/件</span>
                </div>
              </div>

              {/* 一括変更 */}
              <div>
                <label className="label block mb-1.5">ドライバー報酬（一括）</label>
                <div className="flex gap-2">
                  <div className="flex items-center gap-1.5 flex-1">
                    <span className="text-xs text-muted">¥</span>
                    <input
                      type="number"
                      min={1}
                      step={1}
                      value={bulkRate}
                      onChange={e => {
                        const v = parseInt(e.target.value, 10);
                        if (!isNaN(v) && v >= 1) setBulkRate(v);
                      }}
                      className={`w-full text-sm py-1.5 px-2 num ${inputClasses}`}
                    />
                  </div>
                  <button
                    onClick={() => setAllDriverRates(bulkRate)}
                    className="text-xs px-2 py-1.5 cursor-pointer flex-shrink-0 bg-crimson text-primary border-0 rounded-sm"
                  >
                    全員適用
                  </button>
                </div>
              </div>

              {/* 個別ドライバー報酬 */}
              <div>
                <label className="label block mb-1.5">ドライバー個別報酬</label>
                <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                  {PLAYERS.map(p => (
                    <div key={p.name} className="p-2 bg-surface rounded-sm">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-5 h-5 flex items-center justify-center text-[10px] font-bold flex-shrink-0 bg-crimson-soft text-crimson"
                          style={{ borderRadius: '4px' }}>
                          {p.name.charAt(0)}
                        </div>
                        <span className="text-xs font-semibold text-primary">{p.name}</span>
                        <span className="text-[10px] text-disabled">{p.character}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 flex-1">
                          <span className="text-[10px] text-muted">¥</span>
                          <input
                            type="number"
                            min={1}
                            step={1}
                            value={driverRates[p.name] ?? 160}
                            onChange={e => {
                              const v = parseInt(e.target.value, 10);
                              if (!isNaN(v) && v >= 1) setDriverRate(p.name, v);
                            }}
                            className="w-full text-xs py-1 px-1.5 num bg-elevated text-primary border border-border-default rounded-sm outline-none"
                          />
                        </div>
                        <span className={`text-[10px] num font-semibold px-1.5 py-0.5 flex-shrink-0 ${getMargin(p.name) > 0 ? 'text-positive' : 'text-negative'}`} style={{
                          borderRadius: '4px',
                          background: getMargin(p.name) > 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                        }}>
                          粗利 ¥{getMargin(p.name)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </nav>

        {/* 下部 */}
        <div className="p-4 border-t border-t-border-subtle">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full pulse-dot bg-positive" />
            <span className="text-xs text-muted">LIVE</span>
          </div>
        </div>
      </aside>
    </>
  );
}
