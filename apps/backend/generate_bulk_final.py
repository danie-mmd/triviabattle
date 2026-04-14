import hashlib
import random

def get_hash(text):
    return hashlib.sha256(text.encode('utf-8')).hexdigest()

PROVINCES = {
    "Gauteng": "Johannesburg", "Western Cape": "Cape Town", "KwaZulu-Natal": "Pietermaritzburg",
    "Eastern Cape": "Bhisho", "Free State": "Bloemfontein", "Limpopo": "Polokwane",
    "Mpumalanga": "Mbombela", "North West": "Mahikeng", "Northern Cape": "Kimberley"
}

CITY_COORDS = {
    "Johannesburg": (-26.2, 28.0), "Cape Town": (-33.9, 18.4), "Durban": (-29.8, 31.0),
    "Pretoria": (-25.7, 28.2), "Port Elizabeth": (-33.9, 25.6), "Bloemfontein": (-29.1, 26.2),
    "East London": (-33.0, 27.9), "Kimberley": (-28.7, 24.7), "Polokwane": (-23.9, 29.4),
    "Nelspruit": (-25.4, 30.9), "Pietermaritzburg": (-29.6, 30.3), "Rustenburg": (-25.6, 27.2),
    "George": (-33.9, 22.4), "Upington": (-28.4, 21.2), "Soweto": (-26.2, 27.8),
    "Mthatha": (-31.5, 28.7), "Stellenbosch": (-33.9, 18.8), "Paarl": (-33.7, 18.9),
    "Worcester": (-33.6, 19.4), "Mossel Bay": (-34.1, 22.1), "Hermanus": (-34.4, 19.2),
    "Plettenberg Bay": (-34.0, 23.3), "Oudtshoorn": (-33.5, 22.2), "Knysna": (-34.0, 23.0),
    "Beaufort West": (-32.3, 22.5), "De Aar": (-30.6, 24.0), "Graaff-Reinet": (-32.2, 24.5),
    "Ladysmith": (-28.5, 29.7), "Newcastle": (-27.7, 29.9), "Vryheid": (-27.7, 30.7),
    "Richards Bay": (-28.7, 32.0), "Empangeni": (-28.7, 31.8), "Port Shepstone": (-30.7, 30.4)
}

CELEBS = [
    ("Elon Musk", "Tesla/SpaceX Founder"), ("Charlize Theron", "Oscar-winning Actress"),
    ("Trevor Noah", "Comedian/The Daily Show"), ("Siya Kolisi", "Springbok Captain"),
    ("Wayde van Niekerk", "400m World Record Holder"), ("Tatjana Smith", "Olympic Swimmer"),
    ("Caster Semenya", "Middle-distance Runner"), ("AB de Villiers", "Cricketer"),
    ("Benni McCarthy", "Soccer Legend"), ("Black Coffee", "Grammy-winning DJ"),
    ("Miriam Makeba", "Mama Africa"), ("Brenda Fassie", "MaBrrr"),
    ("Lebo M", "Lion King Composer"), ("Mark Shuttleworth", "First SA in Space"),
    ("Sydney Brenner", "Nobel Prize in Medicine"), ("Christiaan Barnard", "First heart transplant surgeon"),
    ("Steve Biko", "Black Consciousness Leader")
]

FOODS = [
    ("Biltong", "Dried, cured meat"), ("Boerewors", "Spicy farmer sausage"), ("Melktert", "Milk tart"),
    ("Koeksister", "Syrup-coated braided pastry"), ("Bobotie", "Spiced minced meat"),
    ("Bunny Chow", "Curry in a hollowed loaf"), ("Pap", "Maize porridge"), ("Vredenburg", "A town, not food"),
    ("Malva Pudding", "Sweet apricot pudding"), ("Vetkoek", "Deep-fried dough bread")
]

SLANG = [
    ("Lekker", "Nice/Good"), ("Braai", "Barbecue"), ("Robot", "Traffic light"),
    ("Just now", "In a while"), ("Howzit", "Hello"), ("Ubuntu", "Humanity towards others"),
    ("Eish", "Exclamation of surprise"), ("Takkies", "Sneakers")
]

EVENTS = [
    ("First democratic election", "1994"), ("Host of FIFA World Cup", "2010"),
    ("Release of Nelson Mandela", "1990"), ("Adoption of the current flag", "1994"),
    ("Rugby World Cup win (first)", "1995")
]

LANDMARKS = [
    ("Robben Island", "Western Cape"), ("Table Mountain", "Western Cape"),
    ("The Big Hole", "Northern Cape"), ("Kruger National Park", "Mpumalanga/Limpopo"),
    ("Sun City", "North West"), ("Union Buildings", "Gauteng")
]

def generate():
    questions = []
    
    # 1. Geographic Comparisons (Most numerous)
    cities = list(CITY_COORDS.keys())
    for _ in range(600):
        c1, c2 = random.sample(cities, 2)
        lat1, lon1 = CITY_COORDS[c1]
        lat2, lon2 = CITY_COORDS[c2]
        
        if random.random() > 0.5: # North/South
            winner, loser, dir_name = (c1, c2, "further North") if lat1 > lat2 else (c2, c1, "further North")
            questions.append({
                "text": f"Which of these South African cities is located {dir_name}?",
                "options": [winner, loser, "They are same", "Neither"], "correct": 0, "cat": "Geography", "diff": "medium"
            })
        else: # East/West
            winner, loser, dir_name = (c1, c2, "further East") if lon1 > lon2 else (c2, c1, "further East")
            questions.append({
                "text": f"Which city lies {dir_name}?",
                "options": [winner, loser, "Same", "None"], "correct": 0, "cat": "Geography", "diff": "medium"
            })
            
    # 2. Celebs
    for name, fact in CELEBS:
        questions.append({
            "text": f"Which famous person is a {fact}?",
            "options": [name, "Siya Kolisi", "Elon Musk", "Trevor Noah"] if name not in ["Siya Kolisi", "Elon Musk", "Trevor Noah"] else [name, "Black Coffee", "Nelson Mandela", "Tyla"],
            "correct": 0, "cat": "Entertainment", "diff": "easy"
        })
        
    # 3. Events
    for event, year in EVENTS:
        questions.append({
            "text": f"In which year did the {event} occur?",
            "options": [year, "1994" if year != "1994" else "1990", "1976", "2010"],
            "correct": 0, "cat": "History", "diff": "easy"
        })
        
    # 4. Foods & Slang (mix them)
    for name, desc in FOODS + SLANG:
        questions.append({
            "text": f"What is '{name}' in SA culture?",
            "options": [desc, "A town", "A language", "A political party"],
            "correct": 0, "cat": "Culture", "diff": "easy"
        })

    # 5. Provinces & Capitals
    for p, c in PROVINCES.items():
        questions.append({
            "text": f"What is the capital of {p}?",
            "options": [c, "Johannesburg", "Pretoria", "Cape Town"] if c not in ["Johannesburg", "Pretoria", "Cape Town"] else [c, "Durban", "Bloemfontein", "Kimberley"],
            "correct": 0, "cat": "Geography", "diff": "easy"
        })

    # Deduplicate by text
    unique_q = {}
    for q in questions:
        unique_q[q['text']] = q
        
    final_questions = list(unique_q.values())
    
    # Trim to 1000 if over, but we probably need more if we want 1000 EXACTLY.
    # We have ~600 geo + 17 celeb + 5 event + 18 food/slang + 9 prov = ~650.
    # I'll add more geo pairs to ensure we hit 1000.
    
    while len(final_questions) < 1000:
        c1, c2 = random.sample(cities, 2)
        q_text = f"Is {c1} further North than {c2}?"
        if q_text not in unique_q:
            lat1, _ = CITY_COORDS[c1]
            lat2, _ = CITY_COORDS[c2]
            ans = "Yes" if lat1 > lat2 else "No"
            q = {"text": q_text, "options": [ans, "No" if ans == "Yes" else "Yes", "Same", "Unknown"], "correct": 0, "cat": "Geography", "diff": "medium"}
            unique_q[q_text] = q
            final_questions.append(q)

    with open('bulk_sa_questions.sql', 'w') as f:
        f.write("INSERT IGNORE INTO questions (question_text, option_a, option_b, option_c, option_d, correct_index, category, difficulty, region, content_hash) VALUES\n")
        values = []
        for q in final_questions[:1000]:
            opts = q['options']
            correct_val = opts[0]
            random.shuffle(opts)
            correct_idx = opts.index(correct_val)
            h = get_hash(q['text'])
            
            # Escape single quotes
            q_text = q['text'].replace("'", "''")
            opt0 = opts[0].replace("'", "''")
            opt1 = opts[1].replace("'", "''")
            opt2 = opts[2].replace("'", "''")
            opt3 = opts[3].replace("'", "''")
            cat = q['cat'].replace("'", "''")
            diff = q['diff'].replace("'", "''")
            
            values.append(f"('{q_text}', '{opt0}', '{opt1}', '{opt2}', '{opt3}', {correct_idx}, '{cat}', '{diff}', 'south_africa', '{h}')")
        f.write(",\n".join(values) + ";\n")
    
    print(f"Generated {len(final_questions[:1000])} questions.")

if __name__ == "__main__":
    generate()
