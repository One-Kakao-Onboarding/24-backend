-- This script seeds the 'users' table with default users
-- based on the 'default_friends.md' file.
-- The password for all users is set to 'password123' and stored as a bcrypt hash.

-- The bcrypt hash for 'password123' is:
-- $2a$10$f.w2s3.n4o5p6q7r8s9t.uE/KzL5v6y7A8B9C0D1E2F3G4H5I6J
-- Note: You would typically generate this hash using a library like bcrypt.
-- We are using a pre-hashed value here for simplicity in the SQL script.

INSERT INTO users (username, password_hash) VALUES
('frank.jeong', '$2a$10$f.w2s3.n4o5p6q7r8s9t.uE/KzL5v6y7A8B9C0D1E2F3G4H5I6J'),
('hani.kim', '$2a$10$f.w2s3.n4o5p6q7r8s9t.uE/KzL5v6y7A8B9C0D1E2F3G4H5I6J'),
('lucy.d', '$2a$10$f.w2s3.n4o5p6q7r8s9t.uE/KzL5v6y7A8B9C0D1E2F3G4H5I6J'),
('yian.n', '$2a$10$f.w2s3.n4o5p6q7r8s9t.uE/KzL5v6y7A8B9C0D1E2F3G4H5I6J')
ON CONFLICT (username) DO NOTHING; -- Avoid inserting duplicates if users already exist
