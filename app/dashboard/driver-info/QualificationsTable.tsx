'use client';

import { PLAYERS } from '@/src/mockData';
import { DRIVER_RECORDS } from '@/src/mockDriverInfo';
import { calcDaysLeft, calcSeverity, severityColor, daysLeftLabel } from '@/lib/utils';

export function QualificationsOverview({ onSelectDriver }: { onSelectDriver: (name: string) => void }) {
  return (
    <div className="card overflow-hidden">
      <div className="p-4" style={{ borderBottom: '1px solid var(--border-default)' }}>
        <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>資格・保険 一覧表</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full" style={{ minWidth: '800px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-default)' }}>
              {['ドライバー', '免許', '車検', '自賠責', '任意保険', '貨物保険', 'リース'].map(h => (
                <th key={h} className="text-left text-[10px] py-2.5 px-3 whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PLAYERS.map(p => {
              const rec = DRIVER_RECORDS[p.name];
              if (!rec) return null;

              const cells = [
                { date: rec.qualifications.license.expiryDate },
                { date: rec.vehicle.inspection.expiryDate },
                { date: rec.qualifications.jibaiseki.expiryDate },
                { date: rec.qualifications.voluntaryInsurance.expiryDate },
                { date: rec.qualifications.cargoInsurance?.expiryDate || '' },
                { date: rec.vehicle.leaseEnd },
              ];

              return (
                <tr key={p.name} className="transition-colors" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td className="py-2.5 px-3">
                    <button onClick={() => onSelectDriver(p.name)}
                      className="flex items-center gap-2 cursor-pointer hover:underline"
                      style={{ background: 'none', border: 'none', padding: 0 }}>
                      <div className="w-6 h-6 flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                        style={{ borderRadius: '4px', background: p.color, color: '#fff' }}>
                        {p.name.charAt(0)}
                      </div>
                      <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{p.name}</span>
                    </button>
                  </td>
                  {cells.map((cell, ci) => {
                    if (!cell.date) {
                      return <td key={ci} className="py-2.5 px-3 text-xs" style={{ color: 'var(--text-disabled)' }}>-</td>;
                    }
                    const sev = calcSeverity(cell.date);
                    const days = calcDaysLeft(cell.date);
                    const c = severityColor(sev);
                    return (
                      <td key={ci} className="py-2.5 px-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[11px] num" style={{ color: 'var(--text-secondary)' }}>{cell.date}</span>
                          {sev !== 'ok' && (
                            <span className="text-[9px] font-semibold num px-1.5 py-0.5 self-start"
                              style={{ background: c.bg, color: c.text, borderRadius: '3px' }}>
                              {daysLeftLabel(days)}
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
