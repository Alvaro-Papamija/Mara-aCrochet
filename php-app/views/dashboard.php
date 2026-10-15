<?php
declare(strict_types=1);

$stats = Order::getStats();
$recentOrders = array_slice(Order::getAll(), 0, 5);
$allProducts = Product::getAll();
$criticalProducts = array_filter($allProducts, fn($p) => $p['currentStock'] <= $p['minStockAlert']);
?>

<div class="space-y-6">

  <!-- Welcome Banner -->
  <div class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-marana-900 via-marana-800 to-marana-700 text-white p-6 sm:p-8 shadow-xl">
    <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div class="space-y-2 max-w-xl">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-amber-300 font-semibold">
          <span class="w-2 h-2 rounded-full bg-amber-400"></span>
          <span>Panel de Taller Central · Maraña Neiva</span>
        </div>
        <h1 class="font-rubik text-2xl sm:text-3xl font-bold tracking-tight">
          ¡Hola, <?= htmlspecialchars(currentUser()['name']) ?>!
        </h1>
        <p class="text-sm text-purple-200 leading-relaxed">
          Bienvenida al sistema integral en PHP de Maraña Crochet. Tu base de datos MySQL <strong class="text-white font-mono">marana_crochet</strong> está conectada y sincronizada en tiempo real.
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <a href="?page=stock&action=new" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-400 text-marana-obsidian font-bold text-xs hover:bg-amber-300 active:scale-95 transition-all shadow-md shadow-amber-400/20">
          <span class="material-symbols-outlined text-[18px]">add_circle</span>
          <span>Nuevo Amigurumi</span>
        </a>

        <a href="?page=vouchers" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs backdrop-blur-md border border-white/20 active:scale-95 transition-all">
          <span class="material-symbols-outlined text-[18px]">verified</span>
          <span>Validar Comprobantes (<?= $pendingVouchers ?>)</span>
        </a>

        <a href="http://localhost/phpmyadmin/index.php?route=/database/structure&db=marana_crochet" target="_blank" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs backdrop-blur-md border border-white/15 transition-all">
          <span class="material-symbols-outlined text-[18px]">database</span>
          <span>phpMyAdmin</span>
          <span class="material-symbols-outlined text-[14px]">open_in_new</span>
        </a>
      </div>
    </div>
  </div>

  <!-- Key Metrics 4-Cards Grid -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    
    <!-- Facturación / Total Ingresos -->
    <div class="p-5 rounded-3xl bg-white border border-marana-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
      <div class="flex items-center justify-between mb-3">
        <span class="text-xs font-bold uppercase tracking-wider text-gray-500">Total Ingresos</span>
        <div class="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <span class="material-symbols-outlined text-[20px]">payments</span>
        </div>
      </div>
      <div>
        <span class="font-rubik text-2xl font-extrabold text-marana-obsidian block">
          <?= formatCOP($stats['totalRevenue']) ?>
        </span>
        <span class="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
          <span class="material-symbols-outlined text-[14px]">trending_up</span>
          <span>Ventas confirmadas en taller</span>
        </span>
      </div>
    </div>

    <!-- Pedidos Totales -->
    <div class="p-5 rounded-3xl bg-white border border-marana-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
      <div class="flex items-center justify-between mb-3">
        <span class="text-xs font-bold uppercase tracking-wider text-gray-500">Pedidos Activos</span>
        <div class="w-9 h-9 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
          <span class="material-symbols-outlined text-[20px]">shopping_bag</span>
        </div>
      </div>
      <div>
        <span class="font-rubik text-2xl font-extrabold text-marana-obsidian block">
          <?= $stats['totalOrders'] ?> pedidos
        </span>
        <span class="text-[11px] text-purple-600 font-semibold flex items-center gap-1 mt-1">
          <span><?= $stats['pendingPreparation'] ?> en taller · <?= $stats['readyToShip'] ?> listos</span>
        </span>
      </div>
    </div>

    <!-- Comprobantes Pendientes -->
    <div class="p-5 rounded-3xl bg-white border border-marana-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
      <div class="flex items-center justify-between mb-3">
        <span class="text-xs font-bold uppercase tracking-wider text-gray-500">Comprobantes</span>
        <div class="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
          <span class="material-symbols-outlined text-[20px]">receipt_long</span>
        </div>
      </div>
      <div>
        <span class="font-rubik text-2xl font-extrabold text-marana-obsidian block">
          <?= $pendingVouchers ?> por validar
        </span>
        <span class="text-[11px] <?= $pendingVouchers > 0 ? 'text-amber-600' : 'text-gray-500' ?> font-semibold flex items-center gap-1 mt-1">
          <span class="material-symbols-outlined text-[14px]">notifications_active</span>
          <span>Nequi, Bancolombia, Daviplata</span>
        </span>
      </div>
    </div>

    <!-- Alertas de Stock -->
    <div class="p-5 rounded-3xl bg-white border border-marana-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
      <div class="flex items-center justify-between mb-3">
        <span class="text-xs font-bold uppercase tracking-wider text-gray-500">Inventario Crítico</span>
        <div class="w-9 h-9 rounded-2xl <?= count($criticalProducts) > 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600' ?> flex items-center justify-center">
          <span class="material-symbols-outlined text-[20px]">warning</span>
        </div>
      </div>
      <div>
        <span class="font-rubik text-2xl font-extrabold text-marana-obsidian block">
          <?= count($criticalProducts) ?> referencias
        </span>
        <span class="text-[11px] <?= count($criticalProducts) > 0 ? 'text-rose-600' : 'text-emerald-600' ?> font-semibold flex items-center gap-1 mt-1">
          <span><?= count($criticalProducts) > 0 ? 'Requiere producción urgente' : 'Nivel de stock saludable' ?></span>
        </span>
      </div>
    </div>

  </div>

  <!-- Operational Columns: Recent Orders & Stock Alerts -->
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

    <!-- Recent Orders (2 Columns) -->
    <div class="lg:col-span-2 p-6 rounded-3xl bg-white border border-marana-100 shadow-sm space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="font-rubik text-base font-bold text-marana-obsidian">Últimos Pedidos en Taller</h2>
          <p class="text-xs text-gray-500">Actualización en tiempo real desde la tabla <code class="font-mono text-marana-700">pedidos</code></p>
        </div>
        <a href="?page=orders" class="text-xs font-bold text-marana-600 hover:text-marana-800 flex items-center gap-1">
          <span>Ver todos (<?= $stats['totalOrders'] ?>)</span>
          <span class="material-symbols-outlined text-[16px]">chevron_right</span>
        </a>
      </div>

      <div class="divide-y divide-gray-100">
        <?php foreach ($recentOrders as $order): ?>
          <div class="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-marana-50/50 p-2 rounded-2xl transition-all">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-marana-100 text-marana-700 font-extrabold flex items-center justify-center text-xs shrink-0">
                <?= htmlspecialchars($order['customerInitials']) ?>
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <span class="text-xs font-bold text-marana-obsidian"><?= htmlspecialchars($order['customerName']) ?></span>
                  <span class="text-[10px] font-mono text-gray-400">#<?= htmlspecialchars($order['id']) ?></span>
                </div>
                <div class="text-[11px] text-gray-500 flex items-center gap-2 mt-0.5">
                  <span><?= htmlspecialchars($order['customerLocation']) ?></span>
                  <span>·</span>
                  <span><?= count($order['items']) ?> piezas</span>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-between sm:justify-end gap-3">
              <span class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                <?php
                  switch ($order['status']) {
                    case 'preparacion': echo 'bg-amber-100 text-amber-800'; break;
                    case 'listo': echo 'bg-indigo-100 text-indigo-800'; break;
                    case 'transito': echo 'bg-sky-100 text-sky-800'; break;
                    case 'entregado': echo 'bg-emerald-100 text-emerald-800'; break;
                    default: echo 'bg-gray-100 text-gray-800';
                  }
                ?>">
                <?= htmlspecialchars($order['statusLabel']) ?>
              </span>

              <a href="?page=guide&id=<?= urlencode($order['id']) ?>" class="p-1.5 rounded-xl hover:bg-marana-100 text-gray-500 hover:text-marana-700 transition-all" title="Ver Guía de Despacho">
                <span class="material-symbols-outlined text-[18px]">receipt</span>
              </a>
            </div>
          </div>
        <?php endforeach; ?>
      </div>
    </div>

    <!-- Critical Stock Feed (1 Column) -->
    <div class="p-6 rounded-3xl bg-white border border-marana-100 shadow-sm space-y-4 flex flex-col justify-between">
      <div>
        <div class="flex items-center justify-between mb-1">
          <h2 class="font-rubik text-base font-bold text-marana-obsidian">Alertas de Inventario</h2>
          <span class="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
            <?= count($criticalProducts) ?> críticas
          </span>
        </div>
        <p class="text-xs text-gray-500">Amigurumis que han alcanzado su umbral mínimo</p>

        <div class="mt-4 space-y-3">
          <?php if (empty($criticalProducts)): ?>
            <div class="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-xs text-center">
              ¡Excelente! Todas las piezas cuentan con stock suficiente.
            </div>
          <?php else: ?>
            <?php foreach (array_slice($criticalProducts, 0, 4) as $cp): ?>
              <div class="p-3 rounded-2xl bg-rose-50/60 border border-rose-100 flex items-center justify-between gap-3">
                <div class="flex items-center gap-2.5 min-w-0">
                  <img src="<?= $cp['imageUrl'] ?>" alt="" class="w-10 h-10 rounded-xl object-cover bg-white shrink-0">
                  <div class="min-w-0">
                    <span class="text-xs font-bold text-marana-obsidian block truncate"><?= htmlspecialchars($cp['name']) ?></span>
                    <span class="text-[11px] text-rose-700 block font-semibold">Stock: <?= $cp['currentStock'] ?> / Mín: <?= $cp['minStockAlert'] ?></span>
                  </div>
                </div>

                <form method="POST" action="?action=quick_stock">
                  <input type="hidden" name="sku" value="<?= htmlspecialchars($cp['sku']) ?>">
                  <input type="hidden" name="stock" value="<?= $cp['currentStock'] + 2 ?>">
                  <button type="submit" class="px-2.5 py-1 rounded-xl bg-white border border-rose-200 text-rose-700 hover:bg-rose-100 font-bold text-xs shadow-xs transition-all shrink-0">
                    +2 Unid
                  </button>
                </form>
              </div>
            <?php endforeach; ?>
          <?php endif; ?>
        </div>
      </div>

      <div class="pt-4 border-t border-gray-100">
        <a href="?page=stock" class="w-full py-2.5 px-4 rounded-2xl bg-marana-50 text-marana-700 font-bold text-xs hover:bg-marana-100 transition-all flex items-center justify-center gap-1.5">
          <span>Administrar Inventario Completo</span>
          <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
        </a>
      </div>
    </div>

  </div>

</div>
