<?php
declare(strict_types=1);

require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/models/Product.php';
require_once __DIR__ . '/models/Order.php';
require_once __DIR__ . '/models/Voucher.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$endpoint = $_GET['endpoint'] ?? 'test';
$method = $_SERVER['REQUEST_METHOD'];

switch ($endpoint) {
    case 'test':
        try {
            $pdo = Database::getConnection();
            $tables = [];
            foreach (['productos', 'pedidos', 'pedido_items', 'comprobantes', 'usuarios'] as $tbl) {
                $row = Database::fetchOne("SELECT COUNT(*) as total FROM `{$tbl}`");
                $tables[$tbl] = (int)($row['total'] ?? 0);
            }
            echo json_encode([
                'status' => 'success',
                'message' => '¡API PHP 8.2 en XAMPP funcionando perfectamente!',
                'database' => DB_NAME,
                'php_version' => PHP_VERSION,
                'mysql_version' => $pdo->getAttribute(PDO::ATTR_SERVER_VERSION),
                'tables' => $tables,
                'timestamp' => date('Y-m-d H:i:s')
            ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
        break;

    case 'products':
        if ($method === 'GET') {
            echo json_encode(['status' => 'success', 'data' => Product::getAll()], JSON_UNESCAPED_UNICODE);
        } elseif ($method === 'POST') {
            $data = json_decode(file_get_contents('php://input'), true) ?: $_POST;
            $ok = Product::save($data);
            echo json_encode(['status' => $ok ? 'success' : 'error']);
        }
        break;

    case 'orders':
        if ($method === 'GET') {
            echo json_encode(['status' => 'success', 'data' => Order::getAll()], JSON_UNESCAPED_UNICODE);
        } elseif ($method === 'POST') {
            $data = json_decode(file_get_contents('php://input'), true) ?: $_POST;
            $items = $data['items'] ?? [];
            $ok = Order::create($data, $items);
            echo json_encode(['status' => $ok ? 'success' : 'error']);
        }
        break;

    case 'vouchers':
        if ($method === 'GET') {
            echo json_encode(['status' => 'success', 'data' => Voucher::getAll()], JSON_UNESCAPED_UNICODE);
        } elseif ($method === 'PUT' || $method === 'POST') {
            $data = json_decode(file_get_contents('php://input'), true) ?: $_POST;
            $ok = Voucher::updateStatus($data['id'], $data['status'], $data['internalNote'] ?? null);
            echo json_encode(['status' => $ok ? 'success' : 'error']);
        }
        break;

    default:
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Endpoint no encontrado']);
        break;
}
