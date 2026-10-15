<?php
declare(strict_types=1);

/**
 * Maraña Crochet - Configuración Global de la Aplicación PHP
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Configuración de Base de Datos MySQL
define('DB_HOST', '127.0.0.1');
define('DB_PORT', '3306');
define('DB_NAME', 'marana_crochet');
define('DB_USER', 'root');
define('DB_PASS', 'root'); // Compatible con MySQL Server 8.0 y XAMPP

// Información de la Aplicación
define('APP_NAME', 'Maraña Crochet Atelier');
define('APP_SUBTITLE', 'Gestión de Taller, Catálogo & Tienda de Amigurumis');
define('APP_VERSION', '2.5 Enterprise PHP');
define('APP_URL', '/marana');

// Helpers de Utilidad Global
function formatCOP(float|int|string|null $amount): string {
    return '$' . number_format((float)($amount ?? 0), 0, ',', '.') . ' COP';
}

function redirect(string $url): void {
    header("Location: {$url}");
    exit();
}

function setFlash(string $type, string $message, string $title = ''): void {
    $_SESSION['flash'] = [
        'type' => $type, // success, error, warning, info
        'message' => $message,
        'title' => $title ?: ($type === 'success' ? 'Éxito' : 'Atención')
    ];
}

function getFlash(): ?array {
    if (isset($_SESSION['flash'])) {
        $flash = $_SESSION['flash'];
        unset($_SESSION['flash']);
        return $flash;
    }
    return null;
}

function currentUser(): ?array {
    return $_SESSION['user'] ?? [
        'id' => 'usr_admin_1',
        'name' => 'Lucía Montoya',
        'username' => 'lucia.montoya',
        'email' => 'lucia@marana.com',
        'role' => 'admin',
        'roleTitle' => 'Administradora Taller & Fundadora',
        'avatarUrl' => 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        'phone' => '+57 300 456 7890',
        'city' => 'Neiva, Huila (Sede Taller Maraña)'
    ];
}

function isAdmin(): bool {
    $u = currentUser();
    return ($u['role'] ?? '') === 'admin';
}

function cartCount(): int {
    if (!isset($_SESSION['cart']) || !is_array($_SESSION['cart'])) {
        return 0;
    }
    $total = 0;
    foreach ($_SESSION['cart'] as $item) {
        $total += (int)($item['quantity'] ?? 1);
    }
    return $total;
}
