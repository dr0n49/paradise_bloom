import { expect, it } from 'vitest';
import { formatCurrency, formatPlain } from './currency';

it('keeps easing fractions out of ordinary cash and cluster labels', () => {
  expect(formatCurrency(1.735025, 'USD', 'en-US', 3.2)).toBe('$1.74');
  expect(formatPlain(0.199581, 'USD', 0.2)).toBe('0.20');
});

it('retains authoritative sub-cent precision during a count-up', () => {
  expect(formatPlain(0.00010486, 'USD', 0.000123)).toBe('0.000105');
  expect(formatCurrency(0.00351, 'JPY', 'en-US', 0.005)).toBe('¥0.004');
});
