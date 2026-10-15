-- ==========================================================
-- Base de Datos: marana_crochet
-- Proyecto: Maraña Crochet Atelier
-- Entorno: XAMPP (Apache + MySQL / MariaDB)
-- ==========================================================

CREATE DATABASE IF NOT EXISTS `marana_crochet`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `marana_crochet`;

-- ----------------------------------------------------------
-- 1. Tabla: usuarios
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `usuarios`;
CREATE TABLE `usuarios` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `username` VARCHAR(100) NOT NULL UNIQUE,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL DEFAULT '123456',
  `role` ENUM('admin', 'client') NOT NULL DEFAULT 'client',
  `roleTitle` VARCHAR(100) NULL,
  `avatarUrl` TEXT NULL,
  `phone` VARCHAR(50) NULL,
  `city` VARCHAR(100) NULL,
  `address` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 2. Tabla: productos (Catálogo e Inventario)
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `productos`;
CREATE TABLE `productos` (
  `sku` VARCHAR(50) NOT NULL PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `tag` VARCHAR(100) NULL,
  `size` VARCHAR(100) NULL,
  `supplier` VARCHAR(255) NULL,
  `priceCOP` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `yarnCostCOP` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `currentStock` INT NOT NULL DEFAULT 0,
  `minStockAlert` INT NOT NULL DEFAULT 2,
  `category` ENUM('critico', 'agotado', 'optimo', 'pedido') NOT NULL DEFAULT 'optimo',
  `statusLabel` VARCHAR(255) NULL,
  `imageUrl` TEXT NULL,
  `waitingListCount` INT NOT NULL DEFAULT 0,
  `leadTimeDays` INT NULL DEFAULT 3,
  `monthlyQuota` INT NULL DEFAULT 10,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 3. Tabla: pedidos
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `pedido_items`;
DROP TABLE IF EXISTS `pedidos`;
CREATE TABLE `pedidos` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `date` VARCHAR(100) NOT NULL,
  `customerName` VARCHAR(255) NOT NULL,
  `customerInitials` VARCHAR(10) NULL,
  `customerPhone` VARCHAR(50) NULL,
  `customerLocation` VARCHAR(255) NULL,
  `customerAddress` TEXT NULL,
  `status` ENUM('preparacion', 'listo', 'transito', 'entregado') NOT NULL DEFAULT 'preparacion',
  `statusLabel` VARCHAR(100) NULL,
  `priorityPercent` INT NOT NULL DEFAULT 0,
  `readyTime` VARCHAR(100) NULL,
  `carrier` VARCHAR(100) NULL,
  `shippingCost` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `trackingNumber` VARCHAR(100) NULL,
  `trackingStatus` VARCHAR(255) NULL,
  `specialNote` TEXT NULL,
  `artisanName` VARCHAR(100) NULL,
  `paymentVerified` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 4. Tabla: pedido_items
-- ----------------------------------------------------------
CREATE TABLE `pedido_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `orderId` VARCHAR(50) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `specs` VARCHAR(255) NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `price` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `imageUrl` TEXT NULL,
  `tag` VARCHAR(100) NULL,
  `artisanNote` TEXT NULL,
  CONSTRAINT `fk_order_items` FOREIGN KEY (`orderId`) REFERENCES `pedidos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 5. Tabla: comprobantes (Vouchers de Pago)
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `comprobantes`;
CREATE TABLE `comprobantes` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `orderId` VARCHAR(50) NOT NULL,
  `timeAgo` VARCHAR(100) NULL,
  `customerName` VARCHAR(255) NOT NULL,
  `customerPhone` VARCHAR(50) NULL,
  `customerAddress` TEXT NULL,
  `shippingMethod` VARCHAR(100) NULL,
  `totalAmount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `expectedAmount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `paymentMethod` VARCHAR(100) NULL,
  `bankAccount` VARCHAR(100) NULL,
  `approvalCode` VARCHAR(100) NULL,
  `bankTimestamp` VARCHAR(100) NULL,
  `status` ENUM('pendiente', 'aprobado', 'rechazado') NOT NULL DEFAULT 'pendiente',
  `receiptThumbUrl` TEXT NULL,
  `receiptFullUrl` TEXT NULL,
  `itemsSummary` JSON NULL,
  `internalNote` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================================
-- DATOS INICIALES (SEED DATA)
-- ==========================================================

-- Usuarios
INSERT INTO `usuarios` (`id`, `name`, `username`, `email`, `password`, `role`, `roleTitle`, `avatarUrl`, `phone`, `city`, `address`) VALUES
('usr_admin_1', 'Lucía Montoya', 'lucia.montoya', 'lucia@marana.com', 'admin123', 'admin', 'Administradora Taller & Fundadora', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80', '+57 300 456 7890', 'Neiva, Huila (Sede Taller Maraña)', 'Carrera 5 # 12-34, Taller Maraña'),
('usr_client_1', 'Sofia Restrepo', 'sofia_restrepo', 'sofia@gmail.com', 'cliente123', 'client', 'Clienta VIP Maraña', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', '+57 318 692 8410', 'Neiva, Huila (Barrio Quirinal)', 'Calle 14 # 6-32, Apto 501'),
('usr_client_2', 'Mariana Duque', 'mariana.duque', 'mariana@gmail.com', 'cliente123', 'client', 'Clienta Frecuente', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80', '+57 315 289 1044', 'Cali, Valle del Cauca', 'Cra 2 Oeste #4-22');

-- Productos
INSERT INTO `productos` (`sku`, `name`, `tag`, `size`, `supplier`, `priceCOP`, `yarnCostCOP`, `currentStock`, `minStockAlert`, `category`, `statusLabel`, `imageUrl`, `waitingListCount`, `leadTimeDays`, `monthlyQuota`) VALUES
('MAR-AMI-01', 'Amigurumi Zorro del Bosque', 'Edición Bosque', '22 cm', 'Hebras Andinas (Algodón Orgánico Mercerizado)', 85000.00, 22000.00, 3, 2, 'optimo', 'Stock Óptimo (3 unidades)', 'https://lh3.googleusercontent.com/aida-public/AB6AXuCVrTwhfZoNiOkPC-agTmLAg_YTnWGqfCZyRp3Cuj2BEoqGNe_Pq_KIDABt9_dBsCh1EVGJvX7-ZJanY8lqPB9-6S6NrqpcQm4bIDCso7Nzngp4yMOrtsHj-xSbUd5ecsc4hKEzAye36SdBUJztlQUU0Se-QkzPbVmpmD0dnwDO4mhdeRT-TeQZzr8RAgf92AqFnc5IzS6hL04-T5siuroOhiJIlrvsk2mXLZsx3SpoYEfxGJa3F5b5eA', 0, 3, 10),
('MAR-AMI-02', 'Amigurumi Conejito Orejas Largas', 'Ternura Floral', '26 cm', 'Hilados del Huila (Algodón Pima Peinado)', 92000.00, 24000.00, 1, 2, 'critico', 'Stock Mínimo alcanzado: 1 / 2', '/images/bunny.jpg', 4, 3, 10),
('MAR-AMI-03', 'Amigurumi Osita Miel & Vestido', 'Más Vendido', '24 cm', 'Hilandería San Jacinto (Algodón Hipoalergénico)', 98000.00, 26000.00, 4, 2, 'optimo', 'Stock Óptimo (4 unidades)', '/images/bear.jpg', 0, 3, 10),
('MAR-AMI-04', 'Amigurumi Dinosaurio Rex Bebé', 'Favorito Niñez', '20 cm', 'Hebras Andinas (Algodón Soft Pastel)', 88000.00, 23000.00, 0, 2, 'agotado', '5 clientas esperando reposición', '/images/dino.jpg', 5, 3, 10),
('MAR-AMI-05', 'Amigurumi Ajolote Mágico Rosa', 'Edición Kawaii', '18 cm', 'Artesanos Asociados del Huila', 79000.00, 19000.00, 5, 2, 'optimo', 'Stock Óptimo (5 unidades)', '/images/axolotl.jpg', 0, 3, 10),
('MAR-AMI-06', 'Amigurumi Dragón Fantasía Estelar', 'Bajo Pedido', '32 cm', 'Taller Maraña Neiva (Fibras Teñidas a Mano)', 145000.00, 38000.00, 0, 0, 'pedido', 'Capacidad de Taller: 3 cupos este mes', '/images/dragon.jpg', 2, 5, 3),
('MAR-AMI-07', 'Amigurumi Mini Gatito Llavero', 'Mini & Llavero', '10 cm', 'Hebras Andinas (Hilaza Delicada)', 42000.00, 11000.00, 7, 3, 'optimo', 'Stock Óptimo (7 unidades)', '/images/cat.jpg', 0, 3, 10);

-- Pedidos
INSERT INTO `pedidos` (`id`, `date`, `customerName`, `customerInitials`, `customerPhone`, `customerLocation`, `customerAddress`, `status`, `statusLabel`, `priorityPercent`, `readyTime`, `carrier`, `shippingCost`, `trackingNumber`, `trackingStatus`, `specialNote`, `artisanName`, `paymentVerified`) VALUES
('MC-2024-884', 'Hoy · 09:32 AM', 'Sofia Restrepo', 'SR', '+57 318 692 8410', 'Neiva, Huila (Barrio Quirinal)', 'Calle 14 # 6-32, Apto 402, Edificio Los Robles, Neiva, Huila', 'listo', 'Listo Despacho', 100, NULL, 'Servientrega Nacional Estándar', 14000.00, '9482-0198-4820', NULL, '"Incluye dedicatoria caligrafiada para \'Cumpleaños de Camila\' y ramita fresca de lavanda del huerto."', NULL, 1),
('MC-2024-882', 'Ayer · 04:15 PM', 'Valentina Hoyos', 'VH', '+57 310 549 2218', 'Retiro en Taller Maraña · Neiva, Huila', NULL, 'preparacion', 'En Taller · 75%', 75, 'Mañana 4:00 PM', 'Retiro en Tienda', 0.00, NULL, NULL, NULL, 'Lucía M.', 0),
('MC-2024-879', 'Despachado ayer · 02:40 PM', 'Mariana Duque', 'MD', '+57 315 882 1093', 'Cali, Valle del Cauca · Cra 2 Oeste #4-22', 'Cra 2 Oeste #4-22, Cali, Valle del Cauca', 'transito', 'En Tránsito', 90, NULL, 'Coordinadora Mercantil', 14000.00, '9482019482', 'En camino a centro de distribución Cali (Llegada estimada hoy)', NULL, NULL, 1);

-- Pedido Items
INSERT INTO `pedido_items` (`orderId`, `name`, `specs`, `quantity`, `price`, `imageUrl`, `tag`, `artisanNote`) VALUES
('MC-2024-884', 'Amigurumi Zorro del Bosque', '22 cm · Algodón Orgánico Mercerizado', 1, 85000.00, 'https://lh3.googleusercontent.com/aida-public/AB6AXuCVrTwhfZoNiOkPC-agTmLAg_YTnWGqfCZyRp3Cuj2BEoqGNe_Pq_KIDABt9_dBsCh1EVGJvX7-ZJanY8lqPB9-6S6NrqpcQm4bIDCso7Nzngp4yMOrtsHj-xSbUd5ecsc4hKEzAye36SdBUJztlQUU0Se-QkzPbVmpmD0dnwDO4mhdeRT-TeQZzr8RAgf92AqFnc5IzS6hL04-T5siuroOhiJIlrvsk2mXLZsx3SpoYEfxGJa3F5b5eA', NULL, NULL),
('MC-2024-884', 'Amigurumi Conejito Orejas Largas', '26 cm · Tono Crema & Rosa Empolvado', 1, 92000.00, '/images/bunny.jpg', NULL, NULL),
('MC-2024-882', 'Amigurumi Osita Miel & Vestido', '24 cm · Vestidito Floral Tejido a Mano', 1, 98000.00, '/images/bear.jpg', NULL, 'Detalles bordados finales completados'),
('MC-2024-882', 'Amigurumi Mini Gatito Llavero', '10 cm · Con Aro & Cascabel Artesanal', 1, 42000.00, '/images/cat.jpg', NULL, 'Listo para empaque de regalo'),
('MC-2024-879', 'Amigurumi Dinosaurio Rex Bebé', '20 cm · Verde Menta & Amarillo Pastel', 1, 88000.00, '/images/dino.jpg', NULL, NULL),
('MC-2024-879', 'Amigurumi Ajolote Mágico Rosa', '18 cm · Algodón Hipoalergénico Soft', 1, 79000.00, '/images/axolotl.jpg', NULL, NULL);

-- Comprobantes
INSERT INTO `comprobantes` (`id`, `orderId`, `timeAgo`, `customerName`, `customerPhone`, `customerAddress`, `shippingMethod`, `totalAmount`, `expectedAmount`, `paymentMethod`, `bankAccount`, `approvalCode`, `bankTimestamp`, `status`, `receiptThumbUrl`, `receiptFullUrl`, `itemsSummary`, `internalNote`) VALUES
('VOUCH-884', 'MC-2024-884', 'Hace 12 min', 'Sofia Restrepo', '+57 318 692 8410', 'Calle 14 # 6-32, Barrio Quirinal, Neiva, Huila', 'Envío Servientrega Prioritario', 191000.00, 191000.00, 'Bancolombia Transfer', 'Bancolombia 912-384729-10', '839201', '24 Oct 2024 · 02:35 PM', 'pendiente',
 'https://lh3.googleusercontent.com/aida-public/AB6AXuAyiEHHuD009HRRFvk-o64NCPIOiCPsuIrf7KbVr6M3HnYCHJex94wBjJ4cdatHj_flBRd6isysML6DUjsBLad7PlpEkoB303LLafAT_kNZQ1dVVSWWU1LQfb8sbzbj1U3Hl2NkE3kEttWXmRPpzTh0UBsrURFO7jvi8lYp7ynJVXL3gkpEmFO5jOeO-tp0o-2TTSGB9j-LDsZZ3EBNGfNk2a1exsTD0vXu0eNLqhB_xcskyv7TAMAwhg',
 'https://lh3.googleusercontent.com/aida-public/AB6AXuDMRgqek519UGxy9n1Wd5Ux9s1ZvRlyjXNz6q-rQU_Gf45RKq-rAd_Pnz-5bfYXWeGKC2ZiP7bpgjnEwuvDq7D6blVCh5ZR92RRbjZNyPLh3OpEdyLV1ggBcg0EGGbpo3UmQk9Q31S5ly607yOSJymTBtykqzzPGsbavjOjuSfEE4WPFo2bSFLAMvSSwBfZwLyZlPWpVKwgDoC7til_SR18XQQUK5JGNZ-EZToSDRyVupFZiVShbQbJiQ',
 '[{"name": "1x Amigurumi Zorro del Bosque (Algodón Orgánico)", "tag": "Hecho a mano"}, {"name": "1x Amigurumi Conejito Orejas Largas", "tag": "Hecho a mano"}]',
 NULL),
('VOUCH-882', 'MC-2024-882', 'Hace 35 min', 'Valentina Hoyos', '+57 310 549 2218', 'Carrera 5 # 12-34 (Retiro en Taller Maraña, Neiva)', 'Retiro en Taller Maraña', 140000.00, 140000.00, 'Nequi Móvil', 'Nequi 312 849 2019', 'M490218', '24 Oct 2024 · 01:10 PM', 'pendiente',
 'https://lh3.googleusercontent.com/aida-public/AB6AXuA99Z8KOs9TsIQVWFjEEG3iR_sd7HnZfikatltRy4CCjpvdYSFyH30OAVnR03wP6Cz8qfMMGMKxoFNsxaE9bFyuWnZKRCA0v4dpFo63N2Gqc6FX_cBGAmWQV1bixTztqBpB83Wo3KRmSz6geUGXloljBrEABWKNJGC6ZEAOfCF6BIRMwwozazpCFF-QgqXsiCK67RH8iFPmw7tk__TzfDq57i755GIXZc3FtOBHg0k5l_IEzzcL7cMXlg',
 'https://lh3.googleusercontent.com/aida-public/AB6AXuBlct3HHQtNS4gGzzBn0aGt6eDZpxSQYObXBYMqbXgpXh5FAxQ94winbPHwm1tzCkhDONRWO-titcdCtrxhA-9D7JsrwYoYieh3bXYYPeJ4Lqvf8RwZUUY52y1X2mVW6DHzi4C591gz8FnQbhwbCb3TtPT5_wnby_tRK5XGbdABv8gPWafL_qBMYizw0i6ytwY0ELStS_yIvgGixXiXoKkwEv05uDmbQNEGwIv8ubMVHoJYFHuRM_I8iQ',
 '[{"name": "1x Amigurumi Osita Miel & Vestido", "tag": "Algodón Hipoalergénico"}, {"name": "1x Amigurumi Mini Gatito Llavero", "tag": "Mini & Llavero"}]',
 NULL),
('VOUCH-879', 'MC-2024-879', 'Hace 1 hora', 'Mariana Duque', '+57 315 882 1093', 'Cra 2 Oeste #4-22, Cali, Valle del Cauca', 'Coordinadora Mercantil', 181000.00, 181000.00, 'Daviplata App', 'Daviplata 312 849 2019', 'DP-110943', '24 Oct 2024 · 12:20 PM', 'pendiente',
 'https://lh3.googleusercontent.com/aida-public/AB6AXuCKiZktBCISK96zs0IWdNGkBHX0AtufsGkEW-D4Vq-zS3VOX8yUrceHyE9MU2tCa7fa8E1xobfeOX-TvtMKpHrzyqg5VgAKyzZgNO53x9w1pjtUl4JoSxipbroEIsGYqkJ4YQMVyhoFVLrzZyfegvJBHv29q_0kdpZVSlAo-QPwDHwUsTX_p6StdUpyyGiCSXn8Kx6DJ3DrTxv_OrtdM9Vw0A29hHu8ONg1q3gn_pGj5ILaCkwBSbilbw',
 'https://lh3.googleusercontent.com/aida-public/AB6AXuAL0tiqddrrSWTzZoCtJoicdy8OM6O4_iV3Bz_qSX00hZmMA8MnFV50-EfZqG4427Dcn5J0sOZc4RGHT-Bi6XEx4BVnfpPPYykLaSUsJcwB7vcm95fNEuwX6GifaIuTEMwLqJ9gkJYG8dHM7FzvkcbfNa23AdBsuN8PIuo0CPxjxks27Csfmbwo_SFJGRZyL6GDslVBVfeL7hDAu3kjD1NF0ge7C8DbJeD8ltIpzeIk23HZTF1BGYWJ9Q',
 '[{"name": "1x Amigurumi Dinosaurio Rex Bebé", "tag": "Favorito Niñez"}, {"name": "1x Amigurumi Ajolote Mágico Rosa", "tag": "Edición Kawaii"}]',
 NULL);
