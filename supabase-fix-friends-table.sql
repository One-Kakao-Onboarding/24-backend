-- This script corrects the primary key on the 'friends' table.
-- It replaces the single-column primary key on 'id' with a composite
-- primary key on ('user_id', 'id'). This ensures that the combination
-- of a user and their friend is unique.

-- Start a transaction
BEGIN;

-- Drop the existing primary key constraint on the 'friends' table.
-- The default name for a primary key constraint is usually '<table>_pkey'.
ALTER TABLE friends DROP CONSTRAINT IF EXISTS friends_pkey;

-- Add a new composite primary key on both 'user_id' and 'id'.
ALTER TABLE friends ADD PRIMARY KEY (user_id, id);

-- Commit the transaction
COMMIT;
