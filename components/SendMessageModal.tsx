'use client';

import { useState, useEffect } from 'react';

type MessageMode = 'free' | 'numbers' | 'mental';

interface SendMessageModalProps {
  driverName: string;
  userId: string;
  context: string;
  onClose: () => void;
}

const MODE_CONFIG = {
  free: { label: 'フリー', icon: '✉', color: 'var(--text-secondary)', promptSuffix: '' },
  numbers: { label: '数字', icon: '¥', color: 'var(--brand-gold)', promptSuffix: '数字ベースのフィードバック。具体的な件数・売上・前週比などの数字を根拠にした、業績に対する評価と次のアクション提案を含めてください。' },
  mental: { label: 'メンタル', icon: '♥', color: '#EC4899', promptSuffix: 'メンタルケア・モチベーション支援メッセージ。稼働パターンや休息状況を考慮し、心理的安全性を重視した声かけをしてください。相手を責めず、「サポートしたい」という姿勢で。体調や休息への気遣いも含めてください。Googleの心理的安全性、トヨタの改善提案スタイルを参考に。' },
};

export function SendMessageModal({ driverName, userId, context, onClose }: SendMessageModalProps) {
  const [mode, setMode] = useState<MessageMode>('free');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(true);
  const [sent, setSent] = useState(false);

  const generateMessage = async (selectedMode: MessageMode) => {
    setGenerating(true);
    try {
      const modeContext = MODE_CONFIG[selectedMode].promptSuffix
        ? `${context}\n\n【メッセージモード】${MODE_CONFIG[selectedMode].promptSuffix}`
        : context;

      const res = await fetch('/api/generate-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driverName, context: modeContext }),
      });
      const data = await res.json();
      setMessage(data.message);
    } catch {
      setMessage(`${driverName}さん、いつもお疲れさまです！引き続きよろしくお願いします。`);
    }
    setGenerating(false);
  };

  useEffect(() => {
    generateMessage(mode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleModeChange = (newMode: MessageMode) => {
    setMode(newMode);
    generateMessage(newMode);
  };

  const sendMessage = async () => {
    if (!message.trim()) return;
    setLoading(true);
    try {
      await fetch('/api/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, message }),
      });
      setSent(true);
      setTimeout(onClose, 1500);
    } catch {
      alert('送信に失敗しました');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative w-full max-w-md"
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--r-xl)',
          boxShadow: 'var(--shadow-elevated)',
        }}
      >
        <div className="p-5">
          {/* ヘッダー */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
              {driverName}さんにLINE送信
            </h3>
            <button onClick={onClose} className="p-1 cursor-pointer" style={{ color: 'var(--text-muted)' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* モード切替 */}
          <div className="flex gap-2 mb-3">
            {(Object.entries(MODE_CONFIG) as [MessageMode, typeof MODE_CONFIG.free][]).map(([key, config]) => (
              <button
                key={key}
                onClick={() => handleModeChange(key)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium cursor-pointer transition-all"
                style={{
                  borderRadius: 'var(--r-md)',
                  background: mode === key ? 'var(--bg-surface)' : 'transparent',
                  color: mode === key ? config.color : 'var(--text-muted)',
                  border: mode === key ? `1px solid ${config.color}` : '1px solid var(--border-subtle)',
                }}
              >
                <span className="text-sm">{config.icon}</span>
                {config.label}
              </button>
            ))}
          </div>

          {/* モード説明 */}
          <p className="text-[10px] mb-3 px-1" style={{ color: 'var(--text-disabled)' }}>
            {mode === 'numbers' && '業績データに基づく数字のフィードバック。具体的な件数や売上の変動を根拠にしたメッセージ。'}
            {mode === 'mental' && '心理的安全性を重視したメンタルケアメッセージ。稼働状況や休息への配慮を含む。'}
            {mode === 'free' && '自由にメッセージを作成・編集して送信。AIによる自動生成も利用可能。'}
          </p>

          <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
            状況: {context}
          </p>

          {sent ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center rounded-full"
                style={{ background: 'var(--positive-soft)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M5 13l4 4L19 7" stroke="var(--positive)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="text-sm font-semibold" style={{ color: 'var(--positive)' }}>送信完了</p>
            </div>
          ) : (
            <>
              <textarea
                value={generating ? '' : message}
                onChange={e => setMessage(e.target.value)}
                rows={5}
                disabled={generating}
                className="w-full p-3 text-sm resize-none"
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--r-md)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  opacity: generating ? 0.5 : 1,
                }}
                placeholder={generating ? 'AIがメッセージを生成中...' : 'メッセージを入力'}
              />

              <div className="flex items-center justify-between mt-4">
                <button
                  onClick={() => generateMessage(mode)}
                  disabled={generating}
                  className="text-xs px-3 py-2 cursor-pointer transition-colors"
                  style={{
                    background: 'var(--bg-surface)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--r-sm)',
                    opacity: generating ? 0.5 : 1,
                  }}
                >
                  {generating ? '生成中...' : 'AIで再生成'}
                </button>

                <button
                  onClick={sendMessage}
                  disabled={loading || !message.trim() || generating}
                  className="text-xs px-4 py-2 font-semibold cursor-pointer transition-colors"
                  style={{
                    background: loading || !message.trim() || generating ? 'var(--text-disabled)' : 'var(--brand-crimson)',
                    color: 'var(--text-primary)',
                    borderRadius: 'var(--r-sm)',
                    border: 'none',
                    minHeight: '40px',
                  }}
                >
                  {loading ? '送信中...' : 'LINEで送信'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
