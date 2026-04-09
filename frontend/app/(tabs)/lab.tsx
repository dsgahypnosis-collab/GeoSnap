// GeoSnap Lab - Interactive Geological Laboratory
// The crown jewel: interactive tests, quizzes, and mineral exploration
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { api } from '../../src/utils/api';
import { colors, spacing, typography, borderRadius, shadows } from '../../src/utils/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============ Sub-screen types ============
type LabSection = 'home' | 'mohs' | 'luster' | 'crystal' | 'quiz' | 'mineral';

// ============ Animated Mohs Hardness Tester ============
function MohsHardnessTester({ onBack }: { onBack: () => void }) {
  const [hardness, setHardness] = useState(5);
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [mohsScale, setMohsScale] = useState<any[]>([]);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadMohsScale();
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.15, duration: 150, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
  }, [hardness]);

  const loadMohsScale = async () => {
    try {
      const data = await api.getMohsScale();
      setMohsScale(data.scale || []);
    } catch (e) {
      console.log('Using local mohs data');
    }
  };

  const runTest = async () => {
    setLoading(true);
    try {
      const result = await api.performMohsTest(hardness);
      setTestResult(result);
    } catch (e) {
      console.error('Mohs test error:', e);
    } finally {
      setLoading(false);
    }
  };

  const getHardnessColor = (h: number) => {
    const hueStart = 120;
    const hueEnd = 0;
    const hue = hueStart + ((hueEnd - hueStart) * (h - 1)) / 9;
    return `hsl(${hue}, 70%, 55%)`;
  };

  return (
    <Animated.View style={[styles.subScreen, { opacity: slideAnim, transform: [{ translateY: slideAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }] }]}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        <Text style={styles.backText}>Lab</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Mohs Hardness Test</Text>
      <Text style={styles.sectionSubtitle}>Determine mineral hardness by scratch resistance</Text>

      {/* Hardness Slider Visualization */}
      <View style={styles.mohsContainer}>
        <View style={styles.mohsTrack}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((val) => (
            <TouchableOpacity
              key={val}
              onPress={() => setHardness(val)}
              style={[
                styles.mohsPoint,
                {
                  backgroundColor: val <= hardness ? getHardnessColor(val) : 'rgba(255,255,255,0.1)',
                  borderColor: val === hardness ? '#FFF' : 'transparent',
                },
              ]}
            >
              <Text style={[styles.mohsPointText, val === hardness && styles.mohsPointTextActive]}>{val}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Animated.View style={[styles.selectedMineralCard, { transform: [{ scale: pulseAnim }] }]}>
          <LinearGradient
            colors={[getHardnessColor(hardness), 'rgba(0,0,0,0.5)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.mineralGradient}
          >
            <Text style={styles.mineralName}>
              {hardness === 1 ? 'Talc' : hardness === 2 ? 'Gypsum' : hardness === 3 ? 'Calcite' :
               hardness === 4 ? 'Fluorite' : hardness === 5 ? 'Apatite' : hardness === 6 ? 'Orthoclase' :
               hardness === 7 ? 'Quartz' : hardness === 8 ? 'Topaz' : hardness === 9 ? 'Corundum' : 'Diamond'}
            </Text>
            <Text style={styles.mineralHardness}>Hardness: {hardness}</Text>
          </LinearGradient>
        </Animated.View>

        {/* Common object reference */}
        <View style={styles.referenceRow}>
          {[
            { icon: 'hand-left', label: 'Fingernail', value: '2.5' },
            { icon: 'ellipse', label: 'Copper Coin', value: '3.5' },
            { icon: 'cut', label: 'Steel Knife', value: '5.5' },
            { icon: 'apps', label: 'Glass', value: '5.5' },
          ].map((ref, idx) => (
            <View key={idx} style={[styles.referenceItem, parseFloat(ref.value) <= hardness && styles.referenceItemActive]}>
              <Ionicons name={ref.icon as any} size={18} color={parseFloat(ref.value) <= hardness ? colors.emeraldGreen : colors.textTertiary} />
              <Text style={[styles.referenceLabel, parseFloat(ref.value) <= hardness && { color: colors.emeraldGreen }]}>{ref.label}</Text>
              <Text style={styles.referenceValue}>{ref.value}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.testButton} onPress={runTest} disabled={loading}>
          <LinearGradient colors={[colors.magmaAmber, '#FF8C42']} style={styles.testButtonGrad}>
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Ionicons name="flask" size={22} color="#FFF" />
                <Text style={styles.testButtonText}>Run Hardness Test</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {testResult && (
          <Animated.View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Test Results</Text>
            <View style={styles.resultRow}>
              <Ionicons name="analytics" size={18} color={colors.crystalTeal} />
              <Text style={styles.resultText}>Estimated Hardness: {testResult.estimated_hardness}</Text>
            </View>
            {testResult.nearest_mineral && (
              <View style={styles.resultRow}>
                <Ionicons name="diamond" size={18} color={colors.specimenGold} />
                <Text style={styles.resultText}>Nearest: {testResult.nearest_mineral.mineral}</Text>
              </View>
            )}
            {testResult.common_objects?.map((obj: string, idx: number) => (
              <View key={idx} style={styles.resultRow}>
                <Ionicons name="checkmark-circle" size={16} color={colors.emeraldGreen} />
                <Text style={styles.resultTextSmall}>{obj}</Text>
              </View>
            ))}
            <View style={styles.xpBadge}>
              <Ionicons name="star" size={14} color={colors.specimenGold} />
              <Text style={styles.xpText}>+{testResult.xp_earned} XP</Text>
            </View>
          </Animated.View>
        )}
      </View>
    </Animated.View>
  );
}

// ============ Luster Identifier ============
function LusterIdentifier({ onBack }: { onBack: () => void }) {
  const [lusterTypes, setLusterTypes] = useState<any[]>([]);
  const [selectedLuster, setSelectedLuster] = useState<any>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadLusterTypes();
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  const loadLusterTypes = async () => {
    try {
      const data = await api.getLusterTypes();
      setLusterTypes(data.types || []);
    } catch (e) {
      setLusterTypes([
        { type: 'Vitreous', description: 'Glass-like, bright', icon: 'sparkles', example: 'Quartz', color: '#00BCD4' },
        { type: 'Metallic', description: 'Shiny like metal', icon: 'hardware-chip', example: 'Pyrite', color: '#FFD700' },
        { type: 'Pearly', description: 'Soft, iridescent', icon: 'moon', example: 'Muscovite', color: '#E8EAF6' },
        { type: 'Silky', description: 'Smooth sheen', icon: 'water', example: "Tiger's eye", color: '#FFF3E0' },
        { type: 'Waxy', description: 'Like candle wax', icon: 'flame', example: 'Jade', color: '#A5D6A7' },
        { type: 'Earthy', description: 'Matte, no shine', icon: 'earth', example: 'Kaolinite', color: '#8D6E63' },
      ]);
    }
  };

  return (
    <Animated.View style={[styles.subScreen, { opacity: fadeAnim }]}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        <Text style={styles.backText}>Lab</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Luster Analysis</Text>
      <Text style={styles.sectionSubtitle}>How does light interact with the mineral surface?</Text>

      <View style={styles.lusterGrid}>
        {lusterTypes.map((luster, idx) => (
          <TouchableOpacity
            key={idx}
            style={[
              styles.lusterCard,
              selectedLuster?.type === luster.type && { borderColor: luster.color, borderWidth: 2 },
            ]}
            onPress={() => setSelectedLuster(luster)}
          >
            <View style={[styles.lusterIconBg, { backgroundColor: luster.color + '30' }]}>
              <Ionicons name={(luster.icon || 'sparkles') as any} size={26} color={luster.color} />
            </View>
            <Text style={styles.lusterName}>{luster.type}</Text>
            <Text style={styles.lusterDesc} numberOfLines={2}>{luster.description}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {selectedLuster && (
        <View style={[styles.detailPanel, { borderLeftColor: selectedLuster.color }]}>
          <Text style={styles.detailTitle}>{selectedLuster.type} Luster</Text>
          <Text style={styles.detailDesc}>{selectedLuster.description}</Text>
          <View style={styles.detailRow}>
            <Ionicons name="cube" size={16} color={colors.crystalTeal} />
            <Text style={styles.detailExample}>Examples: {selectedLuster.example}</Text>
          </View>
        </View>
      )}
    </Animated.View>
  );
}

// ============ Crystal System Explorer ============
function CrystalSystemExplorer({ onBack }: { onBack: () => void }) {
  const [systems, setSystems] = useState<any[]>([]);
  const [selectedSystem, setSelectedSystem] = useState<any>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadSystems();
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  const loadSystems = async () => {
    try {
      const data = await api.getCrystalSystems();
      setSystems(data.systems || []);
    } catch (e) {
      setSystems([
        { system: 'Cubic', axes: '3 equal at 90°', example: 'Diamond, Pyrite', color: '#FFD700' },
        { system: 'Hexagonal', axes: '3+1 axis', example: 'Quartz, Beryl', color: '#9C27B0' },
        { system: 'Tetragonal', axes: '2+1 at 90°', example: 'Zircon, Rutile', color: '#00BCD4' },
        { system: 'Orthorhombic', axes: '3 different at 90°', example: 'Topaz, Olivine', color: '#4CAF50' },
        { system: 'Monoclinic', axes: '3 diff, 1 oblique', example: 'Gypsum, Orthoclase', color: '#FF5722' },
        { system: 'Triclinic', axes: '3 diff, no 90°', example: 'Plagioclase', color: '#E91E63' },
      ]);
    }
  };

  const getCrystalShape = (system: string) => {
    switch (system) {
      case 'Cubic': return '⬡';
      case 'Hexagonal': return '⎔';
      case 'Tetragonal': return '▮';
      case 'Orthorhombic': return '▬';
      case 'Monoclinic': return '◇';
      case 'Triclinic': return '◈';
      default: return '◆';
    }
  };

  return (
    <Animated.View style={[styles.subScreen, { opacity: fadeAnim }]}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        <Text style={styles.backText}>Lab</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Crystal Systems</Text>
      <Text style={styles.sectionSubtitle}>The 6 fundamental crystal symmetry groups</Text>

      {systems.map((sys, idx) => (
        <TouchableOpacity
          key={idx}
          style={[styles.crystalRow, selectedSystem?.system === sys.system && { borderLeftColor: sys.color, borderLeftWidth: 3 }]}
          onPress={() => setSelectedSystem(selectedSystem?.system === sys.system ? null : sys)}
        >
          <View style={styles.crystalRowLeft}>
            <View style={[styles.crystalIcon, { backgroundColor: sys.color + '25' }]}>
              <Text style={[styles.crystalShape, { color: sys.color }]}>{getCrystalShape(sys.system)}</Text>
            </View>
            <View style={styles.crystalInfo}>
              <Text style={styles.crystalName}>{sys.system}</Text>
              <Text style={styles.crystalAxes}>{sys.axes}</Text>
            </View>
          </View>
          <Ionicons name={selectedSystem?.system === sys.system ? 'chevron-up' : 'chevron-down'} size={20} color={colors.textTertiary} />
        </TouchableOpacity>
      ))}

      {selectedSystem && (
        <View style={[styles.crystalDetailCard, { borderTopColor: selectedSystem.color }]}>
          <Text style={styles.crystalDetailTitle}>{selectedSystem.system} System</Text>
          <View style={styles.crystalDetailRow}>
            <Text style={styles.crystalDetailLabel}>Axes:</Text>
            <Text style={styles.crystalDetailValue}>{selectedSystem.axes}</Text>
          </View>
          <View style={styles.crystalDetailRow}>
            <Text style={styles.crystalDetailLabel}>Examples:</Text>
            <Text style={styles.crystalDetailValue}>{selectedSystem.example}</Text>
          </View>
        </View>
      )}
    </Animated.View>
  );
}

// ============ Rock Quiz / Real or Rogue ============
function RockQuiz({ onBack }: { onBack: () => void }) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [result, setResult] = useState<any>(null);
  const [score, setScore] = useState(0);
  const [totalXP, setTotalXP] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadQuestions();
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  const loadQuestions = async (cat?: string | null) => {
    setLoading(true);
    setCurrentIndex(0);
    setScore(0);
    setTotalXP(0);
    setQuizComplete(false);
    setSelectedAnswer(null);
    setResult(null);
    try {
      const data = await api.getQuizQuestions(5, cat || undefined);
      setQuestions(data.questions || []);
    } catch (e) {
      console.error('Quiz load error:', e);
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async (answerIndex: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(answerIndex);

    try {
      const question = questions[currentIndex];
      const res = await api.submitQuizAnswer(question.id, answerIndex);
      setResult(res);
      if (res.correct) {
        setScore(score + 1);
        setTotalXP(totalXP + (res.xp_earned || 0));
        Animated.sequence([
          Animated.timing(cardAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
          Animated.timing(cardAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]).start();
      } else {
        Animated.sequence([
          Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 5, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
        ]).start();
      }
    } catch (e) {
      console.error('Submit error:', e);
    }
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setResult(null);
    } else {
      setQuizComplete(true);
    }
  };

  const categories = [
    { id: null, label: 'All', icon: 'shuffle', color: colors.magmaAmber },
    { id: 'identification', label: 'ID', icon: 'search', color: colors.crystalTeal },
    { id: 'properties', label: 'Props', icon: 'flask', color: colors.amethystPurple },
    { id: 'geology', label: 'Geo', icon: 'earth', color: colors.emeraldGreen },
    { id: 'real_or_rogue', label: 'T/F', icon: 'help-circle', color: colors.specimenGold },
  ];

  if (loading) {
    return (
      <Animated.View style={[styles.subScreen, { opacity: fadeAnim }]}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          <Text style={styles.backText}>Lab</Text>
        </TouchableOpacity>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.magmaAmber} />
          <Text style={styles.loadingText}>Preparing your quiz...</Text>
        </View>
      </Animated.View>
    );
  }

  if (quizComplete) {
    const percentage = Math.round((score / questions.length) * 100);
    const grade = percentage >= 80 ? 'A' : percentage >= 60 ? 'B' : percentage >= 40 ? 'C' : 'D';
    const gradeColor = percentage >= 80 ? colors.emeraldGreen : percentage >= 60 ? colors.specimenGold : percentage >= 40 ? colors.magmaAmber : colors.rubyRed;

    return (
      <Animated.View style={[styles.subScreen, { opacity: fadeAnim }]}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          <Text style={styles.backText}>Lab</Text>
        </TouchableOpacity>

        <View style={styles.quizCompleteContainer}>
          <View style={[styles.gradeCircle, { borderColor: gradeColor }]}>
            <Text style={[styles.gradeText, { color: gradeColor }]}>{grade}</Text>
          </View>
          <Text style={styles.quizCompleteTitle}>Quiz Complete!</Text>
          <Text style={styles.quizCompleteScore}>{score}/{questions.length} correct ({percentage}%)</Text>
          <View style={styles.xpBadgeLarge}>
            <Ionicons name="star" size={20} color={colors.specimenGold} />
            <Text style={styles.xpTextLarge}>+{totalXP} XP Earned</Text>
          </View>
          <TouchableOpacity style={styles.retryButton} onPress={() => loadQuestions(category)}>
            <LinearGradient colors={[colors.magmaAmber, '#FF8C42']} style={styles.retryGradient}>
              <Ionicons name="refresh" size={20} color="#FFF" />
              <Text style={styles.retryText}>Try Again</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  }

  const question = questions[currentIndex];
  if (!question) return null;

  return (
    <Animated.View style={[styles.subScreen, { opacity: fadeAnim }]}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        <Text style={styles.backText}>Lab</Text>
      </TouchableOpacity>

      {/* Category filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryRow}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id || 'all'}
            style={[styles.categoryPill, category === cat.id && { backgroundColor: cat.color + '30', borderColor: cat.color }]}
            onPress={() => { setCategory(cat.id); loadQuestions(cat.id); }}
          >
            <Ionicons name={cat.icon as any} size={14} color={category === cat.id ? cat.color : colors.textTertiary} />
            <Text style={[styles.categoryPillText, category === cat.id && { color: cat.color }]}>{cat.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Progress */}
      <View style={styles.quizProgress}>
        <View style={styles.quizProgressBar}>
          <View style={[styles.quizProgressFill, { width: `${((currentIndex + 1) / questions.length) * 100}%` }]} />
        </View>
        <Text style={styles.quizProgressText}>{currentIndex + 1}/{questions.length}</Text>
      </View>

      {/* Question Card */}
      <Animated.View style={[styles.questionCard, { transform: [{ translateX: shakeAnim }] }]}>
        <View style={styles.difficultyBadge}>
          <Text style={[styles.difficultyText, {
            color: question.difficulty === 'easy' ? colors.emeraldGreen : question.difficulty === 'medium' ? colors.specimenGold : colors.rubyRed,
          }]}>
            {question.difficulty?.toUpperCase()}
          </Text>
          <Text style={styles.xpPreview}>+{question.xp} XP</Text>
        </View>

        <Text style={styles.questionText}>{question.question}</Text>

        {question.options?.map((option: string, idx: number) => {
          let optionStyle = styles.optionButton;
          let textStyle = styles.optionText;
          if (selectedAnswer !== null) {
            if (idx === question.correct) {
              optionStyle = { ...styles.optionButton, ...styles.optionCorrect };
              textStyle = { ...styles.optionText, color: '#FFF' };
            } else if (idx === selectedAnswer && !result?.correct) {
              optionStyle = { ...styles.optionButton, ...styles.optionWrong };
              textStyle = { ...styles.optionText, color: '#FFF' };
            }
          }

          return (
            <TouchableOpacity
              key={idx}
              style={optionStyle}
              onPress={() => submitAnswer(idx)}
              disabled={selectedAnswer !== null}
            >
              <View style={styles.optionLetter}>
                <Text style={styles.optionLetterText}>{String.fromCharCode(65 + idx)}</Text>
              </View>
              <Text style={textStyle}>{option}</Text>
              {selectedAnswer !== null && idx === question.correct && (
                <Ionicons name="checkmark-circle" size={20} color={colors.emeraldGreen} style={{ marginLeft: 'auto' }} />
              )}
            </TouchableOpacity>
          );
        })}

        {result && (
          <View style={styles.explanationBox}>
            <Ionicons name="bulb" size={18} color={colors.specimenGold} />
            <Text style={styles.explanationText}>{result.explanation}</Text>
          </View>
        )}

        {selectedAnswer !== null && (
          <TouchableOpacity style={styles.nextButton} onPress={nextQuestion}>
            <Text style={styles.nextButtonText}>
              {currentIndex < questions.length - 1 ? 'Next Question' : 'See Results'}
            </Text>
            <Ionicons name="arrow-forward" size={18} color="#FFF" />
          </TouchableOpacity>
        )}
      </Animated.View>

      {/* Score display */}
      <View style={styles.scoreRow}>
        <View style={styles.scoreItem}>
          <Ionicons name="checkmark-circle" size={18} color={colors.emeraldGreen} />
          <Text style={styles.scoreValue}>{score}</Text>
        </View>
        <View style={styles.scoreItem}>
          <Ionicons name="star" size={18} color={colors.specimenGold} />
          <Text style={styles.scoreValue}>{totalXP} XP</Text>
        </View>
      </View>
    </Animated.View>
  );
}

// ============ Mineral of the Day ============
function MineralOfTheDay({ onBack }: { onBack: () => void }) {
  const [mineral, setMineral] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    loadMineral();
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();
  }, []);

  const loadMineral = async () => {
    try {
      const data = await api.getMineralOfTheDay();
      setMineral(data.mineral);
    } catch (e) {
      setMineral({
        name: 'Quartz', formula: 'SiO₂', hardness: 7, system: 'Hexagonal',
        fun_fact: 'Quartz makes up about 12% of Earth\'s crust and comes in over 20 varieties!',
        color: '#F5F5F5', icon: 'diamond', rarity: 'common',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.subScreen}>
        <ActivityIndicator size="large" color={colors.magmaAmber} />
      </View>
    );
  }

  return (
    <Animated.View style={[styles.subScreen, { opacity: fadeAnim }]}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        <Text style={styles.backText}>Lab</Text>
      </TouchableOpacity>

      <Animated.View style={[styles.mineralDayCard, { transform: [{ scale: scaleAnim }] }]}>
        <LinearGradient
          colors={[mineral?.color || colors.magmaAmber, colors.caveShadow]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.mineralDayGradient}
        >
          <Text style={styles.mineralDayBadge}>MINERAL OF THE DAY</Text>
          <Ionicons name={(mineral?.icon || 'diamond') as any} size={60} color="#FFF" style={{ opacity: 0.9 }} />
          <Text style={styles.mineralDayName}>{mineral?.name}</Text>
          <Text style={styles.mineralDayFormula}>{mineral?.formula}</Text>
        </LinearGradient>

        <View style={styles.mineralDayDetails}>
          <View style={styles.mineralDayRow}>
            <View style={styles.mineralDayStat}>
              <Text style={styles.mineralDayStatLabel}>Hardness</Text>
              <Text style={styles.mineralDayStatValue}>{mineral?.hardness}</Text>
            </View>
            <View style={styles.mineralDayStat}>
              <Text style={styles.mineralDayStatLabel}>System</Text>
              <Text style={styles.mineralDayStatValue}>{mineral?.system}</Text>
            </View>
            <View style={styles.mineralDayStat}>
              <Text style={styles.mineralDayStatLabel}>Rarity</Text>
              <Text style={[styles.mineralDayStatValue, {
                color: mineral?.rarity === 'rare' ? colors.amethystPurple : mineral?.rarity === 'uncommon' ? colors.crystalTeal : colors.emeraldGreen,
              }]}>{mineral?.rarity?.toUpperCase()}</Text>
            </View>
          </View>

          <View style={styles.funFactBox}>
            <Ionicons name="bulb" size={20} color={colors.specimenGold} />
            <Text style={styles.funFactText}>{mineral?.fun_fact}</Text>
          </View>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

// ============ Main Lab Home ============
export default function LabScreen() {
  const insets = useSafeAreaInsets();
  const [section, setSection] = useState<LabSection>('home');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  const goHome = useCallback(() => setSection('home'), []);

  if (section === 'mohs') return <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}><MohsHardnessTester onBack={goHome} /></ScrollView>;
  if (section === 'luster') return <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}><LusterIdentifier onBack={goHome} /></ScrollView>;
  if (section === 'crystal') return <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}><CrystalSystemExplorer onBack={goHome} /></ScrollView>;
  if (section === 'quiz') return <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}><RockQuiz onBack={goHome} /></ScrollView>;
  if (section === 'mineral') return <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}><MineralOfTheDay onBack={goHome} /></ScrollView>;

  const labTools = [
    {
      id: 'mohs' as LabSection,
      title: 'Mohs Hardness',
      subtitle: 'Scratch resistance test',
      icon: 'hammer',
      color: colors.magmaAmber,
      gradient: ['#FF6B35', '#FF8C42'] as [string, string],
    },
    {
      id: 'luster' as LabSection,
      title: 'Luster Analysis',
      subtitle: 'Light interaction study',
      icon: 'sunny',
      color: colors.specimenGold,
      gradient: ['#D4AF37', '#F0D060'] as [string, string],
    },
    {
      id: 'crystal' as LabSection,
      title: 'Crystal Systems',
      subtitle: '6 symmetry groups',
      icon: 'prism',
      color: colors.amethystPurple,
      gradient: ['#8B5CF6', '#A78BFA'] as [string, string],
    },
    {
      id: 'quiz' as LabSection,
      title: 'Rock Quiz',
      subtitle: 'Test your knowledge',
      icon: 'help-circle',
      color: colors.crystalTeal,
      gradient: ['#00B4D8', '#48CAE4'] as [string, string],
    },
    {
      id: 'mineral' as LabSection,
      title: 'Daily Mineral',
      subtitle: 'Featured specimen',
      icon: 'diamond',
      color: colors.emeraldGreen,
      gradient: ['#10B981', '#34D399'] as [string, string],
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.homeScroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <View>
            <Text style={styles.headerTitle}>Geo Lab</Text>
            <Text style={styles.headerSubtitle}>Interactive geological analysis tools</Text>
          </View>
          <View style={styles.headerIcon}>
            <Ionicons name="flask" size={28} color={colors.magmaAmber} />
          </View>
        </Animated.View>

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <View style={styles.quickStatItem}>
            <Ionicons name="flask" size={20} color={colors.crystalTeal} />
            <Text style={styles.quickStatValue}>5</Text>
            <Text style={styles.quickStatLabel}>Tools</Text>
          </View>
          <View style={styles.quickStatDivider} />
          <View style={styles.quickStatItem}>
            <Ionicons name="help-circle" size={20} color={colors.amethystPurple} />
            <Text style={styles.quickStatValue}>15+</Text>
            <Text style={styles.quickStatLabel}>Questions</Text>
          </View>
          <View style={styles.quickStatDivider} />
          <View style={styles.quickStatItem}>
            <Ionicons name="diamond" size={20} color={colors.specimenGold} />
            <Text style={styles.quickStatValue}>10</Text>
            <Text style={styles.quickStatLabel}>Minerals</Text>
          </View>
        </View>

        {/* Lab Tools Grid */}
        <Text style={styles.sectionHeader}>Lab Tools</Text>
        <View style={styles.toolsGrid}>
          {labTools.map((tool, idx) => (
            <TouchableOpacity
              key={tool.id}
              style={styles.toolCard}
              onPress={() => setSection(tool.id)}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={tool.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.toolCardGradient}
              >
                <View style={styles.toolCardIcon}>
                  <Ionicons name={tool.icon as any} size={30} color="#FFF" />
                </View>
                <Text style={styles.toolCardTitle}>{tool.title}</Text>
                <Text style={styles.toolCardSubtitle}>{tool.subtitle}</Text>
                <View style={styles.toolCardArrow}>
                  <Ionicons name="arrow-forward" size={16} color="rgba(255,255,255,0.7)" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* Pro Tip */}
        <View style={styles.proTipCard}>
          <View style={styles.proTipHeader}>
            <Ionicons name="bulb" size={20} color={colors.specimenGold} />
            <Text style={styles.proTipTitle}>Geologist's Tip</Text>
          </View>
          <Text style={styles.proTipText}>
            The streak test is often more diagnostic than color. Many minerals have deceptive surface colors 
            but always produce the same streak color when rubbed on unglazed porcelain.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

// ============ Styles ============
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.obsidian,
  },
  homeScroll: {
    padding: spacing.md,
    paddingBottom: 120,
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
  },
  headerTitle: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  headerSubtitle: {
    ...typography.bodySmall,
    color: colors.textTertiary,
    marginTop: 2,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 107, 53, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Quick Stats
  quickStats: {
    flexDirection: 'row',
    backgroundColor: colors.glassPanel,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  quickStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  quickStatValue: {
    ...typography.h3,
    color: colors.textPrimary,
    marginTop: 4,
  },
  quickStatLabel: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  quickStatDivider: {
    width: 1,
    height: 36,
    backgroundColor: colors.glassBorder,
  },
  // Section Header
  sectionHeader: {
    ...typography.label,
    color: colors.textTertiary,
    marginBottom: spacing.md,
  },
  // Tools Grid
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
    justifyContent: 'space-between',
  },
  toolCard: {
    width: '47%',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.md,
    marginBottom: spacing.xs,
  },
  toolCardGradient: {
    padding: spacing.md,
    minHeight: 140,
    justifyContent: 'space-between',
  },
  toolCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  toolCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  toolCardSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  toolCardArrow: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
  },
  // Pro Tip
  proTipCard: {
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  proTipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.sm,
  },
  proTipTitle: {
    ...typography.bodySmall,
    color: colors.specimenGold,
    fontWeight: '600',
  },
  proTipText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  // Sub-screens
  subScreen: {
    padding: spacing.md,
    paddingTop: spacing.lg + 50,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    position: 'absolute',
    top: spacing.md + 44,
    left: spacing.md,
    zIndex: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.glassPanel,
    borderRadius: borderRadius.md,
  },
  backText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: 4,
    marginTop: spacing.xl,
  },
  sectionSubtitle: {
    ...typography.bodySmall,
    color: colors.textTertiary,
    marginBottom: spacing.lg,
  },
  // Mohs
  mohsContainer: {
    gap: spacing.lg,
  },
  mohsTrack: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  mohsPoint: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  mohsPointText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textTertiary,
  },
  mohsPointTextActive: {
    color: '#FFF',
  },
  selectedMineralCard: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.lg,
  },
  mineralGradient: {
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  mineralName: {
    ...typography.h2,
    color: '#FFF',
  },
  mineralHardness: {
    ...typography.bodySmall,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  referenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.glassPanel,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  referenceItem: {
    alignItems: 'center',
    gap: 4,
    opacity: 0.5,
  },
  referenceItemActive: {
    opacity: 1,
  },
  referenceLabel: {
    fontSize: 10,
    color: colors.textTertiary,
    fontWeight: '600',
  },
  referenceValue: {
    fontSize: 10,
    color: colors.textMuted,
  },
  testButton: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  testButtonGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  testButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
  resultCard: {
    backgroundColor: colors.glassPanel,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  resultTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resultText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  resultTextSmall: {
    ...typography.bodySmall,
    color: colors.textTertiary,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  xpText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.specimenGold,
  },
  // Luster
  lusterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    justifyContent: 'space-between',
  },
  lusterCard: {
    width: '31%',
    backgroundColor: colors.glassPanel,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    minHeight: 110,
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  lusterIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  lusterName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  lusterDesc: {
    fontSize: 9,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: 2,
  },
  detailPanel: {
    backgroundColor: colors.glassPanel,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderLeftWidth: 4,
    gap: spacing.sm,
  },
  detailTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  detailDesc: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailExample: {
    ...typography.bodySmall,
    color: colors.crystalTeal,
  },
  // Crystal Systems
  crystalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.glassPanel,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderLeftWidth: 0,
    borderColor: 'transparent',
  },
  crystalRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  crystalIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crystalShape: {
    fontSize: 22,
    fontWeight: '700',
  },
  crystalInfo: {},
  crystalName: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  crystalAxes: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  crystalDetailCard: {
    backgroundColor: colors.glassPanel,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
    borderTopWidth: 3,
    gap: spacing.sm,
  },
  crystalDetailTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  crystalDetailRow: {
    flexDirection: 'row',
    gap: 8,
  },
  crystalDetailLabel: {
    ...typography.bodySmall,
    color: colors.textTertiary,
    fontWeight: '600',
    width: 70,
  },
  crystalDetailValue: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flex: 1,
  },
  // Quiz
  categoryRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    maxHeight: 40,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    marginRight: 8,
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textTertiary,
  },
  quizProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  quizProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  quizProgressFill: {
    height: '100%',
    backgroundColor: colors.magmaAmber,
    borderRadius: 3,
  },
  quizProgressText: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  questionCard: {
    backgroundColor: colors.glassPanel,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  difficultyBadge: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  xpPreview: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.specimenGold,
  },
  questionText: {
    ...typography.h3,
    color: colors.textPrimary,
    lineHeight: 28,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  optionCorrect: {
    backgroundColor: 'rgba(16, 185, 129, 0.25)',
    borderColor: colors.emeraldGreen,
  },
  optionWrong: {
    backgroundColor: 'rgba(239, 68, 68, 0.25)',
    borderColor: colors.rubyRed,
  },
  optionLetter: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLetterText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  optionText: {
    ...typography.body,
    color: colors.textSecondary,
    flex: 1,
  },
  explanationBox: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.specimenGold,
  },
  explanationText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.magmaAmber,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  nextButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 15,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xl,
  },
  scoreItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  scoreValue: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  // Quiz Complete
  quizCompleteContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
    gap: spacing.md,
  },
  gradeCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  gradeText: {
    fontSize: 42,
    fontWeight: '800',
  },
  quizCompleteTitle: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  quizCompleteScore: {
    ...typography.body,
    color: colors.textSecondary,
  },
  xpBadgeLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: borderRadius.full,
  },
  xpTextLarge: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.specimenGold,
  },
  retryButton: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    marginTop: spacing.md,
  },
  retryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: borderRadius.md,
  },
  retryText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
  // Mineral of the Day
  mineralDayCard: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.lg,
    marginTop: spacing.md,
  },
  mineralDayGradient: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
    gap: spacing.sm,
  },
  mineralDayBadge: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: spacing.sm,
  },
  mineralDayName: {
    ...typography.h1,
    color: '#FFF',
    marginTop: spacing.sm,
  },
  mineralDayFormula: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.7)',
  },
  mineralDayDetails: {
    backgroundColor: colors.glassPanel,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  mineralDayRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  mineralDayStat: {
    alignItems: 'center',
    gap: 4,
  },
  mineralDayStatLabel: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  mineralDayStatValue: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  funFactBox: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  funFactText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 22,
  },
  // Loading
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    gap: spacing.md,
  },
  loadingText: {
    ...typography.body,
    color: colors.textTertiary,
  },
});
