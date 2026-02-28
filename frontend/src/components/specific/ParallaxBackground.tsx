// ParallaxBackground.tsx - Dynamic backgrounds with gyroscope response
// "Every page features subtle, parallax animations of shifting tectonic plates 
// or shimmering mineral veins that respond to your phone's gyroscope"
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { Gyroscope } from 'expo-sensors';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ParallaxBackgroundProps {
  variant?: 'tectonic' | 'mineral' | 'crystal' | 'magma';
  intensity?: number;
  children?: React.ReactNode;
}

// Floating particle/vein component
const FloatingElement = ({ 
  type,
  index,
  gyroX,
  gyroY,
}: { 
  type: 'vein' | 'plate' | 'crystal' | 'ember';
  index: number;
  gyroX: Animated.SharedValue<number>;
  gyroY: Animated.SharedValue<number>;
}) => {
  const baseX = Math.random() * SCREEN_WIDTH;
  const baseY = Math.random() * SCREEN_HEIGHT;
  const size = 20 + Math.random() * 60;
  const parallaxFactor = 0.5 + Math.random() * 1.5;
  
  const floatProgress = useSharedValue(0);
  const pulseProgress = useSharedValue(0);

  useEffect(() => {
    // Floating animation
    floatProgress.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 4000 + Math.random() * 3000, easing: Easing.inOut(Easing.sine) }),
        withTiming(0, { duration: 4000 + Math.random() * 3000, easing: Easing.inOut(Easing.sine) })
      ),
      -1,
      true
    );

    // Pulse/shimmer animation
    pulseProgress.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000 + Math.random() * 2000 }),
        withTiming(0, { duration: 2000 + Math.random() * 2000 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const floatOffset = interpolate(floatProgress.value, [0, 1], [-15, 15]);
    const gyroOffsetX = gyroX.value * parallaxFactor * 30;
    const gyroOffsetY = gyroY.value * parallaxFactor * 30;
    
    return {
      transform: [
        { translateX: gyroOffsetX + floatOffset },
        { translateY: gyroOffsetY + floatOffset * 0.5 },
        { rotate: `${interpolate(floatProgress.value, [0, 1], [-5, 5])}deg` },
      ],
      opacity: interpolate(pulseProgress.value, [0, 1], [0.3, 0.7]),
    };
  });

  const getElementStyle = () => {
    switch (type) {
      case 'vein':
        return {
          width: size * 3,
          height: 2,
          backgroundColor: '#C9A227',
          borderRadius: 1,
          shadowColor: '#FFD700',
          shadowOpacity: 0.5,
          shadowRadius: 10,
        };
      case 'plate':
        return {
          width: size * 2,
          height: size,
          backgroundColor: 'rgba(100, 80, 60, 0.3)',
          borderRadius: 4,
          borderWidth: 1,
          borderColor: 'rgba(150, 120, 90, 0.2)',
        };
      case 'crystal':
        return {
          width: size * 0.6,
          height: size,
          backgroundColor: 'rgba(100, 200, 255, 0.2)',
          borderRadius: 2,
          transform: [{ rotate: '45deg' }],
          shadowColor: '#00D4FF',
          shadowOpacity: 0.5,
          shadowRadius: 8,
        };
      case 'ember':
        return {
          width: size * 0.5,
          height: size * 0.5,
          backgroundColor: '#FF4500',
          borderRadius: size * 0.25,
          shadowColor: '#FF4500',
          shadowOpacity: 0.8,
          shadowRadius: 15,
        };
      default:
        return {};
    }
  };

  return (
    <Animated.View
      style={[
        styles.floatingElement,
        { left: baseX, top: baseY },
        getElementStyle(),
        animatedStyle,
      ]}
    />
  );
};

// Tectonic crack line
const TectonicCrack = ({ 
  startX, 
  startY, 
  angle,
  length,
  gyroX,
  gyroY,
}: {
  startX: number;
  startY: number;
  angle: number;
  length: number;
  gyroX: Animated.SharedValue<number>;
  gyroY: Animated.SharedValue<number>;
}) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 8000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 8000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const shift = interpolate(progress.value, [0, 1], [-10, 10]);
    return {
      transform: [
        { translateX: gyroX.value * 20 + shift },
        { translateY: gyroY.value * 20 },
        { rotate: `${angle}deg` },
      ],
      opacity: interpolate(progress.value, [0, 0.5, 1], [0.1, 0.3, 0.1]),
    };
  });

  return (
    <Animated.View
      style={[
        styles.tectonicCrack,
        { left: startX, top: startY, width: length },
        animatedStyle,
      ]}
    />
  );
};

export const ParallaxBackground: React.FC<ParallaxBackgroundProps> = ({
  variant = 'mineral',
  intensity = 1,
  children,
}) => {
  const gyroX = useSharedValue(0);
  const gyroY = useSharedValue(0);
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    // Set up gyroscope listener
    const subscribe = async () => {
      const isAvailable = await Gyroscope.isAvailableAsync();
      if (isAvailable) {
        Gyroscope.setUpdateInterval(50);
        const sub = Gyroscope.addListener((data) => {
          gyroX.value = withTiming(data.x * intensity, { duration: 100 });
          gyroY.value = withTiming(data.y * intensity, { duration: 100 });
        });
        setSubscription(sub);
      }
    };

    subscribe();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [intensity]);

  const getGradientColors = () => {
    switch (variant) {
      case 'tectonic':
        return ['#0a0a0c', '#1a1210', '#0a0806', '#0a0a0c'];
      case 'mineral':
        return ['#0a0a0c', '#0a0c10', '#080a0c', '#0a0a0c'];
      case 'crystal':
        return ['#0a0a0c', '#0a0a12', '#08080c', '#0a0a0c'];
      case 'magma':
        return ['#0a0a0c', '#120a08', '#0c0806', '#0a0a0c'];
      default:
        return ['#0a0a0c', '#0a0a0c', '#0a0a0c', '#0a0a0c'];
    }
  };

  const getElementType = (): 'vein' | 'plate' | 'crystal' | 'ember' => {
    switch (variant) {
      case 'tectonic':
        return 'plate';
      case 'mineral':
        return 'vein';
      case 'crystal':
        return 'crystal';
      case 'magma':
        return 'ember';
      default:
        return 'vein';
    }
  };

  const elementCount = variant === 'magma' ? 15 : 8;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={getGradientColors()}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Floating elements */}
      {Array.from({ length: elementCount }).map((_, i) => (
        <FloatingElement
          key={i}
          type={getElementType()}
          index={i}
          gyroX={gyroX}
          gyroY={gyroY}
        />
      ))}

      {/* Tectonic cracks for tectonic variant */}
      {variant === 'tectonic' && (
        <>
          <TectonicCrack startX={50} startY={200} angle={15} length={150} gyroX={gyroX} gyroY={gyroY} />
          <TectonicCrack startX={SCREEN_WIDTH - 100} startY={400} angle={-20} length={120} gyroX={gyroX} gyroY={gyroY} />
          <TectonicCrack startX={100} startY={SCREEN_HEIGHT - 300} angle={5} length={180} gyroX={gyroX} gyroY={gyroY} />
        </>
      )}

      {/* Content */}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0c',
  },
  floatingElement: {
    position: 'absolute',
  },
  tectonicCrack: {
    position: 'absolute',
    height: 2,
    backgroundColor: 'rgba(80, 60, 40, 0.4)',
    borderRadius: 1,
  },
});

export default ParallaxBackground;
