import React, { useState } from 'react';
import { Voucher } from '../types';

interface VouchersViewProps {
  vouchers: Voucher[];
  onOpenVoucherDetail: (voucher: Voucher) => void;
  onQuickApprove: (voucherId: string) => void;
  onShowToast: (title: string, message: string, icon?: string) => void;
}

export const VouchersView: React.FC<VouchersViewProps> = ({
  vouchers,
  onOpenVoucherDetail,
  onQuickApprove,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'pendiente' | 'aprobado' | 'rechazado'>('pendiente');
  const [previewVoucher, setPreviewVoucher] = useState<Voucher | null>(null);

  const filteredVouchers = vouchers.filter((v) => {
    const matchesStatus = v.status === selectedStatus;
    const matchesSearch =
      v.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.approvalCode.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const pendingCount = vouchers.filter((v) => v.status === 'pendiente').length;
  const approvedCount = 24 + vouchers.filter((v) => v.status === 'aprobado').length;
  const rejectedCount = 2 + vouchers.filter((v) => v.status === 'rechazado').length;

  const totalPendingAmount = vouchers
    .filter((v) => v.status === 'pendiente')
    .reduce((sum, v) => sum + v.totalAmount, 0);

  return (
    <div className="flex flex-col w-full px-4 pt-3 pb-28 max-w-md md:max-w-2xl mx-auto space-y-4">
      {/* Header Context */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#7b2cbf] animate-ping"></span>
            <span className="text-[12px] text-[#7b2cbf] font-extrabold uppercase tracking-wider">
              Mesa de Validación
            </span>
          </div>
          <span className="text-[12px] text-[#4c4353] flex items-center gap-1 font-medium">
            <span className="material-symbols-outlined text-[15px] text-[#6f5092]">sync</span>
            Actualizado hace 2m
          </span>
        </div>

        {/* Summary Hero Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#faf0ff] via-[#f6e9ff] to-[#f2e3ff] border border-[#eddcff] shadow-sm p-4">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-[#7b2cbf]/10 pointer-events-none blur-xl"></div>
          <div className="flex flex-col gap-2 relative z-10">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] text-[#6f5092] uppercase tracking-wider font-bold">
                  Total en espera
                </span>
                <div className="font-rubik text-[24px] text-[#7b2cbf] font-extrabold tracking-tight leading-tight mt-0.5">
                  ${totalPendingAmount.toLocaleString('es-CO')}{' '}
                  <span className="text-[13px] font-semibold text-[#6f5092]">COP</span>
                </div>
              </div>
              <div className="px-3 py-1 rounded-full bg-[#7b2cbf] text-white text-[12px] font-bold flex items-center gap-1 shadow-sm">
                <span className="material-symbols-outlined text-[14px]">hourglass_top</span>
                {pendingCount} órdenes
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-[#eddcff]/80">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#efdbff] flex items-center justify-center text-[#7b2cbf]">
                  <span className="material-symbols-outlined text-[17px]">speed</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] text-[#4c4353] leading-none">Tiempo medio</span>
                  <span className="text-[13px] text-[#211630] font-bold mt-0.5">18 minutos</span>
                </div>
              </div>
              <div className="h-6 w-px bg-[#eddcff]"></div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#f1dbff] flex items-center justify-center text-[#7b2cbf]">
                  <span className="material-symbols-outlined text-[17px]">verified</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] text-[#4c4353] leading-none">Efectividad</span>
                  <span className="text-[13px] text-[#211630] font-bold mt-0.5">97.8% hoy</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-[#6f5092]">
          <span className="material-symbols-outlined text-[20px]">search</span>
        </div>
        <input
          className="w-full h-12 pl-11 pr-10 rounded-2xl bg-white text-[#211630] text-[14px] border border-[#f6e9ff] shadow-sm placeholder:text-[#7e7384] focus:outline-none focus:ring-2 focus:ring-[#7b2cbf] transition-all"
          placeholder="Buscar por #pedido, clienta o ref. bancaria..."
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery ? (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-2 flex items-center px-2 text-[#7e7384] hover:text-[#211630]"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        ) : (
          <button
            onClick={() => onShowToast('Filtros', 'Opciones de ordenamiento activadas', 'tune')}
            className="absolute inset-y-0 right-2 flex items-center px-2 text-[#4c4353] hover:text-[#7b2cbf]"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">tune</span>
          </button>
        )}
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setSelectedStatus('pendiente')}
          className={`px-4 py-2 rounded-full text-[13px] font-bold flex items-center gap-2 shrink-0 transition-all active:scale-95 ${
            selectedStatus === 'pendiente'
              ? 'bg-[#7b2cbf] text-white shadow-md shadow-[#7b2cbf]/25'
              : 'bg-[#f6e9ff] text-[#6f5092] hover:bg-[#efdbff]'
          }`}
          type="button"
        >
          <span>Pendientes</span>
          <span
            className={`w-5 h-5 rounded-full text-[11px] font-extrabold flex items-center justify-center ${
              selectedStatus === 'pendiente' ? 'bg-white/25 text-white' : 'bg-[#efdbff] text-[#7b2cbf]'
            }`}
          >
            {pendingCount}
          </span>
        </button>

        <button
          onClick={() => setSelectedStatus('aprobado')}
          className={`px-4 py-2 rounded-full text-[13px] font-semibold flex items-center gap-2 shrink-0 transition-all ${
            selectedStatus === 'aprobado'
              ? 'bg-[#7b2cbf] text-white shadow-md shadow-[#7b2cbf]/25 font-bold'
              : 'bg-[#f6e9ff] text-[#6f5092] hover:bg-[#efdbff]'
          }`}
          type="button"
        >
          <span>Aprobados</span>
          <span className="w-5 h-5 rounded-full bg-[#efdbff] text-[#7b2cbf] text-[11px] font-bold flex items-center justify-center">
            {approvedCount}
          </span>
        </button>

        <button
          onClick={() => setSelectedStatus('rechazado')}
          className={`px-4 py-2 rounded-full text-[13px] font-semibold flex items-center gap-2 shrink-0 transition-all ${
            selectedStatus === 'rechazado'
              ? 'bg-[#7b2cbf] text-white shadow-md shadow-[#7b2cbf]/25 font-bold'
              : 'bg-[#f6e9ff] text-[#6f5092] hover:bg-[#efdbff]'
          }`}
          type="button"
        >
          <span>Rechazados</span>
          <span className="w-5 h-5 rounded-full bg-[#eddcff] text-[#4c4353] text-[11px] font-bold flex items-center justify-center">
            {rejectedCount}
          </span>
        </button>
      </div>

      {/* Voucher Cards Feed */}
      <div className="flex flex-col gap-4">
        {filteredVouchers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-white rounded-3xl border border-[#f6e9ff]">
            <div className="w-16 h-16 rounded-full bg-[#f2e3ff] flex items-center justify-center text-[#7e7384] mb-3">
              <span className="material-symbols-outlined text-[32px]">inventory_2</span>
            </div>
            <p className="font-rubik text-[16px] text-[#211630] font-bold">
              No hay comprobantes en esta sección
            </p>
            <p className="text-[13px] text-[#4c4353] mt-1 max-w-xs">
              {searchQuery
                ? 'Prueba con otro término de búsqueda o número de pedido.'
                : 'Todos los pagos de este estado han sido procesados.'}
            </p>
          </div>
        ) : (
          filteredVouchers.map((voucher) => (
            <article
              key={voucher.id}
              className="bg-white rounded-3xl shadow-sm border border-[#f6e9ff] overflow-hidden flex flex-col transition-all duration-200 hover:shadow-md hover:border-[#d9b5ff]"
            >
              {/* Card Top */}
              <div className="p-4 pb-2 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-rubik text-[16px] text-[#211630] font-bold">
                      #{voucher.orderId}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#d9b5ff]"></span>
                    <span className="text-[12px] text-[#6f5092] font-medium">{voucher.timeAgo}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#efdbff] text-[#29074a] text-[11px] font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#7b2cbf] animate-pulse"></span>
                    En Espera
                  </span>
                </div>

                <div className="flex items-baseline justify-between mt-1">
                  <div className="flex flex-col min-w-0 flex-1 pr-2">
                    <h3 className="font-rubik text-[16px] text-[#211630] font-bold tracking-tight truncate">
                      {voucher.customerName}
                    </h3>
                    <span className="text-[12px] text-[#6f5092] flex items-center gap-1 mt-0.5 truncate">
                      <span className="material-symbols-outlined text-[14px]">local_shipping</span>
                      {voucher.shippingMethod}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="px-2.5 py-0.5 rounded-xl bg-[#f6e9ff] inline-block font-rubik text-[18px] text-[#6100a4] font-extrabold tracking-tight">
                      ${voucher.totalAmount.toLocaleString('es-CO')}
                    </div>
                    <div className="text-[11px] text-[#6f5092] mt-0.5 font-semibold">
                      {voucher.paymentMethod}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Middle: Preview & Items */}
              <div className="px-3.5 py-2.5 flex gap-3 items-stretch bg-[#faf0ff] border border-[#f6e9ff] mx-3.5 rounded-2xl">
                {/* Thumbnail */}
                <button
                  onClick={() => setPreviewVoucher(voucher)}
                  className="relative w-20 h-24 rounded-xl overflow-hidden shrink-0 group focus:outline-none shadow-sm ring-1 ring-[#d9b5ff]"
                  type="button"
                >
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    src={voucher.receiptThumbUrl}
                    alt={`Comprobante ${voucher.orderId}`}
                  />
                  <div className="absolute inset-0 bg-[#7b2cbf]/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined text-white text-[20px]">zoom_in</span>
                  </div>
                  <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-[#fff7ff]/90 text-[#7b2cbf] text-[9px] font-bold shadow">
                    REF
                  </span>
                </button>

                {/* Items preview */}
                <div className="flex flex-col justify-between py-1 min-w-0 flex-1">
                  <div className="flex flex-col gap-1">
                    {voucher.itemsSummary.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#6f5092] shrink-0"></span>
                        <span className="text-[12px] text-[#211630] truncate font-medium">
                          {item.name}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-[#4c4353] pt-1 border-t border-[#f6e9ff]">
                    <span className="text-[11px] text-[#6f5092]">
                      Ref: <span className="text-[#211630] font-mono font-bold">{voucher.approvalCode}</span>
                    </span>
                    <span className="text-[11px] text-[#7b2cbf] font-bold flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[13px]">handyman</span> Hecho a mano
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Bottom: Actions */}
              <div className="p-3.5 flex items-center gap-2">
                <button
                  onClick={() => onOpenVoucherDetail(voucher)}
                  className="flex-1 h-11 rounded-2xl bg-[#7b2cbf] hover:bg-[#680eac] text-white text-[13px] font-bold flex items-center justify-center gap-1.5 shadow-md shadow-[#7b2cbf]/20 active:scale-95 transition-all"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">visibility</span>
                  Revisar Comprobante
                </button>
                <button
                  aria-label="Aprobar Rápido"
                  onClick={() => onQuickApprove(voucher.id)}
                  className="w-11 h-11 rounded-2xl bg-[#efdbff] text-[#29074a] hover:bg-[#deb7ff] active:scale-95 flex items-center justify-center transition-all shadow-sm shrink-0"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[22px]">check</span>
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      {/* Fast Receipt Modal Preview */}
      {previewVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#372b46]/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-sm p-4 shadow-2xl flex flex-col gap-3">
            <div className="flex items-center justify-between pb-1 border-b border-[#f6e9ff]">
              <div>
                <span className="text-[11px] font-bold uppercase text-[#7b2cbf]">
                  #{previewVoucher.orderId}
                </span>
                <h4 className="font-rubik text-[16px] font-bold text-[#211630]">
                  {previewVoucher.customerName}
                </h4>
              </div>
              <button
                onClick={() => setPreviewVoucher(null)}
                className="w-8 h-8 rounded-full bg-[#f6e9ff] flex items-center justify-center text-[#4c4353]"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="w-full h-72 bg-[#faf0ff] rounded-2xl overflow-hidden border border-[#f6e9ff] flex items-center justify-center">
              <img
                src={previewVoucher.receiptFullUrl}
                alt="Comprobante completo"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => {
                  const v = previewVoucher;
                  setPreviewVoucher(null);
                  onOpenVoucherDetail(v);
                }}
                className="flex-1 py-3 rounded-2xl bg-[#7b2cbf] text-white text-[13px] font-bold shadow-md"
                type="button"
              >
                Inspección Completa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
