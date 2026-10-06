import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { AIDraftSchema } from '../shared/validation.ts';
import { patternOrInvalid, sanitizeDraft } from '../shared/matcher.ts';
import type { Blueprint } from '../shared/types.ts';
import { env } from './env.ts';

const client = env.aiKey ? new Anthropic({ apiKey: env.aiKey, maxRetries: 0 }) : null;
export const aiEnabled = () => client !== null;

const SYSTEM = `You upgrade final-year engineering students' college projects into stronger AI-powered versions.

Given a project idea (often just a few words), return a blueprint a student could realistically build in 1–4 weeks with free or cheap tools.

Rules:
- projectName: 2–6 words, Title Case, specific to the idea (e.g. "AI Smart Parking Intelligence"). No colons, no emoji.
- summary: one sentence, under 25 words, saying what the upgraded system does.
- aiUpgrades: exactly 4. title: 1–3 words. description: one concrete sentence under 16 words describing what the user experiences. concept: the AI technique in 1–2 words (e.g. "Computer vision", "Forecasting", "LLM", "Embeddings", "Classification").
- Each upgrade must use a different technique and must genuinely fit the idea. Prefer upgrades with available datasets or data the project already produces.
- techStack: 4–6 real tools students use (e.g. Python, OpenCV, FastAPI, React, PostgreSQL, "LLM").
- difficulty: Beginner, Intermediate or Advanced. estimatedTime like "1–2 weeks".
- score: 6.0–9.8, your honest rating of how naturally AI fits this project (one decimal).
- whyItWorks: 2–3 plain sentences, specific to this idea, written to the student ("you"). No hype words like revolutionary, cutting-edge, unlock, leverage, seamless.
- aiConcepts: the distinct techniques used.
- If the input is not a software/hardware project idea (gibberish, a question, offensive content), set isValidProject to false and fill the other fields with short placeholders.
Write plain text only — no markdown.`;

export type GenerateOutcome = { blueprint: Blueprint; via: 'ai' | 'pattern' } | { invalid: true };

function fromPatterns(project: string): GenerateOutcome {
  const bp = patternOrInvalid(project);
  return bp ? { blueprint: bp, via: 'pattern' } : { invalid: true };
}

export async function generateBlueprint(project: string, context?: string, opts: { demo?: boolean } = {}): Promise<GenerateOutcome> {
  // Demo mode is deterministic so the 2-minute walkthrough never surprises anyone.
  if (!client || opts.demo) return fromPatterns(project);
  try {
    const res = await client.messages.parse(
      {
        model: env.aiModel,
        max_tokens: 8000,
        system: SYSTEM,
        messages: [{ role: 'user', content: `Project idea: ${project}${context ? `\nExtra context: ${context}` : ''}` }],
        output_config: { format: zodOutputFormat(AIDraftSchema), effort: 'low' },
      },
      { timeout: env.aiTimeoutMs },
    );
    if (res.stop_reason === 'refusal' || !res.parsed_output) return fromPatterns(project);
    if (!res.parsed_output.isValidProject) return { invalid: true };
    const bp = sanitizeDraft(project, res.parsed_output);
    return bp ? { blueprint: bp, via: 'ai' } : fromPatterns(project);
  } catch (err) {
    // Timeouts, rate limits, network, auth — the student never sees any of it.
    if (err instanceof Anthropic.APIError) console.warn(`[ai] ${err.status ?? 'network'} ${err.name}: falling back to patterns`);
    else console.warn('[ai] generation failed, falling back to patterns', err);
    return fromPatterns(project);
  }
}
