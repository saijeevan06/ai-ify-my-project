import { z } from 'zod';
import { SOURCES, EVENT_NAMES } from './types.ts';
import { YEARS } from './input.ts';
export { YEARS, projectInputProblem } from './input.ts';

/**
 * Shape the model is asked to return. Deliberately constraint-light (no min/max)
 * so it maps cleanly onto structured outputs; `sanitizeDraft` enforces limits after.
 */
export const AIDraftSchema = z.object({
  isValidProject: z.boolean(),
  projectName: z.string(),
  summary: z.string(),
  aiUpgrades: z.array(z.object({ title: z.string(), description: z.string(), concept: z.string() })),
  techStack: z.array(z.string()),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']),
  estimatedTime: z.string(),
  score: z.number(),
  whyItWorks: z.string(),
  aiConcepts: z.array(z.string()),
});
export type AIDraft = z.infer<typeof AIDraftSchema>;

export const AIifyRequestSchema = z.object({
  project: z.string().trim().min(3).max(140),
  context: z.string().trim().max(280).optional(),
  demo: z.boolean().optional(),
});

const phoneDigits = (v: string) => v.replace(/[^\d]/g, '');

export function normalizePhone(v: string): string | null {
  let d = phoneDigits(v);
  if (d.length === 12 && d.startsWith('91')) d = d.slice(2);
  if (d.length === 11 && d.startsWith('0')) d = d.slice(1);
  return /^[6-9]\d{9}$/.test(d) ? d : null;
}


export const RegistrationSchema = z.object({
  name: z.string().trim().min(2, 'Your name, please.').max(60),
  email: z.email('That email doesn’t look right.').trim().toLowerCase().max(120),
  phone: z
    .string()
    .trim()
    .refine((v) => normalizePhone(v) !== null, 'A 10-digit WhatsApp number, please.'),
  college: z.string().trim().min(3, 'Which college?').max(100),
  branch: z.string().trim().min(2, 'Your branch, e.g. CSE.').max(40),
  year: z.enum(YEARS, { message: 'Pick your year.' }),
  originalProject: z.string().trim().max(140).optional(),
  generatedProject: z.string().trim().max(90).optional(),
  blueprintId: z.string().max(40).optional(),
  referralCode: z.string().trim().toUpperCase().max(12).optional(),
  source: z.enum(SOURCES).optional(),
  campaign: z.string().max(60).optional(),
});
export type RegistrationInput = z.infer<typeof RegistrationSchema>;

export const EventsSchema = z.object({
  events: z
    .array(
      z.object({
        name: z.enum(EVENT_NAMES),
        ts: z.string().max(40),
        sessionId: z.string().max(40),
        source: z.enum(SOURCES).optional(),
        campaign: z.string().max(60).optional(),
        college: z.string().max(100).optional(),
        props: z.record(z.string(), z.union([z.string().max(200), z.number(), z.boolean(), z.null()])).optional(),
      }),
    )
    .max(50),
});

const DISPOSABLE = ['mailinator.com', 'tempmail.com', '10minutemail.com', 'guerrillamail.com', 'yopmail.com', 'trashmail.com', 'sharklasers.com', 'getnada.com', 'temp-mail.org', 'dispostable.com'];
export const isDisposableEmail = (email: string) => DISPOSABLE.includes(email.split('@')[1] ?? '');

/** Collapse gmail dots and +tags so one inbox can't register twice. */
export function emailKey(email: string): string {
  const [local = '', domain = ''] = email.toLowerCase().split('@');
  let l = local.split('+')[0] ?? '';
  if (domain === 'gmail.com' || domain === 'googlemail.com') l = l.replace(/\./g, '');
  return `${l}@${domain === 'googlemail.com' ? 'gmail.com' : domain}`;
}
