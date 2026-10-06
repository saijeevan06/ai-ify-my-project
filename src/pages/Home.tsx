import { useEffect, useState } from 'react';
import { Hero } from '@/components/sections/Hero';
import { BeforeAfter, Examples, FAQ, FinalCTA, HowItWorks, ReferralSection, Workshop } from '@/components/sections/Story';
import { LeaderboardSection } from '@/components/sections/Leaderboard';
import { useToast } from '@/components/ui/Toast';
import { api, type ReferrerInfo } from '@/services/api';
import { clearRef, getAttribution } from '@/lib/attribution';

export default function Home() {
  const [referrer, setReferrer] = useState<ReferrerInfo | null>(null);
  const toast = useToast();

  useEffect(() => {
    const ref = getAttribution().ref;
    if (!ref) return;
    api
      .referrer(ref)
      .then((r) => {
        if (r.valid) setReferrer(r);
        else {
          clearRef();
          toast('That invite link didn’t work — you can still join.', 'info');
        }
      })
      .catch(() => {});
  }, [toast]);

  useEffect(() => {
    if (window.location.hash) {
      const el = document.querySelector(window.location.hash);
      window.setTimeout(() => el?.scrollIntoView(), 50);
    }
  }, []);

  return (
    <>
      <Hero referrer={referrer} />
      <BeforeAfter />
      <HowItWorks />
      <Examples />
      <Workshop />
      <ReferralSection />
      <LeaderboardSection />
      <FAQ />
      <FinalCTA />
    </>
  );
}
