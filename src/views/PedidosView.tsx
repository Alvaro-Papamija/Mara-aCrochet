import React, { useState } from 'react';
import { Order } from '../types';
import { notifyOrderStatus } from '../services/notificationService';
import { FacturaModal } from '../components/FacturaModal';
import { generateArtisanInvoicePDF } from '../services/pdfService';

interface PedidosViewProps {
  orders: Order[];
  onOpenShippingGuide: (order: Order) => void;
  onOpenScanner: () => void;
  onShowToast: (title: string, message: string, icon?: string) => void;
  onUpdateOrder?: (order: Order) => void;
}

export const PedidosView: React.FC<PedidosViewProps> = ({
  orders,
  onOpenShippingGuide,
  onOpenScanner,
  onShowToast,
  onUpdateOrder,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'todos' | 'preparacion' | 'listo' | 'transito'>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFacturaOrder, setSelectedFacturaOrder] = useState<Order | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<string | null>(null);

  const handleDownloadPDF = async (order: Order) => {
    try {
      setIsDownloadingPdf(order.id);
      await generateArtisanInvoicePDF(order);
      onShowToast(
        'Factura Descargada',
        `Factura_Artesanal_Marana_${order.id}.pdf lista para imprimir`,
        'picture_as_pdf'
      );
    } catch (err) {
      console.error('Error generating PDF:', err);
      onShowToast('Error', 'No se pudo generar el PDF de la factura', 'error');
    } finally {
      setIsDownloadingPdf(null);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesFilter = selectedFilter === 'todos' || order.status === selectedFilter;
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.trackingNumber && order.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const countPreparacion = orders.filter((o) => o.status === 'preparacion').length;
  const countListos = orders.filter((o) => o.status === 'listo').length;
  const countTransito = orders.filter((o) => o.status === 'transito').length;

  return (
    <div className="flex flex-col w-full px-4 pt-3 pb-28 max-w-md md:max-w-2xl mx-auto space-y-4">
      {/* View Header Info */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#6100a4] block">
            Taller & Envíos Activos
          </span>
          <h2 className="font-rubik text-[20px] font-bold text-[#211630] tracking-tight">
            Gestión de Pedidos & Despachos
          </h2>
        </div>
        <button
          onClick={onOpenScanner}
          className="px-3 py-2 rounded-2xl bg-[#7b2cbf] hover:bg-[#6100a4] text-white text-[12px] font-bold shadow-md shadow-[#7b2cbf]/25 flex items-center gap-1.5 active:scale-95 transition-all shrink-0"
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">qr_code_scanner</span>
          <span>Escanear</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative w-full">
        <span className="material-symbols-outlined absolute left-3.5 top-3.5 text-[#6f5092] text-[20px] pointer-events-none">
          search
        </span>
        <input
          type="text"
          placeholder="Buscar cliente, guía o prenda..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-12 pl-11 pr-10 rounded-2xl bg-white text-[#211630] text-[14px] placeholder:text-[#7e7384] border border-[#f6e9ff] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7b2cbf] transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-3 text-[#7e7384] hover:text-[#211630]"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        )}
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setSelectedFilter('todos')}
          className={`px-4 py-2 rounded-full text-[12px] font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            selectedFilter === 'todos'
              ? 'bg-[#7b2cbf] text-white shadow-sm'
              : 'bg-[#f6e9ff] text-[#4c4353] hover:bg-[#eddcff]'
          }`}
          type="button"
        >
          <span>Todos</span>
          <span className="opacity-80">({orders.length})</span>
        </button>

        <button
          onClick={() => setSelectedFilter('preparacion')}
          className={`px-4 py-2 rounded-full text-[12px] font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            selectedFilter === 'preparacion'
              ? 'bg-[#7b2cbf] text-white shadow-sm'
              : 'bg-[#f6e9ff] text-[#4c4353] hover:bg-[#eddcff]'
          }`}
          type="button"
        >
          <span>En Preparación</span>
          <span className="opacity-80">({countPreparacion})</span>
        </button>

        <button
          onClick={() => setSelectedFilter('listo')}
          className={`px-4 py-2 rounded-full text-[12px] font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            selectedFilter === 'listo'
              ? 'bg-[#7b2cbf] text-white shadow-sm'
              : 'bg-[#f6e9ff] text-[#4c4353] hover:bg-[#eddcff]'
          }`}
          type="button"
        >
          <span>Listos</span>
          <span className="opacity-80">({countListos})</span>
        </button>

        <button
          onClick={() => setSelectedFilter('transito')}
          className={`px-4 py-2 rounded-full text-[12px] font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            selectedFilter === 'transito'
              ? 'bg-[#7b2cbf] text-white shadow-sm'
              : 'bg-[#f6e9ff] text-[#4c4353] hover:bg-[#eddcff]'
          }`}
          type="button"
        >
          <span>En Tránsito</span>
          <span className="opacity-80">({countTransito})</span>
        </button>
      </div>

      {/* Orders List Feed */}
      <div className="space-y-4">
        {filteredOrders.map((order) => {
          const isReady = order.status === 'listo';
          const isPrep = order.status === 'preparacion';
          const isTransit = order.status === 'transito';

          return (
            <article
              key={order.id}
              className="bg-white rounded-3xl p-4 shadow-sm border border-[#f6e9ff] flex flex-col gap-3 transition-all hover:border-[#d9b5ff] hover:shadow-md"
            >
              {/* Top Row: Customer & Order ID */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-[#efdbff] text-[#29074a] font-rubik text-[15px] font-bold flex items-center justify-center shrink-0 border border-[#d9b5ff]">
                    {order.customerInitials}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-rubik text-[16px] text-[#211630] font-bold truncate">
                        {order.customerName}
                      </h3>
                    </div>
                    <p className="text-[12px] text-[#6f5092] flex items-center gap-1 truncate font-medium">
                      <span className="material-symbols-outlined text-[14px]">location_on</span>
                      {order.customerLocation}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end shrink-0">
                  <span className="font-mono text-[13px] text-[#7b2cbf] font-bold">
                    #{order.id}
                  </span>
                  <span className="text-[11px] text-[#7e7384]">{order.date}</span>
                </div>
              </div>

              {/* Status and Carrier Pills */}
              <div className="flex items-center gap-2 flex-wrap">
                {isReady && (
                  <>
                    <span className="px-3 py-1 rounded-full bg-[#efdbff] text-[#29074a] text-[11px] font-bold flex items-center gap-1 border border-[#deb7ff]">
                      <span className="w-2 h-2 rounded-full bg-[#7b2cbf] animate-pulse"></span>
                      Listo Despacho
                    </span>
                    <span className="px-3 py-1 rounded-full bg-[#faf0ff] text-[#6100a4] text-[11px] font-bold flex items-center gap-1 border border-[#f6e9ff]">
                      <span className="material-symbols-outlined text-[14px] text-[#6100a4]">verified</span>
                      Pago Verificado
                    </span>
                  </>
                )}

                {isPrep && (
                  <>
                    <span className="px-3 py-1 rounded-full bg-[#f1dbff] text-[#680eac] text-[11px] font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">handyman</span>
                      En Taller · 75%
                    </span>
                    <span className="text-[11px] text-[#4c4353] font-medium flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">schedule</span>
                      Listo: {order.readyTime}
                    </span>
                  </>
                )}

                {isTransit && (
                  <>
                    <span className="px-3 py-1 rounded-full bg-[#f6e9ff] text-[#6100a4] text-[11px] font-bold flex items-center gap-1 border border-[#d9b5ff]">
                      <span className="material-symbols-outlined text-[14px]">local_shipping</span>
                      En Tránsito
                    </span>
                    <span className="text-[11px] text-[#6f5092] font-semibold">
                      {order.carrier}
                    </span>
                  </>
                )}
              </div>

              {/* Progress bar for En Taller */}
              {isPrep && (
                <div className="w-full bg-[#f2e3ff] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#7b2cbf] h-full rounded-full w-3/4"></div>
                </div>
              )}

              {/* Items List inside order */}
              <div className="bg-[#faf0ff] rounded-2xl p-3 flex flex-col gap-2 border border-[#f6e9ff]">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-10 h-12 object-cover rounded-xl shrink-0 ring-1 ring-[#f2e3ff]"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[13px] text-[#211630] font-bold truncate">
                        {item.quantity}x {item.name}
                      </h4>
                      <p className="text-[11px] text-[#6f5092] truncate">{item.specs}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Special Packaging Note callout */}
              {order.specialNote && (
                <div className="p-3 rounded-2xl bg-[#ffdf9f]/30 border border-[#ffdf9f] flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-[#715300] text-[18px] shrink-0 mt-0.5">
                    card_giftcard
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] uppercase font-bold text-[#715300] tracking-wider block">
                      Nota de embalaje especial:
                    </span>
                    <p className="text-[12px] text-[#211630] italic mt-0.5 leading-snug">
                      {order.specialNote}
                    </p>
                  </div>
                </div>
              )}

              {/* Tracking info for In Transit */}
              {isTransit && order.trackingNumber && (
                <div className="p-3 rounded-2xl bg-[#faf0ff] border border-[#f6e9ff] flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-[#4c4353] font-medium">
                      Guía: <strong className="font-mono text-[#211630]">{order.trackingNumber}</strong>
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard?.writeText(order.trackingNumber || '');
                        onShowToast('Copiado', `Guía #${order.trackingNumber} copiada al portapapeles`, 'content_copy');
                      }}
                      className="text-[#6100a4] text-[11px] font-bold hover:underline flex items-center gap-1"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[14px]">content_copy</span>
                      Copiar
                    </button>
                  </div>
                  <p className="text-[12px] text-[#6f5092]">{order.trackingStatus}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                {isReady && (
                  <button
                    onClick={() => onOpenShippingGuide(order)}
                    className="flex-1 py-3 px-4 rounded-2xl bg-[#7b2cbf] hover:bg-[#6100a4] text-white text-[13px] font-bold flex items-center justify-center gap-1.5 shadow-md shadow-[#7b2cbf]/25 active:scale-95 transition-all"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">local_shipping</span>
                    <span>Generar Guía Servientrega</span>
                  </button>
                )}

                {isPrep && (
                  <div className="flex-1 flex items-center gap-1.5">
                    <button
                      onClick={async () => {
                        await notifyOrderStatus(
                          order,
                          `🧶 Avance Taller Maraña: La artesana está tejiendo los acabados finales de tu amigurumi en Neiva.`
                        );
                        onShowToast('Aviso Emitido al Navegador', `Notificación enviada al dispositivo de ${order.customerName}`, 'notifications_active');
                      }}
                      className="flex-1 py-3 px-3 rounded-2xl bg-[#f6e9ff] text-[#6100a4] text-[12.5px] font-bold flex items-center justify-center gap-1 hover:bg-[#deb7ff] active:scale-95 transition-all"
                      type="button"
                      title="Enviar aviso de avance al navegador de la clienta"
                    >
                      <span className="material-symbols-outlined text-[17px]">notifications</span>
                      <span>Notificar Avance</span>
                    </button>
                    {onUpdateOrder && (
                      <button
                        onClick={async () => {
                          const updated: Order = {
                            ...order,
                            status: 'listo',
                            statusLabel: 'Listo Despacho · Empacado',
                          };
                          onUpdateOrder(updated);
                          await notifyOrderStatus(updated);
                          onShowToast('Pedido Listo', `Se marcó listo y se notificó al navegador de ${order.customerName}`, 'card_giftcard');
                        }}
                        className="py-3 px-3 rounded-2xl bg-[#7b2cbf] hover:bg-[#6100a4] text-white text-[12.5px] font-bold flex items-center justify-center gap-1 active:scale-95 transition-all"
                        type="button"
                        title="Marcar como empacado y listo para despacho"
                      >
                        <span className="material-symbols-outlined text-[17px]">check</span>
                        <span>Marcar Listo</span>
                      </button>
                    )}
                  </div>
                )}

                {isTransit && (
                  <button
                    onClick={() => {
                      onShowToast('Tracking Oficial', `Abriendo seguimiento en vivo de ${order.carrier}`, 'open_in_new');
                    }}
                    className="flex-1 py-3 px-4 rounded-2xl bg-[#faf0ff] text-[#4c4353] text-[13px] font-bold flex items-center justify-center gap-1.5 border border-[#f6e9ff] hover:text-[#6100a4] active:scale-95 transition-all"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">share_location</span>
                    <span>Rastrear Envío en Vivo</span>
                  </button>
                )}

                <button
                  onClick={() => setSelectedFacturaOrder(order)}
                  className="px-3 h-11 rounded-2xl bg-[#faf0ff] text-[#6100a4] hover:bg-[#deb7ff] flex items-center justify-center gap-1.5 border border-[#deb7ff] active:scale-95 transition-all shrink-0 text-[12px] font-bold"
                  type="button"
                  title="Ver y descargar factura artesanal en PDF"
                >
                  <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                  <span className="hidden sm:inline">Factura</span>
                </button>

                <button
                  disabled={isDownloadingPdf === order.id}
                  onClick={() => handleDownloadPDF(order)}
                  className="w-11 h-11 rounded-2xl bg-[#7b2cbf] text-white hover:bg-[#6100a4] flex items-center justify-center shadow-xs active:scale-95 transition-all shrink-0 disabled:opacity-50"
                  type="button"
                  title="Descargar PDF de la factura directamente"
                  aria-label="Descargar PDF"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {isDownloadingPdf === order.id ? 'progress_activity' : 'picture_as_pdf'}
                  </span>
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {selectedFacturaOrder && (
        <FacturaModal
          order={selectedFacturaOrder}
          onClose={() => setSelectedFacturaOrder(null)}
          onShowToast={onShowToast}
        />
      )}
    </div>
  );
};
