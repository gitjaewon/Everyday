import { useEffect, useState, type PropsWithChildren } from 'react';
import { Animated, Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, shadows, spacing } from '@/theme';

interface BottomSheetModalProps extends PropsWithChildren {
  visible: boolean;
  onClose: () => void;
  fullHeight?: boolean;
}

export function BottomSheetModal({ visible, onClose, fullHeight = false, children }: BottomSheetModalProps) {
  const [translateY] = useState(() => new Animated.Value(40));
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (visible) {
      translateY.setValue(40);
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, damping: 22, stiffness: 230 }).start();
    }
  }, [translateY, visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.overlay}>
        <Pressable accessibilityLabel="닫기" style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View
          style={[
            styles.sheet,
            fullHeight && styles.fullHeight,
            { paddingBottom: Math.max(insets.bottom, spacing.xxl), transform: [{ translateY }] },
          ]}
        >
          <View style={styles.handle} />
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: colors.overlay },
  sheet: { maxHeight: '92%', backgroundColor: colors.surface, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, padding: spacing.gutter, ...shadows.sheet },
  fullHeight: { minHeight: '93%' },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.divider, alignSelf: 'center', marginBottom: spacing.xl },
});
