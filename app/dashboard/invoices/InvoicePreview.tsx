'use client';

import type { InvoiceData } from '@/src/types';

export function InvoicePreview({ invoice, onClose }: { invoice: InvoiceData; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: 'var(--r-xl)', boxShadow: 'var(--shadow-elevated)' }}>

        <div id="invoice-print" className="p-8" style={{ color: '#111', fontFamily: 'sans-serif' }}>
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: '#111' }}>請求書</h1>
              <p className="text-sm mt-1" style={{ color: '#666' }}>INVOICE</p>
            </div>
            <div className="text-right text-sm" style={{ color: '#333' }}>
              <p className="font-semibold">{invoice.invoiceNumber}</p>
              <p>発行日: {invoice.issueDate}</p>
              <p>支払期限: {invoice.dueDate}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <p className="text-xs font-semibold mb-1" style={{ color: '#999' }}>請求先</p>
              <p className="text-base font-bold" style={{ color: '#111' }}>{invoice.to.name}</p>
              <p className="text-sm" style={{ color: '#555' }}>{invoice.to.address}</p>
            </div>
            <div>
              <p className="text-xs font-semibold mb-1" style={{ color: '#999' }}>発行者</p>
              <p className="text-base font-bold" style={{ color: '#111' }}>{invoice.from.name}</p>
              <p className="text-sm" style={{ color: '#555' }}>{invoice.from.address}</p>
              <p className="text-sm" style={{ color: '#555' }}>{invoice.from.phone}</p>
            </div>
          </div>

          <div className="mb-6 p-4" style={{ background: '#f8f8f8', borderRadius: '8px' }}>
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: '#666' }}>ご請求金額（税込）</span>
              <span className="text-2xl font-bold num" style={{ color: '#111' }}>
                ¥{invoice.total.toLocaleString()}
              </span>
            </div>
          </div>

          <table className="w-full mb-6" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ddd' }}>
                <th className="text-left text-xs py-2 px-2" style={{ color: '#999' }}>品目</th>
                <th className="text-right text-xs py-2 px-2" style={{ color: '#999' }}>数量</th>
                <th className="text-right text-xs py-2 px-2" style={{ color: '#999' }}>単価</th>
                <th className="text-right text-xs py-2 px-2" style={{ color: '#999' }}>金額</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                  <td className="text-sm py-2.5 px-2" style={{ color: '#333' }}>{item.description}</td>
                  <td className="text-sm py-2.5 px-2 text-right num" style={{ color: '#333' }}>{item.quantity.toLocaleString()}</td>
                  <td className="text-sm py-2.5 px-2 text-right num" style={{ color: '#333' }}>¥{item.unitPrice.toLocaleString()}</td>
                  <td className="text-sm py-2.5 px-2 text-right num font-semibold" style={{ color: '#111' }}>¥{item.amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end">
            <div className="w-64 space-y-1.5">
              <div className="flex justify-between text-sm" style={{ color: '#555' }}>
                <span>小計</span>
                <span className="num">¥{invoice.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm" style={{ color: '#555' }}>
                <span>消費税（10%）</span>
                <span className="num">¥{invoice.tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-base font-bold pt-2" style={{ borderTop: '2px solid #111', color: '#111' }}>
                <span>合計</span>
                <span className="num">¥{invoice.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {invoice.notes && (
            <div className="mt-6 p-3 text-xs" style={{ background: '#f8f8f8', borderRadius: '6px', color: '#666' }}>
              <p className="font-semibold mb-1">備考</p>
              <p>{invoice.notes}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 px-8 py-4" style={{ borderTop: '1px solid #eee' }}>
          <button onClick={onClose} className="text-sm px-4 py-2 cursor-pointer"
            style={{ background: '#f0f0f0', color: '#333', border: 'none', borderRadius: '6px' }}>
            閉じる
          </button>
          <button
            onClick={() => {
              const printContent = document.getElementById('invoice-print');
              if (!printContent) return;
              const w = window.open('', '_blank');
              if (!w) return;
              w.document.write(`
                <html><head><title>${invoice.invoiceNumber}</title>
                <style>
                  body { font-family: sans-serif; margin: 0; padding: 20px; color: #111; }
                  .num { font-variant-numeric: tabular-nums; }
                  table { width: 100%; border-collapse: collapse; }
                  th { text-align: left; }
                  @media print { @page { margin: 15mm; size: A4; } }
                </style>
                </head><body>${printContent.innerHTML}</body></html>
              `);
              w.document.close();
              w.print();
            }}
            className="text-sm px-4 py-2 font-semibold cursor-pointer"
            style={{ background: 'var(--brand-crimson)', color: '#fff', border: 'none', borderRadius: '6px' }}>
            印刷 / PDF保存
          </button>
        </div>
      </div>
    </div>
  );
}
