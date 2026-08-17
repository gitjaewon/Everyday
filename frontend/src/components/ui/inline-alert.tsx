import { StyleSheet, View } from 'react-native';

import AlertTriangle from '@/assets/icons/alert-triangle.svg';
import CheckCircle from '@/assets/icons/check-circle.svg';
import { colors, spacing } from '@/theme';
import { AppText } from './app-text';
import { Card } from './card';

interface InlineAlertProps {
  title: string;
  body?: string;
  tone?: 'danger' | 'success';
}

export function InlineAlert({ title, body, tone = 'danger' }: InlineAlertProps) {
  const color = tone === 'danger' ? colors.danger : colors.brand;
  const Icon = tone === 'danger' ? AlertTriangle : CheckCircle;
  return (
    <Card tone={tone === 'danger' ? 'danger' : 'default'} style={tone === 'success' && styles.success}>
      <View style={styles.row}>
        <Icon width={24} height={24} accessibilityLabel={tone === 'danger' ? '경고' : '완료'} />
        <View style={styles.copy}>
          <AppText variant="body2" color={color} style={styles.title}>{title}</AppText>
          {body ? <AppText variant="caption" color={color}>{body}</AppText> : null}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  copy: { flex: 1, gap: spacing.xs },
  title: { fontWeight: '700' },
  success: { backgroundColor: colors.iconTile, borderColor: colors.divider },
});
