<?php
declare(strict_types=1);
?>

<div class="max-w-4xl mx-auto space-y-6">

  <!-- Header -->
  <div class="p-6 rounded-3xl bg-gradient-to-r from-marana-900 to-marana-700 text-white space-y-2 shadow-lg">
    <div class="flex items-center gap-2 text-xs font-bold text-amber-300">
      <span class="material-symbols-outlined text-[18px]">terminal</span>
      <span>Documentación & Consola Interactiva</span>
    </div>
    <h1 class="font-rubik text-2xl font-bold">API RESTful en PHP & MySQL</h1>
    <p class="text-xs text-purple-200">
      Endpoints construidos con PHP 8.2 nativo, soporte CORS completo y respuestas JSON para integración con React, Vue, aplicaciones móviles o microservicios.
    </p>
  </div>

  <!-- Endpoints List -->
  <div class="space-y-4 text-xs">
    
    <!-- Health Check -->
    <div class="p-5 rounded-3xl bg-white border border-marana-100 shadow-sm space-y-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold font-mono text-[11px]">GET</span>
          <code class="font-mono font-bold text-marana-obsidian text-sm">/marana/api.php?endpoint=test</code>
        </div>
        <button onclick="testApi('test')" class="px-3.5 py-1.5 rounded-xl bg-marana-700 text-white font-bold hover:bg-marana-800 transition-all flex items-center gap-1 shadow-xs">
          <span class="material-symbols-outlined text-[14px]">play_arrow</span>
          <span>Probar en Vivo</span>
        </button>
      </div>
      <p class="text-gray-500">Comprueba el estado del servidor Apache, PHP 8.2 y las tablas en MySQL <code class="font-mono text-marana-700">marana_crochet</code>.</p>
    </div>

    <!-- Products GET -->
    <div class="p-5 rounded-3xl bg-white border border-marana-100 shadow-sm space-y-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold font-mono text-[11px]">GET</span>
          <code class="font-mono font-bold text-marana-obsidian text-sm">/marana/api.php?endpoint=products</code>
        </div>
        <button onclick="testApi('products')" class="px-3.5 py-1.5 rounded-xl bg-marana-700 text-white font-bold hover:bg-marana-800 transition-all flex items-center gap-1 shadow-xs">
          <span class="material-symbols-outlined text-[14px]">play_arrow</span>
          <span>Probar en Vivo</span>
        </button>
      </div>
      <p class="text-gray-500">Retorna la colección completa de amigurumis, inventario actual, precios COP y estado de stock.</p>
    </div>

    <!-- Orders GET -->
    <div class="p-5 rounded-3xl bg-white border border-marana-100 shadow-sm space-y-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold font-mono text-[11px]">GET</span>
          <code class="font-mono font-bold text-marana-obsidian text-sm">/marana/api.php?endpoint=orders</code>
        </div>
        <button onclick="testApi('orders')" class="px-3.5 py-1.5 rounded-xl bg-marana-700 text-white font-bold hover:bg-marana-800 transition-all flex items-center gap-1 shadow-xs">
          <span class="material-symbols-outlined text-[14px]">play_arrow</span>
          <span>Probar en Vivo</span>
        </button>
      </div>
      <p class="text-gray-500">Retorna todos los pedidos registrados en MySQL incluyendo sus artículos relacionados (<code class="font-mono text-marana-700">pedido_items</code>).</p>
    </div>

    <!-- Vouchers GET -->
    <div class="p-5 rounded-3xl bg-white border border-marana-100 shadow-sm space-y-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold font-mono text-[11px]">GET</span>
          <code class="font-mono font-bold text-marana-obsidian text-sm">/marana/api.php?endpoint=vouchers</code>
        </div>
        <button onclick="testApi('vouchers')" class="px-3.5 py-1.5 rounded-xl bg-marana-700 text-white font-bold hover:bg-marana-800 transition-all flex items-center gap-1 shadow-xs">
          <span class="material-symbols-outlined text-[14px]">play_arrow</span>
          <span>Probar en Vivo</span>
        </button>
      </div>
      <p class="text-gray-500">Retorna la cola de comprobantes de pago transferidos por las clientas.</p>
    </div>

  </div>

  <!-- Interactive JSON Response Window -->
  <div class="p-5 rounded-3xl bg-marana-900 text-white shadow-xl space-y-3">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="w-3 h-3 rounded-full bg-rose-500"></span>
        <span class="w-3 h-3 rounded-full bg-amber-500"></span>
        <span class="w-3 h-3 rounded-full bg-emerald-500"></span>
        <span class="text-xs font-mono text-purple-200 ml-2">Respuesta JSON en Tiempo Real</span>
      </div>
      <span id="api-status" class="text-[10px] font-mono text-emerald-400 font-bold">Listo para probar</span>
    </div>

    <pre id="api-output" class="p-4 rounded-2xl bg-black/50 text-emerald-300 font-mono text-xs overflow-x-auto max-h-72">
// Haz clic en "Probar en Vivo" en cualquiera de los endpoints para consultar MySQL...
    </pre>
  </div>

</div>

<script>
async function testApi(endpoint) {
  const output = document.getElementById('api-output');
  const status = document.getElementById('api-status');
  status.textContent = 'Consultando MySQL en XAMPP...';
  output.textContent = '// Cargando...';

  try {
    const res = await fetch('api.php?endpoint=' + endpoint);
    const json = await res.json();
    status.textContent = 'HTTP ' + res.status + ' OK';
    output.textContent = JSON.stringify(json, null, 2);
  } catch (err) {
    status.textContent = 'Error de conexión';
    output.textContent = '// Error: ' + err.message;
  }
}
</script>
