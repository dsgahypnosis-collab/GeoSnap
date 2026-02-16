#!/usr/bin/env python3
"""
GeoSnap API Backend Testing Suite
Tests all core API endpoints including AI identification, field notes, and Strata mentor
"""
import requests
import json
import base64
import sys
import os
from datetime import datetime
import uuid

# Load backend URL from frontend .env
def get_backend_url():
    try:
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if line.startswith('EXPO_PUBLIC_BACKEND_URL='):
                    return line.split('=', 1)[1].strip()
    except Exception as e:
        print(f"Warning: Could not read frontend .env file: {e}")
    return "https://geologic-eye.preview.emergentagent.com"

BACKEND_URL = get_backend_url()
API_BASE = f"{BACKEND_URL}/api"

print(f"Testing GeoSnap API at: {API_BASE}")

def test_health():
    """Test health check endpoint"""
    print("\n=== Testing Health Check ===")
    try:
        response = requests.get(f"{API_BASE}/health", timeout=10)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False

def test_profile():
    """Test user profile endpoint"""
    print("\n=== Testing User Profile ===")
    try:
        response = requests.get(f"{API_BASE}/profile", timeout=10)
        print(f"Status: {response.status_code}")
        data = response.json()
        print(f"User: {data.get('username', 'N/A')}")
        print(f"Level: {data.get('level', 0)} - {data.get('title', 'N/A')}")
        print(f"Total XP: {data.get('total_xp', 0)}")
        print(f"Specimens Identified: {data.get('specimens_identified', 0)}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Profile test failed: {e}")
        return False

def test_leaderboard():
    """Test leaderboard/gamification endpoint"""
    print("\n=== Testing Leaderboard ===")
    try:
        response = requests.get(f"{API_BASE}/leaderboard", timeout=10)
        print(f"Status: {response.status_code}")
        data = response.json()
        print(f"Level Progress: {data.get('level_progress', 0):.1%}")
        print(f"XP to Next Level: {data.get('xp_to_next_level', 0)}")
        print(f"Achievements: {data.get('unlocked_achievements', 0)}/{data.get('total_achievements', 0)}")
        
        # Check if personalized content is included
        personalized = data.get('personalized', {})
        if personalized:
            print(f"Daily Tip: {personalized.get('daily_tip', 'N/A')[:60]}...")
            print(f"Learning Focus: {personalized.get('learning_focus', 'N/A')}")
        
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Leaderboard test failed: {e}")
        return False

def test_personalized_content():
    """Test personalized content endpoint"""
    print("\n=== Testing Personalized Content ===")
    try:
        response = requests.get(f"{API_BASE}/personalized-content", timeout=10)
        print(f"Status: {response.status_code}")
        data = response.json()
        print(f"Daily Tip: {data.get('daily_tip', 'N/A')[:80]}...")
        print(f"Recommended Tests: {', '.join(data.get('recommended_tests', []))}")
        print(f"Learning Focus: {data.get('learning_focus', 'N/A')}")
        print(f"Streak Message: {data.get('streak_message', 'N/A')}")
        print(f"Geological Fact: {data.get('geological_fact', 'N/A')[:60]}...")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Personalized content test failed: {e}")
        return False

def test_track_activity():
    """Test activity tracking endpoint"""
    print("\n=== Testing Activity Tracking ===")
    try:
        response = requests.post(
            f"{API_BASE}/track-activity?activity_type=session_start",
            json={},
            timeout=10
        )
        print(f"Status: {response.status_code}")
        data = response.json()
        print(f"Response: {data}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Activity tracking test failed: {e}")
        return False

def test_physical_test_guidance():
    """Test physical test guidance endpoints"""
    print("\n=== Testing Physical Test Guidance ===")
    
    test_types = ["hardness", "streak", "luster", "cleavage", "magnetism", "density"]
    success_count = 0
    
    for test_type in test_types:
        try:
            response = requests.get(f"{API_BASE}/physical-test-guidance/{test_type}", timeout=10)
            print(f"\n{test_type.capitalize()} Test - Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"Instructions: {len(data.get('instructions', []))} steps")
                print(f"Materials: {', '.join(data.get('materials_needed', []))}")
                print(f"Examples: {len(data.get('examples', []))} provided")
                success_count += 1
            else:
                print(f"❌ Failed: {response.text}")
        except Exception as e:
            print(f"❌ {test_type} guidance test failed: {e}")
    
    return success_count == len(test_types)

def test_field_notes_crud():
    """Test field notes CRUD operations"""
    print("\n=== Testing Field Notes CRUD ===")
    
    # Create a field note
    print("\n1. Creating field note...")
    note_data = {
        "title": "Granite Outcrop Discovery - Sierra Nevada",
        "content": "Found excellent granite exposure showing large feldspar crystals and biotite mica. Evidence of glacial polishing on eastern face. Collected samples for hardness testing.",
        "latitude": 37.7749,
        "longitude": -119.5194,
        "location_name": "Yosemite National Park, CA",
        "tags": ["granite", "igneous", "feldspar", "biotite", "glacial"]
    }
    
    try:
        response = requests.post(f"{API_BASE}/field-notes", json=note_data, timeout=10)
        print(f"Create Status: {response.status_code}")
        
        if response.status_code == 200:
            created_note = response.json()
            note_id = created_note.get('id')
            print(f"Created Note ID: {note_id}")
            print(f"Title: {created_note.get('title')}")
            
            # Get all field notes
            print("\n2. Retrieving all field notes...")
            response = requests.get(f"{API_BASE}/field-notes", timeout=10)
            print(f"Get All Status: {response.status_code}")
            
            if response.status_code == 200:
                notes = response.json()
                print(f"Total Notes: {len(notes)}")
                if notes:
                    print(f"Latest Note: {notes[0].get('title', 'N/A')}")
            
            # Get specific field note
            if note_id:
                print(f"\n3. Retrieving specific note {note_id}...")
                response = requests.get(f"{API_BASE}/field-notes/{note_id}", timeout=10)
                print(f"Get One Status: {response.status_code}")
                
                # Delete the note
                print(f"\n4. Deleting note {note_id}...")
                response = requests.delete(f"{API_BASE}/field-notes/{note_id}", timeout=10)
                print(f"Delete Status: {response.status_code}")
                
                if response.status_code == 200:
                    print("✅ Field Notes CRUD operations successful")
                    return True
        
        return False
        
    except Exception as e:
        print(f"❌ Field notes CRUD test failed: {e}")
        return False

def create_sample_image_base64():
    """Create a small sample image in base64 format for testing"""
    # Create a simple 10x10 red square in base64
    # This is a minimal PNG for testing purposes
    png_data = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\n\x00\x00\x00\n\x08\x02\x00\x00\x00\x02PX\xea\x00\x00\x00\x1eIDATx\x9cc\xf8\x0f\x00\x00\x00\x00\xff\xff\x03\x00\x00\x00\xff\xff\x03\x00\x00\x00\xff\xff\x03\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x02\x00\x01 \x05\x82v\x00\x00\x00\x00IEND\xaeB`\x82'
    return base64.b64encode(png_data).decode('utf-8')

def test_ai_identification():
    """Test AI specimen identification endpoint"""
    print("\n=== Testing AI Specimen Identification ===")
    
    # Note: This test uses a minimal test image since we don't have a real rock image
    # The API will process it but identification quality will be limited
    
    try:
        test_image = create_sample_image_base64()
        
        identify_data = {
            "image_base64": test_image,
            "latitude": 36.1627,
            "longitude": -115.1392,
            "physical_tests": [
                {
                    "test_type": "hardness",
                    "result": "6-7 on Mohs scale",
                    "confidence": 0.8
                },
                {
                    "test_type": "streak",
                    "result": "white to light gray",
                    "confidence": 0.9
                }
            ]
        }
        
        print("Sending identification request (using test image)...")
        response = requests.post(f"{API_BASE}/identify", json=identify_data, timeout=30)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Specimen ID: {data.get('id', 'N/A')}")
            
            identification = data.get('identification', {})
            primary = identification.get('primary_identification', {})
            print(f"Primary ID: {primary.get('name', 'N/A')} ({primary.get('confidence', 0):.1%} confidence)")
            print(f"Rock Type: {primary.get('rock_type', 'N/A')}")
            
            specimen_data = data.get('specimen_data', {})
            print(f"Classification: {specimen_data.get('classification', 'N/A')}")
            print(f"Hardness: {specimen_data.get('hardness', 'N/A')}")
            print(f"XP Earned: {data.get('xp_earned', 0)}")
            
            print("✅ AI identification endpoint working (with test image)")
            return True
        else:
            print(f"❌ AI identification failed: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ AI identification test failed: {e}")
        return False

def test_strata_mentor():
    """Test Strata AI mentor endpoint"""
    print("\n=== Testing Strata AI Mentor ===")
    
    geological_questions = [
        "How do I identify granite in the field?",
        "What's the difference between cleavage and fracture?",
        "How are metamorphic rocks formed?"
    ]
    
    success_count = 0
    
    for i, question in enumerate(geological_questions, 1):
        try:
            print(f"\n{i}. Question: {question}")
            response = requests.post(
                f"{API_BASE}/strata/ask?question={question}",
                timeout=20
            )
            print(f"Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                answer = data.get('response', '')
                print(f"Answer preview: {answer[:100]}...")
                print(f"Mentor: {data.get('mentor', 'N/A')}")
                success_count += 1
            else:
                print(f"❌ Failed: {response.text}")
        except Exception as e:
            print(f"❌ Question {i} failed: {e}")
    
    if success_count > 0:
        print(f"✅ Strata mentor responded to {success_count}/{len(geological_questions)} questions")
        return True
    return False

def run_comprehensive_test():
    """Run all API tests and report results"""
    print("🔬 GeoSnap API Comprehensive Test Suite")
    print("=" * 50)
    
    tests = [
        ("Health Check", test_health),
        ("User Profile", test_profile), 
        ("Leaderboard", test_leaderboard),
        ("Personalized Content", test_personalized_content),
        ("Activity Tracking", test_track_activity),
        ("Physical Test Guidance", test_physical_test_guidance),
        ("Field Notes CRUD", test_field_notes_crud),
        ("AI Identification", test_ai_identification),
        ("Strata AI Mentor", test_strata_mentor)
    ]
    
    results = {}
    passed = 0
    
    for test_name, test_func in tests:
        print(f"\n{'='*60}")
        try:
            result = test_func()
            results[test_name] = result
            if result:
                passed += 1
                print(f"✅ {test_name}: PASSED")
            else:
                print(f"❌ {test_name}: FAILED")
        except Exception as e:
            results[test_name] = False
            print(f"❌ {test_name}: EXCEPTION - {e}")
    
    # Final Summary
    print(f"\n{'='*60}")
    print("🔬 GEOSNAP API TEST SUMMARY")
    print("=" * 60)
    print(f"Tests Passed: {passed}/{len(tests)}")
    print(f"Success Rate: {passed/len(tests)*100:.1f}%")
    print()
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status:<8} {test_name}")
    
    print("\n" + "=" * 60)
    
    if passed == len(tests):
        print("🎉 All tests passed! GeoSnap API is fully functional.")
    elif passed >= len(tests) * 0.8:
        print("⚠️  Most tests passed. Minor issues may need attention.")
    else:
        print("🚨 Multiple failures detected. API needs investigation.")
    
    return results

if __name__ == "__main__":
    results = run_comprehensive_test()
    
    # Exit with appropriate code
    total_tests = len(results)
    passed_tests = sum(1 for r in results.values() if r)
    
    if passed_tests == total_tests:
        sys.exit(0)  # All passed
    elif passed_tests >= total_tests * 0.8:
        sys.exit(1)  # Most passed, minor issues
    else:
        sys.exit(2)  # Major failures