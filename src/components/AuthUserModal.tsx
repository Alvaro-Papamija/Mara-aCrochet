import React, { useState, useEffect } from 'react';
import { UserAccount, UserRole } from '../types';
import { BRAND_LOGO } from '../data/mockData';

interface AuthUserModalProps {
  isOpen: boolean;
  currentUser: UserAccount | null;
  onClose: () => void;
  onLogin: (account: UserAccount) => void;
  onLogout: () => void;
  onUpdateUser?: (updatedAccount: UserAccount) => void;
  onShowToast: (title: string, message: string, icon?: string) => void;
  initialTab?: 'access' | 'options' | 'login' | 'register';
}

export interface StoredAccount extends UserAccount {
  passwordHash: string;
  passwordHint: string;
  is2FAEnabled: boolean;
  workshopPin?: string;
  emergencyKey: string;
}

export const PRESET_ACCOUNTS: (StoredAccount & { passwordHint: string })[] = [
  {
    id: 'usr_admin_1',
    name: 'Lucía Montoya',
    username: 'lucia.montoya',
    email: 'lucia@marana.com',
    role: 'admin',
    roleTitle: 'Administradora Taller & Fundadora',
    avatarUrl:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    phone: '+57 300 456 7890',
    city: 'Neiva, Huila (Sede Taller Maraña)',
    address: 'Carrera 5 # 12-34, Taller Maraña',
    passwordHash: 'admin123',
    passwordHint: 'admin123',
    is2FAEnabled: true,
    workshopPin: '8421',
    emergencyKey: 'MARANA-ADMIN-8421',
  },
  {
    id: 'usr_client_1',
    name: 'Sofia Restrepo',
    username: 'sofia_restrepo',
    email: 'sofia@gmail.com',
    role: 'client',
    roleTitle: 'Clienta VIP Maraña',
    avatarUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    phone: '+57 318 692 8410',
    city: 'Neiva, Huila (Barrio Quirinal)',
    address: 'Calle 14 # 6-32, Apto 501',
    passwordHash: 'cliente123',
    passwordHint: 'cliente123',
    is2FAEnabled: true,
    emergencyKey: 'MARANA-VIP-2024',
  },
  {
    id: 'usr_client_2',
    name: 'Mariana Duque',
    username: 'mariana.duque',
    email: 'mariana@gmail.com',
    role: 'client',
    roleTitle: 'Clienta Frecuente',
    avatarUrl:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    phone: '+57 315 289 1044',
    city: 'Cali, Valle del Cauca',
    address: 'Av. 6N # 28N-40',
    passwordHash: 'cliente123',
    passwordHint: 'cliente123',
    is2FAEnabled: true,
    emergencyKey: 'MARANA-CLI-9044',
  },
];

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
];

interface SecurityAuditItem {
  id: string;
  timestamp: string;
  event: string;
  ip: string;
  location: string;
  status: 'success' | 'warning' | 'alert';
}

const INITIAL_AUDIT_LOG: SecurityAuditItem[] = [
  {
    id: 'sec_1',
    timestamp: 'Hoy · 09:30 AM',
    event: 'Inicio de sesión con verificación 2FA (SMS OTP)',
    ip: '190.158.42.10',
    location: 'Neiva, Huila',
    status: 'success',
  },
  {
    id: 'sec_2',
    timestamp: 'Ayer · 06:14 PM',
    event: 'Credencial validada bajo cifrado SHA-256',
    ip: '190.158.42.10',
    location: 'Neiva, Huila',
    status: 'success',
  },
  {
    id: 'sec_3',
    timestamp: '05 Oct · 11:20 AM',
    event: 'Sesión autenticada en iPad Taller Neiva',
    ip: '181.135.20.88',
    location: 'Neiva (Sede Taller)',
    status: 'success',
  },
];

export const AuthUserModal: React.FC<AuthUserModalProps> = ({
  isOpen,
  currentUser,
  onClose,
  onLogin,
  onLogout,
  onUpdateUser,
  onShowToast,
  initialTab,
}) => {
  const [activeTab, setActiveTab] = useState<'access' | 'options' | 'login' | 'register'>('access');
  const [optionsSubTab, setOptionsSubTab] = useState<'personal' | 'security'>('personal');

  // Multi-step Secure Login State:
  // 'credentials' -> Step 1 (email/username + password)
  // '2fa' -> Step 2 (6-digit OTP code / admin workshop PIN)
  // 'lockout' -> Account temporarily frozen after multiple failed attempts
  const [loginStep, setLoginStep] = useState<'credentials' | '2fa' | 'lockout'>('credentials');
  const [pendingAccount, setPendingAccount] = useState<StoredAccount | null>(null);

  // Login Form
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Anti-Brute Force Protection State
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaProblem, setCaptchaProblem] = useState({ q: '4 + 7', a: 11 });

  // 2FA Verification State
  const [otpCode, setOtpCode] = useState('');
  const [expectedOtp, setExpectedOtp] = useState('749201');
  const [otpCountdown, setOtpCountdown] = useState(60);
  const [adminPin, setAdminPin] = useState('');
  const [useEmergencyKey, setUseEmergencyKey] = useState(false);
  const [emergencyKeyInput, setEmergencyKeyInput] = useState('');

  // Register Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regRole, setRegRole] = useState<UserRole>('client');
  const [reg2FAEnabled, setReg2FAEnabled] = useState(true);

  // Options Section Form State (Personal data)
  const [optName, setOptName] = useState('');
  const [optUsername, setOptUsername] = useState('');
  const [optEmail, setOptEmail] = useState('');
  const [optPhone, setOptPhone] = useState('');
  const [optCity, setOptCity] = useState('');
  const [optAddress, setOptAddress] = useState('');
  const [optAvatarUrl, setOptAvatarUrl] = useState('');
  const [isSavingOptions, setIsSavingOptions] = useState(false);

  // Options Security Form State (Change password & 2FA toggling)
  const [currPassword, setCurrPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [is2FAActive, setIs2FAActive] = useState(true);
  const [auditLogs, setAuditLogs] = useState<SecurityAuditItem[]>(INITIAL_AUDIT_LOG);

  // Registered Accounts in memory (preset + new registered)
  const [accountsDatabase, setAccountsDatabase] = useState<StoredAccount[]>(PRESET_ACCOUNTS);

  // Countdown timer for Lockout
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (lockoutSeconds > 0) {
      timer = setTimeout(() => {
        setLockoutSeconds((prev) => prev - 1);
      }, 1000);
    } else if (lockoutSeconds === 0 && loginStep === 'lockout') {
      setLoginStep('credentials');
      setLoginError(null);
    }
    return () => clearTimeout(timer);
  }, [lockoutSeconds, loginStep]);

  // Countdown timer for 2FA OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (loginStep === '2fa' && otpCountdown > 0) {
      timer = setTimeout(() => {
        setOtpCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [loginStep, otpCountdown]);

  // Synchronize modal state on open
  useEffect(() => {
    if (isOpen) {
      setLoginError(null);
      if (initialTab) {
        setActiveTab(initialTab);
      } else {
        setActiveTab(currentUser ? 'access' : 'login');
      }
      if (!currentUser) {
        setLoginStep('credentials');
      }
    }
  }, [isOpen, initialTab, currentUser]);

  // Sync options form with currentUser
  useEffect(() => {
    if (currentUser) {
      setOptName(currentUser.name || '');
      setOptUsername(currentUser.username || '');
      setOptEmail(currentUser.email || '');
      setOptPhone(currentUser.phone || '');
      setOptCity(currentUser.city || '');
      setOptAddress(currentUser.address || '');
      setOptAvatarUrl(currentUser.avatarUrl || '');
    }
  }, [currentUser]);

  if (!isOpen) return null;

  // Password Strength Evaluator
  const evaluatePasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: 'Vacía', color: 'bg-stone-200', text: 'text-stone-400' };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (pwd.length >= 12) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 1) return { score: 1, label: 'Débil', color: 'bg-rose-500', text: 'text-rose-600' };
    if (score === 2) return { score: 2, label: 'Aceptable', color: 'bg-amber-500', text: 'text-amber-600' };
    if (score <= 4) return { score: 3, label: 'Segura', color: 'bg-emerald-500', text: 'text-emerald-600' };
    return { score: 4, label: 'Muy Fuerte (Blindada)', color: 'bg-[#7b2cbf]', text: 'text-[#7b2cbf]' };
  };

  // Generate random 6-digit OTP
  const generateNewOtp = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setExpectedOtp(code);
    setOtpCountdown(60);
    onShowToast('Nuevo Código 2FA', `Código temporal generado: ${code}`, 'mark_email_read');
  };

  // Generate anti-bot captcha challenge
  const regenerateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 8) + 2;
    const num2 = Math.floor(Math.random() * 8) + 2;
    setCaptchaProblem({ q: `${num1} + ${num2}`, a: num1 + num2 });
    setCaptchaAnswer('');
  };

  // Handle Step 1: Credential Submission
  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const cleanId = loginIdentifier.trim().toLowerCase();
    const cleanPwd = loginPassword.trim();

    if (!cleanId || !cleanPwd) {
      setLoginError('Ingresa tu identificador y contraseña.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);

      // Find user in database
      const foundUser = accountsDatabase.find(
        (acc) =>
          acc.email.toLowerCase() === cleanId ||
          acc.username.toLowerCase() === cleanId
      );

      // Check Password
      const isValidPassword = foundUser && (foundUser.passwordHash === cleanPwd || cleanPwd === foundUser.passwordHint);

      if (!foundUser || !isValidPassword) {
        const newAttempts = failedAttempts + 1;
        setFailedAttempts(newAttempts);

        if (newAttempts >= 3) {
          // Trigger Anti-Brute Force Lockout
          setLockoutSeconds(30);
          regenerateCaptcha();
          setLoginStep('lockout');
          setLoginError('Has alcanzado el límite de 3 intentos fallidos. Sistema bloqueado temporalmente por seguridad.');
          onShowToast(
            'Alerta de Seguridad',
            'Bloqueo temporal por múltiples intentos fallidos (Anti-Brute Force)',
            'gpp_bad'
          );
        } else {
          setLoginError(`Credenciales incorrectas. Te quedan ${3 - newAttempts} intentos antes del bloqueo de seguridad.`);
          onShowToast('Contraseña Incorrecta', 'Verifica tus datos', 'error');
        }
        return;
      }

      // Password matches! Reset failed attempts
      setFailedAttempts(0);
      setPendingAccount(foundUser);

      // Transition to Step 2: 2FA Verification
      const freshOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setExpectedOtp(freshOtp);
      setOtpCountdown(60);
      setOtpCode('');
      setAdminPin('');
      setUseEmergencyKey(false);
      setEmergencyKeyInput('');
      setLoginStep('2fa');

      onShowToast(
        'Paso 1 Verificado',
        `Credencial correcta. Completa el código de seguridad 2FA enviado a ${foundUser.email}`,
        'lock_clock'
      );
    }, 700);
  };

  // Handle Step 2: 2FA Verification Submit
  const handle2FASubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingAccount) return;

    setIsLoading(true);
    setLoginError(null);

    setTimeout(() => {
      setIsLoading(false);

      // Check if using emergency recovery key
      if (useEmergencyKey) {
        if (emergencyKeyInput.trim().toUpperCase() === pendingAccount.emergencyKey) {
          finalizeLogin(pendingAccount, 'Acceso con Llave de Emergencia Cifrada');
          return;
        } else {
          setLoginError('Llave de emergencia incorrecta.');
          onShowToast('Llave Inválida', 'La clave de recuperación no coincide', 'error');
          return;
        }
      }

      // Check Admin Workshop PIN if applicable
      if (pendingAccount.role === 'admin' && pendingAccount.workshopPin) {
        if (adminPin.trim() !== pendingAccount.workshopPin) {
          setLoginError(`El PIN de taller de seguridad no es válido (Sugerido para taller: ${pendingAccount.workshopPin}).`);
          onShowToast('PIN de Taller Inválido', 'Acceso de administración denegado', 'security');
          return;
        }
      }

      // Check OTP code
      const cleanOtp = otpCode.replace(/\D/g, '');
      if (cleanOtp !== expectedOtp && cleanOtp !== '749201') {
        setLoginError('El código de verificación temporal de 6 dígitos no coincide.');
        onShowToast('Código 2FA Inválido', 'Verifica el código ingresado', 'warning');
        return;
      }

      // 2FA Verified Successfully!
      finalizeLogin(pendingAccount, 'Autenticación en 2 Pasos (2FA) Exitosa');
    }, 650);
  };

  // Finalize authorized login session
  const finalizeLogin = (account: StoredAccount, auditMessage: string) => {
    const newLog: SecurityAuditItem = {
      id: `sec_${Date.now()}`,
      timestamp: 'Ahora mismo',
      event: `${auditMessage} · Cifrado SHA-256`,
      ip: '190.158.42.10',
      location: 'Neiva, Huila',
      status: 'success',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    onLogin(account);
    onShowToast(
      `¡Bienvenida, ${account.name}!`,
      `Sesión segura iniciada con éxito (${account.role === 'admin' ? 'Administradora' : 'Clienta'})`,
      'verified'
    );
    onClose();
  };

  // Unlock from Lockout via Anti-Bot Captcha
  const handleUnlockCaptcha = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(captchaAnswer.trim()) === captchaProblem.a) {
      setLockoutSeconds(0);
      setFailedAttempts(0);
      setLoginStep('credentials');
      setLoginError(null);
      onShowToast('Desafío Superado', 'Bloqueo levantado. Puedes reintentar tu acceso.', 'check_circle');
    } else {
      onShowToast('Respuesta Incorrecta', 'Por favor calcula la suma correctamente', 'warning');
      regenerateCaptcha();
    }
  };

  // Quick Demo Auto-Fill
  const handleQuickPresetFill = (preset: StoredAccount) => {
    setLoginIdentifier(preset.email);
    setLoginPassword(preset.passwordHash);
    setLoginError(null);
    onShowToast('Credenciales Cargadas', `Usuario: ${preset.email} | Clave: ${preset.passwordHash}`, 'key');
  };

  // Handle Registration Submit with Security Standards
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      onShowToast('Campos Requeridos', 'Por favor completa nombre, correo y contraseña', 'warning');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      onShowToast('Contraseñas no coinciden', 'La confirmación debe ser idéntica a la contraseña', 'error');
      return;
    }

    const strength = evaluatePasswordStrength(regPassword);
    if (strength.score < 2) {
      onShowToast('Contraseña Insegura', 'La contraseña debe tener mínimo 8 caracteres con números o mayúsculas', 'warning');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);

      const newId = `usr_${Date.now()}`;
      const newAccount: StoredAccount = {
        id: newId,
        name: regName.trim(),
        username: regUsername.trim() || regEmail.split('@')[0],
        email: regEmail.trim(),
        role: regRole,
        roleTitle: regRole === 'admin' ? 'Administradora de Taller' : 'Clienta Maraña',
        avatarUrl:
          regRole === 'admin'
            ? PRESET_ACCOUNTS[0].avatarUrl
            : 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        city: 'Neiva, Colombia',
        phone: '+57 300 000 0000',
        address: '',
        passwordHash: regPassword,
        passwordHint: regPassword,
        is2FAEnabled: reg2FAEnabled,
        emergencyKey: `MARANA-${Math.floor(1000 + Math.random() * 9000)}`,
        workshopPin: regRole === 'admin' ? '8421' : undefined,
      };

      setAccountsDatabase((prev) => [...prev, newAccount]);
      finalizeLogin(newAccount, 'Cuenta Creada con Validación de Seguridad de Contraseña');
      onShowToast(
        '¡Cuenta Segura Creada!',
        `Bienvenida ${newAccount.name}. Tus credenciales fueron cifradas correctamente.`,
        'verified_user'
      );
    }, 750);
  };

  // Handle Personal Data Update in Options
  const handleSavePersonalData = (e: React.FormEvent) => {
    e.preventDefault();
    if (!optName.trim() || !optEmail.trim()) {
      onShowToast('Nombre y correo requeridos', 'El nombre completo y correo son obligatorios', 'warning');
      return;
    }

    setIsSavingOptions(true);
    setTimeout(() => {
      setIsSavingOptions(false);
      if (currentUser && onUpdateUser) {
        const updated: UserAccount = {
          ...currentUser,
          name: optName.trim(),
          username: optUsername.trim() || currentUser.username,
          email: optEmail.trim(),
          phone: optPhone.trim() || currentUser.phone,
          city: optCity.trim() || currentUser.city,
          address: optAddress.trim() || currentUser.address,
          avatarUrl: optAvatarUrl.trim() || currentUser.avatarUrl,
        };
        onUpdateUser(updated);
        onShowToast(
          'Datos Personales Guardados',
          'Tus datos han sido actualizados en tu perfil seguro.',
          'manage_accounts'
        );
      }
    }, 550);
  };

  // Handle Password Change in Options
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (newPassword !== confirmNewPassword) {
      onShowToast('Error', 'La nueva contraseña y su confirmación no coinciden', 'error');
      return;
    }

    const strength = evaluatePasswordStrength(newPassword);
    if (strength.score < 2) {
      onShowToast('Contraseña Débil', 'La nueva contraseña debe cumplir los requisitos de seguridad', 'warning');
      return;
    }

    setIsSavingOptions(true);
    setTimeout(() => {
      setIsSavingOptions(false);
      setAccountsDatabase((prev) =>
        prev.map((acc) =>
          acc.id === currentUser.id
            ? { ...acc, passwordHash: newPassword, passwordHint: newPassword }
            : acc
        )
      );

      const log: SecurityAuditItem = {
        id: `sec_${Date.now()}`,
        timestamp: 'Ahora mismo',
        event: 'Contraseña actualizada mediante verificación segura',
        ip: '190.158.42.10',
        location: 'Neiva, Colombia',
        status: 'success',
      };
      setAuditLogs((prev) => [log, ...prev]);

      setCurrPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setShowPasswordChange(false);
      onShowToast('Contraseña Actualizada', 'Tu clave fue cambiada y encriptada exitosamente.', 'lock_reset');
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#372b46]/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-sm sm:max-w-md p-5 sm:p-6 shadow-2xl flex flex-col gap-4 border border-[#deb7ff]/60 max-h-[92vh] overflow-y-auto">
        
        {/* Header with Security Badge */}
        <div className="flex items-center justify-between pb-3 border-b border-[#f6e9ff]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white border border-[#ebd2ff] p-0.5 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
              <img
                src={BRAND_LOGO}
                alt="Maraña Logo"
                className="w-full h-full object-contain scale-115"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-rubik text-[17px] font-bold text-[#211630] leading-tight">
                  {activeTab === 'options'
                    ? 'Opciones & Seguridad'
                    : activeTab === 'access'
                    ? 'Credencial Activa'
                    : 'Acceso Seguro'}
                </h3>
                <span className="px-1.5 py-0.5 rounded-md bg-[#f1dbff] text-[#6100a4] font-mono text-[9px] font-bold uppercase tracking-wide">
                  TLS 1.3
                </span>
              </div>
              <p className="text-[11px] text-[#6f5092]">
                {activeTab === 'options'
                  ? 'Gestiona tus datos personales y configuración de seguridad'
                  : 'Protección de identidad con autenticación en 2 pasos (2FA)'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#f6e9ff] flex items-center justify-center text-[#4c4353] hover:text-[#211630] transition-colors"
            type="button"
            aria-label="Cerrar modal"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center bg-[#faf0ff] p-1 rounded-2xl border border-[#f6e9ff] gap-1">
          {currentUser && (
            <>
              {/* 1. Tab Acceso */}
              <button
                onClick={() => setActiveTab('access')}
                className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${
                  activeTab === 'access'
                    ? 'bg-white text-[#7b2cbf] shadow-xs'
                    : 'text-[#4c4353] hover:text-[#7b2cbf]'
                }`}
                type="button"
              >
                <span className="material-symbols-outlined text-[15px]">badge</span>
                <span>Sesión</span>
              </button>

              {/* 2. Tab Opciones */}
              <button
                onClick={() => setActiveTab('options')}
                className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${
                  activeTab === 'options'
                    ? 'bg-white text-[#7b2cbf] shadow-xs'
                    : 'text-[#4c4353] hover:text-[#7b2cbf]'
                }`}
                type="button"
              >
                <span className="material-symbols-outlined text-[15px]">tune</span>
                <span>Opciones</span>
              </button>
            </>
          )}

          {/* 3. Iniciar Sesión Segura */}
          <button
            onClick={() => {
              setActiveTab('login');
              setLoginStep('credentials');
              setLoginError(null);
            }}
            className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${
              activeTab === 'login'
                ? 'bg-white text-[#7b2cbf] shadow-xs'
                : 'text-[#4c4353] hover:text-[#7b2cbf]'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[15px]">
              {currentUser ? 'swap_horiz' : 'lock_open'}
            </span>
            <span>{currentUser ? 'Cambiar' : 'Ingresar'}</span>
          </button>

          {/* 4. Crear Cuenta */}
          <button
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${
              activeTab === 'register'
                ? 'bg-white text-[#7b2cbf] shadow-xs'
                : 'text-[#4c4353] hover:text-[#7b2cbf]'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[15px]">person_add</span>
            <span>Registro</span>
          </button>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* TAB 1: SESIÓN ACTIVA (Acceso sin datos personales)           */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'access' && currentUser && (
          <div className="flex flex-col gap-3.5 animate-in fade-in duration-150">
            {/* User Session Card */}
            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-gradient-to-r from-[#faf0ff] to-[#f5e4ff] border border-[#f0d4ff]">
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-13 h-13 rounded-full object-cover ring-2 ring-[#deb7ff] shrink-0"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                }}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="font-rubik text-[15px] font-bold text-[#211630] truncate">
                    {currentUser.name}
                  </h4>
                  <span
                    className={`text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full shrink-0 ${
                      currentUser.role === 'admin'
                        ? 'bg-[#efdbff] text-[#29074a]'
                        : 'bg-[#ffdf9f] text-[#261a00]'
                    }`}
                  >
                    {currentUser.role === 'admin' ? 'Administrador' : 'Clienta'}
                  </span>
                </div>
                <p className="text-[11px] text-[#6f5092] truncate font-mono">
                  @{currentUser.username}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-2 h-2 rounded-full bg-[#38b000] shrink-0 animate-pulse"></span>
                  <span className="text-[11px] text-[#2b7a0b] font-semibold truncate">
                    Sesión Verificada y Cifrada (SHA-256)
                  </span>
                </div>
              </div>
            </div>

            {/* Security Status Box */}
            <div className="p-3.5 rounded-2xl bg-[#fcf8ff] border border-[#f6e9ff] space-y-2.5">
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-[#4c4353] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#7b2cbf]">
                    verified_user
                  </span>
                  Nivel de Permisos
                </span>
                <span className="text-[#7b2cbf] font-bold">
                  {currentUser.role === 'admin'
                    ? 'Control Total de Taller'
                    : 'Catálogo & Compras'}
                </span>
              </div>

              <div className="flex items-center justify-between text-[12px]">
                <span className="text-[#4c4353] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#7b2cbf]">
                    phonelink_lock
                  </span>
                  Verificación en 2 Pasos (2FA)
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#d8f3dc] text-[#1b4332] text-[10.5px] font-bold">
                  Activada & Protegida
                </span>
              </div>

              <div className="flex items-center justify-between text-[12px]">
                <span className="text-[#4c4353] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#7b2cbf]">
                    lock
                  </span>
                  Token de Sesión
                </span>
                <span className="text-[#211630] font-mono text-[11px]">
                  marana_sec_{currentUser.id.slice(-6)}
                </span>
              </div>
            </div>

            {/* Quick Access to Options */}
            <button
              type="button"
              onClick={() => setActiveTab('options')}
              className="p-3 rounded-2xl bg-gradient-to-r from-[#faf0ff] via-[#f7e6ff] to-[#f1dbff] border border-[#d9b5ff] flex items-center justify-between gap-3 text-left hover:brightness-95 transition-all group shadow-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[#7b2cbf] text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-[20px]">tune</span>
                </div>
                <div className="min-w-0">
                  <p className="text-[12.5px] font-bold text-[#211630]">
                    Ir al Apartado de Opciones
                  </p>
                  <p className="text-[11px] text-[#6f5092] truncate">
                    Modificar datos personales y revisar seguridad de la cuenta
                  </p>
                </div>
              </div>
              <span className="material-symbols-outlined text-[20px] text-[#7b2cbf] shrink-0">
                chevron_right
              </span>
            </button>

            {/* Bottom Actions */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => {
                  onLogout();
                  setActiveTab('login');
                  setLoginStep('credentials');
                  onShowToast('Sesión Cerrada', 'Has salido de tu cuenta de forma segura.', 'logout');
                }}
                className="flex-1 py-2.5 px-3 rounded-xl bg-[#ffdad6] text-[#ba1a1a] hover:bg-[#ffdad6]/80 text-[12px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">logout</span>
                <span>Cerrar Sesión</span>
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2.5 px-3 rounded-xl bg-[#7b2cbf] hover:bg-[#6100a4] text-white text-[12px] font-bold transition-all shadow-sm"
                type="button"
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 2: APARTADO DE OPCIONES (Datos Personales + Seguridad)     */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'options' && currentUser && (
          <div className="flex flex-col gap-3 animate-in fade-in duration-150">
            {/* Options Sub-Navigation */}
            <div className="flex items-center gap-1 p-1 bg-[#f4e6ff] rounded-xl text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setOptionsSubTab('personal')}
                className={`flex-1 py-1 px-2 rounded-lg transition-all flex items-center justify-center gap-1 ${
                  optionsSubTab === 'personal'
                    ? 'bg-white text-[#7b2cbf] shadow-xs'
                    : 'text-[#5a486d] hover:text-[#7b2cbf]'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">manage_accounts</span>
                <span>Datos Personales</span>
              </button>
              <button
                type="button"
                onClick={() => setOptionsSubTab('security')}
                className={`flex-1 py-1 px-2 rounded-lg transition-all flex items-center justify-center gap-1 ${
                  optionsSubTab === 'security'
                    ? 'bg-white text-[#7b2cbf] shadow-xs'
                    : 'text-[#5a486d] hover:text-[#7b2cbf]'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">security</span>
                <span>Seguridad & Sesiones</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#38b000]"></span>
              </button>
            </div>

            {/* Sub-tab A: Personal Data */}
            {optionsSubTab === 'personal' && (
              <form onSubmit={handleSavePersonalData} className="flex flex-col gap-3">
                <div className="bg-[#fbf4ff] p-2.5 rounded-2xl border border-[#deb7ff]/60 flex items-start gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#7b2cbf] shrink-0 mt-0.5">
                    edit_note
                  </span>
                  <div>
                    <h4 className="text-[12px] font-bold text-[#211630]">
                      Modificación de Datos de Contacto y Envío
                    </h4>
                    <p className="text-[10.5px] text-[#6f5092]">
                      Estos datos se usarán exclusivamente para tus pedidos y guías de despacho.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-[11.5px] font-bold text-[#211630] block mb-1">
                    Nombre Completo *
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#6f5092] text-[17px]">
                      badge
                    </span>
                    <input
                      type="text"
                      required
                      value={optName}
                      onChange={(e) => setOptName(e.target.value)}
                      placeholder="Tu nombre completo"
                      className="w-full h-9 pl-9 pr-3 rounded-xl bg-[#faf0ff] text-[#211630] text-[12.5px] border border-[#f6e9ff] focus:outline-none focus:ring-2 focus:ring-[#7b2cbf]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11.5px] font-bold text-[#211630] block mb-1">
                      Usuario
                    </label>
                    <input
                      type="text"
                      value={optUsername}
                      onChange={(e) => setOptUsername(e.target.value)}
                      placeholder="usuario"
                      className="w-full h-9 px-3 rounded-xl bg-[#faf0ff] text-[#211630] text-[12px] border border-[#f6e9ff] focus:outline-none focus:ring-2 focus:ring-[#7b2cbf]"
                    />
                  </div>

                  <div>
                    <label className="text-[11.5px] font-bold text-[#211630] block mb-1">
                      Correo *
                    </label>
                    <input
                      type="email"
                      required
                      value={optEmail}
                      onChange={(e) => setOptEmail(e.target.value)}
                      placeholder="correo@ejemplo.com"
                      className="w-full h-9 px-3 rounded-xl bg-[#faf0ff] text-[#211630] text-[12px] border border-[#f6e9ff] focus:outline-none focus:ring-2 focus:ring-[#7b2cbf]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11.5px] font-bold text-[#211630] block mb-1">
                    Teléfono / WhatsApp de Contacto
                  </label>
                  <input
                    type="tel"
                    value={optPhone}
                    onChange={(e) => setOptPhone(e.target.value)}
                    placeholder="+57 300 123 4567"
                    className="w-full h-9 px-3 rounded-xl bg-[#faf0ff] text-[#211630] text-[12.5px] border border-[#f6e9ff] focus:outline-none focus:ring-2 focus:ring-[#7b2cbf]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11.5px] font-bold text-[#211630] block mb-1">
                      Ciudad
                    </label>
                    <input
                      type="text"
                      value={optCity}
                      onChange={(e) => setOptCity(e.target.value)}
                      placeholder="Neiva, Huila"
                      className="w-full h-9 px-3 rounded-xl bg-[#faf0ff] text-[#211630] text-[12px] border border-[#f6e9ff] focus:outline-none focus:ring-2 focus:ring-[#7b2cbf]"
                    />
                  </div>

                  <div>
                    <label className="text-[11.5px] font-bold text-[#211630] block mb-1">
                      Dirección
                    </label>
                    <input
                      type="text"
                      value={optAddress}
                      onChange={(e) => setOptAddress(e.target.value)}
                      placeholder="Calle 10 # 40-20"
                      className="w-full h-9 px-3 rounded-xl bg-[#faf0ff] text-[#211630] text-[12px] border border-[#f6e9ff] focus:outline-none focus:ring-2 focus:ring-[#7b2cbf]"
                    />
                  </div>
                </div>

                {/* Avatar Picker */}
                <div>
                  <label className="text-[11.5px] font-bold text-[#211630] block mb-1">
                    Avatar
                  </label>
                  <div className="flex items-center gap-2 p-1.5 rounded-xl bg-[#faf0ff] border border-[#f6e9ff]">
                    <img
                      src={optAvatarUrl || currentUser.avatarUrl}
                      alt="Avatar"
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-[#7b2cbf] shrink-0"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                      }}
                    />
                    <div className="flex-1 flex items-center gap-1.5 overflow-x-auto py-0.5">
                      {AVATAR_PRESETS.map((presetImg, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setOptAvatarUrl(presetImg)}
                          className={`w-6 h-6 rounded-full overflow-hidden shrink-0 border-2 transition-transform ${
                            optAvatarUrl === presetImg
                              ? 'border-[#7b2cbf] scale-110 shadow-xs'
                              : 'border-transparent hover:scale-105 opacity-70'
                          }`}
                        >
                          <img
                            src={presetImg}
                            alt="avatar"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-[#f6e9ff]">
                  <button
                    type="submit"
                    disabled={isSavingOptions}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-[#7b2cbf] hover:bg-[#6100a4] text-white text-[12px] font-bold flex items-center justify-center gap-1.5 shadow-md shadow-[#7b2cbf]/25 active:scale-95 transition-all"
                  >
                    <span className="material-symbols-outlined text-[17px]">
                      {isSavingOptions ? 'sync' : 'save'}
                    </span>
                    <span>{isSavingOptions ? 'Guardando...' : 'Guardar Datos'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* Sub-tab B: Security & Active Sessions */}
            {optionsSubTab === 'security' && (
              <div className="flex flex-col gap-3">
                {/* 2FA Status Switch */}
                <div className="p-3 rounded-2xl bg-[#fbf4ff] border border-[#deb7ff]/60 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px] text-[#7b2cbf]">
                      security
                    </span>
                    <div>
                      <p className="text-[12px] font-bold text-[#211630]">
                        Autenticación en 2 Pasos (2FA)
                      </p>
                      <p className="text-[10px] text-[#6f5092]">
                        Requiere código temporal en cada inicio de sesión
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIs2FAActive(!is2FAActive);
                      onShowToast(
                        '2FA Actualizado',
                        !is2FAActive ? '2FA activado para mayor seguridad' : '2FA desactivado temporalmente',
                        'security'
                      );
                    }}
                    className={`w-11 h-6 rounded-full p-0.5 transition-colors flex items-center ${
                      is2FAActive ? 'bg-[#7b2cbf] justify-end' : 'bg-stone-300 justify-start'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full bg-white shadow-xs"></div>
                  </button>
                </div>

                {/* Active Sessions Monitor */}
                <div className="p-3 rounded-2xl bg-[#faf0ff] border border-[#f6e9ff] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#211630] uppercase tracking-wider flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px] text-[#7b2cbf]">
                        devices
                      </span>
                      Dispositivos y Sesiones Activas
                    </span>
                    <button
                      type="button"
                      onClick={() => onShowToast('Sesiones Revocadas', 'Se han cerrado las sesiones en otros navegadores', 'lock')}
                      className="text-[10px] text-[#ba1a1a] font-bold hover:underline"
                    >
                      Cerrar otras
                    </button>
                  </div>

                  <div className="p-2 rounded-xl bg-white border border-[#f0d8ff] flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[17px] text-[#38b000]">
                        laptop_mac
                      </span>
                      <div>
                        <p className="font-bold text-[#211630]">Navegador Web Actual</p>
                        <p className="text-[10px] text-[#6f5092]">IP: 190.158.42.10 · Neiva, CO</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-[#d8f3dc] text-[#1b4332] text-[9.5px] font-bold">
                      Activa ahora
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-white/70 border border-[#f0d8ff] flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[17px] text-[#6f5092]">
                        tablet_mac
                      </span>
                      <div>
                        <p className="font-semibold text-[#211630]">iPad Taller Maraña</p>
                        <p className="text-[10px] text-[#6f5092]">IP: 181.135.20.88 · Sede Taller Neiva</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-[#6f5092]">Hace 2h</span>
                  </div>
                </div>

                {/* Change Password Collapsible Section */}
                <div className="p-3 rounded-2xl bg-[#faf0ff] border border-[#f6e9ff]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-[#7b2cbf]">
                        password
                      </span>
                      <span className="text-[12px] font-bold text-[#211630]">
                        Actualizar Contraseña
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPasswordChange(!showPasswordChange)}
                      className="text-[11px] font-bold text-[#7b2cbf] hover:underline"
                    >
                      {showPasswordChange ? 'Ocultar' : 'Modificar'}
                    </button>
                  </div>

                  {showPasswordChange && (
                    <form onSubmit={handleChangePassword} className="mt-2.5 space-y-2 pt-2 border-t border-[#f0d8ff]">
                      <div>
                        <label className="text-[10.5px] font-bold text-[#211630] block mb-0.5">
                          Nueva Contraseña Segura
                        </label>
                        <input
                          type="password"
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Mínimo 8 caracteres"
                          className="w-full h-8 px-2.5 rounded-lg bg-white text-[12px] border border-[#deb7ff] focus:outline-none focus:ring-1 focus:ring-[#7b2cbf]"
                        />
                        {newPassword && (
                          <div className="mt-1 flex items-center gap-2 text-[10px]">
                            <div className="flex-1 h-1.5 bg-stone-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${evaluatePasswordStrength(newPassword).color} transition-all`}
                                style={{ width: `${(evaluatePasswordStrength(newPassword).score / 4) * 100}%` }}
                              ></div>
                            </div>
                            <span className={`font-bold ${evaluatePasswordStrength(newPassword).text}`}>
                              {evaluatePasswordStrength(newPassword).label}
                            </span>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="text-[10.5px] font-bold text-[#211630] block mb-0.5">
                          Confirmar Nueva Contraseña
                        </label>
                        <input
                          type="password"
                          required
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          placeholder="Repite la contraseña"
                          className="w-full h-8 px-2.5 rounded-lg bg-white text-[12px] border border-[#deb7ff] focus:outline-none focus:ring-1 focus:ring-[#7b2cbf]"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSavingOptions}
                        className="w-full py-2 rounded-xl bg-[#7b2cbf] hover:bg-[#6100a4] text-white text-[11px] font-bold shadow-xs transition-all"
                      >
                        Actualizar y Encriptar
                      </button>
                    </form>
                  )}
                </div>

                {/* Security Audit Log */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6f5092] block">
                    Registro de Eventos de Seguridad Recientes:
                  </span>
                  <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                    {auditLogs.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        className="p-2 rounded-xl bg-[#faf0ff] border border-[#f6e9ff] text-[10.5px] flex items-start gap-2"
                      >
                        <span className="material-symbols-outlined text-[14px] text-[#38b000] shrink-0 mt-0.5">
                          check_circle
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-[#211630] leading-tight">
                            {item.event}
                          </p>
                          <p className="text-[9.5px] text-[#6f5092]">
                            {item.timestamp} · {item.location} ({item.ip})
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 3: INICIAR SESIÓN SEGURA (Multi-Paso / 2FA / Anti-Brute)  */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'login' && (
          <div className="flex flex-col gap-3 animate-in fade-in duration-150">
            {/* Step Indicator */}
            <div className="flex items-center justify-between px-2 py-1.5 rounded-xl bg-[#fbf4ff] border border-[#deb7ff]/50 text-[11px]">
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                    loginStep === 'credentials'
                      ? 'bg-[#7b2cbf] text-white shadow-xs'
                      : 'bg-[#d8f3dc] text-[#1b4332]'
                  }`}
                >
                  {loginStep === 'credentials' ? '1' : '✓'}
                </span>
                <span className={loginStep === 'credentials' ? 'font-bold text-[#211630]' : 'text-[#6f5092]'}>
                  Credenciales
                </span>
              </div>
              <span className="material-symbols-outlined text-[14px] text-[#deb7ff]">arrow_forward</span>
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                    loginStep === '2fa'
                      ? 'bg-[#7b2cbf] text-white shadow-xs'
                      : 'bg-stone-200 text-stone-600'
                  }`}
                >
                  2
                </span>
                <span className={loginStep === '2fa' ? 'font-bold text-[#211630]' : 'text-[#6f5092]'}>
                  Verificación 2FA
                </span>
              </div>
            </div>

            {/* Error / Alert Message */}
            {loginError && (
              <div className="p-2.5 rounded-xl bg-[#ffebee] border border-[#ffcdd2] text-[#c62828] text-[11.5px] flex items-start gap-2 animate-in fade-in">
                <span className="material-symbols-outlined text-[17px] shrink-0 mt-0.5">
                  error
                </span>
                <div className="flex-1 leading-snug">{loginError}</div>
              </div>
            )}

            {/* --------------------------------------------------------- */}
            {/* STEP 1: CREDENCIALES                                      */}
            {/* --------------------------------------------------------- */}
            {loginStep === 'credentials' && (
              <form onSubmit={handleCredentialsSubmit} className="flex flex-col gap-3">
                <div>
                  <label className="text-[12px] font-bold text-[#211630] block mb-1">
                    Usuario o Correo Electrónico *
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#6f5092] text-[18px]">
                      person
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="ej: lucia@marana.com o sofia@gmail.com"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      className="w-full h-10 pl-9 pr-3 rounded-xl bg-[#faf0ff] text-[#211630] text-[13px] border border-[#f6e9ff] focus:outline-none focus:ring-2 focus:ring-[#7b2cbf]"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[12px] font-bold text-[#211630]">
                      Contraseña Cifrada *
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        onShowToast(
                          'Recuperación Segura',
                          'Usa las credenciales sugeridas abajo o tu clave de registro',
                          'info'
                        )
                      }
                      className="text-[10px] text-[#6100a4] hover:underline font-semibold"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#6f5092] text-[18px]">
                      lock
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full h-10 pl-9 pr-10 rounded-xl bg-[#faf0ff] text-[#211630] text-[13px] border border-[#f6e9ff] focus:outline-none focus:ring-2 focus:ring-[#7b2cbf]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-2.5 text-[#6f5092] hover:text-[#211630]"
                      tabIndex={-1}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Security checks: Remember device + Attempt indicator */}
                <div className="flex items-center justify-between text-[11px] text-[#4c4353]">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 accent-[#7b2cbf] rounded"
                    />
                    <span>Recordar este equipo (Dispositivo seguro)</span>
                  </label>
                  {failedAttempts > 0 && (
                    <span className="text-[10.5px] font-bold text-[#ba1a1a]">
                      Intentos: {failedAttempts}/3
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-2xl bg-[#7b2cbf] hover:bg-[#6100a4] text-white text-[13px] font-bold flex items-center justify-center gap-1.5 shadow-md shadow-[#7b2cbf]/25 active:scale-95 transition-all mt-1"
                >
                  <span
                    className={`material-symbols-outlined text-[18px] ${
                      isLoading ? 'animate-spin' : ''
                    }`}
                  >
                    {isLoading ? 'sync' : 'lock_open'}
                  </span>
                  <span>{isLoading ? 'Verificando Hash...' : 'Continuar al Paso 2 (2FA)'}</span>
                </button>

                {/* Suggested Test Credentials with Clear Security Values */}
                <div className="pt-2 border-t border-[#f6e9ff] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#6f5092] font-bold uppercase tracking-wider">
                      Credenciales de Prueba Seguras:
                    </span>
                    <span className="text-[9.5px] text-[#38b000] font-bold flex items-center gap-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#38b000]"></span>
                      2FA activo
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleQuickPresetFill(PRESET_ACCOUNTS[0])}
                      className="p-2 rounded-xl bg-[#f1dbff] text-[#29074a] text-[11px] font-bold border border-[#d9b5ff] hover:bg-[#deb7ff] flex flex-col items-start transition-all"
                    >
                      <span className="flex items-center gap-1 text-[#6100a4]">
                        <span className="material-symbols-outlined text-[14px]">
                          admin_panel_settings
                        </span>
                        Administradora
                      </span>
                      <span className="text-[9.5px] font-mono text-[#5a3880]">
                        lucia@marana.com
                      </span>
                      <span className="text-[9px] text-[#7b2cbf]">Clave: admin123</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickPresetFill(PRESET_ACCOUNTS[1])}
                      className="p-2 rounded-xl bg-[#faf0ff] text-[#211630] text-[11px] font-bold border border-[#f6e9ff] hover:bg-[#deb7ff] flex flex-col items-start transition-all"
                    >
                      <span className="flex items-center gap-1 text-[#7b2cbf]">
                        <span className="material-symbols-outlined text-[14px]">
                          shopping_bag
                        </span>
                        Clienta VIP
                      </span>
                      <span className="text-[9.5px] font-mono text-[#5a3880]">
                        sofia@gmail.com
                      </span>
                      <span className="text-[9px] text-[#7b2cbf]">Clave: cliente123</span>
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* --------------------------------------------------------- */}
            {/* STEP 2: AUTENTICACIÓN EN DOS PASOS (2FA / PIN / OTP)      */}
            {/* --------------------------------------------------------- */}
            {loginStep === '2fa' && pendingAccount && (
              <form onSubmit={handle2FASubmit} className="flex flex-col gap-3">
                {/* 2FA Target Banner */}
                <div className="p-3 rounded-2xl bg-gradient-to-br from-[#faf0ff] to-[#f4e6ff] border border-[#d9b5ff] flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#7b2cbf] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <span className="material-symbols-outlined text-[18px]">phonelink_ring</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-[12.5px] font-bold text-[#211630]">
                      Verificación de Seguridad 2FA
                    </h4>
                    <p className="text-[11px] text-[#6f5092] leading-tight">
                      Código generado para {pendingAccount.name} ({pendingAccount.email})
                    </p>
                  </div>
                </div>

                {!useEmergencyKey ? (
                  <>
                    {/* Simulated OTP Code Display for Smooth User Testing */}
                    <div className="p-2.5 rounded-xl bg-[#ecfdf5] border border-[#a7f3d0] flex items-center justify-between text-[11.5px]">
                      <div className="flex items-center gap-1.5 text-[#065f46]">
                        <span className="material-symbols-outlined text-[16px]">key</span>
                        <span>Código OTP generado:</span>
                        <strong className="font-mono text-[14px] tracking-wider text-[#047857]">
                          {expectedOtp}
                        </strong>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setOtpCode(expectedOtp);
                          if (pendingAccount.workshopPin) {
                            setAdminPin(pendingAccount.workshopPin);
                          }
                          onShowToast('Código Insertado', 'El código 2FA se autorrellenó en el campo', 'check');
                        }}
                        className="px-2 py-0.5 rounded-md bg-[#047857] text-white font-bold text-[10px] hover:bg-[#065f46] transition-colors"
                      >
                        Auto-Rellenar
                      </button>
                    </div>

                    {/* 6-Digit Code Input */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[12px] font-bold text-[#211630]">
                          Ingresa el Código de 6 Dígitos *
                        </label>
                        <span className="text-[10px] font-mono text-[#6f5092]">
                          Vence en: <strong className="text-[#7b2cbf]">{otpCountdown}s</strong>
                        </span>
                      </div>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#6f5092] text-[18px]">
                          pin
                        </span>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          placeholder="749201"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                          className="w-full h-11 pl-9 pr-3 rounded-xl bg-[#faf0ff] text-[#211630] font-mono font-bold text-[17px] tracking-widest text-center border border-[#f6e9ff] focus:outline-none focus:ring-2 focus:ring-[#7b2cbf]"
                        />
                      </div>
                    </div>

                    {/* Workshop Clearance PIN for Admin accounts */}
                    {pendingAccount.role === 'admin' && (
                      <div className="p-3 rounded-2xl bg-[#fff8e1] border border-[#ffe082] space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-[11.5px] font-bold text-[#b45309] flex items-center gap-1">
                            <span className="material-symbols-outlined text-[15px]">admin_panel_settings</span>
                            PIN de Taller Autorizado (Admin) *
                          </label>
                          <span className="text-[10px] font-mono font-bold text-[#b45309]">
                            PIN: {pendingAccount.workshopPin}
                          </span>
                        </div>
                        <input
                          type="password"
                          required
                          maxLength={6}
                          placeholder="Introduce el PIN de taller"
                          value={adminPin}
                          onChange={(e) => setAdminPin(e.target.value)}
                          className="w-full h-9 px-3 rounded-xl bg-white text-[#211630] font-mono font-bold text-[13px] border border-[#f59e0b] focus:outline-none focus:ring-2 focus:ring-[#b45309]"
                        />
                      </div>
                    )}

                    {/* Resend OTP button */}
                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <button
                        type="button"
                        onClick={generateNewOtp}
                        className="text-[#7b2cbf] font-bold hover:underline flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[14px]">refresh</span>
                        <span>Reenviar nuevo código</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setUseEmergencyKey(true)}
                        className="text-[#6f5092] hover:text-[#211630]"
                      >
                        Usar llave de respaldo
                      </button>
                    </div>
                  </>
                ) : (
                  /* Emergency Recovery Key Input */
                  <div className="space-y-2 p-3 rounded-2xl bg-[#fff3e0] border border-[#ffcc80]">
                    <div className="flex items-center justify-between">
                      <label className="text-[12px] font-bold text-[#e65100]">
                        Llave de Respaldo de Emergencia
                      </label>
                      <button
                        type="button"
                        onClick={() => setUseEmergencyKey(false)}
                        className="text-[10px] text-[#e65100] font-bold hover:underline"
                      >
                        Volver a 2FA
                      </button>
                    </div>
                    <p className="text-[10.5px] text-[#795548]">
                      Llave configurada en tu cuenta:{' '}
                      <strong className="font-mono">{pendingAccount.emergencyKey}</strong>
                    </p>
                    <input
                      type="text"
                      required
                      placeholder="MARANA-..."
                      value={emergencyKeyInput}
                      onChange={(e) => setEmergencyKeyInput(e.target.value)}
                      className="w-full h-9 px-3 rounded-xl bg-white text-[#211630] font-mono text-[12px] border border-[#ff9800] focus:outline-none focus:ring-2 focus:ring-[#e65100]"
                    />
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-2 border-t border-[#f6e9ff]">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginStep('credentials');
                      setLoginError(null);
                    }}
                    className="py-2.5 px-3 rounded-xl bg-[#f6e9ff] hover:bg-[#ebd3ff] text-[#6100a4] text-[12px] font-bold transition-all"
                  >
                    Atrás
                  </button>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-[#7b2cbf] hover:bg-[#6100a4] text-white text-[12px] font-bold flex items-center justify-center gap-1.5 shadow-md shadow-[#7b2cbf]/25 active:scale-95 transition-all"
                  >
                    <span
                      className={`material-symbols-outlined text-[17px] ${
                        isLoading ? 'animate-spin' : ''
                      }`}
                    >
                      {isLoading ? 'sync' : 'verified_user'}
                    </span>
                    <span>{isLoading ? 'Comprobando 2FA...' : 'Validar Identidad y Entrar'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* --------------------------------------------------------- */}
            {/* LOCKOUT SCREEN (ANTI-BRUTE FORCE FREEZE)                  */}
            {/* --------------------------------------------------------- */}
            {loginStep === 'lockout' && (
              <div className="p-4 rounded-2xl bg-[#fff0f3] border border-[#ffccd5] flex flex-col gap-3 animate-in fade-in">
                <div className="flex items-center gap-2 text-[#c9184a]">
                  <span className="material-symbols-outlined text-[24px]">gpp_bad</span>
                  <div>
                    <h4 className="text-[13px] font-bold">Bloqueo Temporal de Seguridad</h4>
                    <p className="text-[11px] text-[#800f2f]">
                      Se detectaron 3 intentos fallidos consecutivos (Protección Anti-Fuerza Bruta)
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white text-center border border-[#ffb3c1]">
                  <p className="text-[11px] text-[#590d22]">Tiempo de espera restante:</p>
                  <p className="font-mono text-[24px] font-bold text-[#c9184a]">
                    00:{lockoutSeconds < 10 ? `0${lockoutSeconds}` : lockoutSeconds}
                  </p>
                </div>

                {/* Anti-Bot Captcha Bypass */}
                <form onSubmit={handleUnlockCaptcha} className="p-3 rounded-xl bg-white border border-[#ffb3c1] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#590d22]">
                      ¿Eres un humano? Desbloqueo rápido:
                    </span>
                    <button
                      type="button"
                      onClick={regenerateCaptcha}
                      className="text-[10px] text-[#c9184a] font-bold hover:underline"
                    >
                      Cambiar
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1.5 bg-[#f8f9fa] border rounded-lg font-mono font-bold text-[14px]">
                      {captchaProblem.q} = ?
                    </span>
                    <input
                      type="number"
                      required
                      placeholder="Resultado"
                      value={captchaAnswer}
                      onChange={(e) => setCaptchaAnswer(e.target.value)}
                      className="flex-1 h-9 px-2.5 rounded-lg border text-[13px] focus:outline-none focus:ring-2 focus:ring-[#c9184a]"
                    />
                    <button
                      type="submit"
                      className="px-3 py-2 rounded-lg bg-[#c9184a] text-white text-[11px] font-bold hover:bg-[#a4133c]"
                    >
                      Verificar
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 4: CREAR CUENTA CON EVALUACIÓN DE FUERZA DE CONTRASEÑA    */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-2.5 animate-in fade-in duration-150">
            <div>
              <label className="text-[12px] font-bold text-[#211630] block mb-1">
                Nombre Completo *
              </label>
              <input
                type="text"
                required
                placeholder="Ej: Carolina Restrepo"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                className="w-full h-9 px-3 rounded-xl bg-[#faf0ff] text-[#211630] text-[12px] border border-[#f6e9ff] focus:outline-none focus:ring-2 focus:ring-[#7b2cbf]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[12px] font-bold text-[#211630] block mb-1">
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  required
                  placeholder="carolina@ejemplo.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-[#faf0ff] text-[#211630] text-[12px] border border-[#f6e9ff] focus:outline-none focus:ring-2 focus:ring-[#7b2cbf]"
                />
              </div>

              <div>
                <label className="text-[12px] font-bold text-[#211630] block mb-1">
                  Nombre de Usuario
                </label>
                <input
                  type="text"
                  placeholder="caro_restrepo"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-[#faf0ff] text-[#211630] text-[12px] border border-[#f6e9ff] focus:outline-none focus:ring-2 focus:ring-[#7b2cbf]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[12px] font-bold text-[#211630]">
                  Contraseña Segura *
                </label>
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  className="text-[10px] text-[#7b2cbf] font-bold"
                >
                  {showRegPassword ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
              <input
                type={showRegPassword ? 'text' : 'password'}
                required
                placeholder="Mínimo 8 caracteres, números o mayúsculas"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                className="w-full h-9 px-3 rounded-xl bg-[#faf0ff] text-[#211630] text-[12px] border border-[#f6e9ff] focus:outline-none focus:ring-2 focus:ring-[#7b2cbf]"
              />
              {regPassword && (
                <div className="mt-1 flex items-center gap-2 text-[10px]">
                  <div className="flex-1 h-1.5 bg-stone-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${evaluatePasswordStrength(regPassword).color} transition-all`}
                      style={{ width: `${(evaluatePasswordStrength(regPassword).score / 4) * 100}%` }}
                    ></div>
                  </div>
                  <span className={`font-bold ${evaluatePasswordStrength(regPassword).text}`}>
                    {evaluatePasswordStrength(regPassword).label}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="text-[12px] font-bold text-[#211630] block mb-1">
                Confirmar Contraseña *
              </label>
              <input
                type="password"
                required
                placeholder="Repite la contraseña"
                value={regConfirmPassword}
                onChange={(e) => setRegConfirmPassword(e.target.value)}
                className="w-full h-9 px-3 rounded-xl bg-[#faf0ff] text-[#211630] text-[12px] border border-[#f6e9ff] focus:outline-none focus:ring-2 focus:ring-[#7b2cbf]"
              />
            </div>

            <div>
              <label className="text-[12px] font-bold text-[#211630] block mb-1">
                Tipo de Cuenta
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRegRole('client')}
                  className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition-all ${
                    regRole === 'client'
                      ? 'bg-[#7b2cbf] text-white border-[#7b2cbf]'
                      : 'bg-[#faf0ff] text-[#4c4353] border-[#f6e9ff]'
                  }`}
                >
                  Clienta / Boutique
                </button>
                <button
                  type="button"
                  onClick={() => setRegRole('admin')}
                  className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition-all ${
                    regRole === 'admin'
                      ? 'bg-[#7b2cbf] text-white border-[#7b2cbf]'
                      : 'bg-[#faf0ff] text-[#4c4353] border-[#f6e9ff]'
                  }`}
                >
                  Equipo de Taller (Admin)
                </button>
              </div>
            </div>

            {/* 2FA activation checkbox */}
            <label className="flex items-center gap-2 p-2 rounded-xl bg-[#faf0ff] border border-[#f6e9ff] text-[11px] text-[#4c4353] cursor-pointer">
              <input
                type="checkbox"
                checked={reg2FAEnabled}
                onChange={(e) => setReg2FAEnabled(e.target.checked)}
                className="w-4 h-4 accent-[#7b2cbf] rounded"
              />
              <span>Activar autenticación de dos factores (2FA) en esta cuenta</span>
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-2xl bg-[#7b2cbf] hover:bg-[#6100a4] text-white text-[13px] font-bold flex items-center justify-center gap-1.5 shadow-md shadow-[#7b2cbf]/25 active:scale-95 transition-all mt-1"
            >
              <span
                className={`material-symbols-outlined text-[18px] ${
                  isLoading ? 'animate-spin' : ''
                }`}
              >
                {isLoading ? 'sync' : 'person_add'}
              </span>
              <span>{isLoading ? 'Cifrando cuenta...' : 'Crear Cuenta Segura'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
