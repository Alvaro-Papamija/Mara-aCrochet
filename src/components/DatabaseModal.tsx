import React, { useState } from 'react';
import { DbStatusInfo, checkDbHealth } from '../services/apiService';

interface DatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  statusInfo: DbStatusInfo;
  onRefresh: () => Promise<void>;
  onShowToast: (title: string, message: string, icon?: string) => void;
}

export const DatabaseModal: React.FC<DatabaseModalProps> = ({
  isOpen,
  onClose,
  statusInfo,
  onRefresh,
  onShowToast,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setIsRefreshing(false);
    onShowToast(
      statusInfo.connected ? 'Conexión Exitosa' : 'Sin Conexión',
      statusInfo.connected
        ? `MySQL conectado correctamente a la base de datos ${statusInfo.database}`
        : 'Verifica que Apache y MySQL en XAMPP estén encendidos',
      statusInfo.connected ? 'database' : 'error'
    );
  };

  const handleOpenPhpMyAdmin = () => {
    window.open('http://localhost/phpmyadmin/index.php?route=/database/structure&db=marana_crochet', '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#f3e5f5] flex flex-col max-h-[90vh]">
        {/* Header Modal */}
        <div className="relative bg-gradient-to-r from-[#4a148c] via-[#6a1b9a] to-[#7b1fa2] p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                <span className="material-symbols-outlined text-[24px] text-amber-300">
                  database
                </span>
              </div>
              <div>
                <span className="text-[10px] tracking-widest font-black uppercase text-amber-300/90 block">
                  XAMPP + MySQL Integration
                </span>
                <h3 className="font-rubik text-xl font-bold tracking-tight">
                  Estado de la Base de Datos
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all active:scale-90"
              aria-label="Cerrar modal"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Quick status pill */}
          <div className="mt-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 w-fit">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                statusInfo.connected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
              }`}
            />
            <span className="text-xs font-semibold">
              {statusInfo.connected
                ? `Conectado a MySQL: ${statusInfo.database}`
                : 'Desconectado del servidor local'}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-[#211630]">
          {/* Main Info Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-[#faf5ff] border border-[#f3e8ff]">
              <span className="text-[11px] font-bold text-[#6b21a8] uppercase block">
                Base de Datos
              </span>
              <span className="text-sm font-extrabold text-[#211630] font-mono">
                {statusInfo.database}
              </span>
              <span className="text-[11px] text-emerald-600 block mt-0.5 font-medium">
                ● utf8mb4_unicode_ci
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#faf5ff] border border-[#f3e8ff]">
              <span className="text-[11px] font-bold text-[#6b21a8] uppercase block">
                Servidor Web
              </span>
              <span className="text-sm font-extrabold text-[#211630] truncate block">
                {statusInfo.server || 'Apache (XAMPP)'}
              </span>
              <span className="text-[11px] text-[#6b21a8] block mt-0.5">
                PHP {statusInfo.phpVersion || '8.2'} · MySQL {statusInfo.mysqlVersion || '8.0'}
              </span>
            </div>
          </div>

          {/* Tables summary */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#4c4353]">
                Tablas Sincronizadas
              </h4>
              <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                100% Sincronizado
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {statusInfo.tables && Object.keys(statusInfo.tables).length > 0 ? (
                Object.entries(statusInfo.tables).map(([tbl, count]) => (
                  <div
                    key={tbl}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#fdf8ff] border border-[#f1defa]"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="material-symbols-outlined text-[16px] text-[#7b2cbf]">
                        table_chart
                      </span>
                      <span className="font-semibold text-[#211630] truncate">{tbl}</span>
                    </div>
                    <span className="font-bold font-mono px-2 py-0.5 rounded-md bg-[#f4ebf8] text-[#6100a4]">
                      {count} {count === 1 ? 'fila' : 'filas'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="col-span-2 p-3 text-center text-xs text-[#735751] bg-[#fdf8ff] rounded-xl">
                  Sin estadísticas de tablas disponibles
                </div>
              )}
            </div>
          </div>

          {/* Direct Actions */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleOpenPhpMyAdmin}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#ff9800] text-white font-bold text-xs hover:bg-[#f57c00] active:scale-95 transition-all shadow-md shadow-orange-500/20"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">open_in_new</span>
              <span>Abrir en phpMyAdmin</span>
            </button>

            <button
              onClick={handleTestConnection}
              disabled={isRefreshing}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#6100a4] text-white font-bold text-xs hover:bg-[#4a007e] active:scale-95 transition-all shadow-md shadow-purple-900/20"
              type="button"
            >
              <span
                className={`material-symbols-outlined text-[18px] ${
                  isRefreshing ? 'animate-spin' : ''
                }`}
              >
                sync
              </span>
              <span>{isRefreshing ? 'Comprobando...' : 'Probar Conexión'}</span>
            </button>
          </div>

          {/* Quick Info Box */}
          <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/60 text-amber-900 text-[11px] leading-relaxed flex items-start gap-2.5">
            <span className="material-symbols-outlined text-amber-600 text-[18px] shrink-0 mt-0.5">
              info
            </span>
            <div>
              <p className="font-bold">Información de Conexión XAMPP:</p>
              <p className="text-amber-800">
                El proyecto interactúa directamente con la base de datos{' '}
                <code className="font-mono font-bold">marana_crochet</code> a través de la API
                PHP configurada en <code className="font-mono font-bold">C:\xampp\htdocs\marana-api</code>. Cualquier cambio en stock, pedidos o comprobantes se guarda automáticamente en MySQL.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#faf5ff] border-t border-[#f3e8ff] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white border border-[#e5d4ed] font-bold text-xs text-[#4c4353] hover:bg-[#f6e9ff] transition-all"
            type="button"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
