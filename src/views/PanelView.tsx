import React, { useState } from 'react';
import { TabType, ScreenType, StockProduct } from '../types';

interface PanelViewProps {
  onNavigateTab: (tab: TabType) => void;
  onOpenProductEdit: (product: StockProduct) => void;
  onShowToast: (title: string, message: string, icon?: string) => void;
  products: StockProduct[];
  onOpenDatabase?: () => void;
  isDbConnected?: boolean;
}

export const PanelView: React.FC<PanelViewProps> = ({
  onNavigateTab,
  onOpenProductEdit,
  onShowToast,
  products,
  onOpenDatabase,
  isDbConnected = false,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'week' | 'quarter'>('month');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      onShowToast(
        'Reporte Generado',
        'El balance contable de Octubre (PDF & CSV) se ha descargado.',
        'file_download_done'
      );
    }, 1200);
  };

  const featuredAmigurumi = products.find((p) => p.sku === 'MAR-AMI-01') || products[0];

  return (
    <div className="flex flex-col w-full px-4 pt-3 pb-28 max-w-md md:max-w-2xl mx-auto space-y-4">
      {/* Header & Export Control */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] uppercase tracking-wider text-[#6100a4] font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#f9bd22]"></span>
              Resumen Operativo
            </span>
            <h2 className="font-rubik text-[20px] font-bold text-[#211630] tracking-tight truncate">
              Balance General del Taller
            </h2>
          </div>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#f6e9ff] text-[#6100a4] font-bold hover:bg-[#eddcff] active:scale-95 transition-all shadow-sm"
            type="button"
          >
            <span className={`material-symbols-outlined text-[18px] text-[#6100a4] ${isExporting ? 'animate-spin' : ''}`}>
              {isExporting ? 'sync' : 'download'}
            </span>
            <span className="text-[12px]">{isExporting ? 'Generando...' : 'Exportar'}</span>
          </button>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setSelectedPeriod('month')}
            className={`shrink-0 px-4 py-1.5 rounded-full text-[12px] font-bold transition-all flex items-center gap-1.5 shadow-sm ${
              selectedPeriod === 'month'
                ? 'bg-[#7b2cbf] text-white shadow-[#7b2cbf]/25'
                : 'bg-[#f6e9ff] text-[#4c4353] hover:text-[#6100a4]'
            }`}
            type="button"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#f9bd22]"></span>
            <span>Este Mes (Octubre)</span>
          </button>
          <button
            onClick={() => setSelectedPeriod('week')}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all ${
              selectedPeriod === 'week'
                ? 'bg-[#7b2cbf] text-white shadow-[#7b2cbf]/25'
                : 'bg-[#f6e9ff] text-[#4c4353] hover:text-[#6100a4]'
            }`}
            type="button"
          >
            Últimos 7 días
          </button>
          <button
            onClick={() => setSelectedPeriod('quarter')}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all ${
              selectedPeriod === 'quarter'
                ? 'bg-[#7b2cbf] text-white shadow-[#7b2cbf]/25'
                : 'bg-[#f6e9ff] text-[#4c4353] hover:text-[#6100a4]'
            }`}
            type="button"
          >
            Trimestre
          </button>
          <button
            aria-label="Rango personalizado"
            onClick={() => onShowToast('Calendario', 'Selecciona rango de fechas personalizado', 'calendar_month')}
            className="shrink-0 w-8 h-8 rounded-full bg-[#f2e3ff] flex items-center justify-center text-[#4c4353] hover:text-[#6100a4] transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">calendar_today</span>
          </button>
        </div>

        {/* Banner de Estado XAMPP MySQL */}
        {onOpenDatabase && (
          <div
            onClick={onOpenDatabase}
            className="cursor-pointer group flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-[#240046] via-[#3c096c] to-[#5a189a] text-white shadow-md hover:shadow-lg transition-all active:scale-[0.99] border border-purple-500/20"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
                <span className="material-symbols-outlined text-[22px] text-amber-300">database</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold font-rubik tracking-wide">Base de Datos MySQL (XAMPP)</span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isDbConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                    }`}
                  ></span>
                </div>
                <p className="text-[11px] text-purple-200">
                  {isDbConnected
                    ? 'Conectada · marana_crochet (MySQL 8.0 / Apache)'
                    : 'Desconectada · Haz clic para abrir diagnóstico'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/10 group-hover:bg-white/20 text-xs font-bold transition-all">
              <span>Gestionar</span>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </div>
          </div>
        )}
      </div>

      {/* Operational Alert Banner */}
      <div className="p-3.5 rounded-2xl bg-[#faf0ff] border border-[#efdbff] shadow-sm flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-[#7b2cbf]/10 text-[#7b2cbf] flex items-center justify-center shrink-0 mt-0.5">
          <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-[14px] text-[#211630] font-bold">3 pedidos listos para empaque</p>
            <span className="w-2.5 h-2.5 rounded-full bg-[#f9bd22] ring-2 ring-[#ffdf9f] animate-pulse"></span>
          </div>
          <p className="text-[12px] text-[#4c4353] mt-0.5 leading-snug">
            Incluyen dedicatoria caligrafiada en papel de fibra natural.
          </p>
          <div className="mt-2 flex items-center gap-2">
            <button
              onClick={() => onNavigateTab('pedidos')}
              className="inline-flex items-center gap-1 text-[#6100a4] text-[12px] font-bold hover:underline"
              type="button"
            >
              <span>Revisar pendientes</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hero KPI Card: Ingresos del Mes */}
      <div className="p-4 rounded-3xl bg-white border border-[#f6e9ff] shadow-[0_6px_24px_rgba(97,0,164,0.06)] relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-[#f1dbff]/50 pointer-events-none blur-2xl"></div>
        <div className="absolute -right-2 top-2 w-16 h-16 rounded-full bg-[#ffdf9f]/30 pointer-events-none blur-xl"></div>

        <div className="flex items-center justify-between text-[#4c4353] relative z-10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#7b2cbf]"></span>
            <span className="text-[11px] uppercase tracking-wider font-extrabold text-[#6100a4]">
              Ingresos Totales Validados
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-[#efdbff] text-[#29074a] text-[11px] font-bold flex items-center gap-0.5 border border-[#d9b5ff]">
            <span className="material-symbols-outlined text-[14px] text-[#6100a4]">trending_up</span>
            +18.4%
          </span>
        </div>

        <div className="mt-2 flex items-baseline gap-2 relative z-10">
          <span className="font-rubik text-[34px] leading-tight text-[#211630] font-extrabold tracking-tight">
            $4.820.000
          </span>
          <span className="text-[12px] text-[#6100a4] font-bold bg-[#f1dbff] px-2 py-0.5 rounded-full">
            COP
          </span>
        </div>

        <div className="mt-3.5 pt-3 grid grid-cols-2 gap-2 bg-[#faf0ff] p-3 rounded-2xl border border-[#f6e9ff] relative z-10">
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1 text-[#4c4353]">
              <span className="material-symbols-outlined text-[15px] text-[#7b2cbf]">verified</span>
              <span className="text-[10px] uppercase font-bold tracking-wider truncate">
                Transferencias
              </span>
            </div>
            <span className="font-rubik text-[16px] text-[#211630] mt-0.5 font-bold truncate">
              $4.120.000
            </span>
            <span className="text-[11px] text-[#6f5092] truncate">Bancolombia / Nequi</span>
          </div>

          <div className="flex flex-col min-w-0 pl-2 border-l border-[#eddcff]">
            <div className="flex items-center gap-1 text-[#4c4353]">
              <span className="material-symbols-outlined text-[15px] text-[#f9bd22]">sparkles</span>
              <span className="text-[10px] uppercase font-bold tracking-wider truncate">
                Por Encargo
              </span>
            </div>
            <span className="font-rubik text-[16px] text-[#211630] mt-0.5 font-bold truncate">
              $700.000
            </span>
            <span className="text-[11px] text-[#6f5092] truncate">Adelanto 50%</span>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-[#4c4353] text-[13px] px-1 relative z-10">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="material-symbols-outlined text-[16px] text-[#7b2cbf]">sell</span>
            Ticket Promedio
          </span>
          <span className="font-rubik text-[15px] text-[#211630] font-bold">$185.000 COP</span>
        </div>
      </div>

      {/* Secondary Metrics Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Pedidos Summary Card */}
        <div
          onClick={() => onNavigateTab('pedidos')}
          className="p-3.5 rounded-2xl bg-white border border-[#f6e9ff] shadow-sm flex flex-col justify-between cursor-pointer hover:border-[#deb7ff] transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="w-9 h-9 rounded-xl bg-[#f6e9ff] flex items-center justify-center text-[#6100a4] shadow-xs">
              <span className="material-symbols-outlined text-[20px]">local_mall</span>
            </span>
            <span className="text-[11px] text-[#6100a4] font-bold px-2 py-0.5 rounded-full bg-[#f1dbff]">
              26 Órdenes
            </span>
          </div>
          <div className="mt-2.5">
            <span className="font-rubik text-[22px] text-[#211630] font-bold leading-none">21</span>
            <span className="text-[12px] text-[#4c4353] ml-1 font-medium">completadas</span>
          </div>
          <div className="mt-2 pt-2 flex flex-col gap-1 text-[#4c4353] text-[11px] border-t border-[#f6e9ff]">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#6f5092]"></span>En empaque
              </span>
              <span className="font-bold text-[#211630]">3</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#7b2cbf]"></span>En taller
              </span>
              <span className="font-bold text-[#211630]">2</span>
            </div>
          </div>
        </div>

        {/* Validación Comprobantes Card */}
        <div
          onClick={() => onNavigateTab('vouchers')}
          className="p-3.5 rounded-2xl bg-white border border-[#f6e9ff] shadow-sm flex flex-col justify-between cursor-pointer hover:border-[#deb7ff] transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="w-9 h-9 rounded-xl bg-[#deb7ff]/40 flex items-center justify-center text-[#6100a4] shadow-xs">
              <span className="material-symbols-outlined text-[20px]">document_scanner</span>
            </span>
            <span className="text-[11px] text-[#543d00] bg-[#ffdf9f]/70 px-2 py-0.5 rounded-full font-bold">
              97.2%
            </span>
          </div>
          <div className="mt-2.5">
            <span className="font-rubik text-[22px] text-[#211630] font-bold leading-none">18 min</span>
            <span className="text-[12px] text-[#4c4353] block font-medium mt-0.5">tiempo validación</span>
          </div>
          <div className="mt-2 pt-2 flex items-center gap-1 text-[#4c4353] text-[11px] border-t border-[#f6e9ff]">
            <span className="material-symbols-outlined text-[14px] text-[#6f5092]">schedule</span>
            <span className="truncate">Revisión manual ágil</span>
          </div>
        </div>
      </div>

      {/* Chart Section: Evolución Semanal de Ventas */}
      <div className="p-4 rounded-3xl bg-white border border-[#f6e9ff] shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-[#6100a4] font-bold">
              Comportamiento
            </span>
            <h3 className="font-rubik text-[18px] font-bold text-[#211630]">
              Evolución de Ingresos
            </h3>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-[#f6e9ff] text-[11px] text-[#4c4353] font-semibold">
            4 Semanas
          </span>
        </div>

        {/* Column Bar Chart */}
        <div className="mt-5 flex items-end justify-between h-36 gap-2.5 px-2">
          {/* Sem 1 */}
          <div className="flex-1 flex flex-col items-center h-full justify-end group">
            <span className="text-[10px] text-[#4c4353] mb-1 group-hover:text-[#6100a4] font-medium">
              $980k
            </span>
            <div className="w-full max-w-[36px] bg-[#f2e3ff] rounded-t-xl transition-all duration-300 h-[67%] hover:bg-[#deb7ff]"></div>
            <span className="text-[11px] text-[#4c4353] mt-2 font-medium">Sem 1</span>
          </div>

          {/* Sem 2 */}
          <div className="flex-1 flex flex-col items-center h-full justify-end group">
            <span className="text-[10px] text-[#4c4353] mb-1 group-hover:text-[#6100a4] font-medium">
              $1.25M
            </span>
            <div className="w-full max-w-[36px] bg-[#6f5092] rounded-t-xl transition-all duration-300 h-[86%] hover:opacity-90"></div>
            <span className="text-[11px] text-[#4c4353] mt-2 font-medium">Sem 2</span>
          </div>

          {/* Sem 3 */}
          <div className="flex-1 flex flex-col items-center h-full justify-end group">
            <span className="text-[10px] text-[#4c4353] mb-1 group-hover:text-[#6100a4] font-medium">
              $1.14M
            </span>
            <div className="w-full max-w-[36px] bg-[#f2e3ff] rounded-t-xl transition-all duration-300 h-[78%] hover:bg-[#deb7ff]"></div>
            <span className="text-[11px] text-[#4c4353] mt-2 font-medium">Sem 3</span>
          </div>

          {/* Sem 4 (Pico por lanzamiento) */}
          <div className="flex-1 flex flex-col items-center h-full justify-end group">
            <div className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#f9bd22] text-[#261a00] text-[9px] font-extrabold mb-1 shadow-xs animate-bounce">
              <span>Pico ✨</span>
            </div>
            <div className="w-full max-w-[36px] bg-gradient-to-t from-[#6100a4] to-[#7b2cbf] rounded-t-xl transition-all duration-300 h-[100%] shadow-[0_4px_12px_rgba(123,44,191,0.35)] relative">
              <div className="absolute inset-x-0 top-0 h-1.5 bg-[#deb7ff] rounded-t-xl"></div>
            </div>
            <span className="text-[11px] text-[#6100a4] font-bold mt-2">Sem 4</span>
          </div>
        </div>

        {/* Insight Footer */}
        <div className="mt-4 pt-3 flex items-center gap-2 text-[#4c4353] text-[12px] bg-[#faf0ff] p-2.5 rounded-xl border border-[#f6e9ff]">
          <span className="material-symbols-outlined text-[18px] text-[#f9bd22] shrink-0">
            workspace_premium
          </span>
          <span>
            Mayor afluencia: <strong className="text-[#211630]">Sábado 21</strong> (Lanzamiento Cápsula Algodón Orgánico).
          </span>
        </div>
      </div>

      {/* Logistics & Dispatch Performance Section */}
      <div className="p-4 rounded-3xl bg-white border border-[#f6e9ff] shadow-sm flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] uppercase tracking-wider text-[#6100a4] font-bold">
              Rendimiento Envíos
            </span>
            <h3 className="font-rubik text-[18px] font-bold text-[#211630]">
              Eficiencia de Despacho
            </h3>
          </div>
          <span className="p-2.5 rounded-xl bg-[#f6e9ff] text-[#6100a4]">
            <span className="material-symbols-outlined text-[20px]">local_shipping</span>
          </span>
        </div>

        {/* Quick Metrics Row */}
        <div className="grid grid-cols-3 gap-2 py-1">
          <div className="flex flex-col p-2.5 rounded-xl bg-[#faf0ff] border border-[#f6e9ff] text-center">
            <span className="font-rubik text-[18px] text-[#211630] font-bold">2.4h</span>
            <span className="text-[11px] text-[#4c4353] mt-0.5 leading-tight">Tiempo empaque</span>
          </div>
          <div className="flex flex-col p-2.5 rounded-xl bg-[#faf0ff] border border-[#f6e9ff] text-center">
            <span className="font-rubik text-[18px] text-[#6100a4] font-bold">96.5%</span>
            <span className="text-[11px] text-[#4c4353] mt-0.5 leading-tight">A tiempo</span>
          </div>
          <div className="flex flex-col p-2.5 rounded-xl bg-[#faf0ff] border border-[#f6e9ff] text-center">
            <span className="font-rubik text-[18px] text-[#6f5092] font-bold">8</span>
            <span className="text-[11px] text-[#4c4353] mt-0.5 leading-tight">En tránsito</span>
          </div>
        </div>

        {/* Transport Distribution Bar */}
        <div className="flex flex-col gap-2 mt-1">
          <div className="flex items-center justify-between text-[#4c4353] text-[12px] font-semibold">
            <span>Distribución por Operador</span>
            <span className="text-[#211630] font-bold">8 guías activas</span>
          </div>
          <div className="w-full h-3 rounded-full overflow-hidden flex bg-[#f2e3ff] p-0.5">
            <div className="h-full bg-[#6100a4] rounded-l-full" style={{ width: '62%' }} title="Servientrega (62%)"></div>
            <div className="h-full bg-[#6f5092]" style={{ width: '23%' }} title="Coordinadora (23%)"></div>
            <div className="h-full bg-[#dbb8ff] rounded-r-full" style={{ width: '15%' }} title="Bici-cargo (15%)"></div>
          </div>
          <div className="grid grid-cols-3 gap-1 pt-1 text-[11px] text-[#4c4353]">
            <div className="flex items-center gap-1.5 truncate">
              <span className="w-2.5 h-2.5 rounded-full bg-[#6100a4] shrink-0"></span>
              <span className="truncate">Servientrega <strong>62%</strong></span>
            </div>
            <div className="flex items-center gap-1.5 truncate">
              <span className="w-2.5 h-2.5 rounded-full bg-[#6f5092] shrink-0"></span>
              <span className="truncate">Coord. <strong>23%</strong></span>
            </div>
            <div className="flex items-center gap-1.5 truncate">
              <span className="w-2.5 h-2.5 rounded-full bg-[#dbb8ff] shrink-0"></span>
              <span className="truncate">Bici <strong>15%</strong> 🌱</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Piezas Tejidas Más Vendidas */}
      <div className="p-4 rounded-3xl bg-white border border-[#f6e9ff] shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-[#6100a4] font-bold">
              Mix de Producto
            </span>
            <h3 className="font-rubik text-[18px] font-bold text-[#211630]">
              Piezas Más Populares
            </h3>
          </div>
          <span className="text-[12px] text-[#6100a4] font-bold px-2.5 py-0.5 rounded-full bg-[#f1dbff]">
            Octubre
          </span>
        </div>

        {/* Item 1 */}
        <div
          onClick={() => onOpenProductEdit(featuredAmigurumi)}
          className="py-2.5 flex items-center gap-3 cursor-pointer hover:bg-[#faf0ff] p-1.5 rounded-2xl transition-colors"
        >
          <div className="w-14 h-16 rounded-2xl bg-[#f6e9ff] overflow-hidden shrink-0 shadow-xs relative ring-1 ring-[#f2e3ff]">
            <img
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCVrTwhfZoNiOkPC-agTmLAg_YTnWGqfCZyRp3Cuj2BEoqGNe_Pq_KIDABt9_dBsCh1EVGJvX7-ZJanY8lqPB9-6S6NrqpcQm4bIDCso7Nzngp4yMOrtsHj-xSbUd5ecsc4hKEzAye36SdBUJztlQUU0Se-QkzPbVmpmD0dnwDO4mhdeRT-TeQZzr8RAgf92AqFnc5IzS6hL04-T5siuroOhiJIlrvsk2mXLZsx3SpoYEfxGJa3F5b5eA"
              alt="Amigurumi Zorro del Bosque"
            />
            <span className="absolute bottom-1 right-1 px-1.5 rounded-full bg-[#f9bd22] text-[#261a00] text-[9px] font-bold">
              #1
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-1">
              <h4 className="text-[14px] text-[#211630] font-bold truncate">Amigurumi Zorro del Bosque</h4>
              <span className="px-2 py-0.5 rounded-full bg-[#efdbff] text-[#29074a] text-[10px] font-bold shrink-0">
                3 en stock
              </span>
            </div>
            <p className="text-[12px] text-[#4c4353]">18 unidades tejidas y vendidas</p>
            <div className="mt-1 flex items-center justify-between">
              <span className="font-rubik text-[14px] text-[#211630] font-bold">$1.530.000 COP</span>
              <span className="text-[11px] text-[#6f5092] font-semibold">Algodón Orgánico</span>
            </div>
          </div>
        </div>

        <div className="h-px bg-[#f6e9ff] my-1"></div>

        {/* Item 2 */}
        <div
          onClick={() => onNavigateTab('stock')}
          className="py-2.5 flex items-center gap-3 cursor-pointer hover:bg-[#faf0ff] p-1.5 rounded-2xl transition-colors"
        >
          <div className="w-14 h-16 rounded-2xl bg-[#f6e9ff] overflow-hidden shrink-0 shadow-xs relative ring-1 ring-[#f2e3ff]">
            <img
              className="w-full h-full object-cover"
              src="/images/bunny.jpg"
              alt="Amigurumi Conejito Orejas Largas"
            />
            <span className="absolute bottom-1 right-1 px-1.5 rounded-full bg-[#eddcff] text-[#211630] text-[9px] font-bold">
              #2
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-1">
              <h4 className="text-[14px] text-[#211630] font-bold truncate">Amigurumi Conejito Orejas Largas</h4>
              <span className="px-2 py-0.5 rounded-full bg-[#ffdad6] text-[#ba1a1a] text-[10px] font-bold shrink-0">
                Queda 1 ud
              </span>
            </div>
            <p className="text-[12px] text-[#4c4353]">14 unidades vendidas</p>
            <div className="mt-1 flex items-center justify-between">
              <span className="font-rubik text-[14px] text-[#211630] font-bold">$1.288.000 COP</span>
              <span className="text-[11px] text-[#6f5092] font-semibold">Tono Rosa & Crema</span>
            </div>
          </div>
        </div>

        <div className="h-px bg-[#f6e9ff] my-1"></div>

        {/* Item 3 */}
        <div
          onClick={() => onNavigateTab('stock')}
          className="py-2.5 flex items-center gap-3 cursor-pointer hover:bg-[#faf0ff] p-1.5 rounded-2xl transition-colors"
        >
          <div className="w-14 h-16 rounded-2xl bg-[#f6e9ff] overflow-hidden shrink-0 shadow-xs relative ring-1 ring-[#f2e3ff]">
            <img
              className="w-full h-full object-cover"
              src="/images/dino.jpg"
              alt="Amigurumi Dinosaurio Rex Bebé"
            />
            <span className="absolute bottom-1 right-1 px-1.5 rounded-full bg-[#eddcff] text-[#211630] text-[9px] font-bold">
              #3
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-1">
              <h4 className="text-[14px] text-[#211630] font-bold truncate">Amigurumi Dinosaurio Rex Bebé</h4>
              <span className="px-2 py-0.5 rounded-full bg-[#eddcff] text-[#4c4353] text-[10px] font-bold shrink-0">
                Agotado
              </span>
            </div>
            <p className="text-[12px] text-[#4c4353]">9 unidades (5 en lista de espera)</p>
            <div className="mt-1 flex items-center justify-between">
              <span className="font-rubik text-[14px] text-[#211630] font-bold">$792.000 COP</span>
              <span className="text-[11px] text-[#6100a4] font-bold">Reabrir pedido</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => onNavigateTab('stock')}
          className="mt-3 py-2.5 w-full flex items-center justify-center gap-1.5 rounded-2xl bg-[#faf0ff] border border-[#f6e9ff] text-[#6100a4] text-[12px] font-bold hover:bg-[#f6e9ff] transition-colors"
          type="button"
        >
          <span>Ver reporte completo de productos</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      </div>

      {/* Micro Craft Notes & Next Steps Footer Card */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-white via-[#faf0ff] to-[#f6e9ff] border border-[#f6e9ff] shadow-sm flex flex-col gap-3">
        <div className="flex items-center gap-2 text-[#211630]">
          <span className="material-symbols-outlined text-[20px] text-[#7b2cbf]">inventory_2</span>
          <span className="font-rubik text-[16px] font-bold">Control de Hilazas & Stock</span>
        </div>
        <p className="text-[13px] text-[#4c4353] leading-relaxed">
          Hay <strong>2 referencias principales con hilazas bajo umbral</strong> en el taller. Recomendamos preparar la reposición de madejas color teja antes del cierre semanal.
        </p>
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => onNavigateTab('stock')}
            className="flex-1 py-3 px-3 rounded-2xl bg-[#7b2cbf] hover:bg-[#6100a4] text-white text-[13px] font-bold text-center shadow-md shadow-[#7b2cbf]/20 active:scale-95 transition-all"
            type="button"
          >
            Gestionar Inventario
          </button>
          <button
            onClick={() => onShowToast('Configuración', 'Ajustes de alertas de stock y proveedores', 'tune')}
            className="py-3 px-3.5 rounded-2xl bg-[#f6e9ff] text-[#6100a4] text-[13px] flex items-center justify-center hover:bg-[#eddcff] transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">tune</span>
          </button>
        </div>
      </div>
    </div>
  );
};
