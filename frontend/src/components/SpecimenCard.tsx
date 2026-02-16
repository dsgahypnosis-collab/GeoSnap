// Specimen Card - Collection display with cinematic presentation
import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlassPanel } from './GlassPanel';
import { ConfidenceBadge } from './ConfidenceBadge';
import { RockTypeBadge } from './RockTypeBadge';
import { Specimen } from '../types';
import { colors, typography, borderRadius, shadows } from '../utils/theme';

interface SpecimenCardProps {
  specimen: Specimen;
  onPress: () => void;
  variant?: 'grid' | 'list';
}

const { width } = Dimensions.get('window');
const GRID_CARD_WIDTH = (width - 48) / 2;

export const SpecimenCard: React.FC<SpecimenCardProps> = ({
  specimen,
  onPress,
  variant = 'grid',
}) => {
  const name = specimen.identification?.primary_identification.name || 'Unknown';
  const confidence = specimen.identification?.primary_identification.confidence || 0;
  const rockType = specimen.identification?.primary_identification.rock_type || 'mineral';

  if (variant === 'list') {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <GlassPanel style={styles.listCard}>
          <Image
            source={{ uri: `data:image/jpeg;base64,${specimen.image_base64}` }}
            style={styles.listImage}
          />
          <View style={styles.listContent}>
            <Text style={styles.name} numberOfLines={1}>
              {name}
            </Text>
            <View style={styles.listMeta}>
              <RockTypeBadge type={rockType} size="sm" />
              <ConfidenceBadge confidence={confidence} size="sm" showLabel={false} />
            </View>
            {specimen.location_name && (
              <View style={styles.locationRow}>
                <Ionicons name="location" size={12} color={colors.textTertiary} />
                <Text style={styles.locationText} numberOfLines={1}>
                  {specimen.location_name}
                </Text>
              </View>
            )}
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
        </GlassPanel>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.gridCard, shadows.md]}
    >
      <Image
        source={{ uri: `data:image/jpeg;base64,${specimen.image_base64}` }}
        style={styles.gridImage}
      />
      <View style={styles.gridOverlay}>
        <View style={styles.gridContent}>
          <Text style={styles.gridName} numberOfLines={2}>
            {name}
          </Text>
          <View style={styles.gridMeta}>
            <RockTypeBadge type={rockType} size="sm" />
          </View>
        </View>
        {specimen.is_in_collection && (
          <View style={styles.collectionBadge}>
            <Ionicons name="bookmark" size={14} color={colors.specimenGold} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Grid variant
  gridCard: {
    width: GRID_CARD_WIDTH,
    height: GRID_CARD_WIDTH * 1.3,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: colors.caveShadow,
  },
  gridImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gridOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    paddingTop: 40,
    backgroundColor: 'transparent',
    backgroundImage: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
  },
  gridContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  gridName: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  gridMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  collectionBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: borderRadius.full,
    padding: 4,
  },

  // List variant
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  listImage: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.md,
  },
  listContent: {
    flex: 1,
    gap: 4,
  },
  name: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  listMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  locationText: {
    color: colors.textTertiary,
    fontSize: 12,
  },
});
