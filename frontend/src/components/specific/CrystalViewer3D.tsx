// CrystalViewer3D.tsx - Interactive 3D Crystal/Mineral Viewer
// Rotatable, scalable models with dynamic lighting and cinematic effects
import React, { Suspense, useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, MeshTransmissionMaterial, Float, Stars } from '@react-three/drei';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  FadeIn,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { adventureColors } from '../../utils/adventureTheme';
import { colors, spacing, borderRadius } from '../../utils/theme';
import * as THREE from 'three';

const { width } = Dimensions.get('window');

interface CrystalViewer3DProps {
  crystalType?: 'quartz' | 'diamond' | 'emerald' | 'amethyst' | 'obsidian' | 'pyrite' | 'fluorite';
  color?: string;
  transparency?: number;
  showCleavage?: boolean;
  showGrowthAnimation?: boolean;
  onRotate?: () => void;
}

// Quartz Crystal Geometry
const QuartzCrystal = ({ color = '#F5F5F5', transparency = 0.3 }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      // Subtle idle rotation
      meshRef.current.rotation.y += 0.002;
      // Breathing scale effect
      const scale = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
      meshRef.current.scale.setScalar(scale);
    }
  });

  // Create hexagonal prism with pyramidal terminations (quartz habit)
  const createQuartzGeometry = () => {
    const shape = new THREE.Shape();
    const sides = 6;
    const radius = 0.5;
    
    for (let i = 0; i <= sides; i++) {
      const angle = (i / sides) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }

    const extrudeSettings = {
      depth: 2,
      bevelEnabled: true,
      bevelThickness: 0.3,
      bevelSize: 0.2,
      bevelSegments: 3,
    };

    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  };

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
      <mesh
        ref={meshRef}
        geometry={createQuartzGeometry()}
        rotation={[Math.PI / 2, 0, 0]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? 1.1 : 1}
      >
        <MeshTransmissionMaterial
          backside
          samples={16}
          resolution={512}
          transmission={1 - transparency}
          roughness={0.1}
          thickness={0.5}
          ior={1.5}
          chromaticAberration={0.06}
          anisotropy={0.3}
          distortion={0.1}
          distortionScale={0.2}
          temporalDistortion={0.1}
          color={color}
        />
      </mesh>
    </Float>
  );
};

// Diamond Crystal (Octahedron)
const DiamondCrystal = ({ color = '#E8F4F8' }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
    if (lightRef.current) {
      lightRef.current.position.x = Math.sin(state.clock.elapsedTime) * 3;
      lightRef.current.position.z = Math.cos(state.clock.elapsedTime) * 3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.4}>
      <mesh ref={meshRef}>
        <octahedronGeometry args={[1, 0]} />
        <MeshTransmissionMaterial
          backside
          samples={32}
          resolution={1024}
          transmission={0.95}
          roughness={0}
          thickness={1}
          ior={2.4}  // Diamond's refractive index
          chromaticAberration={0.15}
          anisotropy={1}
          distortion={0.3}
          distortionScale={0.5}
          color={color}
        />
      </mesh>
      <pointLight ref={lightRef} position={[2, 2, 2]} intensity={50} color="#ffffff" />
    </Float>
  );
};

// Pyrite Crystal (Cube)
const PyriteCrystal = ({ color = '#D4AF37' }) => {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.003;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.05;
    }
  });

  return (
    <Float speed={1} rotationIntensity={0.1} floatIntensity={0.2}>
      <group ref={meshRef}>
        {/* Main cube */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1.2, 1.2, 1.2]} />
          <meshStandardMaterial
            color={color}
            metalness={0.9}
            roughness={0.2}
            envMapIntensity={1.5}
          />
        </mesh>
        {/* Striations */}
        {[...Array(5)].map((_, i) => (
          <mesh key={i} position={[0, -0.5 + i * 0.25, 0.61]}>
            <boxGeometry args={[1.1, 0.02, 0.05]} />
            <meshStandardMaterial color="#8B7500" metalness={0.95} roughness={0.1} />
          </mesh>
        ))}
      </group>
    </Float>
  );
};

// Amethyst Crystal Cluster
const AmethystCrystal = ({ color = '#9966CC' }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.002;
    }
  });

  const createCrystalPoint = (height: number, radius: number) => {
    const geometry = new THREE.ConeGeometry(radius, height, 6);
    return geometry;
  };

  return (
    <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.25}>
      <group ref={groupRef}>
        {/* Central crystal */}
        <mesh position={[0, 0.3, 0]} rotation={[0, 0, 0]}>
          <coneGeometry args={[0.3, 1.5, 6]} />
          <MeshTransmissionMaterial
            backside
            samples={16}
            transmission={0.7}
            roughness={0.05}
            thickness={0.8}
            ior={1.54}
            chromaticAberration={0.05}
            color={color}
          />
        </mesh>
        {/* Surrounding crystals */}
        {[0, 60, 120, 180, 240, 300].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const dist = 0.4 + Math.random() * 0.2;
          const h = 0.6 + Math.random() * 0.4;
          return (
            <mesh
              key={i}
              position={[
                Math.cos(rad) * dist,
                -0.2 + Math.random() * 0.3,
                Math.sin(rad) * dist,
              ]}
              rotation={[
                (Math.random() - 0.5) * 0.3,
                angle * Math.PI / 180,
                (Math.random() - 0.5) * 0.3,
              ]}
            >
              <coneGeometry args={[0.15, h, 6]} />
              <MeshTransmissionMaterial
                backside
                samples={8}
                transmission={0.6}
                roughness={0.1}
                thickness={0.5}
                ior={1.54}
                color={i % 2 === 0 ? color : '#7B68EE'}
              />
            </mesh>
          );
        })}
        {/* Base rock */}
        <mesh position={[0, -0.6, 0]}>
          <dodecahedronGeometry args={[0.6, 0]} />
          <meshStandardMaterial color="#4a4a4a" roughness={0.9} />
        </mesh>
      </group>
    </Float>
  );
};

// Obsidian (Volcanic Glass)
const ObsidianCrystal = ({ color = '#0a0a0a' }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.003;
    }
  });

  return (
    <Float speed={0.8} rotationIntensity={0.1} floatIntensity={0.15}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1, 0]} />
        <meshPhysicalMaterial
          color={color}
          metalness={0.1}
          roughness={0.05}
          clearcoat={1}
          clearcoatRoughness={0}
          reflectivity={1}
          envMapIntensity={2}
        />
      </mesh>
    </Float>
  );
};

// Fluorite (Cubic with color zoning)
const FluoriteCrystal = ({ color = '#00CED1' }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.004;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
      <group ref={groupRef}>
        {/* Intergrown cubes */}
        <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}>
          <boxGeometry args={[1, 1, 1]} />
          <MeshTransmissionMaterial
            backside
            samples={16}
            transmission={0.85}
            roughness={0.05}
            thickness={0.5}
            ior={1.43}
            chromaticAberration={0.03}
            color={color}
          />
        </mesh>
        <mesh position={[0.4, 0.4, 0.4]} rotation={[0.2, 0.3, 0.1]}>
          <boxGeometry args={[0.6, 0.6, 0.6]} />
          <MeshTransmissionMaterial
            backside
            samples={8}
            transmission={0.8}
            roughness={0.1}
            thickness={0.3}
            ior={1.43}
            color="#9370DB"
          />
        </mesh>
      </group>
    </Float>
  );
};

// Scene setup component
const Scene = ({ crystalType, color, transparency, showGrowthAnimation }: CrystalViewer3DProps) => {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 0, 5);
  }, []);

  const renderCrystal = () => {
    switch (crystalType) {
      case 'diamond':
        return <DiamondCrystal color={color} />;
      case 'pyrite':
        return <PyriteCrystal color={color} />;
      case 'amethyst':
        return <AmethystCrystal color={color} />;
      case 'obsidian':
        return <ObsidianCrystal color={color} />;
      case 'fluorite':
        return <FluoriteCrystal color={color} />;
      case 'quartz':
      default:
        return <QuartzCrystal color={color} transparency={transparency} />;
    }
  };

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4169E1" />
      
      {/* Environment for reflections */}
      <Environment preset="night" />
      
      {/* Stars background */}
      <Stars radius={100} depth={50} count={1000} factor={4} saturation={0} fade speed={1} />
      
      {/* Crystal */}
      {renderCrystal()}
      
      {/* Controls */}
      <OrbitControls
        enableZoom={true}
        enablePan={false}
        minDistance={3}
        maxDistance={10}
        autoRotate={false}
        autoRotateSpeed={0.5}
      />
    </>
  );
};

// Main component
export const CrystalViewer3D: React.FC<CrystalViewer3DProps> = ({
  crystalType = 'quartz',
  color,
  transparency = 0.3,
  showCleavage = false,
  showGrowthAnimation = false,
  onRotate,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'rotate' | 'cleavage' | 'growth'>('rotate');

  const getDefaultColor = () => {
    switch (crystalType) {
      case 'diamond': return '#E8F4F8';
      case 'pyrite': return '#D4AF37';
      case 'amethyst': return '#9966CC';
      case 'obsidian': return '#0a0a0a';
      case 'fluorite': return '#00CED1';
      case 'emerald': return '#50C878';
      default: return '#F5F5F5';
    }
  };

  return (
    <Animated.View style={styles.container} entering={FadeIn.duration(500)}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>3D Crystal Viewer</Text>
        <View style={styles.viewModeButtons}>
          <TouchableOpacity
            style={[styles.modeButton, viewMode === 'rotate' && styles.modeButtonActive]}
            onPress={() => setViewMode('rotate')}
          >
            <Ionicons name="sync" size={16} color={viewMode === 'rotate' ? adventureColors.obsidian : colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeButton, viewMode === 'cleavage' && styles.modeButtonActive]}
            onPress={() => setViewMode('cleavage')}
          >
            <Ionicons name="cut" size={16} color={viewMode === 'cleavage' ? adventureColors.obsidian : colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeButton, viewMode === 'growth' && styles.modeButtonActive]}
            onPress={() => setViewMode('growth')}
          >
            <Ionicons name="trending-up" size={16} color={viewMode === 'growth' ? adventureColors.obsidian : colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 3D Canvas */}
      <View style={styles.canvasContainer}>
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={adventureColors.amberGlow} />
            <Text style={styles.loadingText}>Loading 3D Model...</Text>
          </View>
        )}
        <Canvas
          style={styles.canvas}
          onCreated={() => setIsLoading(false)}
          camera={{ position: [0, 0, 5], fov: 45 }}
        >
          <Suspense fallback={null}>
            <Scene
              crystalType={crystalType}
              color={color || getDefaultColor()}
              transparency={transparency}
              showGrowthAnimation={showGrowthAnimation}
            />
          </Suspense>
        </Canvas>
      </View>

      {/* Info Panel */}
      <View style={styles.infoPanel}>
        <Text style={styles.crystalName}>{crystalType.charAt(0).toUpperCase() + crystalType.slice(1)}</Text>
        <Text style={styles.crystalInfo}>
          {viewMode === 'rotate' && 'Drag to rotate • Pinch to zoom'}
          {viewMode === 'cleavage' && 'Showing cleavage planes'}
          {viewMode === 'growth' && 'Crystal growth animation'}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 350,
    backgroundColor: 'rgba(10, 10, 12, 0.95)',
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 1,
  },
  viewModeButtons: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  modeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeButtonActive: {
    backgroundColor: adventureColors.amberGlow,
  },
  canvasContainer: {
    flex: 1,
    position: 'relative',
  },
  canvas: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 10, 12, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  loadingText: {
    marginTop: spacing.sm,
    fontSize: 12,
    color: colors.textSecondary,
  },
  infoPanel: {
    padding: spacing.sm,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  crystalName: {
    fontSize: 16,
    fontWeight: '700',
    color: adventureColors.amberGlow,
  },
  crystalInfo: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
});

export default CrystalViewer3D;
