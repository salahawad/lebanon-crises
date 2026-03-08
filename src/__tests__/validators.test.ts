import { describe, it, expect } from 'vitest';
import { helpRequestSchema, helperSchema, adminLoginSchema } from '@/lib/validators/request';

describe('helpRequestSchema', () => {
  const validRequest = {
    category: 'medicine',
    description: 'Need insulin for diabetic patient',
    governorate: 'beirut',
    city: 'Beirut',
    area: 'Hamra',
    peopleCount: 1,
    urgency: 'critical',
    contactMethod: 'phone',
    phone: '03123456',
    consent: true,
    language: 'en',
  };

  it('accepts a valid request', () => {
    const result = helpRequestSchema.safeParse(validRequest);
    expect(result.success).toBe(true);
  });

  it('rejects empty description', () => {
    const result = helpRequestSchema.safeParse({ ...validRequest, description: '' });
    expect(result.success).toBe(false);
  });

  it('rejects description over 500 chars', () => {
    const result = helpRequestSchema.safeParse({
      ...validRequest,
      description: 'x'.repeat(501),
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing city', () => {
    const result = helpRequestSchema.safeParse({ ...validRequest, city: '' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid category', () => {
    const result = helpRequestSchema.safeParse({ ...validRequest, category: 'weapons' });
    expect(result.success).toBe(false);
  });

  it('rejects missing consent', () => {
    const result = helpRequestSchema.safeParse({ ...validRequest, consent: false });
    expect(result.success).toBe(false);
  });

  it('requires phone when contact method is phone', () => {
    const result = helpRequestSchema.safeParse({
      ...validRequest,
      contactMethod: 'phone',
      phone: undefined,
    });
    expect(result.success).toBe(false);
  });

  it('does not require phone when contact method is no_contact', () => {
    const result = helpRequestSchema.safeParse({
      ...validRequest,
      contactMethod: 'no_contact',
      phone: undefined,
    });
    expect(result.success).toBe(true);
  });

  it('rejects zero people count', () => {
    const result = helpRequestSchema.safeParse({ ...validRequest, peopleCount: 0 });
    expect(result.success).toBe(false);
  });

  it('defaults area to empty string', () => {
    const { area, ...withoutArea } = validRequest;
    const result = helpRequestSchema.safeParse(withoutArea);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.area).toBe('');
    }
  });
});

describe('helperSchema', () => {
  const validHelper = {
    name: 'Ahmad Khalil',
    email: 'ahmad@example.com',
    password: 'secure123',
  };

  it('accepts a valid helper', () => {
    const result = helperSchema.safeParse(validHelper);
    expect(result.success).toBe(true);
  });

  it('rejects short name', () => {
    const result = helperSchema.safeParse({ ...validHelper, name: 'A' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = helperSchema.safeParse({ ...validHelper, email: 'not-email' });
    expect(result.success).toBe(false);
  });

  it('rejects short password', () => {
    const result = helperSchema.safeParse({ ...validHelper, password: '12345' });
    expect(result.success).toBe(false);
  });

  it('defaults suppliesCanProvide to empty array', () => {
    const result = helperSchema.safeParse(validHelper);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.suppliesCanProvide).toEqual([]);
    }
  });
});

describe('adminLoginSchema', () => {
  it('accepts valid credentials', () => {
    const result = adminLoginSchema.safeParse({
      email: 'admin@relief.lb',
      password: 'admin123',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty password', () => {
    const result = adminLoginSchema.safeParse({
      email: 'admin@relief.lb',
      password: '',
    });
    expect(result.success).toBe(false);
  });
});
