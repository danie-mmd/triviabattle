CREATE TABLE `auth_logs` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT DEFAULT NULL, 
  `username` VARCHAR(64) DEFAULT NULL,
  `status` ENUM('SUCCESS', 'FAILED_INVALID_SIGNATURE', 'FAILED_EXPIRED', 'ERROR') NOT NULL,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_auth_logs_user` (`user_id`),
  KEY `idx_auth_logs_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;