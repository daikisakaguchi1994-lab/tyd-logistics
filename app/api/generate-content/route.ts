import { NextRequest } from 'next/server';
import { apiOk, apiBadRequest, apiServerError } from '@/lib/apiResponse';
import { createLogger } from '@/lib/logger';
import { getHighlights, getPlayerStats } from '@/src/mockData';

const log = createLogger('api:generate-content');

const TEMPLATES = {
  weekly: (data: ReturnType<typeof getHighlights>) => {
    const stats = getPlayerStats();
    const topDrivers = stats.sort((a, b) => b.currentWeek - a.currentWeek).slice(0, 3);
    return {
      title: '週間実績レポート',
      body: [
        `【TYDロジスティクス 週間実績】`,
        ``,
        `今週の配送実績: ${data.currentWeekTotal.toLocaleString()}件`,
        `前週比: ${data.overallChange >= 0 ? '+' : ''}${data.overallChange}%`,
        `稼働ドライバー: ${stats.length}名`,
        ``,
        `▼ トップパフォーマー`,
        ...topDrivers.map((d, i) => `${['🥇', '🥈', '🥉'][i]} ${d.name}さん: ${d.currentWeek.toLocaleString()}件`),
        ``,
        `#軽貨物 #配送ドライバー #TYDロジスティクス #ドライバー募集`,
      ].join('\n'),
    };
  },
  recruitment: () => ({
    title: '採用投稿テンプレート',
    body: [
      `【ドライバー募集中！】`,
      ``,
      `TYDロジスティクスでは、軽貨物配送ドライバーを募集しています。`,
      ``,
      `✅ 未経験OK`,
      `✅ 1個あたり160円〜`,
      `✅ 月収25万〜35万円可能`,
      `✅ 車両リースあり`,
      `✅ 日払い相談OK`,
      ``,
      `まずはLINEでお気軽にご連絡ください！`,
      ``,
      `#ドライバー募集 #軽貨物 #配送 #未経験歓迎 #福岡`,
    ].join('\n'),
  }),
  achievement: (data: ReturnType<typeof getHighlights>) => ({
    title: '実績アピール投稿',
    body: [
      `【月間配送実績】`,
      ``,
      `TYDロジスティクスの実績をご報告します。`,
      ``,
      `📦 総配送数: ${data.totalDeliveries.toLocaleString()}件`,
      `👥 稼働ドライバー: ${getPlayerStats().length}名`,
      `📈 売上: ¥${data.monthlyRevenue.toLocaleString()}`,
      ``,
      `お客様の荷物を確実にお届けします。`,
      `配送のご相談はお気軽にどうぞ。`,
      ``,
      `#軽貨物配送 #物流 #TYDロジスティクス`,
    ].join('\n'),
  }),
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type } = body;

    if (!type || !['weekly', 'recruitment', 'achievement'].includes(type)) {
      return apiBadRequest('type must be one of: weekly, recruitment, achievement');
    }

    const highlights = getHighlights();
    const template = type === 'recruitment'
      ? TEMPLATES.recruitment()
      : TEMPLATES[type as 'weekly' | 'achievement'](highlights);

    log.info('Content generated', { type });
    return apiOk(template);
  } catch (error) {
    log.error('Failed to generate content', error);
    return apiServerError('コンテンツの生成に失敗しました');
  }
}
