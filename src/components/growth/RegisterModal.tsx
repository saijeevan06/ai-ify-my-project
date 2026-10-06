import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { YEARS } from '@shared/input';
import type { RegistrationInput } from '@shared/validation';
import { collegeKey } from '@shared/ids';
import { Modal } from '@/components/ui/Modal';
import { Field } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { Highlighter, Label } from '@/components/ui/primitives';
import { useToast } from '@/components/ui/Toast';
import { useJourney } from '@/hooks/useJourney';
import { api, ApiError } from '@/services/api';
import { clearRef, getAttribution } from '@/lib/attribution';
import { track } from '@/lib/analytics';
import { cn } from '@/lib/cn';

const BRANCHES = ['CSE', 'IT', 'AI & ML', 'AI & DS', 'ECE', 'EEE', 'MECH', 'CIVIL', 'CHEM'];
type Errors = Partial<Record<keyof RegistrationInput, string>>;

const DEMO_STUDENT = () => ({
  name: 'Priya Raman',
  email: `priya.${Math.random().toString(36).slice(2, 7)}@example.com`,
  phone: `9${String(Math.floor(100000000 + Math.random() * 899999999))}`,
  college: 'Eastgate Institute of Technology',
  branch: 'CSE',
  year: 'Final year',
});

/** Figma: RegistrationForm. Five fields, one optional. Target: under 30 seconds. */
export function RegisterModal() {
  const { registerOpen, closeRegister, blueprint, setMe, demo } = useJourney();
  const navigate = useNavigate();
  const toast = useToast();
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [colleges, setColleges] = useState<string[]>([]);
  const [prefill, setPrefill] = useState<Record<string, string> | null>(null);
  const form = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!registerOpen) return;
    api.colleges().then(setColleges).catch(() => {});
  }, [registerOpen]);

  // Demo mode: fill the form with a sample student; the presenter clicks submit.
  useEffect(() => {
    const on = () => setPrefill(DEMO_STUDENT());
    window.addEventListener('aiify:demo-fill', on);
    return () => window.removeEventListener('aiify:demo-fill', on);
  }, []);
  useEffect(() => {
    if (registerOpen && demo && !prefill) setPrefill(DEMO_STUDENT());
  }, [registerOpen, demo, prefill]);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const a = getAttribution();
    const input = {
      name: String(f.get('name') ?? ''),
      email: String(f.get('email') ?? ''),
      phone: String(f.get('phone') ?? ''),
      college: String(f.get('college') ?? ''),
      branch: String(f.get('branch') ?? ''),
      year: String(f.get('year') ?? '') as RegistrationInput['year'],
      originalProject: String(f.get('project') ?? '') || blueprint?.original || undefined,
      generatedProject: blueprint?.projectName,
      blueprintId: blueprint?.id,
      referralCode: a.ref,
      source: a.source,
      campaign: a.campaign,
    } satisfies RegistrationInput;
    setSubmitting(true);
    setErrors({});
    try {
      const res = await api.register(input);
      setMe({ code: res.user.referralCode, token: res.dashToken, firstName: res.user.firstName, college: res.user.college, collegeKey: res.user.collegeKey ?? collegeKey(res.user.college) });
      if (res.status === 'created') {
        track('registration_completed', { referred: !!a.ref, notices: res.notices.join(',') || null });
        clearRef();
      } else {
        toast('Welcome back — here’s your dashboard.', 'info');
      }
      if (res.notices.includes('invalid_referral')) toast('That invite link didn’t work — you’re still in.', 'info');
      closeRegister();
      setPrefill(null);
      navigate(res.status === 'created' ? '/me?welcome=1' : '/me');
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.fields) setErrors(err.fields as Errors);
        else if (err.code === 'duplicate_email' || err.code === 'disposable_email') setErrors({ email: err.message });
        else if (err.code === 'duplicate_phone') setErrors({ phone: err.message });
        else toast(err.message, 'error');
      } else {
        toast('Couldn’t reach us. Check your connection and try again.', 'error');
      }
      window.setTimeout(() => form.current?.querySelector<HTMLInputElement>('[aria-invalid="true"]')?.focus(), 30);
    } finally {
      setSubmitting(false);
    }
  };

  const p = prefill ?? {};
  return (
    <Modal open={registerOpen} onClose={closeRegister} label="Reserve your spot">
      <div className="mb-6 flex flex-col gap-3">
        <h2 className="t-h2">
          You have the idea.
          <br />
          Now <Highlighter>build it.</Highlighter>
        </h2>
        <p className="t-body text-ink-2">Free 60-minute live workshop. Bring the project — we’ll build the AI part together.</p>
        {blueprint && (
          <div className="flex items-center justify-between gap-3 rounded-md border border-line bg-surface px-4 py-3">
            <span className="min-w-0">
              <Label>Your project</Label>
              <span className="block truncate font-medium">{blueprint.projectName}</span>
            </span>
            <span className="t-label shrink-0 text-ink">{blueprint.score} / 10</span>
          </div>
        )}
      </div>
      <form ref={form} onSubmit={submit} noValidate className="flex flex-col gap-4" key={prefill ? 'filled' : 'empty'}>
        <Field label="Name" name="name" autoComplete="name" placeholder="Your name" defaultValue={p.name} error={errors.name} required />
        <Field label="Email" name="email" type="email" inputMode="email" autoComplete="email" placeholder="you@college.edu" defaultValue={p.email} error={errors.email} required />
        <Field label="WhatsApp number" name="phone" type="tel" inputMode="tel" autoComplete="tel-national" prefix="+91" placeholder="98765 43210" defaultValue={p.phone} error={errors.phone} hint="The joining link arrives here." required />
        <Field label="College" name="college" list="college-list" autoComplete="organization" placeholder="Start typing your college" defaultValue={p.college} error={errors.college} required />
        <datalist id="college-list">
          {colleges.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Branch" name="branch" list="branch-list" placeholder="CSE" defaultValue={p.branch} error={errors.branch} required />
          <datalist id="branch-list">
            {BRANCHES.map((b) => (
              <option key={b} value={b} />
            ))}
          </datalist>
          <div className="flex min-w-0 flex-col gap-2">
            <label htmlFor="f-year" className="t-small font-medium">
              Year
            </label>
            <select
              id="f-year"
              name="year"
              defaultValue={p.year ?? 'Final year'}
              aria-invalid={!!errors.year || undefined}
              className={cn('min-h-[52px] w-full rounded-btn border bg-surface px-3 text-[16px] focus:border-ink focus:outline-none', errors.year ? 'border-error' : 'border-line')}
            >
              {YEARS.map((y) => (
                <option key={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
        <Field label="Project idea · optional" name="project" placeholder="What are you building?" defaultValue={blueprint?.original ?? ''} />
        <Button type="submit" size="lg" block loading={submitting} loadingText="Reserving…" className="mt-2">
          Reserve My Spot
        </Button>
        <p className="t-small text-muted">No AI experience required. We only WhatsApp you about the workshop. Your project stays yours.</p>
      </form>
    </Modal>
  );
}
