import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import ChevronRight from '@/assets/icons/chevron-right.svg';
import { settingsIconMap } from '@/components/domain';
import { AppText, Card, DisclaimerCard, Screen, SwitchControl } from '@/components/ui';
import { settingsLinks } from '@/data/mock-data';
import { api } from '@/services/api';
import { useAppStore } from '@/store/use-app-store';
import { colors, radius, spacing } from '@/theme';

function SettingGroup({ title, children }: React.PropsWithChildren<{ title: string }>) {
  return <View style={styles.section}><AppText variant="caption" color={colors.textSecondary}>{title}</AppText><View style={styles.group}>{children}</View></View>;
}

function Tile({ id }: { id: string }) {
  const Icon = settingsIconMap[id];
  return <View style={styles.tile}>{Icon ? <Icon width={20} height={20} /> : null}</View>;
}

export default function SettingsScreen() {
  const settings = useAppStore((state) => state.settings);
  const toggle = useAppStore((state) => state.toggleSetting);
  const setUser = useAppStore((state) => state.setUser);

  const logout = async () => {
    try {
      await api.logout();
    } finally {
      setUser(null);
      router.replace('/welcome');
    }
  };

  return (
    <Screen scroll padded={false} contentStyle={styles.screen}>
      <View style={styles.header}><AppText variant="h1">설정</AppText></View>
      <View style={styles.body}>
        <SettingGroup title="알람 설정">
          {settings.slice(0, 2).map((setting) => (
            <View key={setting.id} style={styles.row}><Tile id={setting.id} /><AppText variant="body1" style={styles.label}>{setting.label}</AppText><SwitchControl label={setting.label} value={setting.enabled} onValueChange={() => toggle(setting.id)} /></View>
          ))}
        </SettingGroup>
        <SettingGroup title="알림 항목 설정">
          {settings.slice(2).map((setting) => (
            <View key={setting.id} style={styles.row}><Tile id={setting.id} /><AppText variant="body1" style={styles.label}>{setting.label}</AppText><SwitchControl label={setting.label} value={setting.enabled} onValueChange={() => toggle(setting.id)} /></View>
          ))}
        </SettingGroup>
        <SettingGroup title="근무표 관리">
          {settingsLinks.map((link) => (
            <Pressable
              key={link.id}
              accessibilityRole="button"
              accessibilityLabel={link.label}
              onPress={() => {
                if (link.id === 'edit') router.push('/(tabs)/schedule');
                if (link.id === 'upload') router.push('/schedule-upload');
                if (link.id === 'shift') router.push('/shift-type');
              }}
              style={styles.row}
            >
              <Tile id={link.id} /><AppText variant="body1" style={styles.label}>{link.label}</AppText><ChevronRight width={24} height={24} />
            </Pressable>
          ))}
        </SettingGroup>
        <Pressable accessibilityRole="button" accessibilityLabel="로그아웃" onPress={logout}>
          <AppText variant="caption" color={colors.textTertiary} style={styles.logout}>로그아웃</AppText>
        </Pressable>
        <DisclaimerCard />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingBottom: spacing.xxl },
  header: { backgroundColor: colors.surface, paddingHorizontal: spacing.gutter, paddingVertical: spacing.xl },
  body: { padding: spacing.gutter, gap: spacing.xxxl },
  section: { gap: spacing.sm },
  group: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.surface, overflow: 'hidden' },
  row: { minHeight: 59, flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  tile: { width: 36, height: 36, borderRadius: radius.sm, backgroundColor: colors.brandSoft, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  label: { flex: 1, fontWeight: '600' },
  logout: { textDecorationLine: 'underline' },
});
