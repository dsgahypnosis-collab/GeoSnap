// Glass Panel - Thin-section glass with edge refraction
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, borderRadius, shadows } from '../utils/theme';

interface GlassPanelProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'subtle';
  noPadding?: boolean;
}

export const GlassPanel: React.FC<GlassPanelProps> = ({
  children,
  style,
  variant = 'default',
  noPadding = false,
}) => {
  const variants = {
    default: {
      colors: ['rgba(26, 26, 46, 0.9)', 'rgba(22, 33, 62, 0.85)'],
      borderColor: colors.glassBorder,
    },
    elevated: {
      colors: ['rgba(44, 82, 130, 0.3)', 'rgba(26, 26, 46, 0.95)'],
      borderColor: colors.mineralBlue,
    },
    subtle: {
      colors: ['rgba(26, 26, 46, 0.6)', 'rgba(22, 33, 62, 0.5)'],
      borderColor: 'rgba(255, 255, 255, 0.1)',
    },
  };

  const v = variants[variant];

  return (
    <View style={[styles.container, shadows.md, style]}>
      <LinearGradient
        colors={v.colors as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.gradient,
          { borderColor: v.borderColor },
          noPadding ? {} : styles.padding,
        ]}
      >
        {children}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  gradient: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  padding: {
    padding: 16,
  },
});
