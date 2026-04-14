-- Seed initial trivia questions
INSERT INTO questions (question_text, option_a, option_b, option_c, option_d, correct_index, category, difficulty, region, content_hash)
VALUES 
('What is the currency of South Africa?', 'Dollar', 'Pound', 'Rand', 'Euro', 2, 'General', 'easy', 'south_africa', 'h1'),
('Which planet is known as the Red Planet?', 'Venus', 'Mars', 'Jupiter', 'Saturn', 1, 'Science', 'easy', 'global', 'h2'),
('Who is the current President of South Africa (2024)?', 'Jacob Zuma', 'Cyril Ramaphosa', 'Nelson Mandela', 'Thabo Mbeki', 1, 'Politics', 'easy', 'south_africa', 'h3'),
('What is the largest ocean on Earth?', 'Atlantic', 'Indian', 'Arctic', 'Pacific', 3, 'Geography', 'easy', 'global', 'h4'),
('In which year did South Africa host the FIFA World Cup?', '2006', '2010', '2014', '1998', 1, 'Sport', 'easy', 'south_africa', 'h5'),
('What is the capital of France?', 'Berlin', 'Madrid', 'Paris', 'Rome', 2, 'General', 'easy', 'global', 'h6'),
('Which South African city is known as the Mother City?', 'Johannesburg', 'Durban', 'Pretoria', 'Cape Town', 3, 'General', 'medium', 'south_africa', 'h7'),
('What is the chemical symbol for Gold?', 'Ag', 'Fe', 'Au', 'Hg', 2, 'Science', 'medium', 'global', 'h8'),
('Who wrote "Romeo and Juliet"?', 'Charles Dickens', 'William Shakespeare', 'Mark Twain', 'Jane Austen', 1, 'Literature', 'easy', 'global', 'h9'),
('What is the highest mountain in Africa?', 'Mount Everest', 'Mount Kilimanjaro', 'Mount Kenya', 'Table Mountain', 1, 'Geography', 'medium', 'global', 'h10');
