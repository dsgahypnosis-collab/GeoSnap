from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timedelta
import base64
import json
import random

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'geosnap_db')]

# Create the main app
app = FastAPI(title="GeoSnap API", description="Geological Intelligence Platform")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ==================== MODELS ====================

class PhysicalTest(BaseModel):
    test_type: str
    result: str
    confidence: float = 0.8

class IdentificationCandidate(BaseModel):
    name: str
    scientific_name: Optional[str] = None
    confidence: float
    rock_type: str
    reasons: List[str]
    excluded: bool = False
    exclusion_reason: Optional[str] = None

class SpecimenIdentification(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    primary_identification: IdentificationCandidate
    secondary_candidates: List[IdentificationCandidate] = []
    evidence_used: List[str] = []
    uncertainty_notes: Optional[str] = None
    geological_context: Optional[Dict[str, Any]] = None
    physical_tests_performed: List[PhysicalTest] = []

class SpecimenData(BaseModel):
    common_name: str
    scientific_name: Optional[str] = None
    classification: str
    mineral_group: Optional[str] = None
    chemical_composition: Optional[str] = None
    crystal_system: Optional[str] = None
    hardness: Optional[str] = None
    density: Optional[str] = None
    luster: Optional[str] = None
    cleavage: Optional[str] = None
    fracture: Optional[str] = None
    streak: Optional[str] = None
    optical_properties: Optional[str] = None
    toxicity_warning: Optional[str] = None
    formation_process: Optional[str] = None
    geological_era: Optional[str] = None
    plate_tectonic_context: Optional[str] = None
    environmental_conditions: Optional[str] = None
    scientific_value: Optional[str] = None
    collector_value: Optional[str] = None
    market_value_range: Optional[str] = None
    interesting_facts: List[str] = []
    deep_time_events: List[Dict[str, Any]] = []

class SpecimenCreate(BaseModel):
    image_base64: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location_name: Optional[str] = None
    user_notes: Optional[str] = None

class Specimen(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    image_base64: str
    thumbnail_base64: Optional[str] = None
    identification: Optional[SpecimenIdentification] = None
    specimen_data: Optional[SpecimenData] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location_name: Optional[str] = None
    user_notes: Optional[str] = None
    physical_tests: List[PhysicalTest] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    xp_earned: int = 0
    is_in_collection: bool = False

class FieldNoteCreate(BaseModel):
    title: str
    content: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location_name: Optional[str] = None
    images_base64: List[str] = []
    specimen_ids: List[str] = []
    tags: List[str] = []

class FieldNote(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    content: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location_name: Optional[str] = None
    images_base64: List[str] = []
    specimen_ids: List[str] = []
    tags: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class Achievement(BaseModel):
    id: str
    name: str
    description: str
    icon: str
    xp_reward: int
    unlocked: bool = False
    unlocked_at: Optional[datetime] = None
    requirement_type: str
    requirement_value: int

class UserPreferences(BaseModel):
    interests: List[str] = []  # minerals, fossils, gems, etc.
    skill_level: str = "beginner"  # beginner, intermediate, advanced
    favorite_rock_types: List[str] = []
    learning_goals: List[str] = []
    preferred_detail_level: str = "standard"  # simple, standard, detailed
    last_active_date: Optional[datetime] = None
    session_count: int = 0
    streak_days: int = 0
    
class UserProfile(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str = "Explorer"
    total_xp: int = 0
    level: int = 1
    title: str = "Novice Geologist"
    specimens_identified: int = 0
    tests_performed: int = 0
    collection_size: int = 0
    field_notes_count: int = 0
    achievements: List[Achievement] = []
    preferences: UserPreferences = Field(default_factory=UserPreferences)
    ai_insights: Dict[str, Any] = {}
    personalized_tips: List[str] = []
    recommended_challenges: List[Dict[str, Any]] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)

class IdentifyRequest(BaseModel):
    image_base64: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    physical_tests: List[PhysicalTest] = []
    scan_type: str = "specimen"  # specimen or landscape

class PhysicalTestGuidance(BaseModel):
    test_type: str
    instructions: List[str]
    materials_needed: List[str]
    what_to_observe: str
    examples: List[Dict[str, str]]

class PersonalizedContent(BaseModel):
    daily_tip: str
    recommended_tests: List[str]
    learning_focus: str
    next_challenge: Dict[str, Any]
    geological_fact: str
    streak_message: str

# ==================== SUBSCRIPTION & MONETIZATION MODELS ====================

class SubscriptionTier(BaseModel):
    id: str
    name: str
    price_monthly: float
    price_yearly: float
    features: List[str]
    identifications_per_day: int  # -1 for unlimited
    collection_limit: int  # -1 for unlimited
    has_deep_time: bool
    has_offline_mode: bool
    has_export: bool
    has_priority_ai: bool
    has_advanced_tests: bool
    has_specialist_packs: bool

class UserSubscription(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    tier_id: str  # free, explorer, geologist_pro
    status: str = "active"  # active, cancelled, expired, trial
    started_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: Optional[datetime] = None
    is_yearly: bool = False
    payment_method: Optional[str] = None
    auto_renew: bool = True
    trial_used: bool = False

class UsageTracking(BaseModel):
    user_id: str
    date: str  # YYYY-MM-DD
    identifications_used: int = 0
    strata_queries: int = 0
    exports_used: int = 0

class PurchaseRecord(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    item_type: str  # subscription, specialist_pack, tip
    item_id: str
    amount: float
    currency: str = "USD"
    status: str = "completed"
    purchased_at: datetime = Field(default_factory=datetime.utcnow)
    receipt_data: Optional[str] = None

# Subscription Tiers Definition
SUBSCRIPTION_TIERS = {
    "free": SubscriptionTier(
        id="free",
        name="Free Explorer",
        price_monthly=0,
        price_yearly=0,
        features=[
            "5 AI identifications per day",
            "Basic mineral database",
            "Field notebook (10 notes max)",
            "Collection (20 specimens max)",
            "Community access"
        ],
        identifications_per_day=5,
        collection_limit=20,
        has_deep_time=False,
        has_offline_mode=False,
        has_export=False,
        has_priority_ai=False,
        has_advanced_tests=False,
        has_specialist_packs=False
    ),
    "explorer": SubscriptionTier(
        id="explorer",
        name="Explorer",
        price_monthly=4.99,
        price_yearly=39.99,
        features=[
            "25 AI identifications per day",
            "Deep Time Visualization",
            "Unlimited field notes",
            "Collection (100 specimens)",
            "Offline mode",
            "Basic export (PDF)",
            "Priority support"
        ],
        identifications_per_day=25,
        collection_limit=100,
        has_deep_time=True,
        has_offline_mode=True,
        has_export=True,
        has_priority_ai=False,
        has_advanced_tests=False,
        has_specialist_packs=False
    ),
    "geologist_pro": SubscriptionTier(
        id="geologist_pro",
        name="Geologist Pro",
        price_monthly=9.99,
        price_yearly=79.99,
        features=[
            "Unlimited AI identifications",
            "Deep Time Visualization",
            "Unlimited everything",
            "Priority AI processing",
            "Advanced physical tests",
            "Specialist packs included",
            "Export to PDF, CSV, JSON",
            "Offline mode with sync",
            "Early access to new features",
            "Direct expert support"
        ],
        identifications_per_day=-1,
        collection_limit=-1,
        has_deep_time=True,
        has_offline_mode=True,
        has_export=True,
        has_priority_ai=True,
        has_advanced_tests=True,
        has_specialist_packs=True
    )
}

# Specialist Packs (One-time purchases)
SPECIALIST_PACKS = {
    "gemstone_expert": {
        "id": "gemstone_expert",
        "name": "Gemstone Expert Pack",
        "price": 4.99,
        "description": "Advanced gemstone identification with cut analysis, clarity grading, and market valuation",
        "features": ["50+ gemstone varieties", "Cut quality analysis", "Clarity grading", "Market value estimation"]
    },
    "fossil_hunter": {
        "id": "fossil_hunter",
        "name": "Fossil Hunter Pack",
        "price": 4.99,
        "description": "Comprehensive fossil identification with age estimation and paleontological context",
        "features": ["500+ fossil types", "Age estimation", "Paleontological context", "Evolutionary timeline"]
    },
    "meteorite_finder": {
        "id": "meteorite_finder",
        "name": "Meteorite Finder Pack",
        "price": 6.99,
        "description": "Identify meteorites vs meteor-wrongs with composition analysis",
        "features": ["Meteorite classification", "Composition analysis", "Origin estimation", "Authentication guidance"]
    },
    "crystal_healer": {
        "id": "crystal_healer",
        "name": "Crystal & Mineral Mastery",
        "price": 3.99,
        "description": "Extended crystal database with formation details and collecting tips",
        "features": ["1000+ minerals", "Crystal system details", "Collecting locations", "Care instructions"]
    }
}

# ==================== ACHIEVEMENT DEFINITIONS ====================

DEFAULT_ACHIEVEMENTS = [
    Achievement(id="first_discovery", name="First Discovery", description="Identify your first specimen", icon="🔬", xp_reward=50, requirement_type="specimens_identified", requirement_value=1),
    Achievement(id="rock_hunter", name="Rock Hunter", description="Identify 10 specimens", icon="🪨", xp_reward=200, requirement_type="specimens_identified", requirement_value=10),
    Achievement(id="mineral_master", name="Mineral Master", description="Identify 50 specimens", icon="💎", xp_reward=500, requirement_type="specimens_identified", requirement_value=50),
    Achievement(id="test_beginner", name="Test Beginner", description="Perform 5 physical tests", icon="🧪", xp_reward=100, requirement_type="tests_performed", requirement_value=5),
    Achievement(id="test_expert", name="Test Expert", description="Perform 25 physical tests", icon="⚗️", xp_reward=300, requirement_type="tests_performed", requirement_value=25),
    Achievement(id="collector", name="Collector", description="Add 5 specimens to collection", icon="📦", xp_reward=150, requirement_type="collection_size", requirement_value=5),
    Achievement(id="curator", name="Curator", description="Add 20 specimens to collection", icon="🏛️", xp_reward=400, requirement_type="collection_size", requirement_value=20),
    Achievement(id="field_noter", name="Field Noter", description="Create 5 field notes", icon="📝", xp_reward=100, requirement_type="field_notes_count", requirement_value=5),
    Achievement(id="streak_starter", name="Streak Starter", description="Use GeoSnap 3 days in a row", icon="🔥", xp_reward=75, requirement_type="streak_days", requirement_value=3),
    Achievement(id="dedicated_geologist", name="Dedicated Geologist", description="Use GeoSnap 7 days in a row", icon="⭐", xp_reward=200, requirement_type="streak_days", requirement_value=7),
]

LEVEL_TITLES = {
    1: "Field Scout",
    2: "Rock Wanderer", 
    3: "Relic Seeker",
    4: "Stratum Reader",
    5: "Rift Walker",
    6: "Crystal Sage",
    7: "Deep Time Navigator",
    8: "Tectonic Whisperer",
    9: "Planetary Archivist",
    10: "Cosmic Geologist"
}

# Expedition Quests - Adventure-framed challenges
EXPEDITION_QUESTS = [
    {"id": "ancient_water", "name": "Echoes of Ancient Seas", "description": "Find evidence of water that flowed millions of years ago", "xp": 100, "type": "rock_type", "target": "sedimentary"},
    {"id": "fire_survivor", "name": "Born from Fire", "description": "Identify a rock that survived volcanic fury", "xp": 80, "type": "rock_type", "target": "igneous"},
    {"id": "time_traveler", "name": "500 Million Year Journey", "description": "Discover a mineral older than complex life", "xp": 150, "type": "specimens_identified", "target": 5},
    {"id": "crystal_hunter", "name": "Geometry of the Deep", "description": "Find a perfectly formed crystal specimen", "xp": 75, "type": "rock_type", "target": "mineral"},
    {"id": "metamorphic_tale", "name": "Transformed by Pressure", "description": "Identify a rock that was once something else", "xp": 90, "type": "rock_type", "target": "metamorphic"},
]

GEOLOGICAL_TIPS = [
    "The Mohs hardness scale uses 10 reference minerals. Your fingernail is about 2.5, a copper coin is 3.5, and a steel knife is 6.5.",
    "Streak color is often more diagnostic than surface color. Pyrite looks gold but streaks greenish-black.",
    "Igneous rocks form from cooling magma. Fast cooling creates fine crystals, slow cooling creates large crystals.",
    "Fossils are most commonly found in sedimentary rocks, which form from accumulated sediments over millions of years.",
    "The Earth's crust is constantly recycled through the rock cycle: igneous → sedimentary → metamorphic → igneous.",
    "Quartz is the most abundant mineral in Earth's continental crust and is extremely resistant to weathering.",
    "Cleavage refers to how minerals break along planes of weakness. Mica has perfect cleavage in one direction.",
    "Volcanic glass like obsidian forms when lava cools so quickly that crystals don't have time to form.",
    "Metamorphic rocks tell stories of intense heat and pressure. Marble was once limestone, slate was once shale.",
    "Geodes form when mineral-rich water seeps into rock cavities and slowly deposits crystals over millions of years.",
]

CHALLENGES = [
    {"id": "hardness_test", "name": "Hardness Hunter", "description": "Perform 3 hardness tests on different specimens", "xp": 50, "type": "tests_performed", "target": 3},
    {"id": "igneous_finder", "name": "Igneous Explorer", "description": "Identify an igneous rock specimen", "xp": 40, "type": "rock_type", "target": "igneous"},
    {"id": "crystal_quest", "name": "Crystal Quest", "description": "Find and identify a crystalline mineral", "xp": 60, "type": "classification", "target": "mineral"},
    {"id": "field_master", "name": "Field Master", "description": "Create a field note with location data", "xp": 35, "type": "field_note", "target": 1},
    {"id": "collector_start", "name": "Start Your Collection", "description": "Add your first specimen to the collection", "xp": 25, "type": "collection", "target": 1},
]

def calculate_level(xp: int) -> tuple[int, str]:
    level = 1
    xp_thresholds = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500]
    for i, threshold in enumerate(xp_thresholds):
        if xp >= threshold:
            level = i + 1
    return level, LEVEL_TITLES.get(level, "Master Geologist")

# ==================== AI PERSONALIZATION ENGINE ====================

async def generate_personalized_content(profile: 'UserProfile') -> PersonalizedContent:
    """Generate AI-personalized content based on user's history and preferences"""
    
    # Calculate streak
    streak_messages = [
        "Start your geological journey today!",
        f"🔥 {profile.preferences.streak_days} day streak! Keep exploring!",
        f"⭐ Amazing {profile.preferences.streak_days} day streak! You're becoming a true geologist!",
    ]
    streak_msg = streak_messages[0] if profile.preferences.streak_days == 0 else (
        streak_messages[2] if profile.preferences.streak_days >= 7 else streak_messages[1]
    )
    
    # Select tip based on user level and interests
    tip_index = (profile.specimens_identified + profile.level) % len(GEOLOGICAL_TIPS)
    daily_tip = GEOLOGICAL_TIPS[tip_index]
    
    # Recommend tests based on what user hasn't done much
    all_tests = ["hardness", "streak", "luster", "cleavage", "magnetism", "density"]
    recommended_tests = random.sample(all_tests, min(3, len(all_tests)))
    
    # Learning focus based on level
    learning_focuses = {
        1: "Basic mineral identification and simple tests",
        2: "Understanding rock types and their origins",
        3: "Crystal systems and optical properties",
        4: "Geological formations and tectonic processes",
        5: "Advanced identification techniques",
    }
    learning_focus = learning_focuses.get(min(profile.level, 5), "Mastering geological expertise")
    
    # Select appropriate challenge
    challenges = CHALLENGES.copy()
    next_challenge = random.choice(challenges)
    
    # Geological fact of the day
    facts = [
        "Earth is approximately 4.5 billion years old.",
        "The deepest mine in the world reaches 4 km below the surface.",
        "Diamonds form about 150-200 km below Earth's surface.",
        "The largest crystal ever found was 12 meters long (selenite in Mexico).",
        "Over 5,000 mineral species have been identified on Earth.",
    ]
    geological_fact = facts[datetime.now().day % len(facts)]
    
    return PersonalizedContent(
        daily_tip=daily_tip,
        recommended_tests=recommended_tests,
        learning_focus=learning_focus,
        next_challenge=next_challenge,
        geological_fact=geological_fact,
        streak_message=streak_msg
    )

async def update_user_preferences_from_activity(profile_id: str, activity_type: str, activity_data: Dict[str, Any]):
    """AI learns from user activity to personalize experience"""
    profile = await db.user_profiles.find_one({"id": profile_id})
    if not profile:
        return
    
    preferences = profile.get("preferences", {})
    interests = preferences.get("interests", [])
    favorite_rock_types = preferences.get("favorite_rock_types", [])
    
    if activity_type == "identification":
        rock_type = activity_data.get("rock_type", "")
        if rock_type and rock_type not in favorite_rock_types:
            favorite_rock_types.append(rock_type)
            favorite_rock_types = favorite_rock_types[-10:]  # Keep last 10
        
        classification = activity_data.get("classification", "")
        if classification and classification not in interests:
            interests.append(classification)
            interests = interests[-10:]
    
    # Update skill level based on XP
    total_xp = profile.get("total_xp", 0)
    if total_xp >= 1000:
        skill_level = "advanced"
    elif total_xp >= 300:
        skill_level = "intermediate"
    else:
        skill_level = "beginner"
    
    # Update streak
    last_active = preferences.get("last_active_date")
    today = datetime.utcnow().date()
    streak_days = preferences.get("streak_days", 0)
    
    if last_active:
        last_date = datetime.fromisoformat(str(last_active)).date() if isinstance(last_active, str) else last_active.date()
        if (today - last_date).days == 1:
            streak_days += 1
        elif (today - last_date).days > 1:
            streak_days = 1
    else:
        streak_days = 1
    
    await db.user_profiles.update_one(
        {"id": profile_id},
        {"$set": {
            "preferences.interests": interests,
            "preferences.favorite_rock_types": favorite_rock_types,
            "preferences.skill_level": skill_level,
            "preferences.last_active_date": datetime.utcnow(),
            "preferences.session_count": preferences.get("session_count", 0) + 1,
            "preferences.streak_days": streak_days
        }}
    )

# ==================== AI IDENTIFICATION ====================

async def identify_specimen_with_ai(image_base64: str, latitude: Optional[float], longitude: Optional[float], physical_tests: List[PhysicalTest], user_profile: Optional[UserProfile] = None, scan_type: str = "specimen") -> tuple[SpecimenIdentification, SpecimenData]:
    """Use OpenAI GPT-4o to identify the specimen with personalized context"""
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent
        
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not api_key:
            raise ValueError("EMERGENT_LLM_KEY not found in environment")
        
        # Build context about physical tests
        test_context = ""
        if physical_tests:
            test_context = "\n\nPhysical tests performed by user:\n"
            for test in physical_tests:
                test_context += f"- {test.test_type}: {test.result} (confidence: {test.confidence})\n"
        
        # Build location context
        location_context = ""
        if latitude and longitude:
            location_context = f"\n\nLocation coordinates: {latitude}, {longitude}"
        
        # Build user context for personalization
        user_context = ""
        if user_profile:
            user_context = f"""
\n\nUser Context (for personalized explanation):
- Skill Level: {user_profile.preferences.skill_level}
- Specimens Identified: {user_profile.specimens_identified}
- Interests: {', '.join(user_profile.preferences.interests) if user_profile.preferences.interests else 'General geology'}
- Level: {user_profile.level} ({user_profile.title})

Adjust your explanation depth accordingly - be more detailed for advanced users, use simpler terms for beginners."""
        
        # Different prompts for specimen vs landscape
        if scan_type == "landscape":
            system_message = """You are Strata, an expert AI geological analyst specializing in landscape-scale geological features.

Your role is to analyze photographs of geological landscapes, formations, mountains, cliffs, and rock outcrops to identify:
- The types of rocks visible
- Geological structures (folds, faults, unconformities)
- Formation history and geological processes
- Plate tectonic context
- Age estimates of the formations

CRITICAL RULES:
1. Describe what you see at the landscape scale
2. Identify visible rock types and formations
3. Explain the geological history that created this landscape
4. Provide confidence honestly (0.0-1.0)
5. Add fascinating facts that make geology come alive!

You must respond in valid JSON format with this exact structure:
{
    "primary_identification": {
        "name": "Landscape type (e.g., 'Granite Batholith Exposure', 'Sedimentary Canyon', 'Volcanic Caldera')",
        "scientific_name": "Formation name if known",
        "confidence": 0.85,
        "rock_type": "igneous|sedimentary|metamorphic|mixed",
        "reasons": ["Visual evidence 1", "Visual evidence 2"]
    },
    "secondary_candidates": [],
    "evidence_used": ["Feature 1", "Feature 2"],
    "uncertainty_notes": "What would help confirm identification",
    "specimen_data": {
        "common_name": "Landscape feature name",
        "scientific_name": "Geological formation name",
        "classification": "landscape",
        "mineral_group": "Dominant rock types visible",
        "chemical_composition": "General composition",
        "crystal_system": null,
        "hardness": "Range for visible rocks",
        "density": null,
        "luster": null,
        "cleavage": "Visible jointing patterns",
        "fracture": "Erosion patterns",
        "streak": null,
        "optical_properties": null,
        "toxicity_warning": null,
        "formation_process": "Detailed geological history - how this landscape formed",
        "geological_era": "Age of formation (e.g., 'Jurassic, 150 million years ago')",
        "plate_tectonic_context": "Tectonic setting and forces that shaped this",
        "environmental_conditions": "Past environments (ancient seas, deserts, etc.)",
        "scientific_value": "Why geologists study areas like this",
        "collector_value": "Notable specimens that might be found here",
        "market_value_range": null,
        "interesting_facts": ["Amazing fact 1", "Amazing fact 2", "Amazing fact 3"],
        "deep_time_events": [
            {"years_ago": 4500000000, "event": "Earth forms"},
            {"years_ago": 100000000, "event": "Relevant geological event"}
        ]
    }
}"""
        else:
            system_message = """You are Strata, an expert AI geological mentor embedded in GeoSnap - a cinematic geological intelligence platform. 

Your role is to identify rocks, minerals, and gemstones with scientific rigor while explaining your reasoning clearly.

CRITICAL RULES:
1. NEVER guess blindly - always explain the evidence for your identification
2. Provide confidence scores honestly (0.0-1.0)
3. List multiple candidates when uncertain
4. Consider geological plausibility based on location
5. Use physical test results to refine identification
6. Explain what features led to your conclusion
7. Include fascinating facts that make the user want to learn more
8. Add deep time context - when and how this formed

You must respond in valid JSON format with this exact structure:
{
    "primary_identification": {
        "name": "Common name",
        "scientific_name": "Scientific name if applicable",
        "confidence": 0.85,
        "rock_type": "igneous|sedimentary|metamorphic|mineral|gemstone",
        "reasons": ["Reason 1", "Reason 2", "Reason 3"]
    },
    "secondary_candidates": [
        {
            "name": "Alternative name",
            "confidence": 0.6,
            "rock_type": "type",
            "reasons": ["Why it could be this"],
            "excluded": false,
            "exclusion_reason": null
        }
    ],
    "evidence_used": ["Visual feature 1", "Visual feature 2", "Visual feature 3"],
    "uncertainty_notes": "Any caveats or additional tests that would help",
    "specimen_data": {
        "common_name": "Name",
        "scientific_name": "Scientific name",
        "classification": "igneous|sedimentary|metamorphic|mineral|gemstone",
        "mineral_group": "Group if applicable",
        "chemical_composition": "Chemical formula",
        "crystal_system": "System if crystalline",
        "hardness": "Mohs scale value or range",
        "density": "g/cm³ value or range",
        "luster": "Type of luster",
        "cleavage": "Cleavage description",
        "fracture": "Fracture type",
        "streak": "Streak color",
        "optical_properties": "Any notable optical properties",
        "toxicity_warning": "Safety warnings if any, null if safe",
        "formation_process": "Detailed explanation of how it forms",
        "geological_era": "When it typically formed (e.g., 'Precambrian, 2.5 billion years ago')",
        "plate_tectonic_context": "Tectonic setting where this forms",
        "environmental_conditions": "Temperature, pressure, chemical conditions",
        "scientific_value": "Why scientists find this interesting",
        "collector_value": "Collectibility and appeal",
        "market_value_range": "Approximate value range if applicable",
        "interesting_facts": ["Fascinating fact 1", "Fascinating fact 2", "Fascinating fact 3"],
        "deep_time_events": [
            {"years_ago": 4500000000, "event": "Earth forms from solar nebula"},
            {"years_ago": 2500000000, "event": "Great Oxidation Event"},
            {"years_ago": 500000000, "event": "Relevant geological event"}
        ]
    }
}"""
        
        if scan_type == "landscape":
            user_prompt = f"""Analyze this geological landscape photograph and identify the features, formations, and geological history.

{test_context}
{location_context}
{user_context}

Examine carefully:
- Rock types visible in the landscape
- Geological structures (layers, folds, faults)
- Erosion patterns and surface features
- Mountains, cliffs, canyons, or other formations
- Signs of past geological events

Provide your analysis with honest confidence levels. Include fascinating facts about how this landscape formed over millions of years!"""
        else:
            user_prompt = f"""Analyze this rock/mineral/gemstone specimen image and provide a detailed identification.

{test_context}
{location_context}
{user_context}

Examine carefully:
- Color, luster, and surface texture
- Crystal habit or grain structure  
- Visible cleavage or fracture patterns
- Any inclusions, banding, or weathering
- Overall morphology and form

Provide your identification with honest confidence levels. If uncertain, list multiple candidates and explain what additional tests would help.

Make your response engaging - include fascinating facts that will make the user want to learn more about geology!"""
        
        chat = LlmChat(
            api_key=api_key,
            session_id=str(uuid.uuid4()),
            system_message=system_message
        ).with_model("openai", "gpt-4o")
        
        image_content = ImageContent(image_base64=image_base64)
        
        user_message = UserMessage(
            text=user_prompt,
            file_contents=[image_content]
        )
        
        response = await chat.send_message(user_message)
        
        # Parse the JSON response
        try:
            response_text = response.strip()
            if response_text.startswith("```json"):
                response_text = response_text[7:]
            if response_text.startswith("```"):
                response_text = response_text[3:]
            if response_text.endswith("```"):
                response_text = response_text[:-3]
            
            result = json.loads(response_text.strip())
            
            primary = IdentificationCandidate(**result["primary_identification"])
            secondary = [IdentificationCandidate(**c) for c in result.get("secondary_candidates", [])]
            
            identification = SpecimenIdentification(
                primary_identification=primary,
                secondary_candidates=secondary,
                evidence_used=result.get("evidence_used", []),
                uncertainty_notes=result.get("uncertainty_notes"),
                physical_tests_performed=physical_tests
            )
            
            spec_data = result.get("specimen_data", {})
            specimen_data = SpecimenData(
                common_name=spec_data.get("common_name", primary.name),
                scientific_name=spec_data.get("scientific_name"),
                classification=spec_data.get("classification", primary.rock_type),
                mineral_group=spec_data.get("mineral_group"),
                chemical_composition=spec_data.get("chemical_composition"),
                crystal_system=spec_data.get("crystal_system"),
                hardness=spec_data.get("hardness"),
                density=spec_data.get("density"),
                luster=spec_data.get("luster"),
                cleavage=spec_data.get("cleavage"),
                fracture=spec_data.get("fracture"),
                streak=spec_data.get("streak"),
                optical_properties=spec_data.get("optical_properties"),
                toxicity_warning=spec_data.get("toxicity_warning"),
                formation_process=spec_data.get("formation_process"),
                geological_era=spec_data.get("geological_era"),
                plate_tectonic_context=spec_data.get("plate_tectonic_context"),
                environmental_conditions=spec_data.get("environmental_conditions"),
                scientific_value=spec_data.get("scientific_value"),
                collector_value=spec_data.get("collector_value"),
                market_value_range=spec_data.get("market_value_range"),
                interesting_facts=spec_data.get("interesting_facts", []),
                deep_time_events=spec_data.get("deep_time_events", [])
            )
            
            return identification, specimen_data
            
        except json.JSONDecodeError as e:
            logging.error(f"Failed to parse AI response: {e}")
            logging.error(f"Response was: {response}")
            raise HTTPException(status_code=500, detail="Failed to parse AI identification response")
            
    except Exception as e:
        logging.error(f"AI identification error: {e}")
        raise HTTPException(status_code=500, detail=f"AI identification failed: {str(e)}")

# ==================== API ROUTES ====================

@api_router.get("/")
async def root():
    return {"message": "GeoSnap API - Geological Intelligence Platform", "version": "1.0.0"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "service": "geosnap-api"}

# ---------- Personalization ----------

@api_router.get("/personalized-content", response_model=PersonalizedContent)
async def get_personalized_content():
    """Get AI-personalized content for the user"""
    profile = await get_or_create_profile()
    return await generate_personalized_content(profile)

@api_router.post("/track-activity")
async def track_activity(activity_type: str, activity_data: Dict[str, Any] = {}):
    """Track user activity for AI personalization"""
    profile = await get_or_create_profile()
    await update_user_preferences_from_activity(profile.id, activity_type, activity_data)
    return {"message": "Activity tracked", "activity_type": activity_type}

# ---------- Subscription & Monetization ----------

async def get_or_create_subscription(user_id: str) -> UserSubscription:
    """Get or create user subscription (defaults to free tier)"""
    sub = await db.subscriptions.find_one({"user_id": user_id})
    if not sub:
        new_sub = UserSubscription(user_id=user_id, tier_id="free")
        await db.subscriptions.insert_one(new_sub.dict())
        return new_sub
    return UserSubscription(**sub)

async def get_daily_usage(user_id: str) -> UsageTracking:
    """Get or create daily usage tracking"""
    today = datetime.utcnow().strftime("%Y-%m-%d")
    usage = await db.usage_tracking.find_one({"user_id": user_id, "date": today})
    if not usage:
        new_usage = UsageTracking(user_id=user_id, date=today)
        await db.usage_tracking.insert_one(new_usage.__dict__)
        return new_usage
    return UsageTracking(**usage)

async def check_feature_access(user_id: str, feature: str) -> dict:
    """Check if user has access to a feature based on subscription"""
    subscription = await get_or_create_subscription(user_id)
    tier = SUBSCRIPTION_TIERS.get(subscription.tier_id, SUBSCRIPTION_TIERS["free"])
    
    # Check trial status
    is_trial = subscription.status == "trial"
    trial_days_left = 0
    if is_trial and subscription.expires_at:
        trial_days_left = (subscription.expires_at - datetime.utcnow()).days
    
    # Feature access checks
    access_map = {
        "identification": tier.identifications_per_day != 0,
        "deep_time": tier.has_deep_time,
        "offline": tier.has_offline_mode,
        "export": tier.has_export,
        "priority_ai": tier.has_priority_ai,
        "advanced_tests": tier.has_advanced_tests,
        "specialist_packs": tier.has_specialist_packs,
    }
    
    has_access = access_map.get(feature, False)
    
    return {
        "has_access": has_access or is_trial,
        "tier_id": subscription.tier_id,
        "tier_name": tier.name,
        "is_trial": is_trial,
        "trial_days_left": trial_days_left,
        "upgrade_required": not has_access and not is_trial
    }

async def check_identification_limit(user_id: str) -> dict:
    """Check if user has remaining identifications for today"""
    subscription = await get_or_create_subscription(user_id)
    tier = SUBSCRIPTION_TIERS.get(subscription.tier_id, SUBSCRIPTION_TIERS["free"])
    usage = await get_daily_usage(user_id)
    
    # Unlimited for pro users
    if tier.identifications_per_day == -1:
        return {
            "can_identify": True,
            "remaining": -1,
            "limit": -1,
            "used": usage.identifications_used,
            "is_unlimited": True
        }
    
    remaining = tier.identifications_per_day - usage.identifications_used
    
    return {
        "can_identify": remaining > 0,
        "remaining": max(0, remaining),
        "limit": tier.identifications_per_day,
        "used": usage.identifications_used,
        "is_unlimited": False
    }

async def increment_usage(user_id: str, usage_type: str):
    """Increment daily usage counter"""
    today = datetime.utcnow().strftime("%Y-%m-%d")
    field = f"{usage_type}_used" if not usage_type.endswith("_used") else usage_type
    await db.usage_tracking.update_one(
        {"user_id": user_id, "date": today},
        {"$inc": {field.replace("_used", "s_used"): 1}},
        upsert=True
    )

@api_router.get("/subscription/tiers")
async def get_subscription_tiers():
    """Get all available subscription tiers"""
    return {
        "tiers": [tier.dict() for tier in SUBSCRIPTION_TIERS.values()],
        "specialist_packs": list(SPECIALIST_PACKS.values())
    }

@api_router.get("/subscription/status")
async def get_subscription_status():
    """Get current user's subscription status"""
    profile = await get_or_create_profile()
    subscription = await get_or_create_subscription(profile.id)
    tier = SUBSCRIPTION_TIERS.get(subscription.tier_id, SUBSCRIPTION_TIERS["free"])
    usage = await get_daily_usage(profile.id)
    
    # Calculate remaining identifications
    if tier.identifications_per_day == -1:
        remaining_ids = -1
        is_unlimited = True
    else:
        remaining_ids = max(0, tier.identifications_per_day - usage.identifications_used)
        is_unlimited = False
    
    # Get purchased specialist packs
    purchased_packs = await db.purchases.find({
        "user_id": profile.id,
        "item_type": "specialist_pack",
        "status": "completed"
    }).to_list(100)
    purchased_pack_ids = [p["item_id"] for p in purchased_packs]
    
    return {
        "subscription": subscription.dict(),
        "tier": tier.dict(),
        "usage": {
            "identifications_today": usage.identifications_used,
            "remaining_identifications": remaining_ids,
            "is_unlimited": is_unlimited,
            "strata_queries_today": usage.strata_queries,
            "exports_today": usage.exports_used
        },
        "purchased_packs": purchased_pack_ids,
        "features": {
            "has_deep_time": tier.has_deep_time,
            "has_offline": tier.has_offline_mode,
            "has_export": tier.has_export,
            "has_priority_ai": tier.has_priority_ai,
            "has_advanced_tests": tier.has_advanced_tests,
            "has_specialist_packs": tier.has_specialist_packs
        }
    }

@api_router.post("/subscription/start-trial")
async def start_free_trial():
    """Start a 7-day free trial of Explorer tier"""
    profile = await get_or_create_profile()
    subscription = await get_or_create_subscription(profile.id)
    
    if subscription.trial_used:
        raise HTTPException(status_code=400, detail="Free trial already used")
    
    # Update to trial
    trial_expires = datetime.utcnow() + timedelta(days=7)
    await db.subscriptions.update_one(
        {"user_id": profile.id},
        {"$set": {
            "tier_id": "explorer",
            "status": "trial",
            "expires_at": trial_expires,
            "trial_used": True
        }}
    )
    
    return {
        "message": "Free trial started!",
        "tier": "explorer",
        "expires_at": trial_expires.isoformat(),
        "trial_days": 7
    }

@api_router.post("/subscription/subscribe")
async def subscribe(tier_id: str, is_yearly: bool = False, payment_token: Optional[str] = None):
    """Subscribe to a tier (simulated - would integrate with Stripe/Apple/Google)"""
    profile = await get_or_create_profile()
    
    if tier_id not in SUBSCRIPTION_TIERS:
        raise HTTPException(status_code=400, detail="Invalid subscription tier")
    
    tier = SUBSCRIPTION_TIERS[tier_id]
    
    if tier_id == "free":
        raise HTTPException(status_code=400, detail="Cannot subscribe to free tier")
    
    # Calculate price and expiry
    price = tier.price_yearly if is_yearly else tier.price_monthly
    expires_at = datetime.utcnow() + timedelta(days=365 if is_yearly else 30)
    
    # In production, you would:
    # 1. Validate payment_token with Stripe/Apple/Google
    # 2. Process the payment
    # 3. Handle webhooks for subscription events
    
    # For now, simulate successful subscription
    await db.subscriptions.update_one(
        {"user_id": profile.id},
        {"$set": {
            "tier_id": tier_id,
            "status": "active",
            "expires_at": expires_at,
            "is_yearly": is_yearly,
            "auto_renew": True
        }}
    )
    
    # Record purchase
    purchase = PurchaseRecord(
        user_id=profile.id,
        item_type="subscription",
        item_id=tier_id,
        amount=price,
        receipt_data=payment_token
    )
    await db.purchases.insert_one(purchase.dict())
    
    return {
        "message": f"Successfully subscribed to {tier.name}!",
        "tier": tier.dict(),
        "expires_at": expires_at.isoformat(),
        "amount_charged": price,
        "is_yearly": is_yearly
    }

@api_router.post("/subscription/purchase-pack")
async def purchase_specialist_pack(pack_id: str, payment_token: Optional[str] = None):
    """Purchase a specialist pack (one-time)"""
    profile = await get_or_create_profile()
    
    if pack_id not in SPECIALIST_PACKS:
        raise HTTPException(status_code=400, detail="Invalid specialist pack")
    
    pack = SPECIALIST_PACKS[pack_id]
    
    # Check if already purchased
    existing = await db.purchases.find_one({
        "user_id": profile.id,
        "item_type": "specialist_pack",
        "item_id": pack_id,
        "status": "completed"
    })
    
    if existing:
        raise HTTPException(status_code=400, detail="Pack already purchased")
    
    # In production, validate payment here
    
    # Record purchase
    purchase = PurchaseRecord(
        user_id=profile.id,
        item_type="specialist_pack",
        item_id=pack_id,
        amount=pack["price"],
        receipt_data=payment_token
    )
    await db.purchases.insert_one(purchase.dict())
    
    return {
        "message": f"Successfully purchased {pack['name']}!",
        "pack": pack,
        "amount_charged": pack["price"]
    }

@api_router.post("/subscription/cancel")
async def cancel_subscription():
    """Cancel subscription (will not renew)"""
    profile = await get_or_create_profile()
    
    await db.subscriptions.update_one(
        {"user_id": profile.id},
        {"$set": {"auto_renew": False, "status": "cancelled"}}
    )
    
    subscription = await get_or_create_subscription(profile.id)
    
    return {
        "message": "Subscription cancelled. You'll retain access until the end of your billing period.",
        "expires_at": subscription.expires_at.isoformat() if subscription.expires_at else None
    }

@api_router.post("/subscription/restore")
async def restore_purchases():
    """Restore purchases (for app reinstall - would verify with app stores)"""
    profile = await get_or_create_profile()
    
    # Get all purchases
    purchases = await db.purchases.find({"user_id": profile.id}).to_list(100)
    
    # Get active subscription
    subscription = await get_or_create_subscription(profile.id)
    
    return {
        "subscription": subscription.dict(),
        "purchases": [p for p in purchases],
        "message": "Purchases restored successfully"
    }

# ---------- Identification ----------

@api_router.post("/identify", response_model=Specimen)
async def identify_specimen(request: IdentifyRequest):
    """
    ACT I: ENCOUNTER - The specimen is discovered
    ACT II: INTERROGATION - AI analyzes with physical tests
    ACT III: REVELATION - The answer resolves
    """
    try:
        # Get user profile for personalized identification
        profile = await get_or_create_profile()
        
        # Check identification limit based on subscription
        limit_check = await check_identification_limit(profile.id)
        if not limit_check["can_identify"]:
            raise HTTPException(
                status_code=402,
                detail={
                    "error": "identification_limit_reached",
                    "message": f"You've used all {limit_check['limit']} identifications for today. Upgrade to get more!",
                    "used": limit_check["used"],
                    "limit": limit_check["limit"],
                    "upgrade_options": ["explorer", "geologist_pro"]
                }
            )
        
        # Run AI identification with user context
        identification, specimen_data = await identify_specimen_with_ai(
            request.image_base64,
            request.latitude,
            request.longitude,
            request.physical_tests,
            profile,
            request.scan_type  # Pass scan type
        )
        
        # Increment usage counter
        await increment_usage(profile.id, "identification")
        
        # Calculate XP earned (bonus for premium users)
        subscription = await get_or_create_subscription(profile.id)
        base_xp = 25
        confidence_bonus = int(identification.primary_identification.confidence * 25)
        test_bonus = len(request.physical_tests) * 10
        premium_bonus = 10 if subscription.tier_id != "free" else 0
        xp_earned = base_xp + confidence_bonus + test_bonus + premium_bonus
        
        # Create specimen object
        specimen = Specimen(
            image_base64=request.image_base64,
            identification=identification,
            specimen_data=specimen_data,
            latitude=request.latitude,
            longitude=request.longitude,
            physical_tests=request.physical_tests,
            xp_earned=xp_earned
        )
        
        # Save to database
        await db.specimens.insert_one(specimen.dict())
        
        # Update user profile stats and learn from activity
        await update_user_stats("specimens_identified", 1, xp_earned)
        if request.physical_tests:
            await update_user_stats("tests_performed", len(request.physical_tests), 0)
        
        # Update AI personalization based on this identification
        await update_user_preferences_from_activity(
            profile.id, 
            "identification", 
            {
                "rock_type": identification.primary_identification.rock_type,
                "classification": specimen_data.classification,
                "name": specimen_data.common_name
            }
        )
        
        return specimen
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Identification error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/physical-test-guidance/{test_type}", response_model=PhysicalTestGuidance)
async def get_physical_test_guidance(test_type: str):
    """Get guidance for performing physical tests"""
    guidance_map = {
        "hardness": PhysicalTestGuidance(
            test_type="hardness",
            instructions=[
                "Start with common objects of known hardness",
                "Fingernail (2.5) - try to scratch the specimen",
                "Copper coin (3.5) - try to scratch with edge",
                "Glass plate (5.5) - does specimen scratch glass?",
                "Steel knife (6.5) - final hardness test",
                "Compare scratches to determine Mohs hardness"
            ],
            materials_needed=["Fingernail", "Copper coin", "Glass plate or bottle", "Steel knife or file"],
            what_to_observe="Look for actual scratches, not just marks. A scratch removes material and won't wipe away.",
            examples=[
                {"mineral": "Talc", "hardness": "1", "description": "Scratched by fingernail easily"},
                {"mineral": "Calcite", "hardness": "3", "description": "Scratched by copper coin"},
                {"mineral": "Quartz", "hardness": "7", "description": "Scratches glass, not scratched by knife"}
            ]
        ),
        "streak": PhysicalTestGuidance(
            test_type="streak",
            instructions=[
                "Use an unglazed porcelain tile (streak plate)",
                "Drag the specimen firmly across the plate",
                "Observe the color of the powder left behind",
                "The streak color is often different from specimen color",
                "Harder minerals (>7) may not leave a streak"
            ],
            materials_needed=["Unglazed porcelain tile or bottom of ceramic mug"],
            what_to_observe="The color of the powdered mineral. This is often diagnostic - pyrite leaves a black streak despite its golden color.",
            examples=[
                {"mineral": "Hematite", "streak": "Reddish-brown", "description": "Even if specimen is black or silver"},
                {"mineral": "Pyrite", "streak": "Greenish-black", "description": "Despite gold color"},
                {"mineral": "Calcite", "streak": "White", "description": "Regardless of specimen color"}
            ]
        ),
        "luster": PhysicalTestGuidance(
            test_type="luster",
            instructions=[
                "Examine the specimen under good lighting",
                "Rotate it to see how light reflects",
                "Compare to known luster types",
                "Note if luster is consistent or varies"
            ],
            materials_needed=["Good light source", "Fresh surface if possible"],
            what_to_observe="How light interacts with the surface. Is it metallic, glassy, waxy, pearly, silky, or earthy/dull?",
            examples=[
                {"type": "Metallic", "description": "Like polished metal - pyrite, galena"},
                {"type": "Vitreous", "description": "Like glass - quartz, feldspar"},
                {"type": "Pearly", "description": "Like pearl - talc, muscovite"},
                {"type": "Waxy", "description": "Like candle wax - chalcedony"},
                {"type": "Earthy", "description": "Dull, soil-like - kaolinite, limonite"}
            ]
        ),
        "cleavage": PhysicalTestGuidance(
            test_type="cleavage",
            instructions=[
                "Look for flat, reflective surfaces",
                "Count how many cleavage directions exist",
                "Measure angles between cleavage planes if possible",
                "Distinguish from fracture (irregular breaks)"
            ],
            materials_needed=["Hand lens or magnifying glass", "Good lighting"],
            what_to_observe="Flat surfaces where mineral naturally breaks along atomic planes. Count directions and estimate angles.",
            examples=[
                {"mineral": "Mica", "cleavage": "1 direction", "description": "Sheets split apart"},
                {"mineral": "Feldspar", "cleavage": "2 directions at 90°", "description": "Box-like breaks"},
                {"mineral": "Calcite", "cleavage": "3 directions not at 90°", "description": "Rhombohedral"}
            ]
        ),
        "magnetism": PhysicalTestGuidance(
            test_type="magnetism",
            instructions=[
                "Use a strong magnet (neodymium works best)",
                "Hold magnet near specimen and observe",
                "Check if specimen is attracted or repelled",
                "Note strength of magnetic response"
            ],
            materials_needed=["Strong magnet (neodymium preferred)", "String to suspend specimen"],
            what_to_observe="Whether the specimen is attracted to the magnet. Only a few minerals are magnetic.",
            examples=[
                {"mineral": "Magnetite", "response": "Strongly magnetic", "description": "Attracts to magnet, may attract iron filings"},
                {"mineral": "Pyrrhotite", "response": "Weakly magnetic", "description": "Slight attraction"},
                {"mineral": "Hematite", "response": "Non-magnetic", "description": "No response (iron-bearing but not magnetic)"}
            ]
        ),
        "density": PhysicalTestGuidance(
            test_type="density",
            instructions=[
                "Hold the specimen in your hand",
                "Compare weight to similarly sized rocks",
                "Hefty feel indicates high density (>3 g/cm³)",
                "Light feel indicates low density (<2.5 g/cm³)"
            ],
            materials_needed=["Comparison specimens of known density", "Scale for precise measurement"],
            what_to_observe="How heavy the specimen feels for its size. Metallic minerals are typically dense.",
            examples=[
                {"mineral": "Galena", "density": "7.5 g/cm³", "description": "Very heavy for size"},
                {"mineral": "Quartz", "density": "2.65 g/cm³", "description": "Moderate, expected weight"},
                {"mineral": "Pumice", "density": "<1 g/cm³", "description": "Surprisingly light, floats on water"}
            ]
        )
    }
    
    if test_type not in guidance_map:
        raise HTTPException(status_code=404, detail=f"Unknown test type: {test_type}")
    
    return guidance_map[test_type]

# ---------- Collection ----------

@api_router.post("/collection/add/{specimen_id}")
async def add_to_collection(specimen_id: str):
    """Add specimen to user's collection vault"""
    result = await db.specimens.update_one(
        {"id": specimen_id},
        {"$set": {"is_in_collection": True, "updated_at": datetime.utcnow()}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Specimen not found")
    
    await update_user_stats("collection_size", 1, 15)
    
    # Track for personalization
    profile = await get_or_create_profile()
    await update_user_preferences_from_activity(profile.id, "collection_add", {})
    
    return {"message": "Added to collection", "specimen_id": specimen_id}

@api_router.delete("/collection/remove/{specimen_id}")
async def remove_from_collection(specimen_id: str):
    """Remove specimen from collection"""
    result = await db.specimens.update_one(
        {"id": specimen_id},
        {"$set": {"is_in_collection": False, "updated_at": datetime.utcnow()}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Specimen not found")
    
    return {"message": "Removed from collection", "specimen_id": specimen_id}

@api_router.get("/collection", response_model=List[Specimen])
async def get_collection():
    """Get user's specimen collection"""
    specimens = await db.specimens.find({"is_in_collection": True}).sort("created_at", -1).to_list(1000)
    return [Specimen(**s) for s in specimens]

@api_router.get("/specimens", response_model=List[Specimen])
async def get_all_specimens():
    """Get all identified specimens"""
    specimens = await db.specimens.find().sort("created_at", -1).to_list(1000)
    return [Specimen(**s) for s in specimens]

@api_router.get("/specimens/{specimen_id}", response_model=Specimen)
async def get_specimen(specimen_id: str):
    """Get a specific specimen by ID"""
    specimen = await db.specimens.find_one({"id": specimen_id})
    if not specimen:
        raise HTTPException(status_code=404, detail="Specimen not found")
    return Specimen(**specimen)

@api_router.delete("/specimens/{specimen_id}")
async def delete_specimen(specimen_id: str):
    """Delete a specimen"""
    result = await db.specimens.delete_one({"id": specimen_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Specimen not found")
    return {"message": "Specimen deleted", "specimen_id": specimen_id}

# ---------- Field Notes ----------

@api_router.post("/field-notes", response_model=FieldNote)
async def create_field_note(note: FieldNoteCreate):
    """Create a new field note"""
    field_note = FieldNote(**note.dict())
    await db.field_notes.insert_one(field_note.dict())
    await update_user_stats("field_notes_count", 1, 20)
    
    # Track for personalization
    profile = await get_or_create_profile()
    await update_user_preferences_from_activity(profile.id, "field_note", {"tags": note.tags})
    
    return field_note

@api_router.get("/field-notes", response_model=List[FieldNote])
async def get_field_notes():
    """Get all field notes"""
    notes = await db.field_notes.find().sort("created_at", -1).to_list(1000)
    return [FieldNote(**n) for n in notes]

@api_router.get("/field-notes/{note_id}", response_model=FieldNote)
async def get_field_note(note_id: str):
    """Get a specific field note"""
    note = await db.field_notes.find_one({"id": note_id})
    if not note:
        raise HTTPException(status_code=404, detail="Field note not found")
    return FieldNote(**note)

@api_router.put("/field-notes/{note_id}", response_model=FieldNote)
async def update_field_note(note_id: str, note_update: FieldNoteCreate):
    """Update a field note"""
    update_data = note_update.dict()
    update_data["updated_at"] = datetime.utcnow()
    
    result = await db.field_notes.update_one(
        {"id": note_id},
        {"$set": update_data}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Field note not found")
    
    updated = await db.field_notes.find_one({"id": note_id})
    return FieldNote(**updated)

@api_router.delete("/field-notes/{note_id}")
async def delete_field_note(note_id: str):
    """Delete a field note"""
    result = await db.field_notes.delete_one({"id": note_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Field note not found")
    return {"message": "Field note deleted", "note_id": note_id}

# ---------- User Profile & Gamification ----------

async def get_or_create_profile() -> UserProfile:
    """Get or create user profile"""
    profile = await db.user_profiles.find_one({})
    if not profile:
        new_profile = UserProfile(
            achievements=DEFAULT_ACHIEVEMENTS,
            preferences=UserPreferences()
        )
        await db.user_profiles.insert_one(new_profile.dict())
        return new_profile
    return UserProfile(**profile)

async def update_user_stats(stat_type: str, increment: int, xp_bonus: int = 0):
    """Update user statistics and check achievements"""
    profile = await get_or_create_profile()
    
    current_value = getattr(profile, stat_type, 0) + increment
    new_xp = profile.total_xp + xp_bonus
    new_level, new_title = calculate_level(new_xp)
    
    update_data = {
        stat_type: current_value,
        "total_xp": new_xp,
        "level": new_level,
        "title": new_title
    }
    
    # Check achievements
    achievements = profile.achievements
    newly_unlocked = []
    for i, achievement in enumerate(achievements):
        if not achievement.unlocked and achievement.requirement_type == stat_type:
            if current_value >= achievement.requirement_value:
                achievements[i].unlocked = True
                achievements[i].unlocked_at = datetime.utcnow()
                update_data["total_xp"] = update_data.get("total_xp", new_xp) + achievement.xp_reward
                newly_unlocked.append(achievement)
    
    # Also check streak achievements
    streak_days = profile.preferences.streak_days
    for i, achievement in enumerate(achievements):
        if not achievement.unlocked and achievement.requirement_type == "streak_days":
            if streak_days >= achievement.requirement_value:
                achievements[i].unlocked = True
                achievements[i].unlocked_at = datetime.utcnow()
                update_data["total_xp"] = update_data.get("total_xp", new_xp) + achievement.xp_reward
                newly_unlocked.append(achievement)
    
    update_data["achievements"] = [a.dict() for a in achievements]
    
    await db.user_profiles.update_one(
        {"id": profile.id},
        {"$set": update_data}
    )
    
    return newly_unlocked

@api_router.get("/profile", response_model=UserProfile)
async def get_profile():
    """Get user profile with stats and achievements"""
    profile = await get_or_create_profile()
    
    # Update last active and streak when profile is fetched
    await update_user_preferences_from_activity(profile.id, "session_start", {})
    
    # Refresh profile after update
    return await get_or_create_profile()

@api_router.put("/profile/username")
async def update_username(username: str):
    """Update username"""
    profile = await get_or_create_profile()
    await db.user_profiles.update_one(
        {"id": profile.id},
        {"$set": {"username": username}}
    )
    return {"message": "Username updated", "username": username}

@api_router.get("/leaderboard")
async def get_leaderboard():
    """Get gamification leaderboard stats"""
    profile = await get_or_create_profile()
    
    xp_thresholds = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500]
    current_threshold = xp_thresholds[profile.level - 1] if profile.level <= 10 else xp_thresholds[-1]
    next_threshold = xp_thresholds[profile.level] if profile.level < 10 else xp_thresholds[-1] + 1000
    
    # Get personalized content
    personalized = await generate_personalized_content(profile)
    
    return {
        "profile": profile,
        "xp_to_next_level": next_threshold - profile.total_xp,
        "level_progress": (profile.total_xp - current_threshold) / (next_threshold - current_threshold) if next_threshold > current_threshold else 1.0,
        "unlocked_achievements": len([a for a in profile.achievements if a.unlocked]),
        "total_achievements": len(profile.achievements),
        "personalized": personalized.dict()
    }

# ---------- Strata AI Mentor ----------

@api_router.post("/strata/ask")
async def ask_strata(question: str, context: Optional[str] = None):
    """Ask Strata, the AI geological mentor - with personalized responses"""
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not api_key:
            raise ValueError("EMERGENT_LLM_KEY not found")
        
        # Get user profile for personalization
        profile = await get_or_create_profile()
        
        skill_context = f"""
User Profile:
- Level: {profile.level} ({profile.title})
- Skill: {profile.preferences.skill_level}
- Specimens Identified: {profile.specimens_identified}
- Interests: {', '.join(profile.preferences.interests) if profile.preferences.interests else 'General geology'}

Tailor your response to their skill level:
- Beginner: Use simple explanations, analogies, and avoid jargon
- Intermediate: Include technical terms with brief explanations
- Advanced: Speak peer-to-peer with full scientific vocabulary
"""
        
        system_message = f"""You are Strata, the AI geological mentor embedded in GeoSnap - a cinematic geological intelligence platform.

{skill_context}

Your personality:
- Professional, calm, intelligent
- Never hallucinate data - say "I don't know" when uncertain
- Prefer clarity over cleverness
- Adapt explanation depth to the user's skill level
- Maintain a sense of wonder about geology
- Encourage curiosity and further exploration

Your knowledge covers:
- Rock and mineral identification
- Geological processes and history
- Physical testing methods
- Tectonic and plate theory
- Deep time and Earth history
- Practical field geology
- Crystal systems and mineralogy
- Fossils and paleontology

End responses with a thought-provoking question or fascinating related fact to keep the user engaged.

Keep responses conversational but informative. Use geological terminology appropriately for the user's level."""
        
        chat = LlmChat(
            api_key=api_key,
            session_id=str(uuid.uuid4()),
            system_message=system_message
        ).with_model("openai", "gpt-4o")
        
        prompt = question
        if context:
            prompt = f"Context: {context}\n\nQuestion: {question}"
        
        response = await chat.send_message(UserMessage(text=prompt))
        
        # Track this interaction for personalization
        await update_user_preferences_from_activity(profile.id, "strata_chat", {"question": question})
        
        return {"response": response, "mentor": "Strata"}
        
    except Exception as e:
        logging.error(f"Strata error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
