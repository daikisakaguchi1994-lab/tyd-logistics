import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('validateEnv', () => {
  const REQUIRED_KEYS = [
    'LINE_CHANNEL_SECRET',
    'LINE_CHANNEL_ACCESS_TOKEN',
    'ANTHROPIC_API_KEY',
    'GOOGLE_SERVICE_ACCOUNT_JSON_BASE64',
    'GOOGLE_SPREADSHEET_ID',
    'DASHBOARD_PASSWORD',
  ];

  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    // Set all required vars
    for (const key of REQUIRED_KEYS) {
      process.env[key] = 'test-value';
    }
    // Reset module cache to allow re-validation
    vi.resetModules();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('does not throw when all required vars are set', async () => {
    const { validateEnv } = await import('@/lib/env');
    expect(() => validateEnv()).not.toThrow();
  });

  it('throws when a required var is missing', async () => {
    delete process.env.LINE_CHANNEL_SECRET;
    const { validateEnv } = await import('@/lib/env');
    expect(() => validateEnv()).toThrow('LINE_CHANNEL_SECRET');
  });

  it('lists all missing vars in error message', async () => {
    delete process.env.LINE_CHANNEL_SECRET;
    delete process.env.DASHBOARD_PASSWORD;
    const { validateEnv } = await import('@/lib/env');
    expect(() => validateEnv()).toThrow(/LINE_CHANNEL_SECRET[\s\S]*DASHBOARD_PASSWORD/);
  });

  it('env() returns the value after validation', async () => {
    process.env.LINE_CHANNEL_SECRET = 'my-secret';
    const { validateEnv, env } = await import('@/lib/env');
    validateEnv();
    expect(env('LINE_CHANNEL_SECRET')).toBe('my-secret');
  });
});
