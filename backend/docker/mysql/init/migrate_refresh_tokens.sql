USE anime_dating;

SET @has_avatar := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = 'anime_dating' AND table_name = 'users' AND column_name = 'avatar'
);
SET @sql_avatar := IF(
  @has_avatar = 0,
  'ALTER TABLE users ADD COLUMN avatar VARCHAR(255) NULL',
  'SELECT 1'
);
PREPARE stmt FROM @sql_avatar;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_created_at := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = 'anime_dating' AND table_name = 'users' AND column_name = 'createdAt'
);
SET @sql_created_at := IF(
  @has_created_at = 0,
  'ALTER TABLE users ADD COLUMN createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP',
  'SELECT 1'
);
PREPARE stmt FROM @sql_created_at;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_is_admin := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = 'anime_dating' AND table_name = 'users' AND column_name = 'is_admin'
);
SET @sql_is_admin := IF(
  @has_is_admin = 0,
  'ALTER TABLE users ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT FALSE',
  'SELECT 1'
);
PREPARE stmt FROM @sql_is_admin;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token TEXT NOT NULL,
  expires_at DATETIME NOT NULL,
  revoked BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
