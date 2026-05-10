// === アプリ全体の設定 ===

export const APP_CONFIG = {
  // ダッシュボードパスワード（環境変数で上書き可能）
  dashboardPassword: process.env.DASHBOARD_PASSWORD || 'tyd2026',

  // 認証Cookie名
  authCookieName: 'tyd_auth',

  // Cookieの有効期限（日数）
  authCookieMaxAgeDays: 30,

  // タイムゾーン
  timezone: 'Asia/Tokyo',
};
