import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import CheckOff from '@/assets/icons/check-circle-off.svg';
import CheckOn from '@/assets/icons/check-circle-on.svg';
import { AppText, Button, Card, FormField, Screen } from '@/components/ui';
import { api } from '@/services/api';
import { useAppStore } from '@/store/use-app-store';
import { colors, spacing } from '@/theme';

export default function SignupScreen() {
  const setUser = useAppStore((state) => state.setUser);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [consented, setConsented] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const signup = async () => {
    if (!name.trim() || !username.trim() || !password) return setError('필수 항목을 모두 입력해주세요.');
    if (password !== confirm) return setError('비밀번호가 일치하지 않습니다.');
    if (!consented) return setError('개인정보 수집에 동의해주세요.');
    setLoading(true);
    setError('');
    try {
      const user = await api.signup({ name, username, password, consented });
      setUser(user);
      router.replace('/shift-type');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '회원가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll keyboard contentStyle={styles.screen}>
      <AppText variant="h1">회원가입</AppText>
      <View style={styles.form}>
        <FormField label="이름" placeholder="이름 입력" value={name} onChangeText={setName} />
        <FormField label="아이디" placeholder="아이디 입력" value={username} onChangeText={setUsername} autoCapitalize="none" />
        <FormField label="비밀번호" placeholder="비밀번호 입력" value={password} onChangeText={setPassword} secureTextEntry />
        <FormField label="비밀번호 확인" placeholder="비밀번호 확인" value={confirm} onChangeText={setConfirm} secureTextEntry error={error || undefined} />
      </View>
      <View style={styles.divider} />
      <View style={styles.consentGroup}>
        <AppText variant="caption" color={colors.textSecondary}>개인정보 수집 동의</AppText>
        <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: consented }} onPress={() => setConsented((value) => !value)}>
          <Card style={styles.consent}>
            <AppText variant="body2" style={styles.consentCopy}>[필수] 개인정보 수집 동의</AppText>
            {consented ? <CheckOn width={24} height={24} /> : <CheckOff width={24} height={24} />}
          </Card>
        </Pressable>
      </View>
      <View style={styles.spacer} />
      <Button label="가입하기" loading={loading} onPress={signup} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingTop: spacing.xl, paddingBottom: spacing.xxl, gap: spacing.xxl },
  form: { gap: spacing.md },
  divider: { height: 1, backgroundColor: colors.divider },
  consentGroup: { gap: spacing.sm },
  consent: { minHeight: 54, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg },
  consentCopy: { flex: 1, fontWeight: '700', textDecorationLine: 'underline' },
  spacer: { flex: 1, minHeight: spacing.xxl },
});
