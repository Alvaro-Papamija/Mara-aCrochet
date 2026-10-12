import React, { useState } from 'react';
import { Voucher } from '../types';

interface DetalleComprobanteViewProps {
  voucher: Voucher;
  onBack: () => void;
  onApprove: (voucherId: string) => void;
  onReject: (voucherId: string, reason: string) => void;
  onShowToast: (title: string, message: string, icon?: string) => void;
}

export const DetalleComprobanteView: React.FC<DetalleComprobanteViewProps> = ({
  voucher,
  onBack,
  onApprove,
  onReject,
  onShowToast,
}) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [workshopNote, setWorkshopNote] = useState(voucher.internalNote || '');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('amount_mismatch');
  const [isApproving, setIsApproving] = useState(false);

  const handleCopyReference = () => {
    navigator.clipboard?.writeText(voucher.approvalCode);
    onShowToast(
      'Referencia Copiada',
      `Código #${voucher.approvalCode} copiado al portapapeles.`,
      'content_copy'
    );
  };

  const handleApproveClick = () => {
    setIsApproving(true);
    setTimeout(() => {
      onApprove(voucher.id);
      setIsApproving(false);
      onShowToast(
        '¡Pago Aprobado con Éxito!',
        `Pedido #${voucher.orderId} liberado para empaque en el taller.`,
        'verified'
      );
      onBack();
    }, 900);
  };

  const handleConfirmRejection = () => {
    setIsRejectModalOpen(false);
    onReject(voucher.id, rejectReason);
    onShowToast(
      'Comprobante Rechazado',
      `Se notificó al cliente para reenviar el comprobante de pago.`,
      'warning'
    );
    onBack();
  };

  return (
    <div className="flex flex-col w-full px-4 pt-3 pb-32 max-w-md md:max-w-2xl mx-auto space-y-4">
      {/* Navigation and Status Badge */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-[#6100a4] hover:text-[#7b2cbf] text-[13px] font-bold transition-colors"
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Volver a Comprobantes</span>
        </button>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#efdbff] text-[#29074a] text-[11px] font-bold shadow-sm border border-[#d9b5ff]">
          <span className="w-2 h-2 rounded-full bg-[#7b2cbf] animate-pulse"></span>
          <span>Pendiente de verificación</span>
        </div>
      </div>

      {/* Order & Client Heading */}
      <div>
        <div className="flex items-baseline justify-between">
          <h2 className="font-rubik text-[22px] text-[#211630] font-bold tracking-tight">
            Pedido #{voucher.orderId}
          </h2>
          <span className="text-[12px] text-[#7e7384] font-medium">{voucher.timeAgo}</span>
        </div>
        <p className="text-[14px] text-[#4c4353] mt-0.5">
          Comprobante subido por{' '}
          <span className="text-[#211630] font-bold">{voucher.customerName}</span>
        </p>
      </div>

      {/* Receipt Image Box with Zoom */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-[#f6e9ff] flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#7b2cbf] text-[24px]">receipt_long</span>
            <div>
              <span className="text-[14px] text-[#211630] font-bold block leading-tight">
                {voucher.paymentMethod}
              </span>
              <span className="text-[12px] text-[#7e7384]">
                soporte_bancario.png (1.2 MB)
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsZoomed(!isZoomed)}
              className="p-2 rounded-xl bg-[#faf0ff] text-[#4c4353] hover:bg-[#f2e3ff] transition-colors"
              title="Alternar Zoom"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">
                {isZoomed ? 'zoom_out' : 'zoom_in'}
              </span>
            </button>
            <a
              href={voucher.receiptFullUrl}
              download={`comprobante_${voucher.orderId}.png`}
              className="p-2 rounded-xl bg-[#faf0ff] text-[#4c4353] hover:bg-[#f2e3ff] transition-colors"
              title="Descargar comprobante"
            >
              <span className="material-symbols-outlined text-[20px]">download</span>
            </a>
          </div>
        </div>

        <div
          onClick={() => setIsZoomed(!isZoomed)}
          className={`relative overflow-hidden rounded-2xl bg-[#faf0ff] cursor-zoom-in transition-all duration-300 border border-[#f6e9ff] flex items-center justify-center ${
            isZoomed ? 'max-h-[500px]' : 'max-h-72'
          }`}
        >
          <img
            className={`w-full object-contain transition-transform duration-300 ${
              isZoomed ? 'scale-125' : 'scale-100'
            }`}
            src={voucher.receiptFullUrl}
            alt="Comprobante Bancario"
          />
          <div className="absolute bottom-2 right-2 bg-[#372b46]/80 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">
              {isZoomed ? 'zoom_out' : 'touch_app'}
            </span>
            <span>{isZoomed ? 'Tocar para reducir' : 'Tocar para ampliar'}</span>
          </div>
        </div>
      </div>

      {/* Verification Checklist Breakdown */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-[#f6e9ff] flex flex-col gap-3">
        <div className="flex items-center justify-between pb-1 border-b border-[#f6e9ff]">
          <h3 className="font-rubik text-[16px] text-[#211630] font-bold flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#7b2cbf] text-[20px]">fact_check</span>
            Cotejo de Verificación
          </h3>
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#efdbff] text-[#29074a] text-[11px] font-bold border border-[#d9b5ff]">
            <span className="material-symbols-outlined text-[15px] text-[#7b2cbf]">verified</span>
            <span>Coincidencia 100%</span>
          </div>
        </div>

        {/* Side by side amount comparison */}
        <div className="grid grid-cols-2 gap-2 mt-1">
          <div className="bg-[#faf0ff] rounded-2xl p-3 flex flex-col justify-between border border-[#f6e9ff]">
            <span className="text-[11px] text-[#7e7384] uppercase tracking-wider font-bold">
              Monto en Pedido
            </span>
            <span className="font-rubik text-[18px] text-[#6100a4] font-extrabold mt-1">
              ${voucher.expectedAmount.toLocaleString('es-CO')}{' '}
              <span className="text-[11px] font-normal text-[#4c4353]">COP</span>
            </span>
          </div>

          <div className="bg-[#efdbff]/60 rounded-2xl p-3 flex flex-col justify-between border border-[#d9b5ff]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#6f5092] uppercase tracking-wider font-bold">
                Monto en Recibo
              </span>
              <span className="material-symbols-outlined text-[#7b2cbf] text-[16px]">check_circle</span>
            </div>
            <span className="font-rubik text-[18px] text-[#29074a] font-extrabold mt-1">
              ${voucher.totalAmount.toLocaleString('es-CO')}{' '}
              <span className="text-[11px] font-normal text-[#6f5092]">COP</span>
            </span>
          </div>
        </div>

        {/* Banking detail rows */}
        <div className="space-y-2 mt-1 text-[13px]">
          <div className="flex items-center justify-between py-1.5 bg-[#faf0ff] rounded-xl px-3 border border-[#f6e9ff]">
            <span className="text-[#4c4353]">Cuenta Receptora Maraña</span>
            <span className="font-mono text-[#211630] font-bold text-[12px]">
              {voucher.bankAccount}
            </span>
          </div>

          <div className="flex items-center justify-between py-1.5 bg-[#faf0ff] rounded-xl px-3 border border-[#f6e9ff]">
            <span className="text-[#4c4353]">No. Referencia / Aprobación</span>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[#211630] font-bold text-[13px]">
                #{voucher.approvalCode}
              </span>
              <button
                onClick={handleCopyReference}
                className="text-[#7e7384] hover:text-[#6100a4] p-1 transition-colors"
                title="Copiar referencia"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">content_copy</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between py-1.5 bg-[#faf0ff] rounded-xl px-3 border border-[#f6e9ff]">
            <span className="text-[#4c4353]">Fecha y Hora Bancaria</span>
            <span className="text-[#211630] font-semibold">{voucher.bankTimestamp}</span>
          </div>
        </div>
      </div>

      {/* Customer Information Card */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-[#f6e9ff]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-[#efdbff] text-[#29074a] flex items-center justify-center font-rubik text-[16px] font-bold border border-[#d9b5ff]">
              {voucher.customerName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h4 className="text-[14px] text-[#211630] font-bold leading-tight">
                {voucher.customerName}
              </h4>
              <p className="text-[12px] text-[#7e7384] font-medium">{voucher.customerPhone}</p>
            </div>
          </div>
          <a
            href={`https://wa.me/${voucher.customerPhone.replace(/[^0-9]/g, '')}?text=Hola%20${encodeURIComponent(
              voucher.customerName
            )},%20te%20escribimos%20de%20Mara%C3%B1a%20Crochet%20sobre%20tu%20pedido%20%23${voucher.orderId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 bg-[#6f5092] hover:bg-[#6100a4] text-white px-3 py-1.5 rounded-xl text-[12px] font-bold shadow-sm active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[17px]">chat</span>
            <span>WhatsApp</span>
          </a>
        </div>

        <div className="mt-3 pt-2.5 bg-[#faf0ff] rounded-2xl p-3 flex items-start gap-2.5 border border-[#f6e9ff]">
          <span className="material-symbols-outlined text-[#7b2cbf] text-[20px] shrink-0 mt-0.5">
            local_shipping
          </span>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] text-[#6f5092] uppercase tracking-wider block font-bold">
              Destino de Entrega
            </span>
            <p className="text-[13px] text-[#211630] font-semibold mt-0.5">
              {voucher.customerAddress}
            </p>
          </div>
        </div>
      </div>

      {/* Reserved Items In Workshop */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-[#f6e9ff] flex flex-col gap-3">
        <div className="flex items-center justify-between pb-1 border-b border-[#f6e9ff]">
          <h3 className="font-rubik text-[16px] text-[#211630] font-bold flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#7b2cbf] text-[20px]">inventory_2</span>
            Prendas Reservadas en Taller
          </h3>
          <span className="px-2.5 py-0.5 rounded-full bg-[#efdbff] text-[#29074a] text-[11px] font-bold">
            {voucher.itemsDetail.length} piezas
          </span>
        </div>

        <div className="space-y-2.5">
          {voucher.itemsDetail.map((item, idx) => (
            <div
              key={idx}
              className="flex gap-3 items-center bg-[#faf0ff] rounded-2xl p-2.5 border border-[#f6e9ff]"
            >
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-14 h-16 object-cover rounded-xl shrink-0 ring-1 ring-[#f2e3ff]"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-1">
                  <h5 className="text-[14px] text-[#211630] font-bold truncate">{item.name}</h5>
                  <span className="text-[13px] text-[#211630] font-extrabold shrink-0">
                    ${item.price.toLocaleString('es-CO')}
                  </span>
                </div>
                <p className="text-[12px] text-[#6f5092] truncate">{item.specs}</p>
                <div className="inline-flex items-center gap-1 text-[11px] text-[#7e7384] mt-0.5 font-medium">
                  <span>{item.quantity} unidad</span>
                  <span>·</span>
                  <span className="text-[#6100a4] font-semibold">100% Algodón & Lino</span>
                </div>
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between px-3 py-2 bg-[#faf0ff] rounded-xl text-[13px]">
            <div className="flex items-center gap-1.5 text-[#4c4353]">
              <span className="material-symbols-outlined text-[16px] text-[#7e7384]">local_shipping</span>
              <span>Envío Servientrega Nacional</span>
            </div>
            <span className="font-bold text-[#211630]">$14.000</span>
          </div>

          <div className="flex items-center justify-between pt-2 px-2 border-t border-[#f6e9ff]">
            <span className="font-rubik text-[16px] text-[#211630] font-bold">Total Liquidado</span>
            <span className="font-rubik text-[20px] text-[#7b2cbf] font-extrabold">
              ${voucher.totalAmount.toLocaleString('es-CO')} COP
            </span>
          </div>
        </div>
      </div>

      {/* Workshop Internal Note */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-[#f6e9ff]">
        <label
          htmlFor="workshopNote"
          className="font-rubik text-[15px] text-[#211630] font-bold flex items-center gap-1.5 mb-1.5"
        >
          <span className="material-symbols-outlined text-[18px] text-[#7b2cbf]">edit_note</span>
          Nota Interna del Taller (Opcional)
        </label>
        <textarea
          id="workshopNote"
          value={workshopNote}
          onChange={(e) => setWorkshopNote(e.target.value.slice(0, 150))}
          rows={2}
          placeholder="Ej: Transferencia confirmada en portal Bancolombia PyME..."
          className="w-full rounded-2xl bg-[#faf0ff] text-[#211630] p-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#7b2cbf] placeholder:text-[#7e7384] resize-none border border-[#f6e9ff]"
        />
        <div className="flex items-center justify-between mt-1 text-[11px] text-[#7e7384]">
          <span>Visible solo para el equipo de empaque</span>
          <span>{workshopNote.length}/150</span>
        </div>
      </div>

      {/* Sticky Bottom Actions */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-[#fff7ff]/95 backdrop-blur-xl p-4 shadow-[0_-4px_24px_rgba(97,0,164,0.1)] border-t border-[#f6e9ff] pb-safe">
        <div className="max-w-md md:max-w-2xl mx-auto flex items-center gap-3">
          <button
            onClick={() => setIsRejectModalOpen(true)}
            className="flex-1 py-3.5 px-3 rounded-2xl bg-[#ffdad6] text-[#ba1a1a] text-[13px] font-bold active:scale-95 transition-all text-center flex items-center justify-center gap-1"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
            <span>Rechazar</span>
          </button>
          <button
            onClick={handleApproveClick}
            disabled={isApproving}
            className="flex-[2] py-3.5 px-4 rounded-2xl bg-[#7b2cbf] hover:bg-[#6100a4] text-white text-[14px] font-bold shadow-md shadow-[#7b2cbf]/25 active:scale-95 transition-all text-center flex items-center justify-center gap-2"
            type="button"
          >
            <span
              className={`material-symbols-outlined text-[20px] ${
                isApproving ? 'animate-spin' : ''
              }`}
            >
              {isApproving ? 'sync' : 'check_circle'}
            </span>
            <span>{isApproving ? 'Liberando...' : 'Aprobar Pago'}</span>
          </button>
        </div>
      </div>

      {/* Rejection Modal Sheet */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#372b46]/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-150 border border-[#f6e9ff]">
            <div className="flex items-center justify-between pb-1 border-b border-[#f6e9ff]">
              <h4 className="font-rubik text-[16px] text-[#211630] font-bold">
                Rechazar Comprobante
              </h4>
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="text-[#7e7384] hover:text-[#211630]"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <p className="text-[13px] text-[#4c4353]">
              Selecciona el motivo del rechazo. Se notificará a {voucher.customerName} por WhatsApp para solicitar un nuevo soporte:
            </p>
            <div className="space-y-2 mt-1">
              <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#faf0ff] cursor-pointer hover:bg-[#f2e3ff] transition-colors border border-[#f6e9ff]">
                <input
                  type="radio"
                  name="rejectReason"
                  value="amount_mismatch"
                  checked={rejectReason === 'amount_mismatch'}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="accent-[#7b2cbf]"
                />
                <span className="text-[13px] text-[#211630] font-semibold">Monto no coincide</span>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#faf0ff] cursor-pointer hover:bg-[#f2e3ff] transition-colors border border-[#f6e9ff]">
                <input
                  type="radio"
                  name="rejectReason"
                  value="unreadable"
                  checked={rejectReason === 'unreadable'}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="accent-[#7b2cbf]"
                />
                <span className="text-[13px] text-[#211630] font-semibold">Imagen borrosa o ilegible</span>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#faf0ff] cursor-pointer hover:bg-[#f2e3ff] transition-colors border border-[#f6e9ff]">
                <input
                  type="radio"
                  name="rejectReason"
                  value="not_received"
                  checked={rejectReason === 'not_received'}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="accent-[#7b2cbf]"
                />
                <span className="text-[13px] text-[#211630] font-semibold">Fondos aún no reflejados en banco</span>
              </label>
            </div>

            <div className="flex gap-2 mt-2">
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="flex-1 py-3 rounded-2xl bg-[#f6e9ff] text-[#4c4353] text-[13px] font-bold"
                type="button"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmRejection}
                className="flex-1 py-3 rounded-2xl bg-[#ba1a1a] text-white text-[13px] font-bold shadow-sm"
                type="button"
              >
                Confirmar Rechazo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
