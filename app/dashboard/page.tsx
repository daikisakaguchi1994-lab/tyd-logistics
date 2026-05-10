'use client';

import { HighlightCards } from '@/components/HighlightCards';
import { GrowthChart } from '@/components/GrowthChart';
import { PlayerTable } from '@/components/PlayerTable';
import { WeeklySummary } from '@/components/WeeklySummary';
import { NewsFeed } from '@/components/NewsFeed';
import { PLAYERS, WEEKLY_DATA, getPlayerStats, AI_WEEKLY_SUMMARY } from '@/src/mockData';
import { useRates } from '@/components/RateContext';

export default function DashboardPage() {
  const stats = getPlayerStats();
  const { clientRate, driverRates, getMargin } = useRates();

  const currentWeek = WEEKLY_DATA[WEEKLY_DATA.length - 1];
  const prevWeek = WEEKLY_DATA[WEEKLY_DATA.length - 2];

  const currentWeekTotal = PLAYERS.reduce((s, p) => s + (currentWeek[p.name] as number), 0);
  const prevWeekTotal = PLAYERS.reduce((s, p) => s + (prevWeek[p.name] as number), 0);
  const overallChange = Math.round(((currentWeekTotal - prevWeekTotal) / prevWeekTotal) * 100);
  const totalDeliveries = stats.reduce((s, p) => s + p.monthlyTotal, 0);

  const weeklyRevenue = currentWeekTotal * clientRate;
  const weeklyLabor = PLAYERS.reduce((s, p) => s + (currentWeek[p.name] as number) * (driverRates[p.name] ?? 160), 0);
  const weeklyProfit = weeklyRevenue - weeklyLabor;

  const monthlyRevenue = totalDeliveries * clientRate;
  const monthlyLabor = PLAYERS.reduce((s, p) => {
    const total = WEEKLY_DATA.reduce((sum, w) => sum + (w[p.name] as number), 0);
    return s + total * (driverRates[p.name] ?? 160);
  }, 0);
  const monthlyProfit = monthlyRevenue - monthlyLabor;

  const avgMargin = PLAYERS.reduce((s, p) => s + getMargin(p.name), 0) / PLAYERS.length;
  const profitMargin = clientRate > 0 ? Math.round((avgMargin / clientRate) * 1000) / 10 : 0;

  const mvp = stats.reduce((best, p) => (p.currentWeek > best.currentWeek ? p : best));
  const needsAttention = stats.filter(p => p.change <= -5);

  return (
    <div className="space-y-5">
      <HighlightCards
        totalDeliveries={totalDeliveries}
        currentWeekTotal={currentWeekTotal}
        overallChange={overallChange}
        mvp={mvp}
        needsAttention={needsAttention}
        weeklyRevenue={weeklyRevenue}
        weeklyProfit={weeklyProfit}
        monthlyRevenue={monthlyRevenue}
        monthlyProfit={monthlyProfit}
        profitMargin={profitMargin}
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3">
          <GrowthChart data={WEEKLY_DATA} players={PLAYERS} />
        </div>
        <div className="lg:col-span-2">
          <WeeklySummary summary={AI_WEEKLY_SUMMARY} />
        </div>
      </div>

      <PlayerTable stats={stats} />

      <NewsFeed />
    </div>
  );
}
