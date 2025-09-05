-- ===========================
-- 1. Rooms Table
-- ===========================
CREATE TABLE rooms (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    type text NOT NULL CHECK (type IN ('unconference', 'booth_area')),
    capacity int
);

-- Sample data
INSERT INTO rooms (id, name, type, capacity) VALUES
(gen_random_uuid(), 'Room 101', 'unconference', 50),
(gen_random_uuid(), 'Room 102', 'unconference', 50),
(gen_random_uuid(), 'Hall A', 'booth_area', 200);

-- ===========================
-- 2. Tracks Table
-- ===========================
CREATE TABLE tracks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id uuid REFERENCES rooms(id) ON DELETE CASCADE,
    name text NOT NULL,
    track_type text NOT NULL CHECK (track_type IN ('unconference', 'booth'))
);

-- Sample data
-- We'll assume IDs for rooms are known from previous inserts, for demo purposes let's hardcode them
WITH r AS (
    SELECT id, name FROM rooms
)
INSERT INTO tracks (id, room_id, name, track_type) VALUES
(gen_random_uuid(), (SELECT id FROM r WHERE name='Room 101'), 'Room 101', 'unconference'),
(gen_random_uuid(), (SELECT id FROM r WHERE name='Room 102'), 'Room 102', 'unconference'),
(gen_random_uuid(), (SELECT id FROM r WHERE name='Hall A'), 'Table 1', 'booth'),
(gen_random_uuid(), (SELECT id FROM r WHERE name='Hall A'), 'Table 2', 'booth');

-- ===========================
-- 3. Events Table
-- ===========================
CREATE TABLE events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    description text,
    event_type text NOT NULL CHECK (event_type IN ('anchor', 'unconference', 'booth')),
    start_time timestamptz NOT NULL,
    end_time timestamptz NOT NULL,
    track_id uuid REFERENCES tracks(id) ON DELETE SET NULL,
    facilitator text,
    capacity int
);

-- Sample data
-- For simplicity, let's assume track IDs are known from previous inserts (replace with actual UUIDs)
WITH t AS (
    SELECT id, name FROM tracks
)
INSERT INTO events (title, event_type, start_time, end_time, track_id, facilitator) VALUES
('Opening', 'anchor', '2025-09-05 09:00', '2025-09-05 09:30', NULL, NULL),
('Main Demo 1', 'anchor', '2025-09-05 09:30', '2025-09-05 10:15', NULL, NULL),
('Session A', 'unconference', '2025-09-05 10:30', '2025-09-05 11:15', (SELECT id FROM t WHERE name='Room 101'), 'Alice'),
('Session B', 'unconference', '2025-09-05 10:30', '2025-09-05 11:15', (SELECT id FROM t WHERE name='Room 102'), 'Bob'),
('Booth X', 'booth', '2025-09-05 10:30', '2025-09-05 11:00', (SELECT id FROM t WHERE name='Table 1'), NULL),
('Booth Y', 'booth', '2025-09-05 11:00', '2025-09-05 11:30', (SELECT id FROM t WHERE name='Table 2'), NULL),
('Lunch', 'anchor', '2025-09-05 12:00', '2025-09-05 13:00', NULL, NULL),
('Session C', 'unconference', '2025-09-05 13:15', '2025-09-05 14:00', (SELECT id FROM t WHERE name='Room 101'), 'Charlie'),
('Booth Z', 'booth', '2025-09-05 13:15', '2025-09-05 13:45', (SELECT id FROM t WHERE name='Table 1'), NULL),
('Closing', 'anchor', '2025-09-05 16:30', '2025-09-05 17:00', NULL, NULL);
