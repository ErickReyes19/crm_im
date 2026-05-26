-- Add admin/vendedor hierarchy
ALTER TABLE `Usuarios`
  ADD COLUMN `adminPadreId` VARCHAR(36) NULL;

ALTER TABLE `Usuarios`
  ADD INDEX `IX_Usuarios_adminPadreId` (`adminPadreId`);

ALTER TABLE `Usuarios`
  ADD CONSTRAINT `FK_Usuarios_adminPadreId`
    FOREIGN KEY (`adminPadreId`) REFERENCES `Usuarios`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE;
