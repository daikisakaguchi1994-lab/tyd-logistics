'use client';

import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Bar } from 'recharts';
import { WEEKLY_DATA, PLAYERS } from '@/src/mockData';
import { useRates } from './RateContext';

function formatYen(n: number): string {
  if (n >= 10000) return `¥${(n / 10000).toFixed(1)}万`;
  return `¥${n.toLocaleString()}`;
}

export function FinanceChart() {
  const { clientRate, driverRates } = useRates();

  const data = WEEKLY_DATA.map(week => {
    const revenue = PLAYERS.reduce((sum, p) => sum + (week[p.name] as number) * clientRate, 0);
    const laborCost = PLAYERS.reduce((sum, p) => sum + (week[p.name] as number) * (driverRates[p.name] ?? 160), 0);
    return {
      week: week.week,
      revenue,
      laborCost,
      profit: revenue - laborCost,
    };
  });

  return (
    <div className="card p-5">
      <h2 className="text-sm font-bold mb-4" style={{ color: 'var(--text-primary)' }}>週次 売上・コスト・粗利</h2>
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
          <CartesianGrid horizontal={true} vertical={false} stroke="#F5F5F7" strokeOpacity={0.05} />
          <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} interval={2} />
          <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false}
            tickFormatter={(v: number) => v >= 10000 ? `${(v / 10000).toFixed(0)}万` : String(v)} />
          <Tooltip
            contentStyle={{ background: '#1A2138', border: '1px solid rgba(255,255,255,0.10)', borderRadius: '10px', fontSize: '12px', color: '#F5F5F7' }}
            formatter={(value: unknown) => formatYen(Number(value))}
          />
          <Bar dataKey="revenue" name="売上" fill="#4B5563" radius={[4, 4, 0, 0]} barSize={24} />
          <Bar dataKey="laborCost" name="人件費" fill="rgba(200,16,46,0.3)" radius={[4, 4, 0, 0]} barSize={24} />
          <Line dataKey="profit" name="粗利" stroke="#D4A437" strokeWidth={2.5} dot={{ r: 4, fill: '#11162A', stroke: '#D4A437', strokeWidth: 2 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export function FinanceTable() {
  const { clientRate, driverRates, getMargin } = useRates();
  const currentWeek = WEEKLY_DATA[WEEKLY_DATA.length - 1];

  const stats = PLAYERS.map(p => {
    const count = currentWeek[p.name] as number;
    const rate = driverRates[p.name] ?? 160;
    const margin = getMargin(p.name);
    return {
      name: p.name,
      count,
      revenue: count * clientRate,
      labor: count * rate,
      profit: count * margin,
      rate,
    };
  }).sort((a, b) => b.count - a.count);

  const totals = stats.reduce((acc, s) => ({
    count: acc.count + s.count,
    revenue: acc.revenue + s.revenue,
    labor: acc.labor + s.labor,
    profit: acc.profit + s.profit,
  }), { count: 0, revenue: 0, labor: 0, profit: 0 });

  return (
    <div className="card p-5">
      <h2 className="text-sm font-bold mb-4" style={{ color: 'var(--text-primary)' }}>ドライバー別 収支内訳（今週）</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <th className="text-left py-2 px-2 font-medium" style={{ color: 'var(--text-muted)' }}>名前</th>
              <th className="text-right py-2 px-2 font-medium" style={{ color: 'var(--text-muted)' }}>単価</th>
              <th className="text-right py-2 px-2 font-medium" style={{ color: 'var(--text-muted)' }}>件数</th>
              <th className="text-right py-2 px-2 font-medium" style={{ color: 'var(--text-muted)' }}>売上</th>
              <th className="text-right py-2 px-2 font-medium" style={{ color: 'var(--text-muted)' }}>報酬</th>
              <th className="text-right py-2 px-2 font-medium" style={{ color: 'var(--text-muted)' }}>粗利</th>
            </tr>
          </thead>
          <tbody>
            {stats.map(s => (
              <tr key={s.name} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td className="py-2.5 px-2 font-medium" style={{ color: 'var(--text-primary)' }}>{s.name}</td>
                <td className="text-right py-2.5 px-2 num" style={{ color: 'var(--text-muted)' }}>¥{s.rate}</td>
                <td className="text-right py-2.5 px-2 num" style={{ color: 'var(--text-secondary)' }}>{s.count}</td>
                <td className="text-right py-2.5 px-2 num" style={{ color: 'var(--text-secondary)' }}>¥{s.revenue.toLocaleString()}</td>
                <td className="text-right py-2.5 px-2 num" style={{ color: 'var(--brand-crimson)' }}>¥{s.labor.toLocaleString()}</td>
                <td className="text-right py-2.5 px-2 num font-semibold" style={{ color: s.profit >= 0 ? 'var(--positive)' : 'var(--negative)' }}>¥{s.profit.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: '2px solid var(--border-default)' }}>
              <td className="py-2.5 px-2 font-bold" style={{ color: 'var(--text-primary)' }}>合計</td>
              <td className="text-right py-2.5 px-2 num" style={{ color: 'var(--text-muted)' }}>-</td>
              <td className="text-right py-2.5 px-2 num font-bold" style={{ color: 'var(--text-primary)' }}>{totals.count}</td>
              <td className="text-right py-2.5 px-2 num font-bold" style={{ color: 'var(--text-primary)' }}>¥{totals.revenue.toLocaleString()}</td>
              <td className="text-right py-2.5 px-2 num font-bold" style={{ color: 'var(--brand-crimson)' }}>¥{totals.labor.toLocaleString()}</td>
              <td className="text-right py-2.5 px-2 num font-bold" style={{ color: totals.profit >= 0 ? 'var(--positive)' : 'var(--negative)' }}>¥{totals.profit.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
