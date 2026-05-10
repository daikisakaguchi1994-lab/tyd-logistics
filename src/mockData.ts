// === 単価設定（デフォルト） ===
export const DRIVER_RATE = 160;
export const CLIENT_RATE = 180;
export const MARGIN_RATE = 20;

export interface PlayerProfile {
  name: string;
  character: string;
  color: string;
  userId: string;
}

export interface WeeklyData {
  week: string;
  [playerName: string]: number | string;
}

export const PLAYERS: PlayerProfile[] = [
  { name: '田中', character: 'エース', color: '#C8102E', userId: 'U_tanaka' },
  { name: '佐藤', character: 'ベテラン', color: '#2563eb', userId: 'U_sato' },
  { name: '鈴木', character: '安定型', color: '#16a34a', userId: 'U_suzuki' },
  { name: '山本', character: '成長株', color: '#ca8a04', userId: 'U_yamamoto' },
  { name: '伊藤', character: '副業系', color: '#9333ea', userId: 'U_ito' },
  { name: '渡辺', character: 'ムードメーカー', color: '#0ea5e9', userId: 'U_watanabe' },
  { name: '中村', character: '職人気質', color: '#dc2626', userId: 'U_nakamura' },
  { name: '小林', character: '新人', color: '#f97316', userId: 'U_kobayashi' },
  { name: '加藤', character: 'ベテラン', color: '#14b8a6', userId: 'U_kato' },
  { name: '吉田', character: '中堅', color: '#8b5cf6', userId: 'U_yoshida' },
];

// 20週分データ（2025年12月〜2026年5月）— 1人あたり平均120件/日 × 6日 ≒ 720件/週
export const WEEKLY_DATA: WeeklyData[] = [
  { week: '12/22', '田中': 738, '佐藤': 702, '鈴木': 712, '山本': 528, '伊藤': 585, '渡辺': 668, '中村': 735, '小林': 392, '加藤': 715, '吉田': 645 },
  { week: '12/29', '田中': 725, '佐藤': 695, '鈴木': 708, '山本': 542, '伊藤': 548, '渡辺': 675, '中村': 742, '小林': 408, '加藤': 708, '吉田': 652 },
  { week: '1/5',   '田中': 752, '佐藤': 710, '鈴木': 715, '山本': 558, '伊藤': 618, '渡辺': 682, '中村': 738, '小林': 425, '加藤': 702, '吉田': 648 },
  { week: '1/12',  '田中': 768, '佐藤': 698, '鈴木': 720, '山本': 575, '伊藤': 562, '渡辺': 690, '中村': 750, '小林': 445, '加藤': 695, '吉田': 662 },
  { week: '1/19',  '田中': 775, '佐藤': 715, '鈴木': 718, '山本': 590, '伊藤': 598, '渡辺': 698, '中村': 748, '小林': 462, '加藤': 688, '吉田': 655 },
  { week: '1/26',  '田中': 790, '佐藤': 708, '鈴木': 722, '山本': 608, '伊藤': 535, '渡辺': 705, '中村': 755, '小林': 480, '加藤': 680, '吉田': 672 },
  { week: '2/2',   '田中': 785, '佐藤': 712, '鈴木': 710, '山本': 622, '伊藤': 612, '渡辺': 695, '中村': 760, '小林': 498, '加藤': 672, '吉田': 668 },
  { week: '2/9',   '田中': 802, '佐藤': 705, '鈴木': 725, '山本': 638, '伊藤': 575, '渡辺': 710, '中村': 758, '小林': 515, '加藤': 665, '吉田': 680 },
  { week: '2/16',  '田中': 795, '佐藤': 718, '鈴木': 718, '山本': 652, '伊藤': 625, '渡辺': 702, '中村': 765, '小林': 532, '加藤': 658, '吉田': 675 },
  { week: '2/23',  '田中': 812, '佐藤': 700, '鈴木': 728, '山本': 665, '伊藤': 548, '渡辺': 715, '中村': 770, '小林': 548, '加藤': 650, '吉田': 688 },
  { week: '3/2',   '田中': 808, '佐藤': 722, '鈴木': 715, '山本': 678, '伊藤': 630, '渡辺': 708, '中村': 752, '小林': 565, '加藤': 645, '吉田': 695 },
  { week: '3/9',   '田中': 825, '佐藤': 695, '鈴木': 730, '山本': 690, '伊藤': 565, '渡辺': 720, '中村': 768, '小林': 580, '加藤': 638, '吉田': 682 },
  { week: '3/16',  '田中': 818, '佐藤': 710, '鈴木': 722, '山本': 698, '伊藤': 615, '渡辺': 712, '中村': 775, '小林': 598, '加藤': 632, '吉田': 698 },
  { week: '3/23',  '田中': 835, '佐藤': 715, '鈴木': 725, '山本': 708, '伊藤': 580, '渡辺': 725, '中村': 762, '小林': 612, '加藤': 625, '吉田': 705 },
  { week: '3/30',  '田中': 828, '佐藤': 708, '鈴木': 732, '山本': 715, '伊藤': 635, '渡辺': 718, '中村': 778, '小林': 628, '加藤': 618, '吉田': 692 },
  { week: '4/6',   '田中': 842, '佐藤': 720, '鈴木': 720, '山本': 722, '伊藤': 558, '渡辺': 730, '中村': 772, '小林': 642, '加藤': 612, '吉田': 708 },
  { week: '4/13',  '田中': 838, '佐藤': 705, '鈴木': 728, '山本': 730, '伊藤': 620, '渡辺': 722, '中村': 780, '小林': 655, '加藤': 605, '吉田': 698 },
  { week: '4/20',  '田中': 855, '佐藤': 718, '鈴木': 735, '山本': 738, '伊藤': 575, '渡辺': 735, '中村': 768, '小林': 668, '加藤': 598, '吉田': 712 },
  { week: '4/27',  '田中': 848, '佐藤': 710, '鈴木': 722, '山本': 745, '伊藤': 640, '渡辺': 728, '中村': 785, '小林': 678, '加藤': 592, '吉田': 705 },
  { week: '5/4',   '田中': 862, '佐藤': 715, '鈴木': 730, '山本': 752, '伊藤': 598, '渡辺': 738, '中村': 778, '小林': 690, '加藤': 585, '吉田': 718 },
];

export function getPlayerStats() {
  const currentWeek = WEEKLY_DATA[WEEKLY_DATA.length - 1];
  const prevWeek = WEEKLY_DATA[WEEKLY_DATA.length - 2];

  return PLAYERS.map((p) => {
    const current = currentWeek[p.name] as number;
    const prev = prevWeek[p.name] as number;
    const change = Math.round(((current - prev) / prev) * 100);
    const total = WEEKLY_DATA.reduce((sum, w) => sum + (w[p.name] as number), 0);

    let badge = '';
    if (change >= 10) badge = 'MVP';
    else if (change <= -5) badge = '要フォロー';
    else if (p.character === '新人' && change > 0) badge = '成長中';
    else if (p.character === '成長株' && change > 0) badge = '成長中';

    return {
      name: p.name,
      character: p.character,
      color: p.color,
      userId: p.userId,
      currentWeek: current,
      prevWeek: prev,
      change,
      monthlyTotal: total,
      badge,
      weeklyEarnings: current * DRIVER_RATE,
      monthlyEarnings: total * DRIVER_RATE,
    };
  });
}

export function getHighlights() {
  const stats = getPlayerStats();
  const totalDeliveries = stats.reduce((s, p) => s + p.monthlyTotal, 0);
  const currentWeekTotal = stats.reduce((s, p) => s + p.currentWeek, 0);
  const prevWeekTotal = stats.reduce((s, p) => s + p.prevWeek, 0);
  const mvp = stats.reduce((best, p) => (p.currentWeek > best.currentWeek ? p : best));
  const needsAttention = stats.filter((p) => p.change <= -5);

  return {
    totalDeliveries,
    currentWeekTotal,
    overallChange: Math.round(((currentWeekTotal - prevWeekTotal) / prevWeekTotal) * 100),
    mvp,
    needsAttention,
    weeklyRevenue: currentWeekTotal * CLIENT_RATE,
    weeklyProfit: currentWeekTotal * MARGIN_RATE,
    monthlyRevenue: totalDeliveries * CLIENT_RATE,
    monthlyProfit: totalDeliveries * MARGIN_RATE,
  };
}

export function getDriverAdvice(change: number, character: string): { summary: string; action: string } {
  if (character === '新人' && change > 0) {
    return { summary: '成長継続中 - 順調に伸びている', action: '成長を認めて、さらなる目標を提示' };
  }
  if (character === '成長株' && change > 0) {
    return { summary: '着実にレベルアップ中', action: '成長の勢いを褒めて自信をつけさせる' };
  }
  if (change >= 10) return { summary: '絶好調 - 記録更新ペース', action: '成果を認め、この調子を維持する声かけを' };
  if (change >= 3) return { summary: '好調 - 安定した成長', action: '良いペースを褒めてモチベーション維持' };
  if (change >= -3) return { summary: '安定推移 - 大きな変動なし', action: '引き続き安定を維持する声かけを' };
  if (change >= -8) return { summary: 'やや減少傾向', action: '状況をヒアリングし、サポートを検討' };
  return { summary: '要注意 - 減少傾向が続いている', action: '早めに面談し、課題を把握する' };
}

// ドライバー分析用の詳細データ取得
export function getDriverDetailData(name: string) {
  const weeks = WEEKLY_DATA.map(w => ({
    week: w.week,
    count: w[name] as number,
  }));

  const last4 = weeks.slice(-4);
  const prev4 = weeks.slice(-8, -4);
  const last4Avg = Math.round(last4.reduce((s, w) => s + w.count, 0) / last4.length);
  const prev4Avg = prev4.length > 0 ? Math.round(prev4.reduce((s, w) => s + w.count, 0) / prev4.length) : last4Avg;
  const monthChange = Math.round(((last4Avg - prev4Avg) / prev4Avg) * 100);

  // チーム平均との比較
  const teamAvgCurrent = Math.round(
    PLAYERS.reduce((s, p) => s + (WEEKLY_DATA[WEEKLY_DATA.length - 1][p.name] as number), 0) / PLAYERS.length
  );
  const currentWeek = WEEKLY_DATA[WEEKLY_DATA.length - 1][name] as number;
  const vsTeam = Math.round(((currentWeek - teamAvgCurrent) / teamAvgCurrent) * 100);

  // 日あたり平均（6日稼働想定）
  const dailyAvg = Math.round(last4Avg / 6);

  const player = PLAYERS.find(p => p.name === name)!;

  return {
    name,
    character: player.character,
    weeks,
    currentWeek,
    last4Avg,
    prev4Avg,
    monthChange,
    teamAvgCurrent,
    vsTeam,
    dailyAvg,
    totalDeliveries: weeks.reduce((s, w) => s + w.count, 0),
    bestWeek: Math.max(...weeks.map(w => w.count)),
    worstWeek: Math.min(...weeks.map(w => w.count)),
  };
}

export function getFinanceData() {
  return WEEKLY_DATA.map(week => {
    const total = PLAYERS.reduce((sum, p) => sum + (week[p.name] as number), 0);
    return {
      week: week.week,
      deliveries: total,
      revenue: total * CLIENT_RATE,
      laborCost: total * DRIVER_RATE,
      profit: total * MARGIN_RATE,
    };
  });
}

export const AI_WEEKLY_SUMMARY = `【今週のTYDサマリー】

全体：7,166件配送（10名稼働 / 前週比 +0.5%）

注目すべき動き：
  ・田中さんが週862件で自己記録更新 → MVP確定
  ・山本さん（成長株）が5ヶ月で528→752件まで成長 → +42%
  ・小林さん（新人）が入社以来17週連続で成長中
  ・加藤さんの稼働が6週連続で減少傾向 → 要面談
  ・伊藤さんの波が大きい（先週640→今週598）→ スケジュール確認

来週の予測：
  ・金曜は欠勤リスク高（過去パターンより）
  ・GW明けで案件増加見込み

おすすめアクション：
  1. 加藤さんへの面談設定（モチベーション確認）
  2. 田中さんへの称賛（記録更新を認める）
  3. 小林さんへの激励（成長の加速を後押し）
  4. 伊藤さんのシフト調整相談`;
