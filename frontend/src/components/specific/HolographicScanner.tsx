// HolographicScanner.tsx - Neon-blue scanning grid effect
// "When you Snap a specimen, a glowing neon-blue scanning grid sweeps over the object"
import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface HolographicScannerProps {
  isScanning: boolean;
  onScanComplete?: () => void;
  scanDuration?: number;
}

// Horizontal scan line
const ScanLine = ({ delay, color }: { delay: number; color: string }) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(progress.value, [0, 1], [-150, 150]) },
    ],
    opacity: interpolate(progress.value, [0, 0.5, 1], [0.3, 1, 0.3]),
  }));

  return (
    <Animated.View style={[styles.scanLine, animatedStyle]}>
      <LinearGradient
        colors={['transparent', color, color, 'transparent']}
        style={styles.scanLineGradient}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
      />
    </Animated.View>
  );
};

// Grid line component
const GridLine = ({ 
  horizontal, 
  offset, 
  delay 
}: { 
  horizontal: boolean; 
  offset: number;
  delay: number;
}) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(0.4, { duration: 500 }));
    scale.value = withDelay(delay, withTiming(1, { duration: 300 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: horizontal 
      ? [{ scaleX: scale.value }]
      : [{ scaleY: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        horizontal ? styles.gridLineHorizontal : styles.gridLineVertical,
        { [horizontal ? 'top' : 'left']: offset },
        animatedStyle,
      ]}
    />
  );
};

// Corner bracket component
const CornerBracket = ({ 
  position 
}: { 
  position: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
}) => {
  const scale = useSharedValue(0);
  const glow = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(200, withTiming(1, { duration: 400 }));
    glow.value = withDelay(600, withRepeat(
      withSequence(
        withTiming(1, { duration: 1000 }),
        withTiming(0.5, { duration: 1000 })
      ),
      -1,
      true
    ));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    shadowOpacity: interpolate(glow.value, [0, 1], [0.3, 0.8]),
  }));

  const getPositionStyle = () => {
    switch (position) {
      case 'topLeft':
        return { top: 20, left: 20, borderTopWidth: 3, borderLeftWidth: 3 };
      case 'topRight':
        return { top: 20, right: 20, borderTopWidth: 3, borderRightWidth: 3 };
      case 'bottomLeft':
        return { bottom: 20, left: 20, borderBottomWidth: 3, borderLeftWidth: 3 };
      case 'bottomRight':
        return { bottom: 20, right: 20, borderBottomWidth: 3, borderRightWidth: 3 };
    }
  };

  return (
    <Animated.View
      style={[
        styles.cornerBracket,
        getPositionStyle(),
        animatedStyle,
      ]}
    />
  );
};

// Data point floating animation
const DataPoint = ({ 
  x, 
  y, 
  label, 
  value, 
  delay 
}: { 
  x: number; 
  y: number; 
  label: string; 
  value: string;
  delay: number;
}) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 500 }));
    translateY.value = withDelay(delay, withTiming(0, { duration: 400 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.dataPoint, { left: x, top: y }, animatedStyle]}>
      <View style={styles.dataPointDot} />
      <View style={styles.dataPointLine} />
      <View style={styles.dataPointContent}>
        <Animated.Text style={styles.dataPointLabel}>{label}</Animated.Text>
        <Animated.Text style={styles.dataPointValue}>{value}</Animated.Text>
      </View>
    </Animated.View>
  );
};

export const HolographicScanner: React.FC<HolographicScannerProps> = ({
  isScanning,
  onScanComplete,
  scanDuration = 4000,
}) => {
  const containerOpacity = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (isScanning) {
      containerOpacity.value = withTiming(1, { duration: 300 });
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.02, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1,
        true
      );

      // Call completion callback
      if (onScanComplete) {
        setTimeout(onScanComplete, scanDuration);
      }
    } else {
      containerOpacity.value = withTiming(0, { duration: 300 });
    }
  }, [isScanning]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  if (!isScanning) return null;

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      {/* Scan area with pulsing border */}
      <Animated.View style={[styles.scanArea, pulseStyle]}>
        {/* Corner brackets */}
        <CornerBracket position="topLeft" />
        <CornerBracket position="topRight" />
        <CornerBracket position="bottomLeft" />
        <CornerBracket position="bottomRight" />

        {/* Grid lines */}
        {[0, 1, 2, 3, 4].map((i) => (
          <GridLine 
            key={`h-${i}`} 
            horizontal 
            offset={60 + i * 60} 
            delay={i * 100} 
          />
        ))}
        {[0, 1, 2, 3].map((i) => (
          <GridLine 
            key={`v-${i}`} 
            horizontal={false} 
            offset={60 + i * 80} 
            delay={i * 100 + 50} 
          />
        ))}

        {/* Scanning lines */}
        <ScanLine delay={0} color="#00D4FF" />
        <ScanLine delay={1000} color="#00FF88" />

        {/* Data points */}
        <DataPoint x={50} y={80} label="ANALYZING" value="STRUCTURE" delay={800} />
        <DataPoint x={180} y={200} label="HARDNESS" value="SCANNING..." delay={1200} />
        <DataPoint x={80} y={280} label="COMPOSITION" value="DETECTING" delay={1600} />
      </Animated.View>

      {/* Status text */}
      <View style={styles.statusContainer}>
        <Animated.Text style={styles.statusText}>
          AI ANALYSIS IN PROGRESS
        </Animated.Text>
        <View style={styles.progressBar}>
          <Animated.View style={styles.progressFill} />
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanArea: {
    width: SCREEN_WIDTH * 0.85,
    height: SCREEN_WIDTH * 0.85,
    position: 'relative',
    overflow: 'hidden',
  },
  cornerBracket: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#00D4FF',
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
  },
  gridLineHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#00D4FF',
  },
  gridLineVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: '#00D4FF',
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 4,
  },
  scanLineGradient: {
    flex: 1,
    height: 4,
  },
  dataPoint: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
  },
  dataPointDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00FF88',
    shadowColor: '#00FF88',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  dataPointLine: {
    width: 20,
    height: 1,
    backgroundColor: '#00D4FF',
    marginHorizontal: 4,
  },
  dataPointContent: {
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.3)',
  },
  dataPointLabel: {
    fontSize: 8,
    fontWeight: '600',
    color: '#00D4FF',
    letterSpacing: 1,
  },
  dataPointValue: {
    fontSize: 10,
    fontWeight: '700',
    color: '#00FF88',
  },
  statusContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00D4FF',
    letterSpacing: 3,
    marginBottom: 16,
  },
  progressBar: {
    width: 200,
    height: 4,
    backgroundColor: 'rgba(0, 212, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    width: '60%',
    height: '100%',
    backgroundColor: '#00D4FF',
  },
});

export default HolographicScanner;
