import React, { useState } from 'react';

interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanResult: (code: string) => void;
}

export const ScannerModal: React.FC<ScannerModalProps> = ({
  isOpen,
  onClose,
  onScanResult,
}) => {
  const [manualCode, setManualCode] = useState('');

  if (!isOpen) return null;

  const quickSamples = [
    { label: 'Pedido #MC-2024-884', code: 'MC-2024-884' },
    { label: 'Pedido #MC-2024-882', code: 'MC-2024-882' },
    { label: 'Guía #9482-0198-4820', code: '9482-0198-4820' },
  ];

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      onScanResult(manualCode.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#372b46]/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-3xl bg-[#fff7ff] p-5 shadow-2xl border border-[#deb7ff]/50 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[24px] text-[#7b2cbf]">
              qr_code_scanner
            </span>
            <h3 className="font-rubik text-[18px] font-bold text-[#211630]">
              Escáner de Taller
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#f6e9ff] flex items-center justify-center text-[#4c4353] hover:text-[#211630] active:scale-95 transition-all"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Viewfinder simulation */}
        <div className="relative w-full h-52 bg-[#211630] rounded-2xl overflow-hidden flex flex-col items-center justify-center shadow-inner">
          <div className="absolute inset-4 border-2 border-dashed border-[#deb7ff]/60 rounded-xl flex items-center justify-center">
            {/* Animated Laser line */}
            <div className="w-full h-0.5 bg-[#deb7ff] shadow-[0_0_8px_#9d4edd] animate-bounce"></div>
          </div>
          <span className="text-[12px] font-medium text-[#deb7ff] z-10 bg-[#372b46]/80 px-3 py-1 rounded-full backdrop-blur-sm mt-auto mb-4">
            Apunta a la etiqueta o código de barras
          </span>
        </div>

        {/* Quick presets */}
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#6f5092] block mb-1.5">
            Simular Escaneo Rápido:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {quickSamples.map((sample) => (
              <button
                key={sample.code}
                onClick={() => {
                  onScanResult(sample.code);
                  onClose();
                }}
                className="px-2.5 py-1 rounded-lg bg-[#f6e9ff] hover:bg-[#deb7ff]/40 text-[#6100a4] text-[12px] font-semibold border border-[#d9b5ff] active:scale-95 transition-all"
                type="button"
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>

        {/* Manual Input */}
        <form onSubmit={handleManualSubmit} className="flex gap-2 pt-1 border-t border-[#f6e9ff]">
          <input
            type="text"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder="O escribe número de guía..."
            className="flex-1 h-10 px-3 rounded-xl bg-[#faf0ff] border border-[#d9b5ff] text-[13px] text-[#211630] placeholder-[#7e7384] focus:outline-none focus:ring-2 focus:ring-[#7b2cbf]"
          />
          <button
            type="submit"
            className="h-10 px-4 rounded-xl bg-[#7b2cbf] text-white font-bold text-[13px] hover:bg-[#6100a4] active:scale-95 transition-all"
          >
            Buscar
          </button>
        </form>
      </div>
    </div>
  );
};
