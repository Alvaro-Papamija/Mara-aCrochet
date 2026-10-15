<?php
/**
 * Maraña Crochet - Conexión de Base de Datos MySQL (XAMPP)
 */

// Cabeceras CORS para permitir peticiones desde React / Vite (localhost:3000 / localhost:5173)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$db_host = '127.0.0.1';
$db_port = 3306;
$db_name = 'marana_crochet';
$db_user = 'root';
$db_pass = 'root'; // Contraseña configurada en MySQL local

try {
    $dsn = "mysql:host={$db_host};port={$db_port};dbname={$db_name};charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];
    $pdo = new PDO($dsn, $db_user, $db_pass, $options);
} catch (PDOException $e) {
    // Intento secundario sin contraseña si la contraseña root fuera vacía
    try {
        $pdo = new PDO($dsn, $db_user, '', $options);
    } catch (PDOException $e2) {
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Error de conexión a MySQL en XAMPP: ' . $e->getMessage(),
            'hint' => 'Verifique que el servicio MySQL esté iniciado y el usuario/clave root sean correctos.'
        ]);
        exit();
    }
}
