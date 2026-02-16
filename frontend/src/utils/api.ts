// GeoSnap API Client
import { Specimen, FieldNote, UserProfile, PhysicalTestGuidance, LeaderboardData, PhysicalTest } from '../types';

const API_BASE = process.env.EXPO_PUBLIC_BACKEND_URL || '';

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE}/api`;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    console.log('API Request:', url);
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`API Error: ${response.status} - ${error}`);
      }

      return response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Health check
  async healthCheck(): Promise<{ status: string; service: string }> {
    return this.request('/health');
  }

  // Identification
  async identifySpecimen(
    image_base64: string,
    latitude?: number,
    longitude?: number,
    physical_tests: PhysicalTest[] = []
  ): Promise<Specimen> {
    return this.request('/identify', {
      method: 'POST',
      body: JSON.stringify({ image_base64, latitude, longitude, physical_tests }),
    });
  }

  // Physical Test Guidance
  async getPhysicalTestGuidance(testType: string): Promise<PhysicalTestGuidance> {
    return this.request(`/physical-test-guidance/${testType}`);
  }

  // Collection
  async getCollection(): Promise<Specimen[]> {
    return this.request('/collection');
  }

  async addToCollection(specimenId: string): Promise<{ message: string; specimen_id: string }> {
    return this.request(`/collection/add/${specimenId}`, { method: 'POST' });
  }

  async removeFromCollection(specimenId: string): Promise<{ message: string; specimen_id: string }> {
    return this.request(`/collection/remove/${specimenId}`, { method: 'DELETE' });
  }

  // Specimens
  async getAllSpecimens(): Promise<Specimen[]> {
    return this.request('/specimens');
  }

  async getSpecimen(specimenId: string): Promise<Specimen> {
    return this.request(`/specimens/${specimenId}`);
  }

  async deleteSpecimen(specimenId: string): Promise<{ message: string; specimen_id: string }> {
    return this.request(`/specimens/${specimenId}`, { method: 'DELETE' });
  }

  // Field Notes
  async getFieldNotes(): Promise<FieldNote[]> {
    return this.request('/field-notes');
  }

  async createFieldNote(note: Omit<FieldNote, 'id' | 'created_at' | 'updated_at'>): Promise<FieldNote> {
    return this.request('/field-notes', {
      method: 'POST',
      body: JSON.stringify(note),
    });
  }

  async getFieldNote(noteId: string): Promise<FieldNote> {
    return this.request(`/field-notes/${noteId}`);
  }

  async updateFieldNote(
    noteId: string,
    note: Omit<FieldNote, 'id' | 'created_at' | 'updated_at'>
  ): Promise<FieldNote> {
    return this.request(`/field-notes/${noteId}`, {
      method: 'PUT',
      body: JSON.stringify(note),
    });
  }

  async deleteFieldNote(noteId: string): Promise<{ message: string; note_id: string }> {
    return this.request(`/field-notes/${noteId}`, { method: 'DELETE' });
  }

  // Profile & Gamification
  async getProfile(): Promise<UserProfile> {
    return this.request('/profile');
  }

  async updateUsername(username: string): Promise<{ message: string; username: string }> {
    return this.request(`/profile/username?username=${encodeURIComponent(username)}`, {
      method: 'PUT',
    });
  }

  async getLeaderboard(): Promise<LeaderboardData> {
    return this.request('/leaderboard');
  }

  // Strata AI Mentor
  async askStrata(question: string, context?: string): Promise<{ response: string; mentor: string }> {
    const params = new URLSearchParams({ question });
    if (context) params.append('context', context);
    return this.request(`/strata/ask?${params.toString()}`, { method: 'POST' });
  }
}

export const api = new ApiClient();
