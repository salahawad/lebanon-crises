import { z } from 'zod';

export const helpRequestSchema = z.object({
  category: z.enum([
    'medicine', 'shelter', 'food', 'baby_milk',
    'transport', 'clothing', 'hygiene', 'other',
  ]),
  description: z
    .string()
    .min(5, 'Please describe your need briefly')
    .max(500, 'Description too long'),
  governorate: z.enum([
    'beirut', 'mount_lebanon', 'north', 'south',
    'bekaa', 'baalbek_hermel', 'akkar', 'nabatieh',
  ]),
  city: z.string().min(1, 'City is required').max(100),
  area: z.string().max(200).optional().default(''),
  peopleCount: z
    .number({ message: 'Enter a number' })
    .min(1, 'At least 1 person')
    .max(10000, 'Please verify this number'),
  urgency: z.enum(['critical', 'high', 'medium', 'low']),
  contactMethod: z.enum(['phone', 'whatsapp', 'no_contact']),
  phone: z.string().optional(),
  phoneCountryCode: z.string().optional().default('+961'),
  name: z.string().max(100).optional(),
  consent: z.literal(true, {
    message: 'You must agree to continue',
  }),
  language: z.enum(['ar', 'en']).default('ar'),
}).refine(
  (data) => {
    if (data.contactMethod === 'phone' || data.contactMethod === 'whatsapp') {
      return data.phone && data.phone.length >= 6;
    }
    return true;
  },
  {
    message: 'Phone number is required for this contact method',
    path: ['phone'],
  }
);

export const helperSchema = z.object({
  name: z.string().min(2, 'Name is required').max(100),
  organization: z.string().max(200).optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().email('Valid email required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  governorate: z.enum([
    'beirut', 'mount_lebanon', 'north', 'south',
    'bekaa', 'baalbek_hermel', 'akkar', 'nabatieh',
  ]).optional(),
  suppliesCanProvide: z.array(z.enum([
    'medicine', 'shelter', 'food', 'baby_milk',
    'transport', 'clothing', 'hygiene', 'other',
  ])).default([]),
});

export const claimSchema = z.object({
  message: z.string().max(500).optional(),
});

export const adminLoginSchema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(1, 'Password is required'),
});
