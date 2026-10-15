<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/Database.php';

class User {
    public static function getAll(): array {
        return Database::fetchAll("SELECT `id`, `name`, `username`, `email`, `role`, `roleTitle`, `avatarUrl`, `phone`, `city`, `address` FROM `usuarios`");
    }

    public static function getById(string $id): ?array {
        return Database::fetchOne("SELECT * FROM `usuarios` WHERE `id` = :id", [':id' => $id]);
    }

    public static function getByUsername(string $username): ?array {
        return Database::fetchOne("SELECT * FROM `usuarios` WHERE `username` = :u OR `email` = :u", [':u' => $username]);
    }
}
