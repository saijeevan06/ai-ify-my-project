import type { Blueprint } from '@shared/types';

const origin = () => (import.meta.env.VITE_PUBLIC_URL as string | undefined)?.replace(/\/$/, '') || window.location.origin;

export const displayUrl = (url: string) => url.replace(/^https?:\/\//, '');
export const referralUrl = (code: string) => `${origin()}/r/${code}`;
export const projectUrl = (bp: Blueprint, code?: string) => `${origin()}/p/${bp.id}?i=${encodeURIComponent(bp.original)}${code ? `&ref=${code}` : '&source=whatsapp'}`;
export const homeUrl = (source = 'whatsapp') => `${origin()}/?source=${source}`;

export function projectShareText(bp: Blueprint, code?: string) {
  return [
    'I just AI-ified my college project.',
    '',
    'Mine became:',
    `*${bp.projectName}* — ${bp.score}/10`,
    '',
    'Try yours:',
    projectUrl(bp, code),
    '',
    'We’re also building AI projects in a free 60-minute workshop.',
    code ? 'Join me:' : 'Grab a spot:',
    code ? referralUrl(code) : homeUrl(),
  ].join('\n');
}

export function referralShareText(code: string, project?: string) {
  return [
    'I’m joining a free 60-minute workshop on building AI projects for final year.',
    project ? `My project became *${project}*.` : '',
    '',
    'AI-ify yours first (takes a minute), then grab a spot:',
    referralUrl(code),
  ]
    .filter((l, i, a) => l !== '' || a[i - 1] !== '')
    .join('\n');
}

/** wa.me opens the app on phones and WhatsApp Web / Desktop elsewhere. */
export function openWhatsApp(text: string) {
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  }
}
