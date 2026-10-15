<?php
declare(strict_types=1);

/**
 * Maraña Crochet - Front Controller Principal en PHP 8.2 (XAMPP)
 */

require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/Database.php';
require_once __DIR__ . '/models/Product.php';
require_once __DIR__ . '/models/Order.php';
require_once __DIR__ . '/models/Voucher.php';
require_once __DIR__ . '/models/User.php';

// ==========================================
// 1. MANEJO DE ACCIONES (POST / ACTIONS)
// ==========================================
$action = $_GET['action'] ?? null;

if ($action) {
    switch ($action) {
        // Añadir a la bolsa
        case 'add_cart':
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                $sku = $_POST['sku'] ?? '';
                if ($sku) {
                    if (!isset($_SESSION['cart'])) $_SESSION['cart'] = [];
                    if (isset($_SESSION['cart'][$sku])) {
                        $_SESSION['cart'][$sku]['quantity'] += 1;
                    } else {
                        $_SESSION['cart'][$sku] = [
                            'sku' => $sku,
                            'name' => $_POST['name'] ?? 'Amigurumi',
                            'price' => (float)($_POST['price'] ?? 0),
                            'size' => $_POST['size'] ?? '22 cm',
                            'imageUrl' => $_POST['imageUrl'] ?? '',
                            'quantity' => 1
                        ];
                    }
                    setFlash('success', "¡Pieza añadida a tu bolsa de compras!", "Boutique");
                }
            }
            redirect('?page=catalog');
            break;

        // Modificar cantidad en carrito
        case 'update_cart_qty':
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                $sku = $_POST['sku'] ?? '';
                $delta = (int)($_POST['delta'] ?? 0);
                if ($sku && isset($_SESSION['cart'][$sku])) {
                    $_SESSION['cart'][$sku]['quantity'] += $delta;
                    if ($_SESSION['cart'][$sku]['quantity'] <= 0) {
                        unset($_SESSION['cart'][$sku]);
                    }
                }
            }
            redirect('?page=cart');
            break;

        // Eliminar del carrito
        case 'remove_cart':
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                $sku = $_POST['sku'] ?? '';
                if ($sku && isset($_SESSION['cart'][$sku])) {
                    unset($_SESSION['cart'][$sku]);
                    setFlash('info', 'Pieza retirada de la bolsa.', 'Carrito');
                }
            }
            redirect('?page=cart');
            break;

        // Finalizar pedido (Checkout)
        case 'checkout':
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                $cart = $_SESSION['cart'] ?? [];
                if (!empty($cart)) {
                    $orderNum = rand(885, 999);
                    $orderId = "MC-2024-{$orderNum}";
                    $voucherId = "VOUCH-{$orderNum}";
                    $total = (float)$_POST['totalAmount'];

                    $orderData = [
                        'id' => $orderId,
                        'customerName' => $_POST['customerName'],
                        'customerPhone' => $_POST['customerPhone'],
                        'customerAddress' => $_POST['customerAddress'],
                        'customerLocation' => $_POST['customerAddress'],
                        'specialNote' => $_POST['specialNote'] ?? '',
                        'shippingCost' => (float)($_POST['shippingCost'] ?? 14000),
                        'carrier' => 'Servientrega Nacional',
                        'trackingNumber' => '9482-0198-' . rand(1000, 9999),
                        'paymentVerified' => 0
                    ];

                    $items = array_values($cart);
                    $okOrder = Order::create($orderData, $items);

                    // Registrar comprobante asociado
                    $okVoucher = Voucher::create([
                        'id' => $voucherId,
                        'orderId' => $orderId,
                        'customerName' => $_POST['customerName'],
                        'customerPhone' => $_POST['customerPhone'],
                        'customerAddress' => $_POST['customerAddress'],
                        'totalAmount' => $total,
                        'paymentMethod' => $_POST['paymentMethod'] ?? 'Bancolombia Transfer',
                        'approvalCode' => $_POST['approvalCode'] ?? ('AUT-' . rand(100000, 999999)),
                        'itemsSummary' => $items,
                        'internalNote' => 'Registrado vía Checkout Web PHP.'
                    ]);

                    if ($okOrder && $okVoucher) {
                        $_SESSION['cart'] = [];
                        setFlash('success', "¡Tu pedido #{$orderId} ha sido registrado exitosamente en MySQL!", "Pedido Creado");
                        redirect('?page=orders');
                    } else {
                        setFlash('error', "Ocurrió un error al guardar en MySQL.", "Error");
                        redirect('?page=cart');
                    }
                }
            }
            redirect('?page=catalog');
            break;

        // Modificar stock rápido
        case 'quick_stock':
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                $sku = $_POST['sku'] ?? '';
                $stock = (int)($_POST['stock'] ?? 0);
                if ($sku) {
                    Product::updateStock($sku, $stock);
                    setFlash('success', "Stock actualizado para {$sku}: {$stock} unidades en MySQL.", "Inventario");
                }
            }
            $returnPage = $_GET['page'] ?? 'stock';
            redirect("?page={$returnPage}");
            break;

        // Crear producto nuevo
        case 'create_product':
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                $ok = Product::save($_POST);
                if ($ok) {
                    setFlash('success', "Amigurumi {$_POST['name']} registrado en MySQL.", "Catálogo");
                } else {
                    setFlash('error', "No se pudo registrar el producto.", "Error");
                }
            }
            redirect('?page=stock');
            break;

        // Eliminar producto
        case 'delete_product':
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                $sku = $_POST['sku'] ?? '';
                if ($sku) {
                    Product::delete($sku);
                    setFlash('info', "Producto {$sku} eliminado de la base de datos.", "Inventario");
                }
            }
            redirect('?page=stock');
            break;

        // Actualizar estado de pedido
        case 'update_order_status':
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                $id = $_POST['id'] ?? '';
                $status = $_POST['status'] ?? '';
                $tracking = $_POST['trackingNumber'] ?? null;
                if ($id && $status) {
                    Order::updateStatus($id, $status, $tracking);
                    setFlash('success', "Pedido #{$id} actualizado a estado '{$status}' en MySQL.", "Pedidos");
                }
            }
            redirect('?page=orders');
            break;

        // Actualizar comprobante (aprobar / rechazar)
        case 'update_voucher':
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                $id = $_POST['id'] ?? '';
                $status = $_POST['status'] ?? '';
                if ($id && $status) {
                    Voucher::updateStatus($id, $status);
                    setFlash('success', "Comprobante #{$id} procesado como '{$status}'. Pago verificado en MySQL.", "Comprobantes");
                }
            }
            redirect('?page=vouchers');
            break;

        // Exportar inventario a archivo CSV
        case 'export_stock_csv':
            $products = Product::getAll();
            header('Content-Type: text/csv; charset=UTF-8');
            header('Content-Disposition: attachment; filename="inventario_marana_' . date('Y-m-d') . '.csv"');
            $out = fopen('php://output', 'w');
            // BOM UTF-8 para Excel
            fprintf($out, chr(0xEF).chr(0xBB).chr(0xBF));
            fputcsv($out, ['SKU', 'Nombre', 'Tag', 'Tamaño', 'Proveedor Hilaza', 'Precio COP', 'Costo Hilaza COP', 'Stock Actual', 'Alerta Minima', 'Estado']);
            foreach ($products as $p) {
                fputcsv($out, [
                    $p['sku'],
                    $p['name'],
                    $p['tag'],
                    $p['size'],
                    $p['supplier'],
                    $p['priceCOP'],
                    $p['yarnCostCOP'],
                    $p['currentStock'],
                    $p['minStockAlert'],
                    $p['category']
                ]);
            }
            fclose($out);
            exit();
    }
}

// ==========================================
// 2. ENRUTAMIENTO DE VISTAS (GET / PAGES)
// ==========================================
$page = $_GET['page'] ?? 'dashboard';

// Vistas disponibles
$allowedPages = [
    'dashboard' => 'dashboard.php',
    'catalog' => 'catalog.php',
    'cart' => 'cart.php',
    'stock' => 'stock.php',
    'orders' => 'orders.php',
    'vouchers' => 'vouchers.php',
    'guide' => 'guide.php',
    'api_docs' => 'api_docs.php',
];

$viewFile = $allowedPages[$page] ?? 'dashboard.php';

// Renderizar Layout y Vista
require_once __DIR__ . '/views/layouts/header.php';
require_once __DIR__ . '/views/' . $viewFile;
require_once __DIR__ . '/views/layouts/footer.php';
