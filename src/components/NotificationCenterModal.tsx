import React, { useState, useEffect } from 'react';
import { Order } from '../types';
import { BRAND_LOGO } from '../data/mockData';
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  sendBrowserNotification,
  notifyOrderStatus,
  getStoredNotifications,
  markAllNotificationsRead,
  clearNotifications,
  getNotificationSettings,
  saveNotificationSettings,
  NotificationItem,
  NotificationSettings,
  scheduleSimulatedBackgroundNotification,
} from '../services/notificationService';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  onSelectOrder?: (orderId: string) => void;
  onShowToast: (title: string, message: string, icon?: string) => void;
  onUpdateOrder?: (updatedOrder: Order) => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  orders,
  onSelectOrder,
  onShowToast,
  onUpdateOrder,
}) => {
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>(getNotificationSettings());
  const [activeTab, setActiveTab] = useState<'historial' | 'config' | 'simulador'>('historial');
  const [isRequesting, setIsRequesting] = useState(false);
  const [simulatingTimer, setSimulatingTimer] = useState<number | null>(null);
  const [simulatedSelectedOrderId, setSimulatedSelectedOrderId] = useState<string>(
    orders[0]?.id || 'MC-2024-884'
  );
  const [simulatedTargetStatus, setSimulatedTargetStatus] = useState<
    'preparacion' | 'listo' | 'transito' | 'entregado'
  >('transito');

  const reloadData = () => {
    setPermission(getNotificationPermission());
    setNotifications(getStoredNotifications());
    setSettings(getNotificationSettings());
  };

  useEffect(() => {
    if (isOpen) {
      reloadData();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleUpdate = () => {
      setNotifications(getStoredNotifications());
    };
    window.addEventListener('marana:notifications-updated', handleUpdate);
    return () => {
      window.removeEventListener('marana:notifications-updated', handleUpdate);
    };
  }, []);

  if (!isOpen) return null;

  const supported = isNotificationSupported();
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    try {
      const res = await requestNotificationPermission();
      setPermission(res);
      if (res === 'granted') {
        onShowToast(
          'Notificaciones Habilitadas',
          'Recibirás avisos en tu navegador sobre el estado de tus amigurumis.',
          'notifications_active'
        );
        // Enviar notificación de confirmación
        await sendBrowserNotification('🌸 Maraña Crochet · Notificaciones Activadas', {
          body: '¡Listo! Te avisaremos el estado real de tu amigurumi sin necesidad de entrar a la app.',
          status: 'info',
        });
      } else if (res === 'denied') {
        onShowToast(
          'Permiso Denegado',
          'Las notificaciones están bloqueadas en tu navegador. Puedes desbloquearlas en el ícono de candado del sitio.',
          'notifications_off'
        );
      }
    } finally {
      setIsRequesting(false);
      reloadData();
    }
  };

  const handleSendTestNotification = async () => {
    if (permission !== 'granted') {
      await handleRequestPermission();
      return;
    }

    const sampleOrder = orders.find((o) => o.id === simulatedSelectedOrderId) || orders[0];
    if (sampleOrder) {
      const sent = await notifyOrderStatus(
        sampleOrder,
        'Prueba de notificación: Así recibirás las alertas en tiempo real sobre tu amigurumi aunque estés en otra pestaña.'
      );
      if (sent) {
        onShowToast('Aviso Enviado', 'Revisa la esquina o centro de notificaciones de tu dispositivo.', 'notifications');
      } else {
        onShowToast('Aviso Guardado', 'Notificación registrada en el historial de la app.', 'done');
      }
    } else {
      await sendBrowserNotification('🧶 Maraña Crochet · Alerta de Prueba', {
        body: 'El servicio de notificaciones en el navegador está activo y sincronizado con el taller de Neiva.',
        status: 'info',
      });
      onShowToast('Notificación Enviada', 'Aviso de prueba emitido al navegador.', 'notifications');
    }
    reloadData();
  };

  const handleStartBackgroundSimulation = () => {
    if (permission !== 'granted') {
      onShowToast('Permiso Requerido', 'Primero activa las notificaciones para probar el aviso en segundo plano.', 'notifications_paused');
      handleRequestPermission();
      return;
    }

    const orderToUpdate = orders.find((o) => o.id === simulatedSelectedOrderId) || orders[0];
    if (!orderToUpdate) return;

    let countdown = 6;
    setSimulatingTimer(countdown);
    onShowToast(
      'Simulación Iniciada (6s)',
      'Cambia de pestaña o minimiza el navegador ahora mismo para ver la notificación.',
      'timer'
    );

    const interval = setInterval(() => {
      countdown -= 1;
      if (countdown <= 0) {
        clearInterval(interval);
        setSimulatingTimer(null);
      } else {
        setSimulatingTimer(countdown);
      }
    }, 1000);

    scheduleSimulatedBackgroundNotification(
      orderToUpdate,
      simulatedTargetStatus,
      6,
      (updated) => {
        if (onUpdateOrder) {
          onUpdateOrder(updated);
        }
        reloadData();
      }
    );
  };

  const handleToggleSetting = (key: keyof NotificationSettings) => {
    const updated = saveNotificationSettings({ [key]: !settings[key] });
    setSettings(updated);
    onShowToast('Ajuste Guardado', 'Preferencia de notificaciones actualizada.', 'tune');
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#372b46]/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col max-h-[90vh] border border-[#f0dbff] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#f6e9ff]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white border border-[#ebd2ff] p-0.5 shadow-2xs flex items-center justify-center shrink-0">
              <img src={BRAND_LOGO} alt="Maraña Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-rubik text-[17px] font-bold text-[#211630]">
                  Avisos en el Navegador
                </h3>
                {permission === 'granted' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#e0f8e9] text-[#0e7c3a] border border-[#a6eec1]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0e7c3a] animate-pulse"></span>
                    Activas
                  </span>
                ) : permission === 'denied' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#ffe4e4] text-[#b31919]">
                    Bloqueadas
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#fff3d4] text-[#8a5b00]">
                    Pendiente
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#6f5092]">
                Estado real de pedidos sin necesidad de entrar a la app
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Cerrar ventana de notificaciones"
            className="w-8 h-8 rounded-full bg-[#f6e9ff] text-[#4c4353] hover:text-[#211630] flex items-center justify-center transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Permission Action Banner */}
        <div className="pt-3 pb-2">
          {!supported ? (
            <div className="p-3 rounded-2xl bg-[#fff3d4] border border-[#ffdf9f] text-[12px] text-[#543d00] flex items-start gap-2">
              <span className="material-symbols-outlined text-[#715300] text-[18px] shrink-0 mt-0.5">info</span>
              <div>
                <strong>Navegador sin soporte de notificaciones push directas.</strong>
                <p className="text-[11px] mt-0.5">
                  Podrás seguir viendo el historial de alertas dentro de esta sección.
                </p>
              </div>
            </div>
          ) : permission === 'default' ? (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#faf0ff] via-[#f5e6ff] to-[#edd5ff] border border-[#d9b5ff] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[#7b2cbf] text-[24px] shrink-0">
                  notifications_active
                </span>
                <div>
                  <h4 className="text-[13px] font-bold text-[#211630]">
                    ¿Deseas recibir avisos de tus pedidos?
                  </h4>
                  <p className="text-[11px] text-[#554666] leading-snug mt-0.5">
                    Tu navegador te avisará en tiempo real cuando tu amigurumi empiece a tejerse, sea empacado o vaya en camino con Servientrega.
                  </p>
                </div>
              </div>
              <button
                onClick={handleRequestPermission}
                disabled={isRequesting}
                type="button"
                className="px-4 py-2 rounded-xl bg-[#7b2cbf] hover:bg-[#6100a4] text-white text-[12px] font-bold shrink-0 shadow-sm transition-all active:scale-95 flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>{isRequesting ? 'Activando...' : 'Activar Avisos'}</span>
              </button>
            </div>
          ) : permission === 'denied' ? (
            <div className="p-3 rounded-2xl bg-[#fff0f0] border border-[#ffcccc] text-[12px] text-[#8a1c1c] flex items-start gap-2.5">
              <span className="material-symbols-outlined text-[#b31919] text-[20px] shrink-0 mt-0.5">
                notifications_off
              </span>
              <div>
                <strong>Avisos bloqueados en este navegador</strong>
                <p className="text-[11px] text-[#6d1b1b] mt-0.5">
                  Para habilitar los avisos automáticos, haz clic en el ícono de candado o configuración al lado de la barra de direcciones de tu navegador y selecciona &quot;Permitir notificaciones&quot;.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-2.5 rounded-2xl bg-[#f0faf2] border border-[#b2e8c2] flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0e7c3a] text-[18px]">
                  verified
                </span>
                <span className="text-[12px] font-semibold text-[#0e7c3a]">
                  Servicio activo en tu navegador para el taller de Neiva
                </span>
              </div>
              <button
                onClick={handleSendTestNotification}
                type="button"
                className="px-2.5 py-1 rounded-lg bg-[#0e7c3a] hover:bg-[#095829] text-white text-[11px] font-bold transition-all shrink-0 active:scale-95 flex items-center gap-1"
                title="Lanzar aviso de prueba en tu sistema"
              >
                <span className="material-symbols-outlined text-[14px]">send</span>
                <span>Probar</span>
              </button>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 border-b border-[#f0dbff] pt-1 pb-2">
          <button
            onClick={() => setActiveTab('historial')}
            type="button"
            className={`px-3 py-1.5 rounded-xl text-[12px] font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'historial'
                ? 'bg-[#7b2cbf] text-white shadow-2xs'
                : 'text-[#4c4353] hover:text-[#7b2cbf] hover:bg-[#f6e9ff]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">history</span>
            <span>Historial ({notifications.length})</span>
            {unreadCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#f9bd22] text-[#261a00] text-[10px] font-extrabold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('simulador')}
            type="button"
            className={`px-3 py-1.5 rounded-xl text-[12px] font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'simulador'
                ? 'bg-[#7b2cbf] text-white shadow-2xs'
                : 'text-[#4c4353] hover:text-[#7b2cbf] hover:bg-[#f6e9ff]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">nest_clock_farsight_analog</span>
            <span>Simulador de Fondo</span>
          </button>

          <button
            onClick={() => setActiveTab('config')}
            type="button"
            className={`px-3 py-1.5 rounded-xl text-[12px] font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'config'
                ? 'bg-[#7b2cbf] text-white shadow-2xs'
                : 'text-[#4c4353] hover:text-[#7b2cbf] hover:bg-[#f6e9ff]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">tune</span>
            <span>Preferencias</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1">
          {/* TAB 1: HISTORIAL DE NOTIFICACIONES */}
          {activeTab === 'historial' && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-[11px] text-[#6f5092] px-1">
                <span>Registro de alertas despachadas a tu navegador</span>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={() => {
                        markAllNotificationsRead();
                        reloadData();
                      }}
                      type="button"
                      className="text-[#7b2cbf] font-bold hover:underline"
                    >
                      Marcar leídas
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={() => {
                        clearNotifications();
                        reloadData();
                      }}
                      type="button"
                      className="text-[#998b9f] hover:text-[#ba1a1a]"
                    >
                      Limpiar
                    </button>
                  )}
                </div>
              </div>

              {notifications.length === 0 ? (
                <div className="text-center py-10 px-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#faf0ff] mx-auto flex items-center justify-center text-[#c298ec] mb-2">
                    <span className="material-symbols-outlined text-[28px]">notifications_none</span>
                  </div>
                  <h4 className="text-[14px] font-bold text-[#211630]">Sin notificaciones todavía</h4>
                  <p className="text-[12px] text-[#6f5092] mt-1 max-w-xs mx-auto">
                    Cuando realices o actualices un pedido, aquí quedará guardada cada notificación recibida.
                  </p>
                  <button
                    onClick={handleSendTestNotification}
                    type="button"
                    className="mt-3 px-3.5 py-1.5 rounded-xl bg-[#f6e9ff] text-[#6100a4] hover:bg-[#edd5ff] text-[12px] font-bold transition-all"
                  >
                    Generar aviso de prueba
                  </button>
                </div>
              ) : (
                notifications.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-2xl border transition-all ${
                      item.read
                        ? 'bg-white border-[#f0dbff]'
                        : 'bg-gradient-to-r from-[#faf2ff] to-[#f4e4ff] border-[#deb7ff] shadow-2xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-6 h-6 rounded-lg flex items-center justify-center text-[13px] ${
                            item.status === 'listo'
                              ? 'bg-[#efdbff] text-[#6100a4]'
                              : item.status === 'transito'
                              ? 'bg-[#f6e9ff] text-[#7b2cbf]'
                              : item.status === 'entregado'
                              ? 'bg-[#e0f8e9] text-[#0e7c3a]'
                              : 'bg-[#faf0ff] text-[#4c4353]'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            {item.status === 'listo'
                              ? 'card_giftcard'
                              : item.status === 'transito'
                              ? 'local_shipping'
                              : item.status === 'entregado'
                              ? 'verified'
                              : 'notifications'}
                          </span>
                        </span>
                        <h4 className="text-[13px] font-bold text-[#211630] leading-snug">
                          {item.title}
                        </h4>
                      </div>
                      <span className="text-[10px] text-[#7e7384] shrink-0 font-medium">
                        {item.timestamp}
                      </span>
                    </div>

                    <p className="text-[12px] text-[#4c4353] mt-1.5 leading-relaxed pl-8">
                      {item.body}
                    </p>

                    <div className="mt-2 pl-8 flex items-center justify-between">
                      {item.orderId && (
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-bold text-[#7b2cbf] bg-[#f6e9ff] px-2 py-0.5 rounded-md">
                            #{item.orderId}
                          </span>
                          {onSelectOrder && (
                            <button
                              onClick={() => {
                                onSelectOrder(item.orderId!);
                                onClose();
                              }}
                              type="button"
                              className="text-[11px] text-[#6100a4] font-bold hover:underline flex items-center gap-0.5"
                            >
                              <span>Ver pedido</span>
                              <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: SIMULADOR DE AVISO EN SEGUNDO PLANO */}
          {activeTab === 'simulador' && (
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-[#faf0ff] border border-[#f0dbff]">
                <h4 className="text-[13px] font-bold text-[#211630] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#7b2cbf] text-[18px]">
                    phonelink_ring
                  </span>
                  ¿Cómo funciona el aviso fuera de la app?
                </h4>
                <p className="text-[11px] text-[#554666] mt-1 leading-relaxed">
                  Esta herramienta te permite comprobar que las clientas <strong>reciben la notificación en su pantalla</strong> incluso con la app en segundo plano, en otra pestaña o con el navegador minimizado.
                </p>
              </div>

              {/* Selector de Pedido */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#6f5092] block mb-1">
                  1. Seleccionar Pedido para Simular:
                </label>
                <select
                  value={simulatedSelectedOrderId}
                  onChange={(e) => setSimulatedSelectedOrderId(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-white text-[#211630] text-[13px] border border-[#ebd2ff] focus:outline-none focus:ring-2 focus:ring-[#7b2cbf]"
                >
                  {orders.map((o) => (
                    <option key={o.id} value={o.id}>
                      #{o.id} · {o.customerName} ({o.statusLabel})
                    </option>
                  ))}
                </select>
              </div>

              {/* Selector de Nuevo Estado */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#6f5092] block mb-1">
                  2. Nuevo estado a notificar:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'preparacion', label: 'En Tejido (Neiva)', icon: 'handyman' },
                    { id: 'listo', label: 'Empacado & Listo', icon: 'card_giftcard' },
                    { id: 'transito', label: 'En Tránsito (Servientrega)', icon: 'local_shipping' },
                    { id: 'entregado', label: 'Entregado a Domicilio', icon: 'verified' },
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() =>
                        setSimulatedTargetStatus(
                          st.id as 'preparacion' | 'listo' | 'transito' | 'entregado'
                        )
                      }
                      className={`p-2.5 rounded-xl border text-[12px] font-bold flex items-center gap-2 transition-all text-left ${
                        simulatedTargetStatus === st.id
                          ? 'bg-[#7b2cbf] text-white border-[#7b2cbf] shadow-2xs'
                          : 'bg-white text-[#4c4353] border-[#f0dbff] hover:bg-[#faf2ff]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">{st.icon}</span>
                      <span className="truncate">{st.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Temporizador / Disparador */}
              <div className="pt-2">
                {simulatingTimer !== null ? (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-[#ffe4c2] to-[#ffd7a8] border border-[#ffb870] text-center space-y-1">
                    <span className="material-symbols-outlined text-[#7a4100] text-[32px] animate-bounce">
                      tab
                    </span>
                    <h4 className="font-rubik text-[16px] font-bold text-[#4d2800]">
                      ¡Cambia de pestaña o minimiza ahora!
                    </h4>
                    <p className="text-[12px] text-[#663600]">
                      La notificación saltará en <strong>{simulatingTimer} segundos</strong>
                    </p>
                    <div className="w-full bg-white/60 h-2 rounded-full overflow-hidden mt-2">
                      <div
                        className="bg-[#7a4100] h-full transition-all duration-1000"
                        style={{ width: `${((6 - simulatingTimer) / 6) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleStartBackgroundSimulation}
                    type="button"
                    className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#7b2cbf] to-[#6100a4] text-white font-bold text-[13px] flex items-center justify-center gap-2 shadow-md shadow-[#7b2cbf]/25 hover:opacity-95 active:scale-95 transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">play_circle</span>
                    <span>Probar Aviso en Segundo Plano (Cuenta regresiva 6s)</span>
                  </button>
                )}
                <p className="text-[10.5px] text-[#7e7384] text-center mt-2">
                  Consejo: Dale clic al botón e inmediatamente abre otra pestaña en tu navegador para ver la alerta emerger.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: PREFERENCIAS DE AVISOS */}
          {activeTab === 'config' && (
            <div className="space-y-3">
              <div className="text-[12px] text-[#4c4353] mb-1">
                Personaliza qué eventos del taller artesanal deben enviar avisos a tu navegador:
              </div>

              <div className="space-y-2">
                {[
                  {
                    key: 'soundEnabled' as const,
                    title: 'Sonido suave de campanilla artesanal',
                    desc: 'Reproduce un acorde sutil al llegar una actualización.',
                    icon: 'volume_up',
                  },
                  {
                    key: 'workshopAlerts' as const,
                    title: 'Avances de tejido en taller (Neiva)',
                    desc: 'Avisar cuando las artesanas comiencen a tejer tu amigurumi.',
                    icon: 'handyman',
                  },
                  {
                    key: 'readyAlerts' as const,
                    title: 'Amigurumi listo y empacado',
                    desc: 'Avisar cuando esté listo con ramita de lavanda y dedicatoria.',
                    icon: 'card_giftcard',
                  },
                  {
                    key: 'shippingAlerts' as const,
                    title: 'Despacho y número de guía Servientrega',
                    desc: 'Avisar en cuanto el mensajero recolecte tu paquete.',
                    icon: 'local_shipping',
                  },
                  {
                    key: 'deliveryAlerts' as const,
                    title: 'Entrega final en domicilio',
                    desc: 'Avisar cuando el paquete haya llegado a su destino.',
                    icon: 'verified',
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    onClick={() => handleToggleSetting(item.key)}
                    className="p-3 rounded-2xl bg-white border border-[#f0dbff] flex items-center justify-between gap-3 cursor-pointer hover:border-[#deb7ff] transition-all"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-[#7b2cbf] text-[20px] mt-0.5">
                        {item.icon}
                      </span>
                      <div>
                        <h4 className="text-[12.5px] font-bold text-[#211630]">
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-[#6f5092]">{item.desc}</p>
                      </div>
                    </div>

                    <div
                      className={`w-11 h-6 rounded-full transition-colors flex items-center px-0.5 shrink-0 ${
                        settings[item.key] ? 'bg-[#7b2cbf]' : 'bg-[#e0d6e6]'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                          settings[item.key] ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#f6e9ff] flex items-center justify-between text-[11px] text-[#6f5092]">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">lock</span>
            <span>Avisos locales seguros (Neiva, Huila)</span>
          </span>
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-2 rounded-xl bg-[#f6e9ff] text-[#211630] font-bold hover:bg-[#ebd2ff] transition-all"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
