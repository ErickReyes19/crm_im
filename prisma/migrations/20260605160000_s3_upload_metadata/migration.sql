ALTER TABLE `Venta`
  ADD COLUMN `evidenciaTransferenciaUbicacion` VARCHAR(1024) NULL,
  ADD COLUMN `evidenciaTransferenciaNombre` VARCHAR(255) NULL;

ALTER TABLE `NotaEvidencia`
  ADD COLUMN `ubicacion` VARCHAR(1024) NULL,
  ADD COLUMN `nombre` VARCHAR(255) NULL,
  MODIFY COLUMN `imagenB64` LONGTEXT NULL;
