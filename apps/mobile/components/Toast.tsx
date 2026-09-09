import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';

const ANIMATION_DURATION = 300;

const TOAST_COLORS: Record<ToastProps['type'], string> = {
  success: '#16a34a',
  error: '#dc2626',
  info: '#2563eb',
};

export interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  visible: boolean;
  onDismiss?: () => void;
}

export function Toast({ message, type, visible, onDismiss }: ToastProps) {
  const translateY = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(translateY, {
        toValue: 0,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: -100,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }).start(() => {
        onDismiss?.();
      });
    }
  }, [visible, translateY, onDismiss]);

  if (!visible && !message) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: TOAST_COLORS[type], transform: [{ translateY }] },
      ]}
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
    >
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    zIndex: 9999,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  message: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
