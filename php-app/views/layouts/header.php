<?php
declare(strict_types=1);
require_once __DIR__ . '/../../config/config.php';

$currentPage = $_GET['page'] ?? 'dashboard';
$user = currentUser();
$flash = getFlash();
$cartItemsCount = cartCount();
$pendingVouchers = Voucher::getPendingCount();
$criticalStock = Product::getCriticalStockCount();
?>
<!DOCTYPE html>
<html lang="es" class="h-full bg-[#fbf6fc]">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?= APP_NAME ?> — <?= APP_SUBTITLE ?></title>
  
  <!-- Tailwind CSS & Google Fonts -->
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Rubik:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />

  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            outfit: ['Outfit', 'sans-serif'],
            rubik: ['Rubik', 'sans-serif'],
            sans: ['"Plus Jakarta Sans"', 'sans-serif'],
          },
          colors: {
            marana: {
              50: '#fbf6fc',
              100: '#f6e9ff',
              200: '#edd5fd',
              300: '#deb7ff',
              400: '#b866ff',
              500: '#9426f8',
              600: '#7b2cbf',
              700: '#6100a4',
              800: '#4a007e',
              900: '#2e0854',
              obsidian: '#211630',
              amber: '#f9bd22',
            }
          }
        }
      }
    }
  </script>

  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
    .font-rubik { font-family: 'Rubik', sans-serif; }
    .font-outfit { font-family: 'Outfit', sans-serif; }
    .material-symbols-outlined {
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
      vertical-align: middle;
    }
    .material-symbols-outlined.fill {
      font-variation-settings: 'FILL' 1;
    }
  </style>
</head>
<body class="h-full flex flex-col text-marana-obsidian antialiased selection:bg-marana-200 selection:text-marana-900">

  <!-- Top Announcement & MySQL Status Header -->
  <div class="bg-gradient-to-r from-marana-900 via-marana-800 to-marana-700 text-white text-xs px-4 py-1.5 flex items-center justify-between shadow-xs">
    <div class="max-w-7xl mx-auto w-full flex items-center justify-between">
      <div class="flex items-center gap-3">
        <span class="inline-flex items-center gap-1.5 font-bold tracking-wider uppercase text-[10px] bg-white/10 px-2.5 py-0.5 rounded-full border border-white/15">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          XAMPP PHP 8.2 & MySQL 8.0 Activo
        </span>
        <span class="hidden sm:inline text-purple-200">Base de Datos: <strong class="text-amber-300 font-mono">marana_crochet</strong></span>
      </div>
      <div class="flex items-center gap-4 text-[11px]">
        <a href="http://localhost/phpmyadmin/index.php?route=/database/structure&db=marana_crochet" target="_blank" class="hover:text-amber-300 flex items-center gap-1 transition-colors font-medium">
          <span class="material-symbols-outlined text-[14px]">database</span>
          <span>phpMyAdmin</span>
          <span class="material-symbols-outlined text-[12px]">open_in_new</span>
        </a>
        <span class="text-white/30 hidden md:inline">|</span>
        <span class="hidden md:inline text-purple-200">Taller Artesanal Neiva, Huila</span>
      </div>
    </div>
  </div>

  <!-- Main Navigation Bar -->
  <header class="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-marana-100 shadow-xs">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        
        <!-- Brand Logo -->
        <a href="?page=catalog" class="flex items-center gap-2.5 group">
          <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-marana-600 to-marana-800 flex items-center justify-center text-white shadow-md shadow-marana-600/25 group-hover:scale-105 transition-all">
            <span class="material-symbols-outlined text-[24px]">palette</span>
          </div>
          <div>
            <div class="font-rubik text-lg font-bold tracking-tight text-marana-obsidian leading-none flex items-center gap-1.5">
              <span>Maraña Crochet</span>
              <span class="text-[9px] font-black uppercase tracking-widest bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-md border border-amber-200">PHP 8.2</span>
            </div>
            <span class="text-[10px] uppercase font-bold tracking-wider text-marana-600 block mt-0.5">Atelier & Boutique Textil</span>
          </div>
        </a>

        <!-- Navigation Links -->
        <nav class="hidden md:flex items-center gap-1">
          <a href="?page=catalog" class="px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 <?= $currentPage === 'catalog' ? 'bg-marana-100 text-marana-700 shadow-xs' : 'text-gray-600 hover:text-marana-700 hover:bg-marana-50' ?>">
            <span class="material-symbols-outlined text-[18px] <?= $currentPage === 'catalog' ? 'fill' : '' ?>">storefront</span>
            <span>Boutique</span>
          </a>

          <a href="?page=cart" class="relative px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 <?= $currentPage === 'cart' ? 'bg-marana-100 text-marana-700 shadow-xs' : 'text-gray-600 hover:text-marana-700 hover:bg-marana-50' ?>">
            <span class="material-symbols-outlined text-[18px] <?= $currentPage === 'cart' ? 'fill' : '' ?>">shopping_basket</span>
            <span>Bolsa</span>
            <?php if ($cartItemsCount > 0): ?>
              <span class="min-w-4 h-4 px-1 rounded-full bg-marana-600 text-white text-[10px] font-extrabold flex items-center justify-center leading-none">
                <?= $cartItemsCount ?>
              </span>
            <?php endif; ?>
          </a>

          <div class="h-5 w-px bg-gray-200 mx-1"></div>

          <a href="?page=dashboard" class="px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 <?= $currentPage === 'dashboard' ? 'bg-marana-100 text-marana-700 shadow-xs' : 'text-gray-600 hover:text-marana-700 hover:bg-marana-50' ?>">
            <span class="material-symbols-outlined text-[18px] <?= $currentPage === 'dashboard' ? 'fill' : '' ?>">dashboard</span>
            <span>Panel Taller</span>
          </a>

          <a href="?page=stock" class="relative px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 <?= $currentPage === 'stock' ? 'bg-marana-100 text-marana-700 shadow-xs' : 'text-gray-600 hover:text-marana-700 hover:bg-marana-50' ?>">
            <span class="material-symbols-outlined text-[18px] <?= $currentPage === 'stock' ? 'fill' : '' ?>">inventory_2</span>
            <span>Inventario</span>
            <?php if ($criticalStock > 0): ?>
              <span class="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            <?php endif; ?>
          </a>

          <a href="?page=orders" class="px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 <?= $currentPage === 'orders' ? 'bg-marana-100 text-marana-700 shadow-xs' : 'text-gray-600 hover:text-marana-700 hover:bg-marana-50' ?>">
            <span class="material-symbols-outlined text-[18px] <?= $currentPage === 'orders' ? 'fill' : '' ?>">local_shipping</span>
            <span>Pedidos</span>
          </a>

          <a href="?page=vouchers" class="relative px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 <?= $currentPage === 'vouchers' ? 'bg-marana-100 text-marana-700 shadow-xs' : 'text-gray-600 hover:text-marana-700 hover:bg-marana-50' ?>">
            <span class="material-symbols-outlined text-[18px] <?= $currentPage === 'vouchers' ? 'fill' : '' ?>">receipt_long</span>
            <span>Comprobantes</span>
            <?php if ($pendingVouchers > 0): ?>
              <span class="min-w-4 h-4 px-1 rounded-full bg-amber-500 text-white text-[10px] font-extrabold flex items-center justify-center">
                <?= $pendingVouchers ?>
              </span>
            <?php endif; ?>
          </a>

          <a href="?page=api_docs" class="px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 <?= $currentPage === 'api_docs' ? 'bg-marana-100 text-marana-700 shadow-xs' : 'text-gray-600 hover:text-marana-700 hover:bg-marana-50' ?>">
            <span class="material-symbols-outlined text-[18px] <?= $currentPage === 'api_docs' ? 'fill' : '' ?>">api</span>
            <span>API REST</span>
          </a>
        </nav>

        <!-- Right User / Quick Action -->
        <div class="flex items-center gap-2">
          <a href="?page=cart" class="md:hidden relative p-2 rounded-xl bg-marana-50 text-marana-700">
            <span class="material-symbols-outlined text-[20px]">shopping_basket</span>
            <?php if ($cartItemsCount > 0): ?>
              <span class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-marana-600 text-white text-[9px] font-black flex items-center justify-center">
                <?= $cartItemsCount ?>
              </span>
            <?php endif; ?>
          </a>

          <div class="flex items-center gap-2.5 pl-2 border-l border-gray-200">
            <div class="w-8 h-8 rounded-full ring-2 ring-marana-300 overflow-hidden bg-marana-100 shrink-0">
              <img src="<?= $user['avatarUrl'] ?>" alt="<?= htmlspecialchars($user['name']) ?>" class="w-full h-full object-cover">
            </div>
            <div class="hidden lg:block text-left">
              <span class="text-xs font-bold text-marana-obsidian block leading-tight"><?= htmlspecialchars($user['name']) ?></span>
              <span class="text-[10px] text-marana-600 font-semibold block leading-tight"><?= htmlspecialchars($user['roleTitle']) ?></span>
            </div>
          </div>
        </div>

      </div>
    </div>
  </header>

  <!-- Flash Toast Notifications -->
  <?php if ($flash): ?>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 animate-bounce">
      <div class="p-4 rounded-2xl flex items-center justify-between gap-3 shadow-lg border <?= $flash['type'] === 'success' ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-rose-50 text-rose-900 border-rose-200' ?>">
        <div class="flex items-center gap-3">
          <span class="material-symbols-outlined text-[24px] <?= $flash['type'] === 'success' ? 'text-emerald-600' : 'text-rose-600' ?>">
            <?= $flash['type'] === 'success' ? 'check_circle' : 'warning' ?>
          </span>
          <div>
            <span class="font-bold text-sm block"><?= htmlspecialchars($flash['title']) ?></span>
            <span class="text-xs text-opacity-90"><?= htmlspecialchars($flash['message']) ?></span>
          </div>
        </div>
      </div>
    </div>
  <?php endif; ?>

  <!-- Main View Container -->
  <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
