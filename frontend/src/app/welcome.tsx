import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import LogoArch from '@/assets/illustrations/logo-arch.svg';
import LogoWordmark from '@/assets/illustrations/logo-wordmark.svg';
import { AppText, Button, Screen } from '@/components/ui';
import { strings } from '@/constants/strings';
import { useAppStore } from '@/store/use-app-store';
import { colors, spacing } from '@/theme';

export default function WelcomeScreen() {
  const start = useAppStore((state) => state.start);
  const handleStart = () => {
    start();
    router.push('/login');
  };

  return (
    <Screen contentStyle={styles.screen}>
      <View style={styles.brand} accessibilityLabel={`${strings.appName}, ${strings.slogan}`}>
        <LogoArch width={100} height={132} />
        <LogoWordmark width={88} height={44} />
        <AppText variant="serifLead" color={colors.textStrong} align="center">{strings.slogan}</AppText>
      </View>
      <Button label="시작하기" onPress={handleStart} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { justifyContent: 'space-between', paddingTop: 168, paddingBottom: spacing.xxl },
  brand: { alignItems: 'center', gap: spacing.xxl },
});
