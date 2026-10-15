<?php
declare(strict_types=1);

$allOrders = Order::getAll();
$filter = $_GET['status'] ?? 'all';

$orders = $allOrders;
if ($filter !== 'all') {
    $orders = array_filter($allOrders, fn($o) => ($o['status'] ?? '') === $filter);
}
?>

<div class="space-y-6">

  <!-- Header -->
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div>
      <h1 class="font-rubik text-2xl font-bold text-marana-obsidian">Gestión de Pedidos & Envíos</h1>
      <p class="text-xs text-gray-500">Supervisión del ciclo de preparación, embalaje y despacho artesanal</p>
    </div>

    <!-- Status filter tabs -->
    <div class="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
      <a href="?page=orders&status=all" class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 <?= $filter === 'all' ? 'bg-marana-700 text-white shadow-xs' : 'bg-white text-gray-600 hover:bg-marana-50' ?>">
        Todos (<?= count($allOrders) ?>)
      </a>
      <a href="?page=orders&status=preparacion" class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 <?= $filter === 'preparacion' ? 'bg-amber-600 text-white shadow-xs' : 'bg-white text-gray-600 hover:bg-marana-50' ?>">
        En Taller
      </a>
      <a href="?page=orders&status=listo" class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 <?= $filter === 'listo' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-gray-600 hover:bg-marana-50' ?>">
        Listos Despacho
      </a>
      <a href="?page=orders&status=transito" class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 <?= $filter === 'transito' ? 'bg-sky-600 text-white shadow-xs' : 'bg-white text-gray-600 hover:bg-marana-50' ?>">
        En Tránsito
      </a>
      <a href="?page=orders&status=entregado" class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 <?= $filter === 'entregado' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white text-gray-600 hover:bg-marana-50' ?>">
        Entregados
      </a>
    </div>
  </div>

  <!-- Orders List -->
  <div class="space-y-4">
    <?php if (empty($orders)): ?>
      <div class="p-12 text-center rounded-3xl bg-white border border-marana-100 shadow-sm text-xs text-gray-500">
        No se encontraron pedidos con el filtro seleccionado.
      </div>
    <?php else: ?>
      <?php foreach ($orders as $o): ?>
        <div class="bg-white rounded-3xl border border-marana-100 shadow-sm p-6 space-y-4 hover:shadow-md transition-all">
          
          <!-- Top Row: Order ID, Date, Status -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-marana-100 text-marana-700 font-extrabold flex items-center justify-center text-xs shrink-0">
                <?= htmlspecialchars($o['customerInitials']) ?>
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-rubik text-base font-bold text-marana-obsidian"><?= htmlspecialchars($o['customerName']) ?></span>
                  <span class="text-xs font-mono font-bold text-marana-700 bg-marana-50 px-2 py-0.5 rounded-md">#<?= htmlspecialchars($o['id']) ?></span>
                </div>
                <div class="text-[11px] text-gray-500 flex items-center gap-2 mt-0.5">
                  <span class="material-symbols-outlined text-[14px]">phone</span>
                  <span><?= htmlspecialchars($o['customerPhone']) ?></span>
                  <span>·</span>
                  <span class="material-symbols-outlined text-[14px]">schedule</span>
                  <span><?= htmlspecialchars($o['date']) ?></span>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <?php if (!empty($o['paymentVerified'])): ?>
                <span class="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <span class="material-symbols-outlined text-[14px]">verified</span>
                  <span>Pago Verificado</span>
                </span>
              <?php else: ?>
                <span class="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  <span class="material-symbols-outlined text-[14px]">hourglass_top</span>
                  <span>Pago Pendiente</span>
                </span>
              <?php endif; ?>

              <span class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                <?php
                  switch ($o['status']) {
                    case 'preparacion': echo 'bg-amber-100 text-amber-900'; break;
                    case 'listo': echo 'bg-indigo-100 text-indigo-900'; break;
                    case 'transito': echo 'bg-sky-100 text-sky-900'; break;
                    case 'entregado': echo 'bg-emerald-100 text-emerald-900'; break;
                    default: echo 'bg-gray-100 text-gray-800';
                  }
                ?>">
                <?= htmlspecialchars($o['statusLabel']) ?>
              </span>
            </div>
          </div>

          <!-- Middle Row: Items & Delivery Info -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <!-- Items -->
            <div class="space-y-2">
              <span class="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Piezas en el Pedido</span>
              <div class="space-y-1.5">
                <?php foreach ($o['items'] as $item): ?>
                  <div class="flex items-center justify-between p-2 rounded-xl bg-marana-50/50">
                    <div class="flex items-center gap-2 min-w-0">
                      <span class="font-bold text-marana-700"><?= $item['quantity'] ?>x</span>
                      <span class="font-semibold text-gray-800 truncate"><?= htmlspecialchars($item['name']) ?></span>
                      <span class="text-[10px] text-gray-400 font-mono">(<?= htmlspecialchars($item['specs']) ?>)</span>
                    </div>
                    <span class="font-mono font-bold text-marana-obsidian"><?= formatCOP($item['price']) ?></span>
                  </div>
                <?php endforeach; ?>
              </div>
            </div>

            <!-- Shipping & Notes -->
            <div class="space-y-2 p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
              <span class="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Detalles de Entrega</span>
              <div class="space-y-1 text-gray-600">
                <p><strong>Destino:</strong> <?= htmlspecialchars($o['customerLocation'] ?? 'Neiva, Huila') ?></p>
                <p><strong>Dirección:</strong> <?= htmlspecialchars($o['customerAddress'] ?? 'Taller Maraña') ?></p>
                <p><strong>Transportadora:</strong> <?= htmlspecialchars($o['carrier']) ?> <?= !empty($o['trackingNumber']) ? "(Guía: {$o['trackingNumber']})" : '' ?></p>
                <?php if (!empty($o['specialNote'])): ?>
                  <p class="text-[11px] italic text-purple-900 bg-purple-50 p-2 rounded-lg border border-purple-100 mt-1">
                    <?= htmlspecialchars($o['specialNote']) ?>
                  </p>
                <?php endif; ?>
              </div>
            </div>
          </div>

          <!-- Bottom Actions -->
          <div class="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100">
            <div class="text-xs text-gray-500">
              Costo Envío: <strong><?= formatCOP($o['shippingCost']) ?></strong>
            </div>

            <div class="flex items-center gap-2">
              <a href="?page=guide&id=<?= urlencode($o['id']) ?>" class="px-3.5 py-1.5 rounded-xl bg-white border border-gray-200 text-gray-700 font-bold text-xs hover:bg-gray-50 flex items-center gap-1.5 shadow-xs transition-all">
                <span class="material-symbols-outlined text-[16px]">print</span>
                <span>Guía Despacho</span>
              </a>

              <!-- Status Action Buttons -->
              <?php if ($o['status'] === 'preparacion'): ?>
                <form method="POST" action="?action=update_order_status">
                  <input type="hidden" name="id" value="<?= htmlspecialchars($o['id']) ?>">
                  <input type="hidden" name="status" value="listo">
                  <button type="submit" class="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 shadow-xs transition-all">
                    Marcar Listo para Envío
                  </button>
                </form>
              <?php elseif ($o['status'] === 'listo'): ?>
                <form method="POST" action="?action=update_order_status">
                  <input type="hidden" name="id" value="<?= htmlspecialchars($o['id']) ?>">
                  <input type="hidden" name="status" value="transito">
                  <input type="hidden" name="trackingNumber" value="9482-0198-<?= rand(1000, 9999) ?>">
                  <button type="submit" class="px-3.5 py-1.5 rounded-xl bg-sky-600 text-white font-bold text-xs hover:bg-sky-700 shadow-xs transition-all">
                    Despachar con Transportadora
                  </button>
                </form>
              <?php elseif ($o['status'] === 'transito'): ?>
                <form method="POST" action="?action=update_order_status">
                  <input type="hidden" name="id" value="<?= htmlspecialchars($o['id']) ?>">
                  <input type="hidden" name="status" value="entregado">
                  <button type="submit" class="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 shadow-xs transition-all">
                    Confirmar Entrega
                  </button>
                </form>
              <?php endif; ?>
            </div>
          </div>

        </div>
      <?php endforeach; ?>
    <?php endif; ?>
  </div>

</div>
