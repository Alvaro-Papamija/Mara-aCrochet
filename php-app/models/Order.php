<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/Database.php';

class Order {
    public static function getAll(): array {
        $orders = Database::fetchAll("SELECT * FROM `pedidos` ORDER BY `created_at` DESC");
        $items = Database::fetchAll("SELECT * FROM `pedido_items`");

        $itemsByOrder = [];
        foreach ($items as $it) {
            $itemsByOrder[$it['orderId']][] = $it;
        }

        foreach ($orders as &$order) {
            $order['items'] = $itemsByOrder[$order['id']] ?? [];
        }

        return $orders;
    }

    public static function getById(string $id): ?array {
        $order = Database::fetchOne("SELECT * FROM `pedidos` WHERE `id` = :id", [':id' => $id]);
        if (!$order) return null;

        $order['items'] = Database::fetchAll("SELECT * FROM `pedido_items` WHERE `orderId` = :id", [':id' => $id]);
        return $order;
    }

    public static function getStats(): array {
        $totalOrders = (int)(Database::fetchOne("SELECT COUNT(*) as total FROM `pedidos`")['total'] ?? 0);
        $totalRevenue = (float)(Database::fetchOne("SELECT SUM(`price` * `quantity`) as total FROM `pedido_items`")['total'] ?? 0);
        $pendingPreparation = (int)(Database::fetchOne("SELECT COUNT(*) as total FROM `pedidos` WHERE `status` = 'preparacion'")['total'] ?? 0);
        $readyToShip = (int)(Database::fetchOne("SELECT COUNT(*) as total FROM `pedidos` WHERE `status` = 'listo'")['total'] ?? 0);
        $inTransit = (int)(Database::fetchOne("SELECT COUNT(*) as total FROM `pedidos` WHERE `status` = 'transito'")['total'] ?? 0);
        $delivered = (int)(Database::fetchOne("SELECT COUNT(*) as total FROM `pedidos` WHERE `status` = 'entregado'")['total'] ?? 0);

        return [
            'totalOrders' => $totalOrders,
            'totalRevenue' => $totalRevenue,
            'pendingPreparation' => $pendingPreparation,
            'readyToShip' => $readyToShip,
            'inTransit' => $inTransit,
            'delivered' => $delivered,
        ];
    }

    public static function create(array $orderData, array $items): bool {
        $pdo = Database::getConnection();
        try {
            $pdo->beginTransaction();

            $sql = "INSERT INTO `pedidos`
                (`id`, `date`, `customerName`, `customerInitials`, `customerPhone`, `customerLocation`, `customerAddress`, `status`, `statusLabel`, `priorityPercent`, `readyTime`, `carrier`, `shippingCost`, `trackingNumber`, `specialNote`, `paymentVerified`)
                VALUES
                (:id, :date, :customerName, :customerInitials, :customerPhone, :customerLocation, :customerAddress, :status, :statusLabel, :priorityPercent, :readyTime, :carrier, :shippingCost, :trackingNumber, :specialNote, :paymentVerified)";

            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                ':id' => $orderData['id'],
                ':date' => $orderData['date'] ?? ('Hoy · ' . date('h:i A')),
                ':customerName' => $orderData['customerName'],
                ':customerInitials' => strtoupper(substr($orderData['customerName'], 0, 2)),
                ':customerPhone' => $orderData['customerPhone'] ?? '',
                ':customerLocation' => $orderData['customerLocation'] ?? 'Neiva, Huila',
                ':customerAddress' => $orderData['customerAddress'] ?? '',
                ':status' => $orderData['status'] ?? 'preparacion',
                ':statusLabel' => $orderData['statusLabel'] ?? 'En Taller · Nuevo',
                ':priorityPercent' => (int)($orderData['priorityPercent'] ?? 25),
                ':readyTime' => $orderData['readyTime'] ?? '2-3 días hábiles',
                ':carrier' => $orderData['carrier'] ?? 'Servientrega',
                ':shippingCost' => (float)($orderData['shippingCost'] ?? 14000),
                ':trackingNumber' => $orderData['trackingNumber'] ?? ('9482-0198-' . rand(1000, 9999)),
                ':specialNote' => $orderData['specialNote'] ?? '',
                ':paymentVerified' => !empty($orderData['paymentVerified']) ? 1 : 0
            ]);

            $itemSql = "INSERT INTO `pedido_items` (`orderId`, `name`, `specs`, `quantity`, `price`, `imageUrl`, `tag`)
                VALUES (:orderId, :name, :specs, :quantity, :price, :imageUrl, :tag)";
            $itemStmt = $pdo->prepare($itemSql);

            foreach ($items as $item) {
                $itemStmt->execute([
                    ':orderId' => $orderData['id'],
                    ':name' => $item['name'] ?? 'Amigurumi',
                    ':specs' => $item['specs'] ?? ($item['size'] ?? '22 cm'),
                    ':quantity' => (int)($item['quantity'] ?? 1),
                    ':price' => (float)($item['price'] ?? 0),
                    ':imageUrl' => $item['imageUrl'] ?? '',
                    ':tag' => $item['tag'] ?? 'Hecho a mano'
                ]);

                // Descontar inventario si existe SKU
                if (!empty($item['sku'])) {
                    $upStock = $pdo->prepare("UPDATE `productos` SET `currentStock` = GREATEST(0, `currentStock` - :qty) WHERE `sku` = :sku");
                    $upStock->execute([':qty' => (int)($item['quantity'] ?? 1), ':sku' => $item['sku']]);
                }
            }

            $pdo->commit();
            return true;
        } catch (Exception $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            return false;
        }
    }

    public static function updateStatus(string $id, string $status, ?string $trackingNumber = null): bool {
        $labels = [
            'preparacion' => 'En Taller · Tejiendo',
            'listo' => 'Listo Despacho · Empacado',
            'transito' => 'En Tránsito · Con Transportadora',
            'entregado' => 'Entregado a Clienta',
        ];

        $statusLabel = $labels[$status] ?? 'Actualizado';
        $params = [
            ':id' => $id,
            ':status' => $status,
            ':statusLabel' => $statusLabel
        ];

        $trackingSql = '';
        if ($trackingNumber !== null) {
            $trackingSql = ", `trackingNumber` = :trackingNumber";
            $params[':trackingNumber'] = $trackingNumber;
        }

        $sql = "UPDATE `pedidos` SET `status` = :status, `statusLabel` = :statusLabel {$trackingSql} WHERE `id` = :id";
        return Database::execute($sql, $params);
    }
}
