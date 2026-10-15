<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/Database.php';

class Product {
    public static function getAll(): array {
        return Database::fetchAll("SELECT * FROM `productos` ORDER BY `name` ASC");
    }

    public static function getBySku(string $sku): ?array {
        return Database::fetchOne("SELECT * FROM `productos` WHERE `sku` = :sku", [':sku' => $sku]);
    }

    public static function getCount(): int {
        $res = Database::fetchOne("SELECT COUNT(*) as total FROM `productos`");
        return (int)($res['total'] ?? 0);
    }

    public static function getCriticalStockCount(): int {
        $res = Database::fetchOne("SELECT COUNT(*) as total FROM `productos` WHERE `currentStock` <= `minStockAlert`");
        return (int)($res['total'] ?? 0);
    }

    public static function updateStock(string $sku, int $newStock): bool {
        $prod = self::getBySku($sku);
        if (!$prod) return false;

        $minAlert = (int)$prod['minStockAlert'];
        $category = 'optimo';
        $statusLabel = "Stock Óptimo ({$newStock} unidades)";

        if ($newStock === 0) {
            $category = 'agotado';
            $statusLabel = 'Agotado · Esperando reposición';
        } elseif ($newStock <= $minAlert) {
            $category = 'critico';
            $statusLabel = "Stock Mínimo alcanzado: {$newStock} / {$minAlert}";
        }

        $sql = "UPDATE `productos` SET `currentStock` = :stock, `category` = :cat, `statusLabel` = :lbl WHERE `sku` = :sku";
        Database::query($sql, [
            ':stock' => $newStock,
            ':cat' => $category,
            ':lbl' => $statusLabel,
            ':sku' => $sku
        ]);
        return true;
    }

    public static function save(array $data): bool {
        $currentStock = (int)($data['currentStock'] ?? 0);
        $minStock = (int)($data['minStockAlert'] ?? 2);
        $category = $data['category'] ?? ($currentStock === 0 ? 'agotado' : ($currentStock <= $minStock ? 'critico' : 'optimo'));
        $statusLabel = $data['statusLabel'] ?? ($currentStock === 0 ? 'Agotado' : "Stock ({$currentStock} unidades)");

        $sql = "INSERT INTO `productos` 
            (`sku`, `name`, `tag`, `size`, `supplier`, `priceCOP`, `yarnCostCOP`, `currentStock`, `minStockAlert`, `category`, `statusLabel`, `imageUrl`, `waitingListCount`, `leadTimeDays`, `monthlyQuota`)
            VALUES
            (:sku, :name, :tag, :size, :supplier, :priceCOP, :yarnCostCOP, :currentStock, :minStockAlert, :category, :statusLabel, :imageUrl, :waitingListCount, :leadTimeDays, :monthlyQuota)
            ON DUPLICATE KEY UPDATE
            `name` = VALUES(`name`),
            `tag` = VALUES(`tag`),
            `size` = VALUES(`size`),
            `supplier` = VALUES(`supplier`),
            `priceCOP` = VALUES(`priceCOP`),
            `yarnCostCOP` = VALUES(`yarnCostCOP`),
            `currentStock` = VALUES(`currentStock`),
            `minStockAlert` = VALUES(`minStockAlert`),
            `category` = VALUES(`category`),
            `statusLabel` = VALUES(`statusLabel`),
            `imageUrl` = VALUES(`imageUrl`),
            `waitingListCount` = VALUES(`waitingListCount`),
            `leadTimeDays` = VALUES(`leadTimeDays`),
            `monthlyQuota` = VALUES(`monthlyQuota`)";

        Database::query($sql, [
            ':sku' => $data['sku'],
            ':name' => $data['name'],
            ':tag' => $data['tag'] ?? '',
            ':size' => $data['size'] ?? '',
            ':supplier' => $data['supplier'] ?? '',
            ':priceCOP' => (float)($data['priceCOP'] ?? 0),
            ':yarnCostCOP' => (float)($data['yarnCostCOP'] ?? 0),
            ':currentStock' => $currentStock,
            ':minStockAlert' => $minStock,
            ':category' => $category,
            ':statusLabel' => $statusLabel,
            ':imageUrl' => $data['imageUrl'] ?? '',
            ':waitingListCount' => (int)($data['waitingListCount'] ?? 0),
            ':leadTimeDays' => (int)($data['leadTimeDays'] ?? 3),
            ':monthlyQuota' => (int)($data['monthlyQuota'] ?? 10)
        ]);
        return true;
    }

    public static function delete(string $sku): bool {
        return Database::execute("DELETE FROM `productos` WHERE `sku` = :sku", [':sku' => $sku]);
    }
}
