import { useEffect } from 'react';
import { router } from 'expo-router';
import { useBaguioQuest } from '@/hooks/use-baguio-quest';
import { View, ActivityIndicator } from 'react-native';

export default function IndexScreen() {
  const { hasSeenSplash, hasAcceptedTerms } = useBaguioQuest();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasSeenSplash) {
        router.replace('/splash');
      } else if (!hasAcceptedTerms) {
        router.replace('/terms');
      } else {
        router.replace('/(tabs)/map');
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [hasSeenSplash, hasAcceptedTerms]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1e40af' }}>
      <ActivityIndicator size="large" color="#ffffff" />
    </View>
  );
}