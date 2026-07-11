DROP DATABASE IF EXISTS transaction_service;

CREATE DATABASE  transaction_service
    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE transaction_service;

CREATE TABLE IF NOT EXISTS transactions (
    id                CHAR(36)      NOT NULL,           
    from_account_id   CHAR(36)      NOT NULL,          
    to_account_id     CHAR(36)      NOT NULL,           
    initiated_by      VARCHAR(255)  NOT NULL,           
    amount            DECIMAL(19,4) NOT NULL,           
    currency          CHAR(3)       NOT NULL DEFAULT 'MXN',
    status            ENUM('pending','completed','failed') NOT NULL DEFAULT 'pending',
    description       VARCHAR(255)  NULL,
    failure_reason    VARCHAR(255)  NULL,             
    created_at        TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_tx_from (from_account_id),
    INDEX idx_tx_to (to_account_id),
    INDEX idx_tx_initiator (initiated_by)
) ENGINE=InnoDB;