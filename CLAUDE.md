# TYD LINE Bot + Dashboard

## Overview
TYDロジスティクス向け LINE Bot + 管理ダッシュボードのデモ。
Next.js App Router で LINE Webhook API Route + Dashboard UI を統合。

## Tech Stack
- Next.js 16 (App Router) + TypeScript
- @line/bot-sdk, @anthropic-ai/sdk, googleapis
- Recharts + Tailwind CSS

## Key Files
- `app/api/webhook/route.ts` - LINE Webhook endpoint
- `app/dashboard/page.tsx` - Dashboard UI
- `src/router.ts` - Message classification (keyword-first, Claude fallback)
- `src/handlers/` - 5 scenario handlers (dailyReport, absence, jobInquiry, invoice, receipt)
- `src/services/` - sheets.ts, claude.ts, line.ts
- `src/mockData.ts` - 4 weeks of mock data for 5 players
- `components/` - Dashboard components (HighlightCards, GrowthChart, PlayerTable, WeeklySummary)

## Google Sheets Structure
Spreadsheet "TYD_運営管理_2026" with sheets:
- 日報 (A:E) - datetime, name, userId, count, message
- 欠勤・連絡 (A:F) - datetime, name, userId, type, message, botReply
- 請求書 (A:G) - docNumber, datetime, name, userId, date, amount, company
- 領収書 (A:G) - same as 請求書
- プレイヤーデータ (A:E) - name, userId, status, registeredDate, memo
- 集計 - formula-based aggregation

## Environment Variables
LINE_CHANNEL_SECRET, LINE_CHANNEL_ACCESS_TOKEN, ANTHROPIC_API_KEY, GOOGLE_SHEETS_CREDENTIALS (base64), GOOGLE_SHEET_ID
