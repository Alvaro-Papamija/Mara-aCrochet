import React, { useState } from 'react';
import { Order } from '../types';
import { generateArtisanInvoicePDF } from '../services/pdfService';
import { BRAND_LOGO } from '../data/mockData';

interface FacturaModalProps {
  order: Order;
  onClose: () => void;
  onShowToast: (title: string, message: string, icon?: string) => void;
}

export const FacturaModal: React.FC<FacturaModalProps> = ({ order, onClose, onShowToast }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const subtotal = order.items.reduce((sum, it) => sum + it.price * it.quantity, 0);
  const shipping = order.shippingCost || 0;
  const total = subtotal + shipping;

  const handleDownload = async () => {
    try {
      setIsGenerating(true);
      await generateArtisanInvoicePDF(order);
      onShowToast(
        'Factura Descargada',
        `Se guardó Factura_Artesanal_Marana_${order.id}.pdf en tus descargas.`,
        'download_done'
      );
    } catch (err) {
      console.error('Error generating PDF:', err);
      onShowToast('Error al generar PDF', 'Hubo un inconveniente al crear el archivo.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#211630]/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-[#deb7ff] flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Top Bar */}
        <div className="px-5 py-4 border-b border-[#f0dbff] bg-[#faf0ff] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#7b2cbf] text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[20px]">receipt_long</span>
            </div>
            <div>
              <h3 className="font-rubik text-[15px] font-bold text-[#211630]">
                Factura Artesanal & Resumen
              </h3>
              <p className="text-[11px] text-[#7e7384]">
                Pedido <span className="font-mono font-bold text-[#7b2cbf]">#{order.id}</span> · Maraña Crochet
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              disabled={isGenerating}
              className="px-3.5 py-1.5 rounded-xl bg-[#7b2cbf] hover:bg-[#6100a4] text-white text-[12px] font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95 disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-[16px]">
                {isGenerating ? 'progress_activity' : 'picture_as_pdf'}
              </span>
              <span>{isGenerating ? 'Generando...' : 'Descargar PDF'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white hover:bg-[#ebd2ff] text-[#4c4353] flex items-center justify-center transition-colors border border-[#deb7ff]"
              aria-label="Cerrar ventana de factura"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>

        {/* Modal Printable / Preview Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 bg-[#fcf8ff]">
          {/* Printable Invoice Sheet Look */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-[#ecd9fc] space-y-5">
            {/* Header of the artisan bill */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#ebd2ff]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#faf0ff] border border-[#deb7ff] p-1 flex items-center justify-center shrink-0">
                  <img
                    src={BRAND_LOGO}
                    alt="Maraña Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h4 className="font-rubik text-[15px] font-black text-[#6100a4] tracking-tight">
                    MARAÑA AMIGURUMIS & CROCHET
                  </h4>
                  <p className="text-[11px] text-[#6f5092] font-medium">
                    Taller Artesanal de Neiva, Huila · Colombia
                  </p>
                  <p className="text-[10px] text-[#7e7384]">
                    WhatsApp +57 318 692 8410 · IG @marana.crochet
                  </p>
                </div>
              </div>

              <div className="text-right sm:text-right bg-[#faf0ff] p-2.5 rounded-xl border border-[#f0dbff] sm:bg-transparent sm:border-0 sm:p-0">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-[#7b2cbf] text-white">
                  Factura Artesanal
                </span>
                <p className="font-mono text-[13px] font-bold text-[#6100a4] mt-1">
                  #{order.id}
                </p>
                <p className="text-[10.5px] text-[#7e7384]">{order.date}</p>
              </div>
            </div>

            {/* Customer & Delivery Block */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-[#fdf9ff] rounded-xl border border-[#f0dbff] text-[12px]">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#7b2cbf] tracking-wide block">
                  Clienta & Receptor
                </span>
                <p className="font-bold text-[#211630]">{order.customerName}</p>
                <p className="text-[#554666]">{order.customerPhone || 'WhatsApp verificado'}</p>
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#e0f8e9] text-[#0e7c3a] font-bold">
                    ✓ {order.statusLabel}
                  </span>
                </div>
              </div>

              <div className="space-y-1 sm:border-l sm:border-[#f0dbff] sm:pl-3">
                <span className="text-[10px] uppercase font-bold text-[#7b2cbf] tracking-wide block">
                  Lugar de Entrega & Guía
                </span>
                <p className="text-[#211630]">
                  <strong>Ciudad:</strong> {order.customerLocation}
                </p>
                <p className="text-[#554666] text-[11px] truncate" title={order.customerAddress}>
                  {order.customerAddress || 'Entrega acordada en Neiva'}
                </p>
                <p className="text-[#554666]">
                  <strong>Envío:</strong> {order.carrier}
                </p>
                {order.trackingNumber && (
                  <p className="font-mono text-[11px] text-[#6100a4] font-bold">
                    Guía: #{order.trackingNumber}
                  </p>
                )}
              </div>
            </div>

            {/* Items Table */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-[#211630] flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-[#7b2cbf]">inventory_2</span>
                <span>Detalle de Amigurumis Tejidos a Mano</span>
              </span>

              <div className="overflow-hidden rounded-xl border border-[#ebd2ff]">
                <table className="w-full text-left text-[12px]">
                  <thead className="bg-[#7b2cbf] text-white text-[10.5px] uppercase font-bold">
                    <tr>
                      <th className="py-2 px-3">Pieza Artesanal</th>
                      <th className="py-2 px-2 text-center">Cant.</th>
                      <th className="py-2 px-3 text-right">Vr. Unit</th>
                      <th className="py-2 px-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f5e6ff] bg-white">
                    {order.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-[#faf4ff]">
                        <td className="py-2.5 px-3">
                          <p className="font-bold text-[#211630]">{item.name}</p>
                          <p className="text-[10.5px] text-[#7e7384] italic">
                            {item.specs || '100% Algodón mercerizado antialérgico'}
                          </p>
                        </td>
                        <td className="py-2.5 px-2 text-center font-bold text-[#4c4353]">
                          {item.quantity}
                        </td>
                        <td className="py-2.5 px-3 text-right text-[#4c4353]">
                          ${item.price.toLocaleString('es-CO')}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-[#6100a4]">
                          ${(item.price * item.quantity).toLocaleString('es-CO')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Note & Financial Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {/* Artisan Note */}
              <div className="p-3 bg-[#faf0ff] rounded-xl border border-[#deb7ff]/50 space-y-1">
                <p className="text-[10.5px] font-bold text-[#6100a4] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">favorite</span>
                  <span>Nota Artesanal & Dedicatoria</span>
                </p>
                <p className="text-[11px] text-[#554666] italic leading-relaxed">
                  {order.specialNote ||
                    '"Cada puntada fue tejida a mano con hilo de algodón colombiano y mucho amor en Neiva, Huila."'}
                </p>
                <div className="pt-2 text-[10px] text-[#0e7c3a] font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">verified</span>
                  <span>Pago y comprobante validado por Maraña</span>
                </div>
              </div>

              {/* Totals */}
              <div className="p-3 bg-white rounded-xl border border-[#ebd2ff] space-y-1.5 text-[12px]">
                <div className="flex justify-between text-[#6f5092]">
                  <span>Subtotal piezas:</span>
                  <span className="font-bold">${subtotal.toLocaleString('es-CO')}</span>
                </div>
                <div className="flex justify-between text-[#6f5092]">
                  <span>Costo de envío:</span>
                  <span className="font-bold">
                    {shipping > 0 ? `$${shipping.toLocaleString('es-CO')}` : 'Incluido'}
                  </span>
                </div>
                <div className="border-t border-[#f0dbff] pt-1.5 flex justify-between items-center text-[#211630]">
                  <span className="font-rubik font-bold text-[13px] text-[#6100a4]">
                    Total Pagado:
                  </span>
                  <span className="font-rubik font-black text-[16px] text-[#6100a4]">
                    ${total.toLocaleString('es-CO')}
                  </span>
                </div>
              </div>
            </div>

            {/* Care instructions footer */}
            <div className="p-3 bg-[#f7efff] rounded-xl text-[10.5px] text-[#554666] space-y-1 border border-[#ebd2ff]">
              <p className="font-bold text-[#7b2cbf] flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">info</span>
                <span>Cuidados del Amigurumi:</span>
              </p>
              <p>
                Lavar a mano con agua fría y jabón suave. No centrifugar ni exprimir. Secar horizontal a la sombra.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Bottom Bar */}
        <div className="p-4 bg-white border-t border-[#f0dbff] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <p className="text-[11px] text-[#7e7384] text-center sm:text-left">
            Documento artesanal descargable en formato PDF estándar A4.
          </p>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl border border-[#deb7ff] text-[#4c4353] hover:bg-[#faf0ff] text-[12px] font-bold transition-all"
            >
              Cerrar
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={isGenerating}
              className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-[#7b2cbf] hover:bg-[#6100a4] text-white text-[12px] font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95 disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-[17px]">
                {isGenerating ? 'progress_activity' : 'download'}
              </span>
              <span>{isGenerating ? 'Generando PDF...' : 'Descargar Factura PDF'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
