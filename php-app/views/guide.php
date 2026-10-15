<?php
declare(strict_types=1);

$orderId = $_GET['id'] ?? '';
$order = Order::getById($orderId);

if (!$order) {
    echo "<div class='p-8 text-center text-sm text-rose-600'>Pedido no encontrado. <a href='?page=orders' class='underline'>Volver a pedidos</a></div>";
    return;
}
?>

<div class="max-w-2xl mx-auto space-y-4">
  
  <!-- Screen Navigation Controls (Hidden when printing) -->
  <div class="flex items-center justify-between print:hidden pb-2">
    <a href="?page=orders" class="text-xs font-bold text-marana-600 hover:text-marana-800 flex items-center gap-1">
      <span class="material-symbols-outlined text-[16px]">arrow_back</span>
      <span>Volver a Pedidos</span>
    </a>

    <button onclick="window.print()" class="px-5 py-2.5 rounded-2xl bg-marana-700 hover:bg-marana-800 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all active:scale-95">
      <span class="material-symbols-outlined text-[18px]">print</span>
      <span>Imprimir Guía de Taller</span>
    </button>
  </div>

  <!-- Printable Shipping Slip / Invoice Card -->
  <div class="bg-white rounded-3xl p-8 border border-gray-200 shadow-lg text-marana-obsidian space-y-6 print:border-none print:shadow-none print:p-0">
    
    <!-- Top Header -->
    <div class="flex items-start justify-between border-b-2 border-dashed border-gray-200 pb-5">
      <div>
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-xl bg-marana-900 text-white font-extrabold flex items-center justify-center text-sm">
            M
          </div>
          <span class="font-rubik text-xl font-bold tracking-tight">Maraña Crochet Atelier</span>
        </div>
        <p class="text-[11px] text-gray-500 mt-1">
          Guía de Despacho & Control de Embalaje Artesanal<br>
          Sede Principal: Carrera 5 # 12-34 · Neiva, Huila · Cel: +57 300 456 7890
        </p>
      </div>

      <div class="text-right">
        <span class="text-[10px] uppercase font-bold text-gray-400 block">Orden de Envío</span>
        <span class="font-mono text-lg font-extrabold text-marana-700">#<?= htmlspecialchars($order['id']) ?></span>
        <span class="text-[10px] text-gray-500 block"><?= htmlspecialchars($order['date']) ?></span>
      </div>
    </div>

    <!-- Sender & Recipient Columns -->
    <div class="grid grid-cols-2 gap-6 text-xs bg-gray-50 p-4 rounded-2xl border border-gray-100">
      <div class="space-y-1">
        <span class="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Remitente</span>
        <p class="font-bold text-marana-obsidian">Taller Maraña Neiva</p>
        <p class="text-gray-600">Lucía Montoya (Fundadora)</p>
        <p class="text-gray-600">Neiva, Huila · Colombia</p>
        <p class="text-gray-600">WhatsApp: +57 300 456 7890</p>
      </div>

      <div class="space-y-1 border-l border-gray-200 pl-6">
        <span class="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Destinataria</span>
        <p class="font-bold text-marana-obsidian text-sm"><?= htmlspecialchars($order['customerName']) ?></p>
        <p class="text-gray-600"><?= htmlspecialchars($order['customerPhone']) ?></p>
        <p class="text-gray-600"><strong>Dirección:</strong> <?= htmlspecialchars($order['customerAddress'] ?: 'Dirección registrada') ?></p>
        <p class="text-gray-600"><strong>Ciudad:</strong> <?= htmlspecialchars($order['customerLocation']) ?></p>
      </div>
    </div>

    <!-- Carrier & Tracking barcode box -->
    <div class="p-4 rounded-2xl bg-marana-50/60 border border-marana-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <span class="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Operador Logístico</span>
        <span class="font-bold text-sm text-marana-obsidian"><?= htmlspecialchars($order['carrier']) ?></span>
        <p class="text-[11px] text-gray-500 font-mono mt-0.5">Guía Nacional: <?= htmlspecialchars($order['trackingNumber'] ?: 'PENDIENTE') ?></p>
      </div>

      <!-- Simulated Barcode -->
      <div class="text-center font-mono">
        <div class="tracking-[6px] text-2xl font-black text-gray-800 select-none">
          ||| | |||| | || |||| |
        </div>
        <span class="text-[10px] text-gray-500 tracking-widest"><?= htmlspecialchars($order['trackingNumber'] ?: $order['id']) ?></span>
      </div>
    </div>

    <!-- Items Table -->
    <div class="space-y-2">
      <span class="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Contenido del Paquete Protegido</span>
      <table class="w-full text-xs text-left border-collapse">
        <thead>
          <tr class="border-b border-gray-200 text-gray-400 font-bold uppercase text-[10px]">
            <th class="py-2">Cant</th>
            <th class="py-2">Descripción de la Pieza</th>
            <th class="py-2">Especificaciones</th>
            <th class="py-2 text-right">Valor</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <?php $sub = 0; foreach ($order['items'] as $it): $sub += ($it['price'] * $it['quantity']); ?>
            <tr>
              <td class="py-2.5 font-bold font-mono"><?= $it['quantity'] ?></td>
              <td class="py-2.5 font-semibold text-gray-800"><?= htmlspecialchars($it['name']) ?></td>
              <td class="py-2.5 text-gray-500 text-[11px]"><?= htmlspecialchars($it['specs']) ?></td>
              <td class="py-2.5 text-right font-mono font-bold"><?= formatCOP($it['price'] * $it['quantity']) ?></td>
            </tr>
          <?php endforeach; ?>
        </tbody>
        <tfoot class="border-t border-gray-200">
          <tr>
            <td colspan="3" class="py-2 font-bold text-right text-gray-500">Envío Asegurado:</td>
            <td class="py-2 text-right font-mono font-bold"><?= formatCOP($order['shippingCost']) ?></td>
          </tr>
          <tr class="font-extrabold text-sm text-marana-obsidian border-t border-gray-300">
            <td colspan="3" class="py-2 text-right">Total Declarado:</td>
            <td class="py-2 text-right font-rubik text-marana-700"><?= formatCOP($sub + $order['shippingCost']) ?></td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- Notes & Artisan Seal -->
    <div class="border-t border-dashed border-gray-200 pt-4 flex items-center justify-between text-xs text-gray-500">
      <div class="max-w-xs space-y-1">
        <p class="font-bold text-marana-obsidian">Instrucciones de Embalaje:</p>
        <p class="text-[11px] leading-relaxed">
          Envolver en papel seda con ramita de lavanda. Sello artesanal de lacre morado Maraña intacto.
        </p>
      </div>

      <div class="text-right">
        <div class="w-16 h-16 rounded-full border-2 border-dashed border-marana-400 flex items-center justify-center text-center p-1 text-[9px] text-marana-700 font-extrabold uppercase leading-tight ml-auto">
          Taller Maraña Neiva
        </div>
      </div>
    </div>

  </div>

</div>
