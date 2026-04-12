-- CreateTable
CREATE TABLE `users` (
    `id` CHAR(36) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `role` VARCHAR(20) NOT NULL DEFAULT 'user',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `songs` (
    `id` CHAR(36) NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `artist` VARCHAR(200) NOT NULL,
    `file_url` TEXT NOT NULL,
    `cover_image_url` TEXT NOT NULL,
    `duration` DOUBLE NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `songs_is_active_idx`(`is_active`),
    INDEX `songs_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `platform_settings` (
    `id` VARCHAR(64) NOT NULL,
    `music_enabled` BOOLEAN NOT NULL DEFAULT true,
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `withdrawal_settings` (
    `id` VARCHAR(64) NOT NULL,
    `paypal_enabled` BOOLEAN NOT NULL DEFAULT true,
    `revolut_enabled` BOOLEAN NOT NULL DEFAULT true,
    `bank_enabled` BOOLEAN NOT NULL DEFAULT true,
    `crypto_enabled` BOOLEAN NOT NULL DEFAULT true,
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `crypto_configs` (
    `id` CHAR(36) NOT NULL,
    `coin` VARCHAR(64) NOT NULL,
    `is_enabled` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `crypto_configs_coin_key`(`coin`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `crypto_networks` (
    `id` CHAR(36) NOT NULL,
    `crypto_config_id` CHAR(36) NOT NULL,
    `name` VARCHAR(64) NOT NULL,
    `is_enabled` BOOLEAN NOT NULL DEFAULT true,

    INDEX `crypto_networks_crypto_config_id_idx`(`crypto_config_id`),
    UNIQUE INDEX `crypto_networks_crypto_config_id_name_key`(`crypto_config_id`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_payment_details` (
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `paypal_email` VARCHAR(255) NULL,
    `paypal_name` VARCHAR(255) NULL,
    `paypal_paypal_id` VARCHAR(255) NULL,
    `revolut_full_name` VARCHAR(255) NULL,
    `revolut_iban` VARCHAR(255) NULL,
    `revolut_bic` VARCHAR(255) NULL,
    `revolut_tag` VARCHAR(255) NULL,
    `bank_account_name` VARCHAR(255) NULL,
    `bank_sort_code` VARCHAR(255) NULL,
    `bank_account_number` VARCHAR(255) NULL,
    `bank_bank_name` VARCHAR(255) NULL,
    `bank_iban` VARCHAR(255) NULL,
    `bank_bic_swift` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `user_payment_details_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `withdrawals` (
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `method` VARCHAR(20) NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'pending',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `withdrawals_user_id_created_at_idx`(`user_id`, `created_at`),
    INDEX `withdrawals_status_created_at_idx`(`status`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `withdrawal_snapshots` (
    `withdrawal_id` CHAR(36) NOT NULL,
    `email` VARCHAR(255) NULL,
    `name` VARCHAR(255) NULL,
    `paypal_id` VARCHAR(255) NULL,
    `full_name` VARCHAR(255) NULL,
    `iban` VARCHAR(255) NULL,
    `bic` VARCHAR(255) NULL,
    `tag` VARCHAR(255) NULL,
    `account_name` VARCHAR(255) NULL,
    `sort_code` VARCHAR(255) NULL,
    `account_number` VARCHAR(255) NULL,
    `bank_name` VARCHAR(255) NULL,
    `bic_swift` VARCHAR(255) NULL,
    `coin` VARCHAR(64) NULL,
    `network` VARCHAR(64) NULL,
    `wallet_address` VARCHAR(255) NULL,

    PRIMARY KEY (`withdrawal_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `crypto_networks` ADD CONSTRAINT `crypto_networks_crypto_config_id_fkey` FOREIGN KEY (`crypto_config_id`) REFERENCES `crypto_configs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_payment_details` ADD CONSTRAINT `user_payment_details_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `withdrawals` ADD CONSTRAINT `withdrawals_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `withdrawal_snapshots` ADD CONSTRAINT `withdrawal_snapshots_withdrawal_id_fkey` FOREIGN KEY (`withdrawal_id`) REFERENCES `withdrawals`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
