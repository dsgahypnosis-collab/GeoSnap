// Specimen Detail Screen - ACT III: REVELATION
// The answer does not pop in. It resolves.
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius, shadows, rockTypeColors } from '../../src/utils/theme';
import { useAppStore } from '../../src/stores/appStore';
import { api } from '../../src/utils/api';
import { Specimen } from '../../src/types';
import { GlassPanel, ObsidianButton, ConfidenceBadge, RockTypeBadge } from '../../src/components';

const { width } = Dimensions.get('window');

export default function SpecimenDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [specimen, setSpecimen] = useState<Specimen | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAllCandidates, setShowAllCandidates] = useState(false);
  const { addSpecimenToCollection, removeSpecimenFromCollection, fetchCollection, deleteSpecimen } = useAppStore();

  useEffect(() => {
    loadSpecimen();
  }, [id]);

  const loadSpecimen = async () => {
    if (!id) return;
    try {
      const data = await api.getSpecimen(id);
      setSpecimen(data);
    } catch (error) {
      console.error('Failed to load specimen:', error);
      Alert.alert('Error', 'Failed to load specimen details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCollection = async () => {
    if (!specimen) return;
    try {
      if (specimen.is_in_collection) {
        await removeSpecimenFromCollection(specimen.id);
      } else {
        await addSpecimenToCollection(specimen.id);
      }
      await loadSpecimen();
    } catch (error) {
      Alert.alert('Error', 'Failed to update collection');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Specimen',
      'Are you sure you want to delete this specimen? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSpecimen(specimen!.id);
              router.back();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete specimen');
            }
          },
        },
      ]
    );
  };

  if (loading || !specimen) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.magmaAmber} />
          <Text style={styles.loadingText}>Loading specimen...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const identification = specimen.identification;
  const specimenData = specimen.specimen_data;
  const primaryId = identification?.primary_identification;

  return (
    <View style={styles.container}>
      {/* Hero Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: `data:image/jpeg;base64,${specimen.image_base64}` }}
          style={styles.heroImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)', colors.obsidian]}
          style={styles.imageGradient}
        />
        {/* Back button */}
        <SafeAreaView style={styles.headerOverlay} edges={['top']}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleToggleCollection}>
              <Ionicons
                name={specimen.is_in_collection ? 'bookmark' : 'bookmark-outline'}
                size={24}
                color={specimen.is_in_collection ? colors.specimenGold : colors.textPrimary}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleDelete}>
              <Ionicons name="trash-outline" size={24} color={colors.rubyRed} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        {/* XP Badge */}
        {specimen.xp_earned > 0 && (
          <View style={styles.xpBadge}>
            <Ionicons name="star" size={14} color={colors.specimenGold} />
            <Text style={styles.xpText}>+{specimen.xp_earned} XP</Text>
          </View>
        )}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Primary Identification */}
        <View style={styles.identificationSection}>
          <Text style={styles.specimenName}>{primaryId?.name || 'Unknown Specimen'}</Text>
          {specimenData?.scientific_name && (
            <Text style={styles.scientificName}>{specimenData.scientific_name}</Text>
          )}
          
          <View style={styles.badgeRow}>
            {primaryId?.rock_type && <RockTypeBadge type={primaryId.rock_type} />}
            {primaryId?.confidence !== undefined && (
              <ConfidenceBadge confidence={primaryId.confidence} size="md" />
            )}
          </View>
        </View>

        {/* Evidence Used */}
        {identification?.evidence_used && identification.evidence_used.length > 0 && (
          <GlassPanel style={styles.section}>
            <Text style={styles.sectionLabel}>EVIDENCE OBSERVED</Text>
            <View style={styles.evidenceList}>
              {identification.evidence_used.map((evidence, index) => (
                <View key={index} style={styles.evidenceItem}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.emeraldGreen} />
                  <Text style={styles.evidenceText}>{evidence}</Text>
                </View>
              ))}
            </View>
          </GlassPanel>
        )}

        {/* Uncertainty Notes */}
        {identification?.uncertainty_notes && (
          <GlassPanel style={styles.uncertaintyCard} variant="subtle">
            <View style={styles.uncertaintyHeader}>
              <Ionicons name="alert-circle" size={18} color={colors.warning} />
              <Text style={styles.uncertaintyLabel}>Uncertainty Note</Text>
            </View>
            <Text style={styles.uncertaintyText}>{identification.uncertainty_notes}</Text>
          </GlassPanel>
        )}

        {/* Secondary Candidates */}
        {identification?.secondary_candidates && identification.secondary_candidates.length > 0 && (
          <GlassPanel style={styles.section}>
            <TouchableOpacity
              style={styles.candidatesHeader}
              onPress={() => setShowAllCandidates(!showAllCandidates)}
            >
              <Text style={styles.sectionLabel}>ALTERNATIVE IDENTIFICATIONS</Text>
              <Ionicons
                name={showAllCandidates ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={colors.textTertiary}
              />
            </TouchableOpacity>
            {showAllCandidates && (
              <View style={styles.candidatesList}>
                {identification.secondary_candidates.map((candidate, index) => (
                  <View key={index} style={styles.candidateCard}>
                    <View style={styles.candidateHeader}>
                      <Text style={styles.candidateName}>{candidate.name}</Text>
                      <ConfidenceBadge confidence={candidate.confidence} size="sm" showLabel={false} />
                    </View>
                    <View style={styles.candidateReasons}>
                      {candidate.reasons.map((reason, i) => (
                        <Text key={i} style={styles.reasonText}>• {reason}</Text>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </GlassPanel>
        )}

        {/* Physical Properties */}
        {specimenData && (
          <GlassPanel style={styles.section}>
            <Text style={styles.sectionLabel}>PHYSICAL PROPERTIES</Text>
            <View style={styles.propertiesGrid}>
              {specimenData.hardness && (
                <PropertyItem label="Hardness" value={specimenData.hardness} icon="fitness" />
              )}
              {specimenData.luster && (
                <PropertyItem label="Luster" value={specimenData.luster} icon="sunny" />
              )}
              {specimenData.density && (
                <PropertyItem label="Density" value={specimenData.density} icon="scale" />
              )}
              {specimenData.streak && (
                <PropertyItem label="Streak" value={specimenData.streak} icon="color-palette" />
              )}
              {specimenData.cleavage && (
                <PropertyItem label="Cleavage" value={specimenData.cleavage} icon="cut" />
              )}
              {specimenData.fracture && (
                <PropertyItem label="Fracture" value={specimenData.fracture} icon="hammer" />
              )}
              {specimenData.crystal_system && (
                <PropertyItem label="Crystal System" value={specimenData.crystal_system} icon="cube" />
              )}
              {specimenData.chemical_composition && (
                <PropertyItem label="Formula" value={specimenData.chemical_composition} icon="flask" />
              )}
            </View>
          </GlassPanel>
        )}

        {/* Formation & History */}
        {specimenData?.formation_process && (
          <GlassPanel style={styles.section}>
            <Text style={styles.sectionLabel}>FORMATION & HISTORY</Text>
            <Text style={styles.bodyText}>{specimenData.formation_process}</Text>
            {specimenData.geological_era && (
              <View style={styles.eraContainer}>
                <Ionicons name="time" size={16} color={colors.crystalTeal} />
                <Text style={styles.eraText}>{specimenData.geological_era}</Text>
              </View>
            )}
            {specimenData.plate_tectonic_context && (
              <Text style={styles.contextText}>{specimenData.plate_tectonic_context}</Text>
            )}
          </GlassPanel>
        )}

        {/* Interesting Facts */}
        {specimenData?.interesting_facts && specimenData.interesting_facts.length > 0 && (
          <GlassPanel style={styles.section} variant="elevated">
            <Text style={styles.sectionLabel}>DID YOU KNOW?</Text>
            <View style={styles.factsList}>
              {specimenData.interesting_facts.map((fact, index) => (
                <View key={index} style={styles.factItem}>
                  <Ionicons name="bulb" size={16} color={colors.specimenGold} />
                  <Text style={styles.factText}>{fact}</Text>
                </View>
              ))}
            </View>
          </GlassPanel>
        )}

        {/* Value Assessment */}
        {(specimenData?.scientific_value || specimenData?.collector_value || specimenData?.market_value_range) && (
          <GlassPanel style={styles.section}>
            <Text style={styles.sectionLabel}>VALUE ASSESSMENT</Text>
            {specimenData.scientific_value && (
              <View style={styles.valueItem}>
                <Text style={styles.valueLabel}>Scientific Value</Text>
                <Text style={styles.valueText}>{specimenData.scientific_value}</Text>
              </View>
            )}
            {specimenData.collector_value && (
              <View style={styles.valueItem}>
                <Text style={styles.valueLabel}>Collector Value</Text>
                <Text style={styles.valueText}>{specimenData.collector_value}</Text>
              </View>
            )}
            {specimenData.market_value_range && (
              <View style={styles.valueItem}>
                <Text style={styles.valueLabel}>Market Range</Text>
                <Text style={[styles.valueText, { color: colors.specimenGold }]}>
                  {specimenData.market_value_range}
                </Text>
              </View>
            )}
          </GlassPanel>
        )}

        {/* Toxicity Warning */}
        {specimenData?.toxicity_warning && (
          <GlassPanel style={styles.warningCard}>
            <View style={styles.warningHeader}>
              <Ionicons name="warning" size={20} color={colors.rubyRed} />
              <Text style={styles.warningLabel}>Safety Warning</Text>
            </View>
            <Text style={styles.warningText}>{specimenData.toxicity_warning}</Text>
          </GlassPanel>
        )}

        {/* Location */}
        {(specimen.latitude || specimen.location_name) && (
          <GlassPanel style={styles.section} variant="subtle">
            <Text style={styles.sectionLabel}>DISCOVERY LOCATION</Text>
            <View style={styles.locationInfo}>
              <Ionicons name="location" size={18} color={colors.crystalTeal} />
              <View>
                {specimen.location_name && (
                  <Text style={styles.locationName}>{specimen.location_name}</Text>
                )}
                {specimen.latitude && specimen.longitude && (
                  <Text style={styles.coordinates}>
                    {specimen.latitude.toFixed(6)}, {specimen.longitude.toFixed(6)}
                  </Text>
                )}
              </View>
            </View>
          </GlassPanel>
        )}

        {/* Timestamp */}
        <Text style={styles.timestamp}>
          Discovered on {new Date(specimen.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </ScrollView>
    </View>
  );
}

function PropertyItem({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <View style={propertyStyles.item}>
      <Ionicons name={icon as any} size={16} color={colors.textTertiary} />
      <View style={propertyStyles.content}>
        <Text style={propertyStyles.label}>{label}</Text>
        <Text style={propertyStyles.value}>{value}</Text>
      </View>
    </View>
  );
}

const propertyStyles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    width: '48%',
    marginBottom: spacing.md,
  },
  content: {
    flex: 1,
  },
  label: {
    ...typography.caption,
    color: colors.textTertiary,
    marginBottom: 2,
  },
  value: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontWeight: '500',
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.obsidian,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  imageContainer: {
    height: width * 0.8,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  xpBadge: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  xpText: {
    ...typography.bodySmall,
    color: colors.specimenGold,
    fontWeight: '600',
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  identificationSection: {
    marginBottom: spacing.lg,
  },
  specimenName: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  scientificName: {
    ...typography.body,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: spacing.md,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionLabel: {
    ...typography.label,
    color: colors.textTertiary,
    marginBottom: spacing.sm,
  },
  evidenceList: {
    gap: spacing.xs,
  },
  evidenceItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  evidenceText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flex: 1,
  },
  uncertaintyCard: {
    marginBottom: spacing.md,
    borderColor: colors.warning,
    borderWidth: 1,
  },
  uncertaintyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  uncertaintyLabel: {
    ...typography.bodySmall,
    color: colors.warning,
    fontWeight: '600',
  },
  uncertaintyText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  candidatesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  candidatesList: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  candidateCard: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: borderRadius.md,
    padding: spacing.sm,
  },
  candidateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  candidateName: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  candidateReasons: {
    gap: 2,
  },
  reasonText: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  propertiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  bodyText: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  eraContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    backgroundColor: 'rgba(0, 180, 216, 0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  eraText: {
    ...typography.bodySmall,
    color: colors.crystalTeal,
    fontWeight: '500',
  },
  contextText: {
    ...typography.bodySmall,
    color: colors.textTertiary,
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
  factsList: {
    gap: spacing.sm,
  },
  factItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  factText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
  valueItem: {
    marginBottom: spacing.sm,
  },
  valueLabel: {
    ...typography.caption,
    color: colors.textTertiary,
    marginBottom: 2,
  },
  valueText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
  },
  warningCard: {
    marginBottom: spacing.md,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: colors.rubyRed,
    borderWidth: 1,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  warningLabel: {
    ...typography.bodySmall,
    color: colors.rubyRed,
    fontWeight: '600',
  },
  warningText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  locationName: {
    ...typography.body,
    color: colors.textPrimary,
  },
  coordinates: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: 2,
  },
  timestamp: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
