// GeoSnap Discovery Screen - Adventure Mode!
// "Point. Snap. Discover. Every rock has a story!"
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  Dimensions,
  ScrollView,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  interpolate,
  FadeIn,
  FadeInUp,
  FadeInDown,
  ZoomIn,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { CameraView, useCameraPermissions, CameraType } from 'expo-camera';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius } from '../../src/utils/theme';
import { adventureColors, RARITY_COLORS } from '../../src/utils/adventureTheme';
import { useAppStore } from '../../src/stores/appStore';
import { api } from '../../src/utils/api';

const { width, height } = Dimensions.get('window');

// Scan type selector component
const ScanTypeCard = ({ 
  type, 
  icon, 
  title, 
  description, 
  selected, 
  onPress,
  color,
}: {
  type: string;
  icon: string;
  title: string;
  description: string;
  selected: boolean;
  onPress: () => void;
  color: string;
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <TouchableOpacity 
      onPress={() => {
        scale.value = withSequence(
          withTiming(0.95, { duration: 100 }),
          withSpring(1)
        );
        onPress();
      }}
      activeOpacity={0.9}
    >
      <Animated.View style={[
        styles.scanTypeCard,
        selected && { borderColor: color, borderWidth: 2 },
        animatedStyle,
      ]}>
        <LinearGradient
          colors={selected ? [color + '30', 'transparent'] : ['transparent', 'transparent']}
          style={StyleSheet.absoluteFill}
        />
        <View style={[styles.scanTypeIcon, { backgroundColor: color + '30' }]}>
          <Ionicons name={icon as any} size={28} color={color} />
        </View>
        <Text style={[styles.scanTypeTitle, selected && { color }]}>{title}</Text>
        <Text style={styles.scanTypeDesc}>{description}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

// Animated scanning overlay
const ScanningOverlay = ({ isActive }: { isActive: boolean }) => {
  const scanY = useSharedValue(0);
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (isActive) {
      scanY.value = withRepeat(
        withTiming(1, { duration: 2000 }),
        -1,
        true
      );
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1,
        true
      );
    }
  }, [isActive]);

  const scanLineStyle = useAnimatedStyle(() => ({
    top: `${interpolate(scanY.value, [0, 1], [10, 90])}%`,
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  if (!isActive) return null;

  return (
    <View style={styles.scanningOverlay}>
      {/* Corner brackets */}
      <View style={[styles.bracket, styles.bracketTL]} />
      <View style={[styles.bracket, styles.bracketTR]} />
      <View style={[styles.bracket, styles.bracketBL]} />
      <View style={[styles.bracket, styles.bracketBR]} />
      
      {/* Scan line */}
      <Animated.View style={[styles.scanLine, scanLineStyle]}>
        <LinearGradient
          colors={['transparent', adventureColors.auroraBlue, 'transparent']}
          style={styles.scanLineGradient}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
        />
      </Animated.View>

      {/* Center pulse */}
      <Animated.View style={[styles.centerPulse, pulseStyle]}>
        <View style={styles.centerDot} />
      </Animated.View>

      {/* Status text */}
      <View style={styles.scanStatus}>
        <ActivityIndicator color={adventureColors.auroraBlue} />
        <Text style={styles.scanStatusText}>ANALYZING...</Text>
      </View>
    </View>
  );
};

// Result animation
const DiscoveryAnimation = ({ onComplete }: { onComplete: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View 
      style={styles.discoveryOverlay}
      entering={ZoomIn.duration(300)}
    >
      <LinearGradient
        colors={['rgba(0,0,0,0.9)', 'rgba(0,0,0,0.95)']}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View entering={ZoomIn.delay(200).duration(500)}>
        <LinearGradient
          colors={[adventureColors.treasureGold, adventureColors.amberGlow]}
          style={styles.discoveryIcon}
        >
          <Ionicons name="sparkles" size={48} color={adventureColors.obsidian} />
        </LinearGradient>
      </Animated.View>
      <Animated.Text 
        style={styles.discoveryText}
        entering={FadeInUp.delay(400).duration(400)}
      >
        DISCOVERY MADE!
      </Animated.Text>
      <Animated.Text 
        style={styles.discoverySubtext}
        entering={FadeInUp.delay(600).duration(400)}
      >
        Preparing your results...
      </Animated.Text>
    </Animated.View>
  );
};

export default function CaptureScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showDiscovery, setShowDiscovery] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [scanType, setScanType] = useState<'specimen' | 'landscape'>('specimen');
  const cameraRef = useRef<CameraView>(null);
  
  const { setCurrentImage, setCurrentSpecimen, fetchSpecimens, fetchProfile } = useAppStore();

  useEffect(() => {
    getLocationPermission();
  }, []);

  const getLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      try {
        const loc = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
      } catch (e) {
        console.log('Location error:', e);
      }
    }
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          base64: true,
          quality: 0.8,
        });
        if (photo?.base64) {
          setCapturedImage(photo.base64);
        }
      } catch (error) {
        console.error('Camera error:', error);
        Alert.alert('Error', 'Failed to capture image');
      }
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0].base64) {
      setCapturedImage(result.assets[0].base64);
    }
  };

  const analyzeImage = async () => {
    if (!capturedImage) return;

    setIsAnalyzing(true);
    try {
      const specimen = await api.identifySpecimen(
        capturedImage,
        location?.latitude,
        location?.longitude,
        [],
        scanType // Pass the scan type to API
      );
      
      setCurrentSpecimen(specimen);
      setCurrentImage(capturedImage);
      await fetchSpecimens();
      await fetchProfile();
      
      // Show discovery animation
      setIsAnalyzing(false);
      setShowDiscovery(true);
    } catch (error) {
      console.error('Analysis error:', error);
      setIsAnalyzing(false);
      Alert.alert(
        '🔍 Analysis Failed',
        'Could not identify the image. Try a clearer photo or different angle!',
        [{ text: 'Try Again', style: 'default' }]
      );
    }
  };

  const handleDiscoveryComplete = () => {
    const { currentSpecimen } = useAppStore.getState();
    if (currentSpecimen) {
      router.push(`/specimen/${currentSpecimen.id}`);
    }
    setShowDiscovery(false);
    setCapturedImage(null);
  };

  const resetCapture = () => {
    setCapturedImage(null);
  };

  // Permission screens
  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={adventureColors.amberGlow} />
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={[adventureColors.obsidian, '#1a1a1a', adventureColors.obsidian]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.centerContent}>
          <Animated.View 
            style={styles.permissionCard}
            entering={FadeInUp.duration(600)}
          >
            <LinearGradient
              colors={[adventureColors.amberGlow, adventureColors.treasureGold]}
              style={styles.permissionIconBg}
            >
              <Ionicons name="camera" size={48} color={adventureColors.obsidian} />
            </LinearGradient>
            <Text style={styles.permissionTitle}>📸 Camera Access Needed</Text>
            <Text style={styles.permissionText}>
              GeoSnap needs your camera to discover and identify geological wonders!
            </Text>
            <TouchableOpacity 
              style={styles.permissionButton}
              onPress={requestPermission}
            >
              <LinearGradient
                colors={[adventureColors.amberGlow, adventureColors.treasureGold]}
                style={styles.permissionButtonGradient}
              >
                <Ionicons name="camera" size={20} color={adventureColors.obsidian} />
                <Text style={styles.permissionButtonText}>Enable Camera</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </SafeAreaView>
    );
  }

  // Image review screen
  if (capturedImage) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LinearGradient
          colors={[adventureColors.obsidian, '#0f0f12']}
          style={StyleSheet.absoluteFill}
        />
        
        {showDiscovery && <DiscoveryAnimation onComplete={handleDiscoveryComplete} />}
        
        <View style={styles.reviewContainer}>
          {/* Header */}
          <Animated.View 
            style={styles.reviewHeader}
            entering={FadeInDown.duration(400)}
          >
            <TouchableOpacity onPress={resetCapture} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.reviewTitle}>
              {scanType === 'specimen' ? '🔬 Specimen Captured' : '🏔️ Landscape Captured'}
            </Text>
            <View style={{ width: 40 }} />
          </Animated.View>

          {/* Image preview */}
          <Animated.View 
            style={styles.imagePreview}
            entering={ZoomIn.duration(500).delay(100)}
          >
            <Image
              source={{ uri: `data:image/jpeg;base64,${capturedImage}` }}
              style={styles.previewImage}
              resizeMode="cover"
            />
            <ScanningOverlay isActive={isAnalyzing} />
          </Animated.View>

          {/* Scan type indicator */}
          <Animated.View 
            style={styles.scanTypeBadge}
            entering={FadeInUp.duration(400).delay(200)}
          >
            <Ionicons 
              name={scanType === 'specimen' ? 'diamond' : 'image'} 
              size={16} 
              color={scanType === 'specimen' ? adventureColors.mineralTeal : adventureColors.sapphireBlue} 
            />
            <Text style={styles.scanTypeBadgeText}>
              {scanType === 'specimen' ? 'Specimen Analysis' : 'Landscape Analysis'}
            </Text>
          </Animated.View>

          {/* Action buttons */}
          <Animated.View 
            style={styles.actionButtons}
            entering={FadeInUp.duration(400).delay(300)}
          >
            <TouchableOpacity 
              style={styles.retakeButton}
              onPress={resetCapture}
              disabled={isAnalyzing}
            >
              <Ionicons name="refresh" size={24} color={colors.textSecondary} />
              <Text style={styles.retakeText}>Retake</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.analyzeButton, isAnalyzing && styles.analyzeButtonDisabled]}
              onPress={analyzeImage}
              disabled={isAnalyzing}
            >
              <LinearGradient
                colors={isAnalyzing 
                  ? [adventureColors.textMuted, adventureColors.textMuted]
                  : [adventureColors.amberGlow, adventureColors.treasureGold]
                }
                style={styles.analyzeButtonGradient}
              >
                {isAnalyzing ? (
                  <ActivityIndicator color={adventureColors.obsidian} />
                ) : (
                  <>
                    <Ionicons name="sparkles" size={24} color={adventureColors.obsidian} />
                    <Text style={styles.analyzeText}>✨ Identify!</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Fun tip */}
          <Animated.Text 
            style={styles.funTip}
            entering={FadeIn.duration(600).delay(500)}
          >
            💡 Tip: Clear, well-lit photos give the best results!
          </Animated.Text>
        </View>
      </SafeAreaView>
    );
  }

  // Camera view
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={facing}
        >
          {/* Overlay UI */}
          <LinearGradient
            colors={['rgba(0,0,0,0.6)', 'transparent', 'transparent', 'rgba(0,0,0,0.8)']}
            style={StyleSheet.absoluteFill}
          />

          {/* Header */}
          <Animated.View 
            style={styles.cameraHeader}
            entering={FadeInDown.duration(400)}
          >
            <Text style={styles.cameraTitle}>🎯 Point & Discover</Text>
            <Text style={styles.cameraSubtitle}>
              {scanType === 'specimen' 
                ? 'Center a rock, mineral, or crystal'
                : 'Capture a geological landscape'
              }
            </Text>
          </Animated.View>

          {/* Scan type selector */}
          <Animated.View 
            style={styles.scanTypeSelector}
            entering={FadeInUp.duration(400).delay(100)}
          >
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.scanTypeScroll}
            >
              <ScanTypeCard
                type="specimen"
                icon="diamond"
                title="🔬 Specimen"
                description="Rocks & Minerals"
                selected={scanType === 'specimen'}
                onPress={() => setScanType('specimen')}
                color={adventureColors.mineralTeal}
              />
              <ScanTypeCard
                type="landscape"
                icon="image"
                title="🏔️ Landscape"
                description="Geological Features"
                selected={scanType === 'landscape'}
                onPress={() => setScanType('landscape')}
                color={adventureColors.sapphireBlue}
              />
            </ScrollView>
          </Animated.View>

          {/* Camera guide frame */}
          <View style={styles.guideFrame}>
            <View style={[styles.guideCorner, styles.guideTL]} />
            <View style={[styles.guideCorner, styles.guideTR]} />
            <View style={[styles.guideCorner, styles.guideBL]} />
            <View style={[styles.guideCorner, styles.guideBR]} />
          </View>

          {/* Bottom controls */}
          <Animated.View 
            style={styles.cameraControls}
            entering={FadeInUp.duration(400).delay(200)}
          >
            {/* Gallery button */}
            <TouchableOpacity 
              style={styles.galleryButton}
              onPress={pickImage}
            >
              <Ionicons name="images" size={28} color={colors.textPrimary} />
              <Text style={styles.controlLabel}>Gallery</Text>
            </TouchableOpacity>

            {/* Capture button */}
            <TouchableOpacity 
              style={styles.captureButton}
              onPress={takePicture}
            >
              <LinearGradient
                colors={[adventureColors.amberGlow, adventureColors.treasureGold]}
                style={styles.captureButtonInner}
              >
                <Ionicons name="scan" size={36} color={adventureColors.obsidian} />
              </LinearGradient>
            </TouchableOpacity>

            {/* Flip camera */}
            <TouchableOpacity 
              style={styles.flipButton}
              onPress={() => setFacing(f => f === 'back' ? 'front' : 'back')}
            >
              <Ionicons name="camera-reverse" size={28} color={colors.textPrimary} />
              <Text style={styles.controlLabel}>Flip</Text>
            </TouchableOpacity>
          </Animated.View>
        </CameraView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: adventureColors.obsidian,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  // Permission styles
  permissionCard: {
    backgroundColor: adventureColors.glassPanel,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: adventureColors.glassBorder,
    width: '100%',
    maxWidth: 340,
  },
  permissionIconBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  permissionButton: {
    marginTop: spacing.md,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  permissionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 28,
    gap: 10,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: adventureColors.obsidian,
  },
  // Camera styles
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraHeader: {
    paddingTop: 20,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  cameraTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  cameraSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  // Scan type selector
  scanTypeSelector: {
    marginTop: spacing.md,
  },
  scanTypeScroll: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  scanTypeCard: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    width: 140,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  scanTypeIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  scanTypeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  scanTypeDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  // Guide frame
  guideFrame: {
    position: 'absolute',
    top: '25%',
    left: '10%',
    right: '10%',
    bottom: '30%',
  },
  guideCorner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: adventureColors.amberGlow,
  },
  guideTL: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3 },
  guideTR: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3 },
  guideBL: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3 },
  guideBR: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3 },
  // Camera controls
  cameraControls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  galleryButton: {
    alignItems: 'center',
    padding: spacing.sm,
  },
  flipButton: {
    alignItems: 'center',
    padding: spacing.sm,
  },
  controlLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 4,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 4,
    borderWidth: 3,
    borderColor: adventureColors.amberGlow,
  },
  captureButtonInner: {
    flex: 1,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Review styles
  reviewContainer: {
    flex: 1,
    padding: spacing.md,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: adventureColors.glassPanel,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  imagePreview: {
    flex: 1,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  scanTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: adventureColors.glassPanel,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  scanTypeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  retakeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: adventureColors.glassPanel,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.xs,
  },
  retakeText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  analyzeButton: {
    flex: 2,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  analyzeButtonDisabled: {
    opacity: 0.7,
  },
  analyzeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  analyzeText: {
    fontSize: 18,
    fontWeight: '800',
    color: adventureColors.obsidian,
  },
  funTip: {
    fontSize: 13,
    color: colors.textTertiary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  // Scanning overlay
  scanningOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  bracket: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: adventureColors.auroraBlue,
  },
  bracketTL: { top: 20, left: 20, borderTopWidth: 3, borderLeftWidth: 3 },
  bracketTR: { top: 20, right: 20, borderTopWidth: 3, borderRightWidth: 3 },
  bracketBL: { bottom: 20, left: 20, borderBottomWidth: 3, borderLeftWidth: 3 },
  bracketBR: { bottom: 20, right: 20, borderBottomWidth: 3, borderRightWidth: 3 },
  scanLine: {
    position: 'absolute',
    left: 20,
    right: 20,
    height: 3,
  },
  scanLineGradient: {
    flex: 1,
  },
  centerPulse: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 60,
    height: 60,
    marginLeft: -30,
    marginTop: -30,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: adventureColors.auroraBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: adventureColors.auroraBlue,
  },
  scanStatus: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  scanStatusText: {
    fontSize: 14,
    fontWeight: '700',
    color: adventureColors.auroraBlue,
    letterSpacing: 2,
  },
  // Discovery animation
  discoveryOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  discoveryIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  discoveryText: {
    fontSize: 28,
    fontWeight: '800',
    color: adventureColors.treasureGold,
    letterSpacing: 3,
  },
  discoverySubtext: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
});
