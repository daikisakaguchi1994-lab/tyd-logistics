import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface WeekData {
  week: string;
  count: number;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      driverName, character, currentWeek, last4Avg, prev4Avg,
      monthChange, teamAvgCurrent, vsTeam, dailyAvg,
      bestWeek, worstWeek, totalDeliveries, recentWeeks,
    } = body;

    const weeklyTrend = (recentWeeks as WeekData[])
      .map((w: WeekData) => `${w.week}: ${w.count}件`)
      .join(', ');

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
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');

    const analysis = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json({
      analysis: {
        performance: '分析データの取得に一時的な問題が発生しました。',
        trend: 'データ不足のため判定保留。',
        workPattern: '稼働パターンの詳細分析には追加データが必要です。',
        teamComparison: 'チーム比較は現在利用できません。',
        communication: '定期的な声かけと1on1ミーティングを推奨します。',
        suggestedMessage: `${(await request.clone().json().catch(() => ({ driverName: '' }))).driverName || ''}さん、いつもお疲れさまです！引き続きよろしくお願いします。`,
      },
    }, { status: 200 });
  }
}
