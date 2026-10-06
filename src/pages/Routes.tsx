import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router';
import type { Blueprint } from '@shared/types';
import { patternOrInvalid } from '@shared/matcher';
import { ProjectResult } from '@/components/aiify/ProjectResult';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/primitives';
import { focusProjectInput } from '@/hooks/useJourney';
import { api } from '@/services/api';
import { setRef } from '@/lib/attribution';
import { track } from '@/lib/analytics';

/** /r/:code — store attribution, then continue to the product. */
export function ReferralLanding() {
  const { code = '' } = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    const c = code.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);
    api
      .referrer(c)
      .then((r) => {
        track('referral_link_opened', { code: c, valid: r.valid });
        navigate(r.valid ? `/?ref=${c}&source=referral` : '/?source=referral', { replace: true });
      })
      .catch(() => {
        setRef(c);
        navigate(`/?ref=${c}&source=referral`, { replace: true });
      });
  }, [code, navigate]);
  return (
    <section className="wrap flex min-h-[60vh] items-center">
      <Label>Opening your invite…</Label>
    </section>
  );
}

/** /p/:id — a friend's shared blueprint, with a path to try your own. */
export function SharedProject() {
  const { id = '' } = useParams();
  const [q] = useSearchParams();
  const [bp, setBp] = useState<Blueprint | null | 'missing'>(null);
  const navigate = useNavigate();
  useEffect(() => {
    api
      .blueprint(id)
      .then(setBp)
      .catch(() => {
        // Offline / expired: regenerate from the original input carried in the link.
        const input = q.get('i');
        setBp((input && patternOrInvalid(input)) || 'missing');
      });
  }, [id, q]);
  const tryYours = () => {
    navigate('/');
    window.setTimeout(focusProjectInput, 150);
  };
  return (
    <section className="wrap flex flex-col gap-8 pb-24 pt-10 md:pt-16">
      <div className="flex flex-col gap-3">
        <Label>Someone shared their AI-ified project</Label>
        <h1 className="t-h1 max-w-[18ch]">This started as a college project.</h1>
      </div>
      {bp === null && <div className="h-[520px] animate-pulse rounded-hero bg-sunken" aria-hidden />}
      {bp === 'missing' && (
        <div className="flex flex-col items-start gap-4 rounded-hero border border-line bg-surface p-8">
          <p className="t-h3">That project link has expired.</p>
          <Button onClick={tryYours}>AI-ify yours</Button>
        </div>
      )}
      {bp && bp !== 'missing' && <ProjectResult bp={bp} mode="shared" onTryYours={tryYours} />}
    </section>
  );
}

export function NotFound() {
  return (
    <section className="wrap flex min-h-[60vh] flex-col items-start justify-center gap-5 py-24">
      <Label>404</Label>
      <h1 className="t-h1">Nothing on this page yet.</h1>
      <Link to="/" className="underline underline-offset-4">
        Back to AI-ify
      </Link>
    </section>
  );
}

export function Privacy() {
  return (
    <section className="wrap max-w-[760px] py-16 md:py-24">
      <Label>Privacy</Label>
      <h1 className="t-h1 mt-4">Your project stays yours.</h1>
      <div className="t-body mt-8 flex flex-col gap-4 text-ink-2">
        <p>We collect what you type into the AI-ify box and, if you register, your name, email, WhatsApp number, college, branch and year.</p>
        <p>We use it to run the workshop, send you the joining link, count referrals and show your college on the leaderboard (college name and counts only — never your name or number).</p>
        <p>Project ideas may be sent to an AI model provider to generate your blueprint. We don’t sell data and we don’t share your contact details with anyone.</p>
        <p>We record anonymous usage events (page views, button clicks, the channel you came from) to measure the campaign. IP addresses are stored only as a salted hash, for abuse prevention.</p>
        <p>Want your data deleted? Reply to any workshop message and we’ll remove it within 7 days.</p>
      </div>
    </section>
  );
}
