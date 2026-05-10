import { NextResponse } from 'next/server';

/**
 * API成功レスポンス
 */
export function apiOk<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

/**
 * APIエラーレスポンス（統一形式）
 * 常に { error: string } を返す
 */
export function apiError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

/** 400 Bad Request */
export function apiBadRequest(message = 'リクエストが不正です') {
  return apiError(message, 400);
}

/** 401 Unauthorized */
export function apiUnauthorized(message = '認証が必要です') {
  return apiError(message, 401);
}

/** 403 Forbidden */
export function apiForbidden(message = 'アクセスが拒否されました') {
  return apiError(message, 403);
}

/** 404 Not Found */
export function apiNotFound(message = '見つかりませんでした') {
  return apiError(message, 404);
}

/** 500 Internal Server Error */
export function apiServerError(message = 'サーバーエラーが発生しました') {
  return apiError(message, 500);
}
