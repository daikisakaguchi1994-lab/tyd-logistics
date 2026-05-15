const { google } = require('googleapis');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const base64 = envFile.match(/GOOGLE_SERVICE_ACCOUNT_JSON_BASE64=(.*)/)[1];
const spreadsheetId = envFile.match(/GOOGLE_SPREADSHEET_ID=(.*)/)[1];
const creds = JSON.parse(Buffer.from(base64, 'base64').toString());

const auth = new google.auth.GoogleAuth({
  credentials: creds,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const sheets = google.sheets({ version: 'v4', auth });

async function run() {
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const existing = meta.data.sheets.map(s => s.properties.title);
  console.log('既存シート:', existing);

  const needed = [
    { name: '案件配信', headers: ['datetime', 'title', 'area', 'date', 'count', 'rate', 'details', 'sentTo', 'status'] },
    { name: '取引先', headers: ['name', 'contactPerson', 'phone', 'email', 'address', 'billingRate', 'paymentTerms', 'notes'] },
    { name: '配車', headers: ['date', 'driverName', 'area', 'estimatedCount', 'status', 'notes', 'createdAt'] },
    { name: '外注', headers: ['name', 'contactPerson', 'phone', 'rate', 'area', 'notes', 'createdAt'] },
    { name: '事故・トラブル', headers: ['datetime', 'driverName', 'type', 'location', 'description', 'status', 'severity', 'resolution', 'createdAt'] },
    { name: '採用応募', headers: ['datetime', 'name', 'userId', 'phone', 'area', 'experience', 'status', 'notes', 'source'] },
  ];

  const toCreate = needed.filter(n => !existing.includes(n.name));
  if (toCreate.length === 0) {
    console.log('全シート作成済み');
    return;
  }

  console.log('作成対象:', toCreate.map(s => s.name));

  const requests = toCreate.map(s => ({ addSheet: { properties: { title: s.name } } }));
  await sheets.spreadsheets.batchUpdate({ spreadsheetId, requestBody: { requests } });

  for (const s of toCreate) {
    const lastCol = String.fromCharCode(64 + s.headers.length);
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${s.name}!A1:${lastCol}1`,
      valueInputOption: 'RAW',
      requestBody: { values: [s.headers] },
    });
    console.log('作成+ヘッダー追加:', s.name);
  }

  console.log('全て完了');
}

run().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
