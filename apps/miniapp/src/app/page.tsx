'use client';

import { useEffect, useState } from 'react';
import { initTelegram, getFirstName } from '@/lib/telegram';
import { useLocation } from '@/hooks/useLocation';
import { WelcomeScreen } from '@/components/WelcomeScreen';
import { HomeScreen } from '@/components/HomeScreen';

export default function Home() {
  const [name, setName] = useState('');
  const location = useLocation(); // pass { watch: true } to track continuously

  useEffect(() => {
    initTelegram();
    setName(getFirstName());
  }, []);

  if (location.status === 'ready' && location.coords) {
    return <HomeScreen origin={location.coords} />;
  }

  return (
    <WelcomeScreen
      userName={name}
      busy={location.status === 'locating'}
      error={location.error}
      permission={location.permission}
      onEnable={location.request}
      onOpenSettings={location.openSettings}
    />
  );
}
