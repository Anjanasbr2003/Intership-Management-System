-- ==============================================================================
-- 20. Restrict Database Permissions (Least-Privilege Principle)
-- Run this script as MySQL root/admin to provision a hardened application user
-- ==============================================================================

-- 1. Create a dedicated application database user (replace with strong password)
CREATE USER IF NOT EXISTS 'interlink_app'@'localhost' IDENTIFIED BY 'InterLink_Secure_App_Pwd_2026!';
CREATE USER IF NOT EXISTS 'interlink_app'@'127.0.0.1' IDENTIFIED BY 'InterLink_Secure_App_Pwd_2026!';

-- 2. Revoke all global permissions (prevent server-level administrative abuse)
REVOKE ALL PRIVILEGES, GRANT OPTION FROM 'interlink_app'@'localhost';
REVOKE ALL PRIVILEGES, GRANT OPTION FROM 'interlink_app'@'127.0.0.1';

-- 3. Grant ONLY Data Manipulation privileges on interlink_db
-- Denies DROP, ALTER, CREATE USER, FILE, PROCESS, SUPER, SHUTDOWN, RELOAD
GRANT SELECT, INSERT, UPDATE, DELETE ON `interlink_db`.* TO 'interlink_app'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON `interlink_db`.* TO 'interlink_app'@'127.0.0.1';

-- 4. Apply changes
FLUSH PRIVILEGES;

-- Verification
SHOW GRANTS FOR 'interlink_app'@'localhost';
