'use client';

import { DriverCard } from '@/components/DriverCard';
import { getPlayerStats, PLAYERS } from '@/src/mockData';

export default function DriversPage() {
  const stats = getPlayerStats();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>ドライバー</h1>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>個人別のパフォーマンスと AI アドバイス</p>
      </div>

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
    </div>
  );
}
