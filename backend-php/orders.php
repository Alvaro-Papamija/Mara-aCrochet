<?php
require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $ordersStmt = $pdo->query("SELECT * FROM `pedidos` ORDER BY `created_at` DESC");
        $orders = $ordersStmt->fetchAll();

        $itemsStmt = $pdo->query("SELECT * FROM `pedido_items`");
        $allItems = $itemsStmt->fetchAll();

        $itemsByOrder = [];
        foreach ($allItems as $item) {
            $orderId = $item['orderId'];
            if (!isset($itemsByOrder[$orderId])) {
                $itemsByOrder[$orderId] = [];
            }
            $itemsByOrder[$orderId][] = [
                'name' => $item['name'],
                'specs' => $item['specs'] ?? '',
                'quantity' => (int)$item['quantity'],
                'price' => (float)$item['price'],
                'imageUrl' => $item['imageUrl'] ?? '',
                'tag' => $item['tag'] ?? null,
                'artisanNote' => $item['artisanNote'] ?? null,
            ];
        }

        $formatted = array_map(function($o) use ($itemsByOrder) {
            return [
                'id' => $o['id'],
                'date' => $o['date'],
                'customerName' => $o['customerName'],
                'customerInitials' => $o['customerInitials'] ?? substr($o['customerName'], 0, 2),
                'customerPhone' => $o['customerPhone'] ?? '',
                'customerLocation' => $o['customerLocation'] ?? '',
                'customerAddress' => $o['customerAddress'] ?? '',
                'status' => $o['status'],
                'statusLabel' => $o['statusLabel'] ?? '',
                'priorityPercent' => (int)($o['priorityPercent'] ?? 0),
                'readyTime' => $o['readyTime'] ?? null,
                'carrier' => $o['carrier'] ?? '',
                'shippingCost' => (float)$o['shippingCost'],
                'trackingNumber' => $o['trackingNumber'] ?? null,
                'trackingStatus' => $o['trackingStatus'] ?? null,
                'specialNote' => $o['specialNote'] ?? null,
                'artisanName' => $o['artisanName'] ?? null,
                'paymentVerified' => (bool)$o['paymentVerified'],
                'items' => $itemsByOrder[$o['id']] ?? [],
            ];
        }, $orders);

        echo json_encode([
            'status' => 'success',
            'data' => $formatted
        ], JSON_UNESCAPED_UNICODE);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
    exit();
}

if ($method === 'POST') {
    $raw = file_get_contents('php://input');
    $input = json_decode($raw, true);

    if (!$input || empty($input['id']) || empty($input['customerName'])) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'ID de pedido y nombre de cliente requeridos']);
        exit();
    }

    try {
        $pdo->beginTransaction();

        $sql = "INSERT INTO `pedidos`
            (`id`, `date`, `customerName`, `customerInitials`, `customerPhone`, `customerLocation`, `customerAddress`, `status`, `statusLabel`, `priorityPercent`, `readyTime`, `carrier`, `shippingCost`, `trackingNumber`, `trackingStatus`, `specialNote`, `artisanName`, `paymentVerified`)
            VALUES
            (:id, :date, :customerName, :customerInitials, :customerPhone, :customerLocation, :customerAddress, :status, :statusLabel, :priorityPercent, :readyTime, :carrier, :shippingCost, :trackingNumber, :trackingStatus, :specialNote, :artisanName, :paymentVerified)";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':id' => $input['id'],
            ':date' => $input['date'] ?? ('Hoy · ' . date('h:i A')),
            ':customerName' => $input['customerName'],
            ':customerInitials' => $input['customerInitials'] ?? strtoupper(substr($input['customerName'], 0, 2)),
            ':customerPhone' => $input['customerPhone'] ?? '',
            ':customerLocation' => $input['customerLocation'] ?? '',
            ':customerAddress' => $input['customerAddress'] ?? '',
            ':status' => $input['status'] ?? 'preparacion',
            ':statusLabel' => $input['statusLabel'] ?? 'En Taller · Nuevo',
            ':priorityPercent' => (int)($input['priorityPercent'] ?? 10),
            ':readyTime' => $input['readyTime'] ?? null,
            ':carrier' => $input['carrier'] ?? 'Servientrega',
            ':shippingCost' => (float)($input['shippingCost'] ?? 0),
            ':trackingNumber' => $input['trackingNumber'] ?? null,
            ':trackingStatus' => $input['trackingStatus'] ?? null,
            ':specialNote' => $input['specialNote'] ?? null,
            ':artisanName' => $input['artisanName'] ?? null,
            ':paymentVerified' => !empty($input['paymentVerified']) ? 1 : 0
        ]);

        if (!empty($input['items']) && is_array($input['items'])) {
            $itemSql = "INSERT INTO `pedido_items` (`orderId`, `name`, `specs`, `quantity`, `price`, `imageUrl`, `tag`, `artisanNote`)
                VALUES (:orderId, :name, :specs, :quantity, :price, :imageUrl, :tag, :artisanNote)";
            $itemStmt = $pdo->prepare($itemSql);
            foreach ($input['items'] as $item) {
                $itemStmt->execute([
                    ':orderId' => $input['id'],
                    ':name' => $item['name'] ?? 'Amigurumi',
                    ':specs' => $item['specs'] ?? '',
                    ':quantity' => (int)($item['quantity'] ?? 1),
                    ':price' => (float)($item['price'] ?? 0),
                    ':imageUrl' => $item['imageUrl'] ?? '',
                    ':tag' => $item['tag'] ?? null,
                    ':artisanNote' => $item['artisanNote'] ?? null
                ]);
            }
        }

        $pdo->commit();

        echo json_encode([
            'status' => 'success',
            'message' => 'Pedido registrado con éxito en MySQL',
            'id' => $input['id']
        ], JSON_UNESCAPED_UNICODE);
    } catch (Exception $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
    exit();
}

if ($method === 'PUT') {
    $raw = file_get_contents('php://input');
    $input = json_decode($raw, true);

    if (!$input || empty($input['id'])) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'ID de pedido requerido']);
        exit();
    }

    try {
        $fields = [];
        $params = [':id' => $input['id']];

        if (isset($input['status'])) {
            $fields[] = "`status` = :status";
            $params[':status'] = $input['status'];
        }
        if (isset($input['statusLabel'])) {
            $fields[] = "`statusLabel` = :statusLabel";
            $params[':statusLabel'] = $input['statusLabel'];
        }
        if (isset($input['priorityPercent'])) {
            $fields[] = "`priorityPercent` = :priorityPercent";
            $params[':priorityPercent'] = (int)$input['priorityPercent'];
        }
        if (isset($input['trackingNumber'])) {
            $fields[] = "`trackingNumber` = :trackingNumber";
            $params[':trackingNumber'] = $input['trackingNumber'];
        }
        if (isset($input['trackingStatus'])) {
            $fields[] = "`trackingStatus` = :trackingStatus";
            $params[':trackingStatus'] = $input['trackingStatus'];
        }
        if (isset($input['paymentVerified'])) {
            $fields[] = "`paymentVerified` = :paymentVerified";
            $params[':paymentVerified'] = $input['paymentVerified'] ? 1 : 0;
        }

        if (empty($fields)) {
            echo json_encode(['status' => 'success', 'message' => 'Nada que actualizar']);
            exit();
        }

        $sql = "UPDATE `pedidos` SET " . implode(', ', $fields) . " WHERE `id` = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        echo json_encode([
            'status' => 'success',
            'message' => 'Pedido actualizado en MySQL',
            'id' => $input['id']
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
    exit();
}

http_response_code(405);
echo json_encode(['status' => 'error', 'message' => 'Método no permitido']);
