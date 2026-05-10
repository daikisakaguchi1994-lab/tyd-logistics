import type { ClassifyResult, Scenario } from './types';

const RULES: { scenario: Scenario; patterns: RegExp[]; extract?: (text: string) => Record<string, string | number> }[] = [
  {
    scenario: 'daily_report',
    patterns: [/(\d+)\s*件/],
    extract: (text) => {
      const m = text.match(/(\d+)\s*件/);
      return { count: m ? parseInt(m[1], 10) : 0 };
    },
  },
  {
    scenario: 'absence',
    patterns: [/(休|欠勤|体調|病気|遅刻|熱|風邪|怪我|行けない|出勤できない|出れない)/],
  },
  {
    scenario: 'job_inquiry',
    patterns: [/(案件|仕事|配送予定|シフト)/, /明日.*あ(る|り)/, /(今週|来週).*予定/],
  },
  {
    scenario: 'invoice',
    patterns: [/請求書/, /月次請求/, /今月.*請求/, /請求.*発行/, /請求.*お願い/],
    extract: (text) => parseDocumentRequest(text),
  },
  {
    scenario: 'receipt',
    patterns: [/領収書/],
    extract: (text) => parseDocumentRequest(text),
  },
];

function parseDocumentRequest(text: string): Record<string, string | number> {
  const data: Record<string, string | number> = {};

  // Date: "5/15", "2026/05/15", "5月15日", "2026年5月15日"
  const datePatterns = [
    /(\d{4})[\/年](\d{1,2})[\/月](\d{1,2})日?/,
    /(\d{1,2})[\/月](\d{1,2})日?/,
  ];
  for (const p of datePatterns) {
    const m = text.match(p);
    if (m) {
      if (m.length === 4) {
        data.date = `${m[1]}/${m[2].padStart(2, '0')}/${m[3].padStart(2, '0')}`;
      } else {
        const year = new Date().getFullYear();
        data.date = `${year}/${m[1].padStart(2, '0')}/${m[2].padStart(2, '0')}`;
      }
      break;
    }
  }

  // Amount: "15万円", "150,000", "150000", "15万"
  const amountPatterns = [
    /(\d+)\s*万\s*円?/,
    /([\d,]+)\s*円/,
    /金額[:\s]*(\d[\d,]*)/,
  ];
  for (const p of amountPatterns) {
    const m = text.match(p);
    if (m) {
      const raw = m[1].replace(/,/g, '');
      data.amount = p === amountPatterns[0] ? parseInt(raw, 10) * 10000 : parseInt(raw, 10);
      break;
    }
  }

  // Company: after amount/date, remaining text chunk
  const cleaned = text
    .replace(/請求書|領収書/g, '')
    .replace(/\d{4}[\/年]\d{1,2}[\/月]\d{1,2}日?/g, '')
    .replace(/\d{1,2}[\/月]\d{1,2}日?/g, '')
    .replace(/\d+\s*万\s*円?/g, '')
    .replace(/[\d,]+\s*円/g, '')
    .replace(/金額[:\s]*\d[\d,]*/g, '')
    .replace(/日付[:\s]*/g, '')
    .replace(/取引先[:\s]*/g, '')
    .trim();
  if (cleaned.length > 0) {
    // Take the longest word-like segment
    const segments = cleaned.split(/[\s、,]+/).filter(s => s.length > 0);
    if (segments.length > 0) {
      data.company = segments.join(' ');
    }
  }

  return data;
}

export function classify(text: string): ClassifyResult {
  for (const rule of RULES) {
    if (rule.patterns.some(p => p.test(text))) {
      return {
        scenario: rule.scenario,
        extractedData: rule.extract?.(text),
      };
    }
  }
  return { scenario: 'unknown' };
}
