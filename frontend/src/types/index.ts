// GeoSnap Type Definitions

export interface PhysicalTest {
  test_type: string;
  result: string;
  confidence: number;
}

export interface IdentificationCandidate {
  name: string;
  scientific_name?: string;
  confidence: number;
  rock_type: string;
  reasons: string[];
  excluded?: boolean;
  exclusion_reason?: string;
}

export interface SpecimenIdentification {
  id: string;
  primary_identification: IdentificationCandidate;
  secondary_candidates: IdentificationCandidate[];
  evidence_used: string[];
  uncertainty_notes?: string;
  geological_context?: Record<string, any>;
  physical_tests_performed: PhysicalTest[];
}

export interface SpecimenData {
  common_name: string;
  scientific_name?: string;
  classification: string;
  mineral_group?: string;
  chemical_composition?: string;
  crystal_system?: string;
  hardness?: string;
  density?: string;
  luster?: string;
  cleavage?: string;
  fracture?: string;
  streak?: string;
  optical_properties?: string;
  toxicity_warning?: string;
  formation_process?: string;
  geological_era?: string;
  plate_tectonic_context?: string;
  environmental_conditions?: string;
  scientific_value?: string;
  collector_value?: string;
  market_value_range?: string;
  interesting_facts: string[];
  deep_time_events?: { years_ago: number; event: string; era?: string }[];
}

export interface Specimen {
  id: string;
  image_base64: string;
  thumbnail_base64?: string;
  identification?: SpecimenIdentification;
  specimen_data?: SpecimenData;
  latitude?: number;
  longitude?: number;
  location_name?: string;
  user_notes?: string;
  physical_tests: PhysicalTest[];
  created_at: string;
  updated_at: string;
  xp_earned: number;
  is_in_collection: boolean;
}

export interface FieldNote {
  id: string;
  title: string;
  content: string;
  latitude?: number;
  longitude?: number;
  location_name?: string;
  images_base64: string[];
  specimen_ids: string[];
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xp_reward: number;
  unlocked: boolean;
  unlocked_at?: string;
  requirement_type: string;
  requirement_value: number;
}

export interface UserProfile {
  id: string;
  username: string;
  total_xp: number;
  level: number;
  title: string;
  specimens_identified: number;
  tests_performed: number;
  collection_size: number;
  field_notes_count: number;
  achievements: Achievement[];
  created_at: string;
}

export interface PhysicalTestGuidance {
  test_type: string;
  instructions: string[];
  materials_needed: string[];
  what_to_observe: string;
  examples: { [key: string]: string }[];
}

export interface LeaderboardData {
  profile: UserProfile;
  xp_to_next_level: number;
  level_progress: number;
  unlocked_achievements: number;
  total_achievements: number;
}
