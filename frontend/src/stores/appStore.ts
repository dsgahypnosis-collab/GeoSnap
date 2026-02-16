// GeoSnap Global State Store
import { create } from 'zustand';
import { Specimen, FieldNote, UserProfile, LeaderboardData } from '../types';
import { api } from '../utils/api';

interface AppState {
  // UI State
  isLoading: boolean;
  currentScreen: 'home' | 'camera' | 'identification' | 'collection' | 'notebook' | 'profile';
  showIntro: boolean;
  
  // Data
  specimens: Specimen[];
  collection: Specimen[];
  fieldNotes: FieldNote[];
  profile: UserProfile | null;
  leaderboard: LeaderboardData | null;
  
  // Current identification flow
  currentImage: string | null;
  currentSpecimen: Specimen | null;
  identificationPhase: 'capture' | 'analyzing' | 'tests' | 'result';
  
  // Actions
  setLoading: (loading: boolean) => void;
  setCurrentScreen: (screen: AppState['currentScreen']) => void;
  setShowIntro: (show: boolean) => void;
  
  // Identification flow
  setCurrentImage: (image: string | null) => void;
  setCurrentSpecimen: (specimen: Specimen | null) => void;
  setIdentificationPhase: (phase: AppState['identificationPhase']) => void;
  
  // Data fetching
  fetchSpecimens: () => Promise<void>;
  fetchCollection: () => Promise<void>;
  fetchFieldNotes: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  fetchLeaderboard: () => Promise<void>;
  
  // Data mutations
  addSpecimenToCollection: (specimenId: string) => Promise<void>;
  removeSpecimenFromCollection: (specimenId: string) => Promise<void>;
  deleteSpecimen: (specimenId: string) => Promise<void>;
  createFieldNote: (note: Omit<FieldNote, 'id' | 'created_at' | 'updated_at'>) => Promise<FieldNote>;
  deleteFieldNote: (noteId: string) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  isLoading: false,
  currentScreen: 'home',
  showIntro: true,
  
  specimens: [],
  collection: [],
  fieldNotes: [],
  profile: null,
  leaderboard: null,
  
  currentImage: null,
  currentSpecimen: null,
  identificationPhase: 'capture',
  
  // UI Actions
  setLoading: (loading) => set({ isLoading: loading }),
  setCurrentScreen: (screen) => set({ currentScreen: screen }),
  setShowIntro: (show) => set({ showIntro: show }),
  
  // Identification flow
  setCurrentImage: (image) => set({ currentImage: image }),
  setCurrentSpecimen: (specimen) => set({ currentSpecimen: specimen }),
  setIdentificationPhase: (phase) => set({ identificationPhase: phase }),
  
  // Data fetching
  fetchSpecimens: async () => {
    try {
      const specimens = await api.getAllSpecimens();
      set({ specimens });
    } catch (error) {
      console.error('Failed to fetch specimens:', error);
    }
  },
  
  fetchCollection: async () => {
    try {
      const collection = await api.getCollection();
      set({ collection });
    } catch (error) {
      console.error('Failed to fetch collection:', error);
    }
  },
  
  fetchFieldNotes: async () => {
    try {
      const fieldNotes = await api.getFieldNotes();
      set({ fieldNotes });
    } catch (error) {
      console.error('Failed to fetch field notes:', error);
    }
  },
  
  fetchProfile: async () => {
    try {
      const profile = await api.getProfile();
      set({ profile });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  },
  
  fetchLeaderboard: async () => {
    try {
      const leaderboard = await api.getLeaderboard();
      set({ leaderboard });
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    }
  },
  
  // Data mutations
  addSpecimenToCollection: async (specimenId) => {
    try {
      await api.addToCollection(specimenId);
      await get().fetchCollection();
      await get().fetchProfile();
    } catch (error) {
      console.error('Failed to add to collection:', error);
      throw error;
    }
  },
  
  removeSpecimenFromCollection: async (specimenId) => {
    try {
      await api.removeFromCollection(specimenId);
      await get().fetchCollection();
    } catch (error) {
      console.error('Failed to remove from collection:', error);
      throw error;
    }
  },
  
  deleteSpecimen: async (specimenId) => {
    try {
      await api.deleteSpecimen(specimenId);
      await get().fetchSpecimens();
      await get().fetchCollection();
    } catch (error) {
      console.error('Failed to delete specimen:', error);
      throw error;
    }
  },
  
  createFieldNote: async (note) => {
    try {
      const newNote = await api.createFieldNote(note);
      await get().fetchFieldNotes();
      await get().fetchProfile();
      return newNote;
    } catch (error) {
      console.error('Failed to create field note:', error);
      throw error;
    }
  },
  
  deleteFieldNote: async (noteId) => {
    try {
      await api.deleteFieldNote(noteId);
      await get().fetchFieldNotes();
    } catch (error) {
      console.error('Failed to delete field note:', error);
      throw error;
    }
  },
}));
