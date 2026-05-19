-- Remove product price and task-product goal linkage
ALTER TABLE `Producto` DROP COLUMN `precio`;
DROP TABLE IF EXISTS `TareaProducto`;

ALTER TABLE `Tarea`
  ADD COLUMN `clienteId` VARCHAR(191) NULL,
  ADD COLUMN `notaId` VARCHAR(191) NULL;

CREATE TABLE `Nota` (
  `id` VARCHAR(191) NOT NULL,
  `clienteId` VARCHAR(191) NOT NULL,
  `usuarioId` VARCHAR(36) NOT NULL,
  `contenido` LONGTEXT NOT NULL,
  `evidencia` LONGTEXT NULL,
  `createAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updateAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `IX_Nota_clienteId`(`clienteId`),
  INDEX `IX_Nota_usuarioId`(`usuarioId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX `IX_Tarea_clienteId` ON `Tarea`(`clienteId`);
CREATE INDEX `IX_Tarea_notaId` ON `Tarea`(`notaId`);

ALTER TABLE `Tarea` ADD CONSTRAINT `Tarea_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `Cliente`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `Tarea` ADD CONSTRAINT `Tarea_notaId_fkey` FOREIGN KEY (`notaId`) REFERENCES `Nota`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `Nota` ADD CONSTRAINT `Nota_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `Cliente`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `Nota` ADD CONSTRAINT `Nota_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
