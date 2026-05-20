-- Add price type enum and column to support manual pricing with discount labels
CREATE TABLE `_tmp_enum_TipoPrecioVenta` (
  `value` VARCHAR(191) NOT NULL PRIMARY KEY
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
INSERT INTO `_tmp_enum_TipoPrecioVenta` (`value`) VALUES ('NORMAL'), ('DESCUENTO_10'), ('DESCUENTO_20');

ALTER TABLE `VentaProducto`
  ADD COLUMN `tipoPrecio` ENUM('NORMAL', 'DESCUENTO_10', 'DESCUENTO_20') NOT NULL DEFAULT 'NORMAL';

DROP TABLE `_tmp_enum_TipoPrecioVenta`;
