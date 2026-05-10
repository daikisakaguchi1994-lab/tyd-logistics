import type { DriverFullRecord, Partner, ExpiryAlert, AlertSeverity } from './types';

// ============================================================
// 10名分のドライバー情報（KURUMAN準拠 3カテゴリ）
// ============================================================

export const DRIVER_RECORDS: Record<string, DriverFullRecord> = {
  '田中': {
    personal: {
      driverName: '田中',
      phone: '090-1234-5678',
      email: 'tanaka@example.com',
      address: '福岡市博多区博多駅前3-1-1',
      birthDate: '1988-05-12',
      joinDate: '2024-04-01',
      contractType: '業務委託',
      bankAccount: { bankName: '福岡銀行', branchName: '博多駅前支店', accountType: '普通', accountNumber: '1234567', accountHolder: 'タナカ タロウ' },
      emergencyContact: { name: '田中 花子', relation: '配偶者', phone: '090-9876-5432' },
      notes: 'エースドライバー。リーダー候補。',
    },
    vehicle: {
      plateNumber: '福岡 480 あ 12-34',
      model: 'ハイエース',
      bodyType: '軽バン',
      year: 2023,
      color: 'ホワイト',
      leaseCompany: 'オリックス自動車',
      leaseStart: '2024-04-01',
      leaseEnd: '2027-03-31',
      inspection: { lastDate: '2025-10-15', expiryDate: '2027-10-14', shop: '博多モータース' },
    },
    qualifications: {
      license: { number: '012345678901', type: '中型', issueDate: '2008-06-01', expiryDate: '2028-06-15' },
      jibaiseki: { company: '損保ジャパン', policyNumber: 'JS-2025-0001', startDate: '2025-04-01', expiryDate: '2027-04-01' },
      voluntaryInsurance: { company: '東京海上日動', policyNumber: 'TM-2026-0001', startDate: '2026-04-01', expiryDate: '2027-04-01', coverageAmount: '対人対物無制限' },
      cargoInsurance: { company: '三井住友海上', policyNumber: 'MS-2026-0001', startDate: '2026-04-01', expiryDate: '2027-04-01', coverageAmount: '500万円' },
      otherCerts: [],
    },
  },
  '佐藤': {
    personal: {
      driverName: '佐藤',
      phone: '090-2345-6789',
      email: 'sato@example.com',
      address: '福岡市中央区天神2-5-1',
      birthDate: '1975-11-03',
      joinDate: '2023-01-15',
      contractType: '業務委託',
      bankAccount: { bankName: '西日本シティ銀行', branchName: '天神支店', accountType: '普通', accountNumber: '2345678', accountHolder: 'サトウ ジロウ' },
      emergencyContact: { name: '佐藤 太郎', relation: '父', phone: '080-1111-2222' },
      notes: 'ベテラン。安定した実績。',
    },
    vehicle: {
      plateNumber: '福岡 480 い 56-78',
      model: 'N-VAN',
      bodyType: '軽バン',
      year: 2022,
      color: 'シルバー',
      leaseCompany: 'トヨタレンタリース',
      leaseStart: '2023-01-15',
      leaseEnd: '2026-12-31',
      inspection: { lastDate: '2025-06-20', expiryDate: '2027-06-19', shop: '天神オートサービス' },
    },
    qualifications: {
      license: { number: '023456789012', type: '普通', issueDate: '1995-12-01', expiryDate: '2027-12-20' },
      jibaiseki: { company: '東京海上日動', policyNumber: 'TM-JS-0002', startDate: '2025-01-15', expiryDate: '2027-01-15' },
      voluntaryInsurance: { company: '損保ジャパン', policyNumber: 'SJ-2026-0002', startDate: '2026-01-15', expiryDate: '2027-01-15', coverageAmount: '対人対物無制限' },
      otherCerts: [{ name: 'フォークリフト運転技能', number: 'FK-2020-1234', expiryDate: '9999-12-31' }],
    },
  },
  '鈴木': {
    personal: {
      driverName: '鈴木',
      phone: '090-3456-7890',
      email: 'suzuki@example.com',
      address: '福岡市東区香椎駅前1-2-3',
      birthDate: '1990-03-22',
      joinDate: '2023-06-01',
      contractType: '業務委託',
      bankAccount: { bankName: 'ゆうちょ銀行', branchName: '七三八支店', accountType: '普通', accountNumber: '3456789', accountHolder: 'スズキ ケンタ' },
      emergencyContact: { name: '鈴木 美咲', relation: '配偶者', phone: '080-3333-4444' },
      notes: '',
    },
    vehicle: {
      plateNumber: '福岡 480 う 90-12',
      model: 'ハイゼットカーゴ',
      bodyType: '軽バン',
      year: 2023,
      color: 'ホワイト',
      leaseCompany: 'SBIリース',
      leaseStart: '2023-06-01',
      leaseEnd: '2027-05-31',
      inspection: { lastDate: '2025-12-01', expiryDate: '2027-11-30', shop: '香椎整備工場' },
    },
    qualifications: {
      license: { number: '034567890123', type: '普通', issueDate: '2010-04-01', expiryDate: '2029-03-10' },
      jibaiseki: { company: '三井住友海上', policyNumber: 'MS-JS-0003', startDate: '2025-06-01', expiryDate: '2027-06-01' },
      voluntaryInsurance: { company: '東京海上日動', policyNumber: 'TM-2026-0003', startDate: '2026-06-01', expiryDate: '2027-06-01', coverageAmount: '対人対物無制限' },
      otherCerts: [],
    },
  },
  '山本': {
    personal: {
      driverName: '山本',
      phone: '090-4567-8901',
      email: 'yamamoto@example.com',
      address: '福岡市南区大橋4-5-6',
      birthDate: '1998-07-14',
      joinDate: '2025-01-10',
      contractType: '業務委託',
      bankAccount: { bankName: '楽天銀行', branchName: 'ジャズ支店', accountType: '普通', accountNumber: '4567890', accountHolder: 'ヤマモト ユウキ' },
      emergencyContact: { name: '山本 健一', relation: '兄', phone: '090-5555-6666' },
      notes: '成長株。ポテンシャル高い。',
    },
    vehicle: {
      plateNumber: '福岡 480 え 34-56',
      model: 'エブリイ',
      bodyType: '軽バン',
      year: 2024,
      color: 'ホワイト',
      leaseCompany: 'オリックス自動車',
      leaseStart: '2025-01-10',
      leaseEnd: '2027-12-31',
      inspection: { lastDate: '2025-01-10', expiryDate: '2027-01-09', shop: '大橋カーサービス' },
    },
    qualifications: {
      license: { number: '045678901234', type: '普通', issueDate: '2018-08-01', expiryDate: '2028-09-25' },
      jibaiseki: { company: 'あいおいニッセイ', policyNumber: 'AN-JS-0004', startDate: '2025-01-10', expiryDate: '2027-01-10' },
      voluntaryInsurance: { company: 'あいおいニッセイ', policyNumber: 'AN-2026-0004', startDate: '2026-01-10', expiryDate: '2027-01-10', coverageAmount: '対人対物無制限' },
      otherCerts: [],
    },
  },
  '伊藤': {
    personal: {
      driverName: '伊藤',
      phone: '090-5678-9012',
      email: 'ito@example.com',
      address: '福岡市西区姪浜駅南2-3-4',
      birthDate: '1992-01-30',
      joinDate: '2024-08-01',
      contractType: '業務委託',
      bankAccount: { bankName: '福岡銀行', branchName: '姪浜支店', accountType: '普通', accountNumber: '5678901', accountHolder: 'イトウ ダイスケ' },
      emergencyContact: { name: '伊藤 由美', relation: '配偶者', phone: '080-7777-8888' },
      notes: '副業系。週によって波がある。',
    },
    vehicle: {
      plateNumber: '福岡 480 お 78-90',
      model: 'N-VAN',
      bodyType: '軽バン',
      year: 2023,
      color: 'ブラック',
      leaseCompany: 'トヨタレンタリース',
      leaseStart: '2024-08-01',
      leaseEnd: '2026-07-31',
      inspection: { lastDate: '2025-08-01', expiryDate: '2027-07-31', shop: '姪浜モータース' },
    },
    qualifications: {
      license: { number: '056789012345', type: '普通', issueDate: '2012-02-01', expiryDate: '2027-08-01' },
      jibaiseki: { company: '三井住友海上', policyNumber: 'MS-JS-0005', startDate: '2025-08-01', expiryDate: '2027-08-01' },
      voluntaryInsurance: { company: '三井住友海上', policyNumber: 'MS-2026-0005', startDate: '2026-08-01', expiryDate: '2027-08-01', coverageAmount: '対人対物無制限' },
      otherCerts: [],
    },
  },
  '渡辺': {
    personal: {
      driverName: '渡辺',
      phone: '090-6789-0123',
      email: 'watanabe@example.com',
      address: '春日市春日原南町3-7-8',
      birthDate: '1985-09-08',
      joinDate: '2024-02-15',
      contractType: '業務委託',
      bankAccount: { bankName: '西日本シティ銀行', branchName: '春日原支店', accountType: '普通', accountNumber: '6789012', accountHolder: 'ワタナベ コウジ' },
      emergencyContact: { name: '渡辺 美和', relation: '母', phone: '090-9999-0000' },
      notes: 'ムードメーカー。チームの雰囲気を良くする。',
    },
    vehicle: {
      plateNumber: '福岡 480 か 12-34',
      model: 'ハイエース',
      bodyType: '軽バン',
      year: 2022,
      color: 'ホワイト',
      leaseCompany: 'SBIリース',
      leaseStart: '2024-02-15',
      leaseEnd: '2027-01-31',
      inspection: { lastDate: '2025-02-15', expiryDate: '2027-02-14', shop: '春日カーセンター' },
    },
    qualifications: {
      license: { number: '067890123456', type: '準中型', issueDate: '2005-10-01', expiryDate: '2028-02-15' },
      jibaiseki: { company: '損保ジャパン', policyNumber: 'SJ-JS-0006', startDate: '2025-02-15', expiryDate: '2027-02-15' },
      voluntaryInsurance: { company: '損保ジャパン', policyNumber: 'SJ-2026-0006', startDate: '2026-02-15', expiryDate: '2027-02-15', coverageAmount: '対人対物無制限' },
      cargoInsurance: { company: '東京海上日動', policyNumber: 'TM-C-0006', startDate: '2026-02-15', expiryDate: '2027-02-15', coverageAmount: '300万円' },
      otherCerts: [{ name: '危険物取扱者 乙種第4類', number: 'KK-2019-5678', expiryDate: '9999-12-31' }],
    },
  },
  '中村': {
    personal: {
      driverName: '中村',
      phone: '090-7890-1234',
      email: 'nakamura@example.com',
      address: '大野城市白木原5-9-10',
      birthDate: '1982-12-25',
      joinDate: '2023-09-01',
      contractType: '業務委託',
      bankAccount: { bankName: '福岡銀行', branchName: '大野城支店', accountType: '普通', accountNumber: '7890123', accountHolder: 'ナカムラ ショウタ' },
      emergencyContact: { name: '中村 翔太', relation: '弟', phone: '080-1234-5678' },
      notes: '職人気質。黙々と高い実績を出す。',
    },
    vehicle: {
      plateNumber: '福岡 480 き 56-78',
      model: 'ハイエース',
      bodyType: '軽バン',
      year: 2021,
      color: 'ホワイト',
      leaseCompany: 'オリックス自動車',
      leaseStart: '2023-09-01',
      leaseEnd: '2026-08-31',
      inspection: { lastDate: '2024-09-01', expiryDate: '2026-08-31', shop: '大野城オート' },
    },
    qualifications: {
      license: { number: '078901234567', type: '中型', issueDate: '2002-01-01', expiryDate: '2028-09-01' },
      jibaiseki: { company: 'あいおいニッセイ', policyNumber: 'AN-JS-0007', startDate: '2025-09-01', expiryDate: '2027-09-01' },
      voluntaryInsurance: { company: 'あいおいニッセイ', policyNumber: 'AN-2026-0007', startDate: '2026-09-01', expiryDate: '2027-09-01', coverageAmount: '対人対物無制限' },
      otherCerts: [],
    },
  },
  '小林': {
    personal: {
      driverName: '小林',
      phone: '090-8901-2345',
      email: 'kobayashi@example.com',
      address: '福岡市博多区住吉1-2-3',
      birthDate: '2000-04-18',
      joinDate: '2025-09-01',
      contractType: '業務委託',
      bankAccount: { bankName: 'PayPay銀行', branchName: 'すずめ支店', accountType: '普通', accountNumber: '8901234', accountHolder: 'コバヤシ リク' },
      emergencyContact: { name: '小林 恵子', relation: '母', phone: '090-2345-6789' },
      notes: '新人。17週連続成長中。',
    },
    vehicle: {
      plateNumber: '福岡 480 く 90-12',
      model: 'エブリイ',
      bodyType: '軽バン',
      year: 2025,
      color: 'シルバー',
      leaseCompany: 'トヨタレンタリース',
      leaseStart: '2025-09-01',
      leaseEnd: '2028-08-31',
      inspection: { lastDate: '2025-09-01', expiryDate: '2027-08-31', shop: '住吉カーサービス' },
    },
    qualifications: {
      license: { number: '089012345678', type: '普通', issueDate: '2020-05-01', expiryDate: '2030-01-20' },
      jibaiseki: { company: '東京海上日動', policyNumber: 'TM-JS-0008', startDate: '2025-09-01', expiryDate: '2027-09-01' },
      voluntaryInsurance: { company: '東京海上日動', policyNumber: 'TM-2026-0008', startDate: '2026-09-01', expiryDate: '2027-09-01', coverageAmount: '対人対物無制限' },
      otherCerts: [],
    },
  },
  '加藤': {
    personal: {
      driverName: '加藤',
      phone: '090-9012-3456',
      email: 'kato@example.com',
      address: '糟屋郡志免町南里3-4-5',
      birthDate: '1978-06-07',
      joinDate: '2022-11-01',
      contractType: '業務委託',
      bankAccount: { bankName: '福岡銀行', branchName: '志免支店', accountType: '普通', accountNumber: '9012345', accountHolder: 'カトウ マサヒロ' },
      emergencyContact: { name: '加藤 裕子', relation: '配偶者', phone: '080-3456-7890' },
      notes: 'ベテラン。最近稼働が減少傾向。面談予定。',
    },
    vehicle: {
      plateNumber: '福岡 480 け 34-56',
      model: 'ハイエース',
      bodyType: '軽バン',
      year: 2021,
      color: 'ホワイト',
      leaseCompany: 'SBIリース',
      leaseStart: '2022-11-01',
      leaseEnd: '2026-10-31',
      inspection: { lastDate: '2024-11-01', expiryDate: '2026-10-31', shop: '志免モータース' },
    },
    qualifications: {
      license: { number: '090123456789', type: '大型', issueDate: '1998-07-01', expiryDate: '2027-11-01' },
      jibaiseki: { company: '損保ジャパン', policyNumber: 'SJ-JS-0009', startDate: '2025-11-01', expiryDate: '2027-11-01' },
      voluntaryInsurance: { company: '損保ジャパン', policyNumber: 'SJ-2026-0009', startDate: '2026-11-01', expiryDate: '2027-11-01', coverageAmount: '対人対物無制限' },
      otherCerts: [{ name: 'けん引免許', number: 'KI-2010-9012', expiryDate: '9999-12-31' }],
    },
  },
  '吉田': {
    personal: {
      driverName: '吉田',
      phone: '090-0123-4567',
      email: 'yoshida@example.com',
      address: '福岡市早良区西新6-7-8',
      birthDate: '1993-10-11',
      joinDate: '2024-05-01',
      contractType: '業務委託',
      bankAccount: { bankName: '三井住友銀行', branchName: '福岡支店', accountType: '普通', accountNumber: '0123456', accountHolder: 'ヨシダ アキラ' },
      emergencyContact: { name: '吉田 明', relation: '父', phone: '090-4567-8901' },
      notes: '中堅。安定した仕事ぶり。',
    },
    vehicle: {
      plateNumber: '福岡 480 こ 78-90',
      model: 'N-VAN',
      bodyType: '軽バン',
      year: 2024,
      color: 'ホワイト',
      leaseCompany: 'オリックス自動車',
      leaseStart: '2024-05-01',
      leaseEnd: '2027-04-30',
      inspection: { lastDate: '2025-05-01', expiryDate: '2027-04-30', shop: '西新カーセンター' },
    },
    qualifications: {
      license: { number: '001234567890', type: '普通', issueDate: '2013-11-01', expiryDate: '2029-05-01' },
      jibaiseki: { company: '三井住友海上', policyNumber: 'MS-JS-0010', startDate: '2025-05-01', expiryDate: '2027-05-01' },
      voluntaryInsurance: { company: '三井住友海上', policyNumber: 'MS-2026-0010', startDate: '2026-05-01', expiryDate: '2027-05-01', coverageAmount: '対人対物無制限' },
      otherCerts: [],
    },
  },
};

// ============================================================
// 期限アラート算出ユーティリティ
// ============================================================

function calcDaysLeft(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function calcSeverity(daysLeft: number): AlertSeverity {
  if (daysLeft < 0) return 'expired';
  if (daysLeft <= 30) return 'urgent';
  if (daysLeft <= 90) return 'warning';
  return 'ok';
}

export function getAllAlerts(): ExpiryAlert[] {
  const alerts: ExpiryAlert[] = [];

  Object.values(DRIVER_RECORDS).forEach(rec => {
    const name = rec.personal.driverName;

    const checks: { category: string; expiryDate: string }[] = [
      { category: '運転免許', expiryDate: rec.qualifications.license.expiryDate },
      { category: '車検', expiryDate: rec.vehicle.inspection.expiryDate },
      { category: 'リース', expiryDate: rec.vehicle.leaseEnd },
      { category: '自賠責保険', expiryDate: rec.qualifications.jibaiseki.expiryDate },
      { category: '任意保険', expiryDate: rec.qualifications.voluntaryInsurance.expiryDate },
    ];

    if (rec.qualifications.cargoInsurance) {
      checks.push({ category: '貨物保険', expiryDate: rec.qualifications.cargoInsurance.expiryDate });
    }

    rec.qualifications.otherCerts.forEach(c => {
      if (c.expiryDate !== '9999-12-31') {
        checks.push({ category: c.name, expiryDate: c.expiryDate });
      }
    });

    checks.forEach(c => {
      const daysLeft = calcDaysLeft(c.expiryDate);
      const severity = calcSeverity(daysLeft);
      if (severity !== 'ok') {
        alerts.push({ driverName: name, ...c, severity, daysLeft });
      }
    });
  });

  // 緊急度順にソート
  const severityOrder: Record<AlertSeverity, number> = { expired: 0, urgent: 1, warning: 2, ok: 3 };
  alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity] || a.daysLeft - b.daysLeft);

  return alerts;
}

export function getDriverRecord(name: string): DriverFullRecord | undefined {
  return DRIVER_RECORDS[name];
}

// ============================================================
// 取引先マスター
// ============================================================
export const PARTNERS: Partner[] = [
  {
    id: 'P-001',
    name: 'ヤマト運輸株式会社 福岡主管支店',
    contactPerson: '高橋 誠',
    phone: '092-123-4567',
    email: 'takahashi@example.com',
    address: '福岡市東区箱崎ふ頭1-1-1',
    billingRate: 180,
    paymentTerms: '月末締め翌月末払い',
    notes: 'メイン取引先',
  },
  {
    id: 'P-002',
    name: '佐川急便株式会社 福岡営業所',
    contactPerson: '松本 大輔',
    phone: '092-234-5678',
    email: 'matsumoto@example.com',
    address: '福岡市博多区榎田2-2-2',
    billingRate: 175,
    paymentTerms: '月末締め翌月末払い',
    notes: '',
  },
  {
    id: 'P-003',
    name: 'Amazon配送サービスパートナー',
    contactPerson: '田辺 光',
    phone: '092-345-6789',
    email: 'tanabe@example.com',
    address: '福岡市東区多の津3-3-3',
    billingRate: 185,
    paymentTerms: '月末締め翌々月5日払い',
    notes: '増加傾向',
  },
];

export function getPartner(id: string): Partner | undefined {
  return PARTNERS.find(p => p.id === id);
}
