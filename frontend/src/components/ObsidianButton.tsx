// Obsidian Button - Polished volcanic glass with depth
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, borderRadius, shadows } from '../utils/theme';

interface ObsidianButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const ObsidianButton: React.FC<ObsidianButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
}) => {
  const sizeStyles = {
    sm: { paddingVertical: 10, paddingHorizontal: 16 },
    md: { paddingVertical: 14, paddingHorizontal: 24 },
    lg: { paddingVertical: 18, paddingHorizontal: 32 },
  };

  const textSizes = {
    sm: 14,
    md: 16,
    lg: 18,
  };

  if (variant === 'ghost') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        style={[
          styles.ghostButton,
          sizeStyles[size],
          disabled && styles.disabled,
          style,
        ]}
        activeOpacity={0.7}
      >
        {icon}
        {loading ? (
          <ActivityIndicator color={colors.magmaAmber} size="small" />
        ) : (
          <Text
            style={[
              styles.ghostText,
              { fontSize: textSizes[size] },
              textStyle,
            ]}
          >
            {title}
          </Text>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[disabled && styles.disabled, style]}
    >
      <LinearGradient
        colors={
          variant === 'primary'
            ? [colors.magmaAmber, '#D45A27']
            : [colors.caveShadow, colors.basalt]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.button,
          sizeStyles[size],
          shadows.md,
          variant === 'secondary' && styles.secondaryBorder,
        ]}
      >
        {icon}
        {loading ? (
          <ActivityIndicator color={colors.textPrimary} size="small" />
        ) : (
          <Text
            style={[
              styles.buttonText,
              { fontSize: textSizes[size] },
              variant === 'secondary' && styles.secondaryText,
              textStyle,
            ]}
          >
            {title}
          </Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    gap: 8,
  },
  buttonText: {
    color: colors.textPrimary,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  secondaryBorder: {
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  secondaryText: {
    color: colors.textSecondary,
  },
  ghostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  ghostText: {
    color: colors.magmaAmber,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.5,
  },
});
