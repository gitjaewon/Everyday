import { StyleSheet } from 'react-native';

import { strings } from '@/constants/strings';
import { colors, spacing } from '@/theme';
import { AppText } from './app-text';
import { Card } from './card';

export function DisclaimerCard() {
  return (
    <Card tone="brand" style={styles.card}>
      <AppText variant="caption" color={colors.textNote}>{strings.disclaimer}</AppText>
    </Card>
  );
}

const styles = StyleSheet.create({ card: { padding: spacing.md, backgroundColor: 'transparent' } });
