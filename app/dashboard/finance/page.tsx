'use client';

import { FinanceChart, FinanceTable } from '@/components/FinanceChart';
import { useRates } from '@/components/RateContext';
import { PLAYERS, WEEKLY_DATA } from '@/src/mockData';

function formatYen(n: number): string {
  if (n >= 10000) return `¥${(n / 10000).toFixed(1)}万`;
  return `¥${n.toLocaleString()}`;
}

export default function FinancePage() {
  const { clientRate, driverRates, getMargin } = useRates();

  const totalDeliveries = PLAYERS.reduce((s, p) =>
    s + WEEKLY_DATA.reduce((sum, w) => sum + (w[p.name] as number), 0), 0);

  const monthlyRevenue = totalDeliveries * clientRate;
  const monthlyLabor = PLAYERS.reduce((s, p) => {
    const total = WEEKLY_DATA.reduce((sum, w) => sum + (w[p.name] as number), 0);
    return s + total * (driverRates[p.name] ?? 160);
  }, 0);
  const monthlyProfit = monthlyRevenue - monthlyLabor;

  const avgMargin = PLAYERS.reduce((s, p) => s + getMargin(p.name), 0) / PLAYERS.length;
  const profitMarginPct = clientRate > 0 ? Math.round((avgMargin / clientRate) * 1000) / 10 : 0;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-bold text-primary">売上管理</h1>
        <p className="text-xs mt-1 text-muted">売上・人件費・粗利の推移と内訳</p>
      </div>

      {/* KPIカード */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="card p-4">
          <p className="label mb-1">月間売上</p>
          <p className="num text-2xl font-bold text-primary">{formatYen(monthlyRevenue)}</p>
        </div>
        <div className="card p-4">
          <p className="label mb-1">月間人件費</p>
          <p className="num text-2xl font-bold text-crimson">{formatYen(monthlyLabor)}</p>
        </div>
        <div className="card p-4">
          <p className="label mb-1">月間粗利</p>
          <p className="num text-2xl font-bold text-positive">{formatYen(monthlyProfit)}</p>
        </div>
        <div className="card p-4">
          <p className="label mb-1">粗利率</p>
          <p className="num text-2xl font-bold text-gold">{profitMarginPct}%</p>
        </div>
      </div>

      <FinanceChart />
      <FinanceTable />
    </div>
  );
}
