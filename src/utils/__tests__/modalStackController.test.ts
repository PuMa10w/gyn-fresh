import { describe, expect, it } from 'vitest';
import { getActiveModalCount, getActiveModalName, isSingleModalActive } from '../modalStackController';

describe('modalStackController', () => {
  it('returns no active modal for an empty stack', () => {
    const stack = { disease: false, questionnaire: false, pharmacology: false };

    expect(getActiveModalCount(stack)).toBe(0);
    expect(getActiveModalName(stack)).toBeNull();
    expect(isSingleModalActive(stack)).toBe(true);
  });

  it('chooses the visible modal by the protected priority order', () => {
    const stack = { disease: true, questionnaire: true, pharmacology: true };

    expect(getActiveModalCount(stack)).toBe(3);
    expect(getActiveModalName(stack)).toBe('disease');
    expect(isSingleModalActive(stack)).toBe(false);
  });
});
