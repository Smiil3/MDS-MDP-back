ALTER TABLE `mechanic`
    ADD COLUMN `email` VARCHAR(100) NOT NULL,
    ADD COLUMN `password` VARCHAR(100) NOT NULL;

CREATE UNIQUE INDEX `email` ON `mechanic`(`email`);
