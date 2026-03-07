import { describe, expect, it } from 'vitest';

import { resolvePickerChange } from '../dateTimeFieldState';

describe('resolvePickerChange', () => {
  it('closes and does not apply value when android picker is dismissed', () => {
    const result = resolvePickerChange({
      platform: 'android',
      event: { type: 'dismissed' },
    });

    expect(result.shouldClose).toBe(true);
    expect(result.shouldApply).toBe(false);
  });

  it('closes and applies value when android picker confirms selection', () => {
    const result = resolvePickerChange({
      platform: 'android',
      event: { type: 'set' },
      selected: new Date('2026-03-07T09:00:00.000Z'),
    });

    expect(result.shouldClose).toBe(true);
    expect(result.shouldApply).toBe(true);
  });

  it('keeps picker open on ios and applies selected value', () => {
    const result = resolvePickerChange({
      platform: 'ios',
      selected: new Date('2026-03-07T09:00:00.000Z'),
    });

    expect(result.shouldClose).toBe(false);
    expect(result.shouldApply).toBe(true);
  });
});
