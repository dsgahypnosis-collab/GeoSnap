// Deep Time Visualization - Scrubbing through Earth's History
// Time becomes touchable. Millions of years feel heavy.
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../utils/theme';

const { width } = Dimensions.get('window');

interface DeepTimeEvent {
  years_ago: number;
  event: string;
  era?: string;
  color?: string;
}

interface DeepTimeVisualizationProps {
  events: DeepTimeEvent[];
  specimenAge?: number; // Years ago when specimen formed
  onTimeChange?: (yearsAgo: number) => void;
}

// Default geological timeline
const DEFAULT_EVENTS: DeepTimeEvent[] = [
  { years_ago: 4540000000, event: "Earth forms from solar nebula", era: "Hadean", color: colors.rubyRed },
  { years_ago: 4000000000, event: "First oceans form", era: "Hadean", color: colors.rubyRed },
  { years_ago: 3500000000, event: "First life appears", era: "Archean", color: colors.magmaAmber },
  { years_ago: 2500000000, event: "Great Oxidation Event", era: "Proterozoic", color: colors.amethystPurple },
  { years_ago: 541000000, event: "Cambrian Explosion - complex life", era: "Paleozoic", color: colors.emeraldGreen },
  { years_ago: 252000000, event: "Permian Extinction - 96% species lost", era: "Mesozoic", color: colors.rubyRed },
  { years_ago: 66000000, event: "Dinosaur extinction", era: "Cenozoic", color: colors.specimenGold },
  { years_ago: 2600000, event: "Ice Ages begin", era: "Quaternary", color: colors.crystalTeal },
  { years_ago: 200000, event: "Homo sapiens appears", era: "Quaternary", color: colors.mineralBlue },
  { years_ago: 0, event: "Present day", era: "Anthropocene", color: colors.textPrimary },
];

export const DeepTimeVisualization: React.FC<DeepTimeVisualizationProps> = ({
  events = DEFAULT_EVENTS,
  specimenAge,
  onTimeChange,
}) => {
  const [currentTime, setCurrentTime] = useState(specimenAge || 0);
  const scrubberPosition = useRef(new Animated.Value(width - 60)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Calculate timeline range
  const maxAge = Math.max(...events.map(e => e.years_ago));
  const minAge = 0;

  // Pulse animation for specimen marker
  React.useEffect(() => {
    if (specimenAge) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [specimenAge]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        const trackWidth = width - 60;
        let newX = Math.max(0, Math.min(trackWidth, gestureState.moveX - 30));
        scrubberPosition.setValue(newX);
        
        // Calculate time from position (reversed: left is old, right is new)
        const percentage = 1 - (newX / trackWidth);
        const newTime = Math.round(percentage * maxAge);
        setCurrentTime(newTime);
        onTimeChange?.(newTime);
      },
    })
  ).current;

  const formatYears = (years: number): string => {
    if (years >= 1000000000) {
      return `${(years / 1000000000).toFixed(1)} billion years ago`;
    } else if (years >= 1000000) {
      return `${(years / 1000000).toFixed(0)} million years ago`;
    } else if (years >= 1000) {
      return `${(years / 1000).toFixed(0)} thousand years ago`;
    } else if (years === 0) {
      return 'Present day';
    }
    return `${years} years ago`;
  };

  const getEraForTime = (years: number): DeepTimeEvent | undefined => {
    return events.find((e, i) => {
      const nextEvent = events[i + 1];
      return years <= e.years_ago && (!nextEvent || years > nextEvent.years_ago);
    });
  };

  const currentEra = getEraForTime(currentTime);

  // Calculate specimen position on timeline
  const specimenPosition = specimenAge 
    ? (1 - specimenAge / maxAge) * (width - 60)
    : null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="time" size={20} color={colors.crystalTeal} />
        <Text style={styles.title}>DEEP TIME</Text>
      </View>

      {/* Current Time Display */}
      <View style={styles.timeDisplay}>
        <Text style={styles.currentTime}>{formatYears(currentTime)}</Text>
        {currentEra && (
          <View style={[styles.eraBadge, { backgroundColor: `${currentEra.color}30` }]}>
            <Text style={[styles.eraText, { color: currentEra.color }]}>
              {currentEra.era}
            </Text>
          </View>
        )}
      </View>

      {/* Timeline Track */}
      <View style={styles.trackContainer}>
        <View style={styles.track}>
          {/* Era gradients */}
          <View style={styles.eraGradient}>
            {events.slice(0, -1).map((event, index) => {
              const nextEvent = events[index + 1];
              const startPercent = (1 - event.years_ago / maxAge) * 100;
              const endPercent = (1 - nextEvent.years_ago / maxAge) * 100;
              const width = endPercent - startPercent;
              
              return (
                <View
                  key={index}
                  style={[
                    styles.eraSegment,
                    {
                      left: `${startPercent}%`,
                      width: `${width}%`,
                      backgroundColor: `${event.color}40`,
                    },
                  ]}
                />
              );
            })}
          </View>

          {/* Event markers */}
          {events.map((event, index) => {
            const position = (1 - event.years_ago / maxAge) * 100;
            return (
              <View
                key={index}
                style={[
                  styles.eventMarker,
                  { left: `${position}%`, backgroundColor: event.color },
                ]}
              />
            );
          })}

          {/* Specimen marker */}
          {specimenPosition !== null && (
            <Animated.View
              style={[
                styles.specimenMarker,
                {
                  left: specimenPosition,
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              <Ionicons name="diamond" size={16} color={colors.specimenGold} />
            </Animated.View>
          )}

          {/* Scrubber */}
          <Animated.View
            {...panResponder.panHandlers}
            style={[
              styles.scrubber,
              { transform: [{ translateX: scrubberPosition }] },
            ]}
          >
            <View style={styles.scrubberHead} />
            <View style={styles.scrubberLine} />
          </Animated.View>
        </View>

        {/* Timeline labels */}
        <View style={styles.labels}>
          <Text style={styles.labelText}>4.5 Bya</Text>
          <Text style={styles.labelText}>Now</Text>
        </View>
      </View>

      {/* Current Event Description */}
      {currentEra && (
        <View style={styles.eventDescription}>
          <Text style={styles.eventText}>{currentEra.event}</Text>
        </View>
      )}

      {/* Specimen Age Indicator */}
      {specimenAge && (
        <View style={styles.specimenInfo}>
          <Ionicons name="diamond" size={14} color={colors.specimenGold} />
          <Text style={styles.specimenText}>
            Your specimen formed: {formatYears(specimenAge)}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    backgroundColor: colors.glassPanel,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.label,
    color: colors.crystalTeal,
  },
  timeDisplay: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  currentTime: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  eraBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginTop: spacing.xs,
  },
  eraText: {
    ...typography.caption,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  trackContainer: {
    marginBottom: spacing.md,
  },
  track: {
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius.sm,
    position: 'relative',
    overflow: 'hidden',
  },
  eraGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
  },
  eraSegment: {
    position: 'absolute',
    top: 0,
    bottom: 0,
  },
  eventMarker: {
    position: 'absolute',
    width: 3,
    height: '100%',
    opacity: 0.6,
  },
  specimenMarker: {
    position: 'absolute',
    top: -8,
    marginLeft: -8,
    zIndex: 10,
  },
  scrubber: {
    position: 'absolute',
    top: -5,
    alignItems: 'center',
  },
  scrubberHead: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.magmaAmber,
    borderWidth: 3,
    borderColor: colors.textPrimary,
    shadowColor: colors.magmaAmber,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  scrubberLine: {
    width: 2,
    height: 50,
    backgroundColor: colors.magmaAmber,
    opacity: 0.5,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  labelText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  eventDescription: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
  },
  eventText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  specimenInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  specimenText: {
    ...typography.caption,
    color: colors.specimenGold,
    fontWeight: '500',
  },
});
