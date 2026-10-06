import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import { Copy, MessageCircle } from 'lucide-react';
import { REWARD_AT } from '@shared/input';
import { Button } from '@/components/ui/Button';
import { Highlighter, Label } from '@/components/ui/primitives';
import { useToast } from '@/components/ui/Toast';
import { ReferralSteps, ReferralTracker, RewardCard, TRACKER_COPY } from '@/components/growth/Referral';
import { CollegeRank, LeaderboardList } from '@/components/sections/Leaderboard';
import { focusProjectInput, useJourney } from '@/hooks/useJourney';
import { useInterval } from '@/hooks/useUtils';
import { api, ApiError, type Dashboard as DashboardData } from '@/services/api';
import { copyText, displayUrl, openWhatsApp, referralShareText, referralUrl } from '@/lib/share';
import { track } from '@/lib/analytics';
import { DUR, EASE } from '@/lib/motion';

export default function Dashboard() {
  const { me, setMe, demo } = useJourney();
  const [params] = useSearchParams();
  const welcome = params.has('welcome');
  const [data, setData] = useState<DashboardData | null>(null);
  const [missing, setMissing] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const prevCount = useRef<number | null>(null);

  const load = useCallback(async () => {
    if (!me) return;
    try {
      const d = await api.me(me.code, me.token);
      setData(d);
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) setMissing(true);
    }
  }, [me]);

  useEffect(() => {
    load();
  }, [load]);
  useInterval(load, me && !missing ? 8000 : null); // friends joining show up live

  // Celebrate changes the student didn't cause on this screen.
  useEffect(() => {
    if (!data) return;
    const c = data.user.referralCount;
    if (prevCount.current !== null && c > prevCount.current) {
      toast(c >= REWARD_AT ? 'Unlocked. Your AI Builder Pack is ready.' : TRACKER_COPY[Math.min(c, 3)], 'success');
    }
    prevCount.current = c;
  }, [data, toast]);

  // Demo: a friend registers through the link.
  useEffect(() => {
    const on = async () => {
      if (!me) return;
      try {
        setData(await api.demoReferral(me.code, me.token));
      } catch {
        toast('Demo referrals need DEMO_MODE=true on the server.', 'error');
      }
    };
    window.addEventListener('aiify:demo-referral', on);
    return () => window.removeEventListener('aiify:demo-referral', on);
  }, [me, toast]);

  useEffect(() => {
    if (data) track('leaderboard_viewed', { where: 'dashboard' }, 'leaderboard_viewed_dash');
  }, [data]);

  if (!me || missing) {
    return (
      <section className="wrap flex min-h-[70vh] flex-col items-start justify-center gap-6 py-24">
        <Label>Dashboard</Label>
        <h1 className="t-h1 max-w-[16ch]">No dashboard here yet.</h1>
        <p className="t-body-lg max-w-[44ch] text-ink-2">AI-ify your project and reserve a spot — your referral link and progress live here.</p>
        <Button
          size="lg"
          onClick={() => {
            if (missing) setMe(null);
            navigate('/');
            window.setTimeout(focusProjectInput, 150);
          }}
        >
          AI-ify My Project
        </Button>
      </section>
    );
  }

  const user = data?.user;
  const count = user?.referralCount ?? 0;
  const link = referralUrl(me.code);
  const unlocked = count >= REWARD_AT;

  const share = () => {
    track('whatsapp_clicked', { where: 'dashboard' });
    openWhatsApp(referralShareText(me.code, user?.generatedProject));
  };
  const copy = async () => {
    if (await copyText(link)) {
      track('referral_link_copied', { where: 'dashboard' });
      toast('Link copied. Paste it in your class group.');
    }
  };

  return (
    <>
      {/* Mobile: tracker stays visible */}
      <div className="sticky top-16 z-30 flex items-center gap-3 bg-dark px-5 py-3 text-dark-text md:hidden" aria-hidden>
        <span className="font-mono text-[14px] tabular">
          {Math.min(count, 3)} / {REWARD_AT}
        </span>
        <span className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span key={i} className={i < count ? 'h-1.5 w-7 rounded-full bg-accent' : 'h-1.5 w-7 rounded-full bg-dark-text/20'} />
          ))}
        </span>
        <span className="truncate text-[14px] text-dark-muted">{TRACKER_COPY[Math.min(count, 3)]}</span>
      </div>

      <section className="wrap grid grid-cols-1 gap-12 pb-24 pt-10 md:pt-16 lg:grid-cols-12 lg:gap-6 lg:pt-20">
        <div className="flex flex-col gap-7 lg:col-span-6">
          <AnimatePresence mode="wait">
            <motion.div key={unlocked ? 'u' : 'w'} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: DUR.emphasis, ease: EASE }} className="flex flex-col gap-4">
              <Label>{unlocked ? `Reward / ${REWARD_AT} of ${REWARD_AT}` : `Dashboard / ${me.code}`}</Label>
              <h1 className="t-display">
                {unlocked ? (
                  <>
                    YOU <br />
                    <Highlighter animate>UNLOCKED</Highlighter> IT.
                  </>
                ) : welcome ? (
                  'YOU’RE IN.'
                ) : (
                  `HI, ${me.firstName.toUpperCase()}.`
                )}
              </h1>
              <p className="t-body-lg text-ink-2">{unlocked ? 'AI Builder Pack — it’s yours.' : 'Your AI Builder journey starts now.'}</p>
            </motion.div>
          </AnimatePresence>

          <div className="flex flex-col gap-3">
            <Label>Your referral link</Label>
            <button onClick={copy} className="group flex min-h-16 items-center justify-between gap-4 rounded-md border border-ink bg-surface px-5 text-left" aria-label={`Copy referral link ${displayUrl(link)}`}>
              <span className="truncate font-mono text-[16px] md:text-[20px]">{displayUrl(link)}</span>
              <span className="t-label flex items-center gap-1.5 text-ink">
                <Copy size={14} /> Copy
              </span>
            </button>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Button size="lg" block onClick={share} icon={<MessageCircle size={16} />}>
                Share on WhatsApp
              </Button>
              <Button size="lg" variant="secondary" block onClick={copy} icon={<Copy size={16} />}>
                Copy link
              </Button>
            </div>
          </div>

          {!unlocked && (
            <div className="flex flex-col gap-2 border-t border-line pt-6">
              <Label tone="ink">Bring 3 friends</Label>
              <p className="t-h3 max-w-[22ch]">Refer 3 friends and unlock the AI Builder Pack.</p>
            </div>
          )}

          {user?.generatedProject && (
            <div className="flex flex-col gap-1 rounded-md border border-line bg-surface p-4">
              <Label>Your project</Label>
              <p className="font-medium">{user.generatedProject}</p>
              {user.blueprintId && (
                <Link to={`/p/${user.blueprintId}`} className="t-small text-ink-2 underline underline-offset-4">
                  View blueprint
                </Link>
              )}
            </div>
          )}
          {demo && (
            <Button variant="secondary" onClick={() => window.dispatchEvent(new Event('aiify:demo-referral'))}>
              Demo: a friend joins
            </Button>
          )}
        </div>

        <div className="flex flex-col gap-6 lg:col-span-6">
          <ReferralTracker count={count} />
          <ReferralSteps friends={user?.friends ?? []} />
          <RewardCard count={count} onOpen={() => navigate('/pack')} />
        </div>
      </section>

      <section className="border-t border-line bg-surface py-[var(--section)]" aria-labelledby="dash-lb">
        <div className="wrap flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <Label n="09">AI Builders Cup</Label>
            <h2 id="dash-lb" className="t-h2">
              {data?.leaderboard.you ? `Your college is #${data.leaderboard.you.rank}.` : 'Your college on the board.'}
            </h2>
          </div>
          {data?.leaderboard.you && <CollegeRank data={data.leaderboard.you} onShare={share} />}
          {data && <LeaderboardList data={data.leaderboard} youKey={me.collegeKey} />}
        </div>
      </section>
    </>
  );
}
