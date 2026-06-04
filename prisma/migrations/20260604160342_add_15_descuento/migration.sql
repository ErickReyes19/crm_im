-- DropForeignKey
ALTER TABLE `usuarios` DROP FOREIGN KEY `FK_Usuarios_adminPadreId`;

-- DropIndex
DROP INDEX `IX_Usuarios_ultimaActividad` ON `usuarios`;

-- DropIndex
DROP INDEX `IX_Usuarios_ultimoInicioSesion` ON `usuarios`;

-- AlterTable
ALTER TABLE `ventaproducto` MODIFY `tipoPrecio` ENUM('NORMAL', 'DESCUENTO_10', 'DESCUENTO_15', 'DESCUENTO_20', 'DESCUENTO_30') NOT NULL DEFAULT 'NORMAL';

-- AddForeignKey
ALTER TABLE `Usuarios` ADD CONSTRAINT `Usuarios_adminPadreId_fkey` FOREIGN KEY (`adminPadreId`) REFERENCES `Usuarios`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
