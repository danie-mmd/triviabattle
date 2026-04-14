# Coordinates (Approximate Lat/Lon) for some major cities
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

def expand(gen_file):
    with open(gen_file, 'r') as f:
        content = f.read()

    # Add Coords before generate
    content = content.replace("CELEBS = ", "CITY_COORDS = " + str(CITY_COORDS) + "\\nCELEBS = ")

    # Add Template 20: Geographic Comparisons
    template_str = """
    # Template 20: Geographic Comparisons
    import random
    cities = list(CITY_COORDS.keys())
    for _ in range(300):
        c1, c2 = random.sample(cities, 2)
        lat1, lon1 = CITY_COORDS[c1]
        lat2, lon2 = CITY_COORDS[c2]
        
        # North/South
        if abs(lat1 - lat2) > 0.5:
            if lat1 > lat2: # Surther South (more negative)
                winner, loser, dir_name = c1, c2, "South"
            else:
                winner, loser, dir_name = c2, c1, "South"
                
            questions.append({
                "text": f"Which of these South African cities is located further {dir_name}?",
                "options": [winner, loser, "They are at the same latitude", "Neither"],
                "correct": 0,
                "cat": "Geography",
                "diff": "hard"
            })
            
        # East/West
        if abs(lon1 - lon2) > 0.5:
            if lon1 > lon2: # Further East (more positive)
                winner, loser, dir_name = c1, c2, "East"
            else:
                winner, loser, dir_name = c2, c1, "East"
                
            questions.append({
                "text": f"Geographically, which city lies further to the {dir_name} of South Africa?",
                "options": [winner, loser, "Roughly the same", "None of these"],
                "correct": 0,
                "cat": "Geography",
                "diff": "hard"
            })

    # Template 21: Multi-category Classification
    for _ in range(100):
        pool = {
            "Animal": [x[0] for x in FLORA_FAUNA if "Animal" in x[1] or "Fish" in x[1] or "Bird" in x[1] or "subspecies" in x[1]],
            "Dish": [x[0] for x in FOODS],
            "Leader": [x[0] for x in LEADERS],
            "Slang": [x[0] for x in SLANG]
        }
        cat_type = random.choice(list(pool.keys()))
        if not pool[cat_type]: continue
        
        correct = random.choice(pool[cat_type])
        others = []
        for other_cat in pool:
            if other_cat != cat_type:
                others.append(random.choice(pool[other_cat]))
        
        if len(others) >= 3:
            questions.append({
                "text": f"Which of the following is an example of a South African {cat_type}?",
                "options": [correct] + others[:3],
                "correct": 0,
                "cat": "General",
                "diff": "easy"
            })
    """
    
    # Insert before Template 19
    content = content.replace("    # Template 19:", template_str + "    # Template 19:")
    
    with open(gen_file, 'w') as f:
        f.write(content)

if __name__ == '__main__':
    expand('generate_bulk.py')
