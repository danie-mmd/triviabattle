import hashlib

def get_hash(text):
    return hashlib.sha256(text.encode('utf-8')).hexdigest()

PROVINCES = {
    "Gauteng": "Johannesburg",
    "Western Cape": "Cape Town",
    "KwaZulu-Natal": "Pietermaritzburg",
    "Eastern Cape": "Bhisho",
    "Free State": "Bloemfontein",
    "Limpopo": "Polokwane",
    "Mpumalanga": "Mbombela",
    "North West": "Mahikeng",
    "Northern Cape": "Kimberley"
}

CITIES = [
    ("Soweto", "Gauteng"), ("Pretoria", "Gauteng"), ("Durban", "KwaZulu-Natal"),
    ("Gqeberha", "Eastern Cape"), ("East London", "Eastern Cape"), ("George", "Western Cape"),
    ("Knysna", "Western Cape"), ("Upington", "Northern Cape"), ("Welkom", "Free State"),
    ("Rustenburg", "North West"), ("Nelspruit", "Mpumalanga"), ("Polokwane", "Limpopo"),
    ("Mthatha", "Eastern Cape"), ("Stellenbosch", "Western Cape"), ("Worcester", "Western Cape"),
    ("Paarl", "Western Cape"), ("Randburg", "Gauteng"), ("Centurion", "Gauteng"),
    ("Germiston", "Gauteng"), ("Boksburg", "Gauteng"), ("Benoni", "Gauteng"),
    ("Kempton Park", "Gauteng"), ("Roodepoort", "Gauteng"), ("Krugersdorp", "Gauteng"),
    ("Vanderbijlpark", "Gauteng"), ("Vereeniging", "Gauteng"), ("Odendaalsrus", "Free State"),
    ("Sasolburg", "Free State"), ("Kroonstad", "Free State"), ("Bethlehem", "Free State"),
    ("Kimberley", "Northern Cape"), ("Springbok", "Northern Cape"), ("Alexander Bay", "Northern Cape"),
    ("Kuruman", "Northern Cape"), ("De Aar", "Northern Cape"), ("Colesberg", "Northern Cape"),
    ("Beaufort West", "Western Cape"), ("Oudtshoorn", "Western Cape"), ("Mossel Bay", "Western Cape"),
    ("Swellendam", "Western Cape"), ("Hermanus", "Western Cape"), ("Vredenburg", "Western Cape"),
    ("Malmesbury", "Western Cape"), ("Pietermaritzburg", "KwaZulu-Natal"), ("Richards Bay", "KwaZulu-Natal"),
    ("Ladysmith", "KwaZulu-Natal"), ("Newcastle", "KwaZulu-Natal"), ("Port Shepstone", "KwaZulu-Natal"),
    ("Empangeni", "KwaZulu-Natal"), ("Vryheid", "KwaZulu-Natal"), ("Eshowe", "KwaZulu-Natal")
]

RIVERS = [
    ("Orange River", "Atlantic Ocean"), ("Limpopo River", "Indian Ocean"), ("Vaal River", "Orange River"),
    ("Tugela River", "Indian Ocean"), ("Fish River", "Orange River"), ("Gamtoos River", "Indian Ocean"),
    ("Sunday''s River", "Indian Ocean"), ("Keiskamma River", "Indian Ocean"), ("Umzimvubu River", "Indian Ocean"),
    ("Breede River", "Indian Ocean"), ("Berg River", "Atlantic Ocean"), ("Olifants River", "Limpopo River")
]

MOUNTAINS = [
    ("Table Mountain", "Cape Town"), ("Drakensberg", "KwaZulu-Natal/Lesotho"), ("Cederberg", "Western Cape"),
    ("Magaliesberg", "Gauteng/North West"), ("Outeniqua", "Western Cape"), ("Swartberg", "Western Cape"),
    ("Sneeuberg", "Eastern Cape"), ("Amatola", "Eastern Cape"), ("Winterberg", "Eastern Cape")
]

AIRPORTS = [
    ("OR Tambo International", "Johannesburg"), ("Cape Town International", "Cape Town"),
    ("King Shaka International", "Durban"), ("Chief Dawid Stuurman International", "Gqeberha"),
    ("Bram Fischer International", "Bloemfontein"), ("Upington Airport", "Upington"),
    ("George Airport", "George"), ("East London Airport", "East London"),
    ("Kruger Mpumalanga International", "Nelspruit"), ("Lanseria International", "Johannesburg")
]

TEAMS = [
    ("Rugby", "Springboks"), ("Soccer", "Bafana Bafana"), ("Cricket", "Proteas"),
    ("Netball", "Proteas"), ("Women's Soccer", "Banyana Banyana"), ("Men's Hockey", "Lads"),
    ("Women's Hockey", "Tigresses"), ("Sevens Rugby", "Blitzboks"), ("Basketball", "Icons")
]

LEADERS = [
    ("Nelson Mandela", "1994-1999"), ("Thabo Mbeki", "1999-2008"), ("Jacob Zuma", "2009-2018"),
    ("Cyril Ramaphosa", "2018-Present"), ("FW de Klerk", "1989-1994"), ("PW Botha", "1984-1989")
]

LANDMARKS = [
    ("Robben Island", "Western Cape"), ("Kirstenbosch Botanical Garden", "Western Cape"),
    ("Cape Point", "Western Cape"), ("Table Mountain", "Western Cape"), ("V&A Waterfront", "Western Cape"),
    ("Castle of Good Hope", "Western Cape"), ("District Six Museum", "Western Cape"),
    ("Cango Caves", "Western Cape"), ("Knysna Heads", "Western Cape"), ("Cape Agulhas", "Western Cape"),
    ("Voortrekker Monument", "Gauteng"), ("Apartheid Museum", "Gauteng"), ("Constitution Hill", "Gauteng"),
    ("Union Buildings", "Gauteng"), ("Soweto Towers", "Gauteng"), ("Cradle of Humankind", "Gauteng"),
    ("Gold Reef City", "Gauteng"), ("Walter Sisulu Botanical Garden", "Gauteng"),
    ("uShaka Marine World", "KwaZulu-Natal"), ("Moses Mabhida Stadium", "KwaZulu-Natal"),
    ("Valley of a Thousand Hills", "KwaZulu-Natal"), ("Drakensberg Mountains", "KwaZulu-Natal"),
    ("Hluhluwe-Imfolozi Park", "KwaZulu-Natal"), ("Isandlwana Battlefield", "KwaZulu-Natal"),
    ("Nelson Mandela Capture Site", "KwaZulu-Natal"), ("St Lucia Wetlands", "KwaZulu-Natal"),
    ("The Big Hole", "Northern Cape"), ("Augrabies Falls", "Northern Cape"), ("Kgalagadi Transfrontier Park", "Northern Cape"),
    ("Richtersveld", "Northern Cape"), ("Namaqualand", "Northern Cape"), ("Wonderwerk Cave", "Northern Cape"),
    ("Addo Elephant Park", "Eastern Cape"), ("Tsitsikamma National Park", "Eastern Cape"),
    ("Hole in the Wall", "Eastern Cape"), ("Storms River Mouth", "Eastern Cape"), ("Valley of Desolation", "Eastern Cape"),
    ("Wild Coast", "Eastern Cape"), ("Graaff-Reinet", "Eastern Cape"), ("Grahamstown (Makhanda)", "Eastern Cape"),
    ("Kruger National Park", "Mpumalanga/Limpopo"), ("Blyde River Canyon", "Mpumalanga"),
    ("God''s Window", "Mpumalanga"), ("Bourke''s Luck Potholes", "Mpumalanga"), ("Three Rondavels", "Mpumalanga"),
    ("Sudwala Caves", "Mpumalanga"), ("Graskop", "Mpumalanga"), ("Pilanesberg National Park", "North West"),
    ("Sun City", "North West"), ("Hartbeespoort Dam", "North West"), ("Magaliesberg", "North West"),
    ("Mapungubwe National Park", "Limpopo"), ("Modjadji Cycad Reserve", "Limpopo"),
    ("Soutpansberg", "Limpopo"), ("Golden Gate Highlands", "Free State"), ("Basotho Cultural Village", "Free State"),
    ("Clarens", "Free State"), ("Gariep Dam", "Free State")
]

PARTIES = [
    ("African National Congress", "ANC"), ("Democratic Alliance", "DA"), ("Economic Freedom Fighters", "EFF"),
    ("Inkatha Freedom Party", "IFP"), ("Freedom Front Plus", "VF+"), ("ActionSA", "ActionSA"),
    ("Patriotic Alliance", "PA"), ("Build One South Africa", "BOSA"), ("Rise Mzansi", "Rise"),
    ("Al Jama-ah", "Al Jama-ah"), ("Good Party", "Good"), ("Pan Africanist Congress", "PAC")
]

LANGUAGES = ["isiZulu", "isiXhosa", "Afrikaans", "English", "Sepedi", "Setswana", "Sesotho", "Xitsonga", "siSwati", "Tshivenda", "isiNdebele", "SA Sign Language"]

NOBELS = [
    ("Nelson Mandela", "1993", "Peace"), ("FW de Klerk", "1993", "Peace"), ("Desmond Tutu", "1984", "Peace"),
    ("Albert Luthuli", "1960", "Peace"), ("Nadine Gordimer", "1991", "Literature"), ("JM Coetzee", "2003", "Literature"),
    ("Sydney Brenner", "2002", "Medicine"), ("Max Theiler", "1951", "Medicine"), ("Allan Cormack", "1979", "Medicine"),
    ("Aaron Klug", "1982", "Chemistry")
]

BIG_FIVE = ["Lion", "Leopard", "Elephant", "Rhinoceros", "Buffalo"]

EVENTS = [
    ("First fully democratic election", "1994"), ("Host of FIFA World Cup", "2010"),
    ("Release of Nelson Mandela", "1990"), ("Adoption of the current flag", "1994"),
    ("First heart transplant", "1967"), ("Arrival of Jan van Riebeeck", "1652"),
    ("Battle of Isandlwana", "1879"), ("Sharpeville Massacre", "1960"), ("Soweto Uprising", "1976"),
    ("End of Apartheid", "1994"), ("Rugby World Cup win (first)", "1995")
]

CITY_COORDS = {'Johannesburg': (-26.2, 28.0), 'Cape Town': (-33.9, 18.4), 'Durban': (-29.8, 31.0), 'Pretoria': (-25.7, 28.2), 'Port Elizabeth': (-33.9, 25.6), 'Bloemfontein': (-29.1, 26.2), 'East London': (-33.0, 27.9), 'Kimberley': (-28.7, 24.7), 'Polokwane': (-23.9, 29.4), 'Nelspruit': (-25.4, 30.9), 'Pietermaritzburg': (-29.6, 30.3), 'Rustenburg': (-25.6, 27.2), 'George': (-33.9, 22.4), 'Upington': (-28.4, 21.2), 'Soweto': (-26.2, 27.8), 'Mthatha': (-31.5, 28.7), 'Stellenbosch': (-33.9, 18.8), 'Paarl': (-33.7, 18.9), 'Worcester': (-33.6, 19.4), 'Mossel Bay': (-34.1, 22.1), 'Hermanus': (-34.4, 19.2), 'Plettenberg Bay': (-34.0, 23.3), 'Oudtshoorn': (-33.5, 22.2), 'Knysna': (-34.0, 23.0), 'Beaufort West': (-32.3, 22.5), 'De Aar': (-30.6, 24.0), 'Graaff-Reinet': (-32.2, 24.5), 'Ladysmith': (-28.5, 29.7), 'Newcastle': (-27.7, 29.9), 'Vryheid': (-27.7, 30.7), 'Richards Bay': (-28.7, 32.0), 'Empangeni': (-28.7, 31.8), 'Port Shepstone': (-30.7, 30.4)}\nCELEBS = [('Elon Musk', 'Tesla/SpaceX Founder'), ('Charlize Theron', 'Oscar-winning Actress'), ('Trevor Noah', 'Comedian/The Daily Show'), ('Siya Kolisi', 'Springbok Captain'), ('Wayde van Niekerk', '400m World Record Holder'), ('Tatjana Smith (Schoenmaker)', 'Olympic Swimmer'), ('Caster Semenya', 'Middle-distance Runner'), ('AB de Villiers', 'Cricketer (Mr. 360)'), ('Benni McCarthy', 'Soccer Legend'), ('Percy Tau', 'Soccer Player'), ('Black Coffee', 'Grammy-winning DJ'), ('Tyla', 'Water Singer'), ('Miriam Makeba', 'Mama Africa'), ('Brenda Fassie', 'MaBrrr'), ('Lebo M', 'Lion King Composer'), ('John Kani', 'Black Panther Actor'), ('Sharlto Copley', 'District 9 Actor'), ('Zozibini Tunzi', 'Miss Universe 2019'), ('Demi-Leigh Nel-Peters', 'Miss Universe 2017'), ('Rolene Strauss', 'Miss World 2014'), ('Mark Shuttleworth', 'First SA in Space'), ('Arnold Vosloo', 'The Mummy Actor'), ('Troye Sivan', 'Pop Singer (SA-born)'), ('Dave Matthews', 'Musician (SA-born)'), ('Jock of the Bushveld', 'Famous Dog'), ('Sydney Brenner', 'Nobel Prize in Medicine'), ('Christiaan Barnard', 'First heart transplant surgeon'), ('Nadine Gordimer', 'Nobel Prize in Literature'), ('J.M. Coetzee', 'Nobel Prize in Literature'), ('Desmond Tutu', 'Nobel Peace Prize winner'), ('Albert Luthuli', 'First SA Nobel Peace Prize winner'), ('Gary Player', 'Golf Legend'), ('Ernie Els', 'Golf Legend'), ('Sarel van der Merwe', 'Racing Legend'), ('Zola Budd', 'Famous Runner'), ('Oscar Mpetha', 'Anti-Apartheid Activist'), ('Steve Biko', 'Black Consciousness Leader'), ('Oliver Tambo', 'ANC Leader'), ('Walter Sisulu', 'ANC Leader'), ('Winnie Mandela', 'Mother of the Nation'), ('Ahmed Kathrada', 'Rivaonia Trialist'), ('Denis Goldberg', 'Rivonia Trialist'), ('Joe Slovo', 'SACP Leader'), ('Chris Hani', 'SACP Leader (Assassinated)'), ('Helen Suzman', 'Anti-Apartheid MP'), ('Mangosuthu Buthelezi', 'IFP Founder')]
FOODS = [('Biltong', 'Dried, cured meat'), ('Boerewors', 'Spicy farmer sausage'), ('Melktert', 'Milk tart with cinnamon'), ('Koeksister', 'Syrup-coated braided pastry'), ('Bobotie', 'Spiced minced meat with egg topping'), ('Bunny Chow', 'Curry in a hollowed loaf'), ('Chakalaka', 'Spicy vegetable relish'), ('Pap', 'Maize porridge'), ('Mopane Worms', 'Edible caterpillars'), ('Malva Pudding', 'Sweet apricot pudding'), ('Vetkoek', 'Deep-fried dough bread'), ('Sosaties', 'Meat skewers'), ('Snoek', 'Popular coastal fish'), ('Potjiekos', 'Slow-cooked iron pot stew'), ('Umngqusho', 'Samp and beans'), ('Amadumbe', 'African sweet potato'), ('Skilpadjies', "Lamb's liver wrapped in net-fat"), ('Gatsby', 'Large sandwich from Cape Town'), ('Smiley', "Boiled sheep's head"), ('Walkie Talkies', 'Chicken feet and heads'), ('Hertzoggie', 'Jam and coconut tartlet'), ('Samosa', 'Triangular fried pastry (SA style)'), ('Dholl', 'Lentil soup/stew'), ('Waterblommetjiebredie', 'Water hawthorn stew')]
SLANG = [('Lekker', 'Nice/Good'), ('Braai', 'Barbecue'), ('Robot', 'Traffic light'), ('Just now', 'In a while (uncertain)'), ('Now now', 'Soon'), ('Howzit', 'Hello/How are you'), ('Ubuntu', 'Humanity towards others'), ('Jol', 'Party'), ('Dagga', 'Cannabis'), ('Eish', 'Exclamation of surprise/shock'), ('Sharp', 'Goodbye/Okay'), ('Takkies', 'Sneakers'), ('Chow', 'Eat'), ('Is it?', 'Really?'), ('Bru', 'Brother/Friend'), ('Boet', 'Brother/Friend'), ('China', 'Friend'), ('Oke', 'Guy/Man'), ('Antie', 'Aunt/Respectful for elder female'), ('Uncle', 'Respectful for elder male'), ('Sisi', 'Sister/Respectful for female'), ('Bhuti', 'Brother/Respectful for male'), ('Dop', 'Drink (Alcohol)'), ('Babalas', 'Hangover'), ('Gees', 'Spirit/Energy'), ('Muti', 'Traditional medicine'), ('Sangoma', 'Traditional healer'), ('Inyanga', 'Traditional herbalist'), ('Kasi', 'Township')]
INVENTIONS = [('Kreepy Krauly', 'Pool cleaner'), ('Pratley Putty', 'Adhesive used on Apollo 11'), ('CyberTracker', 'Animal tracking device'), ('Dolosses', 'Wave-breaking concrete blocks'), ('Tellurometer', 'Distance measurement device'), ('APS Therapy', 'Electronic pain relief'), ('Oil-from-coal (Sasol)', 'Synthetic fuel process'), ('Smartlock Safety Syringe', 'Medical safety device'), ('Computed Tomography (CT Scan) core', 'Medical imaging technology (Cormack)'), ('Lodox Scanners', 'High speed low dose X-rays')]
FLORA_FAUNA = [('Springbok', 'National Animal'), ('Blue Crane', 'National Bird'), ('Galjoen', 'National Fish'), ('Protea', 'National Flower'), ('Real Yellowwood', 'National Tree'), ('Baobab', 'Upside down tree'), ('Quagga', 'Extinct zebra subspecies'), ('Cape Lion', 'Extinct lion subspecies'), ('Coelacanth', 'Living fossil fish found in SA'), ('Black Rhino', 'Endangered rhino species'), ('White Rhino', 'More common rhino species'), ('Cape Buffalo', 'One of the Big Five'), ('Leopard', 'Elusive Big Five cat'), ('Elephant', 'Largest land mammal in SA'), ('Lion', 'King of the bush'), ('Cheetah', 'Fastest land animal'), ('Wild Dog (Painted Wolf)', 'Highly endangered predator'), ('Honey Badger', 'Fearless animal'), ('Meerkat', 'Small social mongoose'), ('African Penguin', 'Coastal bird'), ('Cape Fur Seal', 'Seal found on SA coast'), ('Great White Shark', 'Apex marine predator')]

def generate():
    questions = []
    
    # Template 1: Capital of Province
    for province, capital in PROVINCES.items():
        others = [c for p, c in PROVINCES.items() if c != capital][:3]
        questions.append({
            "text": f"What is the capital city of the {province} province?",
            "options": [capital] + others,
            "correct": 0,
            "cat": "Geography",
            "diff": "easy"
        })
        
    # Template 2: Province of City
    for city, province in CITIES:
        others = [p for p in PROVINCES.keys() if p != province][:3]
        questions.append({
            "text": f"In which South African province is the city of {city} located?",
            "options": [province] + others,
            "correct": 0,
            "cat": "Geography",
            "diff": "easy"
        })
        
    # Template 3: National Team Nicknames
    for sport, nickname in TEAMS:
        others = [n for s, n in TEAMS if n != nickname][:3]
        if len(others) < 3: others.append("The Lions")
        questions.append({
            "text": f"What is the nickname of the South African national {sport} team?",
            "options": [nickname] + others,
            "correct": 0,
            "cat": "Sports",
            "diff": "easy"
        })
    
    # Template 4: Presidents
    for name, years in LEADERS:
        questions.append({
            "text": f"Who served as the President of South Africa during the period {years}?",
            "options": [name, "Thabo Mbeki", "Jacob Zuma", "Cyril Ramaphosa"] if name not in ["Thabo Mbeki", "Jacob Zuma", "Cyril Ramaphosa"] else [name, "FW de Klerk", "Nelson Mandela", "Kgalema Motlanthe"],
            "correct": 0,
            "cat": "History",
            "diff": "medium"
        })

    # Template 5: Rivers
    for river, drains in RIVERS:
        others = [d for r, d in RIVERS if d != drains][:3]
        if len(others) < 3: others.append("The Pacific Ocean")
        questions.append({
            "text": f"Where does the {river} primarily flow into or drain?",
            "options": [drains] + others,
            "correct": 0,
            "cat": "Geography",
            "diff": "medium"
        })
        
    # Template 6: Mountains
    for mountain, location in MOUNTAINS:
        others = [l for m, l in MOUNTAINS if l != location][:3]
        questions.append({
            "text": f"In which part of South Africa is the {mountain} mountain range or landmark located?",
            "options": [location] + others,
            "correct": 0,
            "cat": "Geography",
            "diff": "medium"
        })
        
    # Template 7: Airports
    for airport, city in AIRPORTS:
        others = [c for a, c in AIRPORTS if c != city][:3]
        questions.append({
            "text": f"Which South African city is served by {airport}?",
            "options": [city] + others,
            "correct": 0,
            "cat": "Geography",
            "diff": "easy"
        })

    # Template 8: Landmarks
    for landmark, province in LANDMARKS:
        others = [p for l, p in LANDMARKS if p != province][:3]
        questions.append({
            "text": f"In which province is the famous South African landmark '{landmark}' located?",
            "options": [province] + others,
            "correct": 0,
            "cat": "Geography",
            "diff": "medium"
        })

    # Template 9: Political Parties
    for name, abbrev in PARTIES:
        questions.append({
            "text": f"What is the abbreviation of the '{name}' political party?",
            "options": [abbrev, "ANC", "DA", "EFF"],
            "correct": 0,
            "cat": "Politics",
            "diff": "easy"
        })

    # Template 10: Official Languages
    for lang in LANGUAGES:
        questions.append({
            "text": f"Is {lang} one of the official languages of South Africa?",
            "options": ["Yes", "No", "Only recently", "Not since 1994"],
            "correct": 0,
            "cat": "General",
            "diff": "easy"
        })

    # Template 11: Nobel Prizes
    for name, year, category in NOBELS:
        questions.append({
            "text": f"In which year did {name} receive a Nobel {category} Prize?",
            "options": [year, "1994", "1980", "2000"],
            "correct": 0,
            "cat": "History",
            "diff": "medium"
        })

    # Template 12: Events
    for event, year in EVENTS:
        questions.append({
            "text": f"In which year did the following event occur: {event}?",
            "options": [year, "1994" if year != "1994" else "1990", "1976", "2010"],
            "correct": 0,
            "cat": "History",
            "diff": "medium"
        })

    # Template 13: Big Five
    for animal in BIG_FIVE:
        questions.append({
            "text": f"Which of these is officially part of the 'Big Five' safari animals?",
            "options": [animal, "Zebra", "Giraffe", "Hippopotamus"],
            "correct": 0,
            "cat": "Nature",
            "diff": "easy"
        })


    # Template 15: Celebs
    for name, fact in CELEBS:
        questions.append({
            "text": f"Which famous South African is known for being a {fact}?",
            "options": [name, "Trevor Noah", "Siya Kolisi", "Elon Musk"] if name not in ["Trevor Noah", "Siya Kolisi", "Elon Musk"] else [name, "Nelson Mandela", "Charlize Theron", "Black Coffee"],
            "correct": 0,
            "cat": "Entertainment",
            "diff": "easy"
        })
        
    # Template 16: Foods
    for food, desc in FOODS:
        questions.append({
            "text": f"What is '{food}' in the context of South African cuisine?",
            "options": [desc, "A type of dance", "A traditional garment", "A musical instrument"],
            "correct": 0,
            "cat": "Food",
            "diff": "easy"
        })
        
    # Template 17: Slang
    for word, meaning in SLANG:
        questions.append({
            "text": f"In South African slang, what does the word '{word}' mean?",
            "options": [meaning, "A type of food", "A city name", "A sports term"],
            "correct": 0,
            "cat": "Culture",
            "diff": "easy"
        })
        
    # Template 18: Inventions
    for inv, use in INVENTIONS:
        questions.append({
            "text": f"The South African invention '{inv}' is primarily used for what?",
            "options": [use, "Space exploration", "Underwater mining", "Diamond cutting"],
            "correct": 0,
            "cat": "Science",
            "diff": "hard"
        })
        # Template 14: Which of these is NOT
    for province in set(p for l, p in LANDMARKS):
        in_p = [l for l, p in LANDMARKS if p == province]
        not_in_p = [l for l, p in LANDMARKS if p != province][:1]
        if len(in_p) >= 3 and not_in_p:
            questions.append({
                "text": f"Which of these landmarks is NOT located in the {province} province?",
                "options": [not_in_p[0]] + in_p[:3],
                "correct": 0,
                "cat": "Geography",
                "diff": "hard"
            })

    # Add more manual unique ones to reach 1000 or close
    # (Simplified for this script to show the logic)
    # I'll add a lot of "Did you know" style questions
    
    additional_facts = [
        ("Which ocean is on the west coast of SA?", "Atlantic", "Geography"),
        ("Which SA city is the 'Mother City'?", "Cape Town", "General"),
        ("What is the national fish of SA?", "Galjoen", "General"),
        ("What is the national tree of SA?", "Real Yellowwood", "General"),
        ("Who won the 2023 Rugby World Cup?", "South Africa", "Sports"),
        ("What is the highest peak in SA?", "Mafadi", "Geography"),
        ("Which river forms part of the border with Namibia?", "Orange River", "Geography"),
        ("Which SA province is known for its diamond mines?", "Northern Cape", "Geography"),
        ("Who is known as the 'Father of the Nation'?", "Nelson Mandela", "History"),
        ("What is the largest township in SA?", "Soweto", "Geography"),
        ("On which day is Freedom Day celebrated?", "April 27", "Culture"),
        ("On which day is Youth Day celebrated?", "June 16", "Culture"),
        ("On which day is Heritage Day celebrated?", "September 24", "Culture"),
        ("What is the currency of SA?", "Rand", "Economics"),
        ("Which SA city hosted the final of the 2010 World Cup?", "Johannesburg", "Sports"),
        ("What is the main language spoken in the Western Cape?", "Afrikaans", "General"),
        ("Which SA leader wrote 'Long Walk to Freedom'?", "Nelson Mandela", "Literature"),
        ("Where are the Cango Caves located?", "Oudtshoorn", "Tourism"),
        ("Which SA province is the smallest?", "Gauteng", "Geography"),
        ("Which SA province is the largest (by area)?", "Northern Cape", "Geography"),
        ("What is the flower on the SA 10 cent coin?", "Protea", "General"),
        ("Which SA city is known as the 'Jacaranda City'?", "Pretoria", "General"),
        ("What is the name of the SA national anthem?", "Nkosi Sikelel' iAfrika", "Culture"),
        ("Who was the first heart transplant surgeon?", "Christiaan Barnard", "Science"),
        ("Which SA desert is famous for its wild flowers?", "Namaqualand", "Nature"),
        ("What is the name of the SA internal security service?", "State Security Agency", "Politics"),
        ("Which SA wine region is the oldest?", "Constantia", "General"),
        ("What is the name of the dried meat snack popular in SA?", "Biltong", "Food"),
        ("What is the name of the spicy sausage popular in SA?", "Boerewors", "Food"),
        ("What is the name of the maize porridge staple in SA?", "Pap", "Food"),
        ("Which SA city was formerly known as Port Elizabeth?", "Gqeberha", "Geography"),
        ("What is the name of the world's largest crater in SA?", "Vredefort", "Geography"),
        ("Which SA province contains the Kruger National Park?", "Mpumalanga", "Geography"),
        ("Who is the SA billionaire behind Tesla and SpaceX?", "Elon Musk", "General"),
        ("Which SA actor won an Oscar for 'Monster'?", "Charlize Theron", "Entertainment"),
        ("What is the name of the SA daily soap opera set in a mining town?", "Isidingo", "Entertainment"),
        ("Which SA rugby player is known as 'The Beast'?", "Tendai Mtawarira", "Sports"),
        ("Who was the first black captain of the Springboks?", "Siya Kolisi", "Sports"),
        ("In which year did the SA cricket team return to international play?", "1991", "Sports"),
        ("What is the name of the SA currency symbol?", "R", "Economics"),
        ("Which SA city is the judicial capital?", "Bloemfontein", "General"),
        ("Which SA city is the administrative capital?", "Pretoria", "General"),
        ("Which SA city is the legislative capital?", "Cape Town", "General"),
        ("What is the name of the SA public broadcaster?", "SABC", "General"),
        ("Which SA province is known as the 'Garden Province'?", "KwaZulu-Natal", "Geography"),
        ("Which ocean is on the south-east coast of SA?", "Indian", "Geography"),
        ("What is the name of the point where the two oceans meet?", "Cape Agulhas", "Geography"),
        ("What is the name of the famous street in Soweto?", "Vilakazi", "History"),
        ("Who is the SA comedian behind 'The Daily Show'?", "Trevor Noah", "Entertainment"),
        ("What is the name of the SA musical 'The Lion King' composer?", "Lebo M", "Entertainment"),
        ("Which SA band is famous for 'Scatterlings of Africa'?", "Juluka", "Music"),
        ("Who was the lead singer of Juluka?", "Johnny Clegg", "Music"),
        ("What is the name of the SA wine route near Cape Town?", "Stellenbosch", "Tourism"),
        ("Which SA town is famous for ostrich farming?", "Oudtshoorn", "Tourism"),
        ("What is the name of the SA holiday on December 16?", "Day of Reconciliation", "History"),
        ("On which day is Human Rights Day celebrated in SA?", "March 21", "History")
    ]
    
    for q_text, ans, cat in additional_facts:
        questions.append({
            "text": q_text,
            "options": [ans, "Incorrect 1", "Incorrect 2", "Incorrect 3"],
            "correct": 0,
            "cat": cat,
            "diff": "medium"
        })

    # Output to SQL
    with open('bulk_sa_questions.sql', 'w') as f:
        f.write("INSERT IGNORE INTO questions (question_text, option_a, option_b, option_c, option_d, correct_index, category, difficulty, region, content_hash) VALUES\n")
        
        values = []
        for q in questions:
            # Shuffle options and find new correct index
            import random
            opts = q['options']
            correct_val = opts[0]
            random.shuffle(opts)
            correct_idx = opts.index(correct_val)
            
            text = q['text'].replace("'", "''")
            opt_a = opts[0].replace("'", "''")
            opt_b = opts[1].replace("'", "''")
            opt_c = opts[2].replace("'", "''")
            opt_d = opts[3].replace("'", "''")
            
            h = get_hash(q['text'])
            values.append(f"('{text}', '{opt_a}', '{opt_b}', '{opt_c}', '{opt_d}', {correct_idx}, '{q['cat']}', '{q['diff']}', 'south_africa', '{h}')")
            
        f.write(",\n".join(values) + ";\n")
    
    print(f"Generated {len(questions)} questions.")

if __name__ == "__main__":
    generate()
