import React, { useState, useEffect } from 'react';
import {
  X,
  Settings,
  Shield,
  BarChart3,
  HardDrive,
  Globe2,
  CheckCircle2,
  AlertCircle,
  Key,
  RefreshCw,
  Trash2,
  SunMoon,
  Building2,
  Users,
} from 'lucide-react';
import { StorageConfig, AnalyticsConfig, StorageProviderType, AppTheme } from '../types';
import { StorageService } from '../services/storageService';
import { AnalyticsService, AnalyticsEventLog } from '../services/analyticsService';
import { AuthService } from '../services/authService';
import { PARAGUAY_BANKS } from '../utils/paraguayBanking';
import { ThemeSwitcher } from './ThemeSwitcher';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (type: 'success' | 'error' | 'info', message: string) => void;
  selectedCurrency: string;
  onCurrencyChange: (curr: string) => void;
  currentTheme: AppTheme;
  onThemeChange: (theme: AppTheme) => void;
  onOpenCompanyManager: () => void;
  onOpenUserManager: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
  selectedCurrency,
  onCurrencyChange,
  currentTheme,
  onThemeChange,
  onOpenCompanyManager,
  onOpenUserManager,
}) => {
  const [activeTab, setActiveTab] = useState<'theme' | 'storage' | 'auth' | 'analytics' | 'paraguay'>('theme');

  // Storage State
  const [storageConfig, setStorageConfig] = useState<StorageConfig>(StorageService.getConfig());
  const [testResult, setTestResult] = useState<{ loading: boolean; message: string; success?: boolean } | null>(null);

  // Auth State
  const [googleClientId, setGoogleClientId] = useState<string>(AuthService.getGoogleClientId());

  // Analytics State
  const [analyticsConfig, setAnalyticsConfig] = useState<AnalyticsConfig>(AnalyticsService.getConfig());
  const [analyticsLogs, setAnalyticsLogs] = useState<AnalyticsEventLog[]>([]);

  useEffect(() => {
    if (isOpen) {
      setStorageConfig(StorageService.getConfig());
      setGoogleClientId(AuthService.getGoogleClientId());
      setAnalyticsConfig(AnalyticsService.getConfig());
      setAnalyticsLogs(AnalyticsService.getLogs());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveStorage = () => {
    StorageService.saveConfig(storageConfig);
    onShowToast('success', `Configuración de almacenamiento (${storageConfig.provider.toUpperCase()}) guardada`);
  };

  const handleTestStorage = async () => {
    setTestResult({ loading: true, message: 'Probando conexión...' });
    const res = await StorageService.testConnection(storageConfig.provider);
    setTestResult({ loading: false, message: res.message, success: res.success });
    if (res.success) {
      onShowToast('success', res.message);
    } else {
      onShowToast('error', res.message);
    }
  };

  const handleSaveAuth = () => {
    AuthService.setGoogleClientId(googleClientId);
    onShowToast('success', 'Google Client ID guardado');
  };

  const handleSaveAnalytics = () => {
    AnalyticsService.saveConfig(analyticsConfig);
    onShowToast('success', 'Configuración de Google Analytics guardada');
  };

  const handleTestAnalyticsEvent = () => {
    AnalyticsService.trackEvent('test_ping_event', {
      source: 'settings_modal',
      timestamp: new Date().toISOString(),
    });
    setAnalyticsLogs(AnalyticsService.getLogs());
    onShowToast('info', 'Evento de prueba enviado a Google Analytics / Registro local');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#131826] border border-slate-200 dark:border-[#8b93a7]/20 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-900 dark:text-[#e8e5df]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-[#8b93a7]/15 flex items-center justify-between bg-slate-50 dark:bg-[#0e121a]/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#c47046]/15 text-[#c47046] flex items-center justify-center border border-[#c47046]/30">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Configuración del Sistema</h2>
              <p className="text-xs text-slate-500 dark:text-[#8b93a7]">
                Temas · Empresas · Bancos Paraguay · Storage · Google Analytics
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-[#e8e5df] hover:bg-slate-100 dark:hover:bg-[#181e2e] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-[#8b93a7]/15 bg-slate-100/60 dark:bg-[#0a0c10]/40 px-6 gap-2 pt-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('theme')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'theme'
                ? 'border-[#c47046] text-[#c47046] bg-white dark:bg-[#131826]'
                : 'border-transparent text-slate-500 dark:text-[#8b93a7] hover:text-slate-900 dark:hover:text-[#e8e5df]'
            }`}
          >
            <SunMoon className="w-4 h-4" />
            Tema & Aspecto
          </button>
          <button
            onClick={() => setActiveTab('paraguay')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'paraguay'
                ? 'border-[#c47046] text-[#c47046] bg-white dark:bg-[#131826]'
                : 'border-transparent text-slate-500 dark:text-[#8b93a7] hover:text-slate-900 dark:hover:text-[#e8e5df]'
            }`}
          >
            <Globe2 className="w-4 h-4" />
            Bancos & Empresas PY
          </button>
          <button
            onClick={() => setActiveTab('storage')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'storage'
                ? 'border-[#c47046] text-[#c47046] bg-white dark:bg-[#131826]'
                : 'border-transparent text-slate-500 dark:text-[#8b93a7] hover:text-slate-900 dark:hover:text-[#e8e5df]'
            }`}
          >
            <HardDrive className="w-4 h-4" />
            Storage / Cloud
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'border-[#c47046] text-[#c47046] bg-white dark:bg-[#131826]'
                : 'border-transparent text-slate-500 dark:text-[#8b93a7] hover:text-slate-900 dark:hover:text-[#e8e5df]'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Google Analytics (GA4)
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB: THEME */}
          {activeTab === 'theme' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-bold mb-1">
                  Esquema de Color y Tema Visual
                </h3>
                <p className="text-xs text-slate-500 dark:text-[#8b93a7]">
                  Personaliza la interfaz seleccionando entre tema claro (ideal para oficinas luminosas), tema oscuro (modo financiero nocturno), o automático según tu sistema operativo.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-[#181e2e]/50 border border-slate-200 dark:border-[#8b93a7]/15 rounded-2xl p-5 space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#c47046]">
                  Selecciona la Preferencia de Color
                </span>
                <ThemeSwitcher
                  currentTheme={currentTheme}
                  onThemeChange={onThemeChange}
                  variant="buttons"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenCompanyManager();
                  }}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:border-[#c47046]/40 transition-all flex items-start gap-3 text-left"
                >
                  <div className="p-2 rounded-lg bg-[#c47046]/15 text-[#c47046]">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold">Gestión de las 4 Empresas</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Editar datos de Agroservicios, Distribuidora Asunción, Tech PY y Constructora Guaraní
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenUserManager();
                  }}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:border-[#c47046]/40 transition-all flex items-start gap-3 text-left"
                >
                  <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold">Usuarios & Venta Comercial</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Crear cuentas, cambiar contraseñas y habilitar clientes múltiples
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* TAB: PARAGUAY & CURRENCY */}
          {activeTab === 'paraguay' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-bold mb-1">
                  Bancos Oficiales de Paraguay (SIPAP ISO 20022) & Divisas
                </h3>
                <p className="text-xs text-slate-500 dark:text-[#8b93a7]">
                  El sistema está optimizado exclusivamente para las dos entidades líderes habilitadas: Banco Itaú Paraguay S.A. y ueno bank S.A.
                </p>
              </div>

              {/* Currency Selector */}
              <div className="bg-slate-50 dark:bg-[#181e2e]/50 border border-slate-200 dark:border-[#8b93a7]/15 rounded-xl p-4 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#c47046]">
                  Moneda Principal de Visualización
                </span>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { code: 'PYG', label: 'Guaraníes (PYG)', symbol: 'Gs.', desc: 'Moneda Oficial de Paraguay' },
                    { code: 'USD', label: 'Dólares (USD)', symbol: '$', desc: 'Comercio Exterior / Bimonetario' },
                    { code: 'EUR', label: 'Euros (EUR)', symbol: '€', desc: 'Estándar ISO 20022 Europeo' },
                  ].map((c) => (
                    <button
                      key={c.code}
                      onClick={() => {
                        onCurrencyChange(c.code);
                        onShowToast('success', `Moneda establecida en ${c.label}`);
                      }}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedCurrency === c.code
                          ? 'bg-[#c47046]/15 border-[#c47046]'
                          : 'bg-white dark:bg-[#0a0c10] border-slate-200 dark:border-[#8b93a7]/15 text-slate-600 dark:text-[#8b93a7] hover:border-[#c47046]/40'
                      }`}
                    >
                      <div className="text-sm font-bold text-[#c47046]">{c.symbol}</div>
                      <div className="text-xs font-bold mt-1 text-slate-900 dark:text-[#e8e5df]">{c.label}</div>
                      <div className="text-[10px] text-slate-500">{c.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Paraguay Banks List */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Bancos Paraguay Habilitados en el Sistema ({PARAGUAY_BANKS.length})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PARAGUAY_BANKS.map((b) => (
                    <div
                      key={b.id}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#181e2e]/40 border border-slate-200 dark:border-[#8b93a7]/15 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-[#e8e5df]">{b.name}</div>
                        <div className="text-[11px] text-slate-500 dark:text-[#8b93a7] font-mono mt-0.5">
                          BIC: {b.bic} · Código SIPAP: {b.sipapCode}
                        </div>
                      </div>
                      <span className="text-[9.5px] px-2 py-0.5 rounded-full bg-[#7ba8b8]/15 text-[#7ba8b8] font-bold">
                        {b.tag}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: STORAGE PROVIDER */}
          {activeTab === 'storage' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-bold mb-1">
                  Arquitectura Modular de Almacenamiento (Storage Adapter)
                </h3>
                <p className="text-xs text-slate-500 dark:text-[#8b93a7]">
                  Elige dónde se almacenarán los extractos y registros de conciliación.
                </p>
              </div>

              {/* Provider Selector Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  {
                    id: 'local',
                    name: 'Local / Navegador',
                    desc: 'IndexedDB / LocalStorage. Máxima privacidad, 100% en cliente sin coste.',
                    badge: 'Recomendado Tesis',
                  },
                  {
                    id: 'supabase',
                    name: 'Supabase Storage',
                    desc: 'Bucket PostgreSQL + Object Storage S3 compatible para PYMEs.',
                    badge: 'Cloud Sencillo',
                  },
                  {
                    id: 's3',
                    name: 'AWS S3 / Cloudflare R2',
                    desc: 'Almacenamiento de objetos corporativo para grandes volúmenes.',
                    badge: 'Escalable',
                  },
                  {
                    id: 'firebase',
                    name: 'Firebase Storage',
                    desc: 'Google Cloud Storage vinculado a Firebase para autenticación unificada.',
                    badge: 'GCP',
                  },
                  {
                    id: 'custom_api',
                    name: 'REST API Propia',
                    desc: 'Endpoint personalizado en tu propio servidor backend (Node, Django, Spring).',
                    badge: 'Personalizado',
                  },
                ].map((p) => {
                  const isSelected = storageConfig.provider === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setStorageConfig({ ...storageConfig, provider: p.id as StorageProviderType })}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#c47046]/15 border-[#c47046] shadow-md shadow-[#c47046]/10'
                          : 'bg-slate-50 dark:bg-[#181e2e]/60 border-slate-200 dark:border-[#8b93a7]/15 hover:border-[#c47046]/30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold">{p.name}</span>
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            isSelected
                              ? 'bg-[#c47046] text-white'
                              : 'bg-slate-200 dark:bg-[#8b93a7]/15 text-slate-700 dark:text-[#8b93a7]'
                          }`}
                        >
                          {p.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-[#8b93a7] leading-relaxed">{p.desc}</p>
                    </div>
                  );
                })}
              </div>

              {/* Dynamic Credentials Form */}
              <div className="bg-slate-50 dark:bg-[#181e2e]/50 border border-slate-200 dark:border-[#8b93a7]/15 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#c47046]">
                    Parámetros de Conexión: {storageConfig.provider.toUpperCase()}
                  </h4>
                  <span className="text-[10px] text-[#7ba8b8] font-mono">Driver: {storageConfig.provider}</span>
                </div>

                {storageConfig.provider === 'local' && (
                  <div className="text-xs text-[#2d9e6e] bg-[#2d9e6e]/10 border border-[#2d9e6e]/20 p-3 rounded-lg flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>
                      El almacenamiento local opera directamente en el navegador del usuario. No requiere claves de API ni conexión a internet.
                    </span>
                  </div>
                )}

                {testResult && (
                  <div
                    className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                      testResult.success
                        ? 'bg-[#2d9e6e]/15 text-[#2d9e6e] border border-[#2d9e6e]/30'
                        : 'bg-[#dc4a38]/15 text-[#dc4a38] border border-[#dc4a38]/30'
                    }`}
                  >
                    {testResult.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    <span>{testResult.message}</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={handleTestStorage}
                    className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-[#131826] border border-slate-300 dark:border-[#8b93a7]/20 text-slate-700 dark:text-[#8b93a7] hover:border-[#c47046]/40 transition-colors flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Probar Conexión
                  </button>
                  <button
                    onClick={handleSaveStorage}
                    className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-[#c47046] text-white hover:bg-[#a85a33] transition-colors"
                  >
                    Guardar Configuración
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: GOOGLE ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-bold mb-1">Telemetría y Google Analytics 4 (GA4)</h3>
                <p className="text-xs text-slate-500 dark:text-[#8b93a7]">
                  Monitoriza el uso de la plataforma y métricas de adopción para tu PYME o análisis de la tesis.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-[#181e2e]/50 border border-slate-200 dark:border-[#8b93a7]/15 rounded-xl p-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-[#8b93a7] mb-1">
                      ID de Medición de GA4 (Measurement ID)
                    </label>
                    <input
                      type="text"
                      placeholder="G-XXXXXXXXXX"
                      value={analyticsConfig.gaMeasurementId}
                      onChange={(e) => setAnalyticsConfig({ ...analyticsConfig, gaMeasurementId: e.target.value })}
                      className="w-full bg-white dark:bg-[#0a0c10] border border-slate-300 dark:border-[#8b93a7]/20 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#c47046] font-mono"
                    />
                  </div>
                  <div className="flex flex-col justify-end">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold pb-2">
                      <input
                        type="checkbox"
                        checked={analyticsConfig.enabled}
                        onChange={(e) => setAnalyticsConfig({ ...analyticsConfig, enabled: e.target.checked })}
                        className="rounded text-[#c47046] focus:ring-[#c47046]"
                      />
                      Activar telemetría de eventos anónimos
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-[#8b93a7]/15">
                  <button
                    onClick={handleTestAnalyticsEvent}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-[#131826] border border-slate-300 dark:border-[#8b93a7]/20 text-slate-700 dark:text-[#8b93a7] transition-colors"
                  >
                    Enviar Evento de Prueba
                  </button>
                  <button
                    onClick={handleSaveAnalytics}
                    className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-[#c47046] text-white hover:bg-[#a85a33] transition-colors"
                  >
                    Guardar Configuración GA4
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-[#8b93a7]/15 flex items-center justify-between bg-slate-50 dark:bg-[#0e121a]/80">
          <div className="text-[11px] text-slate-500">
            ConciliaPyme v2.4 · PYMEs Paraguay · Itaú & ueno bank
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-[#c47046] text-white hover:bg-[#b35e35] transition-colors"
          >
            Cerrar Configuración
          </button>
        </div>
      </div>
    </div>
  );
};
