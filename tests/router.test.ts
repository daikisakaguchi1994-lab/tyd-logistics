import { describe, it, expect } from 'vitest';
import { classify } from '@/src/router';

describe('classify', () => {
  // === daily_report ===
  describe('daily_report', () => {
    it.each([
      '今日120件配送しました',
      '150件',
      '本日80件でした',
      '今日は200件です',
    ])('"%s" → daily_report', (text) => {
      const result = classify(text);
      expect(result.scenario).toBe('daily_report');
    });

    it('件数を正しく抽出する', () => {
      const result = classify('今日120件配送しました');
      expect(result.extractedData?.count).toBe(120);
    });

    it('件数0の場合も抽出する', () => {
      const result = classify('0件でした');
      expect(result.scenario).toBe('daily_report');
      expect(result.extractedData?.count).toBe(0);
    });
  });

  // === absence ===
  describe('absence', () => {
    it.each([
      '休みます',
      '欠勤します',
      '体調悪いです',
      '熱があるので休みます',
      '風邪ひいた',
      '遅刻します',
      '怪我をしました',
      '今日は出勤できない',
    ])('"%s" → absence', (text) => {
      expect(classify(text).scenario).toBe('absence');
    });
  });

  // === job_inquiry ===
  describe('job_inquiry', () => {
    it.each([
      '案件ありますか',
      '明日の仕事は？',
      '配送予定を教えて',
      '明日はあるの？',
      '今週の予定',
      '来週の予定は？',
    ])('"%s" → job_inquiry', (text) => {
      expect(classify(text).scenario).toBe('job_inquiry');
    });
  });

  // === invoice ===
  describe('invoice', () => {
    it.each([
      '請求書',
      '今月の請求書',
      '月次請求お願い',
      '請求書発行して',
    ])('"%s" → invoice', (text) => {
      expect(classify(text).scenario).toBe('invoice');
    });

    it('金額付きの請求書リクエストで金額を抽出する', () => {
      const result = classify('請求書 5/15 15万円 ABC商事');
      expect(result.scenario).toBe('invoice');
      expect(result.extractedData?.amount).toBe(150000);
      expect(result.extractedData?.company).toBe('ABC商事');
    });

    it('日付を正しく抽出する', () => {
      const result = classify('請求書 5/15 15万円 ABC商事');
      expect(result.extractedData?.date).toMatch(/\/05\/15$/);
    });
  });

  // === receipt ===
  describe('receipt', () => {
    it.each([
      '領収書',
      '領収書お願い',
      '領収書 5/15 10万円 DEF株式会社',
    ])('"%s" → receipt', (text) => {
      expect(classify(text).scenario).toBe('receipt');
    });

    it('金額付きの領収書で金額を抽出する', () => {
      const result = classify('領収書 3/1 5万円 テスト会社');
      expect(result.scenario).toBe('receipt');
      expect(result.extractedData?.amount).toBe(50000);
    });
  });

  // === recruitment ===
  describe('recruitment', () => {
    it.each([
      '応募したいです',
      '求人を見ました',
      '働きたいです',
      'ドライバー希望です',
      '募集を見て連絡しました',
    ])('"%s" → recruitment', (text) => {
      expect(classify(text).scenario).toBe('recruitment');
    });
  });

  // === unknown ===
  describe('unknown', () => {
    it.each([
      'こんにちは',
      'ありがとう',
      '今日はいい天気ですね',
      '',
    ])('"%s" → unknown', (text) => {
      expect(classify(text).scenario).toBe('unknown');
    });
  });

  // === 優先順位テスト ===
  describe('priority', () => {
    it('件数を含む休み連絡はdaily_reportが先にマッチする', () => {
      // "120件休んだ" — 件数パターンが先にマッチ
      const result = classify('120件休みました');
      expect(result.scenario).toBe('daily_report');
    });

    it('請求書に万円が含まれてもinvoiceにマッチする', () => {
      const result = classify('請求書 15万円');
      expect(result.scenario).toBe('invoice');
    });
  });
});
