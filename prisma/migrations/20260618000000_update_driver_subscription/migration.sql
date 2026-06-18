ALTER TABLE `driver` DROP FOREIGN KEY `driver_ibfk_1`;
ALTER TABLE `driver` DROP INDEX `id_subscription`;
ALTER TABLE `driver` DROP COLUMN `id_subscription`;
ALTER TABLE `driver` ADD COLUMN `id_subscription_type` INT NULL;
ALTER TABLE `driver` ADD CONSTRAINT `driver_ibfk_1` FOREIGN KEY (`id_subscription_type`) REFERENCES `subscription_type`(`id_subscription_type`) ON DELETE NO ACTION ON UPDATE NO ACTION;
CREATE INDEX `id_subscription_type` ON `driver`(`id_subscription_type`);