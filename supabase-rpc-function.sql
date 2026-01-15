CREATE OR REPLACE FUNCTION get_recent_chats_for_user(p_user_id TEXT)
RETURNS TABLE (
  friend_id TEXT,
  name TEXT,
  job TEXT,
  company TEXT,
  "lastMessage" TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  WITH ranked_messages AS (
    SELECT
      m.friend_id,
      m.content,
      m.created_at,
      f.name,
      f.job,
      f.company,
      ROW_NUMBER() OVER(PARTITION BY m.friend_id ORDER BY m.created_at DESC) as rn
    FROM
      messages m
    LEFT JOIN
      friends f ON m.friend_id = f.id
    WHERE
      m.user_id = p_user_id
  )
  SELECT
    rm.friend_id,
    rm.name,
    rm.job,
    rm.company,
    rm.content AS "lastMessage",
    rm.created_at
  FROM
    ranked_messages rm
  WHERE
    rm.rn = 1
  ORDER BY
    rm.created_at DESC;
END;
$$ LANGUAGE plpgsql;
