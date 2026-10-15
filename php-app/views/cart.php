<?php
declare(strict_types=1);

$cart = $_SESSION['cart'] ?? [];
$subtotal = 0;
foreach ($cart as $item) {
    $subtotal += ($item['price'] * $item['quantity']);
}
$shippingCost = $subtotal > 0 ? 14000 : 0;
$total = $subtotal + $shippingCost;
$user = currentUser();
?>

<div class="max-w-4xl mx-auto space-y-8">

  <div class="flex items-center justify-between border-b border-gray-200 pb-4">
    <div>
      <h1 class="font-rubik text-2xl font-bold text-marana-obsidian">Bolsa de Compras</h1>
      <p class="text-xs text-gray-500">Revisa tus piezas artesanales seleccionadas antes de finalizar tu orden</p>
    </div>
    <a href="?page=catalog" class="text-xs font-bold text-marana-600 hover:text-marana-800 flex items-center gap-1">
      <span class="material-symbols-outlined text-[16px]">arrow_back</span>
      <span>Seguir Explorando</span>
    </a>
  </div>

  <?php if (empty($cart)): ?>
    <div class="p-12 text-center rounded-3xl bg-white border border-marana-100 shadow-sm space-y-4">
      <div class="w-16 h-16 rounded-full bg-marana-100 text-marana-600 flex items-center justify-center mx-auto">
        <span class="material-symbols-outlined text-[32px]">shopping_basket</span>
      </div>
      <h2 class="font-rubik text-lg font-bold text-marana-obsidian">Tu bolsa de compras está vacía</h2>
      <p class="text-xs text-gray-500 max-w-sm mx-auto">
        Explora nuestras creaciones en crochet tejidas a mano y añade tus piezas favoritas.
      </p>
      <a href="?page=catalog" class="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-marana-700 text-white font-bold text-xs hover:bg-marana-800 transition-all shadow-md shadow-marana-700/20">
        <span>Ir a la Boutique</span>
        <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
      </a>
    </div>
  <?php else: ?>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <!-- Cart Items List (2 Columns) -->
      <div class="lg:col-span-2 space-y-4">
        <div class="bg-white rounded-3xl border border-marana-100 shadow-sm divide-y divide-gray-100 overflow-hidden">
          <?php foreach ($cart as $sku => $item): ?>
            <div class="p-4 sm:p-5 flex items-center gap-4">
              <img 
                src="<?= $item['imageUrl'] ?>" 
                alt="<?= htmlspecialchars($item['name']) ?>" 
                class="w-16 h-16 rounded-2xl object-cover bg-marana-50 shrink-0"
                onerror="this.src='https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=200&q=80'"
              >

              <div class="flex-1 min-w-0">
                <h3 class="font-bold text-sm text-marana-obsidian truncate"><?= htmlspecialchars($item['name']) ?></h3>
                <span class="text-xs text-gray-500 block"><?= htmlspecialchars($item['size'] ?: '22 cm') ?> · Algodón Orgánico</span>
                <span class="font-rubik text-xs font-bold text-marana-700 mt-1 block"><?= formatCOP($item['price']) ?></span>
              </div>

              <!-- Quantity Controls -->
              <div class="flex items-center gap-2">
                <form method="POST" action="?action=update_cart_qty">
                  <input type="hidden" name="sku" value="<?= htmlspecialchars($sku) ?>">
                  <input type="hidden" name="delta" value="-1">
                  <button type="submit" class="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold flex items-center justify-center transition-colors">
                    -
                  </button>
                </form>

                <span class="font-bold text-xs w-6 text-center"><?= $item['quantity'] ?></span>

                <form method="POST" action="?action=update_cart_qty">
                  <input type="hidden" name="sku" value="<?= htmlspecialchars($sku) ?>">
                  <input type="hidden" name="delta" value="1">
                  <button type="submit" class="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold flex items-center justify-center transition-colors">
                    +
                  </button>
                </form>
              </div>

              <!-- Delete Button -->
              <form method="POST" action="?action=remove_cart">
                <input type="hidden" name="sku" value="<?= htmlspecialchars($sku) ?>">
                <button type="submit" class="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 transition-colors" title="Eliminar">
                  <span class="material-symbols-outlined text-[20px]">delete</span>
                </button>
              </form>
            </div>
          <?php endforeach; ?>
        </div>

        <!-- Transfer Account Info Box -->
        <div class="p-5 rounded-3xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/70 text-amber-950 space-y-2">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-amber-600 text-[20px]">account_balance_wallet</span>
            <span class="font-bold text-xs uppercase tracking-wider">Cuentas Oficiales para Transferencia (Colombia)</span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
            <div class="p-2.5 rounded-xl bg-white/80 border border-amber-200/50">
              <strong class="block text-marana-obsidian">Bancolombia Ahorros</strong>
              <span class="font-mono text-[11px] text-gray-600">912-384729-10</span>
            </div>
            <div class="p-2.5 rounded-xl bg-white/80 border border-amber-200/50">
              <strong class="block text-marana-obsidian">Nequi Móvil</strong>
              <span class="font-mono text-[11px] text-gray-600">312 849 2019</span>
            </div>
            <div class="p-2.5 rounded-xl bg-white/80 border border-amber-200/50">
              <strong class="block text-marana-obsidian">Daviplata</strong>
              <span class="font-mono text-[11px] text-gray-600">312 849 2019</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Checkout & Summary Card (1 Column) -->
      <div class="space-y-4">
        <div class="p-6 rounded-3xl bg-white border border-marana-100 shadow-sm space-y-5">
          <h2 class="font-rubik text-base font-bold text-marana-obsidian">Resumen de Compra</h2>

          <div class="space-y-2.5 text-xs text-gray-600 pb-4 border-b border-gray-100">
            <div class="flex justify-between">
              <span>Subtotal piezas:</span>
              <span class="font-semibold text-marana-obsidian"><?= formatCOP($subtotal) ?></span>
            </div>
            <div class="flex justify-between">
              <span>Envío Servientrega Nacional:</span>
              <span class="font-semibold text-marana-obsidian"><?= formatCOP($shippingCost) ?></span>
            </div>
            <div class="flex justify-between text-sm font-extrabold text-marana-obsidian pt-2 border-t border-gray-100">
              <span>Total a Transferir:</span>
              <span class="font-rubik text-base text-marana-700"><?= formatCOP($total) ?></span>
            </div>
          </div>

          <!-- Checkout Form -->
          <form method="POST" action="?action=checkout" class="space-y-3.5">
            <input type="hidden" name="totalAmount" value="<?= $total ?>">
            <input type="hidden" name="shippingCost" value="<?= $shippingCost ?>">

            <div>
              <label class="text-[11px] font-bold text-gray-600 block mb-1">Nombre Completo:</label>
              <input type="text" name="customerName" required value="<?= htmlspecialchars($user['name'] ?? 'Sofia Restrepo') ?>" class="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-marana-500">
            </div>

            <div>
              <label class="text-[11px] font-bold text-gray-600 block mb-1">Teléfono Móvil (WhatsApp):</label>
              <input type="text" name="customerPhone" required value="<?= htmlspecialchars($user['phone'] ?? '+57 318 692 8410') ?>" class="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-marana-500">
            </div>

            <div>
              <label class="text-[11px] font-bold text-gray-600 block mb-1">Ciudad & Dirección de Envío:</label>
              <input type="text" name="customerAddress" required value="Calle 14 # 6-32, Neiva, Huila" class="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-marana-500">
            </div>

            <div>
              <label class="text-[11px] font-bold text-gray-600 block mb-1">Método de Transferencia:</label>
              <select name="paymentMethod" class="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-marana-500 bg-white">
                <option value="Bancolombia Transfer">Bancolombia Transferencia</option>
                <option value="Nequi Móvil">Nequi Móvil</option>
                <option value="Daviplata App">Daviplata App</option>
              </select>
            </div>

            <div>
              <label class="text-[11px] font-bold text-gray-600 block mb-1">Código de Aprobación / Comprobante:</label>
              <input type="text" name="approvalCode" placeholder="Ej: 849201" value="<?= rand(100000, 999999) ?>" class="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-marana-500 font-mono">
            </div>

            <div>
              <label class="text-[11px] font-bold text-gray-600 block mb-1">Nota Especial / Dedicatoria:</label>
              <textarea name="specialNote" rows="2" placeholder="Dedicatoria caligrafiada para regalo..." class="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-marana-500"></textarea>
            </div>

            <button type="submit" class="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-marana-700 to-marana-900 text-white font-bold text-xs hover:from-marana-800 hover:to-marana-950 active:scale-95 transition-all shadow-lg shadow-marana-800/25 flex items-center justify-center gap-2">
              <span class="material-symbols-outlined text-[18px]">verified</span>
              <span>Confirmar Pedido & Registrar en MySQL</span>
            </button>
          </form>

        </div>
      </div>

    </div>

  <?php endif; ?>

</div>
