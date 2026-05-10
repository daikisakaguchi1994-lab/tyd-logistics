import type { HandlerContext } from '../types';
import { appendRow, nowJST, getNextDocNumber, readSheet } from '../services/sheets';
import { replyText, pushMessage } from '../services/line';

// 管理者のuserId（環境変数で設定）
const ADMIN_USER_ID = () => process.env.ADMIN_LINE_USER_ID || '';

// アプリの公開URL（Vercelドメイン or カスタムドメイン）
function getAppUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}

// ドライバーごとの単価（環境変数 or デフォルト160円）
const DEFAULT_DRIVER_RATE = 160;

function getDriverRate(driverName: string): number {
  const envKey = `DRIVER_RATE_${driverName}`;
  const envVal = process.env[envKey];
  if (envVal) return parseInt(envVal, 10);
  return parseInt(process.env.DEFAULT_DRIVER_RATE || '', 10) || DEFAULT_DRIVER_RATE;
}

// 月次請求キーワード判定
function isMonthlyInvoiceRequest(text: string): boolean {
  return /月次請求|今月.*請求|請求書.*発行|請求.*お願い/.test(text)
    || (text.includes('請求書') && !/(万円?|\d{1,3},?\d{3}|金額)/.test(text));
}

// 対象月を判定
function getTargetMonth(text: string): { year: number; month: number; label: string } {
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }));
  if (/先月|前月/.test(text)) {
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return { year: prev.getFullYear(), month: prev.getMonth(), label: `${prev.getFullYear()}年${prev.getMonth() + 1}月` };
  }
  return { year: now.getFullYear(), month: now.getMonth(), label: `${now.getFullYear()}年${now.getMonth() + 1}月` };
}

// Google Sheetsの日報から配送件数を集計
async function getMonthlyDeliveryCount(userId: string, year: number, month: number): Promise<number> {
  try {
    const rows = await readSheet('日報', 'A:D');
    let total = 0;
    for (const row of rows.slice(1)) {
      if (row[2] === userId && row[0]) {
        const d = new Date(row[0]);
        if (d.getFullYear() === year && d.getMonth() === month) {
          total += parseInt(row[3], 10) || 0;
        }
      }
    }
    return total;
  } catch {
    return 0;
  }
}

export async function handleInvoice(ctx: HandlerContext) {
  const data = ctx.classified.extractedData || {};
  const baseUrl = getAppUrl();

  // ━━━ パターン1: 月次自動請求書（ドライバー→TYD） ━━━
  if (isMonthlyInvoiceRequest(ctx.text)) {
    const target = getTargetMonth(ctx.text);
    const count = await getMonthlyDeliveryCount(ctx.userId, target.year, target.month);

    if (count === 0) {
      await replyText(
        ctx.replyToken,
        `${target.label}の日報データが見つかりませんでした。\n\n日報を送信してから請求書を発行してください。\n例：「今日120件配送しました」`
      );
      return;
    }

    const rate = getDriverRate(ctx.displayName);
    const subtotal = count * rate;
    const tax = Math.floor(subtotal * 0.1);
    const total = subtotal + tax;

    const docNumber = await getNextDocNumber('請求書', 'PAY');

    // Sheetsに記録
    await appendRow('請求書', [
      docNumber,
      nowJST(),
      ctx.displayName,
      ctx.userId,
      target.label,
      total,
      'TYDロジスティクス（月次請求）',
      count,
      rate,
      subtotal,
      tax,
    ]);

    // PDF閲覧リンク
    const invoiceUrl = `${baseUrl}/invoice/${docNumber}`;

    // ドライバーへ返信
    const invoiceMessage = [
      '━━━━━━━━━━━━━━━',
      `  請求書  ${docNumber}`,
      '━━━━━━━━━━━━━━━',
      '',
      `${ctx.displayName}`,
      '  ↓',
      'TYDロジスティクス 御中',
      '',
      `■ 対象期間: ${target.label}`,
      '',
      `  配送業務報酬`,
      `  ${count.toLocaleString()}件 × ¥${rate} = ¥${subtotal.toLocaleString()}`,
      '',
      `  消費税（10%）  ¥${tax.toLocaleString()}`,
      '━━━━━━━━━━━━━━━',
      `  ご請求額  ¥${total.toLocaleString()}`,
      '━━━━━━━━━━━━━━━',
      '',
      '■ PDF請求書はこちら',
      invoiceUrl,
      '',
      '↑ リンクを開いて「PDF保存」ボタンを',
      '  押すとPDFとして保存できます。',
      '',
      'Sheetsに記録済み / 管理者に通知済み',
    ].join('\n');

    await replyText(ctx.replyToken, invoiceMessage);

    // 管理者へ通知
    const adminId = ADMIN_USER_ID();
    if (adminId) {
      try {
        await pushMessage(
          adminId,
          [
            '【請求書発行通知】',
            '',
            `${ctx.displayName}さんが${target.label}分の請求書を発行しました。`,
            '',
            `請求番号: ${docNumber}`,
            `配送件数: ${count.toLocaleString()}件`,
            `単価: ¥${rate}`,
            `ご請求額: ¥${total.toLocaleString()}（税込）`,
            '',
            `確認: ${invoiceUrl}`,
          ].join('\n')
        );
      } catch {
        // 管理者通知失敗は無視
      }
    }

    return;
  }

  // ━━━ パターン2: 従来の手動請求書（金額・取引先指定） ━━━
  if (!data.amount) {
    await replyText(
      ctx.replyToken,
      [
        '請求書を作成します。',
        '',
        '■ 月次請求（自動計算）',
        '  「今月の請求書」',
        '  「先月の請求書を発行」',
        '  → 日報データから自動計算＋PDF発行',
        '',
        '■ 手動作成',
        '  「請求書 5/15 15万円 ABC商事」',
        '  → 日付・金額・取引先を指定',
      ].join('\n')
    );
    return;
  }

  const docNumber = await getNextDocNumber('請求書', 'INV');
  const date = (data.date as string) || nowJST().split(' ')[0];
  const amount = data.amount as number;
  const company = (data.company as string) || '（未指定）';

  await appendRow('請求書', [
    docNumber,
    nowJST(),
    ctx.displayName,
    ctx.userId,
    date,
    amount,
    company,
  ]);

  const invoiceUrl = `${baseUrl}/invoice/${docNumber}`;

  await replyText(
    ctx.replyToken,
    [
      `請求書を作成しました`,
      '',
      `  請求書番号：${docNumber}`,
      `  日付：${date}`,
      `  金額：¥${amount.toLocaleString()}`,
      `  取引先：${company}`,
      '',
      '■ PDF請求書',
      invoiceUrl,
      '',
      '請求書シートに記録済みです。',
    ].join('\n')
  );
}
