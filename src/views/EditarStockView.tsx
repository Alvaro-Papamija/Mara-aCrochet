import React, { useState } from 'react';
import { StockProduct } from '../types';

interface EditarStockViewProps {
  product: StockProduct;
  onBack: () => void;
  onSaveStock: (sku: string, newStock: number) => void;
  onShowToast: (title: string, message: string, icon?: string) => void;
}

export const EditarStockView: React.FC<EditarStockViewProps> = ({
  product,
  onBack,
  onSaveStock,
  onShowToast,
}) => {
  const [movementType, setMovementType] = useState<'in' | 'adj' | 'ret'>('in');
  const [deltaQty, setDeltaQty] = useState(5);
  const [minAlert, setMinAlert] = useState(product.minStockAlert || 2);
  const [yarnCost, setYarnCost] = useState('78.000');
  const [supplier, setSupplier] = useState('1');
  const [batchNotes, setBatchNotes] = useState(
    'Lote tejido con hilaza recuperada lote Oct-24 con botones de cáscara de coco natural pulidos a mano.'
  );
  const [notifyWaitlist, setNotifyWaitlist] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Compute resulting stock forecast
  const currentStock = product.currentStock;
  const resultingStock =
    movementType === 'in' || movementType === 'ret'
      ? currentStock + deltaQty
      : Math.max(0, currentStock - deltaQty);

  const getSubtext = () => {
    if (movementType === 'in') return 'Piezas tejidas listas para ingreso';
    if (movementType === 'adj') return 'Unidades retiradas por defecto o merma';
    return 'Prendas retornadas en óptimas condiciones';
  };

  const getBadgeLabel = () => {
    if (movementType === 'in') return '+ Ingreso';
    if (movementType === 'adj') return '- Merma';
    return '+ Retorno';
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      onSaveStock(product.sku, resultingStock);
      setIsSaving(false);
      onShowToast(
        '¡Inventario Actualizado!',
        `${product.name} ahora cuenta con ${resultingStock} unidades en bodega.`,
        'done_all'
      );
      if (notifyWaitlist && (movementType === 'in' || movementType === 'ret')) {
        setTimeout(() => {
          onShowToast(
            'Lista de Espera Notificada',
            '6 clientas interesadas recibieron la alerta por WhatsApp.',
            'send'
          );
        }, 600);
      }
      onBack();
    }, 1000);
  };

  return (
    <div className="flex flex-col w-full px-4 pt-3 pb-32 max-w-md md:max-w-2xl mx-auto space-y-4">
      {/* Product Summary Header Card */}
      <section className="bg-white rounded-3xl p-4 shadow-sm border border-[#f6e9ff] flex flex-col gap-3 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-28 h-28 rounded-full bg-[#deb7ff]/30 pointer-events-none blur-xl"></div>
        <div className="flex items-start gap-3">
          <div className="w-20 h-24 rounded-2xl overflow-hidden bg-[#faf0ff] flex-shrink-0 relative shadow-sm ring-1 ring-[#f6e9ff]">
            <img
              className="w-full h-full object-cover"
              src={product.imageUrl}
              alt={product.name}
            />
            <div className="absolute top-1 left-1 bg-white/95 backdrop-blur-sm rounded-full px-1.5 py-0.5 flex items-center gap-0.5 shadow-xs">
              <span
                className="material-symbols-outlined text-[#6100a4] text-[11px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                spa
              </span>
              <span className="text-[9px] text-[#6100a4] font-bold">Hecho a mano</span>
            </div>
          </div>

          <div className="flex flex-col flex-1 min-w-0 justify-between py-0.5">
            <div>
              <div className="flex items-center justify-between gap-1">
                <span className="text-[11px] text-[#6f5092] tracking-widest uppercase font-bold">
                  SKU: {product.sku}
                </span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#efdbff] text-[#29074a] font-bold">
                  {product.size}
                </span>
              </div>
              <h2 className="font-rubik text-[18px] text-[#211630] font-bold truncate mt-0.5">
                {product.name}
              </h2>
              <p className="text-[12px] text-[#4c4353] truncate font-medium">
                Hilaza Crudo & Terracota botánico
              </p>
            </div>

            <div className="flex items-center gap-2 mt-2 bg-[#faf0ff] px-3 py-1.5 rounded-xl w-fit border border-[#f6e9ff]">
              <span className="material-symbols-outlined text-[16px] text-[#7b2cbf]">inventory_2</span>
              <span className="text-[12px] text-[#4c4353]">Stock en bodega:</span>
              <span className="font-rubik text-[15px] text-[#6100a4] font-bold">
                {currentStock}
              </span>
              <span className="text-[12px] text-[#4c4353]">uds.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Movement Type Control */}
      <section className="flex flex-col gap-1.5">
        <label className="text-[13px] text-[#211630] flex items-center gap-1.5 font-bold">
          <span className="material-symbols-outlined text-[18px] text-[#7b2cbf]">swap_horiz</span>
          Tipo de Movimiento
        </label>
        <div className="grid grid-cols-3 bg-[#f2e3ff] p-1 rounded-2xl gap-1 border border-[#eddcff]">
          <button
            onClick={() => setMovementType('in')}
            className={`py-2.5 px-2 rounded-xl text-[12px] text-center transition-all flex flex-col items-center gap-0.5 font-bold ${
              movementType === 'in'
                ? 'bg-white text-[#6100a4] shadow-sm'
                : 'text-[#4c4353] hover:text-[#6100a4]'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[17px]">add_circle</span>
            <span className="leading-tight">Tejido Terminado</span>
          </button>
          <button
            onClick={() => setMovementType('adj')}
            className={`py-2.5 px-2 rounded-xl text-[12px] text-center transition-all flex flex-col items-center gap-0.5 font-bold ${
              movementType === 'adj'
                ? 'bg-white text-[#6100a4] shadow-sm'
                : 'text-[#4c4353] hover:text-[#6100a4]'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[17px]">tune</span>
            <span className="leading-tight">Ajuste / Merma</span>
          </button>
          <button
            onClick={() => setMovementType('ret')}
            className={`py-2.5 px-2 rounded-xl text-[12px] text-center transition-all flex flex-col items-center gap-0.5 font-bold ${
              movementType === 'ret'
                ? 'bg-white text-[#6100a4] shadow-sm'
                : 'text-[#4c4353] hover:text-[#6100a4]'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[17px]">keyboard_return</span>
            <span className="leading-tight">Devolución</span>
          </button>
        </div>
      </section>

      {/* Stepper and Forecast */}
      <section className="bg-white rounded-3xl p-4 shadow-sm border border-[#f6e9ff] flex flex-col gap-3.5">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-[14px] text-[#211630] font-bold block">
              Cantidad a Modificar
            </label>
            <p className="text-[12px] text-[#4c4353]">{getSubtext()}</p>
          </div>
          <div className="bg-[#f1dbff] text-[#6100a4] px-3 py-1 rounded-full text-[12px] font-bold flex items-center gap-1 border border-[#deb7ff]">
            <span className="material-symbols-outlined text-[14px]">bolt</span>
            <span>{getBadgeLabel()}</span>
          </div>
        </div>

        {/* Stepper Widget */}
        <div className="flex items-center justify-between bg-[#faf0ff] rounded-2xl p-2.5 gap-3 border border-[#f6e9ff]">
          <button
            onClick={() => setDeltaQty((q) => Math.max(1, q - 1))}
            className="w-12 h-12 rounded-xl bg-white text-[#211630] flex items-center justify-center active:scale-95 transition-transform shadow-xs"
            type="button"
          >
            <span className="material-symbols-outlined text-[24px] text-[#7b2cbf] font-bold">
              remove
            </span>
          </button>

          <div className="flex flex-col items-center justify-center flex-1">
            <div className="flex items-baseline gap-1">
              <span className="font-rubik text-[32px] text-[#6100a4] font-extrabold leading-none">
                {deltaQty}
              </span>
              <span className="text-[14px] text-[#4c4353] font-medium">uds</span>
            </div>
          </div>

          <button
            onClick={() => setDeltaQty((q) => q + 1)}
            className="w-12 h-12 rounded-xl bg-[#7b2cbf] hover:bg-[#6100a4] text-white flex items-center justify-center active:scale-95 transition-transform shadow-md shadow-[#7b2cbf]/20"
            type="button"
          >
            <span className="material-symbols-outlined text-[24px] font-bold">add</span>
          </button>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-2 justify-center">
          <span className="text-[10px] text-[#7e7384] uppercase tracking-wider font-bold">
            Atajos:
          </span>
          {[1, 3, 5, 10].map((val) => (
            <button
              key={val}
              onClick={() => setDeltaQty(val)}
              className={`px-3 py-1 rounded-full text-[12px] font-bold transition-colors ${
                deltaQty === val
                  ? 'bg-[#7b2cbf] text-white shadow-xs'
                  : 'bg-[#f6e9ff] text-[#211630] hover:bg-[#deb7ff]'
              }`}
              type="button"
            >
              +{val}
            </button>
          ))}
        </div>

        {/* Forecast Ribbon */}
        <div className="bg-[#f2e3ff]/60 border border-[#deb7ff] rounded-2xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#7b2cbf] text-[20px]">sync_alt</span>
            <span className="text-[13px] text-[#211630] font-semibold">
              Nuevo stock resultante:
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-rubik text-[18px] text-[#6100a4] font-extrabold">
              {resultingStock}
            </span>
            <span className="text-[12px] text-[#6f5092] font-semibold">unidades</span>
          </div>
        </div>
      </section>

      {/* Threshold & Cost */}
      <section className="grid grid-cols-2 gap-3">
        <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-[#f6e9ff] flex flex-col gap-1">
          <label className="text-[11px] text-[#4c4353] flex items-center gap-1 font-bold">
            <span className="material-symbols-outlined text-[15px] text-[#7b2cbf]">
              notification_important
            </span>
            Alerta Stock Mínimo
          </label>
          <div className="flex items-center bg-[#faf0ff] rounded-xl px-3 py-2 mt-1 border border-[#f6e9ff] focus-within:border-[#7b2cbf]">
            <input
              type="number"
              value={minAlert}
              onChange={(e) => setMinAlert(parseInt(e.target.value, 10) || 1)}
              className="w-full bg-transparent font-rubik text-[16px] text-[#211630] font-bold focus:outline-none"
              min={1}
              max={50}
            />
            <span className="text-[12px] text-[#7e7384]">uds</span>
          </div>
          <span className="text-[10px] text-[#6f5092]">Aviso de reposición</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-[#f6e9ff] flex flex-col gap-1">
          <label className="text-[11px] text-[#4c4353] flex items-center gap-1 font-bold">
            <span className="material-symbols-outlined text-[15px] text-[#7b2cbf]">payments</span>
            Costo Hilado / Und
          </label>
          <div className="flex items-center bg-[#faf0ff] rounded-xl px-3 py-2 mt-1 border border-[#f6e9ff] focus-within:border-[#7b2cbf]">
            <span className="text-[13px] text-[#7e7384] mr-1 font-bold">$</span>
            <input
              type="text"
              value={yarnCost}
              onChange={(e) => setYarnCost(e.target.value)}
              className="w-full bg-transparent font-rubik text-[16px] text-[#211630] font-bold focus:outline-none"
            />
            <span className="text-[10px] text-[#7e7384] font-medium">COP</span>
          </div>
          <span className="text-[10px] text-[#6f5092]">Base para margen</span>
        </div>
      </section>

      {/* Supplier Selection */}
      <section className="bg-white rounded-3xl p-4 shadow-sm border border-[#f6e9ff] flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-[13px] text-[#211630] font-bold flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-[#7b2cbf]">nest_eco_leaf</span>
            Hilandería / Proveedor Asociado
          </label>
          <span className="text-[11px] text-[#6100a4] font-bold bg-[#f1dbff] px-2.5 py-0.5 rounded-full">
            Trazabilidad
          </span>
        </div>
        <div className="relative mt-1">
          <select
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
            className="w-full h-12 bg-[#faf0ff] text-[#211630] rounded-xl px-3 pr-10 text-[13px] appearance-none focus:outline-none border border-[#f6e9ff] focus:border-[#7b2cbf] font-medium"
          >
            <option value="1">Hilados Santa Inés (Algodón Orgánico)</option>
            <option value="2">Hilandería San Jacinto (Fibras Teñidas)</option>
            <option value="3">Artesanos Asociados del Huila</option>
            <option value="new">+ Agregar nuevo taller o hilandería...</option>
          </select>
          <span className="material-symbols-outlined text-[#7b2cbf] absolute right-3 top-3 pointer-events-none text-[20px]">
            expand_more
          </span>
        </div>
        <div className="flex items-center gap-2 p-2.5 bg-[#faf0ff] rounded-xl mt-1 border border-[#f6e9ff]">
          <span className="material-symbols-outlined text-[16px] text-[#7b2cbf]">verified</span>
          <p className="text-[11px] text-[#4c4353] leading-snug">
            Certificación botánica activa y teñido libre de químicos agresivos.
          </p>
        </div>
      </section>

      {/* Batch & Workshop Notes */}
      <section className="bg-white rounded-3xl p-4 shadow-sm border border-[#f6e9ff] flex flex-col gap-1.5">
        <label className="text-[13px] text-[#211630] font-bold flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[18px] text-[#7b2cbf]">edit_note</span>
          Lote y Notas del Taller
        </label>
        <p className="text-[12px] text-[#7e7384]">
          Detalles de la hebra, tintura o mano artesana a cargo:
        </p>
        <textarea
          value={batchNotes}
          onChange={(e) => setBatchNotes(e.target.value)}
          rows={3}
          className="w-full bg-[#faf0ff] text-[#211630] rounded-2xl p-3 text-[13px] focus:outline-none border border-[#f6e9ff] focus:border-[#7b2cbf] resize-none mt-1"
        />
      </section>

      {/* Waitlist Notification Toggle */}
      <section className="bg-[#faf0ff] border border-[#deb7ff] rounded-3xl p-4 shadow-sm flex flex-col gap-2">
        <div className="flex items-start gap-3">
          <div className="pt-0.5">
            <input
              type="checkbox"
              id="notify-waitlist"
              checked={notifyWaitlist}
              onChange={(e) => setNotifyWaitlist(e.target.checked)}
              className="w-5 h-5 rounded-md text-[#7b2cbf] accent-[#7b2cbf] cursor-pointer"
            />
          </div>
          <label htmlFor="notify-waitlist" className="flex-1 cursor-pointer select-none">
            <div className="flex items-center justify-between">
              <span className="text-[14px] text-[#211630] font-bold leading-tight">
                Avisar a Lista de Espera
              </span>
              <span className="bg-[#7b2cbf] text-white px-2.5 py-0.5 rounded-full text-[11px] font-bold shadow-xs">
                6 interesadas
              </span>
            </div>
            <p className="text-[12px] text-[#4c4353] mt-1 leading-snug">
              Se enviará un mensaje automatizado con fotografía de la pieza recién terminada para asegurar su venta directa.
            </p>
          </label>
        </div>

        <div className="flex items-center gap-2 pl-8 pt-1">
          <div className="flex -space-x-2 overflow-hidden">
            <div className="inline-block h-6 w-6 rounded-full bg-[#eddcff] text-[10px] font-bold text-[#211630] flex items-center justify-center ring-2 ring-white">
              MC
            </div>
            <div className="inline-block h-6 w-6 rounded-full bg-[#efdbff] text-[10px] font-bold text-[#29074a] flex items-center justify-center ring-2 ring-white">
              LR
            </div>
            <div className="inline-block h-6 w-6 rounded-full bg-[#f1dbff] text-[10px] font-bold text-[#6100a4] flex items-center justify-center ring-2 ring-white">
              VT
            </div>
            <div className="inline-block h-6 w-6 rounded-full bg-[#7b2cbf] text-[10px] font-bold text-white flex items-center justify-center ring-2 ring-white">
              +3
            </div>
          </div>
          <span className="text-[11px] text-[#6100a4] font-semibold">
            Demanda alta para esta prenda
          </span>
        </div>
      </section>

      {/* Floating Bottom Bar */}
      <div className="fixed bottom-0 inset-x-0 p-4 bg-[#fff7ff]/95 backdrop-blur-xl shadow-2xl z-40 pb-safe border-t border-[#f6e9ff]">
        <div className="max-w-md md:max-w-2xl mx-auto">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-[#7b2cbf] hover:bg-[#6100a4] text-white py-3.5 px-4 rounded-2xl text-[14px] font-bold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md shadow-[#7b2cbf]/25"
            type="button"
          >
            <span
              className={`material-symbols-outlined text-[20px] ${
                isSaving ? 'animate-spin' : ''
              }`}
            >
              {isSaving ? 'sync' : 'cloud_sync'}
            </span>
            <span>
              {isSaving ? 'Actualizando bodega...' : 'Guardar y Sincronizar Inventario'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
