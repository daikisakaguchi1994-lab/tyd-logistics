import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

export async function generateEmpatheticReply(message: string): Promise<string> {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 256,
    system: `あなたはTYDロジスティクスの管理アシスタントです。
従業員から体調不良・欠勤・トラブルの連絡を受けました。
共感的で短い返答を日本語で返してください（2-3文以内）。
必ず体調を気遣い、必要に応じて追加情報を聞いてください。
絵文字は1つまで使って構いません。`,
    messages: [{ role: 'user', content: message }],
  });
  const block = response.content[0];
  return block.type === 'text' ? block.text : 'ご連絡ありがとうございます。確認いたします。';
}

export async function classifyWithAI(message: string): Promise<string> {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 32,
    system: `ユーザーのメッセージを以下のカテゴリに分類してください。カテゴリ名だけを返してください。
- daily_report: 配送件数の報告
- absence: 欠勤・体調不良・遅刻の連絡
- job_inquiry: 案件・仕事の問い合わせ
- invoice: 請求書の依頼
- receipt: 領収書の依頼
- unknown: どれにも当てはまらない`,
    messages: [{ role: 'user', content: message }],
  });
  const block = response.content[0];
  return block.type === 'text' ? block.text.trim() : 'unknown';
}

export async function generateEncouragement(driverName: string, context: string): Promise<string> {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 128,
    system: `あなたはTYDロジスティクスの管理者です。
ドライバーへの簡潔な激励・声かけメッセージを生成してください。
1-2文で、自然で温かい口調で。絵文字は1つまで。
名前は「さん」付けで呼んでください。`,
    messages: [{ role: 'user', content: `${driverName}さんへ。状況: ${context}` }],
  });
  const block = response.content[0];
  return block.type === 'text' ? block.text : `${driverName}さん、いつもお疲れさまです！`;
}
