/**
 * Google Sheets セットアップスクリプト
 * 各シートにヘッダー行を書き込み、モックデータを投入する
 *
 * Usage: npx tsx scripts/setup-sheets.ts
 */

import { google } from 'googleapis';
import * as dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename2 = fileURLToPath(import.meta.url);
const __dirname2 = dirname(__filename2);
dotenv.config({ path: resolve(__dirname2, '../.env.local') });

const credentials = JSON.parse(
  Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64!, 'base64').toString()
);
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const sheets = google.sheets({ version: 'v4', auth });
const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID!;

const SHEET_HEADERS: Record<string, string[]> = {
  '日報': ['日時', '名前', 'LINE_UserID', '配送件数', '元メッセージ'],
  '欠勤・連絡': ['日時', '名前', 'LINE_UserID', '種別', 'メッセージ', 'Bot返答'],
  '請求書': ['請求書番号', '発行日時', '発行者名', 'LINE_UserID', '請求日付', '金額', '取引先'],
  '領収書': ['領収書番号', '発行日時', '発行者名', 'LINE_UserID', '発行日付', '金額', '取引先'],
  'プレイヤーデータ': ['名前', 'LINE_UserID', 'ステータス', '登録日', 'メモ'],
};

// Mock daily report data (4 weeks x 5 players)
const MOCK_PLAYERS = [
  { name: '田中太郎', id: 'U_tanaka' },
  { name: '佐藤花子', id: 'U_sato' },
  { name: '鈴木一郎', id: 'U_suzuki' },
  { name: '山本健太', id: 'U_yamamoto' },
  { name: '伊藤真一', id: 'U_ito' },
];

const WEEKLY_COUNTS: Record<string, number[]> = {
  '田中太郎': [95, 102, 110, 123],
  '佐藤花子': [88, 78, 65, 60],
  '鈴木一郎': [82, 80, 84, 85],
  '山本健太': [55, 70, 85, 95],
  '伊藤真一': [72, 68, 75, 70],
};

function generateMockDailyReports(): (string | number)[][] {
  const rows: (string | number)[][] = [];
  const weekStarts = [
    new Date('2026-04-14'),
    new Date('2026-04-21'),
    new Date('2026-04-28'),
    new Date('2026-05-05'),
  ];

  for (const player of MOCK_PLAYERS) {
    const counts = WEEKLY_COUNTS[player.name];
    for (let w = 0; w < 4; w++) {
      // Spread weekly count across 5 weekdays
      const weeklyTotal = counts[w];
      const dailyCounts = distributeCounts(weeklyTotal, 5);

      for (let d = 0; d < 5; d++) {
        const date = new Date(weekStarts[w]);
        date.setDate(date.getDate() + d);
        const dateStr = date.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
        rows.push([dateStr, player.name, player.id, dailyCounts[d], `今日${dailyCounts[d]}件配送しました`]);
      }
    }
  }
  return rows;
}

function distributeCounts(total: number, days: number): number[] {
  const base = Math.floor(total / days);
  const remainder = total - base * days;
  const counts = Array(days).fill(base);
  for (let i = 0; i < remainder; i++) {
    counts[i]++;
  }
  // Shuffle slightly for realism
  for (let i = counts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [counts[i], counts[j]] = [counts[j], counts[i]];
  }
  return counts;
}

function generatePlayerData(): (string | number)[][] {
  return MOCK_PLAYERS.map((p, i) => [
    p.name,
    p.id,
    '稼働中',
    i < 2 ? '2025-06-01' : i < 4 ? '2025-09-01' : '2026-01-15',
    ['エース', 'ベテラン', '安定型', '新人（急成長中）', '副業系'][i],
  ]);
}

async function writeHeaders(sheetName: string, headers: string[]) {
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!A1:${String.fromCharCode(64 + headers.length)}1`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [headers] },
  });
  console.log(`  [OK] ${sheetName}: ヘッダー書き込み完了`);
}

async function appendData(sheetName: string, rows: (string | number)[][]) {
  if (rows.length === 0) return;
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!A:Z`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: rows },
  });
  console.log(`  [OK] ${sheetName}: ${rows.length}行のデータ投入完了`);
}

async function main() {
  console.log('=== TYD Google Sheets セットアップ ===\n');
  console.log(`Spreadsheet ID: ${SPREADSHEET_ID}\n`);

  // 1. Write headers
  console.log('1. ヘッダー行を書き込み中...');
  for (const [sheetName, headers] of Object.entries(SHEET_HEADERS)) {
    try {
      await writeHeaders(sheetName, headers);
    } catch (e: unknown) {
      const error = e as { message?: string };
      console.error(`  [ERROR] ${sheetName}: ${error.message}`);
      console.error(`    → シート「${sheetName}」が存在するか確認してください`);
    }
  }

  // 2. Insert mock daily reports
  console.log('\n2. モック日報データを投入中...');
  try {
    const reports = generateMockDailyReports();
    await appendData('日報', reports);
  } catch (e: unknown) {
    const error = e as { message?: string };
    console.error(`  [ERROR] 日報データ投入失敗: ${error.message}`);
  }

  // 3. Insert player data
  console.log('\n3. プレイヤーデータを投入中...');
  try {
    const players = generatePlayerData();
    await appendData('プレイヤーデータ', players);
  } catch (e: unknown) {
    const error = e as { message?: string };
    console.error(`  [ERROR] プレイヤーデータ投入失敗: ${error.message}`);
  }

  console.log('\n=== セットアップ完了 ===');
  console.log('\n次のステップ:');
  console.log('  1. Google Sheets を開いてデータを確認');
  console.log('  2. 「集計」シートに数式を追加（手動）');
  console.log('  3. vercel deploy でデプロイ');
}

main().catch(console.error);
