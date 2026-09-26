-- ============================================================
-- CampusConnect — PostgreSQL Schema
-- Built from actual project pages and data structures
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";

-- ============================================================
-- ENUMS — exactly matching what the frontend uses
-- ============================================================

CREATE TYPE user_role     AS ENUM ('student', 'club_admin', 'university_admin');
CREATE TYPE event_status  AS ENUM ('upcoming', 'completed', 'cancelled');
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE event_category  AS ENUM ('Tech', 'Cultural', 'Sports', 'Academic');
CREATE TYPE club_category   AS ENUM ('Technical', 'Cultural', 'Sports', 'Literary', 'Social', 'Professional', 'Media', 'Wellness');
CREATE TYPE member_role     AS ENUM ('President', 'Vice President', 'General Secretary', 'Technical Head', 'Creative Head', 'Marketing Head', 'Content Head', 'Event Coordinator', 'Core Member', 'Executive Member', 'Member');
CREATE TYPE budget_type     AS ENUM ('inflow', 'outflow');
CREATE TYPE budget_category AS ENUM ('Sponsorship', 'Registration Fees', 'Ticket Sales', 'Venue & Logistics', 'Prizes', 'Food & Beverages', 'Speaker Fees', 'Production', 'Marketing', 'Miscellaneous');
CREATE TYPE winner_position AS ENUM ('1st', '2nd', '3rd', 'Special Mention');
CREATE TYPE calendar_type   AS ENUM ('academic', 'event', 'holiday', 'exam');
CREATE TYPE venue_type      AS ENUM ('hall', 'auditorium', 'lab', 'ground', 'seminar_room', 'open_air');
CREATE TYPE lost_found_type   AS ENUM ('lost', 'found');
CREATE TYPE lost_found_status AS ENUM ('open', 'resolved');
CREATE TYPE listing_status   AS ENUM ('active', 'sold', 'removed');
CREATE TYPE listing_category AS ENUM ('textbooks', 'electronics', 'clothing', 'stationery', 'furniture', 'other');
CREATE TYPE payment_status  AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE notification_type AS ENUM ('info', 'success', 'warning', 'alert');
CREATE TYPE point_reason AS ENUM ('attended_event', 'won_first', 'won_second', 'won_third', 'organized_event', 'club_activity');

-- ============================================================
-- USERS & AUTH
-- ============================================================

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           CITEXT NOT NULL UNIQUE,
    password_hash   TEXT NOT NULL,
    role            user_role NOT NULL DEFAULT 'student',
    is_verified     BOOLEAN NOT NULL DEFAULT FALSE,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Refresh token sessions (for JWT auth)
CREATE TABLE sessions (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token_hash  TEXT NOT NULL UNIQUE,
    expires_at          TIMESTAMPTZ NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE email_verifications (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token       TEXT NOT NULL UNIQUE,
    expires_at  TIMESTAMPTZ NOT NULL,
    used_at     TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE password_resets (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token       TEXT NOT NULL UNIQUE,
    expires_at  TIMESTAMPTZ NOT NULL,
    used_at     TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PROFILES
-- Matches StudentProfile interface + mockStudentProfile + StudentProfile.tsx
-- ============================================================

CREATE TABLE profiles (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    full_name           TEXT NOT NULL DEFAULT '',
    registration_number TEXT UNIQUE,
    branch              TEXT,
    year_of_study       TEXT,
    phone               TEXT,
    avatar_url          TEXT,
    bio                 TEXT,
    linkedin_url        TEXT,
    github_url          TEXT,
    events_attended     INTEGER NOT NULL DEFAULT 0,
    certificates_earned INTEGER NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CLUBS
-- Matches Club interface in clubsData.ts — all 80+ real MUJ clubs
-- ============================================================

CREATE TABLE clubs (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- slug matches club id from clubsData.ts e.g. 'acm', 'gdsc', 'e-cell'
    slug             TEXT NOT NULL UNIQUE,
    name             TEXT NOT NULL,
    short_name       TEXT,
    faculty          TEXT NOT NULL,   -- FoSTA, FoMCA, FoL, FoHS, DSW
    department       TEXT NOT NULL,   -- CSE, IT, ECE, MBA etc.
    category         club_category NOT NULL,
    description      TEXT,
    long_description TEXT,
    logo_url         TEXT,
    banner_url       TEXT,
    members_count    INTEGER NOT NULL DEFAULT 0,
    fee              INTEGER NOT NULL DEFAULT 250,  -- freshers membership fee in INR
    faculty_advisor  TEXT,
    faculty_email    TEXT,
    founded_year     INTEGER,
    instagram_url    TEXT,
    linkedin_url     TEXT,
    email            TEXT,
    admin_user_id    UUID REFERENCES users(id) ON DELETE SET NULL,
    is_active        BOOLEAN NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Club team members — matches TeamMember interface + mockClubTeam
CREATE TABLE club_members (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    club_id     UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role        member_role NOT NULL DEFAULT 'Member',
    department  TEXT,
    year        TEXT,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    joined_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (club_id, user_id)
);

-- ============================================================
-- EVENTS
-- Matches Event interface in mockData.ts exactly
-- ============================================================

CREATE TABLE events (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    club_id                 UUID REFERENCES clubs(id) ON DELETE SET NULL,
    created_by              UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    -- slug used in URL: /events/:slug and /event-register/:slug
    slug                    TEXT NOT NULL UNIQUE,
    title                   TEXT NOT NULL,
    tagline                 TEXT,
    description             TEXT,
    banner_url              TEXT,
    -- display_date is the human-readable string e.g. "Mar 22, 2026"
    display_date            TEXT,
    event_date              TIMESTAMPTZ,
    end_date                TIMESTAMPTZ,
    time                    TEXT,
    venue                   TEXT,
    category                event_category NOT NULL DEFAULT 'Tech',
    -- organizer fields match Event.organizer and Event.organizerClub
    organizer_name          TEXT,
    organizer_club          TEXT,
    max_capacity            INTEGER NOT NULL DEFAULT 500,
    is_paid                 BOOLEAN NOT NULL DEFAULT FALSE,
    ticket_price            NUMERIC(10, 2),
    registration_deadline   TIMESTAMPTZ,
    -- color gradient used on event cards e.g. 'from-primary to-accent'
    color                   TEXT DEFAULT 'from-primary to-accent',
    status                  event_status NOT NULL DEFAULT 'upcoming',
    approval_status         approval_status NOT NULL DEFAULT 'pending',
    certificate_template_url TEXT,
    certificate_uploaded    BOOLEAN NOT NULL DEFAULT FALSE,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Event winners — matches EventWinner interface
CREATE TABLE event_winners (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id    UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    position    winner_position NOT NULL,
    name        TEXT NOT NULL,
    reg_no      TEXT NOT NULL,
    team_name   TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Approval flow — matches AdminDashboard pending proposals
CREATE TABLE event_proposals (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id        UUID NOT NULL UNIQUE REFERENCES events(id) ON DELETE CASCADE,
    submitted_by    UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    status          approval_status NOT NULL DEFAULT 'pending',
    admin_notes     TEXT,
    reviewed_by     UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Event registrations — matches EventRegister.tsx form fields
CREATE TABLE event_registrations (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id        UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    full_name       TEXT NOT NULL,
    email           TEXT NOT NULL,
    phone           TEXT,
    year_of_study   TEXT,
    branch          TEXT,
    payment_id      UUID,
    registered_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (event_id, user_id)
);

-- Attendance — matches ClubAttendance.tsx + AttendanceRecord interface
CREATE TABLE attendance (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id    UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    marked_by   UUID REFERENCES users(id) ON DELETE SET NULL,
    marked_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (event_id, user_id)
);

-- Certificates — matches Certificate interface + Certificates.tsx
CREATE TABLE certificates (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id            UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    certificate_url     TEXT,
    issued_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (event_id, user_id)
);

-- ============================================================
-- CLUB BUDGET
-- Matches BudgetEntry interface + ClubBudget.tsx
-- ============================================================

CREATE TABLE club_budget (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    club_id     UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    event_id    UUID REFERENCES events(id) ON DELETE SET NULL,
    event_name  TEXT NOT NULL,
    type        budget_type NOT NULL,
    category    budget_category NOT NULL,
    amount      NUMERIC(12, 2) NOT NULL,
    description TEXT,
    date        DATE NOT NULL,
    created_by  UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- VENUES
-- Matches VenueFinder.tsx and the existing Supabase venues table
-- ============================================================

CREATE TABLE venues (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        TEXT NOT NULL,
    type        venue_type NOT NULL DEFAULT 'hall',
    capacity    INTEGER NOT NULL DEFAULT 0,
    location    TEXT NOT NULL DEFAULT '',
    block       TEXT NOT NULL DEFAULT '',
    floor       TEXT NOT NULL DEFAULT '',
    facilities  TEXT[] NOT NULL DEFAULT '{}',
    image_url   TEXT NOT NULL DEFAULT '',
    directions  TEXT NOT NULL DEFAULT '',
    lat         DOUBLE PRECISION NOT NULL,
    lng         DOUBLE PRECISION NOT NULL,
    created_by  UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ACADEMIC CALENDAR
-- Matches CalendarEvent interface + AcademicCalendar.tsx
-- ============================================================

CREATE TABLE academic_calendar (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title       TEXT NOT NULL,
    description TEXT,
    date        DATE NOT NULL,
    end_date    DATE,
    type        calendar_type NOT NULL DEFAULT 'academic',
    club        TEXT,
    created_by  UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- LEADERBOARD
-- Matches Leaderboard.tsx point system
-- ============================================================

CREATE TABLE leaderboard_points (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_id    UUID REFERENCES events(id) ON DELETE SET NULL,
    points      INTEGER NOT NULL DEFAULT 0,
    reason      point_reason NOT NULL,
    awarded_by  UUID REFERENCES users(id) ON DELETE SET NULL,
    awarded_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- MARKETPLACE
-- New feature — buy/sell between MUJ students
-- ============================================================

CREATE TABLE marketplace_listings (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title         TEXT NOT NULL,
    description   TEXT,
    price         NUMERIC(10, 2) NOT NULL,
    is_negotiable BOOLEAN NOT NULL DEFAULT TRUE,
    category      listing_category NOT NULL DEFAULT 'other',
    condition     TEXT,
    images        TEXT[] NOT NULL DEFAULT '{}',
    status        listing_status NOT NULL DEFAULT 'active',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE marketplace_messages (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id  UUID NOT NULL REFERENCES marketplace_listings(id) ON DELETE CASCADE,
    sender_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message     TEXT NOT NULL,
    is_read     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- LOST & FOUND
-- New feature — lost/found items on campus
-- ============================================================

CREATE TABLE lost_found_items (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reported_by   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type          lost_found_type NOT NULL,
    title         TEXT NOT NULL,
    description   TEXT,
    location      TEXT,
    date_occurred DATE,
    images        TEXT[] NOT NULL DEFAULT '{}',
    contact_info  TEXT,
    status        lost_found_status NOT NULL DEFAULT 'open',
    resolved_at   TIMESTAMPTZ,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PAYMENTS
-- Matches Payment.tsx — Razorpay integration for paid events
-- ============================================================

CREATE TABLE payments (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id               UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    razorpay_order_id     TEXT UNIQUE,
    razorpay_payment_id   TEXT UNIQUE,
    razorpay_signature    TEXT,
    amount                NUMERIC(10, 2) NOT NULL,
    currency              TEXT NOT NULL DEFAULT 'INR',
    status                payment_status NOT NULL DEFAULT 'pending',
    -- what this payment is for
    entity_type           TEXT NOT NULL,  -- 'event' | 'marketplace'
    entity_id             UUID NOT NULL,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

CREATE TABLE notifications (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title       TEXT NOT NULL,
    body        TEXT,
    type        notification_type NOT NULL DEFAULT 'info',
    is_read     BOOLEAN NOT NULL DEFAULT FALSE,
    action_url  TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_users_email         ON users(email);
CREATE INDEX idx_users_role          ON users(role);
CREATE INDEX idx_sessions_user_id    ON sessions(user_id);
CREATE INDEX idx_sessions_expires    ON sessions(expires_at);
CREATE INDEX idx_profiles_user_id    ON profiles(user_id);
CREATE INDEX idx_profiles_reg_no     ON profiles(registration_number);
CREATE INDEX idx_clubs_slug          ON clubs(slug);
CREATE INDEX idx_clubs_faculty       ON clubs(faculty);
CREATE INDEX idx_clubs_department    ON clubs(department);
CREATE INDEX idx_clubs_category      ON clubs(category);
CREATE INDEX idx_clubs_admin         ON clubs(admin_user_id);
CREATE INDEX idx_club_members_club   ON club_members(club_id);
CREATE INDEX idx_club_members_user   ON club_members(user_id);
CREATE INDEX idx_events_slug         ON events(slug);
CREATE INDEX idx_events_club_id      ON events(club_id);
CREATE INDEX idx_events_status       ON events(status);
CREATE INDEX idx_events_approval     ON events(approval_status);
CREATE INDEX idx_events_date         ON events(event_date);
CREATE INDEX idx_events_category     ON events(category);
CREATE INDEX idx_regs_event          ON event_registrations(event_id);
CREATE INDEX idx_regs_user           ON event_registrations(user_id);
CREATE INDEX idx_attendance_event    ON attendance(event_id);
CREATE INDEX idx_attendance_user     ON attendance(user_id);
CREATE INDEX idx_certs_user          ON certificates(user_id);
CREATE INDEX idx_certs_event         ON certificates(event_id);
CREATE INDEX idx_budget_club         ON club_budget(club_id);
CREATE INDEX idx_budget_event        ON club_budget(event_id);
CREATE INDEX idx_cal_date            ON academic_calendar(date);
CREATE INDEX idx_cal_type            ON academic_calendar(type);
CREATE INDEX idx_leaderboard_user    ON leaderboard_points(user_id);
CREATE INDEX idx_market_seller       ON marketplace_listings(seller_id);
CREATE INDEX idx_market_status       ON marketplace_listings(status);
CREATE INDEX idx_market_category     ON marketplace_listings(category);
CREATE INDEX idx_market_msgs_listing ON marketplace_messages(listing_id);
CREATE INDEX idx_lostfound_type      ON lost_found_items(type);
CREATE INDEX idx_lostfound_status    ON lost_found_items(status);
CREATE INDEX idx_payments_user       ON payments(user_id);
CREATE INDEX idx_payments_entity     ON payments(entity_type, entity_id);
CREATE INDEX idx_notifs_user         ON notifications(user_id);
CREATE INDEX idx_notifs_unread       ON notifications(user_id, is_read);

-- ============================================================
-- AUTO updated_at TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER t_users_upd        BEFORE UPDATE ON users               FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER t_profiles_upd     BEFORE UPDATE ON profiles            FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER t_clubs_upd        BEFORE UPDATE ON clubs               FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER t_events_upd       BEFORE UPDATE ON events              FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER t_venues_upd       BEFORE UPDATE ON venues              FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER t_market_upd       BEFORE UPDATE ON marketplace_listings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER t_lostfound_upd    BEFORE UPDATE ON lost_found_items    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER t_payments_upd     BEFORE UPDATE ON payments            FOR EACH ROW EXECUTE FUNCTION update_updated_at();