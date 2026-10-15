<?php
declare(strict_types=1);

$products = Product::getAll();
$categoryFilter = $_GET['cat'] ?? 'all';

if ($categoryFilter !== 'all') {
    $products = array_filter($products, fn($p) => ($p['category'] ?? '') === $categoryFilter || ($p['tag'] ?? '') === $categoryFilter);
}
?>

<div class="space-y-8">

  <!-- Boutique Hero Banner -->
  <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-marana-900 via-marana-800 to-marana-600 p-8 text-white shadow-xl">
    <div class="max-w-2xl space-y-3 relative z-10">
      <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-amber-300">
        <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
        Algodón Orgánico & Fibras Naturales
      </span>
      <h1 class="font-rubik text-3xl sm:text-4xl font-extrabold tracking-tight">
        Catálogo Boutique Maraña
      </h1>
      <p class="text-sm text-purple-100 leading-relaxed">
        Cada amigurumi es tejido punto por punto a mano en nuestro taller de Neiva, Huila. Piezas únicas, hipoalergénicas y con relleno ecológico siliconado.
      </p>
    </div>
  </div>

  <!-- Filter Chips -->
  <div class="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
    <a href="?page=catalog&cat=all" class="px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 <?= $categoryFilter === 'all' ? 'bg-marana-700 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-marana-100' ?>">
      Todas las Piezas
    </a>
    <a href="?page=catalog&cat=optimo" class="px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 <?= $categoryFilter === 'optimo' ? 'bg-marana-700 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-marana-100' ?>">
      En Stock Inmediato
    </a>
    <a href="?page=catalog&cat=pedido" class="px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 <?= $categoryFilter === 'pedido' ? 'bg-marana-700 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-marana-100' ?>">
      Bajo Pedido Personalizado
    </a>
    <a href="?page=catalog&cat=critico" class="px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 <?= $categoryFilter === 'critico' ? 'bg-marana-700 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-marana-100' ?>">
      Últimas Unidades
    </a>
  </div>

  <!-- Products Grid -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    <?php foreach ($products as $prod): ?>
      <div class="group bg-white rounded-3xl border border-marana-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between">
        
        <!-- Image Container -->
        <div class="relative aspect-square overflow-hidden bg-marana-50">
          <img 
            src="<?= $prod['imageUrl'] ?>" 
            alt="<?= htmlspecialchars($prod['name']) ?>"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onerror="this.src='https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=600&q=80'"
          >

          <!-- Badges -->
          <div class="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
            <span class="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/95 text-marana-900 shadow-xs backdrop-blur-xs">
              <?= htmlspecialchars($prod['tag'] ?: 'Artesanal') ?>
            </span>
          </div>

          <div class="absolute top-3 right-3">
            <span class="px-2.5 py-1 rounded-full text-[10px] font-bold shadow-xs backdrop-blur-xs
              <?= $prod['currentStock'] > 0 ? 'bg-emerald-500 text-white' : ($prod['category'] === 'pedido' ? 'bg-purple-600 text-white' : 'bg-rose-500 text-white') ?>">
              <?= $prod['currentStock'] > 0 ? $prod['currentStock'] . ' disponibles' : ($prod['category'] === 'pedido' ? 'Bajo Pedido' : 'Agotado') ?>
            </span>
          </div>
        </div>

        <!-- Info Card Body -->
        <div class="p-5 flex-1 flex flex-col justify-between space-y-4">
          <div class="space-y-1.5">
            <div class="flex items-center justify-between text-[11px] text-gray-500">
              <span class="font-mono"><?= htmlspecialchars($prod['sku']) ?></span>
              <span class="font-medium"><?= htmlspecialchars($prod['size'] ?: '22 cm') ?></span>
            </div>
            <h3 class="font-rubik text-base font-bold text-marana-obsidian group-hover:text-marana-700 transition-colors line-clamp-1">
              <?= htmlspecialchars($prod['name']) ?>
            </h3>
            <p class="text-xs text-gray-500 line-clamp-2 leading-relaxed">
              <?= htmlspecialchars($prod['supplier'] ?: 'Hilado de algodón peinado con textura suave.') ?>
            </p>
          </div>

          <div class="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
            <div>
              <span class="text-[10px] uppercase font-bold text-gray-400 block leading-tight">Precio Taller</span>
              <span class="font-rubik text-lg font-extrabold text-marana-obsidian">
                <?= formatCOP($prod['priceCOP']) ?>
              </span>
            </div>

            <!-- Add to Cart Form -->
            <form method="POST" action="?action=add_cart">
              <input type="hidden" name="sku" value="<?= htmlspecialchars($prod['sku']) ?>">
              <input type="hidden" name="name" value="<?= htmlspecialchars($prod['name']) ?>">
              <input type="hidden" name="price" value="<?= $prod['priceCOP'] ?>">
              <input type="hidden" name="size" value="<?= htmlspecialchars($prod['size']) ?>">
              <input type="hidden" name="imageUrl" value="<?= htmlspecialchars($prod['imageUrl']) ?>">
              <button 
                type="submit" 
                class="p-2.5 rounded-2xl bg-marana-700 hover:bg-marana-800 text-white font-bold active:scale-90 transition-all shadow-md shadow-marana-700/25 flex items-center justify-center"
                title="Añadir a la Bolsa de Compras"
              >
                <span class="material-symbols-outlined text-[20px]">add_shopping_cart</span>
              </button>
            </form>
          </div>
        </div>

      </div>
    <?php endforeach; ?>
  </div>

  <!-- Bottom Floating Cart Prompt if has items -->
  <?php if ($cartItemsCount > 0): ?>
    <div class="sticky bottom-6 z-30 flex justify-center">
      <a href="?page=cart" class="flex items-center gap-3 px-6 py-3.5 rounded-full bg-marana-900 text-white shadow-2xl hover:bg-marana-800 transition-all active:scale-95 border border-purple-500/30">
        <div class="w-7 h-7 rounded-full bg-amber-400 text-marana-obsidian font-black text-xs flex items-center justify-center">
          <?= $cartItemsCount ?>
        </div>
        <span class="font-bold text-sm">Ver Bolsa de Compras & Checkout</span>
        <span class="material-symbols-outlined text-[20px]">arrow_forward</span>
      </a>
    </div>
  <?php endif; ?>

</div>
