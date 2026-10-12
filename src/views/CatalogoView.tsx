import React, { useState, useEffect } from 'react';
import { StockProduct, CartItem, Order, Voucher, UserAccount } from '../types';
import { BRAND_LOGO } from '../data/mockData';
import {
  getNotificationPermission,
  requestNotificationPermission,
  notifyOrderStatus,
  scheduleSimulatedBackgroundNotification,
} from '../services/notificationService';
import { FacturaModal } from '../components/FacturaModal';
import { generateArtisanInvoicePDF } from '../services/pdfService';

interface CatalogoViewProps {
  products: StockProduct[];
  cart: CartItem[];
  orders: Order[];
  currentUser?: UserAccount | null;
  activeClientTab?: 'catalogo' | 'mis-pedidos';
  onChangeClientTab?: (tab: 'catalogo' | 'mis-pedidos') => void;
  isCartOpen?: boolean;
  onToggleCart?: (open: boolean) => void;
  onAddToCart: (product: StockProduct, quantity?: number) => void;
  onUpdateCartQty: (sku: string, delta: number) => void;
  onRemoveFromCart: (sku: string) => void;
  onPlaceOrder: (orderData: {
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    customerLocation: string;
    specialNote: string;
    shippingMethod: string;
    shippingCost: number;
    paymentMethod: string;
    receiptUrl: string;
    items: {
      name: string;
      specs: string;
      quantity: number;
      price: number;
      imageUrl: string;
    }[];
    totalAmount: number;
  }) => void;
  onSwitchToAdmin?: () => void;
  onShowToast: (title: string, message: string, icon?: string) => void;
  onOpenNotificationsModal?: () => void;
  onUpdateOrder?: (order: Order) => void;
}

export const CatalogoView: React.FC<CatalogoViewProps> = ({
  products,
  cart,
  orders,
  currentUser,
  activeClientTab: externalActiveClientTab,
  onChangeClientTab,
  isCartOpen: externalIsCartOpen,
  onToggleCart,
  onAddToCart,
  onUpdateCartQty,
  onRemoveFromCart,
  onPlaceOrder,
  onSwitchToAdmin,
  onShowToast,
  onOpenNotificationsModal,
  onUpdateOrder,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<StockProduct | null>(null);
  const [internalIsCartOpen, setInternalIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [internalActiveClientTab, setInternalActiveClientTab] = useState<'catalogo' | 'mis-pedidos'>('catalogo');
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [activeSimulatingOrder, setActiveSimulatingOrder] = useState<string | null>(null);
  const [simulatingTimer, setSimulatingTimer] = useState<number | null>(null);
  const [selectedFacturaOrder, setSelectedFacturaOrder] = useState<Order | null>(null);
  const [downloadingOrderId, setDownloadingOrderId] = useState<string | null>(null);

  const handleDirectDownloadPDF = async (order: Order) => {
    try {
      setDownloadingOrderId(order.id);
      await generateArtisanInvoicePDF(order);
      onShowToast(
        'Factura Descargada',
        `Factura_Artesanal_Marana_${order.id}.pdf guardada en tus descargas.`,
        'picture_as_pdf'
      );
    } catch (err) {
      console.error('Error generando factura:', err);
      onShowToast('Error', 'No se pudo generar la factura en PDF.', 'error');
    } finally {
      setDownloadingOrderId(null);
    }
  };

  useEffect(() => {
    setNotifPermission(getNotificationPermission());
  }, []);

  const activeClientTab = externalActiveClientTab !== undefined ? externalActiveClientTab : internalActiveClientTab;
  const setActiveClientTab = (tab: 'catalogo' | 'mis-pedidos') => {
    if (onChangeClientTab) onChangeClientTab(tab);
    setInternalActiveClientTab(tab);
  };

  const isCartOpen = externalIsCartOpen !== undefined ? externalIsCartOpen : internalIsCartOpen;
  const setIsCartOpen = (open: boolean) => {
    if (onToggleCart) onToggleCart(open);
    setInternalIsCartOpen(open);
  };

  // Checkout form state
  const [clientName, setClientName] = useState(currentUser?.name || '');
  const [clientPhone, setClientPhone] = useState(currentUser?.phone || '');
  const [clientAddress, setClientAddress] = useState(currentUser?.address || '');
  const [clientCity, setClientCity] = useState(currentUser?.city || 'Neiva, Huila');
  const [specialDedication, setSpecialDedication] = useState('');

  // Sync checkout fields whenever currentUser changes
  React.useEffect(() => {
    if (currentUser) {
      if (currentUser.name) setClientName(currentUser.name);
      if (currentUser.phone) setClientPhone(currentUser.phone);
      if (currentUser.address) setClientAddress(currentUser.address);
      if (currentUser.city) setClientCity(currentUser.city);
    }
  }, [currentUser]);
  const [shippingType, setShippingType] = useState<'nacional' | 'local' | 'taller'>('nacional');
  const [paymentMethod, setPaymentMethod] = useState<'bancolombia' | 'nequi' | 'daviplata'>('bancolombia');
  const [receiptSample, setReceiptSample] = useState(
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDMRgqek519UGxy9n1Wd5Ux9s1ZvRlyjXNz6q-rQU_Gf45RKq-rAd_Pnz-5bfYXWeGKC2ZiP7bpgjnEwuvDq7D6blVCh5ZR92RRbjZNyPLh3OpEdyLV1ggBcg0EGGbpo3UmQk9Q31S5ly607yOSJymTBtykqzzPGsbavjOjuSfEE4WPFo2bSFLAMvSSwBfZwLyZlPWpVKwgDoC7til_SR18XQQUK5JGNZ-EZToSDRyVupFZiVShbQbJiQ'
  );
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  // Filter products by category
  const filteredProducts = products.filter((p) => {
    let matchesCategory = true;
    if (selectedCategory === 'bosque') {
      matchesCategory = p.name.includes('Zorro') || p.name.includes('Conejito') || p.name.includes('Osita');
    } else if (selectedCategory === 'fantasia') {
      matchesCategory = p.name.includes('Dragón') || p.name.includes('Ajolote');
    } else if (selectedCategory === 'ninez') {
      matchesCategory = p.name.includes('Dinosaurio') || p.tag.includes('Niñez');
    } else if (selectedCategory === 'minis') {
      matchesCategory = p.sku.includes('07') || p.tag.includes('Llavero') || p.name.includes('Mini');
    } else if (selectedCategory === 'pedido') {
      matchesCategory = p.category === 'pedido' || p.tag.includes('Pedido');
    }

    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tag.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cart.reduce(
    (acc, item) => acc + item.product.priceCOP * item.quantity,
    0
  );

  const shippingCost =
    shippingType === 'nacional' ? 14000 : shippingType === 'local' ? 10000 : 0;
  const cartGrandTotal = cartSubtotal + (cartItemsCount > 0 ? shippingCost : 0);

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientPhone.trim() || !clientAddress.trim()) {
      onShowToast('Campos requeridos', 'Por favor completa nombre, teléfono y dirección', 'warning');
      return;
    }

    setIsSubmittingOrder(true);
    setTimeout(() => {
      onPlaceOrder({
        customerName: clientName.trim(),
        customerPhone: clientPhone.trim(),
        customerAddress: clientAddress.trim(),
        customerLocation: clientCity,
        specialNote: specialDedication.trim(),
        shippingMethod:
          shippingType === 'nacional'
            ? 'Envío Servientrega Nacional'
            : shippingType === 'local'
            ? 'Envío Local Express'
            : 'Retiro en Taller Maraña',
        shippingCost,
        paymentMethod:
          paymentMethod === 'bancolombia'
            ? 'Bancolombia Transfer'
            : paymentMethod === 'nequi'
            ? 'Nequi Móvil'
            : 'Daviplata App',
        receiptUrl: receiptSample,
        items: cart.map((c) => ({
          name: c.product.name,
          specs: `${c.product.size} · ${c.product.supplier}`,
          quantity: c.quantity,
          price: c.product.priceCOP,
          imageUrl: c.product.imageUrl,
        })),
        totalAmount: cartGrandTotal,
      });

      setIsSubmittingOrder(false);
      setIsCheckoutOpen(false);
      setIsCartOpen(false);
      setActiveClientTab('mis-pedidos');
      onShowToast(
        '¡Pedido Enviado!',
        'Tu comprobante fue remitido al taller para validación inmediata.',
        'task_alt'
      );
    }, 1200);
  };

  return (
    <div className={`flex flex-col w-full px-4 pt-3 ${currentUser?.role === 'admin' ? 'pb-28' : 'pb-14'} max-w-md md:max-w-2xl mx-auto space-y-4`}>
      {/* Admin Preview Notice (Only visible when an Administrator is logged in) */}
      {currentUser?.role === 'admin' && (
        <div className="bg-gradient-to-r from-[#f1dbff] via-[#faf0ff] to-[#efdbff] p-3 rounded-2xl border border-[#d9b5ff] flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-8 h-8 rounded-xl bg-[#7b2cbf] text-white flex items-center justify-center shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
            </span>
            <div className="min-w-0">
              <span className="text-[10px] text-[#6100a4] font-extrabold uppercase tracking-wider block">
                Sesión Administradora Activa
              </span>
              <p className="text-[12px] text-[#211630] font-bold truncate">
                Vista previa del catálogo de clientas
              </p>
            </div>
          </div>
          {onSwitchToAdmin && (
            <button
              onClick={onSwitchToAdmin}
              className="shrink-0 px-3 py-1.5 rounded-xl bg-[#7b2cbf] text-white text-[11px] font-bold hover:bg-[#6100a4] transition-all active:scale-95 shadow-xs flex items-center gap-1"
              type="button"
            >
              <span className="material-symbols-outlined text-[14px]">grid_view</span>
              <span>Volver a Taller</span>
            </button>
          )}
        </div>
      )}


      {/* CATALOG VIEW SECTION */}
      {activeClientTab === 'catalogo' && (
        <div className="space-y-4">
          {/* Artisan Brand Header Card with balanced spaces */}
          <div className="bg-gradient-to-r from-white via-[#faf2ff] to-[#f4e4ff] rounded-3xl p-4 sm:p-5 border border-[#eedbff] shadow-xs flex items-center gap-3.5 sm:gap-4.5">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white border border-[#deb7ff]/70 shadow-2xs p-1 flex items-center justify-center shrink-0 overflow-hidden">
              <img
                src={BRAND_LOGO}
                alt="Maraña Crochet"
                className="w-full h-full object-contain scale-115"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-rubik text-[16px] sm:text-[18px] font-extrabold text-[#211630] leading-tight">
                  Maraña Crochet
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-[#f1dbff] text-[#6100a4] font-bold text-[10px] tracking-wide">
                  Neiva, Huila
                </span>
              </div>
              <p className="text-[12px] sm:text-[13px] text-[#6f5092] mt-0.5 leading-snug">
                Amigurumis artesanales tejidos a mano con fibras naturales y amor.
              </p>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-3.5 top-3 text-[#6f5092] text-[20px] pointer-events-none">
              search
            </span>
            <input
              type="text"
              placeholder="Buscar por amigurumi, personaje o hilo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-10 rounded-2xl bg-white text-[#211630] text-[13px] border border-[#f6e9ff] shadow-sm placeholder:text-[#7e7384] focus:outline-none focus:ring-2 focus:ring-[#7b2cbf]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-[#7e7384] hover:text-[#211630]"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {[
              { id: 'todas', label: 'Todos los Amigurumis' },
              { id: 'bosque', label: 'Animalitos del Bosque' },
              { id: 'fantasia', label: 'Fantasía & Mágicos' },
              { id: 'ninez', label: 'Dinosaurios & Niñez' },
              { id: 'minis', label: 'Minis & Llaveros' },
              { id: 'pedido', label: 'Bajo Pedido' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-[12px] font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-[#7b2cbf] text-white shadow-sm'
                    : 'bg-[#f6e9ff] text-[#4c4353] hover:bg-[#eddcff]'
                }`}
                type="button"
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {filteredProducts.map((product) => {
              const isOutOfStock = product.currentStock === 0 && product.category === 'agotado';
              const isMadeToOrder = product.category === 'pedido';

              return (
                <div
                  key={product.sku}
                  className="bg-white rounded-3xl p-3.5 shadow-sm border border-[#f6e9ff] flex flex-col justify-between hover:border-[#d9b5ff] transition-all hover:shadow-md group"
                >
                  <div className="relative w-full h-48 rounded-2xl overflow-hidden bg-[#faf0ff] mb-3">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      <span className="px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-sm text-[#6100a4] text-[10px] font-bold shadow-xs">
                        {product.tag}
                      </span>
                    </div>

                    {isOutOfStock ? (
                      <div className="absolute inset-0 bg-[#372b46]/50 flex items-center justify-center">
                        <span className="px-3 py-1 rounded-full bg-[#ba1a1a] text-white text-[11px] font-bold uppercase shadow">
                          Agotado temporalmente
                        </span>
                      </div>
                    ) : isMadeToOrder ? (
                      <span className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded-full bg-[#ffdf9f] text-[#261a00] text-[10px] font-bold shadow-xs">
                        Por Encargo · 7 días
                      </span>
                    ) : (
                      <span className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded-full bg-[#efdbff] text-[#29074a] text-[10px] font-bold shadow-xs">
                        Stock Inmediato: {product.currentStock} uds
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col flex-1 justify-between">
                    <div>
                      <h3 className="font-rubik text-[16px] font-bold text-[#211630] leading-snug">
                        {product.name}
                      </h3>
                      <p className="text-[12px] text-[#6f5092] mt-0.5 truncate font-medium">
                        {product.supplier}
                      </p>
                      <div className="mt-2 flex items-baseline justify-between">
                        <span className="font-rubik text-[18px] text-[#6100a4] font-extrabold">
                          ${product.priceCOP.toLocaleString('es-CO')}
                        </span>
                        <span className="text-[11px] text-[#7e7384] font-bold">COP</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-[#f6e9ff] flex items-center gap-2">
                      <button
                        onClick={() => setSelectedProduct(product)}
                        className="flex-1 py-2 px-2 rounded-xl bg-[#faf0ff] text-[#4c4353] hover:text-[#6100a4] hover:bg-[#f2e3ff] text-[12px] font-bold transition-colors"
                        type="button"
                      >
                        Ver Detalle
                      </button>

                      {isOutOfStock ? (
                        <button
                          onClick={() =>
                            onShowToast(
                              'Anotada en Lista de Espera',
                              'Te avisaremos apenas el taller complete una nueva pieza',
                              'favorite'
                            )
                          }
                          className="py-2 px-3 rounded-xl bg-[#ffdad6] text-[#ba1a1a] text-[12px] font-bold hover:bg-[#ffdad6]/80 transition-colors"
                          type="button"
                        >
                          Avisarme
                        </button>
                      ) : (
                        <button
                          onClick={() => onAddToCart(product)}
                          className="py-2 px-3 rounded-xl bg-[#7b2cbf] hover:bg-[#6100a4] text-white text-[12px] font-bold flex items-center gap-1 shadow-sm active:scale-95 transition-all"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[16px]">add_shopping_cart</span>
                          <span>Bolsa</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TRACK MY ORDER SECTION */}
      {activeClientTab === 'mis-pedidos' && (
        <div className="space-y-4">
          {/* Header Card */}
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-[#f6e9ff]">
            <h3 className="font-rubik text-[16px] text-[#211630] font-bold flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#7b2cbf] text-[20px]">
                local_shipping
              </span>
              Estado de Pedidos & Envíos Activos
            </h3>
            <p className="text-[12px] text-[#4c4353] mt-0.5">
              Seguimiento en tiempo real desde el taller artesanal en Neiva hasta la puerta de tu casa.
            </p>
          </div>

          {/* Browser Notification Service Banner */}
          <div className="p-4 rounded-3xl bg-gradient-to-r from-white via-[#faf2ff] to-[#f4e4ff] border border-[#deb7ff] shadow-xs flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#7b2cbf] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <span className="material-symbols-outlined text-[22px]">notifications_active</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-rubik text-[14px] font-bold text-[#211630]">
                      Avisos en el Navegador en Tiempo Real
                    </h4>
                    {notifPermission === 'granted' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#e0f8e9] text-[#0e7c3a] border border-[#a6eec1]">
                        Activo
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#fff3d4] text-[#8a5b00]">
                        Inactivo
                      </span>
                    )}
                  </div>
                  <p className="text-[11.5px] text-[#554666] mt-0.5 leading-snug">
                    Recibe alertas automáticas en tu dispositivo sobre cada avance de tu amigurumi <strong>sin necesidad de entrar a la app</strong> (incluso si cierras la ventana o estás en otra pestaña).
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1 border-t border-[#f0dbff] flex-wrap">
              {notifPermission !== 'granted' ? (
                <button
                  type="button"
                  onClick={async () => {
                    const res = await requestNotificationPermission();
                    setNotifPermission(res);
                    if (res === 'granted') {
                      onShowToast('Avisos Activados', 'Recibirás avisos en el navegador cuando cambie tu pedido.', 'notifications_active');
                    } else if (res === 'denied') {
                      onShowToast('Permiso Bloqueado', 'Desbloquea las notificaciones en la barra de tu navegador.', 'notifications_off');
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl bg-[#7b2cbf] hover:bg-[#6100a4] text-white text-[12px] font-bold flex items-center gap-1.5 shadow-xs active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined text-[16px]">notifications</span>
                  <span>Activar Notificaciones en el Navegador</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={async () => {
                    if (orders[0]) {
                      await notifyOrderStatus(
                        orders[0],
                        'Comprobación de alerta: Tu navegador está listo para recibir el estado real de tus pedidos de Maraña Crochet.'
                      );
                      onShowToast('Aviso Emitido', 'Revisa la barra de alertas o centro de notificaciones de tu sistema.', 'notifications');
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#0e7c3a] hover:bg-[#095829] text-white text-[11.5px] font-bold flex items-center gap-1.5 active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined text-[15px]">send</span>
                  <span>Enviar Alerta de Prueba</span>
                </button>
              )}

              {onOpenNotificationsModal && (
                <button
                  type="button"
                  onClick={onOpenNotificationsModal}
                  className="px-3 py-1.5 rounded-xl bg-white border border-[#deb7ff] text-[#6100a4] hover:bg-[#faf0ff] text-[11.5px] font-bold flex items-center gap-1 transition-all"
                >
                  <span className="material-symbols-outlined text-[15px]">settings</span>
                  <span>Historial & Preferencias</span>
                </button>
              )}
            </div>
          </div>

          {/* Orders List */}
          <div className="space-y-4">
            {orders.map((order) => {
              const isSimulatingThis = activeSimulatingOrder === order.id;

              const stepIndex =
                order.status === 'preparacion'
                  ? 1
                  : order.status === 'listo'
                  ? 2
                  : order.status === 'transito'
                  ? 3
                  : 4;

              const handleSimulateBackgroundForOrder = () => {
                if (notifPermission !== 'granted') {
                  onShowToast('Permiso Requerido', 'Primero presiona "Activar Notificaciones en el Navegador"', 'notifications_off');
                  return;
                }

                const nextStatus: 'preparacion' | 'listo' | 'transito' | 'entregado' =
                  order.status === 'preparacion'
                    ? 'listo'
                    : order.status === 'listo'
                    ? 'transito'
                    : order.status === 'transito'
                    ? 'entregado'
                    : 'preparacion';

                setActiveSimulatingOrder(order.id);
                setSimulatingTimer(6);
                onShowToast(
                  'Prueba de 6s Iniciada',
                  'Minimiza o abre otra pestaña ahora para recibir el aviso en tu sistema.',
                  'tab'
                );

                let sec = 6;
                const interval = setInterval(() => {
                  sec -= 1;
                  if (sec <= 0) {
                    clearInterval(interval);
                    setSimulatingTimer(null);
                    setActiveSimulatingOrder(null);
                  } else {
                    setSimulatingTimer(sec);
                  }
                }, 1000);

                scheduleSimulatedBackgroundNotification(
                  order,
                  nextStatus,
                  6,
                  (updated) => {
                    if (onUpdateOrder) {
                      onUpdateOrder(updated);
                    }
                    onShowToast(
                      'Pedido Actualizado',
                      `Estado sincronizado a: ${updated.statusLabel}`,
                      'verified'
                    );
                  }
                );
              };

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-[#f6e9ff] flex flex-col gap-3 transition-all hover:border-[#deb7ff]"
                >
                  {/* Top Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="font-mono text-[13px] font-bold text-[#7b2cbf]">
                        Pedido #{order.id}
                      </span>
                      <span className="text-[11px] text-[#7e7384] block">{order.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedFacturaOrder(order)}
                        className="px-2.5 py-1 rounded-xl bg-[#faf0ff] hover:bg-[#f3e3ff] text-[#6100a4] text-[11px] font-bold border border-[#deb7ff] flex items-center gap-1 transition-all active:scale-95"
                        title="Ver y descargar factura artesanal en PDF"
                      >
                        <span className="material-symbols-outlined text-[15px]">receipt_long</span>
                        <span>Factura Artesanal</span>
                      </button>
                      <span
                        className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                          order.status === 'listo'
                            ? 'bg-[#efdbff] text-[#29074a]'
                            : order.status === 'preparacion'
                            ? 'bg-[#ffdf9f] text-[#261a00]'
                            : order.status === 'entregado'
                            ? 'bg-[#e0f8e9] text-[#0e7c3a]'
                            : 'bg-[#f6e9ff] text-[#6100a4]'
                        }`}
                      >
                        {order.statusLabel}
                      </span>
                    </div>
                  </div>

                  {/* Progress Tracker Steps */}
                  <div className="bg-[#faf2ff] p-3 rounded-2xl border border-[#f0dbff] space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-[#6f5092]">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">tune</span>
                        <span>Fases de Elaboración Artesanal</span>
                      </span>
                      <span className="text-[#7b2cbf] font-mono">Paso {stepIndex} de 4</span>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5 text-center">
                      {[
                        { step: 1, label: 'En Tejido', icon: 'handyman' },
                        { step: 2, label: 'Empacado', icon: 'card_giftcard' },
                        { step: 3, label: 'En Tránsito', icon: 'local_shipping' },
                        { step: 4, label: 'Entregado', icon: 'verified' },
                      ].map((s) => (
                        <div
                          key={s.step}
                          className={`p-1.5 rounded-xl border flex flex-col items-center gap-0.5 text-[10px] font-bold ${
                            s.step <= stepIndex
                              ? 'bg-[#7b2cbf] text-white border-[#7b2cbf] shadow-2xs'
                              : 'bg-white text-[#7e7384] border-[#ebd2ff]'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[15px]">{s.icon}</span>
                          <span className="truncate w-full">{s.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="text-[12px] text-[#4c4353] space-y-1 bg-white p-1">
                    <p>
                      <strong>Clienta:</strong> {order.customerName}
                    </p>
                    <p>
                      <strong>Destino:</strong> {order.customerLocation}
                    </p>
                    <p>
                      <strong>Transportadora:</strong> {order.carrier}
                    </p>
                    {order.trackingNumber && (
                      <div className="flex items-center justify-between font-mono bg-[#faf0ff] p-2 rounded-xl border border-[#f6e9ff]">
                        <span className="text-[#6100a4] font-bold">
                          Guía: #{order.trackingNumber}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard?.writeText(order.trackingNumber || '');
                            onShowToast('Guía Copiada', `#${order.trackingNumber} en portapapeles`, 'content_copy');
                          }}
                          className="text-[#7b2cbf] font-bold hover:underline text-[11px] flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[13px]">content_copy</span>
                          <span>Copiar</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Items */}
                  {order.items.length > 0 && (
                    <div className="bg-[#faf0ff] p-2.5 rounded-2xl border border-[#f6e9ff] flex flex-col gap-1.5">
                      {order.items.map((it, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <img
                            src={it.imageUrl}
                            alt={it.name}
                            className="w-8 h-8 rounded-lg object-cover"
                          />
                          <span className="text-[12px] text-[#211630] font-medium truncate flex-1">
                            {it.quantity}x {it.name}
                          </span>
                          <span className="text-[12px] font-bold text-[#6100a4]">
                            ${it.price.toLocaleString('es-CO')}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* PDF Artisan Invoice Download & Actions Bar */}
                  <div className="p-3 bg-[#fdf9ff] rounded-2xl border border-[#ebd2ff] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-[#7b2cbf] text-white flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
                      </div>
                      <div>
                        <h5 className="text-[12px] font-bold text-[#211630] flex items-center gap-1.5">
                          <span>Factura Artesanal Oficial</span>
                          <span className="text-[9.5px] uppercase font-extrabold px-1.5 py-0.2 rounded bg-[#e8d5f5] text-[#6100a4]">
                            PDF
                          </span>
                        </h5>
                        <p className="text-[10.5px] text-[#6f5092]">
                          Resumen artesanal con detalle de piezas, comprobante y guía de cuidado.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => setSelectedFacturaOrder(order)}
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#faf0ff] border border-[#deb7ff] text-[#6100a4] text-[11px] font-bold flex items-center gap-1 transition-all active:scale-95"
                      >
                        <span className="material-symbols-outlined text-[15px]">visibility</span>
                        <span>Ver Resumen</span>
                      </button>
                      <button
                        type="button"
                        disabled={downloadingOrderId === order.id}
                        onClick={() => handleDirectDownloadPDF(order)}
                        className="px-3.5 py-1.5 rounded-xl bg-[#7b2cbf] hover:bg-[#6100a4] text-white text-[11px] font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95 disabled:opacity-60"
                      >
                        <span className="material-symbols-outlined text-[15px]">
                          {downloadingOrderId === order.id ? 'progress_activity' : 'download'}
                        </span>
                        <span>
                          {downloadingOrderId === order.id ? 'Descargando...' : 'Descargar PDF'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Browser Notification Tester / Actions */}
                  <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 border-t border-[#f6e9ff]">
                    <div className="flex items-center gap-1.5 text-[11px] text-[#0e7c3a] font-semibold">
                      <span className="material-symbols-outlined text-[16px]">notifications_active</span>
                      <span>Avisos del navegador listos para este pedido</span>
                    </div>

                    {isSimulatingThis ? (
                      <div className="px-3 py-1.5 rounded-xl bg-[#ffdf9f] text-[#4d2800] text-[11px] font-bold flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[15px] animate-spin">refresh</span>
                        <span>Minimiza la ventana: aviso en {simulatingTimer}s...</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSimulateBackgroundForOrder}
                        className="px-3 py-1.5 rounded-xl bg-[#f6e9ff] text-[#6100a4] hover:bg-[#deb7ff] text-[11px] font-bold flex items-center justify-center gap-1 active:scale-95 transition-all"
                        title="Simular cambio de estado en segundo plano para verificar que recibes la notificación"
                      >
                        <span className="material-symbols-outlined text-[15px]">tab</span>
                        <span>Probar aviso en 2do plano (6s)</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PRODUCT DETAIL MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-[#372b46]/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl flex flex-col gap-3 max-h-[90vh] overflow-y-auto border border-[#deb7ff]/50">
            <div className="flex items-center justify-between pb-1 border-b border-[#f6e9ff]">
              <span className="text-[11px] font-bold uppercase text-[#7b2cbf] tracking-wider">
                Ficha Artesanal Maraña
              </span>
              <button
                onClick={() => setSelectedProduct(null)}
                className="w-8 h-8 rounded-full bg-[#f6e9ff] flex items-center justify-center text-[#4c4353] hover:text-[#211630]"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="w-full h-56 rounded-2xl overflow-hidden bg-[#faf0ff] border border-[#f6e9ff]">
              <img
                src={selectedProduct.imageUrl}
                alt={selectedProduct.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#6f5092] font-mono font-bold uppercase">
                  SKU: {selectedProduct.sku}
                </span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#efdbff] text-[#29074a] font-bold">
                  {selectedProduct.size}
                </span>
              </div>
              <h3 className="font-rubik text-[18px] text-[#211630] font-bold mt-1">
                {selectedProduct.name}
              </h3>
              <p className="text-[12px] text-[#4c4353] mt-1 leading-relaxed">
                Amigurumi tejido a crochet punto a punto por artesanas de Neiva con hilazas seleccionadas de{' '}
                <strong>{selectedProduct.supplier}</strong>. Relleno hipoalergénico suave y ojos con trabas de seguridad. Cuidado: lavado a mano en agua fría y secado a la sombra.
              </p>
            </div>

            <div className="bg-[#faf0ff] p-3 rounded-2xl border border-[#f6e9ff] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#7e7384] uppercase tracking-wider block font-bold">
                  Precio
                </span>
                <span className="font-rubik text-[20px] font-extrabold text-[#6100a4]">
                  ${selectedProduct.priceCOP.toLocaleString('es-CO')}{' '}
                  <span className="text-[11px] font-semibold text-[#6f5092]">COP</span>
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-[#7e7384] uppercase tracking-wider block font-bold">
                  Disponibilidad
                </span>
                <span className="text-[12px] font-bold text-[#211630]">
                  {selectedProduct.currentStock > 0
                    ? `${selectedProduct.currentStock} unidades`
                    : 'Bajo Pedido'}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                onAddToCart(selectedProduct);
                setSelectedProduct(null);
              }}
              className="w-full py-3.5 rounded-2xl bg-[#7b2cbf] hover:bg-[#6100a4] text-white text-[13px] font-bold flex items-center justify-center gap-2 shadow-md shadow-[#7b2cbf]/25 active:scale-95 transition-all"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
              <span>Añadir a la Bolsa de Compras</span>
            </button>
          </div>
        </div>
      )}

      {/* SHOPPING BAG SLIDE-OVER / MODAL */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-[#372b46]/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl flex flex-col gap-3 max-h-[85vh] overflow-y-auto border border-[#f6e9ff]">
            <div className="flex items-center justify-between pb-1 border-b border-[#f6e9ff]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#7b2cbf] text-[22px]">
                  shopping_basket
                </span>
                <h3 className="font-rubik text-[17px] font-bold text-[#211630]">
                  Bolsa de Compras ({cartItemsCount})
                </h3>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-8 h-8 rounded-full bg-[#f6e9ff] flex items-center justify-center text-[#4c4353]"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="py-10 text-center flex flex-col items-center">
                <span className="material-symbols-outlined text-[#deb7ff] text-[48px] mb-2">
                  production_quantity_limits
                </span>
                <p className="font-rubik text-[15px] font-bold text-[#211630]">
                  Tu bolsa está vacía
                </p>
                <p className="text-[12px] text-[#7e7384] mt-1">
                  Agrega prendas o telares artesanales para completar tu pedido.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-2.5 max-h-56 overflow-y-auto no-scrollbar">
                  {cart.map((item) => (
                    <div
                      key={item.product.sku}
                      className="flex items-center gap-3 p-2.5 rounded-2xl bg-[#faf0ff] border border-[#f6e9ff]"
                    >
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-12 h-14 rounded-xl object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[13px] font-bold text-[#211630] truncate">
                          {item.product.name}
                        </h4>
                        <span className="text-[11px] text-[#6f5092]">
                          ${item.product.priceCOP.toLocaleString('es-CO')} c/u
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <button
                            onClick={() => onUpdateCartQty(item.product.sku, -1)}
                            className="w-6 h-6 rounded-lg bg-white border border-[#f6e9ff] flex items-center justify-center text-[#211630] active:scale-95"
                            type="button"
                          >
                            <span className="material-symbols-outlined text-[14px]">remove</span>
                          </button>
                          <span className="font-bold text-[12px] text-[#211630]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateCartQty(item.product.sku, 1)}
                            className="w-6 h-6 rounded-lg bg-white border border-[#f6e9ff] flex items-center justify-center text-[#211630] active:scale-95"
                            type="button"
                          >
                            <span className="material-symbols-outlined text-[14px]">add</span>
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => onRemoveFromCart(item.product.sku)}
                        className="p-1 text-[#ba1a1a] hover:bg-[#ffdad6] rounded-lg transition-colors"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Delivery Option */}
                <div className="bg-[#faf0ff] p-3 rounded-2xl border border-[#f6e9ff] space-y-1.5">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-[#6100a4] block">
                    Método de Entrega
                  </span>
                  <div className="grid grid-cols-3 gap-1 text-[11px]">
                    <button
                      onClick={() => setShippingType('nacional')}
                      className={`p-2 rounded-xl border text-center transition-all font-semibold ${
                        shippingType === 'nacional'
                          ? 'bg-[#7b2cbf] text-white border-[#7b2cbf]'
                          : 'bg-white text-[#4c4353] border-[#f6e9ff]'
                      }`}
                      type="button"
                    >
                      Nacional ($14k)
                    </button>
                    <button
                      onClick={() => setShippingType('local')}
                      className={`p-2 rounded-xl border text-center transition-all font-semibold ${
                        shippingType === 'local'
                          ? 'bg-[#7b2cbf] text-white border-[#7b2cbf]'
                          : 'bg-white text-[#4c4353] border-[#f6e9ff]'
                      }`}
                      type="button"
                    >
                      Neiva ($8k)
                    </button>
                    <button
                      onClick={() => setShippingType('taller')}
                      className={`p-2 rounded-xl border text-center transition-all font-semibold ${
                        shippingType === 'taller'
                          ? 'bg-[#7b2cbf] text-white border-[#7b2cbf]'
                          : 'bg-white text-[#4c4353] border-[#f6e9ff]'
                      }`}
                      type="button"
                    >
                      Retiro ($0)
                    </button>
                  </div>
                </div>

                {/* Subtotals */}
                <div className="pt-2 border-t border-[#f6e9ff] space-y-1 text-[12px]">
                  <div className="flex justify-between text-[#4c4353]">
                    <span>Subtotal Prendas</span>
                    <span>${cartSubtotal.toLocaleString('es-CO')}</span>
                  </div>
                  <div className="flex justify-between text-[#4c4353]">
                    <span>Envío</span>
                    <span>${shippingCost.toLocaleString('es-CO')}</span>
                  </div>
                  <div className="flex justify-between text-[15px] font-bold text-[#211630] pt-1 border-t border-[#f6e9ff]">
                    <span>Total a Transferir</span>
                    <span className="text-[#6100a4]">
                      ${cartGrandTotal.toLocaleString('es-CO')} COP
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsCheckoutOpen(true);
                  }}
                  className="w-full py-3.5 rounded-2xl bg-[#7b2cbf] hover:bg-[#6100a4] text-white text-[13px] font-bold flex items-center justify-center gap-2 shadow-md shadow-[#7b2cbf]/25 active:scale-95 transition-all mt-1"
                  type="button"
                >
                  <span>Continuar al Pago & Comprobante</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* CHECKOUT & VOUCHER UPLOAD MODAL */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-[#372b46]/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <form
            onSubmit={handleCheckoutSubmit}
            className="bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl flex flex-col gap-3 max-h-[90vh] overflow-y-auto border border-[#deb7ff]/40"
          >
            <div className="flex items-center justify-between pb-1 border-b border-[#f6e9ff]">
              <div>
                <span className="text-[10px] text-[#6100a4] font-extrabold uppercase tracking-wider block">
                  Paso Final
                </span>
                <h3 className="font-rubik text-[17px] font-bold text-[#211630]">
                  Datos de Envío & Comprobante
                </h3>
              </div>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="w-8 h-8 rounded-full bg-[#f6e9ff] flex items-center justify-center text-[#4c4353]"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Transfer Instructions */}
            <div className="bg-[#faf0ff] p-3 rounded-2xl border border-[#d9b5ff] flex flex-col gap-1 text-[12px]">
              <span className="font-bold text-[#6100a4] flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">account_balance</span>
                Cuentas Receptoras Maraña
              </span>
              <p className="text-[#211630]">
                • <strong>Bancolombia Ahorros:</strong> 912-384729-10
              </p>
              <p className="text-[#211630]">
                • <strong>Nequi / Daviplata:</strong> 312 849 2019
              </p>
              <div className="mt-1 pt-1 border-t border-[#deb7ff] flex justify-between font-bold text-[#7b2cbf]">
                <span>Monto a Transferir:</span>
                <span>${cartGrandTotal.toLocaleString('es-CO')} COP</span>
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-2 text-[12px]">
              <div>
                <label className="font-bold text-[#211630] block mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Sofia Restrepo"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-[#faf0ff] border border-[#f6e9ff] focus:outline-none focus:ring-2 focus:ring-[#7b2cbf]"
                />
              </div>

              <div>
                <label className="font-bold text-[#211630] block mb-1">Teléfono / WhatsApp *</label>
                <input
                  type="tel"
                  required
                  placeholder="+57 318 692 8410"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-[#faf0ff] border border-[#f6e9ff] focus:outline-none focus:ring-2 focus:ring-[#7b2cbf]"
                />
              </div>

              <div>
                <label className="font-bold text-[#211630] block mb-1">Dirección de Entrega *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Carrera 5 # 12-34, Quirinal"
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-[#faf0ff] border border-[#f6e9ff] focus:outline-none focus:ring-2 focus:ring-[#7b2cbf]"
                />
              </div>

              <div>
                <label className="font-bold text-[#211630] block mb-1">Ciudad / Municipio</label>
                <input
                  type="text"
                  placeholder="Neiva, Huila"
                  value={clientCity}
                  onChange={(e) => setClientCity(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-[#faf0ff] border border-[#f6e9ff] focus:outline-none focus:ring-2 focus:ring-[#7b2cbf]"
                />
              </div>

              <div>
                <label className="font-bold text-[#211630] block mb-1">
                  Dedicatoria Caligrafiada Especial (Opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej: Para mamá con mucho cariño en su cumpleaños..."
                  value={specialDedication}
                  onChange={(e) => setSpecialDedication(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#faf0ff] border border-[#f6e9ff] focus:outline-none focus:ring-2 focus:ring-[#7b2cbf] resize-none"
                />
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="font-bold text-[#211630] block mb-1">Medio Utilizado</label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bancolombia')}
                    className={`py-2 rounded-xl text-center font-bold text-[11px] border transition-all ${
                      paymentMethod === 'bancolombia'
                        ? 'bg-[#7b2cbf] text-white border-[#7b2cbf]'
                        : 'bg-[#faf0ff] text-[#4c4353] border-[#f6e9ff]'
                    }`}
                  >
                    Bancolombia
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('nequi')}
                    className={`py-2 rounded-xl text-center font-bold text-[11px] border transition-all ${
                      paymentMethod === 'nequi'
                        ? 'bg-[#7b2cbf] text-white border-[#7b2cbf]'
                        : 'bg-[#faf0ff] text-[#4c4353] border-[#f6e9ff]'
                    }`}
                  >
                    Nequi
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('daviplata')}
                    className={`py-2 rounded-xl text-center font-bold text-[11px] border transition-all ${
                      paymentMethod === 'daviplata'
                        ? 'bg-[#7b2cbf] text-white border-[#7b2cbf]'
                        : 'bg-[#faf0ff] text-[#4c4353] border-[#f6e9ff]'
                    }`}
                  >
                    Daviplata
                  </button>
                </div>
              </div>

              {/* Receipt upload simulation */}
              <div className="p-3 rounded-2xl bg-[#faf0ff] border border-dashed border-[#deb7ff] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#7b2cbf] text-[24px]">
                    receipt_long
                  </span>
                  <div>
                    <span className="font-bold text-[#211630] text-[12px] block">
                      Comprobante Adjunto
                    </span>
                    <span className="text-[10px] text-[#6f5092]">transferencia_exitosa.png</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onShowToast(
                      'Comprobante Listo',
                      'Imagen de pago vinculada al pedido',
                      'check_circle'
                    )
                  }
                  className="px-2.5 py-1 rounded-lg bg-[#efdbff] text-[#29074a] text-[10px] font-bold"
                >
                  Cambiar
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmittingOrder}
              className="w-full py-3.5 rounded-2xl bg-[#7b2cbf] hover:bg-[#6100a4] text-white text-[13px] font-bold flex items-center justify-center gap-2 shadow-md shadow-[#7b2cbf]/25 active:scale-95 transition-all mt-2"
            >
              <span
                className={`material-symbols-outlined text-[18px] ${
                  isSubmittingOrder ? 'animate-spin' : ''
                }`}
              >
                {isSubmittingOrder ? 'sync' : 'verified'}
              </span>
              <span>
                {isSubmittingOrder ? 'Remitiendo al taller...' : 'Confirmar Pedido & Enviar'}
              </span>
            </button>
          </form>
        </div>
      )}

      {/* FACTURA ARTESANAL MODAL */}
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
