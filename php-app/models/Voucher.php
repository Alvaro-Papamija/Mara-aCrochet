<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/Database.php';

class Voucher {
    public static function getAll(): array {
        return Database::fetchAll("SELECT * FROM `comprobantes` ORDER BY `created_at` DESC");
    }

    public static function getById(string $id): ?array {
        return Database::fetchOne("SELECT * FROM `comprobantes` WHERE `id` = :id", [':id' => $id]);
    }

    public static function getPendingCount(): int {
        $res = Database::fetchOne("SELECT COUNT(*) as total FROM `comprobantes` WHERE `status` = 'pendiente'");
        return (int)($res['total'] ?? 0);
    }

    public static function create(array $data): bool {
        $sql = "INSERT INTO `comprobantes`
            (`id`, `orderId`, `timeAgo`, `customerName`, `customerPhone`, `customerAddress`, `shippingMethod`, `totalAmount`, `expectedAmount`, `paymentMethod`, `bankAccount`, `approvalCode`, `bankTimestamp`, `status`, `receiptThumbUrl`, `receiptFullUrl`, `itemsSummary`, `internalNote`)
            VALUES
            (:id, :orderId, :timeAgo, :customerName, :customerPhone, :customerAddress, :shippingMethod, :totalAmount, :expectedAmount, :paymentMethod, :bankAccount, :approvalCode, :bankTimestamp, :status, :receiptThumbUrl, :receiptFullUrl, :itemsSummary, :internalNote)";

        Database::query($sql, [
            ':id' => $data['id'],
            ':orderId' => $data['orderId'],
            ':timeAgo' => 'Hace un momento',
            ':customerName' => $data['customerName'],
            ':customerPhone' => $data['customerPhone'] ?? '',
            ':customerAddress' => $data['customerAddress'] ?? '',
            ':shippingMethod' => $data['shippingMethod'] ?? 'Servientrega',
            ':totalAmount' => (float)$data['totalAmount'],
            ':expectedAmount' => (float)$data['totalAmount'],
            ':paymentMethod' => $data['paymentMethod'] ?? 'Transferencia Bancaria',
            ':bankAccount' => $data['bankAccount'] ?? 'Bancolombia 912-384729-10',
            ':approvalCode' => $data['approvalCode'] ?? ('AUT-' . rand(100000, 999999)),
            ':bankTimestamp' => date('d M Y · h:i A'),
            ':status' => 'pendiente',
            ':receiptThumbUrl' => $data['receiptUrl'] ?? 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&q=80',
            ':receiptFullUrl' => $data['receiptUrl'] ?? 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1200&q=80',
            ':itemsSummary' => is_string($data['itemsSummary'] ?? null) ? $data['itemsSummary'] : json_encode($data['itemsSummary'] ?? []),
            ':internalNote' => $data['internalNote'] ?? 'Registrado desde la tienda web.'
        ]);
        return true;
    }

    public static function updateStatus(string $id, string $status, ?string $internalNote = null): bool {
        $pdo = Database::getConnection();
        try {
            $pdo->beginTransaction();

            $sql = "UPDATE `comprobantes` SET `status` = :status";
            $params = [':id' => $id, ':status' => $status];

            if ($internalNote !== null) {
                $sql .= ", `internalNote` = :note";
                $params[':note'] = $internalNote;
            }
            $sql .= " WHERE `id` = :id";

            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);

            // Si se aprueba, verificar automáticamente el pago del pedido asociado
            if ($status === 'aprobado') {
                $v = self::getById($id);
                if ($v && !empty($v['orderId'])) {
                    $orderStmt = $pdo->prepare("UPDATE `pedidos` SET `paymentVerified` = 1, `status` = 'listo', `statusLabel` = 'Listo Despacho · Pago Verificado' WHERE `id` = :oid");
                    $orderStmt->execute([':oid' => $v['orderId']]);
                }
            }

            $pdo->commit();
            return true;
        } catch (Exception $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            return false;
        }
    }
}
