-- AlterTable
ALTER TABLE `mechanic` ADD COLUMN `city` VARCHAR(100) NOT NULL DEFAULT '' AFTER `zip_code`;
