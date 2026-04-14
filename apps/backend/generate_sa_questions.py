import os
import json
import hashlib
import time
import requests
import re

def load_env(path):
    if not os.path.exists(path):
        return
    with open(path, 'r') as f:
        for line in f:
            if '=' in line and not line.startswith('#'):
                key, val = line.strip().split('=', 1)
                os.environ[key] = val.strip('"').strip("'")

# Load .env from project root
load_env('../../.env')

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
GEMINI_MODEL = os.getenv('app.gemini.model', 'gemini-1.5-flash')

if not GEMINI_API_KEY or GEMINI_API_KEY == 'your_gemini_api_key_here':
    print("Error: GEMINI_API_KEY not found or is placeholder.")
    exit(1)

API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"

def generate_questions(batch_size=50):
    prompt = f"""
    Generate exactly {batch_size} unique trivia questions about South Africa.
    Focus on a wide range of topics: history, geography, politics, sports, music, food, culture, and general knowledge.
    
    Return ONLY a valid JSON array of objects in this exact format:
    [
      {{
        "question": "What is the capital of South Africa?",
        "options": ["Johannesburg", "Pretoria", "Cape Town", "Bloemfontein"],
        "correctIndex": 1,
        "category": "Geography",
        "difficulty": "easy",
        "region": "south_africa"
      }}
    ]
    
    Rules:
    - correctIndex must be 0-3.
    - difficulty: "easy", "medium", or "hard".
    - region: "south_africa".
    - No markdown formatting (no ```json).
    - Ensure factual accuracy.
    - Avoid duplicates within the batch.
    """
    
    payload = {
        "contents": [{
            "parts": [{"text": prompt}]
        }]
    }
    
    try:
        response = requests.post(API_URL, json=payload, timeout=60)
        response.raise_for_status()
        data = response.json()
        
        text = data['candidates'][0]['content']['parts'][0]['text']
        # Remove markdown if any
        if '```' in text:
            text = text.split('```')[1]
            if text.startswith('json'):
                text = text[4:]
        
        return json.loads(text.strip())
    except Exception as e:
        print(f"Error generating batch: {e}")
        return []

def get_hash(text):
    return hashlib.sha256(text.encode('utf-8')).hexdigest()

def main():
    target_count = 1000
    batch_size = 50
    all_questions = []
    
    print(f"Starting generation of {target_count} questions...")
    
    while len(all_questions) < target_count:
        print(f"Generating batch {len(all_questions)//batch_size + 1}...")
        batch = generate_questions(batch_size)
        
        if not batch:
            print("Batch failed, retrying in 5 seconds...")
            time.sleep(5)
            continue
            
        all_questions.extend(batch)
        print(f"Total so far: {len(all_questions)}")
        
        if len(all_questions) < target_count:
            # Sleep to avoid rate limits
            time.sleep(2)
            
    # Trim to target_count
    all_questions = all_questions[:target_count]
    
    with open('new_sa_questions.sql', 'w') as f:
        f.write("-- Bulk generated South African questions\n")
        f.write("INSERT IGNORE INTO questions (question_text, option_a, option_b, option_c, option_d, correct_index, category, difficulty, region, content_hash) VALUES\n")
        
        values = []
        for q in all_questions:
            try:
                text = q['question'].replace("'", "''")
                opt_a = q['options'][0].replace("'", "''")
                opt_b = q['options'][1].replace("'", "''")
                opt_c = q['options'][2].replace("'", "''")
                opt_d = q['options'][3].replace("'", "''")
                idx = q['correctIndex']
                cat = q['category'].replace("'", "''")
                diff = q['difficulty'].lower()
                reg = q['region'].lower()
                hash_val = get_hash(q['question'])
                
                values.append(f"('{text}', '{opt_a}', '{opt_b}', '{opt_c}', '{opt_d}', {idx}, '{cat}', '{diff}', '{reg}', '{hash_val}')")
            except Exception as e:
                print(f"Error processing question: {e}")
                
        f.write(",\n".join(values))
        f.write(";\n")
        
    print(f"Successfully generated {len(values)} questions into new_sa_questions.sql")

if __name__ == "__main__":
    main()
