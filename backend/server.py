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
from datetime import datetime
import base64
import json

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
    test_type: str  # hardness, streak, luster, cleavage, magnetism, density
    result: str
    confidence: float = 0.8

class IdentificationCandidate(BaseModel):
    name: str
    scientific_name: Optional[str] = None
    confidence: float
    rock_type: str  # igneous, sedimentary, metamorphic, mineral
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
    classification: str  # igneous, sedimentary, metamorphic, mineral, gemstone
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
    requirement_type: str  # specimens_identified, tests_performed, collection_size, etc.
    requirement_value: int

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
    created_at: datetime = Field(default_factory=datetime.utcnow)

class IdentifyRequest(BaseModel):
    image_base64: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    physical_tests: List[PhysicalTest] = []

class PhysicalTestGuidance(BaseModel):
    test_type: str
    instructions: List[str]
    materials_needed: List[str]
    what_to_observe: str
    examples: List[Dict[str, str]]

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
]

LEVEL_TITLES = {
    1: "Novice Geologist",
    2: "Rock Enthusiast",
    3: "Mineral Apprentice",
    4: "Stone Scholar",
    5: "Crystal Seeker",
    6: "Formation Expert",
    7: "Stratum Master",
    8: "Geological Sage",
    9: "Earth Historian",
    10: "Master Geologist"
}

def calculate_level(xp: int) -> tuple[int, str]:
    """Calculate level based on XP"""
    level = 1
    xp_thresholds = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500]
    for i, threshold in enumerate(xp_thresholds):
        if xp >= threshold:
            level = i + 1
    return level, LEVEL_TITLES.get(level, "Master Geologist")

# ==================== AI IDENTIFICATION ====================

async def identify_specimen_with_ai(image_base64: str, latitude: Optional[float], longitude: Optional[float], physical_tests: List[PhysicalTest]) -> tuple[SpecimenIdentification, SpecimenData]:
    """Use OpenAI GPT-4o to identify the specimen"""
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
            location_context = f"\n\nLocation: {latitude}, {longitude}"
        
        system_message = """You are Strata, an expert AI geological mentor embedded in GeoSnap - a cinematic geological intelligence platform. 

Your role is to identify rocks, minerals, and gemstones with scientific rigor while explaining your reasoning clearly.

CRITICAL RULES:
1. NEVER guess blindly - always explain the evidence for your identification
2. Provide confidence scores honestly (0.0-1.0)
3. List multiple candidates when uncertain
4. Consider geological plausibility based on location
5. Use physical test results to refine identification
6. Explain what features led to your conclusion

You must respond in valid JSON format with this exact structure:
{
    "primary_identification": {
        "name": "Common name",
        "scientific_name": "Scientific name if applicable",
        "confidence": 0.85,
        "rock_type": "igneous|sedimentary|metamorphic|mineral|gemstone",
        "reasons": ["Reason 1", "Reason 2"]
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
    "evidence_used": ["Visual feature 1", "Visual feature 2"],
    "uncertainty_notes": "Any caveats or additional info needed",
    "specimen_data": {
        "common_name": "Name",
        "scientific_name": "Scientific name",
        "classification": "igneous|sedimentary|metamorphic|mineral|gemstone",
        "mineral_group": "Group if applicable",
        "chemical_composition": "Chemical formula",
        "crystal_system": "System if crystalline",
        "hardness": "Mohs scale value",
        "density": "g/cm³",
        "luster": "Type of luster",
        "cleavage": "Cleavage description",
        "fracture": "Fracture type",
        "streak": "Streak color",
        "optical_properties": "Any notable optical properties",
        "toxicity_warning": "Safety warnings if any",
        "formation_process": "How it forms",
        "geological_era": "When it typically formed",
        "plate_tectonic_context": "Tectonic setting",
        "environmental_conditions": "Formation conditions",
        "scientific_value": "Scientific importance",
        "collector_value": "Collectibility",
        "market_value_range": "Approximate value range",
        "interesting_facts": ["Fact 1", "Fact 2", "Fact 3"]
    }
}"""
        
        user_prompt = f"""Analyze this rock/mineral/gemstone specimen image and provide a detailed identification.

{test_context}
{location_context}

Examine carefully:
- Color, luster, and surface texture
- Crystal habit or grain structure
- Visible cleavage or fracture patterns
- Any inclusions or weathering
- Overall morphology

Provide your identification with honest confidence levels. If uncertain, list multiple candidates."""
        
        chat = LlmChat(
            api_key=api_key,
            session_id=str(uuid.uuid4()),
            system_message=system_message
        ).with_model("openai", "gpt-4o")
        
        # Create image content
        image_content = ImageContent(image_base64=image_base64)
        
        user_message = UserMessage(
            text=user_prompt,
            image_contents=[image_content]
        )
        
        response = await chat.send_message(user_message)
        
        # Parse the JSON response
        try:
            # Clean the response if it has markdown code blocks
            response_text = response.strip()
            if response_text.startswith("```json"):
                response_text = response_text[7:]
            if response_text.startswith("```"):
                response_text = response_text[3:]
            if response_text.endswith("```"):
                response_text = response_text[:-3]
            
            result = json.loads(response_text.strip())
            
            # Build identification object
            primary = IdentificationCandidate(**result["primary_identification"])
            secondary = [IdentificationCandidate(**c) for c in result.get("secondary_candidates", [])]
            
            identification = SpecimenIdentification(
                primary_identification=primary,
                secondary_candidates=secondary,
                evidence_used=result.get("evidence_used", []),
                uncertainty_notes=result.get("uncertainty_notes"),
                physical_tests_performed=physical_tests
            )
            
            # Build specimen data
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
                interesting_facts=spec_data.get("interesting_facts", [])
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

# ---------- Identification ----------

@api_router.post("/identify", response_model=Specimen)
async def identify_specimen(request: IdentifyRequest):
    """
    ACT I: ENCOUNTER - The specimen is discovered
    ACT II: INTERROGATION - AI analyzes with physical tests
    ACT III: REVELATION - The answer resolves
    """
    try:
        # Run AI identification
        identification, specimen_data = await identify_specimen_with_ai(
            request.image_base64,
            request.latitude,
            request.longitude,
            request.physical_tests
        )
        
        # Calculate XP earned (based on confidence and tests performed)
        base_xp = 25
        confidence_bonus = int(identification.primary_identification.confidence * 25)
        test_bonus = len(request.physical_tests) * 10
        xp_earned = base_xp + confidence_bonus + test_bonus
        
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
        
        # Update user profile
        await update_user_stats("specimens_identified", 1, xp_earned)
        if request.physical_tests:
            await update_user_stats("tests_performed", len(request.physical_tests), 0)
        
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
    
    # Update user stats
    await update_user_stats("collection_size", 1, 15)
    
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
        new_profile = UserProfile(achievements=DEFAULT_ACHIEVEMENTS)
        await db.user_profiles.insert_one(new_profile.dict())
        return new_profile
    return UserProfile(**profile)

async def update_user_stats(stat_type: str, increment: int, xp_bonus: int = 0):
    """Update user statistics and check achievements"""
    profile = await get_or_create_profile()
    
    # Update the stat
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
    
    update_data["achievements"] = [a.dict() for a in achievements]
    
    await db.user_profiles.update_one(
        {"id": profile.id},
        {"$set": update_data}
    )
    
    return newly_unlocked

@api_router.get("/profile", response_model=UserProfile)
async def get_profile():
    """Get user profile with stats and achievements"""
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
    
    # Calculate next level XP
    xp_thresholds = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500]
    current_threshold = xp_thresholds[profile.level - 1] if profile.level <= 10 else xp_thresholds[-1]
    next_threshold = xp_thresholds[profile.level] if profile.level < 10 else xp_thresholds[-1] + 1000
    
    return {
        "profile": profile,
        "xp_to_next_level": next_threshold - profile.total_xp,
        "level_progress": (profile.total_xp - current_threshold) / (next_threshold - current_threshold) if next_threshold > current_threshold else 1.0,
        "unlocked_achievements": len([a for a in profile.achievements if a.unlocked]),
        "total_achievements": len(profile.achievements)
    }

# ---------- Strata AI Mentor ----------

@api_router.post("/strata/ask")
async def ask_strata(question: str, context: Optional[str] = None):
    """Ask Strata, the AI geological mentor"""
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not api_key:
            raise ValueError("EMERGENT_LLM_KEY not found")
        
        system_message = """You are Strata, the AI geological mentor embedded in GeoSnap.

Your personality:
- Professional, calm, intelligent
- Never hallucinate data - say "I don't know" when uncertain
- Prefer clarity over cleverness
- Adapt explanation depth to the question complexity
- Maintain a sense of wonder about geology

Your knowledge covers:
- Rock and mineral identification
- Geological processes and history
- Physical testing methods
- Tectonic and plate theory
- Deep time and Earth history
- Practical field geology

Keep responses concise but informative. Use geological terminology but explain it when needed."""
        
        chat = LlmChat(
            api_key=api_key,
            session_id=str(uuid.uuid4()),
            system_message=system_message
        ).with_model("openai", "gpt-4o")
        
        prompt = question
        if context:
            prompt = f"Context: {context}\n\nQuestion: {question}"
        
        response = await chat.send_message(UserMessage(text=prompt))
        
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
