ALTER TABLE `mechanic`
    ADD COLUMN `image_url` VARCHAR(255) NULL,
    ADD COLUMN `opening_hours` JSON NULL,
    ADD COLUMN `latitude` DOUBLE NULL,
    ADD COLUMN `longitude` DOUBLE NULL;
