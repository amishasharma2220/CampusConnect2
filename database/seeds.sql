-- ============================================================
-- CampusConnect Seed Data
-- Real events from MUJ campus
-- ============================================================

-- Seed events directly (approved, no auth needed for seeding)
INSERT INTO events (
    slug, title, tagline, description, banner_url,
    display_date, event_date, time, venue, category,
    organizer_name, organizer_club, max_capacity,
    is_paid, color, status, approval_status, certificate_uploaded
) VALUES
(
    'hackmuj-3',
    'HackMUJ 3.0 — 36-Hour Hackathon',
    'Build innovative solutions in 36 hours',
    'Join the biggest hackathon at MUJ! Build innovative solutions in 36 hours with mentors from top companies. Open to all departments and years. Prizes worth ₹2,00,000+.',
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=400&fit=crop',
    'Mar 15, 2026', '2026-03-15 09:00:00+05:30', '9:00 AM',
    'AB-5 Auditorium, MUJ Campus', 'Tech',
    'Rahul Sharma', 'ACM MUJ', 500,
    false, 'from-primary to-accent', 'upcoming', 'approved', false
),
(
    'rang-cultural-fest',
    'Rang — Annual Cultural Fest',
    'A celebration of art, music & culture',
    'MUJ''s flagship cultural festival featuring music, dance, drama, art, and fashion. Three days of non-stop entertainment with celebrity performances.',
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=400&fit=crop',
    'Mar 22, 2026', '2026-03-22 10:00:00+05:30', '10:00 AM',
    'Main Ground, MUJ Campus', 'Cultural',
    'Priya Singh', 'Cultural Committee MUJ', 2000,
    false, 'from-accent to-primary', 'upcoming', 'approved', false
),
(
    'cricket-tournament',
    'Inter-Department Cricket Tournament',
    'Compete for the champion''s trophy',
    'Annual cricket tournament between all departments. Form your team of 11 and compete for the champion''s trophy. Registration per team.',
    'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&h=400&fit=crop',
    'Apr 1, 2026', '2026-04-01 07:00:00+05:30', '7:00 AM',
    'Sports Complex, MUJ', 'Sports',
    'Arjun Patel', 'Sports Club MUJ', 220,
    false, 'from-primary to-accent', 'upcoming', 'approved', false
),
(
    'aiml-workshop',
    'AI/ML Workshop — Hands-On Deep Learning',
    'Build real-world models with expert guidance',
    'A two-day intensive workshop on deep learning frameworks (TensorFlow, PyTorch). Build real-world models with expert guidance.',
    'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=400&fit=crop',
    'Mar 10, 2026', '2026-03-10 14:00:00+05:30', '2:00 PM',
    'CS Lab 3, Academic Block 4', 'Academic',
    'Dr. Neha Gupta', 'GDSC MUJ', 100,
    false, 'from-primary to-accent', 'upcoming', 'approved', false
),
(
    'tedxmuj-2026',
    'TEDxMUJ 2026',
    'Ideas worth spreading',
    'An independently organized TEDx event at Manipal University Jaipur. Hear from inspiring speakers across tech, art, science, and social impact.',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop',
    'Feb 20, 2026', '2026-02-20 10:00:00+05:30', '10:00 AM',
    'Convocation Hall, MUJ', 'Academic',
    'Sneha Jain', 'TEDxMUJ', 400,
    true, 'from-accent to-primary', 'completed', 'approved', true
),
(
    'startup-weekend',
    'Startup Weekend MUJ',
    '54 hours to build your startup',
    '54-hour event where aspiring entrepreneurs pitch ideas, form teams, and build startups. Mentored by industry leaders and investors.',
    'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=400&fit=crop',
    'Feb 5, 2026', '2026-02-05 18:00:00+05:30', '6:00 PM',
    'Incubation Centre, MUJ', 'Tech',
    'Vikram Desai', 'E-Cell MUJ', 200,
    false, 'from-primary to-accent', 'completed', 'approved', false
),
(
    'photography-walk',
    'Photography Walk — Jaipur Heritage',
    'Explore Jaipur through your lens',
    'Explore Jaipur''s stunning architecture and heritage sites with fellow photographers. Learn composition, lighting, and street photography techniques.',
    'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800&h=400&fit=crop',
    'Apr 10, 2026', '2026-04-10 06:00:00+05:30', '6:00 AM',
    'Hawa Mahal, Jaipur (Bus from MUJ)', 'Cultural',
    'Aisha Khan', 'Photography Club MUJ', 60,
    false, 'from-accent to-primary', 'upcoming', 'approved', false
),
(
    'badminton-championship',
    'Badminton Championship 2026',
    'Singles and doubles — compete for glory',
    'Singles and doubles badminton championship. Open to all MUJ students. Winners represent MUJ at inter-university level.',
    'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&h=400&fit=crop',
    'Apr 15, 2026', '2026-04-15 08:00:00+05:30', '8:00 AM',
    'Indoor Sports Hall, MUJ', 'Sports',
    'Ravi Kumar', 'Sports Club MUJ', 128,
    false, 'from-primary to-accent', 'upcoming', 'approved', false
);

-- Seed winners for completed events
INSERT INTO event_winners (event_id, position, name, reg_no, team_name)
SELECT e.id, '1st', 'Aarav Mehta', '220301120045', 'Team Innovate'
FROM events e WHERE e.slug = 'tedxmuj-2026';

INSERT INTO event_winners (event_id, position, name, reg_no)
SELECT e.id, '2nd', 'Priya Patel', '220302110032'
FROM events e WHERE e.slug = 'tedxmuj-2026';

INSERT INTO event_winners (event_id, position, name, reg_no)
SELECT e.id, '3rd', 'Rohan Gupta', '220301130078'
FROM events e WHERE e.slug = 'tedxmuj-2026';

INSERT INTO event_winners (event_id, position, name, reg_no, team_name)
SELECT e.id, '1st', 'Karthik Nair', '220301120067', 'StartupX'
FROM events e WHERE e.slug = 'startup-weekend';

INSERT INTO event_winners (event_id, position, name, reg_no, team_name)
SELECT e.id, '2nd', 'Sneha Joshi', '220301120089', 'InnoVenture'
FROM events e WHERE e.slug = 'startup-weekend';

INSERT INTO event_winners (event_id, position, name, reg_no, team_name)
SELECT e.id, '3rd', 'Aditya Kumar', '220301120112', 'TechPioneers'
FROM events e WHERE e.slug = 'startup-weekend';

INSERT INTO event_winners (event_id, position, name, reg_no, team_name)
SELECT e.id, 'Special Mention', 'Meera Patel', '220401120023', 'GreenTech'
FROM events e WHERE e.slug = 'startup-weekend';

-- Seed academic calendar
INSERT INTO academic_calendar (title, date, end_date, type, club) VALUES
('Odd Semester Begins', '2025-07-14', NULL, 'academic', NULL),
('Orientation Week', '2025-07-14', '2025-07-19', 'academic', NULL),
('Independence Day', '2025-08-15', NULL, 'holiday', NULL),
('Club Recruitment Drive', '2025-08-18', '2025-08-23', 'event', NULL),
('Mid-Semester Exams (Odd)', '2025-09-15', '2025-09-25', 'exam', NULL),
('Gandhi Jayanti', '2025-10-02', NULL, 'holiday', NULL),
('Dussehra Break', '2025-10-02', '2025-10-05', 'holiday', NULL),
('Tech Fest — Technovation', '2025-10-17', '2025-10-19', 'event', 'ACM MUJ'),
('Diwali Break', '2025-10-31', '2025-11-05', 'holiday', NULL),
('Rang — Cultural Fest', '2025-11-14', '2025-11-16', 'event', 'Cultural Committee MUJ'),
('End-Semester Exams (Odd)', '2025-12-01', '2025-12-15', 'exam', NULL),
('Winter Break Begins', '2025-12-16', NULL, 'holiday', NULL),
('Even Semester Begins', '2026-01-05', NULL, 'academic', NULL),
('Republic Day', '2026-01-26', NULL, 'holiday', NULL),
('Startup Weekend MUJ', '2026-02-05', '2026-02-07', 'event', 'E-Cell MUJ'),
('TEDxMUJ 2026', '2026-02-20', NULL, 'event', 'TEDxMUJ'),
('Mid-Semester Exams (Even)', '2026-03-02', '2026-03-12', 'exam', NULL),
('HackMUJ 3.0', '2026-03-15', '2026-03-16', 'event', 'ACM MUJ'),
('Holi Break', '2026-03-19', '2026-03-21', 'holiday', NULL),
('Rang — Annual Cultural Fest', '2026-03-22', '2026-03-24', 'event', 'Cultural Committee MUJ'),
('Cricket Tournament', '2026-04-01', '2026-04-05', 'event', 'Sports Club MUJ'),
('Photography Walk — Jaipur Heritage', '2026-04-10', NULL, 'event', 'Photography Club MUJ'),
('Badminton Championship', '2026-04-15', '2026-04-17', 'event', 'Sports Club MUJ'),
('End-Semester Exams (Even)', '2026-05-04', '2026-05-18', 'exam', NULL),
('Summer Break Begins', '2026-05-19', NULL, 'holiday', NULL),
('Convocation Ceremony', '2026-06-15', NULL, 'academic', NULL);