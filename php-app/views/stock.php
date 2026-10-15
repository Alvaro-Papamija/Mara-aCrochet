<?php
declare(strict_types=1);

$products = Product::getAll();
$isNewModal = isset($_GET['action']) && $_GET['action'] === 'new';
?>

<div class="space-y-6">

  <!-- Header -->
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div>
      <div class="flex items-center gap-2">
        <h1 class="font-rubik text-2xl font-bold text-marana-obsidian">Control de Stock e Inventario</h1>
        <span class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-marana-100 text-marana-700">
          <?= count($products) ?> piezas
        </span>
      </div>
      <p class="text-xs text-gray-500">Gestión de existencias, hilazas y alertas de reposición en la tabla <code class="font-mono text-marana-700">productos</code></p>
    </div>

    <div class="flex items-center gap-2">
      <a href="?action=export_stock_csv" class="px-3.5 py-2 rounded-2xl bg-white border border-gray-200 text-gray-700 font-bold text-xs hover:bg-gray-50 flex items-center gap-1.5 shadow-xs transition-all">
        <span class="material-symbols-outlined text-[16px]">download</span>
        <span>Exportar CSV</span>
      </a>

      <button onclick="document.getElementById('modal-new-product').classList.remove('hidden')" class="px-4 py-2 rounded-2xl bg-marana-700 hover:bg-marana-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-marana-700/20 active:scale-95 transition-all">
        <span class="material-symbols-outlined text-[18px]">add</span>
        <span>Nuevo Amigurumi</span>
      </button>
    </div>
  </div>

  <!-- Table Container -->
  <div class="bg-white rounded-3xl border border-marana-100 shadow-sm overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full text-left text-xs">
        <thead class="bg-marana-50/70 border-b border-marana-100 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
          <tr>
            <th class="py-3 px-4">Pieza</th>
            <th class="py-3 px-4">SKU / Tag</th>
            <th class="py-3 px-4">Hilaza & Costo</th>
            <th class="py-3 px-4">Precio COP</th>
            <th class="py-3 px-4">Margen</th>
            <th class="py-3 px-4 text-center">Stock Actual</th>
            <th class="py-3 px-4">Estado</th>
            <th class="py-3 px-4 text-right">Acción</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <?php foreach ($products as $p): ?>
            <?php 
              $margin = $p['priceCOP'] > 0 ? round((($p['priceCOP'] - $p['yarnCostCOP']) / $p['priceCOP']) * 100) : 0;
            ?>
            <tr class="hover:bg-marana-50/40 transition-colors">
              <!-- Pieza -->
              <td class="py-3.5 px-4">
                <div class="flex items-center gap-3">
                  <img 
                    src="<?= $p['imageUrl'] ?>" 
                    alt="" 
                    class="w-10 h-10 rounded-xl object-cover bg-marana-50 shrink-0 border border-gray-100"
                    onerror="this.src='https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=100&q=80'"
                  >
                  <div>
                    <span class="font-bold text-marana-obsidian block"><?= htmlspecialchars($p['name']) ?></span>
                    <span class="text-[10px] text-gray-500"><?= htmlspecialchars($p['size'] ?: '22 cm') ?></span>
                  </div>
                </div>
              </td>

              <!-- SKU -->
              <td class="py-3.5 px-4 font-mono">
                <span class="font-semibold text-gray-700 block"><?= htmlspecialchars($p['sku']) ?></span>
                <span class="text-[10px] text-marana-600 font-sans"><?= htmlspecialchars($p['tag'] ?: 'General') ?></span>
              </td>

              <!-- Hilaza y Costo -->
              <td class="py-3.5 px-4">
                <span class="text-gray-700 block text-[11px] font-medium truncate max-w-[150px]"><?= htmlspecialchars($p['supplier'] ?: 'Algodón peinado') ?></span>
                <span class="text-[10px] text-gray-500 font-mono">Costo: <?= formatCOP($p['yarnCostCOP']) ?></span>
              </td>

              <!-- Precio -->
              <td class="py-3.5 px-4 font-rubik font-extrabold text-marana-obsidian">
                <?= formatCOP($p['priceCOP']) ?>
              </td>

              <!-- Margen -->
              <td class="py-3.5 px-4">
                <span class="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  +<?= $margin ?>%
                </span>
              </td>

              <!-- Stock Modifiers -->
              <td class="py-3.5 px-4">
                <div class="flex items-center justify-center gap-1.5">
                  <form method="POST" action="?action=quick_stock">
                    <input type="hidden" name="sku" value="<?= htmlspecialchars($p['sku']) ?>">
                    <input type="hidden" name="stock" value="<?= max(0, $p['currentStock'] - 1) ?>">
                    <button type="submit" class="w-6 h-6 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold flex items-center justify-center transition-colors">
                      -
                    </button>
                  </form>

                  <span class="font-extrabold font-mono text-sm w-7 text-center <?= $p['currentStock'] <= $p['minStockAlert'] ? 'text-rose-600' : 'text-marana-obsidian' ?>">
                    <?= $p['currentStock'] ?>
                  </span>

                  <form method="POST" action="?action=quick_stock">
                    <input type="hidden" name="sku" value="<?= htmlspecialchars($p['sku']) ?>">
                    <input type="hidden" name="stock" value="<?= $p['currentStock'] + 1 ?>">
                    <button type="submit" class="w-6 h-6 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold flex items-center justify-center transition-colors">
                      +
                    </button>
                  </form>
                </div>
              </td>

              <!-- Estado -->
              <td class="py-3.5 px-4">
                <span class="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider
                  <?php
                    switch ($p['category']) {
                      case 'optimo': echo 'bg-emerald-100 text-emerald-800'; break;
                      case 'critico': echo 'bg-amber-100 text-amber-800'; break;
                      case 'agotado': echo 'bg-rose-100 text-rose-800'; break;
                      case 'pedido': echo 'bg-purple-100 text-purple-800'; break;
                      default: echo 'bg-gray-100 text-gray-800';
                    }
                  ?>">
                  <?= htmlspecialchars($p['category']) ?>
                </span>
              </td>

              <!-- Eliminar -->
              <td class="py-3.5 px-4 text-right">
                <form method="POST" action="?action=delete_product" onsubmit="return confirm('¿Seguro que deseas eliminar este producto de MySQL?');">
                  <input type="hidden" name="sku" value="<?= htmlspecialchars($p['sku']) ?>">
                  <button type="submit" class="p-1 rounded-lg hover:bg-rose-50 text-gray-400 hover:text-rose-600 transition-colors" title="Eliminar Producto">
                    <span class="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </form>
              </td>
            </tr>
          <?php endforeach; ?>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Modal: Crear Nuevo Amigurumi -->
  <div id="modal-new-product" class="fixed inset-0 z-50 <?= $isNewModal ? '' : 'hidden' ?> flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
    <div class="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[90vh]">
      <div class="bg-marana-900 text-white p-5 flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <span class="material-symbols-outlined text-amber-300">add_circle</span>
          <h3 class="font-rubik text-base font-bold">Registrar Nuevo Amigurumi en MySQL</h3>
        </div>
        <button onclick="document.getElementById('modal-new-product').classList.add('hidden')" class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white">
          <span class="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>

      <form method="POST" action="?action=create_product" class="p-6 overflow-y-auto space-y-4 text-xs">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="font-bold text-gray-700 block mb-1">SKU Código:</label>
            <input type="text" name="sku" required value="MAR-AMI-0<?= count($products) + 1 ?>" class="w-full px-3 py-2 rounded-xl border border-gray-200 font-mono">
          </div>
          <div>
            <label class="font-bold text-gray-700 block mb-1">Categoría Tag:</label>
            <input type="text" name="tag" value="Edición Especial" class="w-full px-3 py-2 rounded-xl border border-gray-200">
          </div>
        </div>

        <div>
          <label class="font-bold text-gray-700 block mb-1">Nombre de la Creación:</label>
          <input type="text" name="name" required placeholder="Ej: Amigurumi Pequeño Panda" class="w-full px-3 py-2 rounded-xl border border-gray-200">
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="font-bold text-gray-700 block mb-1">Tamaño (cm):</label>
            <input type="text" name="size" value="20 cm" class="w-full px-3 py-2 rounded-xl border border-gray-200">
          </div>
          <div>
            <label class="font-bold text-gray-700 block mb-1">Tipo de Hilaza / Fibras:</label>
            <input type="text" name="supplier" value="Hilados Huila (Algodón Orgánico)" class="w-full px-3 py-2 rounded-xl border border-gray-200">
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="font-bold text-gray-700 block mb-1">Precio Venta (COP):</label>
            <input type="number" step="1000" name="priceCOP" required value="85000" class="w-full px-3 py-2 rounded-xl border border-gray-200 font-mono font-bold">
          </div>
          <div>
            <label class="font-bold text-gray-700 block mb-1">Costo Hilaza (COP):</label>
            <input type="number" step="1000" name="yarnCostCOP" required value="22000" class="w-full px-3 py-2 rounded-xl border border-gray-200 font-mono">
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="font-bold text-gray-700 block mb-1">Stock Inicial:</label>
            <input type="number" name="currentStock" required value="3" class="w-full px-3 py-2 rounded-xl border border-gray-200 font-mono">
          </div>
          <div>
            <label class="font-bold text-gray-700 block mb-1">Alerta Stock Mínimo:</label>
            <input type="number" name="minStockAlert" required value="2" class="w-full px-3 py-2 rounded-xl border border-gray-200 font-mono">
          </div>
        </div>

        <div>
          <label class="font-bold text-gray-700 block mb-1">URL de la Fotografía:</label>
          <input type="url" name="imageUrl" value="/images/bear.jpg" class="w-full px-3 py-2 rounded-xl border border-gray-200">
        </div>

        <div class="pt-4 flex items-center justify-end gap-2 border-t border-gray-100">
          <button type="button" onclick="document.getElementById('modal-new-product').classList.add('hidden')" class="px-4 py-2 rounded-xl border border-gray-200 font-bold text-gray-600">
            Cancelar
          </button>
          <button type="submit" class="px-5 py-2 rounded-xl bg-marana-700 text-white font-bold hover:bg-marana-800 shadow-md">
            Guardar en MySQL
          </button>
        </div>
      </form>
    </div>
  </div>

</div>
