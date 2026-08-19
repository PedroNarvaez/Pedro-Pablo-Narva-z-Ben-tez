import React from 'react';
import {
  FileSpreadsheet,
  FileText,
  Layers,
  Download,
  Printer,
  Sparkles,
  SearchCheck,
  CodeXml,
  FileCode,
  GraduationCap,
  FileArchive,
  Settings,
  User,
  Users,
  Info,
  Shield,
  Building2,
  ExternalLink,
  Globe,
} from 'lucide-react';
import { CamtFile, UserProfile, AppTheme } from '../types';
import { CompanySwitcher } from './CompanySwitcher';
import { ThemeSwitcher } from './ThemeSwitcher';

interface NavbarProps {
  currentTab: 'visor' | 'informe' | 'conciliar' | 'estandares';
  setCurrentTab: (tab: 'visor' | 'informe' | 'conciliar' | 'estandares') => void;
  activeFile: CamtFile | null;
  user: UserProfile | null;
  selectedCurrency: string;
  currentTheme: AppTheme;
  onThemeChange: (theme: AppTheme) => void;
  onExportCSV: () => void;
  onExportReport: () => void;
  onOpenXmlModal: () => void;
  onOpenValidationModal?: () => void;
  onLoadSample: () => void;
  onDownloadSingleHtml: () => void;
  onOpenThesis: () => void;
  onOpenZipExporter: () => void;
  onOpenSettings: () => void;
  onOpenCompanyManager: () => void;
  onOpenUserManager: () => void;
  onOpenSystemInfo: () => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  activeFile,
  user,
  selectedCurrency,
  currentTheme,
  onThemeChange,
  onExportCSV,
  onExportReport,
  onOpenXmlModal,
  onOpenValidationModal,
  onLoadSample,
  onDownloadSingleHtml,
  onOpenThesis,
  onOpenZipExporter,
  onOpenSettings,
  onOpenCompanyManager,
  onOpenUserManager,
  onOpenSystemInfo,
  onOpenAuth,
}) => {
  return (
    <header className="bg-white/95 dark:bg-[#080808]/95 backdrop-blur-xl border-b border-slate-200 dark:border-[#222733] px-3 sm:px-5 py-2.5 flex items-center justify-between gap-3 shrink-0 z-30 sticky top-0 transition-colors">
      {/* Brand & Blockchain X style Identity */}
      <div className="flex items-center gap-3">
        {/* Hexagon / Web3 Logo */}
        <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-[#146ef5] via-[#4353ff] to-[#00d2ff] text-white font-extrabold text-sm shadow-md shadow-[#146ef5]/25 border border-white/20">
          <span>CP</span>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5 font-sans">
              ConciliaPyme <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-[#146ef5]/10 text-[#146ef5] border border-[#146ef5]/20">ISO 20022</span>
            </span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#161b22] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#30363d]">
              {selectedCurrency}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-[#8b949e] font-medium leading-tight">
            <span>PYMEs Paraguay</span>
            <span>•</span>
            <span className="text-[#146ef5] font-semibold">Itaú & ueno bank</span>
          </div>
        </div>

        {/* Company Switcher */}
        <div className="hidden md:block ml-1">
          <CompanySwitcher onOpenCompanyManager={onOpenCompanyManager} />
        </div>
      </div>

      {/* Pill Capsule Navigation Tabs (Blockchain X Style) */}
      <nav className="hidden lg:flex items-center gap-1 bg-slate-100 dark:bg-[#11141a] p-1 rounded-full border border-slate-200 dark:border-[#222733] shadow-xs">
        <button
          type="button"
          onClick={() => setCurrentTab('visor')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
            currentTab === 'visor'
              ? 'bg-[#146ef5] text-white shadow-sm shadow-[#146ef5]/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-[#1a202c]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Visor CAMT</span>
        </button>

        <button
          type="button"
          onClick={() => setCurrentTab('informe')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
            currentTab === 'informe'
              ? 'bg-[#146ef5] text-white shadow-sm shadow-[#146ef5]/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-[#1a202c]'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Informe Flujo</span>
        </button>

        <button
          type="button"
          onClick={() => setCurrentTab('conciliar')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
            currentTab === 'conciliar'
              ? 'bg-[#146ef5] text-white shadow-sm shadow-[#146ef5]/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-[#1a202c]'
          }`}
        >
          <SearchCheck className="w-3.5 h-3.5" />
          <span>Conciliación</span>
        </button>

        <button
          type="button"
          onClick={() => setCurrentTab('estandares')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
            currentTab === 'estandares'
              ? 'bg-[#146ef5] text-white shadow-sm shadow-[#146ef5]/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-[#1a202c]'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Estándares Int.</span>
        </button>
      </nav>

      {/* Action CTA Toolbar */}
      <div className="flex items-center gap-2">
        {/* Theme Switcher */}
        <ThemeSwitcher
          currentTheme={currentTheme}
          onThemeChange={onThemeChange}
          variant="pill"
        />

        {/* System Info & Editable Improvements */}
        <button
          type="button"
          onClick={onOpenSystemInfo}
          title="Ver y editar Información del Sistema y Registro de Mejoras"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-[#121620] text-slate-700 dark:text-slate-300 hover:text-[#146ef5] hover:border-[#146ef5]/40 border border-slate-200 dark:border-[#222733] transition-all cursor-pointer shadow-xs"
        >
          <Info className="w-3.5 h-3.5 text-[#146ef5]" />
          <span className="hidden xl:inline">Info & Mejoras</span>
        </button>

        {/* Commercial Multi-User Manager */}
        <button
          type="button"
          onClick={onOpenUserManager}
          title="Gestión Comercial de Usuarios, Contraseñas y Licencias para Clientes"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/25 transition-all cursor-pointer shadow-xs"
        >
          <Users className="w-3.5 h-3.5" />
          <span className="hidden xl:inline">Usuarios</span>
        </button>

        {/* Thesis & Academic Hub */}
        <button
          type="button"
          onClick={onOpenThesis}
          title="Ver Memoria Técnica y Documentación de Tesis de Grado en Informática"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#146ef5]/10 text-[#146ef5] hover:bg-[#146ef5]/20 border border-[#146ef5]/25 transition-all cursor-pointer shadow-xs"
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span className="hidden xl:inline">Tesis</span>
        </button>

        {/* ZIP Package Exporter */}
        <button
          type="button"
          onClick={onOpenZipExporter}
          title="Exportar todo el código fuente, backend, Docker y configuración en un archivo .ZIP listo para desplegar"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-[#121620] border border-slate-200 dark:border-[#222733] text-slate-800 dark:text-slate-200 hover:border-[#146ef5]/50 transition-all cursor-pointer shadow-xs"
        >
          <FileArchive className="w-3.5 h-3.5 text-[#146ef5]" />
          <span className="hidden lg:inline">.ZIP</span>
        </button>

        {/* ISO 20022 XSD Audit Button */}
        {activeFile && activeFile.data.validation && onOpenValidationModal && (
          <button
            type="button"
            onClick={onOpenValidationModal}
            title="Abrir Informe de Auditoría y Verificación de Esquema XSD ISO 20022"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer shadow-xs ${
              activeFile.data.validation.errorCount > 0
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                : activeFile.data.validation.warningCount > 0
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Auditoría XSD</span>
            <span className="font-mono text-[10px] bg-white/40 dark:bg-black/40 px-1.5 py-0.2 rounded-full">
              {activeFile.data.validation.conformanceScore}%
            </span>
          </button>
        )}

        {/* XML Viewer button */}
        {activeFile && (
          <button
            type="button"
            onClick={onOpenXmlModal}
            title="Ver código XML original"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-[#121620] border border-slate-200 dark:border-[#222733] text-slate-800 dark:text-slate-200 hover:border-[#146ef5]/50 transition-all cursor-pointer shadow-xs"
          >
            <CodeXml className="w-3.5 h-3.5 text-[#146ef5]" />
            <span className="hidden sm:inline">XML</span>
          </button>
        )}

        {/* Settings button */}
        <button
          type="button"
          onClick={onOpenSettings}
          title="Configuración general, Google Analytics, Storage y Paraguay"
          className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#181e2e] rounded-lg transition-colors border border-slate-200 dark:border-[#222733]"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* User Auth Profile */}
        <button
          type="button"
          onClick={onOpenAuth}
          title={user ? `Sesión Activa: ${user.name} (${user.username}) - ${user.role}` : 'Autenticación'}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
            user
              ? 'bg-slate-100 dark:bg-[#121620] border-[#146ef5]/40 text-slate-900 dark:text-white'
              : 'bg-slate-50 dark:bg-[#080808] border-slate-200 dark:border-[#222733] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          {user ? (
            <>
              <img
                src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                alt={user.name}
                className="w-5 h-5 rounded-full object-cover border border-[#146ef5]/40"
              />
              <span className="max-w-[70px] sm:max-w-[90px] truncate hidden md:inline text-[11px] font-semibold">
                {user.username}
              </span>
            </>
          ) : (
            <>
              <User className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span className="hidden sm:inline text-[11px]">Acceder</span>
            </>
          )}
        </button>

        {activeFile && (
          <button
            type="button"
            onClick={onExportCSV}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#146ef5] text-white hover:bg-[#0f55d9] transition-all shadow-sm shadow-[#146ef5]/25 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">CSV</span>
          </button>
        )}
      </div>
    </header>
  );
};
