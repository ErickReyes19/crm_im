-- CreateTable
CREATE TABLE `Producto` (
  `id` VARCHAR(191) NOT NULL,
  `nombre` VARCHAR(191) NOT NULL,
  `descripcion` VARCHAR(191) NOT NULL,
  `precio` DECIMAL(10,2) NOT NULL,
  `activo` BOOLEAN NOT NULL DEFAULT true,
  `creadoPorId` VARCHAR(36) NOT NULL,
  `createAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updateAt` DATETIME(3) NOT NULL,
  INDEX `IX_Producto_creadoPorId`(`creadoPorId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VentaProducto` (
  `id` VARCHAR(191) NOT NULL,
  `ventaId` VARCHAR(191) NOT NULL,
  `productoId` VARCHAR(191) NOT NULL,
  `cantidad` INTEGER NOT NULL,
  `precioUnitario` DECIMAL(10,2) NOT NULL,
  `subtotal` DECIMAL(10,2) NOT NULL,
  `createAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `IX_VentaProducto_ventaId`(`ventaId`),
  INDEX `IX_VentaProducto_productoId`(`productoId`),
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

ALTER TABLE `Producto` ADD CONSTRAINT `Producto_creadoPorId_fkey` FOREIGN KEY (`creadoPorId`) REFERENCES `Usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `VentaProducto` ADD CONSTRAINT `VentaProducto_ventaId_fkey` FOREIGN KEY (`ventaId`) REFERENCES `Venta`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `VentaProducto` ADD CONSTRAINT `VentaProducto_productoId_fkey` FOREIGN KEY (`productoId`) REFERENCES `Producto`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `TareaProducto` ADD CONSTRAINT `TareaProducto_tareaId_fkey` FOREIGN KEY (`tareaId`) REFERENCES `Tarea`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `TareaProducto` ADD CONSTRAINT `TareaProducto_productoId_fkey` FOREIGN KEY (`productoId`) REFERENCES `Producto`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

INSERT INTO `Permiso` (`id`, `nombre`, `descripcion`, `createAt`, `updateAt`, `activo`)
SELECT UUID(), 'ver_productos', 'Permite ver el módulo de productos', CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3), true
WHERE NOT EXISTS (SELECT 1 FROM `Permiso` WHERE `nombre` = 'ver_productos');

INSERT INTO `Permiso` (`id`, `nombre`, `descripcion`, `createAt`, `updateAt`, `activo`)
SELECT UUID(), 'crear_producto', 'Permite crear productos', CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3), true
WHERE NOT EXISTS (SELECT 1 FROM `Permiso` WHERE `nombre` = 'crear_producto');

INSERT INTO `Permiso` (`id`, `nombre`, `descripcion`, `createAt`, `updateAt`, `activo`)
SELECT UUID(), 'editar_producto', 'Permite editar productos', CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3), true
WHERE NOT EXISTS (SELECT 1 FROM `Permiso` WHERE `nombre` = 'editar_producto');

INSERT INTO `Permiso` (`id`, `nombre`, `descripcion`, `createAt`, `updateAt`, `activo`)
SELECT UUID(), 'ver_todos_clientes', 'Permite ver todos los clientes sin importar asignación', CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3), true
WHERE NOT EXISTS (SELECT 1 FROM `Permiso` WHERE `nombre` = 'ver_todos_clientes');

INSERT INTO `Permiso` (`id`, `nombre`, `descripcion`, `createAt`, `updateAt`, `activo`)
SELECT UUID(), 'ver_todas_tareas', 'Permite ver todas las tareas sin importar asignación', CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3), true
WHERE NOT EXISTS (SELECT 1 FROM `Permiso` WHERE `nombre` = 'ver_todas_tareas');
