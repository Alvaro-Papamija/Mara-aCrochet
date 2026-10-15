<?php
require_once __DIR__ . '/db.php';

try {
    $tables = [];
    $stmt = $pdo->query("SHOW TABLES");
    while ($row = $stmt->fetch(PDO::FETCH_NUM)) {
        $tableName = $row[0];
        $countStmt = $pdo->query("SELECT COUNT(*) FROM `{$tableName}`");
        $tables[$tableName] = (int)$countStmt->fetchColumn();
    }

    echo json_encode([
        'status' => 'success',
        'message' => '¡Conexión exitosa a MySQL desde XAMPP!',
        'database' => 'marana_crochet',
        'server' => $_SERVER['SERVER_SOFTWARE'] ?? 'XAMPP Apache / PHP',
        'php_version' => PHP_VERSION,
        'mysql_version' => $pdo->getAttribute(PDO::ATTR_SERVER_VERSION),
        'tables' => $tables,
        'timestamp' => date('Y-m-d H:i:s')
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
