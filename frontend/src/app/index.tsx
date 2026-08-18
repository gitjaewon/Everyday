import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';

import { Screen } from '@/components/ui';
import { getAccessToken } from '@/services/token-storage';

export default function RootIndex() {
  const [destination, setDestination] = useState<'/welcome' | '/(tabs)' | null>(null);

  useEffect(() => {
    getAccessToken()
      .then((token) => setDestination(token ? '/(tabs)' : '/welcome'))
      .catch(() => setDestination('/welcome'));
  }, []);

  if (!destination) return <Screen />;
  return <Redirect href={destination} />;
}
