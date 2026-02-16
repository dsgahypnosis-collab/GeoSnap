// Field Notebook Screen - Professional geological logbook
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { colors, typography, spacing, borderRadius, shadows } from '../../src/utils/theme';
import { useAppStore } from '../../src/stores/appStore';
import { GlassPanel, ObsidianButton } from '../../src/components';
import { FieldNote } from '../../src/types';

export default function NotebookScreen() {
  const { fieldNotes, fetchFieldNotes, createFieldNote, deleteFieldNote } = useAppStore();
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    tags: [] as string[],
  });
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    fetchFieldNotes();
    getLocation();
  }, []);

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
      }
    } catch (e) {
      console.log('Location error:', e);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFieldNotes();
    setRefreshing(false);
  };

  const handleCreateNote = async () => {
    if (!newNote.title.trim() || !newNote.content.trim()) {
      Alert.alert('Missing Information', 'Please add a title and content for your note');
      return;
    }

    try {
      await createFieldNote({
        title: newNote.title,
        content: newNote.content,
        latitude: location?.latitude,
        longitude: location?.longitude,
        images_base64: [],
        specimen_ids: [],
        tags: newNote.tags,
      });
      setModalVisible(false);
      setNewNote({ title: '', content: '', tags: [] });
    } catch (error) {
      Alert.alert('Error', 'Failed to create field note');
    }
  };

  const handleDeleteNote = (noteId: string, noteTitle: string) => {
    Alert.alert(
      'Delete Note',
      `Are you sure you want to delete "${noteTitle}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteFieldNote(noteId),
        },
      ]
    );
  };

  const addTag = () => {
    if (tagInput.trim() && !newNote.tags.includes(tagInput.trim())) {
      setNewNote({ ...newNote, tags: [...newNote.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setNewNote({ ...newNote, tags: newNote.tags.filter((t) => t !== tag) });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Field Notebook</Text>
          <Text style={styles.subtitle}>
            {fieldNotes.length} entr{fieldNotes.length !== 1 ? 'ies' : 'y'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={24} color={colors.obsidian} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.magmaAmber}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {fieldNotes.length > 0 ? (
          fieldNotes.map((note) => (
            <TouchableOpacity
              key={note.id}
              activeOpacity={0.8}
              onLongPress={() => handleDeleteNote(note.id, note.title)}
            >
              <GlassPanel style={styles.noteCard}>
                <View style={styles.noteHeader}>
                  <Text style={styles.noteTitle}>{note.title}</Text>
                  <Text style={styles.noteDate}>{formatDate(note.created_at)}</Text>
                </View>
                <Text style={styles.noteContent} numberOfLines={3}>
                  {note.content}
                </Text>
                {note.tags.length > 0 && (
                  <View style={styles.tagsRow}>
                    {note.tags.map((tag) => (
                      <View key={tag} style={styles.tag}>
                        <Text style={styles.tagText}>#{tag}</Text>
                      </View>
                    ))}
                  </View>
                )}
                {note.latitude && note.longitude && (
                  <View style={styles.locationRow}>
                    <Ionicons name="location" size={12} color={colors.textMuted} />
                    <Text style={styles.locationText}>
                      {note.latitude.toFixed(4)}, {note.longitude.toFixed(4)}
                    </Text>
                  </View>
                )}
              </GlassPanel>
            </TouchableOpacity>
          ))
        ) : (
          <GlassPanel style={styles.emptyState}>
            <Ionicons name="book-outline" size={64} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No Field Notes Yet</Text>
            <Text style={styles.emptyText}>
              Document your geological findings, observations, and discoveries
            </Text>
            <ObsidianButton
              title="Create First Note"
              onPress={() => setModalVisible(true)}
              icon={<Ionicons name="create" size={18} color={colors.textPrimary} />}
            />
          </GlassPanel>
        )}
      </ScrollView>

      {/* Create Note Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <SafeAreaView style={styles.modalContainer} edges={['top', 'bottom']}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButton}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>New Field Note</Text>
              <TouchableOpacity onPress={handleCreateNote}>
                <Text style={styles.saveButton}>Save</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <TextInput
                style={styles.titleInput}
                placeholder="Note Title"
                placeholderTextColor={colors.textMuted}
                value={newNote.title}
                onChangeText={(text) => setNewNote({ ...newNote, title: text })}
              />

              <TextInput
                style={styles.contentInput}
                placeholder="Write your observations, measurements, and findings..."
                placeholderTextColor={colors.textMuted}
                value={newNote.content}
                onChangeText={(text) => setNewNote({ ...newNote, content: text })}
                multiline
                textAlignVertical="top"
              />

              {/* Tags */}
              <View style={styles.tagSection}>
                <Text style={styles.sectionLabel}>TAGS</Text>
                <View style={styles.tagInputRow}>
                  <TextInput
                    style={styles.tagInput}
                    placeholder="Add tag"
                    placeholderTextColor={colors.textMuted}
                    value={tagInput}
                    onChangeText={setTagInput}
                    onSubmitEditing={addTag}
                  />
                  <TouchableOpacity style={styles.addTagButton} onPress={addTag}>
                    <Ionicons name="add" size={20} color={colors.magmaAmber} />
                  </TouchableOpacity>
                </View>
                {newNote.tags.length > 0 && (
                  <View style={styles.tagsRow}>
                    {newNote.tags.map((tag) => (
                      <TouchableOpacity
                        key={tag}
                        style={styles.editableTag}
                        onPress={() => removeTag(tag)}
                      >
                        <Text style={styles.tagText}>#{tag}</Text>
                        <Ionicons name="close" size={14} color={colors.textTertiary} />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Location */}
              {location && (
                <View style={styles.locationSection}>
                  <Text style={styles.sectionLabel}>LOCATION</Text>
                  <View style={styles.locationInfo}>
                    <Ionicons name="location" size={16} color={colors.crystalTeal} />
                    <Text style={styles.locationCoords}>
                      {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                    </Text>
                  </View>
                </View>
              )}
            </ScrollView>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.magmaAmber,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: 100,
    gap: spacing.md,
  },
  noteCard: {
    gap: spacing.sm,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  noteTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    flex: 1,
  },
  noteDate: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  noteContent: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  tag: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  tagText: {
    ...typography.caption,
    color: colors.amethystPurple,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  locationText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xxl,
    gap: spacing.md,
    marginTop: spacing.xxl,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: colors.obsidian,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorder,
  },
  cancelButton: {
    ...typography.body,
    color: colors.textSecondary,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  saveButton: {
    ...typography.body,
    color: colors.magmaAmber,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: spacing.md,
  },
  titleInput: {
    ...typography.h2,
    color: colors.textPrimary,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorder,
    paddingBottom: spacing.md,
    marginBottom: spacing.md,
  },
  contentInput: {
    ...typography.body,
    color: colors.textPrimary,
    minHeight: 200,
    lineHeight: 24,
  },
  tagSection: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  sectionLabel: {
    ...typography.label,
    color: colors.textTertiary,
  },
  tagInputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tagInput: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    backgroundColor: colors.glassPanel,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  addTagButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.glassPanel,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editableTag: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationSection: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.glassPanel,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  locationCoords: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
