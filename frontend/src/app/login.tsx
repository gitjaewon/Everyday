import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import LogoArch from '@/assets/illustrations/logo-arch.svg';
import LogoWordmark from '@/assets/illustrations/logo-wordmark.svg';
import { AppText, Button, FormField, Screen } from '@/components/ui';
import { api } from '@/services/api';
import { useAppStore } from '@/store/use-app-store';
import { colors, spacing } from '@/theme';

export default function LoginScreen() {
  const setUser = useAppStore((state) => state.setUser);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const login = async () => {
    setLoading(true);
    setError('');
    try {
      const user = await api.login({ username, password });
      setUser(user);
      router.replace('/(tabs)');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll keyboard contentStyle={styles.screen}>
      <View style={styles.brand}>
        <LogoArch width={100} height={132} />
        <LogoWordmark width={88} height={44} />
      </View>
      <View style={styles.form}>
        <FormField label="아이디" placeholder="아이디 입력" value={username} onChangeText={setUsername} autoCapitalize="none" />
        <FormField label="비밀번호" placeholder="비밀번호 입력" value={password} onChangeText={setPassword} secureTextEntry error={error || undefined} />
      </View>
      <Button label="로그인" loading={loading} onPress={login} />
      <View style={styles.signup}>
        <AppText variant="body3" color={colors.textSecondary}>아직 하루결 회원이 아니신가요?</AppText>
        <Pressable accessibilityRole="link" onPress={() => router.push('/signup')}>
          <AppText variant="body3" color={colors.brand} style={styles.link}>회원가입</AppText>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingTop: spacing.xxl, paddingBottom: spacing.xxl, gap: spacing.xxl },
  brand: { alignItems: 'center', gap: spacing.xxl },
  form: { gap: spacing.md },
  signup: { flexDirection: 'row', justifyContent: 'center', gap: spacing.md },
  link: { textDecorationLine: 'underline', fontWeight: '600' },
});
