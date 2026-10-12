import React, { useState } from 'react';
import { StockProduct } from '../types';

interface StockViewProps {
  products: StockProduct[];
  onOpenProductEdit: (product: StockProduct) => void;
  onUpdateStockQty: (sku: string, newQty: number) => void;
  onShowToast: (title: string, message: string, icon?: string) => void;
}

export const StockView: React.FC<StockViewProps> = ({
  products,
  onOpenProductEdit,
  onUpdateStockQty,
  onShowToast,
}) => {
  const [filterCategory, setFilterCategory] = useState<'todos' | 'critico' | 'agotado' | 'pedido'>('todos');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = products.filter((item) => {
    const matchesFilter = filterCategory === 'todos' || item.category === filterCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleIncrement = (product: StockProduct) => {
    const newQty = product.currentStock + 1;
    onUpdateStockQty(product.sku, newQty);
    onShowToast('Stock Actualizado', `${product.name}: ${newQty} unidades en bodega`, 'add_circle');
  };

  const handleDecrement = (product: StockProduct) => {
    if (product.currentStock > 0) {
      const newQty = product.currentStock - 1;
      onUpdateStockQty(product.sku, newQty);
      onShowToast('Stock Ajustado', `${product.name}: ${newQty} unidades restantes`, 'remove_circle');
    }
  };

  return (
    <div className="flex flex-col w-full px-4 pt-3 pb-28 max-w-md md:max-w-2xl mx-auto space-y-4">
      {/* Urgent Alert Banner */}
      <div className="bg-gradient-to-r from-[#f1dbff]/90 via-[#f2e3ff] to-[#efdbff]/80 rounded-3xl p-4 shadow-sm border border-[#deb7ff] flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-[#6100a4] flex items-center justify-center text-white shrink-0 shadow-md shadow-[#6100a4]/25">
          <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            warning
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[11px] text-[#6100a4] font-extrabold uppercase tracking-wider block">
            Atención de Taller
          </span>
          <p className="text-[14px] text-[#211630] font-bold leading-tight mt-0.5">
            2 productos en nivel crítico de stock (≤ 2 unidades)
          </p>
          <div className="mt-2.5 flex items-center gap-3">
            <button
              onClick={() => setFilterCategory('critico')}
              className="px-3.5 py-1.5 rounded-xl bg-[#6100a4] text-white text-[12px] font-bold shadow-md shadow-[#6100a4]/20 active:scale-95 transition-all flex items-center gap-1"
              type="button"
            >
              <span>Ver críticos</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
            <span className="text-[12px] text-[#6f5092] font-semibold">Revisar hilados</span>
          </div>
        </div>
      </div>

      {/* Quick Metrics KPI Horizontal Strip */}
      <div className="overflow-x-auto no-scrollbar -mx-4 px-4">
        <div className="flex gap-2.5 min-w-max pb-1">
          {/* Metric 1 */}
          <div className="w-36 p-3.5 rounded-2xl bg-white shadow-sm border border-[#f6e9ff] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="material-symbols-outlined text-[#7b2cbf] text-[22px]">inventory_2</span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#7b2cbf]"></span>
            </div>
            <div className="mt-2.5">
              <span className="font-rubik text-[22px] text-[#211630] font-bold block leading-none">28</span>
              <span className="text-[11px] text-[#7e7384] uppercase tracking-wider block mt-1 font-semibold">
                Referencias Activas
              </span>
            </div>
          </div>

          {/* Metric 2 */}
          <div className="w-36 p-3.5 rounded-2xl bg-white shadow-sm border border-[#ffdf9f] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="material-symbols-outlined text-[#543d00] text-[22px]">priority_high</span>
              <span className="px-2 py-0.5 rounded-full bg-[#ffdf9f] text-[#261a00] text-[10px] font-bold">
                Urgente
              </span>
            </div>
            <div className="mt-2.5">
              <span className="font-rubik text-[22px] text-[#543d00] font-bold block leading-none">5</span>
              <span className="text-[11px] text-[#7e7384] uppercase tracking-wider block mt-1 font-semibold">
                En Stock Crítico
              </span>
            </div>
          </div>

          {/* Metric 3 */}
          <div className="w-36 p-3.5 rounded-2xl bg-white shadow-sm border border-[#ffdad6] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="material-symbols-outlined text-[#ba1a1a] text-[22px]">do_not_disturb_on</span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#ba1a1a]"></span>
            </div>
            <div className="mt-2.5">
              <span className="font-rubik text-[22px] text-[#ba1a1a] font-bold block leading-none">1</span>
              <span className="text-[11px] text-[#7e7384] uppercase tracking-wider block mt-1 font-semibold truncate">
                Agotado (Dino Rex)
              </span>
            </div>
          </div>

          {/* Metric 4 */}
          <div className="w-36 p-3.5 rounded-2xl bg-white shadow-sm border border-[#efdbff] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="material-symbols-outlined text-[#6f5092] text-[22px]">pets</span>
              <span className="px-2 py-0.5 rounded-full bg-[#efdbff] text-[#29074a] text-[10px] font-bold">
                Amigurumi
              </span>
            </div>
            <div className="mt-2.5">
              <span className="font-rubik text-[22px] text-[#6f5092] font-bold block leading-none">8</span>
              <span className="text-[11px] text-[#7e7384] uppercase tracking-wider block mt-1 font-semibold">
                En Producción
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Search & New Batch Action */}
      <div className="flex items-center gap-2">
        <div className="flex-1 relative flex items-center">
          <span className="material-symbols-outlined absolute left-3 text-[#6f5092] text-[20px] pointer-events-none">
            search
          </span>
          <input
            className="w-full h-12 pl-10 pr-4 rounded-2xl bg-white text-[#211630] text-[14px] placeholder:text-[#7e7384] border border-[#f6e9ff] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7b2cbf] transition-all"
            placeholder="Buscar por pieza, hilado o SKU..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button
          onClick={() =>
            onShowToast('Nuevo Lote', 'Formulario para nuevo ingreso de hilados o prendas abierto', 'add_box')
          }
          className="h-12 px-4 rounded-2xl bg-[#6100a4] hover:bg-[#7b2cbf] text-white text-[13px] font-bold flex items-center justify-center gap-1.5 shadow-md shadow-[#6100a4]/25 active:scale-95 transition-all shrink-0"
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">add_box</span>
          <span className="hidden sm:inline">Nuevo Lote</span>
        </button>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setFilterCategory('todos')}
          className={`px-4 py-2 rounded-full text-[12px] font-bold whitespace-nowrap transition-all ${
            filterCategory === 'todos'
              ? 'bg-[#7b2cbf] text-white shadow-sm'
              : 'bg-[#f6e9ff] text-[#4c4353] hover:bg-[#eddcff]'
          }`}
          type="button"
        >
          Todos ({products.length})
        </button>
        <button
          onClick={() => setFilterCategory('critico')}
          className={`px-4 py-2 rounded-full text-[12px] font-bold whitespace-nowrap transition-all ${
            filterCategory === 'critico'
              ? 'bg-[#7b2cbf] text-white shadow-sm'
              : 'bg-[#f6e9ff] text-[#4c4353] hover:bg-[#eddcff]'
          }`}
          type="button"
        >
          Stock Crítico (1)
        </button>
        <button
          onClick={() => setFilterCategory('agotado')}
          className={`px-4 py-2 rounded-full text-[12px] font-bold whitespace-nowrap transition-all ${
            filterCategory === 'agotado'
              ? 'bg-[#7b2cbf] text-white shadow-sm'
              : 'bg-[#f6e9ff] text-[#4c4353] hover:bg-[#eddcff]'
          }`}
          type="button"
        >
          Agotados (1)
        </button>
        <button
          onClick={() => setFilterCategory('pedido')}
          className={`px-4 py-2 rounded-full text-[12px] font-bold whitespace-nowrap transition-all ${
            filterCategory === 'pedido'
              ? 'bg-[#7b2cbf] text-white shadow-sm'
              : 'bg-[#f6e9ff] text-[#4c4353] hover:bg-[#eddcff]'
          }`}
          type="button"
        >
          Bajo Pedido (1)
        </button>
      </div>

      {/* Product Inventory List */}
      <div className="space-y-3.5">
        {filteredProducts.map((product) => (
          <article
            key={product.sku}
            className="rounded-3xl bg-white p-4 shadow-sm border border-[#f6e9ff] relative overflow-hidden flex flex-col gap-3 transition-all hover:border-[#d9b5ff]"
          >
            <div className="flex gap-3">
              {/* Product Image */}
              <div className="w-20 h-24 rounded-2xl overflow-hidden bg-[#faf0ff] shrink-0 shadow-inner relative border border-[#f6e9ff]">
                <img
                  className={`w-full h-full object-cover ${
                    product.category === 'agotado' ? 'grayscale opacity-75' : ''
                  }`}
                  src={product.imageUrl}
                  alt={product.name}
                />
                {product.category === 'agotado' && (
                  <div className="absolute inset-0 bg-[#372b46]/40 flex items-center justify-center">
                    <span className="px-2 py-0.5 rounded-full bg-[#ba1a1a] text-white text-[9px] font-bold uppercase shadow">
                      Agotado
                    </span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[11px] text-[#6f5092] font-bold tracking-wider uppercase">
                      SKU: {product.sku}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#efdbff] text-[#29074a] text-[10px] font-bold">
                      {product.tag}
                    </span>
                  </div>
                  <h3 className="font-rubik text-[16px] text-[#211630] font-bold truncate mt-0.5">
                    {product.name}
                  </h3>
                  <p className="text-[12px] text-[#6f5092] font-medium flex items-center gap-1 mt-0.5 truncate">
                    <span className="material-symbols-outlined text-[14px]">compost</span>
                    {product.supplier}
                  </p>
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-rubik text-[16px] text-[#7b2cbf] font-extrabold">
                    ${product.priceCOP.toLocaleString('es-CO')} COP
                  </span>
                  <span className="text-[11px] text-[#7e7384]">
                    Costo hilado: ${product.yarnCostCOP.toLocaleString('es-CO')}
                  </span>
                </div>
              </div>
            </div>

            {/* Condition Warning / Status Pill */}
            {product.category === 'critico' && (
              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[#ffdf9f]/40 border border-[#ffdf9f]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#543d00]"></span>
                  <span className="text-[11px] font-bold text-[#5c4300]">
                    Stock Mínimo alcanzado: {product.currentStock} / {product.minStockAlert}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-[#543d00]/10 text-[10px] text-[#543d00] uppercase font-bold tracking-wider">
                  Prioridad Taller
                </span>
              </div>
            )}

            {product.category === 'agotado' && (
              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[#ffdad6]/60 border border-[#ffdad6]">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="material-symbols-outlined text-[#ba1a1a] text-[18px] shrink-0">
                    notifications_active
                  </span>
                  <span className="text-[11px] font-bold text-[#ba1a1a] truncate">
                    {product.waitingListCount} clientas esperando reposición
                  </span>
                </div>
                <span className="text-[10px] text-[#ba1a1a] font-bold tracking-wider shrink-0 uppercase">
                  Alta Demanda
                </span>
              </div>
            )}

            {product.category === 'optimo' && (
              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[#efdbff]/50 border border-[#d9b5ff]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#6f5092]"></span>
                  <span className="text-[11px] font-bold text-[#29074a]">
                    Stock Óptimo ({product.currentStock} unidades)
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-[#d9b5ff] text-[#29074a] text-[10px] font-bold uppercase tracking-wider">
                  En Vitrina
                </span>
              </div>
            )}

            {product.category === 'pedido' && (
              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[#f6e9ff] border border-[#eddcff]">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="material-symbols-outlined text-[#7b2cbf] text-[18px] shrink-0">
                    event_available
                  </span>
                  <span className="text-[11px] font-bold text-[#211630] truncate">
                    Capacidad de Taller: <strong>2 cupos</strong> este mes
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#d9b5ff] text-[#29074a] text-[10px] font-bold shrink-0">
                  Agenda Abierta
                </span>
              </div>
            )}

            {/* Stepper and Card Actions */}
            <div className="flex items-center justify-between pt-1">
              {product.category !== 'pedido' && product.category !== 'agotado' ? (
                <div className="flex items-center gap-2">
                  <span className="text-[12px] text-[#4c4353] font-semibold">Unidades:</span>
                  <div className="flex items-center bg-[#faf0ff] rounded-2xl p-0.5 border border-[#f6e9ff]">
                    <button
                      onClick={() => handleDecrement(product)}
                      className="w-8 h-8 rounded-xl bg-white text-[#211630] flex items-center justify-center shadow-xs active:scale-95 transition-transform"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[16px]">remove</span>
                    </button>
                    <span className="w-8 text-center font-rubik text-[15px] text-[#211630] font-bold">
                      {product.currentStock}
                    </span>
                    <button
                      onClick={() => handleIncrement(product)}
                      className="w-8 h-8 rounded-xl bg-white text-[#211630] flex items-center justify-center shadow-xs active:scale-95 transition-transform"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[16px]">add</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      product.category === 'agotado' ? 'bg-[#ba1a1a]' : 'bg-[#7b2cbf]'
                    }`}
                  ></span>
                  <span className="text-[12px] text-[#4c4353] font-medium">
                    {product.category === 'agotado' ? (
                      <>
                        Disponible: <strong className="text-[#ba1a1a] font-bold">0 unid.</strong>
                      </>
                    ) : (
                      'Elaboración: 7 días'
                    )}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onOpenProductEdit(product)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#f6e9ff] text-[#6100a4] text-[12px] font-bold hover:bg-[#eddcff] transition-colors"
                  type="button"
                >
                  Editar
                </button>
                {product.category === 'critico' && (
                  <button
                    onClick={() =>
                      onShowToast(
                        'Solicitud Telar',
                        `Se programó el telar para 5 unidades de ${product.name}`,
                        'yard'
                      )
                    }
                    className="px-3.5 py-1.5 rounded-xl bg-[#7b2cbf] text-white text-[12px] font-bold shadow-md shadow-[#7b2cbf]/25 active:scale-95 transition-all"
                    type="button"
                  >
                    Tejer Lote
                  </button>
                )}
                {product.category === 'agotado' && (
                  <button
                    onClick={() => onOpenProductEdit(product)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#7b2cbf] text-white text-[12px] font-bold shadow-md shadow-[#7b2cbf]/25 flex items-center gap-1 active:scale-95 transition-all"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[16px]">add_circle</span>
                    <span>Reabastecer stock</span>
                  </button>
                )}
                {product.category === 'optimo' && (
                  <button
                    onClick={() =>
                      onShowToast(
                        'Guardado',
                        `Stock de ${product.name} sincronizado en bodega`,
                        'check'
                      )
                    }
                    className="px-3.5 py-1.5 rounded-xl bg-[#faf0ff] text-[#4c4353] text-[12px] font-bold hover:text-[#6100a4]"
                    type="button"
                  >
                    Guardar
                  </button>
                )}
                {product.category === 'pedido' && (
                  <button
                    onClick={() =>
                      onShowToast('Cupos de Taller', 'Capacidad mensual actualizada a 4 cupos', 'tune')
                    }
                    className="px-3.5 py-1.5 rounded-xl bg-[#f1dbff] text-[#680eac] text-[12px] font-bold active:scale-95 transition-all"
                    type="button"
                  >
                    Gestionar Cupos
                  </button>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
