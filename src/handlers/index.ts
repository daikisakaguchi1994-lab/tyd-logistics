import type { HandlerContext, Scenario } from '../types';
import { handleDailyReport } from './dailyReport';
import { handleAbsence } from './absence';
import { handleJobInquiry } from './jobInquiry';
import { handleInvoice } from './invoice';
import { handleReceipt } from './receipt';
import { handleRecruitment } from './recruitment';
import { handleIncident } from './incident';

// ============================================================
// ハンドラーレジストリ
// 新しいシナリオを追加するときは、ここに1行追加するだけ。
// ============================================================

type Handler = (ctx: HandlerContext) => Promise<void>;

const HANDLER_MAP: Record<Exclude<Scenario, 'unknown'>, Handler> = {
  daily_report: handleDailyReport,
  absence: handleAbsence,
  job_inquiry: handleJobInquiry,
  invoice: handleInvoice,
  receipt: handleReceipt,
  recruitment: handleRecruitment,
  incident: handleIncident,
};

/**
 * シナリオに対応するハンドラーを取得。
 * unknown の場合は undefined を返す。
 */
export function getHandler(scenario: Scenario): Handler | undefined {
  if (scenario === 'unknown') return undefined;
  return HANDLER_MAP[scenario];
}

/** 有効なシナリオ名の一覧 */
export const VALID_SCENARIOS = Object.keys(HANDLER_MAP) as Scenario[];
