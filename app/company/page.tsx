import { getHighlights, getPlayerStats, WEEKLY_DATA } from '@/src/mockData';

export const metadata = {
  title: 'TYD Logistics — 会社情報',
  description: 'TYDロジスティクスの実績・信頼性情報',
};

export default function CompanyPage() {
  const highlights = getHighlights();
  const stats = getPlayerStats();
  const totalWeeks = WEEKLY_DATA.length;

  const totalAllTime = WEEKLY_DATA.reduce((sum, w) => {
    return sum + stats.reduce((s, p) => s + (w[p.name] as number || 0), 0);
  }, 0);

  const avgWeekly = Math.round(totalAllTime / totalWeeks);

  return (
    <div style={{ background: '#0D0D0D', minHeight: '100vh', color: '#fff' }}>
      {/* ヘッダー */}
      <header style={{ borderBottom: '1px solid #1a1a1a', padding: '20px 0' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px', height: '36px', background: '#C8102E', borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px',
          }}>T</div>
          <div>
            <p style={{ fontWeight: 700, fontSize: '16px' }}>TYD Logistics</p>
            <p style={{ fontSize: '11px', color: '#666' }}>Trusted Your Delivery</p>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 24px' }}>
        {/* メインタイトル */}
        <h1 style={{ fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 700, lineHeight: 1.3, marginBottom: '12px' }}>
          確実な配送を、<br />すべてのお客様に。
        </h1>
        <p style={{ fontSize: '14px', color: '#888', lineHeight: 1.8, maxWidth: '560px', marginBottom: '48px' }}>
          TYDロジスティクスは福岡を拠点とする軽貨物配送会社です。
          経験豊富なドライバーチームと独自の管理システムで、安定した配送品質を実現しています。
        </p>

        {/* 実績数字 */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '16px', marginBottom: '48px',
        }}>
          {[
            { value: totalAllTime.toLocaleString(), unit: '件', label: '累計配送実績', sub: `${totalWeeks}週間の実績` },
            { value: stats.length.toString(), unit: '名', label: '稼働ドライバー', sub: '全員業務委託契約' },
            { value: avgWeekly.toLocaleString(), unit: '件/週', label: '週間平均配送', sub: 'チーム合計' },
            { value: '99.8', unit: '%', label: '配送完了率', sub: '誤配・紛失ほぼゼロ' },
          ].map(item => (
            <div key={item.label} style={{
              background: '#141414', border: '1px solid #1f1f1f', borderRadius: '12px', padding: '24px',
            }}>
              <p style={{ fontSize: '28px', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                {item.value}<span style={{ fontSize: '14px', fontWeight: 400, color: '#666', marginLeft: '4px' }}>{item.unit}</span>
              </p>
              <p style={{ fontSize: '12px', color: '#aaa', marginTop: '4px' }}>{item.label}</p>
              <p style={{ fontSize: '10px', color: '#555', marginTop: '2px' }}>{item.sub}</p>
            </div>
          ))}
        </div>

        {/* 強み */}
        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px' }}>TYDの強み</h2>
        <div style={{ display: 'grid', gap: '12px', marginBottom: '48px' }}>
          {[
            {
              title: 'リアルタイム管理システム',
              desc: '独自開発のダッシュボードでドライバーの稼働状況をリアルタイムで把握。迅速な配車変更と問題対応が可能です。',
            },
            {
              title: 'LINE Bot 連携',
              desc: '日報・請求書・領収書をLINEから即座に処理。ドライバーの負担を最小限に抑え、配送業務に集中できる環境を提供。',
            },
            {
              title: '安全管理体制',
              desc: '事故・トラブル管理システムによる即時報告体制。車検・免許・保険の期限管理で法令遵守を徹底しています。',
            },
            {
              title: 'スケーラブルな配送体制',
              desc: '繁忙期の急な増便にも対応可能な外注ネットワーク。安定した配送キャパシティを維持します。',
            },
          ].map(item => (
            <div key={item.title} style={{
              background: '#141414', border: '1px solid #1f1f1f', borderRadius: '12px', padding: '20px',
            }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>{item.title}</h3>
              <p style={{ fontSize: '12px', color: '#888', lineHeight: 1.7 }}>{item.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{
          background: 'linear-gradient(135deg, #1a0a0a, #141414)', border: '1px solid #2a1010',
          borderRadius: '16px', padding: '40px', textAlign: 'center',
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>配送のご相談</h2>
          <p style={{ fontSize: '13px', color: '#888', marginBottom: '24px' }}>
            軽貨物配送のご依頼・お見積りはお気軽にお問い合わせください
          </p>
          <a href="https://line.me/" target="_blank" rel="noopener noreferrer"
            style={{
              display: 'inline-block', background: '#C8102E', color: '#fff', padding: '12px 32px',
              borderRadius: '8px', fontSize: '14px', fontWeight: 600, textDecoration: 'none',
            }}>
            LINE でお問い合わせ
          </a>
        </div>
      </main>

      {/* フッター */}
      <footer style={{ borderTop: '1px solid #1a1a1a', padding: '24px 0', marginTop: '48px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          <p style={{ fontSize: '11px', color: '#444' }}>
            &copy; {new Date().getFullYear()} TYD Logistics. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
