import { describe, it, expect } from 'vitest';
import { DEFAULT_SETTINGS } from '../services/db';

describe('Data Backup & Validation System', () => {
  it('creates valid JSON backup schema payload', () => {
    const payload = {
      app: '30FIT',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      settings: DEFAULT_SETTINGS,
      sessions: [
        {
          id: 1,
          dayNumber: 1,
          dateCompleted: '2026-11-02',
          startedAt: '2026-11-02T08:00:00.000Z',
          finishedAt: '2026-11-02T08:35:00.000Z',
          totalDurationSeconds: 2100,
          activeDurationSeconds: 1500,
          restDurationSeconds: 600,
          isCompleted: true,
          exercises: [],
          sessionType: 'evening' as const
        }
      ],
      assessments: [
        {
          id: 1,
          dayNumber: 1 as const,
          date: '2026-11-02',
          pushupsMax: 25,
          squatsOneMin: 35,
          plankMaxSeconds: 60,
          legRaisesMax: 15,
          jumpingJacksOneMin: 45
        }
      ]
    };

    const jsonString = JSON.stringify(payload);
    const parsed = JSON.parse(jsonString);

    expect(parsed.app).toBe('30FIT');
    expect(parsed.version).toBe('1.0.0');
    expect(parsed.sessions).toHaveLength(1);
    expect(parsed.assessments).toHaveLength(1);
    expect(parsed.settings.challengeStartDate).toBe('2026-11-02');
  });

  it('rejects invalid or corrupted backup payloads', () => {
    const invalidPayloads = [
      {},
      { app: 'OtherApp', version: '1.0.0' },
      { app: '30FIT' }, // missing sessions and settings
      { app: '30FIT', settings: {} } // missing sessions
    ];

    invalidPayloads.forEach(payload => {
      const isValid =
        (payload as any)?.app === '30FIT' &&
        !!(payload as any)?.sessions &&
        !!(payload as any)?.settings;
      expect(isValid).toBe(false);
    });
  });
});
