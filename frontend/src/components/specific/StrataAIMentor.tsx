// StrataAIMentor.tsx - Enhanced Conversational AI Geological Mentor
// Adaptive guidance, storytelling, and scientific accuracy
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Dimensions,
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
  SlideInRight,
  SlideInLeft,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { adventureColors } from '../../utils/adventureTheme';
import { colors, spacing, borderRadius, typography } from '../../utils/theme';
import { api } from '../../utils/api';

const { width } = Dimensions.get('window');

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

interface StrataAIMentorProps {
  onClose?: () => void;
  initialContext?: string; // e.g., specimen being viewed
  mode?: 'full' | 'compact';
}

// Quick suggestion chips
const QUICK_SUGGESTIONS = [
  { icon: '🔍', text: 'How do I identify this?', category: 'identify' },
  { icon: '💎', text: 'What makes crystals form?', category: 'learn' },
  { icon: '🧪', text: 'Guide me through hardness test', category: 'test' },
  { icon: '🌋', text: 'Tell me about volcanoes', category: 'learn' },
  { icon: '⏳', text: 'How old is this rock?', category: 'age' },
  { icon: '💰', text: 'Is this valuable?', category: 'value' },
];

// Animated typing indicator
const TypingIndicator = () => {
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);

  useEffect(() => {
    dot1.value = withRepeat(withSequence(
      withTiming(1, { duration: 300 }),
      withTiming(0, { duration: 300 })
    ), -1, false);
    
    setTimeout(() => {
      dot2.value = withRepeat(withSequence(
        withTiming(1, { duration: 300 }),
        withTiming(0, { duration: 300 })
      ), -1, false);
    }, 150);
    
    setTimeout(() => {
      dot3.value = withRepeat(withSequence(
        withTiming(1, { duration: 300 }),
        withTiming(0, { duration: 300 })
      ), -1, false);
    }, 300);
  }, []);

  const dot1Style = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(dot1.value, [0, 1], [0, -6]) }],
    opacity: interpolate(dot1.value, [0, 1], [0.4, 1]),
  }));

  const dot2Style = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(dot2.value, [0, 1], [0, -6]) }],
    opacity: interpolate(dot2.value, [0, 1], [0.4, 1]),
  }));

  const dot3Style = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(dot3.value, [0, 1], [0, -6]) }],
    opacity: interpolate(dot3.value, [0, 1], [0.4, 1]),
  }));

  return (
    <View style={styles.typingIndicator}>
      <Animated.View style={[styles.typingDot, dot1Style]} />
      <Animated.View style={[styles.typingDot, dot2Style]} />
      <Animated.View style={[styles.typingDot, dot3Style]} />
    </View>
  );
};

// Message bubble component
const MessageBubble = ({ 
  message, 
  isLatest 
}: { 
  message: Message;
  isLatest: boolean;
}) => {
  const isUser = message.role === 'user';

  return (
    <Animated.View
      style={[
        styles.messageBubble,
        isUser ? styles.userBubble : styles.assistantBubble,
      ]}
      entering={isUser ? SlideInRight.duration(300) : SlideInLeft.duration(300)}
    >
      {!isUser && (
        <View style={styles.assistantAvatar}>
          <LinearGradient
            colors={[adventureColors.amberGlow, adventureColors.treasureGold]}
            style={styles.avatarGradient}
          >
            <Ionicons name="sparkles" size={16} color={adventureColors.obsidian} />
          </LinearGradient>
        </View>
      )}
      
      <View style={[styles.messageContent, isUser && styles.userMessageContent]}>
        {message.isLoading ? (
          <TypingIndicator />
        ) : (
          <Text style={[styles.messageText, isUser && styles.userMessageText]}>
            {message.content}
          </Text>
        )}
        <Text style={styles.messageTime}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </Animated.View>
  );
};

// Quick suggestion chip
const SuggestionChip = ({ 
  suggestion, 
  onPress 
}: { 
  suggestion: typeof QUICK_SUGGESTIONS[0];
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.suggestionChip} onPress={onPress} activeOpacity={0.7}>
    <Text style={styles.suggestionIcon}>{suggestion.icon}</Text>
    <Text style={styles.suggestionText}>{suggestion.text}</Text>
  </TouchableOpacity>
);

export const StrataAIMentor: React.FC<StrataAIMentorProps> = ({
  onClose,
  initialContext,
  mode = 'full',
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `🌋 Greetings, Explorer! I'm Strata, your AI geological mentor.\n\nI can help you:\n• Identify rocks, minerals, and crystals\n• Guide you through physical tests\n• Explain geological processes\n• Tell stories of Earth's deep history\n\nWhat would you like to discover today?`,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  // Add context-aware initial message if provided
  useEffect(() => {
    if (initialContext) {
      const contextMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `I see you're looking at ${initialContext}. Would you like me to tell you more about it, or help you verify the identification?`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, contextMessage]);
    }
  }, [initialContext]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    // Add loading message
    const loadingMessage: Message = {
      id: 'loading',
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true,
    };
    setMessages(prev => [...prev, loadingMessage]);

    try {
      // Call Strata AI API
      const response = await api.askStrata(text.trim());
      
      // Remove loading and add real response
      setMessages(prev => [
        ...prev.filter(m => m.id !== 'loading'),
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: response.answer || response.response || "I'm not sure about that. Could you rephrase your question?",
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error('Strata API error:', error);
      setMessages(prev => [
        ...prev.filter(m => m.id !== 'loading'),
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: "🔧 Oops! I had a brief communication glitch. Please try asking again!",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestion = (suggestion: typeof QUICK_SUGGESTIONS[0]) => {
    sendMessage(suggestion.text);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, mode === 'compact' && styles.containerCompact]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <LinearGradient
            colors={[adventureColors.amberGlow, adventureColors.treasureGold]}
            style={styles.strataIcon}
          >
            <Ionicons name="sparkles" size={20} color={adventureColors.obsidian} />
          </LinearGradient>
          <View>
            <Text style={styles.headerTitle}>Strata AI</Text>
            <Text style={styles.headerSubtitle}>Your Geological Mentor</Text>
          </View>
        </View>
        {onClose && (
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message, index) => (
          <MessageBubble
            key={message.id}
            message={message}
            isLatest={index === messages.length - 1}
          />
        ))}
      </ScrollView>

      {/* Quick suggestions */}
      {messages.length <= 2 && (
        <Animated.View style={styles.suggestions} entering={FadeInUp.delay(300).duration(400)}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {QUICK_SUGGESTIONS.map((suggestion, index) => (
              <SuggestionChip
                key={index}
                suggestion={suggestion}
                onPress={() => handleSuggestion(suggestion)}
              />
            ))}
          </ScrollView>
        </Animated.View>
      )}

      {/* Input area */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask Strata anything..."
            placeholderTextColor={colors.textMuted}
            multiline
            maxLength={500}
            editable={!isLoading}
            onSubmitEditing={() => sendMessage(inputText)}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
            onPress={() => sendMessage(inputText)}
            disabled={!inputText.trim() || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={adventureColors.obsidian} />
            ) : (
              <Ionicons name="send" size={18} color={adventureColors.obsidian} />
            )}
          </TouchableOpacity>
        </View>
        <Text style={styles.disclaimer}>
          Strata provides guidance, not definitive identification. Always verify important findings.
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: adventureColors.obsidian,
  },
  containerCompact: {
    maxHeight: 500,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  strataIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Messages
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
  },
  messageBubble: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    maxWidth: '85%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  assistantBubble: {
    alignSelf: 'flex-start',
  },
  assistantAvatar: {
    marginRight: spacing.sm,
  },
  avatarGradient: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderTopLeftRadius: 4,
  },
  userMessageContent: {
    backgroundColor: adventureColors.amberGlow + '30',
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: 4,
  },
  messageText: {
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  userMessageText: {
    color: colors.textPrimary,
  },
  messageTime: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: spacing.xs,
    alignSelf: 'flex-end',
  },
  // Typing indicator
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: adventureColors.amberGlow,
  },
  // Suggestions
  suggestions: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
    gap: spacing.xs,
  },
  suggestionIcon: {
    fontSize: 14,
  },
  suggestionText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  // Input
  inputContainer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: borderRadius.xl,
    paddingLeft: spacing.md,
    paddingRight: spacing.xs,
    paddingVertical: spacing.xs,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
    maxHeight: 100,
    paddingVertical: spacing.sm,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: adventureColors.amberGlow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.textMuted,
  },
  disclaimer: {
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});

export default StrataAIMentor;
