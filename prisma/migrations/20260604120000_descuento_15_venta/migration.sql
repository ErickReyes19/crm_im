-- Add 15% discount option to sale product pricing.
ALTER TABLE `VentaProducto`
  MODIFY COLUMN `tipoPrecio` ENUM('NORMAL', 'DESCUENTO_10', 'DESCUENTO_15', 'DESCUENTO_20', 'DESCUENTO_30') NOT NULL DEFAULT 'NORMAL';
