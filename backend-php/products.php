<?php
require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $stmt = $pdo->query("SELECT * FROM `productos` ORDER BY `sku` ASC");
        $products = $stmt->fetchAll();

        // Convert numeric strings to actual numbers
        $formatted = array_map(function($p) {
            return [
                'sku' => $p['sku'],
                'name' => $p['name'],
                'tag' => $p['tag'] ?? '',
                'size' => $p['size'] ?? '',
                'supplier' => $p['supplier'] ?? '',
                'priceCOP' => (float)$p['priceCOP'],
                'yarnCostCOP' => (float)$p['yarnCostCOP'],
                'currentStock' => (int)$p['currentStock'],
                'minStockAlert' => (int)$p['minStockAlert'],
                'category' => $p['category'],
                'statusLabel' => $p['statusLabel'] ?? '',
                'imageUrl' => $p['imageUrl'] ?? '',
                'waitingListCount' => (int)($p['waitingListCount'] ?? 0),
                'leadTimeDays' => isset($p['leadTimeDays']) ? (int)$p['leadTimeDays'] : 3,
                'monthlyQuota' => isset($p['monthlyQuota']) ? (int)$p['monthlyQuota'] : 10,
            ];
        }, $products);

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

if ($method === 'POST' || $method === 'PUT') {
    $raw = file_get_contents('php://input');
    $input = json_decode($raw, true);

    if (!$input || empty($input['sku'])) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'SKU y datos del producto son requeridos']);
        exit();
    }

    try {
        // Calculate status and category if currentStock changed
        $currentStock = isset($input['currentStock']) ? (int)$input['currentStock'] : 0;
        $minStock = isset($input['minStockAlert']) ? (int)$input['minStockAlert'] : 2;
        $category = $input['category'] ?? 'optimo';
        $statusLabel = $input['statusLabel'] ?? '';

        if (!isset($input['statusLabel']) || empty($input['statusLabel'])) {
            if ($currentStock === 0) {
                $category = 'agotado';
                $statusLabel = 'Agotado · Esperando reposición';
            } elseif ($currentStock <= $minStock) {
                $category = 'critico';
                $statusLabel = "Stock Mínimo alcanzado: {$currentStock} / {$minStock}";
            } else {
                $category = 'optimo';
                $statusLabel = "Stock Óptimo ({$currentStock} unidades)";
            }
        }

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
            `monthlyQuota` = VALUES(`monthlyQuota`);";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':sku' => $input['sku'],
            ':name' => $input['name'] ?? 'Amigurumi',
            ':tag' => $input['tag'] ?? '',
            ':size' => $input['size'] ?? '',
            ':supplier' => $input['supplier'] ?? '',
            ':priceCOP' => (float)($input['priceCOP'] ?? 0),
            ':yarnCostCOP' => (float)($input['yarnCostCOP'] ?? 0),
            ':currentStock' => $currentStock,
            ':minStockAlert' => $minStock,
            ':category' => $category,
            ':statusLabel' => $statusLabel,
            ':imageUrl' => $input['imageUrl'] ?? '',
            ':waitingListCount' => (int)($input['waitingListCount'] ?? 0),
            ':leadTimeDays' => (int)($input['leadTimeDays'] ?? 3),
            ':monthlyQuota' => (int)($input['monthlyQuota'] ?? 10)
        ]);

        echo json_encode([
            'status' => 'success',
            'message' => 'Producto guardado exitosamente en MySQL',
            'sku' => $input['sku']
        ], JSON_UNESCAPED_UNICODE);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
    exit();
}

http_response_code(405);
echo json_encode(['status' => 'error', 'message' => 'Método no permitido']);
