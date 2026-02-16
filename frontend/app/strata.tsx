// Strata AI Mentor Screen - Context-aware geological reasoning
import React, { useState, useRef } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius, shadows } from '../src/utils/theme';
import { api } from '../src/utils/api';
import { GlassPanel } from '../src/components';

interface Message {
  id: string;
  role: 'user' | 'strata';
  content: string;
  timestamp: Date;
}

const SUGGESTED_QUESTIONS = [
  "How do I identify quartz vs calcite?",
  "What causes metamorphic rocks to form?",
  "How does the Mohs hardness scale work?",
  "What are the main types of igneous rocks?",
  "How can I tell if a rock contains gold?",
];

export default function StrataScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'strata',
      content: "Hello, I'm Strata, your AI geological mentor. I'm here to help you understand rocks, minerals, and geological processes. What would you like to learn about?",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSend = async (text: string = inputText) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      const response = await api.askStrata(text.trim());
      
      const strataMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'strata',
        content: response.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, strataMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'strata',
        content: "I apologize, but I encountered an issue processing your question. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <LinearGradient
            colors={[colors.mineralBlue, colors.basalt]}
            style={styles.avatarGradient}
          >
            <Ionicons name="chatbubble-ellipses" size={18} color={colors.textPrimary} />
          </LinearGradient>
          <View>
            <Text style={styles.headerTitle}>Strata</Text>
            <Text style={styles.headerSubtitle}>AI Geological Mentor</Text>
          </View>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageBubble,
                message.role === 'user' ? styles.userBubble : styles.strataBubble,
              ]}
            >
              {message.role === 'strata' && (
                <View style={styles.strataIcon}>
                  <Ionicons name="diamond" size={12} color={colors.mineralBlue} />
                </View>
              )}
              <Text
                style={[
                  styles.messageText,
                  message.role === 'user' && styles.userMessageText,
                ]}
              >
                {message.content}
              </Text>
            </View>
          ))}

          {isLoading && (
            <View style={[styles.messageBubble, styles.strataBubble]}>
              <View style={styles.strataIcon}>
                <Ionicons name="diamond" size={12} color={colors.mineralBlue} />
              </View>
              <View style={styles.typingIndicator}>
                <ActivityIndicator size="small" color={colors.mineralBlue} />
                <Text style={styles.typingText}>Thinking...</Text>
              </View>
            </View>
          )}

          {/* Suggested Questions (only show at start) */}
          {messages.length === 1 && (
            <View style={styles.suggestionsContainer}>
              <Text style={styles.suggestionsLabel}>SUGGESTED QUESTIONS</Text>
              {SUGGESTED_QUESTIONS.map((question, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionChip}
                  onPress={() => handleSend(question)}
                >
                  <Text style={styles.suggestionText}>{question}</Text>
                  <Ionicons name="arrow-forward" size={14} color={colors.magmaAmber} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputContainer}>
          <GlassPanel style={styles.inputPanel} noPadding>
            <TextInput
              style={styles.input}
              placeholder="Ask about geology..."
              placeholderTextColor={colors.textMuted}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
              editable={!isLoading}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
              ]}
              onPress={() => handleSend()}
              disabled={!inputText.trim() || isLoading}
            >
              <Ionicons
                name="send"
                size={20}
                color={inputText.trim() && !isLoading ? colors.obsidian : colors.textMuted}
              />
            </TouchableOpacity>
          </GlassPanel>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.obsidian,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorder,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.glassPanel,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatarGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  keyboardView: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  messageBubble: {
    maxWidth: '85%',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: colors.magmaAmber,
    borderBottomRightRadius: 4,
  },
  strataBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.glassPanel,
    borderBottomLeftRadius: 4,
  },
  strataIcon: {
    position: 'absolute',
    top: -8,
    left: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.caveShadow,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.obsidian,
  },
  messageText: {
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  userMessageText: {
    color: colors.obsidian,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  typingText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  suggestionsContainer: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  suggestionsLabel: {
    ...typography.label,
    color: colors.textTertiary,
    marginBottom: spacing.xs,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.glassPanel,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  suggestionText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flex: 1,
  },
  inputContainer: {
    padding: spacing.md,
    paddingBottom: Platform.OS === 'ios' ? spacing.lg : spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.glassBorder,
  },
  inputPanel: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.xs,
    paddingLeft: spacing.md,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    maxHeight: 100,
    paddingVertical: spacing.sm,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.magmaAmber,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  sendButtonDisabled: {
    backgroundColor: colors.glassPanel,
  },
});
