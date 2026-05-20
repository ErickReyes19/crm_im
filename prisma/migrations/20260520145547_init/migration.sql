-- CreateTable
CREATE TABLE `Permiso` (
    `id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `descripcion` VARCHAR(191) NOT NULL,
    `createAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updateAt` DATETIME(3) NOT NULL,
    `activo` BOOLEAN NOT NULL,

    UNIQUE INDEX `Permiso_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RolPermiso` (
    `id` VARCHAR(191) NOT NULL,
    `rolId` VARCHAR(191) NOT NULL,
    `permisoId` VARCHAR(191) NOT NULL,
    `createAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `RolPermiso_permisoId_fkey`(`permisoId`),
    UNIQUE INDEX `RolPermiso_rolId_permisoId_key`(`rolId`, `permisoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Rol` (
    `id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `descripcion` VARCHAR(191) NOT NULL,
    `createAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updateAt` DATETIME(3) NOT NULL,
    `activo` BOOLEAN NOT NULL,

    UNIQUE INDEX `Rol_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Usuarios` (
    `id` VARCHAR(36) NOT NULL,
    `usuario` VARCHAR(50) NOT NULL,
    `contrasena` LONGTEXT NOT NULL,
    `nombre` VARCHAR(100) NULL,
    `fotoUrl` VARCHAR(512) NULL,
    `direccion` VARCHAR(180) NULL,
    `telefono` VARCHAR(30) NULL,
    `ciudad` VARCHAR(100) NULL,
    `DebeCambiarPassword` BOOLEAN NULL,
    `email` VARCHAR(191) NOT NULL,
    `createAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updateAt` DATETIME(3) NOT NULL,
    `rol_id` VARCHAR(36) NOT NULL,
    `activo` BIT(1) NOT NULL,

    UNIQUE INDEX `Usuarios_email_key`(`email`),
    INDEX `IX_Usuarios_rol_id`(`rol_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PasswordResetToken` (
    `id` VARCHAR(36) NOT NULL,
    `userId` VARCHAR(36) NOT NULL,
    `token` VARCHAR(128) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `PasswordResetToken_token_key`(`token`),
    INDEX `IX_PasswordResetToken_userId`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cliente` (
    `id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `apellido` VARCHAR(191) NOT NULL,
    `ciudad` VARCHAR(191) NOT NULL,
    `correo` VARCHAR(191) NOT NULL,
    `numero` VARCHAR(191) NOT NULL,
    `direccion` VARCHAR(191) NOT NULL,
    `etiqueta` ENUM('NUEVO', 'INTERESADO') NOT NULL DEFAULT 'NUEVO',
    `usuarioAsignadoId` VARCHAR(36) NOT NULL,
    `createAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updateAt` DATETIME(3) NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `Cliente_correo_key`(`correo`),
    INDEX `IX_Cliente_usuarioAsignadoId`(`usuarioAsignadoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Producto` (
    `id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `descripcion` VARCHAR(191) NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `creadoPorId` VARCHAR(36) NOT NULL,
    `createAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updateAt` DATETIME(3) NOT NULL,

    INDEX `IX_Producto_creadoPorId`(`creadoPorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Venta` (
    `id` VARCHAR(191) NOT NULL,
    `clienteId` VARCHAR(191) NOT NULL,
    `usuarioId` VARCHAR(36) NOT NULL,
    `total` DECIMAL(10, 2) NOT NULL,
    `estado` ENUM('PROCESO', 'ENVIO', 'ENTREGADA') NOT NULL DEFAULT 'PROCESO',
    `createAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updateAt` DATETIME(3) NOT NULL,

    INDEX `IX_Venta_clienteId`(`clienteId`),
    INDEX `IX_Venta_usuarioId`(`usuarioId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VentaProducto` (
    `id` VARCHAR(191) NOT NULL,
    `ventaId` VARCHAR(191) NOT NULL,
    `productoId` VARCHAR(191) NOT NULL,
    `cantidad` INTEGER NOT NULL,
    `precioUnitario` DECIMAL(10, 2) NOT NULL,
    `subtotal` DECIMAL(10, 2) NOT NULL,
    `tipoPrecio` ENUM('NORMAL', 'DESCUENTO_10', 'DESCUENTO_20') NOT NULL DEFAULT 'NORMAL',
    `createAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `IX_VentaProducto_ventaId`(`ventaId`),
    INDEX `IX_VentaProducto_productoId`(`productoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Nota` (
    `id` VARCHAR(191) NOT NULL,
    `clienteId` VARCHAR(191) NOT NULL,
    `usuarioId` VARCHAR(36) NOT NULL,
    `contenido` LONGTEXT NOT NULL,
    `evidencia` LONGTEXT NULL,
    `createAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updateAt` DATETIME(3) NOT NULL,

    INDEX `IX_Nota_clienteId`(`clienteId`),
    INDEX `IX_Nota_usuarioId`(`usuarioId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TareaProducto` (
    `id` VARCHAR(191) NOT NULL,
    `tareaId` VARCHAR(191) NOT NULL,
    `productoId` VARCHAR(191) NOT NULL,
    `cantidadObjetivo` INTEGER NOT NULL,
    `createAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `IX_TareaProducto_tareaId`(`tareaId`),
    INDEX `IX_TareaProducto_productoId`(`productoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `RolPermiso` ADD CONSTRAINT `RolPermiso_permisoId_fkey` FOREIGN KEY (`permisoId`) REFERENCES `Permiso`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RolPermiso` ADD CONSTRAINT `RolPermiso_rolId_fkey` FOREIGN KEY (`rolId`) REFERENCES `Rol`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Usuarios` ADD CONSTRAINT `Usuarios_rol_id_fkey` FOREIGN KEY (`rol_id`) REFERENCES `Rol`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PasswordResetToken` ADD CONSTRAINT `PasswordResetToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cliente` ADD CONSTRAINT `Cliente_usuarioAsignadoId_fkey` FOREIGN KEY (`usuarioAsignadoId`) REFERENCES `Usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Producto` ADD CONSTRAINT `Producto_creadoPorId_fkey` FOREIGN KEY (`creadoPorId`) REFERENCES `Usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Venta` ADD CONSTRAINT `Venta_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `Cliente`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Venta` ADD CONSTRAINT `Venta_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VentaProducto` ADD CONSTRAINT `VentaProducto_ventaId_fkey` FOREIGN KEY (`ventaId`) REFERENCES `Venta`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VentaProducto` ADD CONSTRAINT `VentaProducto_productoId_fkey` FOREIGN KEY (`productoId`) REFERENCES `Producto`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Nota` ADD CONSTRAINT `Nota_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `Cliente`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Nota` ADD CONSTRAINT `Nota_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TareaProducto` ADD CONSTRAINT `TareaProducto_productoId_fkey` FOREIGN KEY (`productoId`) REFERENCES `Producto`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
