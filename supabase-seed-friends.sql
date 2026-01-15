-- This script seeds the 'friends' table for all existing users
-- based on a default list of friends.
-- It ensures that a user is not added as their own friend.

-- Start a transaction
BEGIN;

-- Temporarily create a table to hold the default friends data
CREATE TEMP TABLE default_friends_temp (
  id TEXT,
  name TEXT,
  job TEXT,
  gender TEXT,
  company TEXT
);

-- Insert the default friends from default_friends.md into the temp table
INSERT INTO default_friends_temp (id, name, job, gender, company) VALUES
('frank.jeong', 'frank.jeong', '개발', '남자', '카카오'),
('hani.kim', 'hani.kim', '디자인', '여자', '카카오'),
('lucy.d', 'lucy.d', '개발', '남자', '카카오페이'),
('yian.n', 'yian.n', '스태프', '여자', '카카오 엔터테인먼트');

-- For each user in the 'users' table, insert the default friends,
-- excluding the user themselves.
-- This uses a CROSS JOIN to create all possible combinations of users and default friends,
-- and then filters out the cases where the user and friend are the same.
INSERT INTO friends (user_id, id, name, job, gender, company)
SELECT
  u.username AS user_id,
  df.id,
  df.name,
  df.job,
  df.gender,
  df.company
FROM
  users u
CROSS JOIN
  default_friends_temp df
WHERE
  u.username != df.id
ON CONFLICT (user_id, id) DO NOTHING; -- Avoid inserting duplicates if the script is run again

-- Drop the temporary table
DROP TABLE default_friends_temp;

-- Commit the transaction
COMMIT;
