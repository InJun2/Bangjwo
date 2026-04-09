CREATE DATABASE IF NOT EXISTS bangjwo;

USE bangjwo;

CREATE TABLE IF NOT EXISTS `likes`
(
    `like_id`   BIGINT  NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `room_id`   BIGINT  NOT NULL,
    `member_id` BIGINT  NOT NULL,
    `flag`      BOOLEAN NOT NULL DEFAULT TRUE,
    INDEX `idx_room_id` (`room_id`)
);

CREATE TABLE IF NOT EXISTS `memo`
(
    `memo_id`   BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `member_id` BIGINT       NOT NULL,
    `room_id`   BIGINT       NOT NULL,
    `content`   VARCHAR(255) NOT NULL,
    INDEX `idx_room_member` (`room_id`, `member_id`)
);

CREATE TABLE IF NOT EXISTS `payment`
(
    `payment_id`     BIGINT                           NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `imp_uid`        VARCHAR(255)                     NULL,
    `merchant_uid`   VARCHAR(255)                     NOT NULL,
    `member_id`      BIGINT                           NOT NULL,
    `room_id`        BIGINT                           NOT NULL,
    `payment_status` ENUM ('READY', 'PAID', 'FAILED') NOT NULL DEFAULT 'READY',
    `pdf_url`        VARCHAR(255)                     NULL,
    `json_url`       VARCHAR(255)                     NULL,
    `created_at`     TIMESTAMP                        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`     TIMESTAMP                        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at`     TIMESTAMP                        NULL
);


CREATE TABLE IF NOT EXISTS `landlord_info`
(
    `landlord_info_id`                  BIGINT    NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `name`                              VARCHAR(20),
    `phone_number`                      VARCHAR(20),
    `address`                           TEXT,
    `resident_registration_number`      VARCHAR(255),
    `rental_property_address`           TEXT,
    `property_structure`                VARCHAR(255),
    `property_purpose`                  VARCHAR(255),
    `property_area`                     DECIMAL(10, 2),
    `priority_confirmed_date_yn`        BOOLEAN,
    `tax_arrears`                       BOOLEAN,
    `rental_housing_land_type`          VARCHAR(255),
    `rental_housing_land_area`          DECIMAL(10, 2),
    `rental_part_address`               VARCHAR(50),
    `rental_part_detail_address`        VARCHAR(100),
    `rental_part_area`                  DECIMAL(10, 2),
    `contract_type`                     ENUM ('NEW', 'RENEW_BY_AGREEMENT', 'EXTENSION'),
    `lease_type`                        ENUM ('MONTHLY_WITH_DEPOSIT', 'PURE_MONTHLY'),
    `previous_lease_start_date`         DATE,
    `previous_lease_end_date`           DATE,
    `previous_deposit_amount`           BIGINT,
    `previous_monthly_rent`             BIGINT,
    `deposit_amount`                    BIGINT,
    `monthly_rent`                      BIGINT,
    `lease_start_date`                  DATE,
    `lease_end_date`                    DATE,
    `contract_fee`                      INT,
    `middle_fee`                        INT,
    `interim_payment_date`              DATE,
    `balance`                           INT,
    `balance_payment_date`              DATE,
    `monthly_rent_payment_date`         VARCHAR(2),
    `monthly_rent_type`                 ENUM ('PREPAID', 'POSTPAID'),
    `fixed_management_fee`              INT,
    `unfixed_management_fee`            VARCHAR(255),
    `monthly_rent_account_bank`         VARCHAR(20),
    `monthly_rent_account_number`       VARCHAR(20),
    `facilities_repair_status`          BOOLEAN,
    `facilities_repair_content`         VARCHAR(255),
    `repair_completion_by_balance_date` DATE,
    `repair_completion_etc`             VARCHAR(255),
    `not_repaired_by_balance_date`      DATE,
    `not_repaired_etc`                  VARCHAR(255),
    `landlord_burden`                   VARCHAR(255),
    `tenant_burden`                     VARCHAR(255),
    `contract_written_date`             DATE,
    `landlord_signature_url_1`          VARCHAR(255),
    `landlord_signature_url_2`          VARCHAR(255),
    `landlord_signature_url_3`          VARCHAR(255),
    `landlord_signature_url_4`          VARCHAR(255),
    `created_at`                        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`                        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at`                        TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS `tenant_info`
(
    `tenant_info_id`               BIGINT    NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `name`                         VARCHAR(20),
    `phone`                        VARCHAR(20),
    `address`                      TEXT,
    `resident_registration_number` VARCHAR(255),
    `move_in_date`                 DATE,
    `tenant_signature_url`         VARCHAR(255),
    `created_at`                   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`                   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at`                   TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS `member`
(
    `member_id`   BIGINT    NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `kakao_id`    BIGINT    NOT NULL,
    `name`        VARCHAR(20),
    `nickname`    VARCHAR(20),
    `birthday`    VARCHAR(20),
    `phone`       VARCHAR(20),
    `profile_url` VARCHAR(255),
    `is_auth`     BOOLEAN            DEFAULT FALSE,
    `created_at`  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at`  TIMESTAMP NULL,
    INDEX `idx_member_id` (`member_id`),
    INDEX `idx_kakao_id` (`kakao_id`)
);

CREATE TABLE IF NOT EXISTS `special_clause`
(
    `special_clause_id`                 BIGINT    NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `move_in_registration_date`         DATE,
    `unpaid_amount`                     INT,
    `dispute_resolution`                BOOLEAN,
    `is_housing_reconstruction_planned` BOOLEAN,
    `construction_period`               DATE,
    `estimated_construction_duration`   INT,
    `is_detailed_address_consent_given` BOOLEAN,
    `created_at`                        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`                        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at`                        TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS `special_clause_etc`
(
    `special_clause_id` BIGINT NOT NULL,
    `etc_value`         TEXT
);

CREATE TABLE IF NOT EXISTS `contract`
(
    `contract_id`       BIGINT                                                                                        NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `room_id`           BIGINT UNIQUE,
    `landlord_id`       BIGINT                                                                                        NOT NULL,
    `tenant_id`         BIGINT                                                                                        NOT NULL,
    `landlord_info_id`  BIGINT                                                                                        NOT NULL UNIQUE,
    `tenant_info_id`    BIGINT                                                                                        NOT NULL UNIQUE,
    `special_clause_id` BIGINT                                                                                        NOT NULL UNIQUE,
    `ipfs_key`          VARCHAR(255)                                                                                  NOT NULL,
    `aes_key`           TEXT                                                                                          NOT NULL,
    `contract_status`   ENUM ('BEFORE_WRITE', 'LANDLORD_COMPLETED', 'TENANT_COMPLETED', 'TENANT_SIGNED', 'COMPLETED') NOT NULL,
    `landlord_auth`     BOOLEAN                                                                                       NOT NULL,
    `tenant_auth`       BOOLEAN                                                                                       NOT NULL,
    `created_at`        TIMESTAMP                                                                                     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`        TIMESTAMP                                                                                     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at`        TIMESTAMP                                                                                     NULL,
    INDEX `idx_room_id` (`room_id`),
    INDEX `idx_landlord_id` (`landlord_id`),
    INDEX `idx_tenant_id` (`tenant_id`),
    INDEX `idx_special_clause_id` (`special_clause_id`)
);

CREATE TABLE IF NOT EXISTS `options`
(
    `option_id`   BIGINT                                                                                                                           NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `room_id`     BIGINT                                                                                                                           NOT NULL,
    `option_name` ENUM ('ELEVATOR', 'ROOFTOP', 'AIR_CONDITIONER', 'WASHING_MACHINE', 'REFRIGERATOR', 'MICROWAVE', 'GAS_RANGE', 'INDUCTION', 'BED') NOT NULL,
    INDEX `idx_room_id` (`room_id`)
);

CREATE TABLE IF NOT EXISTS `image`
(
    `image_id`   BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `room_id`    BIGINT       NOT NULL,
    `image_url`  VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP    NOT NULL,
    `updated_at` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP    NULL,
    INDEX `idx_room_id` (`room_id`)
);

CREATE TABLE IF NOT EXISTS `review`
(
    `review_id`      BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `landlord_id`    BIGINT       NOT NULL,
    `tenant_id`      BIGINT       NOT NULL,
    `room_id`        BIGINT       NOT NULL,
    `real_estate_id` VARCHAR(255) NOT NULL,
    `address_detail` VARCHAR(255) NOT NULL,
    `content`        VARCHAR(255),
    `created_at`     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at`     TIMESTAMP    NULL
);

CREATE TABLE IF NOT EXISTS `address`
(
    `address_id`     BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `room_id`        BIGINT UNIQUE,
    `name`           VARCHAR(255),
    `address_detail` VARCHAR(255),
    `postal_code`    VARCHAR(10),
    `lat`            DECIMAL(9, 6),
    `lng`            DECIMAL(9, 6),
    `province`       VARCHAR(100),
    `city`           VARCHAR(100),
    `district`       VARCHAR(100),
    INDEX `idx_room_id` (`room_id`),
    INDEX `idx_lat_lng` (`lat`, `lng`)
);


CREATE TABLE IF NOT EXISTS `room`
(
    `room_id`            BIGINT                                                                                      NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `member_id`          BIGINT                                                                                      NOT NULL,
    `building_type`      ENUM ('ONEROOM_TWOROOM', 'APARTMENT', 'VILLA_HOUSE', 'OFFICETEL'),
    `status`             ENUM ('UNDER_VERIFICATION', 'ON_SALE', 'SOLD_OUT')                                          NOT NULL,
    `real_estate_id`     VARCHAR(20)                                                                                 NOT NULL,
    `deposit`            INT                                                                                         NOT NULL,
    `monthly_rent`       INT                                                                                         NOT NULL,
    `exclusive_area`     DECIMAL(10, 2),
    `supply_area`        DECIMAL(10, 2),
    `total_units`        INT,
    `floor`              VARCHAR(10),
    `max_floor`          INT,
    `parking_spaces`     INT                                                                                         NOT NULL,
    `available_from`     DATE                                                                                        NOT NULL,
    `permission_date`    DATE                                                                                        NOT NULL,
    `simple_description` VARCHAR(255),
    `description`        TEXT,
    `maintenance_cost`   INT                                                                                         NOT NULL,
    `room_cnt`           INT                                                                                         NOT NULL,
    `bathroom_cnt`       INT                                                                                         NOT NULL,
    `direction`          ENUM ('EAST', 'WEST', 'SOUTH', 'NORTH', 'NORTHWEST', 'NORTHEAST', 'SOUTHWEST', 'SOUTHEAST') NOT NULL,
    `verified`           BOOLEAN                                                                                     NOT NULL,
    `registry_paid`      BOOLEAN                                                                                     NOT NULL,
    `discussable`        BOOLEAN                                                                                     NOT NULL,
    `discuss_detail`     VARCHAR(255),
    `reviewable`         BOOLEAN                                                                                     NOT NULL,
    `is_phone_public`    BOOLEAN                                                                                     NOT NULL,
    `created_at`         TIMESTAMP                                                                                   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`         TIMESTAMP                                                                                   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at`         TIMESTAMP                                                                                   NULL,
    INDEX `idx_member_id` (`member_id`),
    INDEX `idx_status` (`status`)
);


CREATE TABLE IF NOT EXISTS `real_estate_pdf`
(
    `pdf_id`     BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `member_id`  BIGINT       NOT NULL,
    `room_id`    BIGINT       NOT NULL,
    `pdf_url`    VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP    NULL
);

CREATE TABLE IF NOT EXISTS `maintenance_include`
(
    `maintenance_id`           BIGINT                                                                                    NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `room_id`                  BIGINT                                                                                    NOT NULL,
    `maintenance_include_name` ENUM (
        'WATER', 'ELECTRICITY', 'INTERNET', 'GAS', 'CLEANING', 'CABLE_TV', 'PARKING', 'HEATING', 'ELEVATOR_MAINTENANCE') NOT NULL,
    INDEX `idx_room_id` (`room_id`)
);

CREATE TABLE IF NOT EXISTS `chat_room`
(
    `chat_room_id`          BIGINT    NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `landlord_id`           BIGINT    NOT NULL,
    `tenant_id`             BIGINT    NOT NULL,
    `room_id`               BIGINT    NOT NULL,
    `landload_unread_count` BIGINT    NOT NULL,
    `tenant_unread_count`   BIGINT    NOT NULL,
    `created_at`            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
