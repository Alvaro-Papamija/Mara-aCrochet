<?php
require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $stmt = $pdo->query("SELECT * FROM `comprobantes` ORDER BY `created_at` DESC");
        $vouchers = $stmt->fetchAll();

        // Get order items for each voucher's orderId
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

        $formatted = array_map(function($v) use ($itemsByOrder) {
            $summary = !empty($v['itemsSummary']) ? json_decode($v['itemsSummary'], true) : [];
            return [
                'id' => $v['id'],
                'orderId' => $v['orderId'],
                'timeAgo' => $v['timeAgo'] ?? 'Reciente',
                'customerName' => $v['customerName'],
                'customerPhone' => $v['customerPhone'] ?? '',
                'customerAddress' => $v['customerAddress'] ?? '',
                'shippingMethod' => $v['shippingMethod'] ?? '',
                'totalAmount' => (float)$v['totalAmount'],
                'expectedAmount' => (float)$v['expectedAmount'],
                'paymentMethod' => $v['paymentMethod'] ?? '',
                'bankAccount' => $v['bankAccount'] ?? '',
                'approvalCode' => $v['approvalCode'] ?? '',
                'bankTimestamp' => $v['bankTimestamp'] ?? '',
                'status' => $v['status'],
                'receiptThumbUrl' => $v['receiptThumbUrl'] ?? '',
                'receiptFullUrl' => $v['receiptFullUrl'] ?? '',
                'itemsSummary' => $summary ?: [],
                'itemsDetail' => $itemsByOrder[$v['orderId']] ?? [],
                'internalNote' => $v['internalNote'] ?? null,
            ];
        }, $vouchers);

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

    if (!$input || empty($input['id']) || empty($input['orderId'])) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'ID y orderId son requeridos']);
        exit();
    }

    try {
        $sql = "INSERT INTO `comprobantes`
            (`id`, `orderId`, `timeAgo`, `customerName`, `customerPhone`, `customerAddress`, `shippingMethod`, `totalAmount`, `expectedAmount`, `paymentMethod`, `bankAccount`, `approvalCode`, `bankTimestamp`, `status`, `receiptThumbUrl`, `receiptFullUrl`, `itemsSummary`, `internalNote`)
            VALUES
            (:id, :orderId, :timeAgo, :customerName, :customerPhone, :customerAddress, :shippingMethod, :totalAmount, :expectedAmount, :paymentMethod, :bankAccount, :approvalCode, :bankTimestamp, :status, :receiptThumbUrl, :receiptFullUrl, :itemsSummary, :internalNote)";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':id' => $input['id'],
            ':orderId' => $input['orderId'],
            ':timeAgo' => $input['timeAgo'] ?? 'Hace un momento',
            ':customerName' => $input['customerName'] ?? '',
            ':customerPhone' => $input['customerPhone'] ?? '',
            ':customerAddress' => $input['customerAddress'] ?? '',
            ':shippingMethod' => $input['shippingMethod'] ?? '',
            ':totalAmount' => (float)($input['totalAmount'] ?? 0),
            ':expectedAmount' => (float)($input['expectedAmount'] ?? 0),
            ':paymentMethod' => $input['paymentMethod'] ?? 'Transferencia',
            ':bankAccount' => $input['bankAccount'] ?? '',
            ':approvalCode' => $input['approvalCode'] ?? '',
            ':bankTimestamp' => $input['bankTimestamp'] ?? date('d M Y · h:i A'),
            ':status' => $input['status'] ?? 'pendiente',
            ':receiptThumbUrl' => $input['receiptThumbUrl'] ?? '',
            ':receiptFullUrl' => $input['receiptFullUrl'] ?? '',
            ':itemsSummary' => !empty($input['itemsSummary']) ? json_encode($input['itemsSummary'], JSON_UNESCAPED_UNICODE) : null,
            ':internalNote' => $input['internalNote'] ?? null,
        ]);

        echo json_encode([
            'status' => 'success',
            'message' => 'Comprobante guardado en MySQL',
            'id' => $input['id']
        ]);
    } catch (Exception $e) {
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
        echo json_encode(['status' => 'error', 'message' => 'ID de comprobante requerido']);
        exit();
    }

    try {
        $fields = [];
        $params = [':id' => $input['id']];

        if (isset($input['status'])) {
            $fields[] = "`status` = :status";
            $params[':status'] = $input['status'];
        }
        if (isset($input['internalNote'])) {
            $fields[] = "`internalNote` = :internalNote";
            $params[':internalNote'] = $input['internalNote'];
        }

        if (!empty($fields)) {
            $sql = "UPDATE `comprobantes` SET " . implode(', ', $fields) . " WHERE `id` = :id";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
        }

        // If status is 'aprobado', automatically update the associated order's paymentVerified to true
        if (isset($input['status']) && $input['status'] === 'aprobado') {
            $vStmt = $pdo->prepare("SELECT `orderId` FROM `comprobantes` WHERE `id` = :id");
            $vStmt->execute([':id' => $input['id']]);
            $orderId = $vStmt->fetchColumn();
            if ($orderId) {
                $upOrder = $pdo->prepare("UPDATE `pedidos` SET `paymentVerified` = 1, `status` = 'listo', `statusLabel` = 'Listo Despacho' WHERE `id` = :orderId");
                $upOrder->execute([':orderId' => $orderId]);
            }
        }

        echo json_encode([
            'status' => 'success',
            'message' => 'Comprobante actualizado en MySQL',
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
