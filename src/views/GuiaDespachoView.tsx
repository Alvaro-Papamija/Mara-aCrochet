import React, { useState } from 'react';
import { Order } from '../types';
import { BRAND_LOGO } from '../data/mockData';

interface GuiaDespachoViewProps {
  order: Order;
  onBack: () => void;
  onMarkDispatched: (orderId: string) => void;
  onShowToast: (title: string, message: string, icon?: string) => void;
}

export const GuiaDespachoView: React.FC<GuiaDespachoViewProps> = ({
  order,
  onBack,
  onMarkDispatched,
  onShowToast,
}) => {
  const [checklist, setChecklist] = useState([
    { id: 1, text: 'Amigurumis envueltos en papel seda libre de ácido.', checked: true },
    { id: 2, text: 'Bolsita de lienzo artesanal con sello del taller Maraña.', checked: true },
    { id: 3, text: 'Tarjeta de agradecimiento y dedicatoria caligrafiada incluida.', checked: true },
    { id: 4, text: 'Ramita de lavanda natural del huerto del taller añadida.', checked: true },
    { id: 5, text: 'Etiqueta con instrucciones de cuidado y lavado del amigurumi.', checked: false },
    { id: 6, text: 'Caja sellada con cinta ecológica de papel kraft engomado.', checked: false },
  ]);

  const [isPrinting, setIsPrinting] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);

  const completedCount = checklist.filter((item) => item.checked).length;
  const trackingNumber = order.trackingNumber || '9482-0198-4820';

  const toggleCheck = (id: number) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      setIsPrinting(false);
      onShowToast(
        'Impresión Enviada',
        'Etiqueta 10x15cm enviada a impresora térmica Zebra ZD421',
        'print'
      );
    }, 1200);
  };

  const handleDownload = () => {
    onShowToast(
      'Guía Descargada',
      `Archivo PDF servientrega_${trackingNumber}.pdf generado`,
      'picture_as_pdf'
    );
  };

  const handleFinish = () => {
    setIsFinishing(true);
    setTimeout(() => {
      onMarkDispatched(order.id);
      setIsFinishing(false);
      onShowToast(
        '¡Pedido Empacado!',
        `#${order.id} marcado como listo para recolección de transportadora.`,
        'mark_email_read'
      );
      onBack();
    }, 1000);
  };

  const whatsappMessage = `¡Hola ${order.customerName}! 🌸 Tu pedido de Maraña Crochet ya está empacado con mucho amor e incluye tu dedicatoria especial. Tu número de guía Servientrega es ${trackingNumber}. Puedes rastrearlo en tiempo real aquí: servientrega.com/track/${trackingNumber}`;

  return (
    <div className="flex flex-col w-full px-4 pt-3 pb-32 max-w-md md:max-w-2xl mx-auto space-y-4">
      {/* Navigation and Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1 text-[#6100a4] hover:text-[#7b2cbf] text-[13px] font-bold"
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Volver a Pedidos</span>
        </button>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleDownload}
            className="p-2 rounded-xl bg-[#faf0ff] text-[#4c4353] hover:bg-[#f2e3ff] hover:text-[#6100a4] transition-colors"
            title="Descargar PDF"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">download</span>
          </button>
          <button
            onClick={handlePrint}
            className="p-2 rounded-xl bg-[#f6e9ff] text-[#6100a4] hover:bg-[#deb7ff] transition-colors"
            title="Imprimir Guía"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">print</span>
          </button>
        </div>
      </div>

      {/* Title */}
      <div>
        <div className="flex items-baseline justify-between">
          <h2 className="font-rubik text-[22px] font-bold text-[#211630]">
            Etiqueta Térmica de Envío
          </h2>
          <span className="text-[12px] text-[#6100a4] font-bold px-2 py-0.5 rounded-full bg-[#f1dbff]">
            10 x 15 cm
          </span>
        </div>
        <p className="text-[13px] text-[#4c4353]">
          Servientrega Express · Pedido #{order.id} para {order.customerName}
        </p>
      </div>

      {/* Zebra Thermal Shipping Label Card */}
      <div
        id="thermal-label"
        className="bg-white rounded-2xl p-5 shadow-md border-2 border-dashed border-[#211630]/40 text-[#211630] font-sans relative overflow-hidden"
      >
        {/* Label Header */}
        <div className="flex items-start justify-between border-b-2 border-black pb-2.5">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[24px] text-black">
                local_shipping
              </span>
              <span className="font-rubik text-[18px] font-extrabold tracking-wider text-black uppercase">
                SERVIENTREGA
              </span>
            </div>
            <span className="text-[10px] tracking-widest font-mono text-black font-bold block mt-0.5">
              NACIONAL ESTÁNDAR · ENTREGA PRIORITARIA
            </span>
          </div>
          <div className="text-right">
            <span className="inline-block border-2 border-black px-2 py-1 font-rubik text-[14px] font-extrabold uppercase">
              NVA - 41
            </span>
            <span className="text-[9px] block text-black font-mono mt-0.5">ZONA URBANA</span>
          </div>
        </div>

        {/* Vector Barcode Representation */}
        <div className="py-4 flex flex-col items-center justify-center border-b-2 border-black bg-neutral-50/50 my-2 rounded-lg">
          <div className="w-full flex items-center justify-center gap-1 h-14 px-2">
            {[4, 2, 6, 2, 5, 2, 8, 3, 2, 6, 2, 4, 3, 6, 2, 5, 2, 8, 4, 2, 6, 3, 5, 2, 4, 7, 2, 5, 3, 4, 6, 2, 5, 2, 8, 3, 4, 2, 6, 2, 5].map((w, i) => (
              <div
                key={i}
                className="h-full bg-black shrink-0"
                style={{ width: `${w * 1.5}px` }}
              ></div>
            ))}
          </div>
          <span className="font-mono text-[14px] font-extrabold tracking-[0.25em] text-black mt-1">
            *{trackingNumber}*
          </span>
        </div>

        {/* Remitente y Destinatario */}
        <div className="grid grid-cols-1 divide-y-2 divide-black text-[12px]">
          {/* Remitente */}
          <div className="py-2.5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] font-mono uppercase font-bold tracking-wider text-black block">
                [REMITENTE]
              </span>
              <div className="w-7 h-7 rounded-lg border border-black/20 p-0.5 flex items-center justify-center overflow-hidden bg-white">
                <img
                  src={BRAND_LOGO}
                  alt="Maraña"
                  className="w-full h-full object-contain scale-115"
                />
              </div>
            </div>
            <p className="font-bold text-[13px] text-black">MARAÑA CROCHET S.A.S.</p>
            <p className="text-black text-[11px]">
              Carrera 5 # 12-34, Local 102 · Centro, Neiva, Huila
            </p>
            <p className="text-black text-[11px] font-mono">Tel: +57 300 456 7890 · NIT: 901.482.109-3</p>
          </div>

          {/* Destinatario */}
          <div className="py-2.5 bg-neutral-50/60 p-2 rounded-lg my-1">
            <span className="text-[9px] font-mono uppercase font-bold tracking-wider text-black block mb-0.5">
              [DESTINATARIO]
            </span>
            <p className="font-rubik text-[16px] font-extrabold text-black">
              {order.customerName}
            </p>
            <p className="font-bold text-[13px] text-black mt-0.5">
              {order.customerAddress || 'Calle 14 # 6-32, Barrio Quirinal, Neiva'}
            </p>
            <p className="text-black text-[12px] font-medium">
              {order.customerLocation}
            </p>
            <p className="text-black text-[12px] font-mono font-bold mt-0.5">
              Cel: {order.customerPhone}
            </p>
          </div>
        </div>

        {/* Parcel Specs Grid */}
        <div className="grid grid-cols-4 gap-1 border-t-2 border-b-2 border-black py-2 mt-1 text-center font-mono text-[11px]">
          <div className="border-r border-black/40 pr-1">
            <span className="text-[8px] uppercase block font-bold">PESO</span>
            <strong className="text-[12px]">0.85 KG</strong>
          </div>
          <div className="border-r border-black/40 pr-1">
            <span className="text-[8px] uppercase block font-bold">PIEZAS</span>
            <strong className="text-[12px]">2 UDS</strong>
          </div>
          <div className="border-r border-black/40 pr-1">
            <span className="text-[8px] uppercase block font-bold">VALOR</span>
            <strong className="text-[12px]">$349K</strong>
          </div>
          <div>
            <span className="text-[8px] uppercase block font-bold">FECHA</span>
            <strong className="text-[12px]">HOY</strong>
          </div>
        </div>

        {/* Bottom Notice & Simulated QR Code */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex-1 pr-2">
            <span className="text-[10px] font-bold text-black uppercase tracking-wider block">
              ⚠ FRÁGIL · TEXTILES ARTESANALES
            </span>
            <p className="text-[10px] text-black mt-0.5 leading-tight">
              Contenido exclusivo tejido a mano. Proteger de humedad o rasgaduras en transporte.
            </p>
          </div>
          <div className="w-14 h-14 border-2 border-black p-1 flex items-center justify-center shrink-0 bg-black text-white font-mono text-[9px] rounded">
            <span className="material-symbols-outlined text-[32px] text-white">qr_code_2</span>
          </div>
        </div>
      </div>

      {/* Packaging Checklist */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-[#f6e9ff] flex flex-col gap-3">
        <div className="flex items-center justify-between pb-1 border-b border-[#f6e9ff]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#7b2cbf] text-[20px]">task_alt</span>
            <h3 className="font-rubik text-[16px] text-[#211630] font-bold">
              Checklist de Embalaje Maraña
            </h3>
          </div>
          <span
            className={`px-3 py-0.5 rounded-full text-[11px] font-bold ${
              completedCount === checklist.length
                ? 'bg-[#efdbff] text-[#29074a]'
                : 'bg-[#faf0ff] text-[#6100a4]'
            }`}
          >
            {completedCount} / {checklist.length} completados
          </span>
        </div>

        <div className="space-y-2">
          {checklist.map((item) => (
            <label
              key={item.id}
              className={`flex items-start gap-3 p-2.5 rounded-2xl cursor-pointer transition-colors border ${
                item.checked
                  ? 'bg-[#faf0ff] border-[#deb7ff]'
                  : 'bg-white border-[#f6e9ff] hover:bg-[#faf0ff]'
              }`}
            >
              <input
                type="checkbox"
                checked={item.checked}
                onChange={() => toggleCheck(item.id)}
                className="w-5 h-5 rounded-md accent-[#7b2cbf] mt-0.5 cursor-pointer"
              />
              <span
                className={`text-[13px] leading-snug select-none flex-1 ${
                  item.checked ? 'text-[#211630] font-semibold' : 'text-[#4c4353]'
                }`}
              >
                {item.text}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* WhatsApp Message Preview */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-[#f6e9ff] flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="font-rubik text-[15px] text-[#211630] font-bold flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#6f5092] text-[18px]">chat</span>
            Notificación de WhatsApp al Cliente
          </span>
          <span className="text-[11px] text-[#6f5092] font-semibold">Listo para enviar</span>
        </div>
        <p className="text-[12px] text-[#4c4353]">
          Enviar número de guía y mensaje de despacho a {order.customerName} automáticamente:
        </p>
        <div className="bg-[#faf0ff] p-3 rounded-2xl border border-[#f6e9ff] text-[12px] text-[#211630] italic leading-relaxed">
          &quot;{whatsappMessage}&quot;
        </div>
        <a
          href={`https://wa.me/${order.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
            whatsappMessage
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 w-full py-2.5 px-4 rounded-xl bg-[#6f5092] hover:bg-[#6100a4] text-white text-[13px] font-bold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">send</span>
          <span>Enviar Notificación por WhatsApp</span>
        </a>
      </div>

      {/* Floating Bottom Action Bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-[#fff7ff]/95 backdrop-blur-xl p-4 shadow-2xl border-t border-[#f6e9ff] pb-safe">
        <div className="max-w-md md:max-w-2xl mx-auto flex items-center gap-3">
          <button
            onClick={handlePrint}
            disabled={isPrinting}
            className="flex-1 py-3.5 px-3 rounded-2xl bg-[#f6e9ff] text-[#6100a4] text-[13px] font-bold flex items-center justify-center gap-1.5 hover:bg-[#deb7ff] active:scale-95 transition-all"
            type="button"
          >
            <span
              className={`material-symbols-outlined text-[18px] ${
                isPrinting ? 'animate-spin' : ''
              }`}
            >
              {isPrinting ? 'sync' : 'print'}
            </span>
            <span>{isPrinting ? 'Enviando...' : 'Imprimir Etiqueta'}</span>
          </button>
          <button
            onClick={handleFinish}
            disabled={isFinishing}
            className="flex-[1.5] py-3.5 px-4 rounded-2xl bg-[#7b2cbf] hover:bg-[#6100a4] text-white text-[13px] font-bold flex items-center justify-center gap-2 shadow-md shadow-[#7b2cbf]/25 active:scale-95 transition-all"
            type="button"
          >
            <span
              className={`material-symbols-outlined text-[20px] ${
                isFinishing ? 'animate-spin' : ''
              }`}
            >
              {isFinishing ? 'sync' : 'done_all'}
            </span>
            <span>{isFinishing ? 'Guardando...' : 'Marcar como Empacado y Listo'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
