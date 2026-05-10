import { google } from 'googleapis';

function getAuth() {
  const credentials = JSON.parse(
    Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64!, 'base64').toString()
  );
  return new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

function getSheets() {
  return google.sheets({ version: 'v4', auth: getAuth() });
}

const SHEET_ID = () => process.env.GOOGLE_SPREADSHEET_ID!;

export async function appendRow(sheetName: string, values: (string | number)[]) {
  const sheets = getSheets();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID(),
    range: `${sheetName}!A:Z`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [values] },
  });
}

export async function readSheet(sheetName: string, range: string): Promise<string[][]> {
  const sheets = getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID(),
    range: `${sheetName}!${range}`,
  });
  return (res.data.values as string[][]) || [];
}

export async function getNextDocNumber(sheetName: string, prefix: string): Promise<string> {
  const rows = await readSheet(sheetName, 'A:A');
  const year = new Date().getFullYear();
  let maxNum = 0;
  const pattern = new RegExp(`^${prefix}-${year}-(\\d+)$`);
  for (const row of rows) {
    if (row[0]) {
      const m = row[0].match(pattern);
      if (m) {
        maxNum = Math.max(maxNum, parseInt(m[1], 10));
      }
    }
  }
  return `${prefix}-${year}-${String(maxNum + 1).padStart(4, '0')}`;
}

export async function updateRow(sheetName: string, rowIndex: number, values: (string | number)[]) {
  const sheets = getSheets();
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID(),
    range: `${sheetName}!A${rowIndex}:Z${rowIndex}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [values] },
  });
}

export function nowJST(): string {
  return new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
}
