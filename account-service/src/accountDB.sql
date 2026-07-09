DROP DATABASE IF EXISTS account_service;

CREATE DATABASE account_service
    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE account_service;

CREATE TABLE IF NOT EXISTS accounts (
    id            CHAR(36)      NOT NULL,                 
    profile_id    VARCHAR(255)   NOT NULL,                 -
    bank_name     VARCHAR(100)  NOT NULL,
    account_type  ENUM('checking','savings') NOT NULL DEFAULT 'checking',
    balance       DECIMAL(19,4) NOT NULL DEFAULT 0,       
    currency      CHAR(3)       NOT NULL DEFAULT 'MXN',
    status        ENUM('active','frozen','closed') NOT NULL DEFAULT 'active',
    created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_accounts_profile (profile_id)
    ) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS cards (
    id            CHAR(36)      NOT NULL,
    account_id    CHAR(36)      NOT NULL,
    last4         CHAR(4)       NOT NULL,
    brand         ENUM('visa','mastercard','amex','other') NOT NULL DEFAULT 'other',
    card_type     ENUM('debit','credit') NOT NULL DEFAULT 'debit',
    expiry_month  TINYINT       NOT NULL,
    expiry_year   SMALLINT      NOT NULL,
    status        ENUM('active','blocked','expired') NOT NULL DEFAULT 'active',
    created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_cards_account (account_id),
    CONSTRAINT fk_cards_account FOREIGN KEY (account_id)
    REFERENCES accounts (id) ON DELETE CASCADE
) ENGINE=InnoDB;