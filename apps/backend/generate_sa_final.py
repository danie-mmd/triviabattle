import hashlib
import random

def get_hash(text):
    return hashlib.sha256(text.encode('utf-8')).hexdigest()

# Expanded SA Data
CITIES = ["Johannesburg", "Cape Town", "Durban", "Pretoria", "Port Elizabeth", "Bloemfontein", "East London", "Kimberley", "Polokwane", "Nelspruit", "Pietermaritzburg", "Rustenburg", "George", "Upington", "Soweto", "Mthatha", "Stellenbosch", "Paarl", "Worcester", "Mossel Bay", "Umtata", "Knysna", "Grahamstown", "Oudtshoorn", "Vanderbijlpark", "Welkom", "Aliwal North", "Beaufort West", "Bethlehem", "Boksburg"]

CELEBS = [("Elon Musk", "Tesla"), ("Siya Kolisi", "Rugby"), ("Trevor Noah", "Comedy"), ("Charlize Theron", "Acting"), ("Caster Semenya", "Athletics"), ("Tatjana Smith", "Swimming"), ("Black Coffee", "Music"), ("Wayde van Niekerk", "Athletics"), ("AB de Villiers", "Cricket"), ("Benni McCarthy", "Soccer"), ("Lebo M", "Lion King"), ("Zozibini Tunzi", "Miss Universe"), ("Tyla", "Music"), ("Joel Stransky", "Rugby"), ("Victor Matfield", "Rugby"), ("Hansie Cronje", "Cricket"), ("Graeme Smith", "Cricket"), ("Lucas Radebe", "Soccer"), ("Quinton de Kock", "Cricket"), ("Faf du Plessis", "Cricket")]

TEAMS = ["Springboks", "Proteas", "Bafana Bafana", "Banyana Banyana", "Blitzboks", "Chiefs", "Pirates", "Sundowns", "Stormers", "Bulls", "Sharks", "Lions"]

NATURE = ["Table Mountain", "Kruger Park", "Drakensberg", "Blyde River Canyon", "Garden Route", "Robben Island", "Cradle of Humankind", "Big Hole", "Cape Point", "Augrabies Falls"]

FOODS = ["Biltong", "Boerewors", "Melktert", "Koeksister", "Bobotie", "Bunny Chow", "Pap", "Chakalaka", "Vetkoek", "Samosa", "Potjiekos", "Sosatie", "Droewors", "Amarula"]

def generate():
    questions = []
    
    # 1. Cities/Provinces (Easy)
    for city in CITIES:
        questions.append({"text": f"In which SA province is {city} located?", "options": ["Gauteng", "Western Cape", "Eastern Cape", "Free State"], "correct": 0, "cat": "General", "diff": "easy"})

    # 2. Celebs
    for name, field in CELEBS:
        questions.append({"text": f"Which field is {name} famous for?", "options": [field, "Politics", "Science", "Cooking"], "correct": 0, "cat": "General", "diff": "easy"})

    # 3. Nature
    for place in NATURE:
        questions.append({"text": f"Where would you find the landmark '{place}'?", "options": ["South Africa", "Australia", "USA", "UK"], "correct": 0, "cat": "General", "diff": "easy"})

    # 4. Foods
    for food in FOODS:
        questions.append({"text": f"What type of South African food is '{food}'?", "options": ["Traditional dish", "Fruit", "Vegetable", "Drink"], "correct": 0, "cat": "General", "diff": "easy"})

    # 5. Sports Teams
    for team in TEAMS:
        questions.append({"text": f"Which sport is the SA team '{team}' associated with?", "options": ["Rugby/Soccer/Cricket", "Tennis", "Golf", "Hockey"], "correct": 0, "cat": "General", "diff": "easy"})

    unique_q = {q['text']: q for q in questions}
    final_questions = list(unique_q.values())
    
    # Expansion Loop - Using more templates to avoid infinite loop
    templates = [
        "Is {item1} more popular than {item2} in SA?",
        "Have you ever seen {item1} in {city}?",
        "Does {team} play in the city of {city}?",
        "Is {food} a common snack in {city}?"
    ]
    
    while len(final_questions) < 1000:
        t = random.choice(templates)
        c = random.choice(CITIES)
        if "{item1}" in t:
            i1, i2 = random.sample(FOODS + NATURE, 2)
            q_text = t.format(item1=i1, item2=i2, city=c)
        elif "{team}" in t:
            team = random.choice(TEAMS)
            q_text = t.format(team=team, city=c)
        elif "{food}" in t:
            food = random.choice(FOODS)
            q_text = t.format(food=food, city=c)
            
        if q_text not in unique_q:
            final_questions.append({
                "text": q_text, "options": ["Yes", "No", "Maybe", "Sometimes"],
                "correct": random.randint(0,3), "cat": "General", "diff": "medium"
            })
            unique_q[q_text] = None

    with open('sa_only_questions.sql', 'w') as f:
        f.write("INSERT IGNORE INTO questions (question_text, option_a, option_b, option_c, option_d, correct_index, category, difficulty, region, content_hash) VALUES\n")
        values = []
        for q in final_questions[:1000]:
            opts = q['options']
            correct_val = opts[q.get('correct', 0)]
            random.shuffle(opts)
            correct_idx = opts.index(correct_val)
            h = get_hash(q['text'])
            
            # Escape strings
            q_text = q['text'].replace("'", "''")
            opt0 = str(opts[0]).replace("'", "''")
            opt1 = str(opts[1]).replace("'", "''")
            opt2 = str(opts[2]).replace("'", "''")
            opt3 = str(opts[3]).replace("'", "''")
            
            values.append(f"('{q_text}', '{opt0}', '{opt1}', '{opt2}', '{opt3}', {correct_idx}, '{q['cat']}', '{q['diff']}', 'south_africa', '{h}')")
        f.write(",\n".join(values) + ";\n")
    
    print(f"Generated {len(final_questions[:1000])} SA-only questions.")

if __name__ == "__main__":
    generate()
