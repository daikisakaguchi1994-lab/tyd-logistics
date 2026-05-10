import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { rateLimit, getClientIP } from '@/lib/apiAuth';
import { apiOk, apiBadRequest, apiServerError } from '@/lib/apiResponse';
import { createLogger } from '@/lib/logger';
import { THRESHOLDS } from '@/src/config';

const log = createLogger('api:analyze-driver');
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface WeekData {
  week: string;
  count: number;
}

export async function POST(request: NextRequest) {
  // レート制限: 1分に3回まで（Claude API max_tokens=1024 のため厳しめ）
  const limited = rateLimit(`analyze:${getClientIP(request)}`, 3, 60_000);
  if (limited) return limited;

  try {
    const body = await request.json();
    const {
      driverName, character, currentWeek, last4Avg, prev4Avg,
      monthChange, teamAvgCurrent, vsTeam, dailyAvg,
      bestWeek, worstWeek, totalDeliveries, recentWeeks,
    } = body;

    if (!driverName || typeof driverName !== 'string') {
      return apiBadRequest('driverName is required');
    }

    const weeklyTrend = (recentWeeks as WeekData[])
      ?.map((w: WeekData) => `${w.week}: ${w.count}件`)
      .join(', ') || '';

    const prompt = `あなたは運送会社の管理者向けAIアドバイザーです。以下のドライバーのデータを分析し、JSON形式で結果を返してください。

【ドライバー情報】
名前: ${driverName}
タイプ: ${character}
今週の配送件数: ${currentWeek}件
直近4週平均: ${last4Avg}件
前月4週平均: ${prev4Avg}件
前月比: ${monthChange >= 0 ? '+' : ''}${monthChange}%
チーム平均: ${teamAvgCurrent}件 (vs チーム: ${vsTeam >= 0 ? '+' : ''}${vsTeam}%)
1日平均: ${dailyAvg}件
自己ベスト: ${bestWeek}件 / 最低: ${worstWeek}件
累計配送数: ${totalDeliveries}件
直近8週の推移: ${weeklyTrend}

【分析の観点】
1. パフォーマンス評価（数値に基づく客観的評価）
2. トレンド分析（上昇/下降/安定の判断と理由）
3. 稼働パターン（件数の波から推測される稼働日数や体調管理）
4. チーム内ポジション（チーム平均との比較、役割）
5. コミュニケーション戦略（この人のタイプ「${character}」に合わせた効果的な声かけ方法。ポジティブ→課題→アクションの順で。数字を根拠にして。他人との比較ではなく本人の過去データとの比較で。）
6. 推奨メッセージ（実際にLINEで送る自然な文面。フランクすぎず硬すぎず、120文字以内。数字を1つ以上含める）

以下のJSON形式で返してください（JSONのみ、マークダウン不要）:
{
  "performance": "パフォーマンス評価テキスト",
  "trend": "トレンド分析テキスト",
  "workPattern": "稼働パターンテキスト",
  "teamComparison": "チーム内ポジションテキスト",
  "communication": "コミュニケーション戦略テキスト",
  "suggestedMessage": "推奨メッセージテキスト"
}`;

    const response = await anthropic.messages.create({
      model: THRESHOLDS.aiModel,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');

    const analysis = JSON.parse(jsonMatch[0]);
    return apiOk({ analysis });
  } catch (error) {
    log.error('Analysis failed', error);
    return apiServerError('AI分析に失敗しました。しばらく待ってからお試しください。');
  }
}
