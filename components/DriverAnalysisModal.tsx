'use client';

import { useState, useEffect } from 'react';
import { getDriverDetailData } from '@/src/mockData';

interface DriverAnalysisModalProps {
  driverName: string;
  userId: string;
  onClose: () => void;
}

interface AnalysisResult {
  performance: string;
  trend: string;
  workPattern: string;
  teamComparison: string;
  communication: string;
  suggestedMessage: string;
}

function StatRow({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-b-border-subtle">
      <span className="text-xs text-muted">{label}</span>
      <div className="text-right">
        <span className="num text-sm font-semibold text-primary">{value}</span>
        {sub && <span className="num text-xs ml-1.5 text-muted">{sub}</span>}
      </div>
    </div>
  );
}

export function DriverAnalysisModal({ driverName, userId, onClose }: DriverAnalysisModalProps) {
  const [phase, setPhase] = useState<'analyzing' | 'result' | 'sending' | 'sent'>('analyzing');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const detail = getDriverDetailData(driverName);

  useEffect(() => {
    const analyze = async () => {
      setPhase('analyzing');
      try {
        const res = await fetch('/api/analyze-driver', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            driverName,
            character: detail.character,
            currentWeek: detail.currentWeek,
            last4Avg: detail.last4Avg,
            prev4Avg: detail.prev4Avg,
            monthChange: detail.monthChange,
            teamAvgCurrent: detail.teamAvgCurrent,
            vsTeam: detail.vsTeam,
            dailyAvg: detail.dailyAvg,
            bestWeek: detail.bestWeek,
            worstWeek: detail.worstWeek,
            totalDeliveries: detail.totalDeliveries,
            recentWeeks: detail.weeks.slice(-8),
          }),
        });
        const data = await res.json();
        setAnalysis(data.analysis);
        setMessage(data.analysis.suggestedMessage);
        setPhase('result');
      } catch {
        setAnalysis({
          performance: `${driverName}さんの今週の配送件数は${detail.currentWeek}件。直近4週平均は${detail.last4Avg}件。`,
          trend: detail.monthChange >= 0 ? '上昇傾向' : '下降傾向',
          workPattern: `1日平均${detail.dailyAvg}件の稼働。安定した勤務パターン。`,
          teamComparison: `チーム平均${detail.teamAvgCurrent}件に対して${detail.vsTeam >= 0 ? '+' : ''}${detail.vsTeam}%。`,
          communication: '定期的な声かけでモチベーション維持を推奨。',
          suggestedMessage: `${driverName}さん、いつもお疲れさまです！今週も${detail.currentWeek}件、しっかり回してくれてありがとうございます。引き続きよろしくお願いします！`,
        });
        setMessage(`${driverName}さん、いつもお疲れさまです！今週も${detail.currentWeek}件、しっかり回してくれてありがとうございます。引き続きよろしくお願いします！`);
        setPhase('result');
      }
    };
    analyze();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driverName]);

  const sendMessage = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      await fetch('/api/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, message }),
      });
      setPhase('sent');
      setTimeout(onClose, 1500);
    } catch {
      alert('送信に失敗しました');
    }
    setSending(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-elevated border border-border-default rounded-xl"
        onClick={e => e.stopPropagation()}
        style={{
          boxShadow: 'var(--shadow-elevated)',
        }}
      >
        <div className="p-5">
          {/* ヘッダー */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center text-sm font-bold rounded-md bg-gold-soft text-gold">
                AI
              </div>
              <div>
                <h3 className="text-base font-bold text-primary">
                  {driverName}さん パフォーマンス分析
                </h3>
                <p className="text-xs text-muted">
                  {detail.character} / 累計 {detail.totalDeliveries.toLocaleString()}件
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-1 cursor-pointer text-muted">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {phase === 'analyzing' && (
            <div className="py-12 text-center">
              <div className="w-10 h-10 mx-auto mb-4 rounded-full flex items-center justify-center bg-gold-soft">
                <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"
                  style={{ borderColor: 'var(--brand-gold)', borderTopColor: 'transparent' }} />
              </div>
              <p className="text-sm font-medium text-primary">AIが分析中...</p>
              <p className="text-xs mt-1 text-muted">過去20週間のデータを解析しています</p>
            </div>
          )}

          {phase === 'sent' && (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center rounded-full bg-positive-soft">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M5 13l4 4L19 7" stroke="var(--positive)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="text-sm font-semibold text-positive">送信完了</p>
            </div>
          )}

          {phase === 'result' && analysis && (
            <div className="space-y-4">
              {/* 数値サマリー */}
              <div className="p-3 bg-surface rounded-md">
                <StatRow label="今週" value={`${detail.currentWeek}件`} sub={`1日平均 ${detail.dailyAvg}件`} />
                <StatRow label="直近4週平均" value={`${detail.last4Avg}件`} sub={`前月比 ${detail.monthChange >= 0 ? '+' : ''}${detail.monthChange}%`} />
                <StatRow label="チーム平均比" value={`${detail.vsTeam >= 0 ? '+' : ''}${detail.vsTeam}%`} sub={`平均 ${detail.teamAvgCurrent}件`} />
                <StatRow label="自己ベスト" value={`${detail.bestWeek}件`} sub={`最低 ${detail.worstWeek}件`} />
              </div>

              {/* AI分析結果 */}
              <div className="space-y-3">
                <AnalysisSection icon="📊" title="パフォーマンス" content={analysis.performance} />
                <AnalysisSection icon="📈" title="トレンド分析" content={analysis.trend} />
                <AnalysisSection icon="📅" title="稼働パターン" content={analysis.workPattern} />
                <AnalysisSection icon="👥" title="チーム内ポジション" content={analysis.teamComparison} />
                <AnalysisSection icon="💬" title="コミュニケーション戦略" content={analysis.communication} />
              </div>

              {/* メッセージ生成 */}
              <div className="pt-3 border-t border-t-border-subtle">
                <label className="text-xs font-semibold block mb-2 text-primary">
                  分析に基づく推奨メッセージ
                </label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={4}
                  className="w-full p-3 text-sm resize-none bg-surface border border-border-default rounded-md text-primary outline-none"
                />
                <div className="flex justify-end mt-3">
                  <button
                    onClick={sendMessage}
                    disabled={sending || !message.trim()}
                    className={`text-xs px-4 py-2.5 font-semibold cursor-pointer transition-colors text-primary rounded-sm border-0 ${sending || !message.trim() ? 'bg-disabled' : 'bg-crimson'}`}
                    style={{
                      minHeight: '44px',
                    }}
                  >
                    {sending ? '送信中...' : 'LINEで送信'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AnalysisSection({ icon, title, content }: { icon: string; title: string; content: string }) {
  return (
    <div className="p-3 bg-surface rounded-md">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-sm">{icon}</span>
        <span className="text-xs font-semibold text-primary">{title}</span>
      </div>
      <p className="text-xs leading-relaxed text-secondary">{content}</p>
    </div>
  );
}
