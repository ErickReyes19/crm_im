-- CreateTable
CREATE TABLE `Tarea` (
  `id` VARCHAR(191) NOT NULL,
  `notaId` VARCHAR(191) NOT NULL,
  `usuarioId` VARCHAR(36) NOT NULL,
  `titulo` VARCHAR(191) NOT NULL,
  `descripcion` LONGTEXT NULL,
  `fechaObjetivo` DATETIME(3) NOT NULL,
  `estado` ENUM('PENDIENTE', 'EN_PROGRESO', 'COMPLETADA') NOT NULL DEFAULT 'PENDIENTE',
  `createAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updateAt` DATETIME(3) NOT NULL,

  INDEX `IX_Tarea_notaId`(`notaId`),
  INDEX `IX_Tarea_usuarioId`(`usuarioId`),
  INDEX `IX_Tarea_fechaObjetivo`(`fechaObjetivo`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Tarea` ADD CONSTRAINT `Tarea_notaId_fkey` FOREIGN KEY (`notaId`) REFERENCES `Nota`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Tarea` ADD CONSTRAINT `Tarea_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TareaProducto` ADD CONSTRAINT `TareaProducto_tareaId_fkey` FOREIGN KEY (`tareaId`) REFERENCES `Tarea`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
