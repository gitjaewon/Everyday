import { Tabs } from 'expo-router';
import type { ComponentType } from 'react';
import { StyleSheet, View } from 'react-native';
import type { SvgProps } from 'react-native-svg';

import HomeActive from '@/assets/icons/tab-home-active.svg';
import Home from '@/assets/icons/tab-home.svg';
import IncidentActive from '@/assets/icons/tab-incident-active.svg';
import Incident from '@/assets/icons/tab-incident.svg';
import ScheduleActive from '@/assets/icons/tab-schedule-active.svg';
import Schedule from '@/assets/icons/tab-schedule.svg';
import SettingsActive from '@/assets/icons/tab-settings-active.svg';
import Settings from '@/assets/icons/tab-settings.svg';
import { AppText } from '@/components/ui';
import { colors, layout, spacing } from '@/theme';

function TabIcon({ active, inactive, focused, label }: { active: ComponentType<SvgProps>; inactive: ComponentType<SvgProps>; focused: boolean; label: string }) {
  const Icon = focused ? active : inactive;
  return (
    <View style={styles.item} accessibilityLabel={label}>
      <Icon width={24} height={24} />
      <AppText variant="caption" color={focused ? colors.brandAccent : colors.textSecondary}>{label}</AppText>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabItem,
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen name="index" options={{ title: '홈', tabBarIcon: ({ focused }) => <TabIcon focused={focused} active={HomeActive} inactive={Home} label="홈" /> }} />
      <Tabs.Screen name="schedule" options={{ title: '근무표', tabBarIcon: ({ focused }) => <TabIcon focused={focused} active={ScheduleActive} inactive={Schedule} label="근무표" /> }} />
      <Tabs.Screen name="incidents" options={{ title: '돌발상황', tabBarIcon: ({ focused }) => <TabIcon focused={focused} active={IncidentActive} inactive={Incident} label="돌발상황" /> }} />
      <Tabs.Screen name="settings" options={{ title: '설정', tabBarIcon: ({ focused }) => <TabIcon focused={focused} active={SettingsActive} inactive={Settings} label="설정" /> }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: { height: layout.tabBarHeight + 20, paddingTop: spacing.sm, backgroundColor: colors.surface, borderTopColor: colors.border },
  tabItem: { height: layout.tabBarHeight },
  item: { width: 70, alignItems: 'center', justifyContent: 'center', gap: spacing.xs },
});
