import React from 'react';
import { TabType, UserRole, UserAccount } from '../types';

interface BottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  userRole: UserRole;
  currentUser?: UserAccount | null;
  clientSubTab?: 'catalogo' | 'mis-pedidos';
  onChangeClientSubTab?: (subTab: 'catalogo' | 'mis-pedidos') => void;
  isCartOpen?: boolean;
  onToggleCart?: (open: boolean) => void;
  onToggleRole: (role: UserRole) => void;
  pendingVouchersCount: number;
  criticalStockCount: number;
  cartCount: number;
  onOpenCart?: () => void;
  onOpenClientOrders?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  userRole,
  currentUser,
  clientSubTab = 'catalogo',
  onChangeClientSubTab,
  isCartOpen = false,
  onToggleCart,
  onToggleRole,
  pendingVouchersCount,
  criticalStockCount,
  cartCount,
  onOpenCart,
  onOpenClientOrders,
}) => {
  // Para usuarios clientes: los botones de Catálogo, Rastrear Pedido y Carrito
  // se ubican exclusivamente en la barra superior (Header). Por lo tanto,
  // la barra de navegación inferior no se muestra para clientes.
  if (currentUser?.role !== 'admin' || userRole !== 'admin') {
    return null;
  }

  // When logged in as Administrator: Full Workshop Administration Navigation
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 pb-safe bg-[#fff7ff]/95 backdrop-blur-xl border-t border-[#f6e9ff] shadow-[0_-4px_24px_rgba(97,0,164,0.08)]">
      <div className="max-w-md md:max-w-xl mx-auto flex justify-around items-center h-16 px-2">
        {/* Panel Tab */}
        <button
          className={`flex flex-col items-center justify-center gap-0.5 min-w-[56px] h-14 transition-all duration-200 ${
            activeTab === 'panel'
              ? 'text-[#7b2cbf] font-bold scale-105'
              : 'text-[#4c4353] hover:text-[#7b2cbf] font-medium'
          }`}
          onClick={() => onChangeTab('panel')}
          type="button"
        >
          <span
            className="material-symbols-outlined text-[22px]"
            style={{
              fontVariationSettings: activeTab === 'panel' ? "'FILL' 1" : "'FILL' 0",
            }}
          >
            grid_view
          </span>
          <span className="text-[10.5px] leading-tight font-semibold">Panel</span>
        </button>

        {/* Vouchers Tab */}
        <button
          className={`relative flex flex-col items-center justify-center gap-0.5 min-w-[56px] h-14 transition-all duration-200 ${
            activeTab === 'vouchers'
              ? 'text-[#7b2cbf] font-bold scale-105'
              : 'text-[#4c4353] hover:text-[#7b2cbf] font-medium'
          }`}
          onClick={() => onChangeTab('vouchers')}
          type="button"
        >
          <div className="relative flex items-center justify-center">
            <span
              className="material-symbols-outlined text-[22px]"
              style={{
                fontVariationSettings: activeTab === 'vouchers' ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              receipt_long
            </span>
            {pendingVouchersCount > 0 && (
              <span className="absolute -top-1 -right-2.5 min-w-[17px] h-4 px-1 rounded-full bg-[#7b2cbf] text-white text-[10px] font-bold flex items-center justify-center leading-none shadow-sm animate-pulse">
                {pendingVouchersCount}
              </span>
            )}
          </div>
          <span className="text-[10.5px] leading-tight font-semibold">Vouchers</span>
        </button>

        {/* Stock Tab */}
        <button
          className={`relative flex flex-col items-center justify-center gap-0.5 min-w-[56px] h-14 transition-all duration-200 ${
            activeTab === 'stock'
              ? 'text-[#7b2cbf] font-bold scale-105'
              : 'text-[#4c4353] hover:text-[#7b2cbf] font-medium'
          }`}
          onClick={() => onChangeTab('stock')}
          type="button"
        >
          <div className="relative flex items-center justify-center">
            <span
              className="material-symbols-outlined text-[22px]"
              style={{
                fontVariationSettings: activeTab === 'stock' ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              inventory_2
            </span>
            {criticalStockCount > 0 && (
              <span className="absolute -top-1 -right-2.5 min-w-[17px] h-4 px-1 rounded-full bg-[#d9b5ff] text-[#29074a] text-[10px] font-bold flex items-center justify-center leading-none shadow-xs ring-1 ring-[#fff7ff]">
                {criticalStockCount}
              </span>
            )}
          </div>
          <span className="text-[10.5px] leading-tight font-semibold">Stock</span>
        </button>

        {/* Pedidos Tab */}
        <button
          className={`flex flex-col items-center justify-center gap-0.5 min-w-[56px] h-14 transition-all duration-200 ${
            activeTab === 'pedidos'
              ? 'text-[#7b2cbf] font-bold scale-105'
              : 'text-[#4c4353] hover:text-[#7b2cbf] font-medium'
          }`}
          onClick={() => onChangeTab('pedidos')}
          type="button"
        >
          <span
            className="material-symbols-outlined text-[22px]"
            style={{
              fontVariationSettings: activeTab === 'pedidos' ? "'FILL' 1" : "'FILL' 0",
            }}
          >
            local_shipping
          </span>
          <span className="text-[10.5px] leading-tight font-semibold">Pedidos</span>
        </button>

        {/* Ver Catálogo (Tienda) */}
        <button
          className={`flex flex-col items-center justify-center gap-0.5 min-w-[56px] h-14 transition-all duration-200 ${
            activeTab === 'catalogo'
              ? 'text-[#7b2cbf] font-bold scale-105'
              : 'text-[#4c4353] hover:text-[#7b2cbf] font-medium'
          }`}
          onClick={() => onChangeTab('catalogo')}
          type="button"
          title="Ver Catálogo de Clientes"
        >
          <span
            className="material-symbols-outlined text-[22px]"
            style={{
              fontVariationSettings: activeTab === 'catalogo' ? "'FILL' 1" : "'FILL' 0",
            }}
          >
            storefront
          </span>
          <span className="text-[10.5px] leading-tight font-semibold">Catálogo</span>
        </button>
      </div>
    </nav>
  );
};

