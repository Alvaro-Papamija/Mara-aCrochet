<?php
declare(strict_types=1);
?>
  </main>

  <!-- Global Footer -->
  <footer class="bg-white border-t border-marana-100 mt-auto py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 rounded-lg bg-marana-700 text-white flex items-center justify-center font-bold text-[11px]">
            M
          </div>
          <span class="font-bold text-marana-obsidian"><?= APP_NAME ?></span>
          <span>&copy; <?= date('Y') ?> · Todos los derechos reservados.</span>
        </div>

        <div class="flex items-center gap-4 text-[11px]">
          <span class="inline-flex items-center gap-1 font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            PHP <?= PHP_VERSION ?> · Apache 2.4 · MySQL 8.0
          </span>
          <a href="http://localhost/phpmyadmin/index.php?route=/database/structure&db=marana_crochet" target="_blank" class="text-marana-600 hover:text-marana-800 font-bold hover:underline">
            phpMyAdmin
          </a>
          <a href="?page=api_docs" class="text-marana-600 hover:text-marana-800 font-bold hover:underline">
            API REST
          </a>
        </div>
      </div>
    </div>
  </footer>

</body>
</html>
