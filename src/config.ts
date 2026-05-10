// === アプリ全体の設定 ===

export const APP_CONFIG = {
  // ダッシュボードパスワード（環境変数必須 — コードに平文を置かない）
  get dashboardPassword(): string {
    const pw = process.env.DASHBOARD_PASSWORD;
    if (!pw) {
      console.error('[SECURITY] DASHBOARD_PASSWORD env var is not set!');
      return '';
    }
    return pw;
  },

  // 認証Cookie名
  authCookieName: 'tyd_auth',

  // Cookieの有効期限（日数）
  authCookieMaxAgeDays: 30,

  // タイムゾーン
  timezone: 'Asia/Tokyo',
};

// ============================================================
// ビジネスロジック定数 — 全体で一元管理
// ============================================================

export const RATES = {
  /** デフォルトドライバー報酬単価（円/件） */
  defaultDriverRate: parseInt(process.env.DEFAULT_DRIVER_RATE || '', 10) || 160,

  /** クライアント請求単価（円/件） */
  clientRate: parseInt(process.env.CLIENT_RATE || '', 10) || 180,

  /** 標準税率（10%） */
  taxRateStandard: 0.1,

  /** 軽減税率（8%） */
  taxRateReduced: 0.08,

  /** デフォルト税率 */
  taxRate: 0.1,
};

export const THRESHOLDS = {
  // ---- ドライバー評価 ----
  /** MVPの前週比変動% */
  mvpChangePercent: 10,
  /** 要フォローの前週比変動% */
  needsAttentionChangePercent: -5,

  // ---- 粗利率 ----
  /** 健全水準（%） */
  profitRateHealthy: 12,
  /** 注意水準（%） */
  profitRateWarning: 8,

  // ---- 期限アラート（日数） ----
  /** 緊急（30日以内） */
  expiryUrgentDays: 30,
  /** 警告（90日以内） */
  expiryWarningDays: 90,

  // ---- Claude AI ----
  /** AIフォールバックタイムアウト（ms） */
  aiTimeoutMs: 5000,
  /** Claude モデルID */
  aiModel: 'claude-haiku-4-5-20251001' as const,
};

// ============================================================
// シート名定数 — タイポ防止
// ============================================================

export const SHEET_NAMES = {
  dailyReport: '日報',
  absence: '欠勤・連絡',
  invoice: '請求書',
  receipt: '領収書',
  players: 'プレイヤーデータ',
  recruitment: '採用応募',
  partners: '取引先',
  dispatch: '配車',
  outsource: '外注',
  incidents: '事故・トラブル',
  jobs: '案件配信',
} as const;
