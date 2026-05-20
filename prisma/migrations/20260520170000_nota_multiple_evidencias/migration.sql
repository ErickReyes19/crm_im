-- AlterTable
ALTER TABLE `Nota` DROP COLUMN `evidencia`;

-- CreateTable
CREATE TABLE `NotaEvidencia` (
  `id` VARCHAR(191) NOT NULL,
  `notaId` VARCHAR(191) NOT NULL,
  `imagenB64` LONGTEXT NOT NULL,
  `createAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  INDEX `IX_NotaEvidencia_notaId`(`notaId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `NotaEvidencia` ADD CONSTRAINT `NotaEvidencia_notaId_fkey` FOREIGN KEY (`notaId`) REFERENCES `Nota`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
