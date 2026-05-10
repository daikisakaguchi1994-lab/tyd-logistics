import { describe, it, expect, beforeAll } from 'vitest';
import { generateInvoiceToken, verifyInvoiceToken } from '@/lib/apiAuth';

// テスト用にLINE_CHANNEL_SECRETを設定
beforeAll(() => {
  process.env.LINE_CHANNEL_SECRET = 'test-secret-for-invoice';
});

describe('invoice token', () => {
  it('generates and verifies a valid token', () => {
    const token = generateInvoiceToken('INV-2026-0001');
    const result = verifyInvoiceToken(token);
    expect(result).toBe('INV-2026-0001');
  });

  it('rejects a tampered token', () => {
    const token = generateInvoiceToken('INV-2026-0001');
    const tampered = token.slice(0, -1) + 'x';
    expect(verifyInvoiceToken(tampered)).toBeNull();
  });

  it('rejects a token without a signature', () => {
    expect(verifyInvoiceToken('INV-2026-0001')).toBeNull();
  });

  it('rejects an empty string', () => {
    expect(verifyInvoiceToken('')).toBeNull();
  });

  it('rejects a forged signature with wrong length', () => {
    expect(verifyInvoiceToken('INV-2026-0001.abc')).toBeNull();
  });

  it('handles PAY- prefix correctly', () => {
    const token = generateInvoiceToken('PAY-2026-0005');
    expect(verifyInvoiceToken(token)).toBe('PAY-2026-0005');
  });
});
