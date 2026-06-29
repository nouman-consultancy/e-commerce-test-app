import { formatPrice, shortId, truncate } from './utils';

describe('formatPrice', () => {
  it('formats a number as GBP currency', () => {
    expect(formatPrice(9.99)).toBe('£9.99');
  });

  it('adds thousands separator for large amounts', () => {
    expect(formatPrice(1000)).toBe('£1,000.00');
  });

  it('accepts a string input', () => {
    expect(formatPrice('24.99')).toBe('£24.99');
  });

  it('formats zero correctly', () => {
    expect(formatPrice(0)).toBe('£0.00');
  });
});

describe('shortId', () => {
  it('returns the first 8 characters uppercased', () => {
    expect(shortId('abc12345-rest-of-uuid')).toBe('ABC12345');
  });

  it('uppercases hex characters', () => {
    expect(shortId('ff0011aa-xxxx')).toBe('FF0011AA');
  });
});

describe('truncate', () => {
  it('truncates text that exceeds maxLength', () => {
    expect(truncate('hello world', 5)).toBe('hello…');
  });

  it('returns the original text when within maxLength', () => {
    expect(truncate('hi', 10)).toBe('hi');
  });

  it('returns the original text when equal to maxLength', () => {
    expect(truncate('exact', 5)).toBe('exact');
  });
});
