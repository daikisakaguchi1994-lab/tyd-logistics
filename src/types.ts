export type Scenario =
  | 'daily_report'
  | 'absence'
  | 'job_inquiry'
  | 'invoice'
  | 'receipt'
  | 'unknown';

export interface ClassifyResult {
  scenario: Scenario;
  extractedData?: Record<string, string | number>;
}

export interface HandlerContext {
  replyToken: string;
  userId: string;
  displayName: string;
  text: string;
  classified: ClassifyResult;
}

// ============================================================
// ドライバー情報（KURUMAN参考 — 3カテゴリ）
// ============================================================

// --- ① ドライバー基本情報 ---
export interface DriverPersonalInfo {
  driverName: string;
  phone: string;
  email: string;
  address: string;
  birthDate: string;       // YYYY-MM-DD
  joinDate: string;        // YYYY-MM-DD
  contractType: string;    // 業務委託, 正社員, パート
  emergencyContact: DriverEmergencyContact;
  notes: string;
}

export interface DriverEmergencyContact {
  name: string;
  relation: string;
  phone: string;
}

// --- ② 車両情報 ---
export interface DriverVehicle {
  plateNumber: string;
  model: string;
  bodyType: string;        // 軽バン, 1t, 2t etc
  year: number;            // 年式
  color: string;
  leaseCompany: string;
  leaseStart: string;      // YYYY-MM-DD
  leaseEnd: string;        // YYYY-MM-DD
  inspection: VehicleInspection;
}

export interface VehicleInspection {
  lastDate: string;        // 前回車検日
  expiryDate: string;      // 車検満了日
  shop: string;            // 整備工場名
}

// --- ③ 資格・保険情報 ---
export interface DriverQualifications {
  license: DriverLicense;
  jibaiseki: InsuranceRecord;       // 自賠責保険（必須）
  voluntaryInsurance: InsuranceRecord; // 任意保険
  cargoInsurance?: InsuranceRecord; // 貨物保険（任意）
  otherCerts: OtherCertification[]; // その他の資格（危険物、フォークリフトなど）
}

export interface DriverLicense {
  number: string;
  type: string;            // 普通, 準中型, 中型, 大型
  issueDate: string;       // YYYY-MM-DD
  expiryDate: string;      // YYYY-MM-DD
}

export interface InsuranceRecord {
  company: string;
  policyNumber: string;
  startDate: string;       // YYYY-MM-DD
  expiryDate: string;      // YYYY-MM-DD
  coverageAmount?: string; // 補償額（例: 対人無制限）
}

export interface OtherCertification {
  name: string;            // 資格名
  number: string;          // 資格番号
  expiryDate: string;      // YYYY-MM-DD（無期限の場合は "9999-12-31"）
}

// --- 統合型 ---
export interface DriverFullRecord {
  personal: DriverPersonalInfo;
  vehicle: DriverVehicle;
  qualifications: DriverQualifications;
}

// --- 期限アラート ---
export type AlertSeverity = 'expired' | 'urgent' | 'warning' | 'ok';

export interface ExpiryAlert {
  driverName: string;
  category: string;        // 免許, 車検, 自賠責, 任意保険, 貨物保険, リース
  expiryDate: string;
  severity: AlertSeverity;
  daysLeft: number;
}

// ============================================================
// 取引先マスター
// ============================================================
export interface Partner {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  billingRate: number;
  paymentTerms: string;
  notes: string;
}

// ============================================================
// 請求書
// ============================================================
export interface InvoiceData {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  from: { name: string; address: string; phone: string };
  to: { name: string; address: string };
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  notes: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}
