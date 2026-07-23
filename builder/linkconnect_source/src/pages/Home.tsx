import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AdvertiserIntro } from '../components/AdvertiserIntro';
import { CategoryLinks } from '../components/CategoryLinks';
import { CallDbIntro } from '../components/CallDbIntro';
import { CPAList } from '../components/CPAList';
import { CPSList } from '../components/CPSList';
import { EventBoard } from '../components/EventBoard';
import { Features } from '../components/Features';
import { FinalCTA } from '../components/FinalCTA';
import { Hero } from '../components/Hero';
import { PartnerIntro } from '../components/PartnerIntro';
import {
  consumeScrollTarget,
  resolveHashSectionId,
  scrollToSectionWhenReady,
} from '../lib/navigation';

export function Home() {
  const location = useLocation();

  useEffect(() => {
    const fromQueue = consumeScrollTarget();
    const fromHash = resolveHashSectionId(location.hash);
    const target = fromQueue || fromHash;
    if (!target) return;
    scrollToSectionWhenReady(target);
  }, [location.hash, location.key]);

  return (
    <main>
      <Hero />
      <CategoryLinks />
      <CPAList />
      <CPSList />
      <CallDbIntro />
      <Features />
      <PartnerIntro />
      <AdvertiserIntro />
      <EventBoard />
      <FinalCTA />
    </main>
  );
}
