CELEBS = [
    ("Elon Musk", "Tesla/SpaceX Founder"), ("Charlize Theron", "Oscar-winning Actress"),
    ("Trevor Noah", "Comedian/The Daily Show"), ("Siya Kolisi", "Springbok Captain"),
    ("Wayde van Niekerk", "400m World Record Holder"), ("Tatjana Smith (Schoenmaker)", "Olympic Swimmer"),
    ("Caster Semenya", "Middle-distance Runner"), ("AB de Villiers", "Cricketer (Mr. 360)"),
    ("Benni McCarthy", "Soccer Legend"), ("Percy Tau", "Soccer Player"),
    ("Black Coffee", "Grammy-winning DJ"), ("Tyla", "Water Singer"),
    ("Miriam Makeba", "Mama Africa"), ("Brenda Fassie", "MaBrrr"),
    ("Lebo M", "Lion King Composer"), ("John Kani", "Black Panther Actor"),
    ("Sharlto Copley", "District 9 Actor"), ("Zozibini Tunzi", "Miss Universe 2019"),
    ("Demi-Leigh Nel-Peters", "Miss Universe 2017"), ("Rolene Strauss", "Miss World 2014"),
    ("Mark Shuttleworth", "First SA in Space"), ("Arnold Vosloo", "The Mummy Actor"),
    ("Troye Sivan", "Pop Singer (SA-born)"), ("Dave Matthews", "Musician (SA-born)"),
    ("Jock of the Bushveld", "Famous Dog"), ("Sydney Brenner", "Nobel Prize in Medicine"),
    ("Christiaan Barnard", "First heart transplant surgeon"), ("Nadine Gordimer", "Nobel Prize in Literature"),
    ("J.M. Coetzee", "Nobel Prize in Literature"), ("Desmond Tutu", "Nobel Peace Prize winner"),
    ("Albert Luthuli", "First SA Nobel Peace Prize winner"), ("Gary Player", "Golf Legend"),
    ("Ernie Els", "Golf Legend"), ("Sarel van der Merwe", "Racing Legend"),
    ("Zola Budd", "Famous Runner"), ("Oscar Mpetha", "Anti-Apartheid Activist"),
    ("Steve Biko", "Black Consciousness Leader"), ("Oliver Tambo", "ANC Leader"),
    ("Walter Sisulu", "ANC Leader"), ("Winnie Mandela", "Mother of the Nation"),
    ("Ahmed Kathrada", "Rivaonia Trialist"), ("Denis Goldberg", "Rivonia Trialist"),
    ("Joe Slovo", "SACP Leader"), ("Chris Hani", "SACP Leader (Assassinated)"),
    ("Helen Suzman", "Anti-Apartheid MP"), ("Mangosuthu Buthelezi", "IFP Founder")
]

FOODS = [
    ("Biltong", "Dried, cured meat"), ("Boerewors", "Spicy farmer sausage"), ("Melktert", "Milk tart with cinnamon"),
    ("Koeksister", "Syrup-coated braided pastry"), ("Bobotie", "Spiced minced meat with egg topping"),
    ("Bunny Chow", "Curry in a hollowed loaf"), ("Chakalaka", "Spicy vegetable relish"),
    ("Pap", "Maize porridge"), ("Mopane Worms", "Edible caterpillars"), ("Malva Pudding", "Sweet apricot pudding"),
    ("Vetkoek", "Deep-fried dough bread"), ("Sosaties", "Meat skewers"), ("Snoek", "Popular coastal fish"),
    ("Potjiekos", "Slow-cooked iron pot stew"), ("Umngqusho", "Samp and beans"), ("Amadumbe", "African sweet potato"),
    ("Skilpadjies", "Lamb's liver wrapped in net-fat"), ("Gatsby", "Large sandwich from Cape Town"),
    ("Smiley", "Boiled sheep's head"), ("Walkie Talkies", "Chicken feet and heads"),
    ("Hertzoggie", "Jam and coconut tartlet"), ("Samosa", "Triangular fried pastry (SA style)"),
    ("Dholl", "Lentil soup/stew"), ("Waterblommetjiebredie", "Water hawthorn stew")
]

SLANG = [
    ("Lekker", "Nice/Good"), ("Braai", "Barbecue"), ("Robot", "Traffic light"),
    ("Just now", "In a while (uncertain)"), ("Now now", "Soon"), ("Howzit", "Hello/How are you"),
    ("Ubuntu", "Humanity towards others"), ("Jol", "Party"), ("Dagga", "Cannabis"),
    ("Eish", "Exclamation of surprise/shock"), ("Sharp", "Goodbye/Okay"), ("Takkies", "Sneakers"),
    ("Chow", "Eat"), ("Is it?", "Really?"), ("Bru", "Brother/Friend"), ("Boet", "Brother/Friend"),
    ("China", "Friend"), ("Oke", "Guy/Man"), ("Antie", "Aunt/Respectful for elder female"),
    ("Uncle", "Respectful for elder male"), ("Sisi", "Sister/Respectful for female"),
    ("Bhuti", "Brother/Respectful for male"), ("Dop", "Drink (Alcohol)"), ("Babalas", "Hangover"),
    ("Gees", "Spirit/Energy"), ("Muti", "Traditional medicine"), ("Sangoma", "Traditional healer"),
    ("Inyanga", "Traditional herbalist"), ("Kasi", "Township")
]

INVENTIONS = [
    ("Kreepy Krauly", "Pool cleaner"), ("Pratley Putty", "Adhesive used on Apollo 11"),
    ("CyberTracker", "Animal tracking device"), ("Dolosses", "Wave-breaking concrete blocks"),
    ("Tellurometer", "Distance measurement device"), ("APS Therapy", "Electronic pain relief"),
    ("Oil-from-coal (Sasol)", "Synthetic fuel process"), ("Smartlock Safety Syringe", "Medical safety device"),
    ("Computed Tomography (CT Scan) core", "Medical imaging technology (Cormack)"),
    ("Lodox Scanners", "High speed low dose X-rays")
]

FLORA_FAUNA = [
    ("Springbok", "National Animal"), ("Blue Crane", "National Bird"), ("Galjoen", "National Fish"),
    ("Protea", "National Flower"), ("Real Yellowwood", "National Tree"), ("Baobab", "Upside down tree"),
    ("Quagga", "Extinct zebra subspecies"), ("Cape Lion", "Extinct lion subspecies"),
    ("Coelacanth", "Living fossil fish found in SA"), ("Black Rhino", "Endangered rhino species"),
    ("White Rhino", "More common rhino species"), ("Cape Buffalo", "One of the Big Five"),
    ("Leopard", "Elusive Big Five cat"), ("Elephant", "Largest land mammal in SA"),
    ("Lion", "King of the bush"), ("Cheetah", "Fastest land animal"),
    ("Wild Dog (Painted Wolf)", "Highly endangered predator"), ("Honey Badger", "Fearless animal"),
    ("Meerkat", "Small social mongoose"), ("African Penguin", "Coastal bird"),
    ("Cape Fur Seal", "Seal found on SA coast"), ("Great White Shark", "Apex marine predator")
]

def expand(gen_file):
    with open(gen_file, 'r') as f:
        # Find the line after EVENTS = [...]
        lines = f.readlines()
    
    new_lines = []
    skip = False
    for line in lines:
        if line.startswith("CELEBS = "): skip = True
        if line.startswith("def generate():"):
            new_lines.append("CELEBS = " + str(CELEBS) + "\n")
            new_lines.append("FOODS = " + str(FOODS) + "\n")
            new_lines.append("SLANG = " + str(SLANG) + "\n")
            new_lines.append("INVENTIONS = " + str(INVENTIONS) + "\n")
            new_lines.append("FLORA_FAUNA = " + str(FLORA_FAUNA) + "\n\n")
            skip = False
        if not skip: new_lines.append(line)
        
    content = "".join(new_lines)
    
    # Insert templates into generate()
    template_str = """
    # Template 15: Celebs
    for name, fact in CELEBS:
        questions.append({
            "text": f"Which famous South African is known for being involved in: {fact}?",
            "options": [name, "Trevor Noah", "Siya Kolisi", "Elon Musk"] if name not in ["Trevor Noah", "Siya Kolisi", "Elon Musk"] else [name, "Nelson Mandela", "Charlize Theron", "Black Coffee"],
            "correct": 0,
            "cat": "Entertainment",
            "diff": "easy"
        })
        
    # Template 16: Foods
    for food, desc in FOODS:
        questions.append({
            "text": f"In South African cuisine, what is '{food}'?",
            "options": [desc, "A traditional weapon", "A type of housing", "A musical style"],
            "correct": 0,
            "cat": "Food",
            "diff": "easy"
        })
        
    # Template 17: Slang
    for word, meaning in SLANG:
        questions.append({
            "text": f"In South Africa, what does the term '{word}' usually mean?",
            "options": [meaning, "A type of plant", "A government department", "A coastal town"],
            "correct": 0,
            "cat": "Culture",
            "diff": "easy"
        })
        
    # Template 18: Inventions
    for inv, use in INVENTIONS:
        questions.append({
            "text": f"The South African invention '{inv}' is used for which of these?",
            "options": [use, "Diamond synthesis", "Deep sea drilling", "Radio broadcasting"],
            "correct": 0,
            "cat": "Science",
            "diff": "hard"
        })

    # Template 19: Flora/Fauna
    for name, fact in FLORA_FAUNA:
        questions.append({
            "text": f"The '{name}' is known as what in South Africa?",
            "options": [fact, "The National Dish", "A famous rugby player", "A province name"],
            "correct": 0,
            "cat": "Nature",
            "diff": "easy"
        })
    """
    
    # Be careful not to duplicate if already there
    if "# Template 15:" not in content:
        content = content.replace("    # Template 14:", template_str + "    # Template 14:")
    
    with open(gen_file, 'w') as f:
        f.write(content)

if __name__ == '__main__':
    expand('generate_bulk.py')
