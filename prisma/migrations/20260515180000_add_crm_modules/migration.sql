-- CreateTable
CREATE TABLE `Cliente` (
  `id` VARCHAR(191) NOT NULL,
  `nombre` VARCHAR(191) NOT NULL,
  `apellido` VARCHAR(191) NOT NULL,
  `ciudad` VARCHAR(191) NOT NULL,
  `correo` VARCHAR(191) NOT NULL,
  `numero` VARCHAR(191) NOT NULL,
  `direccion` VARCHAR(191) NOT NULL,
  `etiqueta` ENUM('NUEVO','INTERESADO') NOT NULL DEFAULT 'NUEVO',
  `usuarioAsignadoId` VARCHAR(36) NOT NULL,
  `createAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updateAt` DATETIME(3) NOT NULL,
  `activo` BOOLEAN NOT NULL DEFAULT true,
  UNIQUE INDEX `Cliente_correo_key`(`correo`),
  INDEX `IX_Cliente_usuarioAsignadoId`(`usuarioAsignadoId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Venta` (
  `id` VARCHAR(191) NOT NULL,
  `clienteId` VARCHAR(191) NOT NULL,
  `usuarioId` VARCHAR(36) NOT NULL,
  `total` DECIMAL(10,2) NOT NULL,
  `estado` ENUM('PROCESO','ENVIO','ENTREGADA') NOT NULL DEFAULT 'PROCESO',
  `createAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updateAt` DATETIME(3) NOT NULL,
  INDEX `IX_Venta_clienteId`(`clienteId`),
  INDEX `IX_Venta_usuarioId`(`usuarioId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Tarea` (
  `id` VARCHAR(191) NOT NULL,
  `nombre` VARCHAR(191) NOT NULL,
  `descripcion` VARCHAR(191) NOT NULL,
  `estado` ENUM('PENDIENTE','EN_PROGRESO','COMPLETADA') NOT NULL DEFAULT 'PENDIENTE',
  `fechaFinalizacion` DATETIME(3) NOT NULL,
  `asignadoAId` VARCHAR(36) NOT NULL,
  `asignadoPorId` VARCHAR(36) NOT NULL,
  `createAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updateAt` DATETIME(3) NOT NULL,
  INDEX `IX_Tarea_asignadoAId`(`asignadoAId`),
  INDEX `IX_Tarea_asignadoPorId`(`asignadoPorId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `Cliente` ADD CONSTRAINT `Cliente_usuarioAsignadoId_fkey` FOREIGN KEY (`usuarioAsignadoId`) REFERENCES `Usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `Venta` ADD CONSTRAINT `Venta_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `Cliente`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `Venta` ADD CONSTRAINT `Venta_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `Tarea` ADD CONSTRAINT `Tarea_asignadoAId_fkey` FOREIGN KEY (`asignadoAId`) REFERENCES `Usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `Tarea` ADD CONSTRAINT `Tarea_asignadoPorId_fkey` FOREIGN KEY (`asignadoPorId`) REFERENCES `Usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
