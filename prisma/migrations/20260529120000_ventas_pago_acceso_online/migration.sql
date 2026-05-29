-- Add 30% discount option to sale product pricing.
ALTER TABLE `VentaProducto`
  MODIFY COLUMN `tipoPrecio` ENUM('NORMAL', 'DESCUENTO_10', 'DESCUENTO_20', 'DESCUENTO_30') NOT NULL DEFAULT 'NORMAL';

-- Add sale payment method and transfer evidence in base64.
ALTER TABLE `Venta`
  ADD COLUMN `metodoPago` ENUM('EFECTIVO', 'TRANSFERENCIA') NOT NULL DEFAULT 'EFECTIVO',
  ADD COLUMN `evidenciaTransferenciaB64` LONGTEXT NULL;

-- Track current/last access for online-user visibility.
ALTER TABLE `Usuarios`
  ADD COLUMN `ultimoInicioSesion` DATETIME(3) NULL,
  ADD COLUMN `ultimaActividad` DATETIME(3) NULL,
  ADD COLUMN `estaOnline` BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE `Usuarios`
  ADD INDEX `IX_Usuarios_ultimoInicioSesion` (`ultimoInicioSesion`),
  ADD INDEX `IX_Usuarios_ultimaActividad` (`ultimaActividad`);

-- Seed the access module permission when it does not exist yet.
INSERT INTO `Permiso` (`id`, `nombre`, `descripcion`, `createAt`, `updateAt`, `activo`)
SELECT UUID(), 'ver_online', 'Permite ver usuarios conectados y su último inicio de sesión', CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3), true
WHERE NOT EXISTS (SELECT 1 FROM `Permiso` WHERE `nombre` = 'ver_online');
