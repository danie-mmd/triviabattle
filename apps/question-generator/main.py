import os
import re
import json
import hashlib
import logging
import mysql.connector
import vertexai
from datetime import date
from vertexai.generative_models import GenerativeModel

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger(__name__)

def parse_jdbc_url(jdbc_url):
    """
    Parses a JDBC MySQL URL into components.
    Example: jdbc:mysql://35.240.29.145:3306/triviabattle?useSSL=false
    """
    pattern = r"jdbc:mysql://([^:/]+)(?::(\d+))?/([^?]+)"
    match = re.search(pattern, jdbc_url)
    if not match:
        raise ValueError(f"Invalid JDBC URL format: {jdbc_url}")
    
    host = match.group(1)
    port = int(match.group(2)) if match.group(2) else 3306
    database = match.group(3)
    return host, port, database

def generate_hash(text):
    return hashlib.sha256(text.encode('utf-8')).hexdigest()

def build_prompt():
    return f"""
You are a professional trivia question generator. Today is {date.today()}.

TASK:
Generate exactly 10 SHORT, PUNCHY trivia questions.
Provide a mix of:
- 50% CURRENT trending news and events (South Africa & Global).
- 50% EVERGREEN general knowledge (History, Geography, Science, Movies, etc.).

DIFFICULTY MIX:
- 4 Easy questions
- 4 Medium questions
- 2 Hard questions

STYLE RULES:
- BREVITY IS KEY: Questions must be short and direct (MAX 100 characters).
- NO FILLER: Avoid introductory clauses.
- FUTURE-PROOF: Do NOT use temporary relative phrases like "this weekend".
- GET STRAIGHT TO THE POINT.

JSON FORMAT (Return ONLY the array):
[
  {{
    "question": "What...",
    "options": ["A", "B", "C", "D"],
    "correctIndex": 0,
    "category": "Topic",
    "difficulty": "easy/medium/hard",
    "region": "south_africa/global"
  }}
]

RULES:
- Options must be concise (max 3-5 words each).
- Difficulty must exactly match the requested mix.
- Region must be "south_africa" (5 questions) or "global" (5 questions).
"""


def main():
    project_id = os.environ.get("GCP_PROJECT_ID")
    location = os.environ.get("GCP_LOCATION", "europe-west-1")
    model_name = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")
    
    mysql_url = os.environ.get("MYSQL_URL")
    mysql_user = os.environ.get("MYSQL_USERNAME", "trivia")
    mysql_password = os.environ.get("MYSQL_PASSWORD")

    if not all([project_id, mysql_url, mysql_password]):
        logger.error("Missing required environment variables: GCP_PROJECT_ID, MYSQL_URL, or MYSQL_PASSWORD")
        exit(1)

    # Initialize Vertex AI
    vertexai.init(project=project_id, location=location)
    model = GenerativeModel(model_name)

    host, port, db_name = parse_jdbc_url(mysql_url)

    logger.info(f"Starting question generation using Vertex AI model: {model_name} in {location}")

    # 1. Call Gemini API
    prompt = build_prompt()
    
    try:
        response = model.generate_content(prompt)
        raw_text = response.text
        # Clean up Markdown block if present
        raw_text = re.sub(r"```json\s*", "", raw_text)
        raw_text = re.sub(r"```\s*", "", raw_text)
        questions = json.loads(raw_text.strip())
    except Exception as e:
        logger.error(f"Failed to fetch or parse questions from Gemini: {e}")
        exit(1)

    # 2. Persist to MySQL
    try:
        conn = mysql.connector.connect(
            host=host,
            port=port,
            user=mysql_user,
            password=mysql_password,
            database=db_name
        )
        cursor = conn.cursor()

        saved_count = 0
        for q in questions:
            text = q['question']
            content_hash = generate_hash(text)

            # Check for duplicate
            cursor.execute("SELECT id FROM questions WHERE content_hash = %s", (content_hash,))
            if cursor.fetchone():
                continue

            opts = q['options']
            sql = """
                INSERT INTO questions 
                (question_text, option_a, option_b, option_c, option_d, correct_index, category, difficulty, region, content_hash, active) 
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            val = (
                text, opts[0], opts[1], opts[2], opts[3], 
                q['correctIndex'], q['category'], 
                q['difficulty'].upper(), q['region'].upper(), 
                content_hash, 1
            )
            cursor.execute(sql, val)
            saved_count += 1
        
        conn.commit()
        logger.info(f"Successfully generated and saved {saved_count} questions.")
        
    except mysql.connector.Error as err:
        logger.error(f"MySQL Error: {err}")
        exit(1)
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

if __name__ == "__main__":
    main()
