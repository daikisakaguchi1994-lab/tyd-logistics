/**
 * ダッシュボードのデータ取得レイヤー
 *
 * 現在: mockData.ts のハードコードデータを返す
 * 将来: Google Sheets の実データに切り替え可能
 *
 * ダッシュボードのページ/コンポーネントはこのモジュール経由でデータを取得する。
 * データソース切り替え時はこのファイルだけ変更すればよい。
 */

import {
  PLAYERS,
  WEEKLY_DATA,
  getPlayerStats,
  getHighlights,
  getDriverDetailData,
  getFinanceData,
  getDriverAdvice,
  AI_WEEKLY_SUMMARY,
} from '../mockData';
import type { PlayerProfile, WeeklyData } from '../mockData';

// Re-export types
export type { PlayerProfile, WeeklyData };

// === データ取得関数 ===

/** 全プレイヤーリストを取得 */
export function getPlayers(): PlayerProfile[] {
  // TODO: Sheets の「プレイヤーデータ」シートから取得
  return PLAYERS;
}

/** 週次配送データを取得 */
export function getWeeklyData(): WeeklyData[] {
  // TODO: Sheets の「日報」シートから集計
  return WEEKLY_DATA;
}

/** プレイヤーごとのスタッツ（今週/前週/変動/バッジ） */
export function getStats() {
  // TODO: Sheets の実データから計算
  return getPlayerStats();
}

/** ハイライト（全体集計・MVP・要フォロー等） */
export function getDashboardHighlights() {
  // TODO: Sheets の実データから計算
  return getHighlights();
}

/** ドライバー詳細データ */
export function getDriverDetail(name: string) {
  // TODO: Sheets の実データから計算
  return getDriverDetailData(name);
}

/** 売上データ */
export function getFinance() {
  // TODO: Sheets の実データから計算
  return getFinanceData();
}

/** ドライバー評価アドバイス */
export function getAdvice(change: number, character: string) {
  return getDriverAdvice(change, character);
}

/** AIウィークリーサマリー */
export function getWeeklySummary(): string {
  // TODO: Claude APIで生成
  return AI_WEEKLY_SUMMARY;
}
