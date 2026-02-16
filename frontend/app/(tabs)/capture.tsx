// Capture Screen - ACT I: ENCOUNTER
// The mineral is not "scanned". It is discovered.
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
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { CameraView, useCameraPermissions, CameraType } from 'expo-camera';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, shadows, borderRadius } from '../../src/utils/theme';
import { useAppStore } from '../../src/stores/appStore';
import { api } from '../../src/utils/api';
import { GlassPanel, ObsidianButton } from '../../src/components';

const { width, height } = Dimensions.get('window');

export default function CaptureScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [locationPermission, setLocationPermission] = useState<boolean | null>(null);
  const [facing, setFacing] = useState<CameraType>('back');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const cameraRef = useRef<CameraView>(null);
  
  const { setCurrentImage, setCurrentSpecimen, fetchSpecimens, fetchProfile } = useAppStore();

  useEffect(() => {
    getLocationPermission();
  }, []);

  const getLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    setLocationPermission(status === 'granted');
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

  const analyzeSpecimen = async () => {
    if (!capturedImage) return;

    setIsAnalyzing(true);
    try {
      const specimen = await api.identifySpecimen(
        capturedImage,
        location?.latitude,
        location?.longitude,
        []
      );
      
      setCurrentSpecimen(specimen);
      setCurrentImage(capturedImage);
      await fetchSpecimens();
      await fetchProfile();
      
      // Navigate to result screen
      router.push(`/specimen/${specimen.id}`);
    } catch (error) {
      console.error('Analysis error:', error);
      Alert.alert(
        'Analysis Failed',
        'Could not identify the specimen. Please try again with a clearer image.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetCapture = () => {
    setCapturedImage(null);
  };

  // Permission request screen
  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <ActivityIndicator size="large" color={colors.magmaAmber} />
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <GlassPanel style={styles.permissionCard}>
            <Ionicons name="camera-outline" size={64} color={colors.magmaAmber} />
            <Text style={styles.permissionTitle}>Camera Access Required</Text>
            <Text style={styles.permissionText}>
              GeoSnap needs camera access to capture and analyze geological specimens.
            </Text>
            <ObsidianButton
              title="Grant Camera Access"
              onPress={requestPermission}
              icon={<Ionicons name="camera" size={18} color={colors.textPrimary} />}
            />
          </GlassPanel>
        </View>
      </SafeAreaView>
    );
  }

  // Captured image review
  if (capturedImage) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.reviewContainer}>
          {/* Header */}
          <View style={styles.reviewHeader}>
            <TouchableOpacity onPress={resetCapture} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.reviewTitle}>Review Specimen</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Image Preview */}
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: `data:image/jpeg;base64,${capturedImage}` }}
              style={styles.previewImage}
              resizeMode="contain"
            />
            {/* Scanning overlay during analysis */}
            {isAnalyzing && (
              <View style={styles.scanOverlay}>
                <LinearGradient
                  colors={['transparent', 'rgba(255,107,53,0.3)', 'transparent']}
                  style={styles.scanLine}
                />
                <Text style={styles.scanText}>Analyzing specimen...</Text>
              </View>
            )}
          </View>

          {/* Location Info */}
          {location && (
            <GlassPanel style={styles.locationCard} variant="subtle">
              <Ionicons name="location" size={16} color={colors.crystalTeal} />
              <Text style={styles.locationText}>
                {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
              </Text>
            </GlassPanel>
          )}

          {/* Action Buttons */}
          <View style={styles.reviewActions}>
            <ObsidianButton
              title="Retake"
              onPress={resetCapture}
              variant="secondary"
              disabled={isAnalyzing}
              icon={<Ionicons name="refresh" size={18} color={colors.textSecondary} />}
            />
            <ObsidianButton
              title={isAnalyzing ? 'Analyzing...' : 'Identify Specimen'}
              onPress={analyzeSpecimen}
              loading={isAnalyzing}
              disabled={isAnalyzing}
              icon={!isAnalyzing && <Ionicons name="scan" size={18} color={colors.textPrimary} />}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Camera View
  return (
    <View style={styles.cameraContainer}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
      >
        {/* Top Controls */}
        <SafeAreaView style={styles.cameraOverlay} edges={['top']}>
          <View style={styles.topControls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}
            >
              <Ionicons name="camera-reverse" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Center Guide */}
          <View style={styles.guideContainer}>
            <View style={styles.guideFrame}>
              <View style={[styles.guideCorner, styles.topLeft]} />
              <View style={[styles.guideCorner, styles.topRight]} />
              <View style={[styles.guideCorner, styles.bottomLeft]} />
              <View style={[styles.guideCorner, styles.bottomRight]} />
            </View>
            <Text style={styles.guideText}>Position specimen within frame</Text>
          </View>

          {/* Bottom Controls */}
          <View style={styles.bottomControls}>
            <TouchableOpacity style={styles.galleryButton} onPress={pickImage}>
              <Ionicons name="images" size={28} color={colors.textPrimary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
              <LinearGradient
                colors={[colors.magmaAmber, '#D45A27']}
                style={styles.captureGradient}
              >
                <View style={styles.captureInner} />
              </LinearGradient>
            </TouchableOpacity>

            <View style={{ width: 48 }} />
          </View>
        </SafeAreaView>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.obsidian,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  permissionCard: {
    alignItems: 'center',
    padding: spacing.xxl,
    gap: spacing.md,
    maxWidth: 320,
  },
  permissionTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  permissionText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: spacing.md,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guideContainer: {
    alignItems: 'center',
    gap: spacing.md,
  },
  guideFrame: {
    width: width * 0.75,
    height: width * 0.75,
    position: 'relative',
  },
  guideCorner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: colors.magmaAmber,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  guideText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? spacing.xxl : spacing.xl,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  galleryButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    padding: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  captureGradient: {
    flex: 1,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.textPrimary,
  },
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
    backgroundColor: colors.glassPanel,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  imageContainer: {
    flex: 1,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: colors.caveShadow,
    marginBottom: spacing.md,
  },
  previewImage: {
    flex: 1,
    width: '100%',
  },
  scanOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanLine: {
    width: '100%',
    height: 100,
    position: 'absolute',
  },
  scanText: {
    ...typography.body,
    color: colors.magmaAmber,
    fontWeight: '600',
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  locationText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  reviewActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
});
