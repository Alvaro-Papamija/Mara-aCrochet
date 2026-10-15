<?php
declare(strict_types=1);

$vouchers = Voucher::getAll();
$pendingCount = count(array_filter($vouchers, fn($v) => $v['status'] === 'pendiente'));
?>

<div class="space-y-6">

  <!-- Header -->
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div>
      <div class="flex items-center gap-2">
        <h1 class="font-rubik text-2xl font-bold text-marana-obsidian">Validación de Comprobantes de Pago</h1>
        <?php if ($pendingCount > 0): ?>
          <span class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 animate-pulse">
            <?= $pendingCount ?> por validar
          </span>
        <?php endif; ?>
      </div>
      <p class="text-xs text-gray-500">Conciliación de transferencias bancarias (Bancolombia, Nequi, Daviplata) en la tabla <code class="font-mono text-marana-700">comprobantes</code></p>
    </div>
  </div>

  <!-- Vouchers Grid -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <?php foreach ($vouchers as $v): ?>
      <div class="bg-white rounded-3xl border border-marana-100 shadow-sm p-6 space-y-4 hover:shadow-md transition-all flex flex-col justify-between">
        
        <div class="space-y-3">
          <!-- Top Badges -->
          <div class="flex items-center justify-between">
            <span class="font-mono text-xs font-bold text-marana-700 bg-marana-50 px-2 py-0.5 rounded-md">
              #<?= htmlspecialchars($v['id']) ?>
            </span>
            <span class="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider
              <?php
                switch ($v['status']) {
                  case 'aprobado': echo 'bg-emerald-100 text-emerald-800'; break;
                  case 'pendiente': echo 'bg-amber-100 text-amber-800'; break;
                  case 'rechazado': echo 'bg-rose-100 text-rose-800'; break;
                  default: echo 'bg-gray-100 text-gray-800';
                }
              ?>">
              <?= htmlspecialchars($v['status']) ?>
            </span>
          </div>

          <!-- Customer Info -->
          <div>
            <h3 class="font-bold text-base text-marana-obsidian"><?= htmlspecialchars($v['customerName']) ?></h3>
            <span class="text-xs text-gray-500 block"><?= htmlspecialchars($v['customerPhone']) ?></span>
            <span class="text-[11px] text-gray-400 block font-mono mt-0.5">Pedido asociado: #<?= htmlspecialchars($v['orderId']) ?></span>
          </div>

          <!-- Payment Details Card -->
          <div class="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 text-xs space-y-1.5">
            <div class="flex justify-between">
              <span class="text-gray-500">Medio:</span>
              <strong class="text-marana-obsidian"><?= htmlspecialchars($v['paymentMethod']) ?></strong>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Autorización:</span>
              <span class="font-mono font-bold text-marana-700"><?= htmlspecialchars($v['approvalCode']) ?></span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Fecha/Hora Banco:</span>
              <span class="text-gray-600"><?= htmlspecialchars($v['bankTimestamp']) ?></span>
            </div>
            <div class="flex justify-between pt-1 border-t border-gray-200 text-sm font-extrabold text-marana-obsidian">
              <span>Monto:</span>
              <span class="font-rubik text-emerald-700"><?= formatCOP($v['totalAmount']) ?></span>
            </div>
          </div>

          <!-- Receipt Thumbnail Preview -->
          <?php if (!empty($v['receiptThumbUrl'])): ?>
            <div class="rounded-2xl overflow-hidden border border-gray-200 bg-gray-100 aspect-video relative group">
              <img src="<?= $v['receiptThumbUrl'] ?>" alt="Comprobante" class="w-full h-full object-cover">
              <a href="<?= $v['receiptFullUrl'] ?: $v['receiptThumbUrl'] ?>" target="_blank" class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                <span class="material-symbols-outlined text-[18px]">open_in_new</span>
                <span>Ver Recibo Completo</span>
              </a>
            </div>
          <?php endif; ?>
        </div>

        <!-- Action Buttons -->
        <?php if ($v['status'] === 'pendiente'): ?>
          <div class="pt-3 border-t border-gray-100 flex items-center gap-2">
            <form method="POST" action="?action=update_voucher" class="flex-1">
              <input type="hidden" name="id" value="<?= htmlspecialchars($v['id']) ?>">
              <input type="hidden" name="status" value="aprobado">
              <button type="submit" class="w-full py-2.5 px-3 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 shadow-md shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center gap-1.5">
                <span class="material-symbols-outlined text-[16px]">check_circle</span>
                <span>Aprobar Pago</span>
              </button>
            </form>

            <form method="POST" action="?action=update_voucher">
              <input type="hidden" name="id" value="<?= htmlspecialchars($v['id']) ?>">
              <input type="hidden" name="status" value="rechazado">
              <button type="submit" class="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold transition-all" title="Rechazar Comprobante">
                <span class="material-symbols-outlined text-[18px]">cancel</span>
              </button>
            </form>
          </div>
        <?php else: ?>
          <div class="pt-2 border-t border-gray-100 text-center text-[11px] text-gray-400 font-medium">
            Procesado como <?= htmlspecialchars($v['status']) ?>
          </div>
        <?php endif; ?>

      </div>
    <?php endforeach; ?>
  </div>

</div>
